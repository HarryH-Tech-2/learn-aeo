"use client";

/**
 * The explorer: a rapier capsule driven by velocity (not forces), with the
 * usual platformer kindnesses: coyote time, jump buffering, variable jump
 * height and a double jump. The character is built from primitives and
 * animated procedurally (run cycle, lean, squash and stretch).
 *
 * The follow camera is moved from here too, since it tracks the player.
 * Places on foot other than the causeway (the tomb, the market) reuse this
 * with their own `spawn`; `enclosed` pulls the camera in front of walls.
 */
import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { CapsuleCollider, RigidBody, useRapier, type RapierRigidBody } from "@react-three/rapier";
import * as THREE from "three";
import { CHECKPOINTS, FALL_Y, START, WATER_Y, type Vec3 } from "./course";
import { game, input, journey, moverVelocity, playerPos, playerVel } from "./store";
import { sfx } from "./audio";
import { burst } from "./Particles";
import { Explorer } from "./Avatar";

const HALF_HEIGHT = 0.25;
const RADIUS = 0.3;
const FOOT = HALF_HEIGHT + RADIUS;
const SPEED = 6.4;
const JUMP = 9.8;
const JUMP_2 = 8.8;
const COYOTE = 0.11;
const BUFFER = 0.13;

const RAY_OFFSETS: [number, number][] = [
  [0, 0],
  [RADIUS * 0.8, 0],
  [-RADIUS * 0.8, 0],
  [0, RADIUS * 0.8],
  [0, -RADIUS * 0.8],
];

/** Drag with the mouse to look around; the camera eases back behind the run on its own. */
function useCameraDrag(yaw: React.MutableRefObject<number>, pitch: React.MutableRefObject<number>) {
  const gl = useThree((s) => s.gl);
  useEffect(() => {
    const el = gl.domElement;
    let dragging = false;
    const down = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      dragging = true;
    };
    const move = (e: PointerEvent) => {
      if (!dragging) return;
      yaw.current -= e.movementX * 0.005;
      pitch.current = THREE.MathUtils.clamp(pitch.current + e.movementY * 0.003, -0.15, 0.7);
    };
    const upH = () => (dragging = false);
    el.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", upH);
    return () => {
      el.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", upH);
    };
  }, [gl, yaw, pitch]);
}

export default function Player({
  spawn = START,
  enclosed = false,
  distance = 7.4,
  speed: topSpeed = SPEED,
  canJump = true,
}: {
  /** where a run starts, and where a fall puts you back when there are no checkpoints */
  spawn?: Vec3;
  /** indoors: keep the camera on this side of the walls */
  enclosed?: boolean;
  distance?: number;
  speed?: number;
  canJump?: boolean;
}) {
  const body = useRef<RapierRigidBody>(null);
  const { world, rapier } = useRapier();
  const camera = useThree((s) => s.camera);

  // character rig
  const rig = useRef<THREE.Group>(null);
  const squash = useRef<THREE.Group>(null);
  const torso = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const legL = useRef<THREE.Group>(null);
  const legR = useRef<THREE.Group>(null);
  const armL = useRef<THREE.Group>(null);
  const armR = useRef<THREE.Group>(null);

  const s = useRef({
    hv: new THREE.Vector3(),
    grounded: false,
    sinceGround: 1,
    sinceJump: 1,
    jumps: 0,
    cut: false,
    facing: Math.PI,
    stride: 0,
    squashV: 0,
    squash: 1,
    lastRun: -1,
    fallVy: 0,
    safe: new THREE.Vector3(spawn[0], spawn[1], spawn[2]),
    /** frames left with CCD off after a teleport (see respawn) */
    noCcd: 0,
  });
  const camYaw = useRef(0);
  const camPitch = useRef(0.24);
  const lookAt = useMemo(() => new THREE.Vector3(0, 2, -6), []);
  const tmp = useMemo(() => ({ want: new THREE.Vector3(), plat: new THREE.Vector3(), ideal: new THREE.Vector3(), target: new THREE.Vector3(), feet: new THREE.Vector3() }), []);

  useCameraDrag(camYaw, camPitch);

  // dev aid (this whole page is dev only): __causeway.go(x, y, z, yaw?) drops the player anywhere on the course;
  // __causeway.info() is what the last frame cost (draw calls and triangles, all passes together)
  const renderer = useThree((st) => st.gl);
  const scene = useThree((st) => st.scene);
  useEffect(() => {
    const w = window as unknown as { __causeway?: Record<string, unknown> };
    const aid = (w.__causeway ??= {});
    aid.go = (x: number, y: number, z: number, yaw = 0) => {
      body.current?.setTranslation({ x, y, z }, true);
      body.current?.setLinvel({ x: 0, y: 0, z: 0 }, true);
      camYaw.current = yaw;
    };
    // (level 1 is on the live site as Lesson 1: the rest is for the dev build only)
    if (process.env.NODE_ENV !== "production") aid.scene = scene;
    aid.info = async () => {
      // counted over 20 frames, since the counters otherwise reset at every pass and only show the last one
      const FRAMES = 20;
      renderer.info.autoReset = false;
      renderer.info.reset();
      for (let i = 0; i < FRAMES; i++) await new Promise((r) => requestAnimationFrame(r));
      const { calls, triangles } = renderer.info.render;
      renderer.info.autoReset = true;
      return { calls: Math.round(calls / FRAMES), triangles: Math.round(triangles / FRAMES), ...renderer.info.memory };
    };
    return () => {
      delete aid.go;
      delete aid.info;
      delete aid.scene;
    };
  }, [renderer, scene]);

  const respawn = (at: [number, number, number]) => {
    const b = body.current;
    if (!b) return;
    // (with CCD on, Rapier sweeps a teleport like a very fast move: a path through a slab ends
    // pushed out of the slab's near face and into the river, over and over. Off for the jump.)
    b.enableCcd(false);
    s.current.noCcd = 2;
    b.setTranslation({ x: at[0], y: at[1], z: at[2] }, true);
    b.setLinvel({ x: 0, y: 0, z: 0 }, true);
    s.current.hv.set(0, 0, 0);
    s.current.jumps = 0;
    s.current.facing = Math.PI;
  };

  useFrame((state, dtRaw) => {
    const b = body.current;
    if (!b) return;
    const dt = Math.min(dtRaw, 1 / 30);
    // the camera eases on real time, so a slow frame never leaves it behind
    const cdt = Math.min(dtRaw, 0.25);
    const st = s.current;
    const g = game.get();
    if (st.noCcd > 0 && --st.noCcd === 0) b.enableCcd(true);

    // a new run starts at the start
    if (g.run !== st.lastRun) {
      st.lastRun = g.run;
      respawn(spawn);
      camYaw.current = 0;
      camPitch.current = 0.24;
      st.safe.set(spawn[0], spawn[1], spawn[2]);
      journey.run = g.run;
      journey.furthestZ = spawn[2];
      journey.carryTo = null;
    }

    // Khety carries the learner to the next landing (the HUD asked, journey.ts): a fresh place to fall back to
    if (journey.carryTo) {
      const at = journey.carryTo;
      journey.carryTo = null;
      respawn(at);
      st.safe.set(at[0], at[1], at[2]);
      camYaw.current = 0;
    }

    const pos = b.translation();
    const vel = b.linvel();
    playerPos.set(pos.x, pos.y, pos.z);
    playerVel.set(vel.x, vel.y, vel.z);
    const playing = g.status === "playing";
    // (reading a new sign's card: gravity still works, the legs do not)
    const free = playing && !g.hold;

    // ── ground: five short rays under the capsule, so ledges still count ──
    let grounded = false;
    tmp.plat.set(0, 0, 0);
    st.sinceJump += dt;
    // (not straight after a jump, or the rays would still see the floor being left)
    if (st.sinceJump > 0.12) {
      for (const [ox, oz] of RAY_OFFSETS) {
        const ray = new rapier.Ray({ x: pos.x + ox, y: pos.y, z: pos.z + oz }, { x: 0, y: -1, z: 0 });
        const hit = world.castRay(ray, FOOT + 0.14, true, undefined, undefined, undefined, b);
        if (hit) {
          grounded = true;
          const parent = hit.collider.parent();
          const mv = parent ? moverVelocity.get(parent.handle) : undefined;
          if (mv) tmp.plat.copy(mv);
          // solid, unmoving stone under the middle of the feet: a place worth coming back to
          else if (ox === 0 && oz === 0) {
            st.safe.set(pos.x, pos.y + 0.4, pos.z);
            // new ground: the way to the gate grows, and the falls that led here stop counting towards a carry
            if (pos.z < journey.furthestZ - 1) {
              journey.furthestZ = pos.z;
              if (g.stuck > 0) game.set({ stuck: 0 });
            }
          }
          break;
        }
      }
    }
    if (grounded && !st.grounded) {
      // landed
      const impact = Math.min(1, Math.abs(st.fallVy) / 16);
      st.squashV = -3.2 * (0.4 + impact);
      if (impact > 0.25) {
        sfx.land();
        burst(tmp.feet.set(pos.x, pos.y - FOOT + 0.05, pos.z), 7, [0.95, 0.78, 0.55], 2.2, { up: 1.2, size: 0.12, life: 0.5, gravity: -2 });
      }
    }
    if (!grounded) st.fallVy = vel.y;
    st.grounded = grounded;
    st.sinceGround = grounded ? 0 : st.sinceGround + dt;
    if (grounded) {
      st.jumps = 0;
      st.cut = false;
    }

    // ── steering, relative to the camera ──
    const ix = free ? input.x : 0;
    const iy = free ? input.y : 0;
    const yaw = camYaw.current;
    tmp.want.set(ix * Math.cos(yaw) - iy * Math.sin(yaw), 0, -ix * Math.sin(yaw) - iy * Math.cos(yaw));
    if (tmp.want.lengthSq() > 1) tmp.want.normalize();
    tmp.want.multiplyScalar(topSpeed);
    const accel = grounded ? 58 : 24;
    const dvx = tmp.want.x - st.hv.x;
    const dvz = tmp.want.z - st.hv.z;
    const dv = Math.hypot(dvx, dvz);
    if (dv > 0) {
      const step = Math.min(dv, accel * dt);
      st.hv.x += (dvx / dv) * step;
      st.hv.z += (dvz / dv) * step;
    }

    // ── jumping ──
    let vy = vel.y;
    const wantsJump = free && canJump && performance.now() - input.jumpPressedAt < BUFFER * 1000;
    if (wantsJump) {
      if (st.sinceGround < COYOTE && st.jumps === 0) {
        vy = JUMP + Math.max(0, tmp.plat.y);
        st.jumps = 1;
        st.sinceGround = 1;
        st.sinceJump = 0;
        st.cut = false;
        st.squashV = 3.4;
        input.jumpPressedAt = -1;
        sfx.jump();
        burst(tmp.feet.set(pos.x, pos.y - FOOT + 0.05, pos.z), 5, [0.95, 0.78, 0.55], 1.8, { up: 0.8, size: 0.1, life: 0.4, gravity: -2 });
      } else if (st.jumps < 2 && !grounded) {
        vy = JUMP_2;
        st.jumps = 2;
        st.cut = false;
        st.squashV = 3;
        input.jumpPressedAt = -1;
        sfx.doubleJump();
        burst(tmp.feet.set(pos.x, pos.y - FOOT, pos.z), 9, [0.5, 2.4, 2.2], 2.4, { up: -0.5, size: 0.07, life: 0.45, gravity: 0 });
      }
    }
    // let go early, jump lower
    if (!input.jumpHeld && vy > 2.5 && !st.cut && st.jumps > 0) {
      vy *= 0.55;
      st.cut = true;
    }
    // ride a moving slab down without chattering against it
    if (grounded && st.jumps === 0 && tmp.plat.y < -0.01 && vy <= 0.2) vy = tmp.plat.y - 0.6;

    b.setLinvel({ x: st.hv.x + tmp.plat.x, y: vy, z: st.hv.z + tmp.plat.z }, true);

    // ── into the river ──
    if (pos.y < FALL_Y && playing) {
      sfx.splash();
      burst(tmp.feet.set(pos.x, WATER_Y + 0.1, pos.z), 30, [0.75, 0.95, 1.0], 4.5, { up: 6, size: 0.13, life: 0.9, gravity: -12 });
      game.set({ falls: g.falls + 1, stuck: g.stuck + 1 });
      const cp = g.checkpoint > 0 ? CHECKPOINTS[g.checkpoint - 1].spawn : spawn;
      // (the causeway is the first level anyone plays: a fall there never costs ground, gentle mode or not)
      const forgiving = g.campaign.gentle || g.lesson?.spec.layout === "causeway";
      respawn(forgiving ? [st.safe.x, st.safe.y, st.safe.z] : cp);
    }

    // ── character animation ──
    const speed = st.hv.length();
    if (speed > 0.4) st.facing = Math.atan2(st.hv.x, st.hv.z);
    if (rig.current) {
      const cur = rig.current.rotation.y;
      let delta = st.facing - cur;
      delta = Math.atan2(Math.sin(delta), Math.cos(delta));
      rig.current.rotation.y = cur + delta * Math.min(1, dt * 14);
    }
    // spring for squash and stretch
    st.squashV += (1 - st.squash) * 180 * dt;
    st.squashV *= Math.exp(-14 * dt);
    st.squash = THREE.MathUtils.clamp(st.squash + st.squashV * dt, 0.6, 1.4);
    if (squash.current) {
      const k = st.squash;
      squash.current.scale.set(1 / Math.sqrt(k), k, 1 / Math.sqrt(k));
    }
    st.stride += speed * dt * 2.6;
    const run = Math.min(1, speed / topSpeed);
    const swing = Math.sin(st.stride) * 0.95 * run;
    const air = grounded ? 0 : 1;
    if (legL.current && legR.current && armL.current && armR.current) {
      legL.current.rotation.x = THREE.MathUtils.lerp(swing, -0.5, air);
      legR.current.rotation.x = THREE.MathUtils.lerp(-swing, 0.35, air);
      armL.current.rotation.x = THREE.MathUtils.lerp(-swing * 0.9, -2.4, air * (vy > 0 ? 1 : 0.5));
      armR.current.rotation.x = THREE.MathUtils.lerp(swing * 0.9, -2.4, air * (vy > 0 ? 1 : 0.5));
      armL.current.rotation.z = 0.18 + air * 0.35;
      armR.current.rotation.z = -0.18 - air * 0.35;
    }
    if (torso.current) {
      torso.current.rotation.x = run * 0.22 + air * THREE.MathUtils.clamp(-vy * 0.02, -0.25, 0.25);
      torso.current.position.y = Math.abs(Math.sin(st.stride)) * 0.05 * run + (grounded && run < 0.05 ? Math.sin(state.clock.elapsedTime * 2.2) * 0.012 : 0);
    }
    if (head.current) head.current.rotation.x = -run * 0.12;

    // ── camera ──
    if (g.status === "title") {
      const t = state.clock.elapsedTime;
      tmp.ideal.set(9.5 + Math.sin(t * 0.13) * 2.5, 4.6 + Math.sin(t * 0.21) * 0.6, 12.5 + Math.cos(t * 0.13) * 1.5);
      tmp.target.set(-0.5, 2.6, -14);
      camera.position.lerp(tmp.ideal, 1 - Math.exp(-1.5 * cdt));
      lookAt.lerp(tmp.target, 1 - Math.exp(-2 * cdt));
    } else {
      // when running, ease the view back behind the direction of travel
      if (speed > 2 && !input.jumpHeld) {
        const behind = Math.atan2(-st.hv.x, -st.hv.z);
        let d = behind - camYaw.current;
        d = Math.atan2(Math.sin(d), Math.cos(d));
        if (Math.abs(d) < 2.2) camYaw.current += d * Math.min(1, dt * 0.55);
      }
      let dist = distance;
      const pitch = camPitch.current;
      tmp.target.set(pos.x, pos.y + 1.15, pos.z);
      if (enclosed) {
        // a ray from the head to where the camera wants to be: stop short of whatever it meets
        tmp.ideal.set(Math.sin(camYaw.current) * Math.cos(pitch), Math.sin(pitch) + 0.06, Math.cos(camYaw.current) * Math.cos(pitch)).normalize();
        const ray = new rapier.Ray({ x: tmp.target.x, y: tmp.target.y, z: tmp.target.z }, { x: tmp.ideal.x, y: tmp.ideal.y, z: tmp.ideal.z });
        const hit = world.castRay(ray, distance + 0.4, true, undefined, undefined, undefined, b);
        if (hit) dist = Math.max(1.2, Math.min(distance, hit.timeOfImpact - 0.4));
      }
      tmp.ideal.set(pos.x + Math.sin(camYaw.current) * dist * Math.cos(pitch), pos.y + 1.6 + Math.sin(pitch) * dist, pos.z + Math.cos(camYaw.current) * dist * Math.cos(pitch));
      camera.position.lerp(tmp.ideal, 1 - Math.exp(-(enclosed ? 10 : 6) * cdt));
      lookAt.lerp(tmp.target, 1 - Math.exp(-10 * cdt));
    }
    camera.lookAt(lookAt);
  });

  return (
    <RigidBody ref={body} colliders={false} position={spawn} enabledRotations={[false, false, false]} linearDamping={0} friction={0} ccd canSleep={false}>
      <CapsuleCollider args={[HALF_HEIGHT, RADIUS]} friction={0} restitution={0} />
      <group ref={rig} position={[0, -FOOT, 0]} rotation={[0, Math.PI, 0]}>
        <group ref={squash}>
          <Explorer torso={torso} head={head} legL={legL} legR={legR} armL={armL} armR={armR} />
        </group>
      </group>
    </RigidBody>
  );
}

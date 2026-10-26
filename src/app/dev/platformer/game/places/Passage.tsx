"use client";

/**
 * The collapsing passage: the review level, fast, about ninety seconds. The
 * explorer runs down a torch-lit corridor on their own while the roof comes
 * down behind; every thirty-odd metres a cross wall has two doors, and the
 * learner only picks a side. Old signs and the new words take turns: for an
 * old sign the wall shows the SIGN and the doors carry sounds; for the word in
 * hand the wall names the SOUND and the doors carry signs. A wrong door does
 * not open: the runner bounces off it, loses ground to the collapse, and is
 * let through the other one (with two doors the answer is known by then, so
 * it is not asked again). A new sign is met first in a quiet stretch under a
 * shaft of light that spans the passage, where the run drops to a walk.
 */
import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { signInfo } from "../lesson";
import { game, input, playerPos, useGame, type Lesson } from "../store";
import { answer, answerReview, closeTeach, complete, finished, teach } from "../answers";
import { sfx } from "../audio";
import { say } from "../voice";
import { burst } from "../Particles";
import { Indoors } from "../Light";
import { Walker, type Pose } from "../Avatar";
import { Plaque, drawLabel, useCanvasTexture, useFace } from "../kit";
import { worldBox, type GameTextures } from "../textures";

const HALF = 4;
const HEIGHT = 6;
const LANES: readonly number[] = [-2, 2];
const DOOR_W = 2.8;
const DOOR_H = 3.9;
const GAP = 34;
const FIRST = -38;
/** a new sign's quiet stretch starts this far before its wall */
const TEACH_AT = 26;
/** the side is settled this far before a wall, so a right door can open just in time */
const DECIDE = 4.6;
/** how far behind the runner the roof keeps, when nothing has gone wrong */
const LEAD = 14;
const BLOCKS = 36;

type Side = 0 | 1;

type Wall = {
  z: number;
  kind: "ask" | "review";
  /** the station, or the review, this wall asks */
  index: number;
  /** what each door carries, left then right; null is a side that is walled up */
  sides: [string | null, string | null];
  right: Side;
  /** the doors carry signs (otherwise sounds) */
  glyph: boolean;
  /** the sign that must be met in the quiet stretch before this wall */
  teach: string | null;
};

/** What happens to a wall as the runner meets it; read every frame by the meshes, never by React. */
type WallState = { opening: [boolean, boolean]; open: [number, number]; flash: [number, number]; decided: boolean; called: boolean };

/** Two doors: the right answer, and one wrong one (for a sign, the word's own next sign if it is on offer: the order trap). */
function doorsFor(lesson: Lesson, index: number): { right: string; wrong: string | null; glyph: boolean } {
  const st = lesson.stations[index];
  if (st.kind === "read") {
    const right = signInfo(st.target).sound;
    return { right, wrong: st.options.find((o) => o !== right) ?? null, glyph: false };
  }
  const others = st.options.filter((o) => o !== st.target);
  const next = lesson.stations.slice(index + 1).find((s) => s.phrase === st.phrase && s.kind === "sign" && others.includes(s.target))?.target;
  return { right: st.target, wrong: next ?? others[0] ?? null, glyph: true };
}

function layOut(lesson: Lesson): { walls: Wall[]; exitZ: number } {
  const walls: Wall[] = [];
  let z = FIRST;
  const push = (kind: Wall["kind"], index: number, right: string, wrong: string | null, glyph: boolean, teachSign: string | null) => {
    const side: Side = Math.random() < 0.5 ? 0 : 1;
    const sides: [string | null, string | null] = side === 0 ? [right, wrong] : [wrong, right];
    walls.push({ z, kind, index, sides, right: side, glyph, teach: teachSign });
    z -= GAP;
  };
  // old signs and the word in hand take turns, until both lists are used up
  let s = 0;
  let r = 0;
  while (s < lesson.stations.length || r < lesson.reviews.length) {
    if (r < lesson.reviews.length) {
      const review = lesson.reviews[r];
      push("review", r, review.sound, review.options.find((o) => o !== review.sound) ?? null, review.kind === "det", null);
      r += 1;
    }
    if (s < lesson.stations.length) {
      const d = doorsFor(lesson, s);
      push("ask", s, d.right, d.wrong, d.glyph, lesson.stations[s].teach ? lesson.stations[s].target : null);
      s += 1;
    }
  }
  return { walls, exitZ: z - 4 };
}

// ─── one cross wall and its two doors ───

function DoorSlab({ label, glyph, x, side, state, tint, tex }: { label: string; glyph: boolean; x: number; side: Side; state: WallState; tint: string; tex: GameTextures }) {
  const slab = useRef<THREE.Group>(null);
  const mat = useRef<THREE.MeshStandardMaterial>(null);
  const face = useFace(label, glyph, { tint });
  useFrame(({ clock }, dtRaw) => {
    const dt = Math.min(dtRaw, 1 / 20);
    if (state.opening[side]) state.open[side] = Math.min(1, state.open[side] + dt / 0.32);
    state.flash[side] = Math.max(0, state.flash[side] - dt * 1.2);
    const f = state.flash[side];
    const e = state.open[side];
    if (slab.current) {
      // a right door slides up into the lintel; a wrong one only shudders
      slab.current.position.set(x + (f > 0.4 ? Math.sin(clock.elapsedTime * 70) * 0.05 * f : 0), 1.9 + e * e * (3 - 2 * e) * (DOOR_H + 0.2), 0.2);
    }
    if (mat.current) mat.current.emissive.setRGB(1 + f * 1.6, 1 - f * 0.75, 1 - f * 0.8);
  });
  return (
    <group ref={slab} position={[x, 1.9, 0.2]}>
      <mesh>
        <boxGeometry args={[2.6, 3.4, 0.25]} />
        <meshStandardMaterial map={tex.limestone.map} roughness={0.85} color="#e9d3a2" />
      </mesh>
      {/* the face glows a little and ignores the murk: it has to be read from a wall away */}
      <mesh position={[0, 0, 0.13]}>
        <planeGeometry args={[2.5, 3.3]} />
        <meshStandardMaterial ref={mat} map={face} emissiveMap={face} emissive="#ffffff" emissiveIntensity={0.55} roughness={0.8} fog={false} />
      </mesh>
    </group>
  );
}

function DoorWall({ wall, state, tex }: { wall: Wall; state: WallState; tex: GameTextures }) {
  const lesson = useGame().lesson;
  const geo = useMemo(
    () => ({
      pier: worldBox(0.6, DOOR_H, 1.2, 4),
      middle: worldBox(1.2, DOOR_H, 1.2, 4),
      lintel: worldBox(HALF * 2, HEIGHT - DOOR_H, 1.2, 4),
      fill: worldBox(DOOR_W, DOOR_H, 0.8, 4),
    }),
    [],
  );
  if (!lesson) return null;
  const review = wall.kind === "review" ? lesson.reviews[wall.index] : null;
  const station = wall.kind === "ask" ? lesson.stations[wall.index] : null;
  const phrase = station ? lesson.phrases[station.phrase] : null;
  const done = wall.kind === "ask" ? lesson.progress > wall.index : lesson.reviewed[wall.index] !== null;
  const active = wall.kind === "ask" ? lesson.progress === wall.index : !done;
  const question = review
    ? review.kind === "det"
      ? { label: `“${review.word?.meaning ?? ""}”`, glyph: false, caption: "the silent picture for" }
      : { label: review.sign, glyph: true, caption: "an old sign · what sound is" }
    : station!.kind === "sign"
      ? { label: station!.sound, glyph: false, caption: "which sign writes" }
      : station!.kind === "read"
        ? { label: station!.target, glyph: true, caption: "what sound is" }
        : { label: `“${phrase!.meaning.split(",")[0]}”`, glyph: false, caption: "the silent picture for" };
  const stone = <meshStandardMaterial map={tex.sandstone.map} normalMap={tex.sandstone.normalMap} roughness={0.9} />;

  return (
    <group position={[0, 0, wall.z]}>
      <mesh geometry={geo.pier} position={[-HALF + 0.3, DOOR_H / 2, 0]}>
        {stone}
      </mesh>
      <mesh geometry={geo.pier} position={[HALF - 0.3, DOOR_H / 2, 0]}>
        {stone}
      </mesh>
      <mesh geometry={geo.middle} position={[0, DOOR_H / 2, 0]}>
        {stone}
      </mesh>
      <mesh geometry={geo.lintel} position={[0, DOOR_H + (HEIGHT - DOOR_H) / 2, 0]}>
        <meshStandardMaterial map={tex.limestone.map} normalMap={tex.limestone.normalMap} roughness={0.85} color="#f2e2be" />
      </mesh>
      <mesh position={[0, DOOR_H - 0.06, 0.62]}>
        <boxGeometry args={[HALF * 2, 0.12, 0.06]} />
        <meshStandardMaterial color="#d9a935" metalness={1} roughness={0.3} />
      </mesh>
      {wall.sides.map((option, i) =>
        option === null ? (
          // no second choice: this side is walled up
          <mesh key={i} geometry={geo.fill} position={[LANES[i], DOOR_H / 2, 0]}>
            <meshStandardMaterial map={tex.sandstone.map} normalMap={tex.sandstone.normalMap} roughness={0.95} color="#b89f78" />
          </mesh>
        ) : (
          <DoorSlab key={i} label={option} glyph={wall.glyph} x={LANES[i]} side={i as Side} state={state} tint={review ? "#cfe3df" : "#ead9b4"} tex={tex} />
        ),
      )}
      {!done && <Plaque {...question} lit={active} position={[0, 4.95, 0.64]} scale={2.0} hideNear={false} />}
    </group>
  );
}

/** The quiet stretch where a new sign is met: light falls through the roof from wall to wall, and the sign hangs in it. */
function LightShaft({ z, symbol }: { z: number; symbol: string }) {
  const veils = useRef<(THREE.MeshBasicMaterial | null)[]>([]);
  const sign = useRef<THREE.Mesh>(null);
  const face = useCanvasTexture(
    256,
    256,
    (ctx) => {
      ctx.clearRect(0, 0, 256, 256);
      drawLabel(ctx, symbol, true, 128, 136, 200, "#ffe08a");
    },
    [symbol],
    symbol,
  );
  useFrame(({ clock }) => {
    const met = !!game.get().lesson?.taught.includes(symbol);
    const t = clock.elapsedTime;
    veils.current.forEach((m, i) => {
      if (m) m.opacity = (met ? 0.05 : 0.2) + Math.sin(t * 2.4 + i) * (met ? 0.01 : 0.05);
    });
    if (sign.current) {
      sign.current.position.y = 3.0 + Math.sin(t * 1.5) * 0.1;
      sign.current.visible = !met || playerPos.z > z - 9;
    }
  });
  return (
    <group position={[0, 0, z]}>
      {[0, -3.5, -7].map((dz, i) => (
        <mesh key={dz} position={[0, HEIGHT / 2, dz]}>
          <planeGeometry args={[HALF * 2, HEIGHT]} />
          <meshBasicMaterial
            ref={(m) => {
              veils.current[i] = m;
            }}
            color={[1.6, 1.25, 0.5]}
            transparent
            opacity={0.2}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            side={THREE.DoubleSide}
            toneMapped={false}
          />
        </mesh>
      ))}
      <mesh ref={sign} position={[0, 3.0, -9]}>
        <planeGeometry args={[2.6, 2.6]} />
        <meshBasicMaterial map={face} transparent depthWrite={false} toneMapped={false} fog={false} color={[1.5, 1.5, 1.5]} />
      </mesh>
      <mesh position={[0, 0.03, -3.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[HALF * 2, 8]} />
        <meshBasicMaterial color={[1.3, 0.95, 0.35]} transparent opacity={0.16} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
      <Sparkles count={40} scale={[HALF * 2 - 1, HEIGHT - 1, 8]} position={[0, HEIGHT / 2, -3.5]} size={5} speed={0.7} color="#ffe2a0" />
    </group>
  );
}

// ─── the passage itself ───

function Corridor({ from, to, tex }: { from: number; to: number; tex: GameTextures }) {
  const length = from - to;
  const mid = (from + to) / 2;
  const geo = useMemo(
    () => ({
      floor: worldBox(HALF * 2, 0.4, length, 3),
      roof: worldBox(HALF * 2, 0.5, length, 4),
      side: worldBox(0.6, HEIGHT, length, HEIGHT),
      band: worldBox(0.7, 0.7, length, 5.6, 0.7),
    }),
    [length],
  );
  return (
    <group position={[0, 0, mid]}>
      <mesh geometry={geo.floor} position={[0, -0.2, 0]}>
        <meshStandardMaterial map={tex.limestone.map} normalMap={tex.limestone.normalMap} roughness={0.85} color="#d8c7a2" />
      </mesh>
      <mesh geometry={geo.roof} position={[0, HEIGHT + 0.25, 0]}>
        <meshStandardMaterial map={tex.sandstone.map} normalMap={tex.sandstone.normalMap} roughness={0.95} color="#a88e66" />
      </mesh>
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh geometry={geo.side} position={[s * (HALF + 0.3), HEIGHT / 2, 0]}>
            <meshStandardMaterial map={tex.relief.map} normalMap={tex.relief.normalMap} roughness={0.85} color="#f0d8a8" normalScale={new THREE.Vector2(1.4, 1.4)} />
          </mesh>
          <mesh geometry={geo.band} position={[s * (HALF + 0.05), HEIGHT - 0.6, 0]}>
            <meshStandardMaterial map={tex.band.map} normalMap={tex.band.normalMap} roughness={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** Torches down both walls, alternating: the flames only glow (the lights that matter travel with the runner). */
function Torches({ from, to }: { from: number; to: number }) {
  const flames = useRef<THREE.InstancedMesh>(null);
  const stems = useRef<THREE.InstancedMesh>(null);
  const flameMat = useRef<THREE.MeshBasicMaterial>(null);
  const spots = useMemo(() => {
    const out: [number, number][] = [];
    let side = 1;
    for (let z = from - 9; z > to; z -= 17) {
      out.push([side * (HALF - 0.25), z]);
      side = -side;
    }
    return out;
  }, [from, to]);
  useEffect(() => {
    const d = new THREE.Object3D();
    spots.forEach(([x, z], i) => {
      d.position.set(x, 3.05, z);
      d.rotation.set(0, 0, x > 0 ? 0.35 : -0.35);
      d.updateMatrix();
      stems.current?.setMatrixAt(i, d.matrix);
      d.position.set(x + (x > 0 ? -0.16 : 0.16), 3.72, z);
      d.rotation.set(0, 0, 0);
      d.updateMatrix();
      flames.current?.setMatrixAt(i, d.matrix);
    });
    if (stems.current) stems.current.instanceMatrix.needsUpdate = true;
    if (flames.current) flames.current.instanceMatrix.needsUpdate = true;
  }, [spots]);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime * 9;
    const f = 0.85 + Math.sin(t) * 0.08 + Math.sin(t * 2.3 + 1) * 0.06;
    if (flameMat.current) flameMat.current.color.setRGB(5.5 * f, 1.7 * f, 0.3 * f);
  });
  return (
    <>
      <instancedMesh ref={stems} args={[undefined, undefined, spots.length]} frustumCulled={false}>
        <cylinderGeometry args={[0.05, 0.08, 0.9, 8]} />
        <meshStandardMaterial color="#3a2a1c" metalness={0.7} roughness={0.5} />
      </instancedMesh>
      <instancedMesh ref={flames} args={[undefined, undefined, spots.length]} frustumCulled={false}>
        <coneGeometry args={[0.17, 0.6, 8]} />
        <meshBasicMaterial ref={flameMat} color={[5.5, 1.7, 0.3]} transparent opacity={0.85} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </instancedMesh>
    </>
  );
}

/** The way out: a doorway full of daylight at the end of the passage. */
function Daylit({ z, tex }: { z: number; tex: GameTextures }) {
  const geo = useMemo(() => ({ pier: worldBox(HALF - 1.8, HEIGHT, 1.4, 4), lintel: worldBox(3.6, HEIGHT - 4.6, 1.4, 4) }), []);
  return (
    <group position={[0, 0, z]}>
      {[-1, 1].map((s) => (
        <mesh key={s} geometry={geo.pier} position={[s * (1.8 + (HALF - 1.8) / 2), HEIGHT / 2, 0]}>
          <meshStandardMaterial map={tex.sandstone.map} normalMap={tex.sandstone.normalMap} roughness={0.9} />
        </mesh>
      ))}
      <mesh geometry={geo.lintel} position={[0, 4.6 + (HEIGHT - 4.6) / 2, 0]}>
        <meshStandardMaterial map={tex.limestone.map} roughness={0.85} color="#f2e2be" />
      </mesh>
      <mesh position={[0, HEIGHT / 2, -1.2]}>
        <planeGeometry args={[HALF * 2, HEIGHT]} />
        <meshBasicMaterial color={[4.2, 3.5, 2.4]} toneMapped={false} fog={false} />
      </mesh>
      <Sparkles count={60} scale={[4, 5, 8]} position={[0, 2.6, 4]} size={7} speed={0.6} color="#fff0c8" opacity={0.9} />
    </group>
  );
}

// ─── the roof coming down ───

type Block = { alive: boolean; landed: boolean; x: number; y: number; z: number; vy: number; size: number; rx: number; rz: number; spin: number };

// ─── the run ───

export default function Passage({ tex }: { tex: GameTextures }) {
  const g = useGame();
  const lesson = g.lesson;
  const camera = useThree((s) => s.camera);
  const plan = useMemo(() => (lesson ? layOut(lesson) : { walls: [], exitZ: FIRST }), [lesson?.stations, lesson?.reviews]); // eslint-disable-line react-hooks/exhaustive-deps
  const states = useMemo<WallState[]>(() => plan.walls.map(() => ({ opening: [false, false], open: [0, 0], flash: [0, 0], decided: false, called: false })), [plan]);
  const pose = useRef<Pose>({ x: 0, y: 0, z: 0, facing: Math.PI, speed: 0 });
  const s = useRef({ next: 0, side: -1 as -1 | Side, forced: false, speed: 0, back: 0, quiet: 0, teaching: "", shake: 0, front: LEAD + 4, lead: LEAD, rumble: 1.5, dust: 0, drop: 0, cursor: 0, nag: 0, warned: false });
  const blocks = useMemo<Block[]>(() => Array.from({ length: BLOCKS }, () => ({ alive: false, landed: false, x: 0, y: -10, z: 0, vy: 0, size: 0.5, rx: 0, rz: 0, spin: 0 })), []);
  const rubble = useRef<THREE.InstancedMesh>(null);
  const lamp = useRef<THREE.PointLight>(null);
  const doorLight = useRef<THREE.PointLight>(null);
  const shaftLight = useRef<THREE.PointLight>(null);
  const dustRef = useRef<THREE.Group>(null);
  const v = useMemo(() => ({ tmp: new THREE.Vector3(), base: new THREE.Vector3(0, 3.1, 7.5), look: new THREE.Vector3(0, 2.1, -12), dummy: new THREE.Object3D() }), []);

  useEffect(() => {
    camera.position.set(0, 3.1, 7.5);
  }, [camera]);

  // dev aid for headless checks: steer for the right door of the next wall
  useEffect(() => {
    const w = window as unknown as { __causeway?: Record<string, unknown> };
    const aid = (w.__causeway ??= {});
    aid.place = {
      auto: (): string => {
        const wall = plan.walls[s.current.next];
        if (!wall) {
          input.x = 0;
          return "no wall left: the way out is ahead";
        }
        input.x = wall.right === 0 ? -1 : 1;
        return `wall ${s.current.next + 1}/${plan.walls.length} (${wall.kind} ${wall.index}): ${wall.right === 0 ? "left" : "right"}`;
      },
    };
    return () => {
      delete aid.place;
      if (game.get().hint) game.set({ hint: null });
    };
  }, [plan]);

  const dropBlock = (x: number, z: number, size: number) => {
    const st = s.current;
    const b = blocks[st.cursor];
    st.cursor = (st.cursor + 1) % BLOCKS;
    b.alive = true;
    b.landed = false;
    b.x = x;
    b.y = HEIGHT - 0.3;
    b.z = z;
    b.vy = 0;
    b.size = size;
    b.rx = Math.random() * 3;
    b.rz = Math.random() * 3;
    b.spin = (Math.random() - 0.5) * 6;
  };

  useFrame(({ clock }, dtRaw) => {
    const dt = Math.min(dtRaw, 1 / 20);
    const p = pose.current;
    const st = s.current;
    const state = game.get();
    const l = state.lesson;
    const playing = state.status === "playing" && !!l;
    const t = clock.elapsedTime;
    let danger = 0;

    if (playing && l) {
      const gentle = state.campaign.gentle;
      const wall = st.next < plan.walls.length ? plan.walls[st.next] : null;
      const ws = wall ? states[st.next] : null;

      // a new sign is met in a quiet stretch: the run drops to a walk while the card is read
      st.quiet = Math.max(0, st.quiet - dt);
      if (st.quiet === 0 && st.teaching) {
        closeTeach(st.teaching);
        st.teaching = "";
      }
      if (wall && wall.teach && st.quiet === 0 && p.z <= wall.z + TEACH_AT && !l.taught.includes(wall.teach)) {
        teach(wall.teach, v.tmp.set(p.x, 1.4, p.z));
        st.teaching = wall.teach;
        st.quiet = 4.5;
        if (ws) ws.called = true;
      }

      // way on: the runner runs on their own, a little faster with every right answer
      const cruise = (gentle ? 6 : 7.5) + Math.min(2, l.progress * 0.3);
      const want = st.quiet > 0 ? 1.6 : cruise;
      st.speed += (want - st.speed) * Math.min(1, dt * 3);
      if (st.back > 0) {
        const step = Math.min(st.back, 14 * dt);
        st.back -= step;
        p.z += step;
        p.speed = 0;
      } else {
        p.z -= st.speed * dt;
        p.speed = st.speed;
      }

      // the side: chosen by the learner until the wall settles it; after a wrong door the other one is simply taken
      if (st.forced && wall) st.side = wall.right;
      else if (!ws?.decided && wall) {
        if (input.x < -0.3) st.side = 0;
        else if (input.x > 0.3) st.side = 1;
      } else if (!wall) st.side = -1;
      const tx = st.side === -1 ? 0 : LANES[st.side];
      p.x += (tx - p.x) * Math.min(1, dt * (ws?.decided ? 12 : 7));
      p.facing = Math.PI - THREE.MathUtils.clamp((tx - p.x) * 0.3, -0.5, 0.5);
      st.shake = Math.max(0, st.shake - dt * 2.2);

      // the sound is called as its doors come up
      if (wall && ws && wall.kind === "ask" && !ws.called && p.z - wall.z < 30 && st.quiet === 0) {
        ws.called = true;
        const station = l.stations[wall.index];
        if (station.kind === "sign") say(signInfo(station.target).said);
      }

      // at the wall, the side the runner is on is the answer
      if (wall && ws && !ws.decided && st.back === 0 && p.z - wall.z < DECIDE) {
        const side = st.side;
        const option = side === -1 ? null : wall.sides[side];
        v.tmp.set(tx, 2, wall.z + 0.6);
        if (side === -1 || option === null) {
          // the pier between the doors, or a side that is walled up: no harm, but no way through
          st.back = 6;
          st.shake = 0.7;
          sfx.land();
          burst(v.tmp, 8, [0.9, 0.78, 0.55], 2.4, { up: 1.5, size: 0.11, life: 0.6, gravity: -5 });
          if (performance.now() - st.nag > 5000) {
            st.nag = performance.now();
            game.toast(side === -1 ? "Pick a side: steer left or right for a door." : "That side is walled up. Take the other.", "info");
          }
        } else if (st.forced) {
          // second time at this wall: the answer is known, the right door opens
          if (wall.kind === "ask") answer(wall.index, option, v.tmp);
          ws.decided = true;
          ws.opening[side] = true;
        } else {
          const outcome = wall.kind === "ask" ? answer(wall.index, option, v.tmp) : answerReview(wall.index, option, v.tmp);
          if (outcome === "wrong") {
            ws.flash[side] = 1;
            st.back = wall.kind === "ask" ? 8 : 5;
            st.speed = 0;
            st.shake = 1;
            st.forced = true;
            st.lead = Math.max(7, st.lead - (wall.kind === "ask" ? 4 : 2));
            sfx.land();
            burst(v.tmp, 16, [0.9, 0.78, 0.55], 3.2, { up: 2, size: 0.12, life: 0.7, gravity: -6 });
          } else {
            // right (or, if the game would not take an answer, no reason to stop the run)
            ws.decided = true;
            ws.opening[wall.right] = true;
            st.side = wall.right;
          }
        }
      }

      // through the door: on to the next wall, back to the middle of the passage
      if (wall && p.z < wall.z - 1.2) {
        st.next += 1;
        st.side = -1;
        st.forced = false;
      }

      // the roof comes down behind: it follows at a distance that mistakes shorten, and never goes back
      st.lead = Math.min(LEAD, st.lead + 0.4 * dt);
      const follow = p.z + st.lead;
      if (follow < st.front) st.front = Math.max(follow, st.front - (cruise + 2.5) * dt);
      if (gentle) st.front = Math.max(st.front, p.z + 5);
      const gap = st.front - p.z;
      danger = THREE.MathUtils.clamp(1 - (gap - 3) / (LEAD - 3), 0, 1);
      if (!gentle && gap < 1) {
        // caught: back on your feet a little before the wall in hand, with the roof pushed back. No answers are lost.
        const target = wall ? wall.z : plan.exitZ;
        const untaught = !!wall?.teach && !l.taught.includes(wall.teach);
        p.z = target + (untaught ? TEACH_AT + 1 : 14);
        p.x = 0;
        st.side = -1;
        st.back = 0;
        st.speed = 0;
        st.shake = 1;
        st.front = p.z + LEAD + 6;
        st.lead = LEAD;
        game.set({ falls: state.falls + 1 });
        sfx.crumble();
        game.toast("The roof came down on you. Up you get: the passage is still falling, and the doors are the same.", "bad");
      }
      if ((danger > 0.75) !== st.warned) {
        st.warned = danger > 0.75;
        game.set({ hint: st.warned ? "The roof is right behind you. A right door first time is how you get ahead of it." : null });
      }

      st.rumble -= dt;
      if (st.rumble <= 0) {
        st.rumble = 2.5 + 4 * (1 - danger) + Math.random();
        sfx.crumble();
      }
      // dust sifting from the roof ahead, thicker as the collapse closes in
      st.dust -= dt;
      if (st.dust <= 0) {
        st.dust = 0.28 - danger * 0.16;
        burst(v.tmp.set((Math.random() - 0.5) * 7, HEIGHT - 0.3, p.z - 2 - Math.random() * 11), 2 + Math.round(danger * 3), [0.8, 0.68, 0.5], 0.5, { up: -0.8, size: 0.07, life: 1.0, gravity: -5 });
      }
      // stone: mostly where the roof is actually falling, now and then a chip off the edges ahead
      st.drop -= dt;
      if (st.drop <= 0) {
        st.drop = 0.5 - danger * 0.34;
        if (Math.random() < 0.7) dropBlock((Math.random() - 0.5) * 6.8, st.front - 1.5 + Math.random() * 5.5, 0.5 + Math.random() * 0.7);
        else dropBlock((Math.random() < 0.5 ? -1 : 1) * (3.1 + Math.random() * 0.5), p.z - 3 - Math.random() * 9, 0.18 + Math.random() * 0.2);
      }

      // out into the daylight
      if (p.z < plan.exitZ + 0.5 && finished()) complete(v.tmp.set(p.x, 1.5, p.z));
    } else p.speed = 0;

    playerPos.set(p.x, 0, p.z);

    // falling stone
    const mesh = rubble.current;
    if (mesh) {
      for (let i = 0; i < BLOCKS; i++) {
        const b = blocks[i];
        if (b.alive && !b.landed) {
          b.vy -= 22 * dt;
          b.y += b.vy * dt;
          b.rx += b.spin * dt;
          if (b.y <= b.size / 2) {
            b.y = b.size / 2;
            b.landed = true;
            if (Math.abs(b.z - p.z) < 25) burst(v.tmp.set(b.x, 0.1, b.z), 4, [0.85, 0.72, 0.5], 1.6, { up: 1.2, size: 0.1, life: 0.5, gravity: -3 });
          }
        }
        v.dummy.position.set(b.x, b.alive ? b.y : -20, b.z);
        v.dummy.rotation.set(b.rx, 0, b.rz);
        v.dummy.scale.setScalar(b.size);
        v.dummy.updateMatrix();
        mesh.setMatrixAt(i, v.dummy.matrix);
      }
      mesh.instanceMatrix.needsUpdate = true;
    }

    // the lights that matter travel: one with the runner, one on the doors ahead, one in the next shaft of light
    if (lamp.current) lamp.current.position.set(p.x, 2.7, p.z - 1.2);
    const ahead = st.next < plan.walls.length ? plan.walls[st.next].z : plan.exitZ;
    if (doorLight.current) doorLight.current.position.set(0, 3.2, ahead + 3.2);
    if (shaftLight.current) {
      let shaft = Number.NaN;
      const taught = l?.taught;
      for (let i = st.next; i < plan.walls.length; i++) {
        const w = plan.walls[i];
        if (w.teach && (!taught?.includes(w.teach) || st.teaching === w.teach)) {
          shaft = w.z + TEACH_AT - 4;
          break;
        }
      }
      shaftLight.current.intensity = Number.isNaN(shaft) ? 0 : 55;
      if (!Number.isNaN(shaft)) shaftLight.current.position.set(0, HEIGHT - 0.8, shaft);
    }
    if (dustRef.current) dustRef.current.position.set(0, 0, p.z - 14);

    // the camera runs behind and above, and shakes as the roof closes in
    const cdt = Math.min(dtRaw, 0.25);
    v.base.lerp(v.tmp.set(p.x * 0.75, 3.1, p.z + 7.5), 1 - Math.exp(-6 * cdt));
    v.look.lerp(v.tmp.set(p.x * 0.7, 2.1, p.z - 12), 1 - Math.exp(-9 * cdt));
    const amp = playing ? 0.015 + danger * danger * 0.1 + st.shake * 0.16 : 0;
    camera.position.set(v.base.x + Math.sin(t * 47) * amp, v.base.y + Math.sin(t * 61 + 1.3) * amp * 0.7, v.base.z);
    camera.lookAt(v.look);
  });

  const from = 16;
  const to = plan.exitZ - 3;
  return (
    <>
      <Indoors density={0.024} fill={0.16} />
      <Corridor from={from} to={to} tex={tex} />
      <Torches from={from} to={to} />
      {plan.walls.map((wall, i) => (
        <DoorWall key={i} wall={wall} state={states[i]} tex={tex} />
      ))}
      {plan.walls.map((wall, i) => (wall.teach ? <LightShaft key={`t${i}`} z={wall.z + TEACH_AT} symbol={wall.teach} /> : null))}
      <Daylit z={plan.exitZ} tex={tex} />
      <Walker pose={pose} />
      <instancedMesh ref={rubble} args={[undefined, undefined, BLOCKS]} frustumCulled={false}>
        <boxGeometry args={[1, 0.8, 1.1]} />
        <meshStandardMaterial map={tex.sandstone.map} roughness={0.95} color="#b9a07a" />
      </instancedMesh>
      <pointLight ref={lamp} color="#ffb070" intensity={46} distance={24} decay={2} />
      <pointLight ref={doorLight} color="#ffc98a" intensity={60} distance={18} decay={2} />
      <pointLight ref={shaftLight} color="#ffe2a0" intensity={0} distance={16} decay={2} />
      <pointLight position={[0, 3, plan.exitZ + 3]} color="#fff1cf" intensity={140} distance={42} decay={2} />
      <group ref={dustRef}>
        <Sparkles count={90} scale={[HALF * 2 - 0.5, HEIGHT - 0.5, 44]} position={[0, HEIGHT / 2, 0]} size={3} speed={0.3} color="#ffdcaa" opacity={0.5} noise={1.1} />
      </group>
    </>
  );
}

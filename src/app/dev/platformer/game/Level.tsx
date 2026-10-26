"use client";

/**
 * What you stand on and what you pick up: pillars out of the river, three
 * moving slabs, ankhs, golden scarabs, checkpoints and the finish.
 */
import { Suspense, useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { CuboidCollider, RigidBody, type RapierRigidBody } from "@react-three/rapier";
import { Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { ANKHS, CHECKPOINTS, GATE, MOVERS, PILLARS, PILLAR_FOOT_Y, SCARABS, type Mover } from "./course";
import { complete } from "./answers";
import { game, moverVelocity, playerPos } from "./store";
import { sfx } from "./audio";
import { worldBox, type GameTextures } from "./textures";
import { Brazier, Column, Model, Obelisk } from "./Scenery";
import { burst } from "./Particles";
import PillarMesh from "./PillarMesh";
import { Compile } from "./Post";
import { FirstSteps, ForkInTheRoad, GateDoor, SignStations } from "./Learning";

// ─── pillars ───

function Pillars({ tex }: { tex: GameTextures }) {
  return (
    <RigidBody type="fixed" colliders={false} friction={0.2}>
      {PILLARS.map((p, i) => {
        const h = p.top[1] - PILLAR_FOOT_Y;
        return <CuboidCollider key={i} args={[p.size[0] / 2, h / 2, p.size[1] / 2]} position={[p.top[0], p.top[1] - h / 2, p.top[2]]} />;
      })}
      {PILLARS.map((p, i) => (
        <PillarMesh key={i} pillar={p} tex={tex} />
      ))}
      {/* the gate is solid: stop the player walking through the pylons */}
      <CuboidCollider args={[3.2, 6, 1]} position={[GATE[0] - 5.4, GATE[1] + 6, GATE[2]]} />
      <CuboidCollider args={[3.2, 6, 1]} position={[GATE[0] + 5.4, GATE[1] + 6, GATE[2]]} />
    </RigidBody>
  );
}

// ─── moving slabs ───

function MovingSlab({ mover, tex }: { mover: Mover; tex: GameTextures }) {
  const body = useRef<RapierRigidBody>(null);
  const clock = useRef((mover.phase ?? 0) * mover.period);
  const vel = useMemo(() => new THREE.Vector3(), []);
  const prev = useMemo(() => new THREE.Vector3(...mover.from), [mover]);
  const next = useMemo(() => new THREE.Vector3(), []);
  const [w, d] = mover.size;
  const geo = useMemo(() => ({ slab: worldBox(w, 0.45, d, 3), trim: worldBox(w + 0.08, 0.1, d + 0.08, 3) }), [w, d]);

  useEffect(() => {
    const b = body.current;
    return () => {
      if (b) moverVelocity.delete(b.handle);
    };
  }, []);

  useFrame((_, dtRaw) => {
    const b = body.current;
    if (!b) return;
    const dt = Math.min(dtRaw, 1 / 30);
    if (game.get().status === "playing") clock.current += dt;
    // ease in and out at both ends so the slab lingers where you step on and off
    const k = 0.5 - 0.5 * Math.cos((clock.current / mover.period) * Math.PI * 2);
    const e = k * k * (3 - 2 * k);
    next.set(
      mover.from[0] + (mover.to[0] - mover.from[0]) * e,
      mover.from[1] + (mover.to[1] - mover.from[1]) * e - 0.225,
      mover.from[2] + (mover.to[2] - mover.from[2]) * e,
    );
    vel.copy(next).sub(prev).divideScalar(Math.max(dt, 1e-4));
    prev.copy(next);
    moverVelocity.set(b.handle, vel);
    b.setNextKinematicTranslation(next);
  });

  return (
    <RigidBody ref={body} type="kinematicPosition" colliders={false} position={[mover.from[0], mover.from[1] - 0.225, mover.from[2]]} friction={0.2}>
      <CuboidCollider args={[w / 2, 0.225, d / 2]} />
      <mesh geometry={geo.slab} castShadow receiveShadow>
        <meshStandardMaterial map={tex.limestone.map} normalMap={tex.limestone.normalMap} roughness={0.8} color="#fff1d2" />
      </mesh>
      <mesh geometry={geo.trim} position={[0, 0.12, 0]}>
        <meshStandardMaterial color="#d9a935" metalness={1} roughness={0.28} />
      </mesh>
      {/* what holds it up */}
      <mesh position={[0, -0.24, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[w * 0.22, w * 0.36, 40]} />
        <meshBasicMaterial color={[0.3, 2.6, 2.3]} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>
      <Sparkles count={26} scale={[w * 0.8, 2.2, d * 0.8]} position={[0, -1.3, 0]} size={5} speed={0.9} color="#7ff0e0" opacity={0.9} />
      <pointLight position={[0, -0.9, 0]} color="#5fe8d8" intensity={7} distance={7} decay={2} />
    </RigidBody>
  );
}

// ─── collectibles ───

function useAnkhGeometry() {
  return useMemo(() => {
    const loop = new THREE.TorusGeometry(0.15, 0.048, 12, 28);
    loop.scale(0.9, 1.25, 1);
    loop.translate(0, 0.27, 0);
    const stem = new THREE.BoxGeometry(0.085, 0.4, 0.085);
    stem.translate(0, -0.13, 0);
    const arms = new THREE.BoxGeometry(0.38, 0.085, 0.085);
    arms.translate(0, 0.05, 0);
    return mergeGeometries([loop, stem, arms])!;
  }, []);
}

function Ankhs() {
  const geometry = useAnkhGeometry();
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  const taken = useRef<boolean[]>(ANKHS.map(() => false));
  const gone = useRef<number[]>(ANKHS.map(() => 0));
  const p = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    game.set({ ankhTotal: ANKHS.length, scarabTotal: SCARABS.length });
  }, []);

  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime;
    const playing = game.get().status === "playing";
    for (let i = 0; i < ANKHS.length; i++) {
      const m = refs.current[i];
      if (!m) continue;
      const a = ANKHS[i];
      if (taken.current[i]) {
        // fly up and shrink away
        gone.current[i] += dt;
        const k = Math.min(1, gone.current[i] / 0.35);
        m.position.y = a[1] + k * 1.2;
        m.scale.setScalar((1 - k) * 1.4);
        m.rotation.y += dt * 18;
        m.visible = k < 1;
        continue;
      }
      m.position.y = a[1] + Math.sin(t * 2 + i * 0.7) * 0.12;
      m.rotation.y = t * 1.6 + i;
      if (!playing) continue;
      p.set(a[0], a[1], a[2]);
      if (p.distanceToSquared(playerPos) < 1.05 * 1.05) {
        taken.current[i] = true;
        const n = game.get().ankhs + 1;
        game.set({ ankhs: n });
        sfx.ankh(n);
        burst(p, 10, [3.2, 2.0, 0.4], 3.2);
      }
    }
  });

  return (
    <>
      {ANKHS.map((a, i) => (
        <mesh
          key={i}
          ref={(m) => {
            refs.current[i] = m;
          }}
          geometry={geometry}
          position={a}
          castShadow
        >
          <meshStandardMaterial color="#f0bf45" metalness={1} roughness={0.18} emissive="#ff9d1c" emissiveIntensity={1.35} />
        </mesh>
      ))}
    </>
  );
}

function GoldenScarab({ position, index }: { position: [number, number, number]; index: number }) {
  const ref = useRef<THREE.Group>(null);
  const taken = useRef(false);
  const p = useMemo(() => new THREE.Vector3(...position), [position]);
  useFrame(({ clock }) => {
    const g = ref.current;
    if (!g || taken.current) return;
    g.position.y = position[1] + Math.sin(clock.elapsedTime * 1.6 + index) * 0.15;
    g.rotation.y = clock.elapsedTime * 0.9;
    if (game.get().status === "playing" && p.distanceToSquared(playerPos) < 1.3 * 1.3) {
      taken.current = true;
      g.visible = false;
      game.set({ scarabs: game.get().scarabs + 1 });
      sfx.scarab();
      burst(p, 26, [1.0, 3.0, 2.6], 4.5);
    }
  });
  return (
    <group ref={ref} position={position}>
      <Model url="/models/objects/scarab.glb" size={0.9} position={[0, -0.3, 0]} />
      <Sparkles count={16} scale={[1.6, 1.6, 1.6]} size={6} speed={0.7} color="#9ff5e6" />
    </group>
  );
}

// ─── checkpoints and the finish ───

function CheckpointRing({ index }: { index: number }) {
  const cp = CHECKPOINTS[index];
  const mat = useRef<THREE.MeshBasicMaterial>(null);
  const lit = useRef(false);
  const glow = useRef(0);
  const p = useMemo(() => new THREE.Vector3(...cp.at), [cp]);
  useFrame((_, dt) => {
    if (!lit.current && game.get().status === "playing") {
      const dx = playerPos.x - p.x;
      const dz = playerPos.z - p.z;
      if (dx * dx + dz * dz < 2.2 * 2.2 && Math.abs(playerPos.y - p.y) < 2.5) {
        lit.current = true;
        game.set({ checkpoint: Math.max(game.get().checkpoint, index + 1) });
        sfx.checkpoint();
        burst(new THREE.Vector3(p.x, p.y + 0.4, p.z), 22, [0.4, 2.8, 2.5], 4);
        // (a flat ring of light is also what a sign's beam stands in: say which this is, or it looks like a sign that never came)
        game.mascot("point", `Checkpoint ${index + 1} of ${CHECKPOINTS.length}! ${index === CHECKPOINTS.length - 1 ? "Only the last climb to the gate is left." : "That stretch is behind you for good."}`);
      }
    }
    glow.current = THREE.MathUtils.damp(glow.current, lit.current ? 1 : 0, 4, dt);
    if (mat.current) mat.current.color.setRGB(0.5 - glow.current * 0.32, 0.35 + glow.current * 1.15, 0.2 + glow.current * 1.1);
  });
  return (
    <mesh position={[cp.at[0], cp.at[1] + 0.03, cp.at[2]]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[1.25, 1.5, 48]} />
      <meshBasicMaterial ref={mat} toneMapped={false} />
    </mesh>
  );
}

function Finish() {
  useFrame(() => {
    if (game.get().status !== "playing") return;
    const dx = playerPos.x - GATE[0];
    const dz = playerPos.z - (GATE[2] + 1.6);
    const lesson = game.get().lesson;
    const spelled = !!lesson && lesson.progress >= lesson.stations.length;
    if (spelled && Math.abs(dx) < 1.9 && Math.abs(dz) < 1.6 && playerPos.y > GATE[1]) {
      complete(playerPos.clone());
    }
  });
  return null;
}

// ─── dressing on the platforms ───

function Dressing({ tex }: { tex: GameTextures }) {
  const temple = PILLARS[PILLARS.length - 1];
  const [tx, ty, tz] = temple.top;
  return (
    <>
      {/* start plaza */}
      <Brazier position={[-4.6, 0, -4.8]} />
      <Brazier position={[4.6, 0, -4.8]} lit={false} />
      <Obelisk position={[-4.8, 0, 4.4]} height={6.5} tex={tex} />
      <Obelisk position={[4.8, 0, 4.4]} height={6.5} tex={tex} />
      <Suspense fallback={null}>
        <Model url="/models/signs/lion.glb" size={2.6} position={[-3.4, 0, 1]} rotation={Math.PI / 2} />
        <Model url="/models/signs/lion.glb" size={2.6} position={[3.4, 0, 1]} rotation={-Math.PI / 2} />
        <Model url="/models/objects/jar.glb" size={1.1} position={[4.9, 0, -1.6]} />
        <Model url="/models/objects/jar.glb" size={0.8} position={[4.2, 0, -2.5]} rotation={1} />
        <Model url="/models/objects/jar.glb" size={1} position={[-3.2, 1.2, -26.4]} />
        <Model url="/models/objects/lotus.glb" size={0.9} position={[2.6, 1.7, -41.2]} />
        <Model url="/models/objects/jar.glb" size={1.1} position={[-6.6, 6, -60.4]} rotation={2} />
      </Suspense>
      {/* landings */}
      <Brazier position={[-3.3, 1.2, -22.4]} lit={false} />
      <Brazier position={[3.3, 1.2, -22.4]} />
      <Brazier position={[-2.6, 1.7, -41.2]} />
      <Brazier position={[-6.7, 6, -65.6]} lit={false} />
      <Brazier position={[-1.3, 6, -65.6]} />
      <Brazier position={[-2.4, 9.5, -88.2]} lit={false} />
      <Brazier position={[2.4, 9.5, -88.2]} />
      {/* the temple forecourt */}
      {[-117.5, -122.5].map((z) =>
        [-1, 1].map((s) => <Column key={`${z}${s}`} position={[tx + s * 5.6, ty, z]} tex={tex} />),
      )}
      <Brazier position={[tx - 2.6, ty, tz - 3.4]} />
      <Brazier position={[tx + 2.6, ty, tz - 3.4]} lit={false} />
    </>
  );
}

export default function Level({ tex, run }: { tex: GameTextures; run: number }) {
  return (
    <>
      <Pillars tex={tex} />
      {MOVERS.map((m, i) => (
        <MovingSlab key={i} mover={m} tex={tex} />
      ))}
      <Dressing tex={tex} />
      {/* the teaching parts; the fork and the tablets remount on every new run */}
      <group key={`learn-${run}`}>
        <ForkInTheRoad tex={tex} />
        <SignStations tex={tex} />
        <FirstSteps />
      </group>
      <GateDoor tex={tex} />
      {/* collectibles remount on every new run */}
      <group key={run}>
        <Ankhs />
        <Suspense fallback={null}>
          {SCARABS.map((s, i) => (
            <GoldenScarab key={i} position={s} index={i} />
          ))}
          {/* (they arrive on their own, after the course: their shader is compiled in the background like the rest) */}
          <Compile />
        </Suspense>
        {CHECKPOINTS.map((_, i) => (
          <CheckpointRing key={i} index={i} />
        ))}
      </group>
      <Finish />
    </>
  );
}

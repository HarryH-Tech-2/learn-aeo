"use client";

/**
 * The explorer, built from primitives. `Explorer` is the bare figure with the
 * joints handed out as refs (the platformer animates them from its physics);
 * `Walker` is the same figure for places with no physics: give it a pose to
 * read every frame and it runs, climbs or carries on its own.
 */
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export type Pose = {
  x: number;
  y: number;
  z: number;
  /** heading in radians, 0 = +Z, π = −Z (away from the camera) */
  facing: number;
  /** metres per second over the ground (drives the run cycle) */
  speed: number;
  /** arms up: carrying something, or hanging from a hold */
  armsUp?: boolean;
  /** climbing: the limbs work alternately against a wall */
  climbing?: boolean;
};

const RUN_SPEED = 6.4;

/** The figure, moved and animated from a pose that some other code updates in place. */
export function Walker({ pose, scale = 1 }: { pose: React.RefObject<Pose>; scale?: number }) {
  const rig = useRef<THREE.Group>(null);
  const torso = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const legL = useRef<THREE.Group>(null);
  const legR = useRef<THREE.Group>(null);
  const armL = useRef<THREE.Group>(null);
  const armR = useRef<THREE.Group>(null);
  const stride = useRef(0);

  useFrame(({ clock }, dtRaw) => {
    const p = pose.current;
    const g = rig.current;
    if (!p || !g) return;
    const dt = Math.min(dtRaw, 1 / 20);
    g.position.set(p.x, p.y, p.z);
    let d = p.facing - g.rotation.y;
    d = Math.atan2(Math.sin(d), Math.cos(d));
    g.rotation.y += d * Math.min(1, dt * 12);
    stride.current += Math.max(p.speed, p.climbing ? 2.2 : 0) * dt * 2.6;
    const run = Math.min(1, p.speed / RUN_SPEED);
    const swing = Math.sin(stride.current) * 0.95 * (p.climbing ? 0.5 : run);
    if (legL.current && legR.current && armL.current && armR.current) {
      legL.current.rotation.x = swing;
      legR.current.rotation.x = -swing;
      const up = p.armsUp || p.climbing;
      armL.current.rotation.x = up ? -2.7 + (p.climbing ? swing * 0.5 : 0) : -swing * 0.9;
      armR.current.rotation.x = up ? -2.7 - (p.climbing ? swing * 0.5 : 0) : swing * 0.9;
      armL.current.rotation.z = up ? 0.12 : 0.18;
      armR.current.rotation.z = up ? -0.12 : -0.18;
    }
    if (torso.current) {
      torso.current.rotation.x = p.climbing ? -0.12 : run * 0.22;
      torso.current.position.y = Math.abs(Math.sin(stride.current)) * 0.05 * run + (run < 0.05 ? Math.sin(clock.elapsedTime * 2.2) * 0.012 : 0);
    }
    if (head.current) head.current.rotation.x = p.climbing ? -0.5 : -run * 0.12;
  });

  return (
    <group ref={rig} scale={scale}>
      <Explorer torso={torso} head={head} legL={legL} legR={legR} armL={armL} armR={armR} />
    </group>
  );
}

// ─── the character ───

type Ref = React.RefObject<THREE.Group | null>;

export function Explorer({ torso, head, legL, legR, armL, armR }: { torso: Ref; head: Ref; legL: Ref; legR: Ref; armL: Ref; armR: Ref }) {
  const khaki = "#c8b07a";
  const dark = "#5a4630";
  const skin = "#d9a27a";
  const cloth = { roughness: 0.85, metalness: 0 };
  return (
    <group>
      {/* legs pivot at the hip */}
      {(
        [
          [legL, -0.11],
          [legR, 0.11],
        ] as [Ref, number][]
      ).map(([ref, x]) => (
        <group key={x} ref={ref} position={[x, 0.42, 0]}>
          <mesh position={[0, -0.15, 0]} castShadow>
            <capsuleGeometry args={[0.075, 0.2, 6, 12]} />
            <meshStandardMaterial color="#8a7348" {...cloth} />
          </mesh>
          <mesh position={[0, -0.36, 0.035]} castShadow>
            <boxGeometry args={[0.15, 0.12, 0.25]} />
            <meshStandardMaterial color="#3d2c1e" roughness={0.6} />
          </mesh>
        </group>
      ))}
      <group ref={torso}>
        {/* body */}
        <mesh position={[0, 0.6, 0]} castShadow>
          <capsuleGeometry args={[0.19, 0.2, 8, 16]} />
          <meshStandardMaterial color={khaki} {...cloth} />
        </mesh>
        {/* belt and buckle */}
        <mesh position={[0, 0.46, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.06, 20]} />
          <meshStandardMaterial color={dark} roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.46, 0.195]}>
          <boxGeometry args={[0.07, 0.06, 0.02]} />
          <meshStandardMaterial color="#e2b23e" metalness={1} roughness={0.25} />
        </mesh>
        {/* satchel strap and pack */}
        <mesh position={[0, 0.63, -0.2]} castShadow>
          <boxGeometry args={[0.27, 0.32, 0.15]} />
          <meshStandardMaterial color="#7a5232" roughness={0.75} />
        </mesh>
        <mesh position={[0, 0.82, -0.2]} rotation={[0, 0, Math.PI / 2]}>
          <capsuleGeometry args={[0.06, 0.24, 4, 10]} />
          <meshStandardMaterial color="#b9a06a" {...cloth} />
        </mesh>
        {/* scarf */}
        <mesh position={[0, 0.83, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.13, 0.05, 10, 20]} />
          <meshStandardMaterial color="#b3402a" {...cloth} />
        </mesh>
        <mesh position={[0.08, 0.72, -0.16]} rotation={[0.5, 0, -0.2]} castShadow>
          <boxGeometry args={[0.09, 0.26, 0.03]} />
          <meshStandardMaterial color="#b3402a" {...cloth} />
        </mesh>
        {/* arms pivot at the shoulder */}
        {(
          [
            [armL, -0.24],
            [armR, 0.24],
          ] as [Ref, number][]
        ).map(([ref, x]) => (
          <group key={x} ref={ref} position={[x, 0.76, 0]}>
            <mesh position={[0, -0.13, 0]} castShadow>
              <capsuleGeometry args={[0.058, 0.2, 6, 10]} />
              <meshStandardMaterial color={khaki} {...cloth} />
            </mesh>
            <mesh position={[0, -0.29, 0]} castShadow>
              <sphereGeometry args={[0.062, 12, 10]} />
              <meshStandardMaterial color={skin} roughness={0.7} />
            </mesh>
          </group>
        ))}
        {/* head */}
        <group ref={head} position={[0, 1.0, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.185, 24, 18]} />
            <meshStandardMaterial color={skin} roughness={0.65} />
          </mesh>
          {[-0.068, 0.068].map((x) => (
            <mesh key={x} position={[x, 0.01, 0.166]}>
              <sphereGeometry args={[0.025, 10, 8]} />
              <meshStandardMaterial color="#20160e" roughness={0.3} />
            </mesh>
          ))}
          {/* pith helmet: dome, brim, band */}
          <mesh position={[0, 0.055, 0]} castShadow>
            <sphereGeometry args={[0.205, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#efe4c8" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.055, 0.015]} scale={[1, 1, 1.18]} castShadow>
            <cylinderGeometry args={[0.285, 0.31, 0.03, 28]} />
            <meshStandardMaterial color="#e6d9b8" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.085, 0]}>
            <cylinderGeometry args={[0.2, 0.207, 0.045, 24]} />
            <meshStandardMaterial color="#7a5232" roughness={0.7} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

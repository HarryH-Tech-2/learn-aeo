"use client";

/** One pooled, instanced puff system for landing dust, pickups and splashes. */
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const MAX = 160;

type P = { alive: boolean; age: number; life: number; pos: THREE.Vector3; vel: THREE.Vector3; size: number; gravity: number };

const pool: P[] = Array.from({ length: MAX }, () => ({ alive: false, age: 0, life: 1, pos: new THREE.Vector3(), vel: new THREE.Vector3(), size: 0.1, gravity: -6 }));
// (one colour to spare, like the matrices: the buffer is written to here, so it must not be swapped for a padded copy; see instancePad.ts)
const colors = new Float32Array((MAX + 1) * 3);
let cursor = 0;
let colorsDirty = false;

/** `color` is linear RGB and may exceed 1 so pickups bloom. */
export function burst(at: THREE.Vector3, count: number, color: [number, number, number], speed: number, opts: { up?: number; size?: number; life?: number; gravity?: number } = {}) {
  for (let i = 0; i < count; i++) {
    const p = pool[cursor];
    const a = Math.random() * Math.PI * 2;
    const r = 0.4 + Math.random() * 0.6;
    p.alive = true;
    p.age = 0;
    p.life = (opts.life ?? 0.6) * (0.7 + Math.random() * 0.6);
    p.pos.copy(at);
    p.vel.set(Math.cos(a) * speed * r, (opts.up ?? speed * 0.7) * (0.4 + Math.random() * 0.8), Math.sin(a) * speed * r);
    p.size = (opts.size ?? 0.09) * (0.7 + Math.random() * 0.7);
    p.gravity = opts.gravity ?? -7;
    colors.set(color, cursor * 3);
    cursor = (cursor + 1) % MAX;
  }
  colorsDirty = true;
}

export default function Particles() {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const attr = useMemo(() => new THREE.InstancedBufferAttribute(colors, 3), []);

  useFrame((_, dtRaw) => {
    const m = mesh.current;
    if (!m) return;
    const dt = Math.min(dtRaw, 1 / 30);
    for (let i = 0; i < MAX; i++) {
      const p = pool[i];
      if (p.alive) {
        p.age += dt;
        if (p.age >= p.life) p.alive = false;
        p.vel.y += p.gravity * dt;
        p.vel.multiplyScalar(1 - 1.8 * dt);
        p.pos.addScaledVector(p.vel, dt);
      }
      const k = p.alive ? 1 - p.age / p.life : 0;
      dummy.position.copy(p.pos);
      dummy.scale.setScalar(p.size * Math.sqrt(k) * (p.alive ? 1 : 0));
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
    if (colorsDirty) {
      attr.needsUpdate = true;
      colorsDirty = false;
    }
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, MAX]} frustumCulled={false}>
      <icosahedronGeometry args={[1, 1]} />
      <meshBasicMaterial toneMapped={false} />
      <primitive object={attr} attach="instanceColor" />
    </instancedMesh>
  );
}

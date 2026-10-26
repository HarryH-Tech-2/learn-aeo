"use client";

/** One stone pillar out of the river: limestone cap with a gold trim, masonry shaft, a carved band under the cap. */
import { useMemo } from "react";
import * as THREE from "three";
import { PILLAR_FOOT_Y, type Pillar } from "./course";
import { worldBox, type GameTextures } from "./textures";

export default function PillarMesh({ pillar, tex }: { pillar: Pillar; tex: GameTextures }) {
  const [x, y, z] = pillar.top;
  const [w, d] = pillar.size;
  const capH = 0.5;
  const shaftH = y - capH - PILLAR_FOOT_Y;
  const inset = pillar.kind === "beam" ? 0.3 : 0.55;
  const geo = useMemo(
    () => ({
      cap: worldBox(w, capH, d, 3.6),
      shaft: worldBox(w - inset, shaftH, d - inset, 4),
      band: worldBox(w - inset + 0.12, 0.7, d - inset + 0.12, 5.6, 0.7),
      trim: worldBox(w + 0.08, 0.09, d + 0.08, 3),
    }),
    [w, d, shaftH, inset],
  );
  return (
    <group position={[x, 0, z]}>
      <mesh geometry={geo.cap} position={[0, y - capH / 2, 0]} castShadow receiveShadow>
        <meshStandardMaterial map={tex.limestone.map} normalMap={tex.limestone.normalMap} roughness={0.82} color="#fff1d2" />
      </mesh>
      <mesh geometry={geo.trim} position={[0, y - capH + 0.02, 0]}>
        <meshStandardMaterial color="#d9a935" metalness={1} roughness={0.28} />
      </mesh>
      <mesh geometry={geo.shaft} position={[0, y - capH - shaftH / 2, 0]} castShadow receiveShadow>
        <meshStandardMaterial map={tex.sandstone.map} normalMap={tex.sandstone.normalMap} roughness={0.9} normalScale={new THREE.Vector2(1.2, 1.2)} />
      </mesh>
      <mesh geometry={geo.band} position={[0, y - capH - 0.75, 0]} castShadow receiveShadow>
        <meshStandardMaterial map={tex.band.map} normalMap={tex.band.normalMap} roughness={0.8} normalScale={new THREE.Vector2(1.5, 1.5)} />
      </mesh>
    </group>
  );
}

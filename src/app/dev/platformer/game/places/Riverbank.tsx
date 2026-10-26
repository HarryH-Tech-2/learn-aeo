"use client";

/**
 * The banks of the river. The shared landscape keeps its shores a long way
 * off and bare, so a river level gets banks of its own, close enough to
 * look at: reed beds and lily pads at the water's edge, a strip of striped
 * fields, palm groves, mud-brick villages, shadufs lifting water, a sphinx
 * avenue up to a shrine, a colonnaded temple with a landing stage, a pair of
 * seated colossi, moored boats, cattle, geese, and ibises crossing overhead;
 * and the smaller things: sycamore figs and acacias, awnings and beehive
 * granaries in the villages, heaps of threshed grain, papyrus skiffs among
 * the reeds, egrets fishing the shallows, cooking smoke on the evening air.
 *
 * A river is described by a `RiverPlan`: the felucca run has a narrow one, the
 * causeway (level 1) a wide one that bends away with the landscape.
 *
 * Everything that comes in numbers is instanced (reeds, pads, houses); the
 * rest is a few dozen meshes. Placement is seeded, so the river is the same
 * river every run.
 */
import { Suspense, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { WATER_Y } from "../course";
import { playerPos } from "../store";
import { Brazier, Column, Model, Obelisk, PalmStand, groundHeight, riverCentre, useFitted, type PalmSpot } from "../Scenery";
import { faceted, worldBox, type GameTextures } from "../textures";

type Site = [side: number, z: number];

/** One river and what stands on its banks. The felucca run and the causeway each have their own. */
export type RiverPlan = {
  zFrom: number;
  zTo: number;
  /** metres from the middle of the river to the water’s edge, give or take */
  edge: number;
  /** how far back from the water the bank is modelled before the dunes take over */
  width: number;
  /** where the middle of the river is at z (the causeway’s river bends away at the horizon) */
  centre: (z: number) => number;
  seed: number;
  villages: Site[];
  temples: Site[];
  avenues: Site[];
  colossi: Site[];
  shadufs: Site[];
  quays: Site[];
  /** a pair of obelisks, one on each bank */
  obelisks: number[];
  skiffs: Site[];
  animals: { url: string; size: number; side: number; z: number; inland: number; turn: number }[];
  palmClumps: number;
  /** clumps of plain reed, clumps of papyrus, lily pads, field trees, egrets */
  reeds: number;
  papyrus: number;
  pads: number;
  trees: number;
  egrets: number;
};

export type River = RiverPlan & {
  /** how far from the middle of the river the water ends: a lazy, uneven line */
  waterline: (z: number) => number;
  /** the height of the bank: shallows, a mud step up, then level fields until the dunes take over */
  bankY: (x: number, z: number) => number;
  /** a spot on a bank: `side` −1 is the left bank going downstream, `inland` is metres back from the water */
  spot: (side: number, z: number, inland: number) => [number, number, number];
};

function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function noise(x: number, y: number): number {
  const h = (a: number, b: number) => {
    let n = (a * 374761393 + b * 668265263) | 0;
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  };
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const u = x - xi;
  const v = y - yi;
  const su = u * u * (3 - 2 * u);
  const sv = v * v * (3 - 2 * v);
  return h(xi, yi) * (1 - su) * (1 - sv) + h(xi + 1, yi) * su * (1 - sv) + h(xi, yi + 1) * (1 - su) * sv + h(xi + 1, yi + 1) * su * sv;
}

export function riverOf(plan: RiverPlan): River {
  const waterline = (z: number) => plan.edge + Math.sin(z * 0.05) * 1.6 + Math.sin(z * 0.013 + 1) * 1.2;
  const bankY = (x: number, z: number) => {
    const d = Math.abs(x - plan.centre(z)) - waterline(z);
    const h = d < 0 ? Math.max(-1.6, d * 0.35) - 0.15 : 1.7 * THREE.MathUtils.smoothstep(d, 0, 6) + noise(x * 0.2, z * 0.2) * 0.3;
    return Math.max(WATER_Y + h, groundHeight(x, z) + 0.08);
  };
  const spot = (side: number, z: number, inland: number): [number, number, number] => {
    const x = plan.centre(z) + side * (waterline(z) + inland);
    return [x, bankY(x, z), z];
  };
  return { ...plan, waterline, bankY, spot };
}

/** The river the felucca sails: narrow, so the banks slide past close by. */
export const FELUCCA_RIVER: RiverPlan = {
  zFrom: 180,
  zTo: -270,
  edge: 15,
  width: 70,
  centre: () => 0,
  seed: 0,
  villages: [[-1, 88], [-1, -52], [-1, -178], [1, 56], [1, -126], [1, -215]],
  temples: [[1, -38]],
  avenues: [[-1, 26]],
  colossi: [[-1, -112], [-1, -126]],
  shadufs: [[-1, 62], [1, 92], [-1, -84], [1, -168]],
  quays: [[1, 118]],
  obelisks: [-196],
  skiffs: [[-1, 140], [1, 8], [-1, -150], [1, -96]],
  animals: [
    { url: "/models/objects/bull.glb", size: 2.6, side: -1, z: -8, inland: 9, turn: 0.6 },
    { url: "/models/objects/bull.glb", size: 2.4, side: -1, z: -14, inland: 12, turn: 2.4 },
    { url: "/models/objects/bull.glb", size: 2.6, side: 1, z: 14, inland: 10, turn: -1.2 },
    { url: "/models/objects/goose.glb", size: 0.8, side: 1, z: 30, inland: 1.2, turn: -1.6 },
    { url: "/models/objects/goose.glb", size: 0.75, side: 1, z: 32, inland: 1.8, turn: -2.2 },
    { url: "/models/objects/goose.glb", size: 0.8, side: -1, z: 118, inland: 1.4, turn: 1.4 },
  ],
  palmClumps: 13,
  reeds: 260,
  papyrus: 90,
  pads: 170,
  trees: 26,
  egrets: 10,
};

/**
 * The causeway’s river: wide enough for the course and its obelisks, with the
 * banks still near enough to read. The learner climbs to the gate, so the
 * far end of the course looks down on the fields and villages from above.
 */
export const CAUSEWAY_RIVER: RiverPlan = {
  zFrom: 70,
  zTo: -290,
  edge: 27,
  width: 84,
  centre: riverCentre,
  seed: 2207,
  villages: [[-1, 12], [1, 34], [-1, -40], [1, -112], [-1, -158], [1, -190], [-1, -236]],
  temples: [[-1, -96]],
  avenues: [[1, -64]],
  colossi: [[1, -12], [1, -27]],
  shadufs: [[-1, -10], [1, -42], [-1, -66], [1, -140], [-1, -132], [1, 12]],
  quays: [[-1, -24]],
  obelisks: [-212],
  skiffs: [[1, 2], [-1, -52], [1, -88], [-1, -120], [1, -160]],
  animals: [
    { url: "/models/objects/bull.glb", size: 2.6, side: -1, z: -58, inland: 9, turn: 0.6 },
    { url: "/models/objects/bull.glb", size: 2.4, side: -1, z: -63, inland: 12, turn: 2.4 },
    { url: "/models/objects/bull.glb", size: 2.6, side: 1, z: -36, inland: 10, turn: -1.2 },
    { url: "/models/objects/bull.glb", size: 2.5, side: 1, z: -128, inland: 8, turn: 1.9 },
    { url: "/models/objects/goose.glb", size: 0.8, side: 1, z: -44, inland: 1.2, turn: -1.6 },
    { url: "/models/objects/goose.glb", size: 0.75, side: 1, z: -46, inland: 1.8, turn: -2.2 },
    { url: "/models/objects/goose.glb", size: 0.8, side: -1, z: -8, inland: 1.4, turn: 1.4 },
    { url: "/models/objects/goose.glb", size: 0.8, side: -1, z: -84, inland: 1.1, turn: 0.7 },
  ],
  palmClumps: 30,
  reeds: 300,
  papyrus: 110,
  pads: 220,
  trees: 44,
  egrets: 14,
};

// ─── the ground ───

function Bank({ side, tex, river }: { side: number; tex: GameTextures; river: River }) {
  const geometry = useMemo(() => {
    const { width, zFrom, zTo, waterline, bankY } = river;
    const g = new THREE.PlaneGeometry(width, zFrom - zTo, Math.round(width / 1.75), Math.round((zFrom - zTo) / 2.6));
    g.rotateX(-Math.PI / 2);
    g.translate(side * (river.edge - 4 + width / 2), 0, (zFrom + zTo) / 2);
    const pos = g.attributes.position as THREE.BufferAttribute;
    const colors = new Float32Array(pos.count * 3);
    const mud = new THREE.Color("#5f4526");
    const earth = new THREE.Color("#8a6a3c");
    const sand = new THREE.Color("#dca863");
    const crops = ["#587f33", "#7a9a3f", "#a39a45", "#4f7436", "#8fa04a"].map((c) => new THREE.Color(c));
    const c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const z = pos.getZ(i);
      const x = pos.getX(i) + river.centre(z);
      const y = bankY(x, z);
      pos.setXYZ(i, x, y, z);
      const d = Math.abs(x - river.centre(z)) - waterline(z);
      // fields are laid out in long strips running back from the river, each its own crop
      const strip = crops[Math.floor(z / 11 + noise(x * 0.04, 3) * 1.5 + 100) % crops.length];
      if (d < 1.2) c.copy(mud);
      else if (d < 4.5) c.copy(earth).lerp(strip, (d - 1.2) / 3.3);
      else c.copy(strip).lerp(sand, THREE.MathUtils.smoothstep(d, 26, 40));
      // field boundaries: a darker, damp line where one strip meets the next (the irrigation ditches)
      if (d > 3 && d < 34) {
        const f = (z / 11 + noise(x * 0.04, 3) * 1.5 + 100) % 1;
        if (Math.min(f, 1 - f) < 0.035) c.lerp(mud, 0.55);
      }
      // where the dunes come through, it is sand whatever the field says
      if (y - WATER_Y > 2.4) c.lerp(sand, THREE.MathUtils.smoothstep(y - WATER_Y, 2.4, 4));
      c.multiplyScalar(0.86 + noise(x * 0.7, z * 0.7) * 0.28);
      colors.set([c.r, c.g, c.b], i * 3);
    }
    g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    g.computeVertexNormals();
    return g;
  }, [side, river]);
  const normalMap = useMemo(() => {
    const t = tex.sand.normalMap.clone();
    t.repeat.set(river.width / 2.3, (river.zFrom - river.zTo) / 2.4);
    t.needsUpdate = true;
    return t;
  }, [tex, river]);
  return (
    <mesh geometry={geometry} receiveShadow>
      <meshStandardMaterial vertexColors roughness={1} normalMap={normalMap} normalScale={new THREE.Vector2(0.45, 0.45)} />
    </mesh>
  );
}

// ─── what grows at the water's edge ───

/** Reed beds: mostly plain blades, with papyrus among them (a stalk with a mop of fine rays at the top). */
function Reeds({ papyrus, river }: { papyrus: boolean; river: River }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const geometry = useMemo(() => {
    // three sides and no end caps: there are thousands, each a sliver on screen, and slivers are what MSAA charges most for
    const stalk = new THREE.CylinderGeometry(papyrus ? 0.012 : 0.004, papyrus ? 0.03 : 0.034, 1, 3, 1, true);
    stalk.translate(0, 0.5, 0);
    if (!papyrus) return stalk;
    const head = new THREE.ConeGeometry(0.16, 0.2, 6, 1, true);
    head.rotateX(Math.PI);
    head.translate(0, 1.04, 0);
    return mergeGeometries([stalk, head])!;
  }, [papyrus]);
  const items = useMemo(() => {
    const { zFrom, zTo, waterline, bankY, centre } = river;
    const r = rng(river.seed + (papyrus ? 4021 : 733));
    const out: { p: [number, number, number]; h: number; lean: number; turn: number; tone: number }[] = [];
    for (let k = 0; k < (papyrus ? river.papyrus : river.reeds); k++) {
      const side = r() < 0.5 ? -1 : 1;
      const z = zFrom - r() * (zFrom - zTo);
      const at = waterline(z) + (r() - 0.62) * 3.2;
      const n = papyrus ? 4 + Math.floor(r() * 5) : 7 + Math.floor(r() * 8);
      for (let i = 0; i < n; i++) {
        const off = at + (r() - 0.5) * 1.5;
        const zz = z + (r() - 0.5) * 1.8;
        const x = centre(zz) + side * off;
        out.push({ p: [x, Math.max(bankY(x, zz), WATER_Y - 0.35), zz], h: (papyrus ? 1.8 : 1.1) + r() * 1.5, lean: (r() - 0.5) * 0.36, turn: r() * 6.28, tone: r() });
      }
    }
    return out;
  }, [papyrus, river]);
  useLayoutEffect(() => {
    const m = mesh.current;
    if (!m) return;
    const o = new THREE.Object3D();
    const c = new THREE.Color();
    items.forEach((it, i) => {
      o.position.set(...it.p);
      o.rotation.set(it.lean, it.turn, it.lean * 0.6);
      o.scale.set(1, it.h, 1);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
      m.setColorAt(i, c.setHSL(0.2 + it.tone * 0.08, 0.5, 0.2 + it.tone * 0.12));
    });
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [items]);
  return (
    <instancedMesh ref={mesh} args={[geometry, undefined, items.length]} castShadow={papyrus} frustumCulled={false}>
      <meshStandardMaterial roughness={0.9} side={THREE.DoubleSide} />
    </instancedMesh>
  );
}

function LilyPads({ river }: { river: River }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const items = useMemo(() => {
    const r = rng(river.seed + 977);
    return Array.from({ length: river.pads }, () => {
      const side = r() < 0.5 ? -1 : 1;
      const z = river.zFrom - r() * (river.zFrom - river.zTo);
      return { x: river.centre(z) + side * (river.waterline(z) - 0.6 - r() * 3.4), z, s: 0.28 + r() * 0.42, turn: r() * 6.28, flower: r() < 0.22 };
    });
  }, [river]);
  useLayoutEffect(() => {
    const m = mesh.current;
    if (!m) return;
    const o = new THREE.Object3D();
    const c = new THREE.Color();
    items.forEach((it, i) => {
      o.position.set(it.x, WATER_Y + 0.04, it.z);
      o.rotation.set(-Math.PI / 2, 0, it.turn);
      o.scale.setScalar(it.s);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
      m.setColorAt(i, it.flower ? c.set("#f3d9ee") : c.setHSL(0.3, 0.45, 0.24 + (i % 5) * 0.025));
    });
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [items]);
  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, items.length]} frustumCulled={false}>
      {/* a disc with a notch cut out, as a lily pad has */}
      <circleGeometry args={[1, 14, 0.35, Math.PI * 2 - 0.7]} />
      <meshStandardMaterial roughness={0.6} side={THREE.DoubleSide} />
    </instancedMesh>
  );
}

// ─── villages ───

type Box = { p: [number, number, number]; s: [number, number, number]; turn: number; color: string };

/** Mud-brick houses: flat roofs with a parapet, a second storey here and there, dark doors and slit windows on the river side. */
function Villages({ river }: { river: River }) {
  const walls = useRef<THREE.InstancedMesh>(null);
  const holes = useRef<THREE.InstancedMesh>(null);
  const cloths = useRef<THREE.InstancedMesh>(null);
  const silos = useRef<THREE.InstancedMesh>(null);
  const { bodies, openings, awnings, granaries } = useMemo(() => {
    const r = rng(river.seed + 1812);
    const awnings: Box[] = [];
    const granaries: Box[] = [];
    const dyes = ["#b3402a", "#2f6f8f", "#e9dfc6", "#c98a2b", "#7a3b5a"];
    const bodies: Box[] = [];
    const openings: Box[] = [];
    const tones = ["#d8b98a", "#c9a877", "#e6d2a8", "#b8935f", "#dcc08f"];
    for (const [side, zc] of river.villages) {
      const n = 5 + Math.floor(r() * 3);
      for (let i = 0; i < n; i++) {
        const z = zc + (i - n / 2) * 7.5 + (r() - 0.5) * 3;
        const inland = 8 + r() * 15;
        const [x, y] = river.spot(side, z, inland);
        const w = 4 + r() * 2.6;
        const d = 4 + r() * 2.6;
        const h = 2.8 + r() * 1.4;
        const turn = (r() - 0.5) * 0.5;
        const color = tones[Math.floor(r() * tones.length)];
        bodies.push({ p: [x, y - 0.3, z], s: [w, h + 0.3, d], turn, color });
        bodies.push({ p: [x, y + h - 0.05, z], s: [w + 0.3, 0.42, d + 0.3], turn, color });
        if (r() < 0.4) bodies.push({ p: [x + side * w * 0.18, y + h, z + d * 0.15], s: [w * 0.55, 2.3, d * 0.6], turn, color });
        // the side that looks at the river
        const fx = x - side * (w / 2 + 0.02) * Math.cos(turn);
        const fz = z + side * (w / 2 + 0.02) * Math.sin(turn);
        openings.push({ p: [fx, y, fz - 0.6], s: [0.12, 1.9, 0.95], turn, color: "#1d130a" });
        openings.push({ p: [fx, y + h * 0.58, fz + d * 0.22], s: [0.12, 0.62, 0.34], turn, color: "#1d130a" });
        if (r() < 0.6) openings.push({ p: [fx, y + h * 0.58, fz - d * 0.3], s: [0.12, 0.62, 0.34], turn, color: "#1d130a" });
        // a dyed cloth stretched over the door for shade, on two poles
        if (r() < 0.55) {
          awnings.push({ p: [fx - side * 1.1, y + 2.15, fz - 0.6], s: [2.2, 0.06, 2.4], turn, color: dyes[Math.floor(r() * dyes.length)] });
          for (const k of [-1, 1]) bodies.push({ p: [fx - side * 2.1, y, fz - 0.6 + k * 1.05], s: [0.09, 2.15, 0.09], turn, color: "#6b4a2c" });
        }
        // beehive granaries in the yard, whitewashed, as in the tomb models
        if (r() < 0.5) {
          const gn = 1 + Math.floor(r() * 3);
          for (let k = 0; k < gn; k++) {
            const gx = x + side * (w / 2 + 1.4 + k * 0.2);
            const gz = z + d / 2 + 1.2 + k * 1.9;
            const gh = 2.4 + r() * 0.8;
            granaries.push({ p: [gx, river.bankY(gx, gz) - gh * 0.27, gz], s: [1.5 + r() * 0.4, gh, 1.5 + r() * 0.4], turn: 0, color: r() < 0.5 ? "#efe6d0" : "#e2d2ae" });
          }
        }
      }
      // a low mud wall along the river side of the village, broken where the path comes through
      for (let k = -2; k <= 2; k++) {
        if (k === 0) continue;
        const z = zc + k * 8.5;
        const [x, y] = river.spot(side, z, 5.2);
        bodies.push({ p: [x, y - 0.2, z], s: [0.5, 1.1, 7.6], turn: 0, color: "#b8935f" });
      }
    }
    return { bodies, openings, awnings, granaries };
  }, [river]);
  useLayoutEffect(() => {
    const o = new THREE.Object3D();
    const c = new THREE.Color();
    for (const [mesh, list] of [
      [walls.current, bodies],
      [holes.current, openings],
      [cloths.current, awnings],
      [silos.current, granaries],
    ] as const) {
      if (!mesh) continue;
      list.forEach((b, i) => {
        o.position.set(b.p[0], b.p[1] + b.s[1] / 2, b.p[2]);
        o.rotation.set(0, b.turn, 0);
        o.scale.set(...b.s);
        o.updateMatrix();
        mesh.setMatrixAt(i, o.matrix);
        mesh.setColorAt(i, c.set(b.color));
      });
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    }
  }, [bodies, openings, awnings, granaries]);
  return (
    <>
      <instancedMesh ref={walls} args={[undefined, undefined, bodies.length]} castShadow receiveShadow frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={0.95} />
      </instancedMesh>
      <instancedMesh ref={holes} args={[undefined, undefined, openings.length]} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={1} />
      </instancedMesh>
      <instancedMesh ref={cloths} args={[undefined, undefined, Math.max(1, awnings.length)]} castShadow frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={0.9} />
      </instancedMesh>
      <instancedMesh ref={silos} args={[undefined, undefined, Math.max(1, granaries.length)]} castShadow receiveShadow frustumCulled={false}>
        {/* a dome on a drum; the matrix stands it on the ground */}
        <capsuleGeometry args={[0.5, 0.5, 6, 14]} />
        <meshStandardMaterial roughness={0.9} />
      </instancedMesh>
    </>
  );
}

// ─── stonework ───

/** A colonnade along the water with a landing stage: what a New Kingdom traveller tied up at. */
function Temple({ side, z, tex, river }: { side: number; z: number; tex: GameTextures; river: River }) {
  const { spot } = river;
  const [x0, y0] = spot(side, z, 17);
  const base = y0 + 0.9;
  const len = 50;
  const geo = useMemo(
    () => ({
      platform: worldBox(16, 3.2, len + 6, 4),
      architrave: worldBox(2.2, 1.1, len - 2, 4),
      wall: worldBox(2, 9.5, len, 5),
      step: worldBox(1.3, 0.5, 9, 3),
    }),
    [],
  );
  const relief = useMemo(() => {
    const map = tex.relief.map.clone();
    const normalMap = tex.relief.normalMap.clone();
    for (const t of [map, normalMap]) {
      t.repeat.set(1, 1);
      t.needsUpdate = true;
    }
    return { map, normalMap };
  }, [tex]);
  const columns = [-21, -14, -7, 0, 7, 14, 21];
  const front = x0 - side * 5.5;
  return (
    <group>
      <mesh geometry={geo.platform} position={[x0, base - 1.6, z]} castShadow receiveShadow>
        <meshStandardMaterial map={tex.limestone.map} normalMap={tex.limestone.normalMap} roughness={0.85} color="#f6e6c4" />
      </mesh>
      {columns.map((dz) => (
        <Column key={dz} position={[front, base, z + dz]} height={7} tex={tex} />
      ))}
      <mesh geometry={geo.architrave} position={[front, base + 9.5, z]} castShadow receiveShadow>
        <meshStandardMaterial map={tex.limestone.map} normalMap={tex.limestone.normalMap} roughness={0.85} color="#f2e2be" />
      </mesh>
      <mesh position={[front, base + 10.16, z]}>
        <boxGeometry args={[2.5, 0.22, len - 1.6]} />
        <meshStandardMaterial color="#1f8f8a" roughness={0.5} />
      </mesh>
      <mesh geometry={geo.wall} position={[x0 + side * 5.5, base + 4.75, z]} castShadow receiveShadow>
        <meshStandardMaterial {...relief} roughness={0.85} color="#f4dcae" normalScale={new THREE.Vector2(1.3, 1.3)} />
      </mesh>
      {/* steps down to the water, an obelisk either side, fire bowls at the top */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <mesh key={i} geometry={geo.step} position={[x0 - side * (8.4 + i * 1.25), base - 0.25 - i * 0.5, z]} receiveShadow castShadow>
          <meshStandardMaterial map={tex.limestone.map} roughness={0.9} color="#efdfbc" />
        </mesh>
      ))}
      <Obelisk position={[x0 - side * 10.5, WATER_Y - 0.5, z - 8.5]} height={15} tex={tex} />
      <Obelisk position={[x0 - side * 10.5, WATER_Y - 0.5, z + 8.5]} height={15} tex={tex} />
      <Brazier position={[x0 - side * 7.2, base, z - 5.6]} />
      <Brazier position={[x0 - side * 7.2, base, z + 5.6]} />
    </group>
  );
}

/** Lions couched either side of a paved way, from the water up to a small shrine. */
function SphinxAvenue({ side, z, tex, river }: { side: number; z: number; tex: GameTextures; river: River }) {
  const { spot } = river;
  const pairs = [4, 10, 16, 22];
  const [sx, sy] = spot(side, z, 30);
  const pylon = useMemo(() => faceted(new THREE.CylinderGeometry(0.84, 1, 1, 4, 1).rotateY(Math.PI / 4)), []);
  const [mx, my] = spot(side, z, 14);
  return (
    <group>
      <mesh position={[mx, my + 0.05, z]} receiveShadow>
        <boxGeometry args={[26, 0.2, 4.2]} />
        <meshStandardMaterial map={tex.limestone.map} roughness={0.9} color="#ecdcb8" />
      </mesh>
      <Suspense fallback={null}>
        {pairs.map((d) =>
          [-1, 1].map((k) => {
            const [x, y] = spot(side, z, d);
            return (
              <group key={`${d}${k}`} position={[x, y, z + k * 3.6]}>
                <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
                  <boxGeometry args={[1.5, 0.9, 3]} />
                  <meshStandardMaterial map={tex.sandstone.map} roughness={0.9} />
                </mesh>
                <Model url="/models/signs/lion.glb" size={2.7} position={[0, 0.9, 0]} rotation={k === -1 ? 0 : Math.PI} />
              </group>
            );
          }),
        )}
      </Suspense>
      {/* the shrine at the head of the avenue */}
      <group position={[sx, sy, z]} rotation={[0, side === -1 ? Math.PI / 2 : -Math.PI / 2, 0]}>
        {[-1, 1].map((k) => (
          <mesh key={k} geometry={pylon} position={[k * 3.6, 3.6, 0]} scale={[3.4, 7.2, 1.7]} castShadow receiveShadow>
            <meshStandardMaterial map={tex.relief.map} normalMap={tex.relief.normalMap} roughness={0.85} color="#f4dcae" />
          </mesh>
        ))}
        <mesh position={[0, 5.1, 0]} castShadow>
          <boxGeometry args={[3.2, 1.2, 1.9]} />
          <meshStandardMaterial map={tex.limestone.map} roughness={0.85} color="#f2e2be" />
        </mesh>
        <mesh position={[0, 2.25, -0.3]}>
          <planeGeometry args={[2.6, 4.5]} />
          <meshBasicMaterial color="#07090a" />
        </mesh>
        <mesh position={[0, 5.1, 1.0]}>
          <sphereGeometry args={[0.36, 20, 14]} />
          <meshStandardMaterial color="#e2b23e" metalness={1} roughness={0.2} emissive="#ff8a1a" emissiveIntensity={1.4} />
        </mesh>
      </group>
    </group>
  );
}

/** A king on his throne, hands on his knees, eleven metres of him, looking at the river. Built of blocks, as the real ones are. */
function Colossus({ side, z, tex, river }: { side: number; z: number; tex: GameTextures; river: River }) {
  const { spot } = river;
  const [x, y] = spot(side, z, 11);
  const stone = <meshStandardMaterial map={tex.sandstone.map} normalMap={tex.sandstone.normalMap} roughness={0.95} color="#e9c898" />;
  // modelled looking along +Z, then turned to face the water
  const parts: { p: [number, number, number]; s: [number, number, number] }[] = [
    { p: [0, 0.6, 0], s: [4.4, 1.2, 6.2] }, // the base
    { p: [0, 2.5, -1.2], s: [3.6, 2.6, 3.2] }, // the throne
    { p: [0, 5.6, -2.3], s: [3.4, 3.8, 0.9] }, // its back
    { p: [-0.85, 2.7, 1.5], s: [1.1, 3.0, 1.2] }, // lower legs
    { p: [0.85, 2.7, 1.5], s: [1.1, 3.0, 1.2] },
    { p: [0, 4.35, 0.5], s: [3.0, 0.9, 3.2] }, // the lap, hands on the knees
    { p: [0, 6.6, -1.1], s: [3.0, 3.6, 1.7] }, // the chest
    { p: [-1.85, 6.2, -0.9], s: [0.75, 2.8, 1.1] }, // upper arms
    { p: [1.85, 6.2, -0.9], s: [0.75, 2.8, 1.1] },
    { p: [0, 9.3, -0.95], s: [1.5, 1.8, 1.5] }, // the head
    { p: [0, 9.35, -1.25], s: [2.7, 2.3, 1.2] }, // the headcloth
    { p: [0, 8.35, -0.2], s: [0.5, 1.1, 0.5] }, // the beard
  ];
  return (
    <group position={[x, y - 0.2, z]} rotation={[0, side === -1 ? Math.PI / 2 : -Math.PI / 2, 0]}>
      {parts.map((b, i) => (
        <mesh key={i} position={b.p} castShadow receiveShadow>
          <boxGeometry args={b.s} />
          {stone}
        </mesh>
      ))}
    </group>
  );
}

// ─── working life ───

/** A shaduf: the counterweighted pole that lifted the river into the fields, dipping and rising. */
function Shaduf({ side, z, river }: { side: number; z: number; river: River }) {
  const { spot } = river;
  const lever = useRef<THREE.Group>(null);
  const [x, y] = spot(side, z, 1.6);
  useFrame(({ clock }) => {
    if (lever.current) lever.current.rotation.z = Math.sin(clock.elapsedTime * 0.9 + z) * 0.38 - 0.08;
  });
  const wood = <meshStandardMaterial color="#6b4a2c" roughness={0.9} />;
  return (
    <group position={[x, y, z]} scale={[-side, 1, 1]}>
      {[-0.45, 0.45].map((k) => (
        <mesh key={k} position={[0, 1.7, k]} castShadow>
          <cylinderGeometry args={[0.09, 0.13, 3.4, 8]} />
          {wood}
        </mesh>
      ))}
      <group ref={lever} position={[0, 3.3, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.06, 0.09, 7, 8]} />
          {wood}
        </mesh>
        {/* a lump of mud for a counterweight inland, the bucket on its rope over the water */}
        <mesh position={[-3.3, -0.1, 0]} castShadow>
          <sphereGeometry args={[0.5, 12, 10]} />
          <meshStandardMaterial color="#7a5c38" roughness={1} />
        </mesh>
        <mesh position={[3.4, -1.3, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 2.6, 5]} />
          <meshStandardMaterial color="#cdbb8e" roughness={1} />
        </mesh>
        <mesh position={[3.4, -2.75, 0]} castShadow>
          <cylinderGeometry args={[0.3, 0.2, 0.5, 12]} />
          <meshStandardMaterial color="#8a5a36" roughness={0.9} />
        </mesh>
      </group>
    </group>
  );
}

/** A landing stage with boats tied up, rocking on the wash. */
function Quay({ side, z, tex, river }: { side: number; z: number; tex: GameTextures; river: River }) {
  const x = river.centre(z) + side * (river.waterline(z) - 0.5);
  const a = useRef<THREE.Group>(null);
  const b = useRef<THREE.Group>(null);
  const boatA = useFitted("/models/objects/boat.glb", 5.2);
  const boatB = useFitted("/models/objects/boat.glb", 4.2);
  const geo = useMemo(() => worldBox(7, 2.6, 16, 3.4), []);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (a.current) a.current.rotation.set(Math.sin(t * 1.1) * 0.04, Math.PI / 2, Math.sin(t * 0.8) * 0.05);
    if (b.current) b.current.rotation.set(Math.sin(t * 0.9 + 1) * 0.05, Math.PI / 2 + 0.2, Math.sin(t * 1.2) * 0.05);
    if (a.current) a.current.position.y = WATER_Y - 0.3 + Math.sin(t * 1.3) * 0.08;
    if (b.current) b.current.position.y = WATER_Y - 0.3 + Math.sin(t * 1.1 + 2) * 0.08;
  });
  return (
    <group>
      <mesh geometry={geo} position={[x, WATER_Y - 0.4, z]} castShadow receiveShadow>
        <meshStandardMaterial map={tex.limestone.map} normalMap={tex.limestone.normalMap} roughness={0.85} color="#f3e3c2" />
      </mesh>
      <group ref={a} position={[x - side * 4.6, WATER_Y - 0.3, z - 3.5]}>
        <primitive object={boatA} />
      </group>
      <group ref={b} position={[x - side * 4.4, WATER_Y - 0.3, z + 4.4]}>
        <primitive object={boatB} />
      </group>
      <Model shadows={false} url="/models/objects/jar.glb" size={1.1} position={[x + side * 1.2, WATER_Y + 0.9, z - 5]} />
      <Model shadows={false} url="/models/objects/jar.glb" size={0.85} position={[x + side * 2, WATER_Y + 0.9, z - 4]} rotation={1.4} />
      <Model shadows={false} url="/models/objects/jar.glb" size={1} position={[x + side * 1.4, WATER_Y + 0.9, z + 5.6]} rotation={2.2} />
    </group>
  );
}

/** Ibises in a loose skein, crossing the river ahead of the boat again and again. */
function Ibises() {
  const birds = useRef<(THREE.Group | null)[]>([]);
  const wings = useRef<(THREE.Mesh | null)[]>([]);
  const wing = useMemo(() => {
    const g = new THREE.PlaneGeometry(1.5, 0.5, 1, 1);
    g.translate(0.75, 0, 0);
    g.rotateX(-Math.PI / 2);
    return g;
  }, []);
  const n = 9;
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const across = ((t * 7) % 150) - 75;
    for (let i = 0; i < n; i++) {
      const b = birds.current[i];
      if (!b) continue;
      const rank = Math.ceil(i / 2) * (i % 2 === 0 ? 1 : -1);
      b.position.set(across - Math.abs(rank) * 2.6, WATER_Y + 15 + Math.sin(t * 0.7 + i) * 0.6 + Math.abs(rank) * 0.2, playerPos.z - 62 + rank * 2.2);
      const flap = Math.sin(t * 5.5 + i * 0.9) * 0.7;
      const l = wings.current[i * 2];
      const r = wings.current[i * 2 + 1];
      if (l) l.rotation.z = flap;
      if (r) r.rotation.z = Math.PI - flap;
    }
  });
  return (
    <>
      {Array.from({ length: n }, (_, i) => (
        <group
          key={i}
          ref={(g) => {
            birds.current[i] = g;
          }}
        >
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <capsuleGeometry args={[0.13, 0.9, 4, 8]} />
            <meshStandardMaterial color="#f4efe2" roughness={0.8} />
          </mesh>
          <mesh position={[0.95, -0.08, 0]} rotation={[0, 0, Math.PI / 2 - 0.35]}>
            <coneGeometry args={[0.05, 0.6, 6]} />
            <meshStandardMaterial color="#1c1712" roughness={0.6} />
          </mesh>
          {[0, 1].map((k) => (
            <mesh
              key={k}
              geometry={wing}
              rotation={[0, k === 0 ? Math.PI / 2 : -Math.PI / 2, 0]}
              ref={(m) => {
                wings.current[i * 2 + k] = m;
              }}
            >
              <meshStandardMaterial color={k === 0 ? "#f4efe2" : "#efe9da"} roughness={0.8} side={THREE.DoubleSide} />
            </mesh>
          ))}
        </group>
      ))}
    </>
  );
}

// ─── the smaller things that make a bank look lived on ───

/** Sycamore figs and acacias among the fields: a short forked trunk under a broad, lumpy crown. */
function FieldTrees({ river }: { river: River }) {
  const trunks = useRef<THREE.InstancedMesh>(null);
  const crowns = useRef<THREE.InstancedMesh>(null);
  const { stems, lumps } = useMemo(() => {
    const r = rng(river.seed + 5119);
    const stems: { p: [number, number, number]; h: number; w: number; lean: number; turn: number }[] = [];
    const lumps: { p: [number, number, number]; s: [number, number, number]; tone: number }[] = [];
    for (let i = 0; i < river.trees; i++) {
      const side = r() < 0.5 ? -1 : 1;
      const z = river.zFrom - 10 - r() * (river.zFrom - river.zTo - 20);
      const [x, y] = river.spot(side, z, 6 + r() * 24);
      const h = 2.2 + r() * 1.6;
      const acacia = r() < 0.4;
      stems.push({ p: [x, y - 0.2, z], h, w: 0.22 + r() * 0.16, lean: (r() - 0.5) * 0.3, turn: r() * 6.28 });
      // an acacia is a flat umbrella; a sycamore fig is a heap of rounded masses
      const n = acacia ? 3 : 5 + Math.floor(r() * 3);
      const spread = acacia ? 2.6 : 1.7;
      for (let k = 0; k < n; k++) {
        const a = r() * 6.28;
        const d = r() * spread;
        const s = (acacia ? 1.5 : 1.3) + r() * 0.9;
        lumps.push({ p: [x + Math.cos(a) * d, y + h + (acacia ? 0.2 : 0.5 + r() * 1.3), z + Math.sin(a) * d], s: [s * 1.25, s * (acacia ? 0.42 : 0.85), s * 1.25], tone: r() });
      }
    }
    return { stems, lumps };
  }, [river]);
  useLayoutEffect(() => {
    const o = new THREE.Object3D();
    const c = new THREE.Color();
    const t = trunks.current;
    if (t) {
      stems.forEach((it, i) => {
        o.position.set(it.p[0], it.p[1] + it.h / 2, it.p[2]);
        o.rotation.set(it.lean, it.turn, it.lean * 0.5);
        o.scale.set(it.w * 2, it.h + 0.6, it.w * 2);
        o.updateMatrix();
        t.setMatrixAt(i, o.matrix);
      });
      t.instanceMatrix.needsUpdate = true;
    }
    const m = crowns.current;
    if (m) {
      lumps.forEach((it, i) => {
        o.position.set(...it.p);
        o.rotation.set(0, it.tone * 6.28, 0);
        o.scale.set(...it.s);
        o.updateMatrix();
        m.setMatrixAt(i, o.matrix);
        m.setColorAt(i, c.setHSL(0.24 + it.tone * 0.06, 0.42, 0.17 + it.tone * 0.1));
      });
      m.instanceMatrix.needsUpdate = true;
      if (m.instanceColor) m.instanceColor.needsUpdate = true;
    }
  }, [stems, lumps]);
  return (
    <>
      <instancedMesh ref={trunks} args={[undefined, undefined, Math.max(1, stems.length)]} castShadow frustumCulled={false}>
        <cylinderGeometry args={[0.32, 0.5, 1, 7]} />
        <meshStandardMaterial color="#5d4228" roughness={1} />
      </instancedMesh>
      <instancedMesh ref={crowns} args={[undefined, undefined, Math.max(1, lumps.length)]} castShadow receiveShadow frustumCulled={false}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial roughness={0.95} flatShading />
      </instancedMesh>
    </>
  );
}

/** The harvest: heaps of threshed grain on a beaten floor at the edge of a village, gold in the low sun. */
function GrainHeaps({ river }: { river: River }) {
  const heaps = useRef<THREE.InstancedMesh>(null);
  const items = useMemo(() => {
    const r = rng(river.seed + 3301);
    const out: { p: [number, number, number]; s: number }[] = [];
    for (const [side, zc] of river.villages) {
      const z0 = zc + (r() < 0.5 ? -1 : 1) * (24 + r() * 6);
      const inland = 9 + r() * 8;
      const n = 3 + Math.floor(r() * 4);
      for (let i = 0; i < n; i++) {
        const [x, y, z] = river.spot(side, z0 + (r() - 0.5) * 7, inland + (r() - 0.5) * 6);
        out.push({ p: [x, y, z], s: 0.9 + r() * 1.1 });
      }
    }
    return out;
  }, [river]);
  useLayoutEffect(() => {
    const m = heaps.current;
    if (!m) return;
    const o = new THREE.Object3D();
    items.forEach((it, i) => {
      o.position.set(it.p[0], it.p[1] + it.s * 0.4, it.p[2]);
      o.scale.set(it.s * 1.3, it.s * 0.9, it.s * 1.3);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  }, [items]);
  return (
    <instancedMesh ref={heaps} args={[undefined, undefined, Math.max(1, items.length)]} castShadow receiveShadow frustumCulled={false}>
      <coneGeometry args={[1, 1, 14]} />
      <meshStandardMaterial color="#e0b04c" roughness={1} />
    </instancedMesh>
  );
}

/** A papyrus skiff: a bundle of reeds lashed tight, both ends drawn up, a pole left standing in it. Rocks on the wash among the reeds. */
function Skiff({ side, z, river }: { side: number; z: number; river: River }) {
  const ref = useRef<THREE.Group>(null);
  const x = river.centre(z) + side * (river.waterline(z) - 3.4);
  const hull = useMemo(() => {
    const g = new THREE.CapsuleGeometry(0.36, 3.6, 5, 10);
    g.rotateZ(Math.PI / 2);
    const pos = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const t = pos.getX(i) / 2.16;
      // drawn up at both ends and pinched to a point, flattened on top where the fisherman sits
      const pinch = 1 - 0.72 * t * t;
      pos.setXYZ(i, pos.getX(i), Math.min(pos.getY(i) * pinch, 0.12) + t * t * t * t * 1.15, pos.getZ(i) * pinch * 1.5);
    }
    g.computeVertexNormals();
    return g;
  }, []);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (!ref.current) return;
    ref.current.position.y = WATER_Y + 0.05 + Math.sin(t * 1.2 + z) * 0.05;
    ref.current.rotation.set(Math.sin(t * 0.9 + z) * 0.05, z * 0.7, Math.sin(t * 1.1 + z * 2) * 0.03);
  });
  return (
    <group ref={ref} position={[x, WATER_Y + 0.05, z]}>
      <mesh geometry={hull} castShadow receiveShadow>
        <meshStandardMaterial color="#a8a05a" roughness={0.95} />
      </mesh>
      <mesh position={[0.4, 1.1, 0.1]} rotation={[0.12, 0, -0.2]} castShadow>
        <cylinderGeometry args={[0.025, 0.035, 2.6, 6]} />
        <meshStandardMaterial color="#6b4a2c" roughness={0.9} />
      </mesh>
      {/* the catch, in a basket */}
      <mesh position={[-0.7, 0.26, 0]} castShadow>
        <cylinderGeometry args={[0.24, 0.18, 0.3, 10]} />
        <meshStandardMaterial color="#9a7440" roughness={1} />
      </mesh>
    </group>
  );
}

/** Egrets standing in the shallows, each on its own patch, dipping now and then for a fish. */
function Egrets({ river }: { river: River }) {
  const necks = useRef<(THREE.Group | null)[]>([]);
  const birds = useMemo(() => {
    const r = rng(river.seed + 8087);
    return Array.from({ length: river.egrets }, () => {
      const side = r() < 0.5 ? -1 : 1;
      const z = river.zFrom - 20 - r() * (river.zFrom - river.zTo - 60);
      const x = river.centre(z) + side * (river.waterline(z) - 0.9 - r() * 1.6);
      return { x, z, turn: r() * 6.28, phase: r() * 20, s: 0.85 + r() * 0.3 };
    });
  }, [river]);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    birds.forEach((b, i) => {
      const n = necks.current[i];
      if (!n) return;
      // upright most of the time; a quick stab at the water every dozen seconds or so
      const cycle = (t + b.phase) % 12;
      const dip = cycle < 1.2 ? Math.sin((cycle / 1.2) * Math.PI) : 0;
      n.rotation.z = -0.15 - dip * 1.5;
    });
  });
  const white = <meshStandardMaterial color="#f6f2e6" roughness={0.8} />;
  return (
    <>
      {birds.map((b, i) => (
        <group key={i} position={[b.x, WATER_Y, b.z]} rotation={[0, b.turn, 0]} scale={b.s}>
          {[-0.05, 0.05].map((k) => (
            <mesh key={k} position={[0, 0.22, k]}>
              <cylinderGeometry args={[0.012, 0.012, 0.75, 5]} />
              <meshStandardMaterial color="#2a241c" roughness={0.8} />
            </mesh>
          ))}
          <mesh position={[0, 0.66, 0]} rotation={[0, 0, 0.5]} scale={[1.5, 0.8, 0.8]} castShadow>
            <sphereGeometry args={[0.17, 10, 8]} />
            {white}
          </mesh>
          <group
            position={[0.17, 0.74, 0]}
            ref={(g) => {
              necks.current[i] = g;
            }}
          >
            <mesh position={[0, 0.2, 0]}>
              <cylinderGeometry args={[0.028, 0.045, 0.42, 6]} />
              {white}
            </mesh>
            <mesh position={[0.03, 0.43, 0]} scale={[1.3, 0.9, 0.9]}>
              <sphereGeometry args={[0.06, 8, 6]} />
              {white}
            </mesh>
            <mesh position={[0.17, 0.42, 0]} rotation={[0, 0, -Math.PI / 2]}>
              <coneGeometry args={[0.022, 0.22, 5]} />
              <meshStandardMaterial color="#e0a526" roughness={0.6} />
            </mesh>
          </group>
        </group>
      ))}
    </>
  );
}

/** Cooking smoke over each village: a few soft puffs climbing and thinning on the evening air. */
function Smoke({ river }: { river: River }) {
  const puffs = useRef<(THREE.Sprite | null)[]>([]);
  const PER = 7;
  // soft-edged puff: a hard-edged sphere reads as a stack of discs once bloom is on
  const soft = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 64;
    const ctx = c.getContext("2d")!;
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.35, "rgba(255,255,255,0.55)");
    g.addColorStop(0.7, "rgba(255,255,255,0.14)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  }, []);
  useEffect(() => () => soft.dispose(), [soft]);
  const sources = useMemo(() => river.villages.map(([side, z], i) => river.spot(side, z + ((i * 7) % 9) - 4, 13 + ((i * 5) % 7))), [river]);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    sources.forEach((src, v) => {
      for (let k = 0; k < PER; k++) {
        const m = puffs.current[v * PER + k];
        if (!m) continue;
        const life = (t * 0.07 + k / PER + v * 0.13) % 1;
        m.position.set(src[0] + life * life * 7 + Math.sin(t * 0.4 + k * 1.7) * 0.5, src[1] + 3.6 + life * 15, src[2] - life * 3);
        m.scale.setScalar(1.1 + life * 4.6);
        m.material.opacity = 0.62 * Math.sin(life * Math.PI) * (1 - life * 0.45);
      }
    });
  });
  return (
    <>
      {sources.flatMap((_, v) =>
        Array.from({ length: PER }, (_, k) => (
          <sprite
            key={`${v}:${k}`}
            ref={(m) => {
              puffs.current[v * PER + k] = m;
            }}
          >
            {/* a grey veil that takes light away from what is behind it (dst × (1 − alpha)): the sky is far brighter than
                white before tone mapping, and a pale puff blended the usual way vanishes into it */}
            <spriteMaterial map={soft} transparent opacity={0} depthWrite={false} fog={false} blending={THREE.CustomBlending} blendSrc={THREE.ZeroFactor} blendDst={THREE.OneMinusSrcAlphaFactor} />
          </sprite>
        )),
      )}
    </>
  );
}

// ─── the lot ───

export default function Riverbanks({ tex, plan = FELUCCA_RIVER }: { tex: GameTextures; plan?: RiverPlan }) {
  const river = useMemo(() => riverOf(plan), [plan]);
  const palms = useMemo(() => {
    const r = rng(river.seed + 613);
    const near: PalmSpot[] = [];
    const far: PalmSpot[] = [];
    // in groves rather than evenly: clumps of a few trees each
    for (let k = 0; k < river.palmClumps; k++) {
      const side = r() < 0.5 ? -1 : 1;
      const zc = river.zFrom - 20 - r() * (river.zFrom - river.zTo - 40);
      const n = 2 + Math.floor(r() * 3);
      for (let i = 0; i < n; i++) {
        const z = zc + (r() - 0.5) * 12;
        const inland = 4 + r() * 14;
        const [x, y] = river.spot(side, z, inland);
        // only the trees by the water are near enough to the course for their shadows to be seen
        (inland < 10 ? near : far).push({ p: [x, y - 0.2, z], seed: 200 + near.length + far.length, s: 0.95 + r() * 0.6 });
      }
    }
    return { near, far };
  }, [river]);
  const at = (side: number, z: number, inland: number): [number, number, number] => {
    const [x, y] = river.spot(side, z, inland);
    return [x, y - 0.3, z];
  };
  return (
    <>
      <Bank side={-1} tex={tex} river={river} />
      <Bank side={1} tex={tex} river={river} />
      <Reeds papyrus={false} river={river} />
      <Reeds papyrus river={river} />
      <LilyPads river={river} />
      <Villages river={river} />
      <FieldTrees river={river} />
      <GrainHeaps river={river} />
      <Egrets river={river} />
      <Smoke river={river} />
      <PalmStand palms={palms.near} tex={tex} />
      <PalmStand palms={palms.far} tex={tex} shadows={false} />
      {river.temples.map(([side, z]) => (
        <Temple key={z} side={side} z={z} tex={tex} river={river} />
      ))}
      {river.avenues.map(([side, z]) => (
        <SphinxAvenue key={z} side={side} z={z} tex={tex} river={river} />
      ))}
      {river.colossi.map(([side, z]) => (
        <Colossus key={z} side={side} z={z} tex={tex} river={river} />
      ))}
      {river.shadufs.map(([side, z]) => (
        <Shaduf key={z} side={side} z={z} river={river} />
      ))}
      {river.skiffs.map(([side, z]) => (
        <Skiff key={z} side={side} z={z} river={river} />
      ))}
      <Suspense fallback={null}>
        {river.quays.map(([side, z]) => (
          <Quay key={z} side={side} z={z} tex={tex} river={river} />
        ))}
        {river.animals.map((a, i) => (
          <Model key={i} url={a.url} size={a.size} position={river.spot(a.side, a.z, a.inland)} rotation={a.turn} shadows={a.size > 1.5} />
        ))}
      </Suspense>
      {river.obelisks.flatMap((z) => [-1, 1].map((side) => <Obelisk key={`${z}:${side}`} position={at(side, z, 7)} height={13} tex={tex} />))}
      <Ibises />
    </>
  );
}

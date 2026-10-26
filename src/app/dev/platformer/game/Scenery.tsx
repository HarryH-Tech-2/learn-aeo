"use client";

/**
 * Everything you cannot stand on: dunes and the river banks, the pyramids in
 * the haze, palms, obelisks, braziers, the temple gate, and a felucca on the river.
 */
import { Suspense, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Sparkles, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { faceted, type GameTextures } from "./textures";
import { GATE, WATER_Y, type Vec3 } from "./course";
import { game } from "./store";
import { allDone } from "./lesson";

// ─── helpers ───

function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function vnoise(x: number, y: number): number {
  const h = (a: number, b: number) => {
    let n = (a * 374761393 + b * 668265263) | 0;
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  };
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  return h(xi, yi) * (1 - u) * (1 - v) + h(xi + 1, yi) * u * (1 - v) + h(xi, yi + 1) * (1 - u) * v + h(xi + 1, yi + 1) * u * v;
}

/** The river runs straight past the course, then bends away to the right towards the horizon. */
export function riverCentre(z: number): number {
  return z > -170 ? 0 : ((z + 170) / 100) ** 2 * 34;
}

export function groundHeight(x: number, z: number): number {
  const off = Math.abs(x - riverCentre(z));
  const bank = THREE.MathUtils.smoothstep(off, 34, 95);
  const dunes = vnoise(x * 0.011 + 3, z * 0.011) * 0.6 + vnoise(x * 0.031, z * 0.027 + 9) * 0.3 + vnoise(x * 0.09, z * 0.09) * 0.1;
  // ridged so the crests read as wind-cut dunes
  const ridged = 1 - Math.abs(dunes * 2 - 1);
  return WATER_Y - 2.2 + bank * (3.2 + ridged * 17 + dunes * 6);
}

// ─── dunes ───

function Dunes({ tex }: { tex: GameTextures }) {
  const geometry = useMemo(() => {
    const g = new THREE.PlaneGeometry(1800, 1800, 200, 200);
    g.rotateX(-Math.PI / 2);
    g.translate(0, 0, -300);
    const pos = g.attributes.position as THREE.BufferAttribute;
    const colors = new Float32Array(pos.count * 3);
    const lo = new THREE.Color("#b9813f");
    const hi = new THREE.Color("#f0c486");
    const c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const y = groundHeight(x, z);
      pos.setY(i, y);
      c.copy(lo).lerp(hi, THREE.MathUtils.clamp((y - WATER_Y) / 20, 0, 1));
      colors.set([c.r, c.g, c.b], i * 3);
    }
    g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    g.computeVertexNormals();
    return g;
  }, []);
  const normalMap = useMemo(() => {
    const t = tex.sand.normalMap.clone();
    t.repeat.set(260, 260);
    t.needsUpdate = true;
    return t;
  }, [tex]);
  return (
    <mesh geometry={geometry} receiveShadow>
      <meshStandardMaterial vertexColors roughness={1} metalness={0} normalMap={normalMap} normalScale={new THREE.Vector2(0.5, 0.5)} />
    </mesh>
  );
}

// ─── pyramids ───

function Pyramids({ tex }: { tex: GameTextures }) {
  const geometry = useMemo(() => faceted(new THREE.ConeGeometry(1, 1, 4, 1).rotateY(Math.PI / 4)), []);
  const sites: { p: [number, number]; base: number; height: number }[] = [
    { p: [-150, -400], base: 118, height: 76 },
    { p: [-262, -470], base: 100, height: 64 },
    { p: [-62, -520], base: 80, height: 52 },
    { p: [230, -330], base: 60, height: 40 },
  ];
  const map = useMemo(() => {
    const t = tex.sandstone.map.clone();
    t.repeat.set(10, 14);
    t.needsUpdate = true;
    return t;
  }, [tex]);
  return (
    <>
      {sites.map((s, i) => (
        <mesh key={i} geometry={geometry} position={[s.p[0], groundHeight(s.p[0], s.p[1]) + s.height / 2 - 2, s.p[1]]} scale={[s.base * 0.71, s.height, s.base * 0.71]}>
          <meshStandardMaterial map={map} color="#f1cf9a" roughness={1} />
        </mesh>
      ))}
    </>
  );
}

// ─── palms ───

function palmGeometry(seed: number) {
  {
    const r = rng(seed);
    const h = 5.5 + r() * 2.5;
    const bend = (r() - 0.5) * 2.4;
    const bendZ = (r() - 0.5) * 1.6;
    const trunk = new THREE.CylinderGeometry(0.13, 0.24, h, 8, 14);
    trunk.translate(0, h / 2, 0);
    const tp = trunk.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < tp.count; i++) {
      const t = tp.getY(i) / h;
      // ringed bark: a slight bulge every so often
      const ring = 1 + Math.sin(t * 46) * 0.05;
      tp.setXYZ(i, tp.getX(i) * ring + bend * t * t, tp.getY(i), tp.getZ(i) * ring + bendZ * t * t);
    }
    trunk.computeVertexNormals();

    const fronds: THREE.BufferGeometry[] = [];
    const n = 11;
    for (let k = 0; k < n; k++) {
      const len = 2.6 + r() * 0.9;
      const f = new THREE.PlaneGeometry(1.25, len, 2, 8);
      f.translate(0, len / 2, 0);
      const fp = f.attributes.position as THREE.BufferAttribute;
      const droop = 0.75 + r() * 0.5;
      for (let i = 0; i < fp.count; i++) {
        const t = fp.getY(i) / len;
        const x = fp.getX(i);
        // fold along the rib and let the tip hang
        fp.setZ(i, -Math.abs(x) * 0.45 - droop * t * t * len * 0.42);
        fp.setY(i, fp.getY(i) * (1 - 0.18 * t * t));
      }
      const tilt = k < 4 ? 0.35 + r() * 0.2 : 0.9 + r() * 0.5;
      f.rotateX(tilt);
      f.rotateY((k / n) * Math.PI * 2 + r() * 0.4);
      f.translate(bend, h - 0.1, bendZ);
      f.computeVertexNormals();
      fronds.push(f);
    }
    return { trunk, crown: mergeGeometries(fronds)! };
  }
}

function usePalmGeometry(seed: number) {
  return useMemo(() => palmGeometry(seed), [seed]);
}

export function Palm({ position, seed, scale = 1, tex }: { position: [number, number, number]; seed: number; scale?: number; tex: GameTextures }) {
  const { trunk, crown } = usePalmGeometry(seed);
  return (
    <group position={position} scale={scale} rotation={[0, seed, 0]}>
      <mesh geometry={trunk} castShadow receiveShadow>
        <meshStandardMaterial color="#7a5a3a" roughness={1} />
      </mesh>
      <mesh geometry={crown} castShadow>
        <meshStandardMaterial map={tex.frond} alphaTest={0.45} side={THREE.DoubleSide} roughness={0.85} color="#dfe8b8" />
      </mesh>
    </group>
  );
}

export type PalmSpot = { p: [number, number, number]; seed: number; s: number };

const PALM_SHAPES = 6;

/**
 * Many palms for the price of a few: six shapes of tree, each drawn once for
 * every palm that has it (a palm of its own is two draw calls, and two more
 * in the shadow pass). `shadows` is for the stands near enough to the course
 * for their shadows to be seen.
 */
export function PalmStand({ palms, tex, shadows = true }: { palms: PalmSpot[]; tex: GameTextures; shadows?: boolean }) {
  const shapes = useMemo(() => Array.from({ length: PALM_SHAPES }, (_, k) => palmGeometry(k + 1)), []);
  useEffect(() => () => shapes.forEach((g) => (g.trunk.dispose(), g.crown.dispose())), [shapes]);
  const byShape = useMemo(() => shapes.map((_, k) => palms.filter((p) => p.seed % PALM_SHAPES === k)), [shapes, palms]);
  const trunks = useRef<(THREE.InstancedMesh | null)[]>([]);
  const crowns = useRef<(THREE.InstancedMesh | null)[]>([]);
  useLayoutEffect(() => {
    const o = new THREE.Object3D();
    byShape.forEach((list, k) => {
      for (const m of [trunks.current[k], crowns.current[k]]) {
        if (!m) continue;
        list.forEach((p, i) => {
          o.position.set(...p.p);
          o.rotation.set(0, p.seed, 0);
          o.scale.setScalar(p.s);
          o.updateMatrix();
          m.setMatrixAt(i, o.matrix);
        });
        m.instanceMatrix.needsUpdate = true;
      }
    });
  }, [byShape]);
  return (
    <>
      {byShape.map((list, k) =>
        list.length === 0 ? null : (
          <group key={`${k}:${list.length}`}>
            <instancedMesh ref={(m) => void (trunks.current[k] = m)} args={[shapes[k].trunk, undefined, list.length]} castShadow={shadows} receiveShadow frustumCulled={false}>
              <meshStandardMaterial color="#7a5a3a" roughness={1} />
            </instancedMesh>
            <instancedMesh ref={(m) => void (crowns.current[k] = m)} args={[shapes[k].crown, undefined, list.length]} castShadow={shadows} frustumCulled={false}>
              <meshStandardMaterial map={tex.frond} alphaTest={0.45} side={THREE.DoubleSide} roughness={0.85} color="#dfe8b8" />
            </instancedMesh>
          </group>
        ),
      )}
    </>
  );
}

function PalmGroves({ tex }: { tex: GameTextures }) {
  const palms = useMemo(() => {
    const r = rng(77);
    const out: PalmSpot[] = [];
    for (let i = 0; i < 46; i++) {
      const z = 30 - r() * 300;
      const side = r() < 0.5 ? -1 : 1;
      const x = riverCentre(z) + side * (37 + r() * 22);
      out.push({ p: [x, groundHeight(x, z) - 0.2, z], seed: i + 1, s: 1 + r() * 0.7 });
    }
    return out;
  }, []);
  // (these stand beyond the reach of the sun's shadow box)
  return <PalmStand palms={palms} tex={tex} shadows={false} />;
}

// ─── stonework ───

export function Obelisk({ position, height = 9, tex }: { position: [number, number, number]; height?: number; tex: GameTextures }) {
  const shaft = useMemo(() => faceted(new THREE.CylinderGeometry(0.42, 0.62, height, 4, 1).rotateY(Math.PI / 4)), [height]);
  const cap = useMemo(() => faceted(new THREE.ConeGeometry(0.42, 0.85, 4, 1).rotateY(Math.PI / 4)), []);
  const maps = useMemo(() => {
    const map = tex.band.map.clone();
    const normalMap = tex.band.normalMap.clone();
    for (const t of [map, normalMap]) {
      // turn the band on end: one column of signs up each face
      t.center.set(0.5, 0.5);
      t.rotation = Math.PI / 2;
      t.repeat.set(height / 5.6, 4);
      t.needsUpdate = true;
    }
    return { map, normalMap };
  }, [tex, height]);
  return (
    <group position={position}>
      <mesh geometry={shaft} position={[0, height / 2, 0]} castShadow receiveShadow>
        <meshStandardMaterial {...maps} roughness={0.85} color="#f3d9ad" />
      </mesh>
      <mesh geometry={cap} position={[0, height + 0.42, 0]} castShadow>
        <meshStandardMaterial color="#e2b23e" metalness={1} roughness={0.22} emissive="#ff9a1f" emissiveIntensity={0.25} />
      </mesh>
      <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 0.4, 1.6]} />
        <meshStandardMaterial map={tex.limestone.map} normalMap={tex.limestone.normalMap} roughness={0.9} />
      </mesh>
    </group>
  );
}

/** A fire bowl. `lit` braziers carry a real light; the rest only glow, to keep the light count down. */
export function Brazier({ position, lit = true }: { position: [number, number, number]; lit?: boolean }) {
  const light = useRef<THREE.PointLight>(null);
  const flame = useRef<THREE.Group>(null);
  const bowl = useMemo(() => {
    const pts = [
      [0.0, 0.0],
      [0.22, 0.0],
      [0.3, 0.05],
      [0.46, 0.22],
      [0.5, 0.34],
      [0.44, 0.34],
      [0.0, 0.2],
    ].map(([x, y]) => new THREE.Vector2(x, y));
    return new THREE.LatheGeometry(pts, 20);
  }, []);
  const seed = position[0] * 1.7 + position[2];
  useFrame(({ clock }) => {
    const t = clock.elapsedTime * 9 + seed;
    const f = 0.82 + Math.sin(t) * 0.09 + Math.sin(t * 2.3 + 1) * 0.06 + Math.sin(t * 5.1) * 0.03;
    if (light.current) light.current.intensity = 26 * f;
    if (flame.current) {
      flame.current.scale.set(0.95 + (f - 0.8) * 0.8, 0.85 + (f - 0.8) * 2.4, 0.95 + (f - 0.8) * 0.8);
      flame.current.rotation.y = t * 0.2;
    }
  });
  return (
    <group position={position}>
      <mesh position={[0, 0.55, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.16, 1.1, 8]} />
        <meshStandardMaterial color="#3a2a1c" metalness={0.8} roughness={0.45} />
      </mesh>
      <mesh geometry={bowl} position={[0, 1.08, 0]} castShadow>
        <meshStandardMaterial color="#b8862e" metalness={1} roughness={0.35} side={THREE.DoubleSide} />
      </mesh>
      <group ref={flame} position={[0, 1.36, 0]}>
        <mesh position={[0, 0.3, 0]}>
          <coneGeometry args={[0.3, 0.9, 10, 1, true]} />
          <meshBasicMaterial color={[5.5, 1.5, 0.22]} transparent opacity={0.55} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} toneMapped={false} />
        </mesh>
        <mesh position={[0, 0.2, 0]}>
          <coneGeometry args={[0.18, 0.6, 10, 1, true]} />
          <meshBasicMaterial color={[7, 4.2, 1.2]} transparent opacity={0.8} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} toneMapped={false} />
        </mesh>
      </group>
      <Sparkles count={14} scale={[0.7, 2.4, 0.7]} position={[0, 2.5, 0]} size={5} speed={1.4} color="#ffb35c" opacity={0.9} noise={0.6} />
      {lit && <pointLight ref={light} position={[0, 1.9, 0]} color="#ff8f3d" intensity={26} distance={16} decay={2} />}
    </group>
  );
}

/** A papyrus-bundle column with painted bands under the capital. */
export function Column({ position, height = 6.5, tex }: { position: [number, number, number]; height?: number; tex: GameTextures }) {
  const capital = useMemo(() => {
    const pts = [
      [0.5, 0],
      [0.52, 0.15],
      [0.66, 0.6],
      [0.98, 1.05],
      [1.02, 1.15],
      [0.0, 1.15],
    ].map(([x, y]) => new THREE.Vector2(x, y));
    return new THREE.LatheGeometry(pts, 24);
  }, []);
  const maps = useMemo(() => {
    const map = tex.sandstone.map.clone();
    const normalMap = tex.sandstone.normalMap.clone();
    for (const t of [map, normalMap]) {
      t.repeat.set(2, height / 2);
      t.needsUpdate = true;
    }
    return { map, normalMap };
  }, [tex, height]);
  const bands: [string, number][] = [
    ["#1f8f8a", 0.0],
    ["#d4a832", 0.22],
    ["#a8402c", 0.44],
    ["#d4a832", 0.66],
  ];
  return (
    <group position={position}>
      <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.8, 0.86, 0.4, 24]} />
        <meshStandardMaterial map={tex.limestone.map} roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.4 + height / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.5, 0.6, height, 24]} />
        <meshStandardMaterial {...maps} roughness={0.85} color="#f6dfb8" />
      </mesh>
      {bands.map(([color, y]) => (
        <mesh key={y} position={[0, 0.4 + height - 0.9 + y, 0]}>
          <cylinderGeometry args={[0.535, 0.535, 0.2, 24]} />
          <meshStandardMaterial color={color} roughness={0.55} metalness={color === "#d4a832" ? 0.9 : 0} />
        </mesh>
      ))}
      <mesh geometry={capital} position={[0, 0.4 + height, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#e9d3a6" roughness={0.8} map={tex.limestone.map} />
      </mesh>
      <mesh position={[0, 0.4 + height + 1.3, 0]} castShadow>
        <boxGeometry args={[1.5, 0.3, 1.5]} />
        <meshStandardMaterial map={tex.limestone.map} roughness={0.9} />
      </mesh>
    </group>
  );
}

/** The gate at the end: two battered pylons, a lintel, and a doorway full of light. `at` is the ground in the middle of the doorway. */
export function TempleGate({ tex, at = GATE }: { tex: GameTextures; at?: Vec3 }) {
  const [gx, gy, gz] = at;
  const pylon = useMemo(() => faceted(new THREE.CylinderGeometry(0.82, 1, 1, 4, 1).rotateY(Math.PI / 4)), []);
  const portal = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        uniforms: { uTime: { value: 0 } },
        vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
        fragmentShader: /* glsl */ `
          uniform float uTime; varying vec2 vUv;
          float n(vec2 p){ return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5453); }
          float sn(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f); return mix(mix(n(i),n(i+vec2(1,0)),f.x), mix(n(i+vec2(0,1)),n(i+vec2(1,1)),f.x), f.y); }
          void main(){
            vec2 p = vUv - vec2(0.5, 0.42);
            float a = atan(p.y, p.x); float r = length(p * vec2(1.0, 0.72));
            // angle goes in as (cos, sin): no seam where atan wraps round
            vec2 ring = vec2(cos(a), sin(a));
            float swirl = sn(ring * 1.6 + vec2(r * 7.0 + uTime * 0.5, r * 9.0 - uTime * 1.2));
            float rays = sn(ring * 4.5 + vec2(0.0, uTime * 0.4)) * 0.6 + 0.4;
            float core = smoothstep(0.55, 0.0, r);
            vec3 gold = vec3(1.9, 1.15, 0.32); vec3 teal = vec3(0.06, 0.62, 0.6);
            // dark between the bands, so the swirl survives the bloom
            float bands = smoothstep(0.35, 0.75, swirl);
            vec3 col = mix(teal, gold, core * core) * (0.12 + bands * 1.25) * (0.55 + rays * 0.7);
            col += vec3(2.4, 1.8, 0.9) * pow(core, 5.0);
            float edge = smoothstep(0.5, 0.42, abs(vUv.x - 0.5)) * smoothstep(0.0, 0.05, vUv.y) * smoothstep(1.0, 0.93, vUv.y);
            gl_FragColor = vec4(col, edge * (0.55 + core * 0.45));
          }`,
      }),
    [],
  );
  const glow = useRef<THREE.PointLight>(null);
  const lit = useRef(0);
  useFrame(({ clock }, dt) => {
    portal.uniforms.uTime.value = clock.elapsedTime;
    // the doorway only shines out once the word has opened the stone door in front of it
    const lesson = game.get().lesson;
    const open = !lesson || allDone(lesson, lesson.progress, lesson.reviewed);
    lit.current = THREE.MathUtils.damp(lit.current, open ? 1 : 0, 1.2, Math.min(dt, 0.1));
    if (glow.current) glow.current.intensity = (42 + Math.sin(clock.elapsedTime * 2.1) * 8) * lit.current;
  });
  const reliefMaps = useMemo(() => {
    const map = tex.relief.map.clone();
    const normalMap = tex.relief.normalMap.clone();
    for (const t of [map, normalMap]) {
      t.repeat.set(4, 1.4);
      t.needsUpdate = true;
    }
    return { map, normalMap };
  }, [tex]);
  const H = 11;
  return (
    <group position={[gx, gy, gz]}>
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 5.4, 0, 0]}>
          <mesh geometry={pylon} position={[0, H / 2, 0]} scale={[4.6, H, 1.9]} castShadow receiveShadow>
            <meshStandardMaterial {...reliefMaps} roughness={0.85} color="#f4dcae" normalScale={new THREE.Vector2(1.4, 1.4)} />
          </mesh>
          {/* cavetto cornice */}
          <mesh position={[0, H + 0.25, 0]} castShadow>
            <boxGeometry args={[5.9, 0.5, 3]} />
            <meshStandardMaterial map={tex.limestone.map} roughness={0.85} color="#f2e2be" />
          </mesh>
          <mesh position={[0, H - 0.12, 0]}>
            <boxGeometry args={[5.5, 0.22, 2.75]} />
            <meshStandardMaterial color="#1f8f8a" roughness={0.5} />
          </mesh>
          {/* flag mast with a pennant, as on New Kingdom pylons */}
          <mesh position={[side * -1.2, H * 0.62, 1.55]} castShadow>
            <cylinderGeometry args={[0.07, 0.11, H * 1.3, 8]} />
            <meshStandardMaterial color="#6b4a2c" roughness={0.9} />
          </mesh>
          <Pennant position={[side * -1.2, H * 1.2, 1.55]} seed={side} />
        </group>
      ))}
      {/* lintel and winged sun disc */}
      <mesh position={[0, 7.6, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.6, 1.5, 2.2]} />
        <meshStandardMaterial map={tex.limestone.map} normalMap={tex.limestone.normalMap} roughness={0.85} color="#f2e2be" />
      </mesh>
      <mesh position={[0, 7.6, 1.15]}>
        <sphereGeometry args={[0.46, 24, 16]} />
        <meshStandardMaterial color="#e2b23e" metalness={1} roughness={0.2} emissive="#ff8a1a" emissiveIntensity={1.6} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 1.2, 7.6, 1.13]} rotation={[0, 0, s * -0.08]}>
          <boxGeometry args={[1.5, 0.22, 0.08]} />
          <meshStandardMaterial color="#d4a832" metalness={1} roughness={0.3} />
        </mesh>
      ))}
      {/* the doorway */}
      <mesh position={[0, 3.45, -0.2]} material={portal}>
        <planeGeometry args={[3.7, 6.9]} />
      </mesh>
      <mesh position={[0, 3.45, -0.9]}>
        <planeGeometry args={[3.7, 6.9]} />
        <meshBasicMaterial color="#05090b" />
      </mesh>
      <pointLight ref={glow} position={[0, 3.2, 1.6]} color="#7ff0e0" intensity={60} distance={22} decay={2} />
      <Sparkles count={60} scale={[4, 7, 5]} position={[0, 3.6, 2.5]} size={7} speed={0.6} color="#9ff5e6" opacity={0.9} />
    </group>
  );
}

function Pennant({ position, seed }: { position: [number, number, number]; seed: number }) {
  const geometry = useMemo(() => {
    const g = new THREE.PlaneGeometry(2.2, 0.55, 16, 1);
    g.translate(1.1, 0, 0);
    return g;
  }, []);
  const base = useMemo(() => (geometry.attributes.position.array as Float32Array).slice(), [geometry]);
  useFrame(({ clock }) => {
    const p = geometry.attributes.position as THREE.BufferAttribute;
    const t = clock.elapsedTime * 3.2 + seed;
    for (let i = 0; i < p.count; i++) {
      const x = base[i * 3];
      p.setZ(i, Math.sin(x * 2.6 - t) * 0.16 * x);
      p.setY(i, base[i * 3 + 1] * (1 - x * 0.28) + Math.sin(x * 1.9 - t * 0.8) * 0.05 * x);
    }
    p.needsUpdate = true;
    geometry.computeVertexNormals();
  });
  return (
    <mesh geometry={geometry} position={position} rotation={[0, 0.5, 0]} castShadow>
      <meshStandardMaterial color="#b3402a" side={THREE.DoubleSide} roughness={0.8} />
    </mesh>
  );
}

// ─── models already shipped with the lessons ───

/** A clone of a GLB, recentred on its base and scaled so its largest side is `size` metres. */
export function useFitted(url: string, size: number, shadows = true) {
  const { scene } = useGLTF(url);
  return useMemo(() => {
    const obj = scene.clone(true);
    const box = new THREE.Box3().setFromObject(obj);
    const dim = box.getSize(new THREE.Vector3());
    const c = box.getCenter(new THREE.Vector3());
    const k = size / Math.max(dim.x, dim.y, dim.z);
    obj.position.set(-c.x * k, -box.min.y * k, -c.z * k);
    obj.scale.setScalar(k);
    obj.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) {
        o.castShadow = shadows;
        o.receiveShadow = true;
      }
    });
    const holder = new THREE.Group();
    holder.add(obj);
    return holder;
  }, [scene, size, shadows]);
}

/** (`shadows` false for small things: each model is some 6,000 triangles, drawn a second time to cast one) */
export function Model({ url, size, position, rotation = 0, shadows = true }: { url: string; size: number; position: [number, number, number]; rotation?: number; shadows?: boolean }) {
  const obj = useFitted(url, size, shadows);
  return <primitive object={obj} position={position} rotation={[0, rotation, 0]} />;
}

function Felucca() {
  const ref = useRef<THREE.Group>(null);
  const obj = useFitted("/models/objects/boat.glb", 9);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime;
    ref.current.position.set(-19.5 + Math.sin(t * 0.05) * 2, WATER_Y - 0.25 + Math.sin(t * 0.9) * 0.12, -58 - ((t * 0.7) % 160) + 60);
    ref.current.rotation.set(Math.sin(t * 0.8) * 0.03, 0, Math.sin(t * 0.6) * 0.04);
  });
  return (
    <group ref={ref}>
      <primitive object={obj} />
    </group>
  );
}

// ─── the lot ───

/** The country every outdoor place shares: dunes and river banks, the pyramids in the haze, the palm groves. */
export function Landscape({ tex, groves = true }: { tex: GameTextures; /** false where the place plants its own banks (Riverbank.tsx) */ groves?: boolean }) {
  return (
    <>
      <Dunes tex={tex} />
      <Pyramids tex={tex} />
      {groves && <PalmGroves tex={tex} />}
    </>
  );
}

/** The causeway's own scenery, on top of the landscape. */
export default function Scenery({ tex }: { tex: GameTextures }) {
  return (
    <>
      <Landscape tex={tex} groves={false} />
      {/* obelisks standing in the river, marking the way */}
      <Obelisk position={[-13, WATER_Y - 0.6, -32]} height={15} tex={tex} />
      <Obelisk position={[14, WATER_Y - 0.6, -66]} height={19} tex={tex} />
      <Obelisk position={[-15, WATER_Y - 0.6, -98]} height={24} tex={tex} />
      <TempleGate tex={tex} />
      <Suspense fallback={null}>
        <Felucca />
      </Suspense>
      {/* dust hanging in the light along the whole course */}
      <Sparkles count={260} scale={[46, 22, 170]} position={[0, 6, -62]} size={3.2} speed={0.25} color="#ffdcaa" opacity={0.55} noise={1.2} />
    </>
  );
}

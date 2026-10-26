"use client";

/**
 * SignStage — shows one 3D "sign object" (GLB) slowly turning on a sandstone
 * pedestal under warm tomb light. Falls back to a stylised gold primitive if
 * the model is missing or fails to load, so the game never breaks.
 */

import { Component, Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";

const SANDSTONE = "#b99a6b";
const GOLD = "#d4a832";
const TARGET_HEIGHT = 2.0; // world units the model is scaled to
const PEDESTAL_TOP = 0; // y of the pedestal's top face

type Props = {
  /** Public URL of the GLB to show */
  model: string;
  /** Changing this remounts the stage (e.g. round index) */
  stageKey?: string | number;
  /** Pause the idle rotation (e.g. while showing feedback) */
  paused?: boolean;
  /**
   * "full" — the torch-lit chamber (game stage).
   * "compact" — just the object on its pedestal, for embedding in lesson cards.
   */
  variant?: "full" | "compact";
  className?: string;
};

/* ───────────────────────── model + fallback ───────────────────────── */

function Turntable({ paused, children }: { paused?: boolean; children: ReactNode }) {
  const group = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (group.current && !paused) group.current.rotation.y += delta * 0.45;
  });
  return <group ref={group}>{children}</group>;
}

function GltfModel({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  // Clone so multiple stages / re-mounts never share mutated transforms.
  const object = useMemo(() => scene.clone(true), [scene]);
  const holder = useRef<THREE.Group>(null);

  // Measure in the holder's own space, starting from the untouched model. React
  // can run this effect twice on the same clone (Suspense re-show, StrictMode);
  // measuring the already-placed model sank it halfway into the pedestal.
  const measure = () => {
    const box = new THREE.Box3().setFromObject(object);
    const h = holder.current;
    if (h) {
      h.updateWorldMatrix(true, false);
      box.applyMatrix4(h.matrixWorld.clone().invert());
    }
    return box;
  };

  useLayoutEffect(() => {
    object.position.set(0, 0, 0);
    object.scale.setScalar(1);
    const size = new THREE.Vector3();
    measure().getSize(size);
    // Fit the largest dimension, so flat/wide objects (cobra, pool, bolt) don't overflow the stage.
    const largest = Math.max(size.x, size.y, size.z);
    const scale = largest > 0 ? TARGET_HEIGHT / largest : 1;
    object.scale.setScalar(scale);
    // re-measure after scaling, then sit bottom on pedestal and centre x/z
    const box2 = measure();
    const c2 = new THREE.Vector3();
    box2.getCenter(c2);
    object.position.set(-c2.x, PEDESTAL_TOP - box2.min.y, -c2.z);
    if (object.userData.lifted) return;
    object.userData.lifted = true;
    object.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow = true;
      mesh.receiveShadow = false;
      // The generated GLBs ship dark, matte albedo textures that read as a
      // silhouette under tomb light. Feed the albedo back in as a gentle
      // emissive so shadowed detail stays visible, and let the environment
      // put a little sheen on the surface.
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      const lifted = mats.map((m) => {
        if (!(m as THREE.MeshStandardMaterial).isMeshStandardMaterial) return m;
        const c = (m as THREE.MeshStandardMaterial).clone();
        c.emissiveMap = c.map;
        c.emissive = new THREE.Color("#ffffff");
        c.emissiveIntensity = c.map ? 0.32 : 0;
        c.roughness = Math.min(c.roughness, 0.55);
        c.metalness = Math.max(c.metalness, 0.12);
        c.envMapIntensity = 1.4;
        c.needsUpdate = true;
        return c;
      });
      mesh.material = lifted.length === 1 ? lifted[0] : lifted;
    });
  }, [object]);

  return (
    <group ref={holder}>
      <primitive object={object} />
    </group>
  );
}

function FallbackShape() {
  return (
    <mesh position={[0, PEDESTAL_TOP + TARGET_HEIGHT / 2, 0]} castShadow>
      <icosahedronGeometry args={[0.9, 1]} />
      <meshStandardMaterial color={GOLD} metalness={0.75} roughness={0.3} flatShading />
    </mesh>
  );
}

type EBState = { failed: boolean };
class ModelErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, EBState> {
  state: EBState = { failed: false };
  static getDerivedStateFromError(): EBState {
    return { failed: true };
  }
  componentDidCatch(err: unknown) {
    console.warn("[SignStage] model failed to load, using fallback:", err);
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

/* ───────────────────────── tomb chamber backdrop ───────────────────────── */

const GLYPH_FONT = "'Noto Sans Egyptian Hieroglyphs', 'Segoe UI Historic', serif";
const WALL_GLYPHS = "𓀀𓁐𓂀𓃭𓅓𓆑𓇋𓈖𓉐𓊪𓋹𓌳𓍿𓎛𓏏𓐍𓂋𓃀𓅱𓄿𓊽𓋴𓇳𓆣𓊖𓏤𓎼𓐝";
const FRIEZE_GLYPHS = "𓋹𓊽𓋴"; // ankh · djed · was — "life, stability, power"
const PIGMENTS = ["#3b2a17", "#8a2f1d", "#1f4b73", "#2f6b3a", "#9c7a1c"];

const PIG = { blue: "#2f4f8a", red: "#9a3a24", green: "#3e7a4a", yellow: "#c9962e", black: "#1c150c" };

/** Classic block border: stacked pigment rectangles separated by black rules. */
function blockBorder(ctx: CanvasRenderingContext2D, x0: number, x1: number, y: number, h: number) {
  const seq = [PIG.blue, PIG.red, PIG.green, PIG.yellow];
  ctx.save();
  ctx.globalAlpha = 0.7;
  for (let x = x0, i = 0; x < x1; x += 48, i++) {
    ctx.fillStyle = seq[i % seq.length];
    ctx.fillRect(x, y, Math.min(48, x1 - x), h);
    ctx.fillStyle = PIG.black;
    ctx.fillRect(x, y, 3, h);
  }
  ctx.fillStyle = PIG.black;
  ctx.fillRect(x0, y, x1 - x0, 3);
  ctx.fillRect(x0, y + h - 3, x1 - x0, 3);
  ctx.restore();
}

/**
 * Paint a tomb wall. The wall plane is 16 x 8 world units but the camera only
 * frames its lower ~60 %, so everything decorative is painted from canvas
 * y ~ 400 downward: a starry "ceiling" edge, a pigment frieze, the glyph
 * columns, and a red-ochre dado.
 */
function paintWall(c: HTMLCanvasElement, withGlyphs: boolean): HTMLCanvasElement {
  const W = 2048, H = 1024;
  c.width = W; c.height = H;
  const ctx = c.getContext("2d")!;

  // plaster — a notch darker than before so the lit object pops off it
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#a88a5e");
  g.addColorStop(0.55, "#a08256");
  g.addColorStop(1, "#7f6440");
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 2600; i++) {
    ctx.fillStyle = `rgba(60,40,20,${Math.random() * 0.14})`;
    const r = Math.random() * 3 + 0.5;
    ctx.fillRect(Math.random() * W, Math.random() * H, r, r);
  }

  // starry ceiling edge (gold stars on lapis — the classic tomb ceiling — seen at the top of frame)
  const skyY = 0, skyH = 440;
  ctx.fillStyle = "#1b2a4d"; ctx.fillRect(0, skyY, W, skyH);
  ctx.fillStyle = "#e3bd5a";
  for (let y = skyY + 30, row = 0; y < skyY + skyH - 10; y += 52, row++) {
    for (let x = row % 2 ? 26 : 52; x < W; x += 52) {
      ctx.beginPath();
      for (let k = 0; k < 5; k++) {
        const a = -Math.PI / 2 + (k * 2 * Math.PI) / 5;
        const a2 = a + Math.PI / 5;
        ctx.lineTo(x + Math.cos(a) * 10, y + Math.sin(a) * 10);
        ctx.lineTo(x + Math.cos(a2) * 4.2, y + Math.sin(a2) * 4.2);
      }
      ctx.closePath(); ctx.fill();
    }
  }
  blockBorder(ctx, 0, W, skyY + skyH - 4, 26);

  // frieze band: ankh · djed · was in pigments on ochre
  const fy = skyY + skyH + 30, fh = 120;
  ctx.fillStyle = "#b8873a"; ctx.fillRect(0, fy, W, fh);
  ctx.fillStyle = PIG.black; ctx.fillRect(0, fy, W, 5); ctx.fillRect(0, fy + fh - 5, W, 5);
  ctx.fillStyle = PIG.red; ctx.fillRect(0, fy + 5, W, 4); ctx.fillRect(0, fy + fh - 9, W, 4);
  ctx.font = `${fh * 0.72}px ${GLYPH_FONT}`;
  ctx.textBaseline = "middle"; ctx.textAlign = "center";
  let x = 60;
  for (let i = 0; withGlyphs && x < W - 40; i++) {
    const ch = FRIEZE_GLYPHS[i % FRIEZE_GLYPHS.length];
    ctx.fillStyle = [PIG.blue, PIG.red, PIG.green][i % 3];
    ctx.fillText(ch, x, fy + fh / 2 + 4);
    x += 96;
  }

  // dado at the bottom
  const dadoY = H - 130;
  blockBorder(ctx, 0, W, dadoY, 22);
  ctx.fillStyle = "rgba(154,58,36,0.35)"; ctx.fillRect(0, dadoY + 22, W, H - dadoY - 22);

  // glyph columns between frieze and dado
  const top = fy + fh + 36, bottom = dadoY - 24;
  const colW = 118;
  ctx.font = `${colW * 0.62}px ${GLYPH_FONT}`;
  for (let cx = 40 + colW / 2; cx < W - 30; cx += colW) {
    ctx.fillStyle = "rgba(70,45,25,0.6)";
    ctx.fillRect(cx - colW / 2, top - 10, 3, bottom - top + 20);
    let y = top + colW * 0.4;
    let k = Math.floor(Math.random() * WALL_GLYPHS.length);
    while (withGlyphs && y < bottom) {
      const ch = WALL_GLYPHS[k % WALL_GLYPHS.length];
      ctx.fillStyle = PIGMENTS[k % PIGMENTS.length];
      ctx.globalAlpha = 0.72 + Math.random() * 0.2;
      ctx.fillText(ch, cx, y);
      ctx.globalAlpha = 1;
      y += colW * 0.78;
      k += 1 + Math.floor(Math.random() * 3);
    }
  }
  ctx.fillStyle = "rgba(70,45,25,0.6)"; ctx.fillRect(W - 33, top - 10, 3, bottom - top + 20);
  return c;
}

function fontReady(): boolean {
  const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
  try {
    return !!fonts?.check?.(`64px ${GLYPH_FONT}`);
  } catch {
    return false;
  }
}

function useWallTexture(): THREE.CanvasTexture {
  // Create synchronously so the material never has to swap textures on a live
  // renderer; repaint the same canvas once the hieroglyph webfont is ready.
  const tex = useMemo(() => {
    const canvas = document.createElement("canvas");
    paintWall(canvas, fontReady());
    const t = new THREE.CanvasTexture(canvas);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  }, []);
  useEffect(() => {
    let cancelled = false;
    const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
    const repaint = () => {
      if (cancelled || !fontReady()) return;
      paintWall(tex.image as HTMLCanvasElement, true);
      tex.needsUpdate = true;
    };
    fonts?.load?.(`64px ${GLYPH_FONT}`).then(repaint, () => {});
    fonts?.ready?.then(repaint, () => {});
    return () => {
      cancelled = true;
    };
  }, [tex]);
  useEffect(() => () => tex.dispose(), [tex]);
  return tex;
}

function Column({ x }: { x: number }) {
  return (
    <group position={[x, 0, -2.2]}>
      <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.42, 0.5, 0.3, 24]} />
        <meshStandardMaterial color="#c9ab79" roughness={0.9} />
      </mesh>
      <mesh position={[0, 3.2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.36, 0.42, 5.8, 24]} />
        <meshStandardMaterial color="#c9ab79" roughness={0.9} />
      </mesh>
      {/* painted bands */}
      <mesh position={[0, 5.2, 0]}>
        <cylinderGeometry args={[0.375, 0.375, 0.18, 24]} />
        <meshStandardMaterial color="#1f2a55" roughness={0.8} />
      </mesh>
      <mesh position={[0, 4.95, 0]}>
        <cylinderGeometry args={[0.375, 0.375, 0.1, 24]} />
        <meshStandardMaterial color="#8a2f1d" roughness={0.8} />
      </mesh>
      {/* lotus-bud capital */}
      <mesh position={[0, 6.35, 0]} castShadow>
        <cylinderGeometry args={[0.62, 0.36, 0.7, 24]} />
        <meshStandardMaterial color="#c9ab79" roughness={0.9} />
      </mesh>
      <mesh position={[0, 6.85, 0]}>
        <boxGeometry args={[1.4, 0.3, 1.4]} />
        <meshStandardMaterial color="#c9ab79" roughness={0.9} />
      </mesh>
    </group>
  );
}

function Torch({ x, seed }: { x: number; seed: number }) {
  const light = useRef<THREE.PointLight>(null);
  useFrame(({ clock }) => {
    if (!light.current) return;
    const t = clock.elapsedTime * 7 + seed;
    light.current.intensity = 9 + Math.sin(t) * 1.4 + Math.sin(t * 2.3) * 0.9;
  });
  return (
    <group position={[x, 3.4, -1.6]}>
      <pointLight ref={light} color="#ffb45c" distance={11} decay={2} />
      <mesh>
        <sphereGeometry args={[0.09, 12, 12]} />
        <meshBasicMaterial color="#ffd27a" />
      </mesh>
      <mesh position={[0, -0.35, 0]}>
        <cylinderGeometry args={[0.035, 0.05, 0.6, 10]} />
        <meshStandardMaterial color="#3b2a17" />
      </mesh>
    </group>
  );
}

function TombBackdrop() {
  const wall = useWallTexture();
  return (
    <group>
      {/* back wall */}
      <mesh position={[0, 3.2, -4.2]} receiveShadow>
        <planeGeometry args={[16, 8]} />
        <meshStandardMaterial map={wall} roughness={0.95} />
      </mesh>
      {/* side walls */}
      <mesh position={[-8, 3.2, -0.5]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[8, 8]} />
        <meshStandardMaterial color="#7f6440" roughness={1} />
      </mesh>
      <mesh position={[8, 3.2, -0.5]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[8, 8]} />
        <meshStandardMaterial color="#7f6440" roughness={1} />
      </mesh>
      {/* floor */}
      <mesh position={[0, -0.66, -1]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[16, 12]} />
        <meshStandardMaterial color="#6e5636" roughness={1} />
      </mesh>
      <Column x={-3.4} />
      <Column x={3.4} />
      <Torch x={-2.1} seed={0} />
      <Torch x={2.1} seed={2.1} />
    </group>
  );
}

/* ────────────────────────────── stage ─────────────────────────────── */

function Pedestal() {
  return (
    <group>
      <mesh position={[0, PEDESTAL_TOP - 0.3, 0]} receiveShadow>
        <cylinderGeometry args={[1.5, 1.7, 0.6, 48]} />
        <meshStandardMaterial color={SANDSTONE} roughness={0.95} />
      </mesh>
      <mesh position={[0, PEDESTAL_TOP - 0.62, 0]} receiveShadow>
        <cylinderGeometry args={[2.0, 2.0, 0.06, 48]} />
        <meshStandardMaterial color="#8a6d45" roughness={1} />
      </mesh>
    </group>
  );
}

export default function SignStage({ model, stageKey, paused, variant = "full", className = "" }: Props) {
  const compact = variant === "compact";
  return (
    <div
      className={`relative w-full ${
        compact ? "aspect-square sm:aspect-[4/3]" : "aspect-[4/3] sm:aspect-[16/10]"
      } border border-gold-700/20 ${compact ? "bg-obsidian-light/40" : "bg-[#150e07]"} overflow-hidden ${className}`}
    >
      <Canvas
        key={stageKey}
        dpr={[1, 1.75]}
        shadows
        gl={{ antialias: true, alpha: true }}
        onCreated={({ gl }) => {
          gl.toneMappingExposure = compact ? 1.1 : 1.2;
        }}
        camera={{ position: compact ? [0, 0.9, 4.2] : [0, 1.1, 4.6], fov: 36 }}
        style={{ touchAction: "none" }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={compact ? 0.35 : 0.22} />
          <hemisphereLight args={["#fff3dc", "#4a3416", compact ? 0.5 : 0.3]} />
          {/* Key: a focused spot on the object rather than a flood over the whole wall. */}
          <spotLight
            position={[3.5, 6, 5.5]}
            angle={0.42}
            penumbra={0.7}
            intensity={compact ? 60 : 85}
            distance={24}
            decay={1.6}
            color="#fff1d6"
            castShadow
            shadow-mapSize={[1024, 1024]}
            shadow-bias={-0.0004}
          />
          {/* Rim from behind-left so the silhouette separates from the wall. */}
          <directionalLight position={[-4, 4, -4]} intensity={1.6} color="#ffb060" />
          <directionalLight position={[5, 2, -2]} intensity={0.6} color="#c9a34a" />
          <Environment resolution={128} frames={1}>
            <Lightformer intensity={2} position={[0, 5, -6]} scale={[12, 5, 1]} color="#fff4de" />
            <Lightformer intensity={1} position={[-6, 2, 4]} scale={[5, 5, 1]} color="#ffd9a3" />
            <Lightformer intensity={0.8} position={[6, -1, 3]} scale={[5, 7, 1]} color="#b8832c" />
          </Environment>

          {!compact && <fog attach="fog" args={["#1a110a", 9, 18]} />}
          <group position={[0, -1.05, 0]}>
            {!compact && <TombBackdrop />}
            <Pedestal />
            <Turntable paused={paused}>
              <ModelErrorBoundary fallback={<FallbackShape />}>
                <Suspense fallback={<FallbackShape />}>
                  <GltfModel url={model} />
                </Suspense>
              </ModelErrorBoundary>
            </Turntable>
            <ContactShadows position={[0, PEDESTAL_TOP + 0.01, 0]} opacity={0.45} blur={2} scale={6} far={3} />
          </group>

          <OrbitControls
            enablePan={false}
            enableZoom={false}
            enableDamping
            dampingFactor={0.08}
            minPolarAngle={Math.PI * 0.3}
            maxPolarAngle={Math.PI * 0.58}
            target={[0, 0.05, 0]}
          />
        </Suspense>
      </Canvas>
      {!compact && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 50%, rgba(10,6,2,0.5) 100%)" }}
        />
      )}
    </div>
  );
}

/** Warm the GLTF cache for the next round's model. */
export function preloadSignModel(url: string) {
  try {
    useGLTF.preload(url);
  } catch {
    /* ignore — fallback shape will be used */
  }
}

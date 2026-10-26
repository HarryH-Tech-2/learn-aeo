"use client";

/**
 * Cartouche Forge — a 3D, orbitable gold cartouche carved into a sandstone
 * slab, with the visitor's name rendered glyph-by-glyph. Fully procedural:
 * no glTF/HDR downloads, so it works offline and behind strict CSP.
 *
 * Loaded lazily via next/dynamic (ssr: false) from TranslateContent so the
 * three.js bundle is only fetched when the visitor asks for it.
 */

import { Suspense, useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  Lightformer,
  ContactShadows,
  RoundedBox,
} from "@react-three/drei";
import * as THREE from "three";
import { trackEvent } from "@/lib/analytics";

const GLYPH_FONT = "'Noto Sans Egyptian Hieroglyphs', serif";
const GOLD = "#d4a832";
const GOLD_LIGHT = "#e8c460";
const SANDSTONE = "#b99a6b";

const GLYPH_SIZE = 1.0; // world units per glyph cell
const GLYPH_GAP = 0.12;
const RING_HEIGHT = 1.9;
const RING_THICKNESS = 0.17;
const RING_DEPTH = 0.22;
const PAD_X = 0.55;

type Props = {
  /** One Unicode hieroglyph per entry, reading left → right. */
  glyphs: string[];
  /** The visitor's name, used for the PNG filename. */
  name: string;
  className?: string;
};

/* ────────────────────────────── helpers ────────────────────────────── */

/** Stadium-shaped ring (cartouche outline) as an extruded shape with a hole. */
function useCartoucheGeometry(width: number) {
  return useMemo(() => {
    const h = RING_HEIGHT;
    const r = h / 2;
    const w = Math.max(width, h); // never narrower than tall

    const stadium = (halfW: number, radius: number) => {
      const p = new THREE.Path();
      // start at top-left straight edge
      p.moveTo(-halfW + radius, radius);
      p.lineTo(halfW - radius, radius);
      p.absarc(halfW - radius, 0, radius, Math.PI / 2, -Math.PI / 2, true);
      p.lineTo(-halfW + radius, -radius);
      p.absarc(-halfW + radius, 0, radius, -Math.PI / 2, Math.PI / 2, true);
      return p;
    };

    const outer = new THREE.Shape();
    const o = stadium(w / 2, r);
    outer.curves = o.curves;
    outer.autoClose = true;

    const inner = stadium(w / 2 - RING_THICKNESS, r - RING_THICKNESS);
    outer.holes.push(inner);

    const geo = new THREE.ExtrudeGeometry(outer, {
      depth: RING_DEPTH,
      bevelEnabled: true,
      bevelThickness: 0.04,
      bevelSize: 0.03,
      bevelSegments: 3,
      curveSegments: 48,
    });
    geo.center();
    return geo;
  }, [width]);
}

/** Paint one glyph to a transparent canvas and return it as a texture. */
function makeGlyphTexture(glyph: string): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, size, size);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `${Math.round(size * 0.86)}px ${GLYPH_FONT}`;

  // carved shadow (offset, dark) then the gold face
  ctx.fillStyle = "rgba(40, 25, 5, 0.85)";
  ctx.fillText(glyph, size / 2 + 6, size / 2 + 7);
  ctx.fillStyle = GOLD_LIGHT;
  ctx.fillText(glyph, size / 2, size / 2);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  return tex;
}

/* ───────────────────────────── 3D pieces ───────────────────────────── */

function Glyph({
  texture,
  index,
  x,
}: {
  texture: THREE.Texture;
  index: number;
  x: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const start = useRef<number | null>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    if (start.current === null) start.current = clock.elapsedTime;
    const t = clock.elapsedTime - start.current - index * 0.09;
    const s = t <= 0 ? 0 : Math.min(1, 1 - Math.pow(1 - Math.min(t / 0.45, 1), 3));
    ref.current.scale.setScalar(0.001 + s);
    ref.current.position.z = RING_DEPTH / 2 + 0.02 + (1 - s) * 0.4;
  });

  return (
    <mesh ref={ref} position={[x, 0, RING_DEPTH / 2 + 0.02]}>
      <planeGeometry args={[GLYPH_SIZE, GLYPH_SIZE]} />
      <meshStandardMaterial
        map={texture}
        transparent
        alphaTest={0.08}
        metalness={0.4}
        roughness={0.45}
        emissive={new THREE.Color(GOLD)}
        emissiveIntensity={0.45}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function Cartouche({ glyphs, textures }: { glyphs: string[]; textures: THREE.Texture[] }) {
  const n = Math.max(glyphs.length, 1);
  const innerWidth = n * GLYPH_SIZE + (n - 1) * GLYPH_GAP + PAD_X * 2;
  const ringWidth = innerWidth + RING_THICKNESS * 2;
  const geometry = useCartoucheGeometry(ringWidth);

  const group = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    // gentle idle sway so the face always stays toward the visitor
    if (group.current) group.current.rotation.y = Math.sin(clock.elapsedTime * 0.35) * 0.32;
  });

  const firstX = -((n - 1) * (GLYPH_SIZE + GLYPH_GAP)) / 2;
  const slabW = ringWidth + 1.6;
  const slabH = RING_HEIGHT + 1.6;

  return (
    <group ref={group}>
      {/* Sandstone slab */}
      <RoundedBox
        args={[slabW, slabH, 0.6]}
        radius={0.08}
        smoothness={4}
        position={[0, 0, -0.3 - RING_DEPTH / 2]}
        receiveShadow
      >
        <meshStandardMaterial color={SANDSTONE} roughness={0.95} metalness={0} />
      </RoundedBox>

      {/* Gold ring */}
      <mesh geometry={geometry} castShadow>
        <meshStandardMaterial color={GOLD} metalness={0.75} roughness={0.3} envMapIntensity={1.4} />
      </mesh>

      {/* End bar (the "knot" of the rope, on the reading-end) */}
      <mesh position={[ringWidth / 2 + 0.2, 0, 0]} castShadow>
        <boxGeometry args={[0.2, RING_HEIGHT * 0.55, RING_DEPTH]} />
        <meshStandardMaterial color={GOLD} metalness={0.75} roughness={0.3} envMapIntensity={1.4} />
      </mesh>

      {/* Glyphs */}
      {textures.map((tex, i) => (
        <Glyph key={`${i}-${glyphs[i]}`} texture={tex} index={i} x={firstX + i * (GLYPH_SIZE + GLYPH_GAP)} />
      ))}
    </group>
  );
}

/** Exposes the renderer for PNG capture without prop-drilling. */
function CaptureBridge({ onReady }: { onReady: (capture: () => Promise<Blob | null>) => void }) {
  const { gl, scene, camera } = useThree();
  useEffect(() => {
    onReady(
      () =>
        new Promise<Blob | null>((resolve) => {
          gl.render(scene, camera); // make sure the buffer is fresh
          gl.domElement.toBlob((b) => resolve(b), "image/png");
        })
    );
  }, [gl, scene, camera, onReady]);
  return null;
}

/* ──────────────────────────── component ───────────────────────────── */

export default function CartoucheForge({ glyphs, name, className = "" }: Props) {
  const [textures, setTextures] = useState<THREE.Texture[] | null>(null);
  const captureRef = useRef<(() => Promise<Blob | null>) | null>(null);
  const key = glyphs.join("");

  // Wait for the hieroglyph webfont, then paint textures. Re-run on glyph change.
  useEffect(() => {
    let cancelled = false;
    const paint = () => {
      if (cancelled) return;
      setTextures(glyphs.map(makeGlyphTexture));
    };
    const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
    if (fonts?.load) {
      fonts.load(`64px ${GLYPH_FONT}`).then(paint, paint);
    } else {
      paint();
    }
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // Dispose old textures when replaced/unmounted.
  useEffect(() => {
    return () => textures?.forEach((t) => t.dispose());
  }, [textures]);

  useEffect(() => {
    trackEvent("cartouche_3d_view", { glyph_count: glyphs.length });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCaptureReady = useCallback((fn: () => Promise<Blob | null>) => {
    captureRef.current = fn;
  }, []);

  const download = async () => {
    const fn = captureRef.current;
    if (!fn) return;
    const blob = await fn();
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const safe = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "cartouche";
    a.download = `cartouche-${safe}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
    trackEvent("cartouche_download", { glyph_count: glyphs.length });
  };

  const n = Math.max(glyphs.length, 1);
  const cameraZ = 3.0 + n * 0.72;

  return (
    <div className={`relative ${className}`}>
      <div className="relative w-full aspect-[16/10] md:aspect-[2/1] border border-gold-700/20 bg-obsidian-light/40 overflow-hidden">
        {textures && (
          <Canvas
            key={key}
            dpr={[1, 2]}
            shadows
            gl={{ antialias: true, preserveDrawingBuffer: true, alpha: true }}
            camera={{ position: [0, 0.9, cameraZ], fov: 38 }}
            style={{ touchAction: "none" }}
          >
            <Suspense fallback={null}>
              <ambientLight intensity={0.45} />
              <hemisphereLight args={["#fff3dc", "#5a3f1a", 0.6]} />
              <directionalLight
                position={[4, 6, 5]}
                intensity={1.6}
                color="#fff1d6"
                castShadow
                shadow-mapSize={[1024, 1024]}
              />
              <directionalLight position={[-5, 2, -3]} intensity={0.5} color="#c9a34a" />

              <Environment resolution={128} frames={1}>
                <Lightformer intensity={2.2} position={[0, 5, -6]} scale={[12, 5, 1]} color="#fff4de" />
                <Lightformer intensity={1.2} position={[-6, 2, 4]} scale={[5, 5, 1]} color="#ffd9a3" />
                <Lightformer intensity={0.9} position={[6, -1, 3]} scale={[5, 7, 1]} color="#b8832c" />
              </Environment>

              <Cartouche glyphs={glyphs} textures={textures} />

              <ContactShadows position={[0, -RING_HEIGHT / 2 - 0.85, 0]} opacity={0.5} blur={2.4} scale={14} far={4} />

              <OrbitControls
                enablePan={false}
                enableDamping
                dampingFactor={0.08}
                minDistance={cameraZ * 0.6}
                maxDistance={cameraZ * 1.6}
                minPolarAngle={Math.PI * 0.25}
                maxPolarAngle={Math.PI * 0.7}
              />
              <CaptureBridge onReady={handleCaptureReady} />
            </Suspense>
          </Canvas>
        )}
        {!textures && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="font-body text-xs tracking-[0.2em] uppercase text-sand-500 animate-pulse">
              Forging cartouche…
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 mt-3">
        <p className="font-body text-xs text-sand-600 tracking-[0.15em] uppercase">
          Drag to orbit · scroll to zoom
        </p>
        <button
          type="button"
          onClick={download}
          className="btn-primary py-2 px-4 text-xs"
          disabled={!textures}
        >
          Download PNG
        </button>
      </div>
    </div>
  );
}

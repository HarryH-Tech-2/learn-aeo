"use client";

/**
 * Parts every place shares: canvas-drawn faces (a sign or a sound on stone),
 * the tablet you answer by touching, the plaque that asks the question, the
 * beam of light where a new sign is met, and the slab the words build on.
 */
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { viewSockets } from "./lesson";
import { game, playerPos, useGame } from "./store";
import { closeTeach, remind, teach } from "./answers";
import { beamStep } from "./beamState";
import type { GameTextures } from "./textures";

export const GLYPH_FONT = "'Noto Sans Egyptian Hieroglyphs', serif";
export const SERIF = "Georgia, 'Times New Roman', serif";

/** Draw now, and again once the hieroglyph font has certainly arrived. */
export function useCanvasTexture(w: number, h: number, draw: (ctx: CanvasRenderingContext2D) => void, deps: unknown[], fontText: string) {
  const { canvas, texture } = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
    return { canvas, texture };
  }, [w, h]);
  useEffect(() => {
    let alive = true;
    const paint = () => {
      if (!alive) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      draw(ctx);
      texture.needsUpdate = true;
    };
    paint();
    document.fonts
      .load(`64px ${GLYPH_FONT}`, fontText || "𓂋")
      .then(paint)
      .catch(() => null);
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  useEffect(() => () => texture.dispose(), [texture]);
  return texture;
}

export function stoneFill(ctx: CanvasRenderingContext2D, w: number, h: number, base: string, seed: number) {
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, w, h);
  let s = seed >>> 0 || 1;
  const r = () => (s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296;
  for (let i = 0; i < (w * h) / 90; i++) {
    ctx.fillStyle = r() < 0.5 ? "rgba(255,240,210,0.10)" : "rgba(70,45,20,0.10)";
    const sz = 1 + r() * 3;
    ctx.fillRect(r() * w, r() * h, sz, sz);
  }
}

/** A sign, or a sound in Latin letters, big on a tablet face. */
export function drawLabel(ctx: CanvasRenderingContext2D, label: string, glyph: boolean, cx: number, cy: number, size: number, color: string) {
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = color;
  if (glyph) {
    ctx.font = `${size}px ${GLYPH_FONT}`;
    ctx.fillText(label, cx, cy);
    // the font draws fine outlines; a stroke makes them read from across a landing
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(2, size / 64);
    ctx.strokeText(label, cx, cy);
  } else {
    ctx.font = `600 ${Math.floor(size * 0.72)}px ${SERIF}`;
    ctx.fillText(label, cx, cy);
  }
}

/** A sound never needs more room than a sign: long ones ("silent", "r n") shrink to fit the width of the face. */
export function labelSize(label: string, glyph: boolean, size: number, width: number): number {
  return glyph || label.length <= 2 ? size : Math.min(size, (width * 0.85) / (label.length * 0.36));
}

/**
 * The face of a stone that carries one sign or one sound: what arches, slabs,
 * stall boards, blocks and holds all show. `mirrored` turns a sign to face right.
 */
export function useFace(label: string, glyph: boolean, opts: { tint?: string; ink?: string; w?: number; h?: number; border?: boolean; mirrored?: boolean } = {}) {
  const { tint = "#ead9b4", ink = "#2a1b0e", w = 256, h = 320, border = true, mirrored = false } = opts;
  return useCanvasTexture(
    w,
    h,
    (ctx) => {
      stoneFill(ctx, w, h, tint, label.codePointAt(0) ?? 1);
      if (border) {
        ctx.strokeStyle = "rgba(90,60,25,0.55)";
        ctx.lineWidth = 6;
        ctx.strokeRect(14, 14, w - 28, h - 28);
      }
      ctx.save();
      if (mirrored) {
        ctx.translate(w, 0);
        ctx.scale(-1, 1);
      }
      drawLabel(ctx, label, glyph, w / 2, h * 0.525, labelSize(label, glyph, Math.min(w, h) * 0.74, w), ink);
      ctx.restore();
    },
    [label, glyph, tint, ink, w, h, border, mirrored],
    glyph ? label : "",
  );
}

// ─── a tablet ───

export type TouchResult = "right" | "wrong" | "ignored";

export function Tablet({
  label,
  glyph,
  position,
  phase,
  mode,
  right,
  tint,
  onTouch,
  tex,
}: {
  label: string;
  glyph: boolean;
  position: [number, number, number];
  phase: number;
  /** active: lit and answerable · dormant: dim, answers with advice · done: gone */
  mode: "active" | "dormant" | "done";
  right: boolean;
  tint: string;
  onTouch: () => TouchResult;
  tex: GameTextures;
}) {
  const group = useRef<THREE.Group>(null);
  const mat = useRef<THREE.MeshStandardMaterial>(null);
  const st = useRef({ inside: false, shake: 0, flash: 0, gone: 0 });
  const face = useFace(label, glyph, { tint });

  useFrame(({ clock, camera }, dtRaw) => {
    const g = group.current;
    if (!g) return;
    const dt = Math.min(dtRaw, 1 / 20);
    const s = st.current;
    if (mode === "done") {
      // the right one rises and goes, the others sink away
      s.gone = Math.min(1, s.gone + dt / 0.5);
      g.position.y = position[1] + (right ? s.gone * 1.4 : -s.gone * 0.8);
      g.scale.setScalar(1 - s.gone);
      g.visible = s.gone < 1;
      return;
    }
    s.gone = 0;
    // a tablet the camera is about to pass through steps out of the way
    g.visible = camera.position.distanceToSquared(g.position) > 2.6 * 2.6;
    g.scale.setScalar(1);
    s.shake = Math.max(0, s.shake - dt);
    s.flash = Math.max(0, s.flash - dt * 1.6);
    const t = clock.elapsedTime;
    g.position.set(position[0] + (s.shake > 0 ? Math.sin(t * 70) * 0.07 * (s.shake / 0.4) : 0), position[1] + Math.sin(t * 1.7 + phase) * 0.08, position[2]);
    g.rotation.y = Math.sin(t * 0.8 + phase) * 0.12;
    if (mat.current) {
      mat.current.color.setScalar(mode === "active" ? 1 : 0.32);
      mat.current.emissive.setRGB(s.flash * 1.6, s.flash * 0.12, s.flash * 0.08);
    }
    if (game.get().status !== "playing") return;
    const dx = playerPos.x - position[0];
    const dz = playerPos.z - position[2];
    const dy = playerPos.y - position[1];
    const touching = dx * dx + dz * dz < 1.0 && Math.abs(dy) < 1.6;
    // one touch, one answer: it re-arms when the player steps away
    const entered = touching && !s.inside;
    s.inside = touching;
    if (!entered) return;
    if (onTouch() === "wrong") {
      s.shake = 0.4;
      s.flash = 1;
    }
  });

  return (
    <group ref={group} position={position}>
      <mesh castShadow>
        <boxGeometry args={[1.3, 1.62, 0.18]} />
        <meshStandardMaterial map={tex.limestone.map} roughness={0.85} color="#e9d3a2" />
      </mesh>
      {[1, -1].map((side) => (
        <mesh key={side} position={[0, 0, side * 0.092]} rotation={[0, side === 1 ? 0 : Math.PI, 0]}>
          <planeGeometry args={[1.2, 1.5]} />
          <meshStandardMaterial ref={side === 1 ? mat : undefined} map={face} roughness={0.8} emissive="#000000" emissiveIntensity={1} />
        </mesh>
      ))}
      <mesh position={[0, -1.0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.36, 0.5, 32]} />
        <meshBasicMaterial color={[0.25, 1.5, 1.35]} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

/** The question a station asks, hung where it can be seen: a sound, a sign, or a meaning. `scale` 1 is two metres wide. */
export function Plaque({
  label,
  glyph,
  caption,
  position,
  lit,
  scale = 1,
  rotation = 0,
  hideNear = true,
}: {
  label: string;
  glyph: boolean;
  caption: string;
  position: [number, number, number];
  lit: boolean;
  scale?: number;
  rotation?: number;
  /** step out of the way when the camera is about to pass through */
  hideNear?: boolean;
}) {
  const mat = useRef<THREE.MeshBasicMaterial>(null);
  const face = useCanvasTexture(
    512,
    256,
    (ctx) => {
      ctx.fillStyle = "#120c07";
      ctx.fillRect(0, 0, 512, 256);
      ctx.strokeStyle = "#d9a935";
      ctx.lineWidth = 8;
      ctx.strokeRect(8, 8, 496, 240);
      ctx.fillStyle = "#c9b48a";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `600 34px ${SERIF}`;
      ctx.fillText(caption, 256, 46);
      drawLabel(ctx, label, glyph, 256, 152, glyph ? 150 : label.length > 4 ? Math.min(84, 1150 / label.length) : 170, "#ffd56b");
    },
    [label, glyph, caption],
    glyph ? label : "",
  );
  const mesh = useRef<THREE.Mesh>(null);
  useFrame(({ camera }) => {
    if (mat.current) mat.current.color.setScalar(lit ? 1.35 : 0.4);
    if (mesh.current && hideNear) mesh.current.visible = camera.position.distanceToSquared(mesh.current.position) > 3.4 * 3.4;
  });
  return (
    <mesh ref={mesh} position={position} rotation={[0, rotation, 0]} scale={scale}>
      <planeGeometry args={[2.0, 1.0]} />
      <meshBasicMaterial ref={mat} map={face} toneMapped={false} side={THREE.DoubleSide} />
    </mesh>
  );
}

/** The light a new sign waits in: a beam, a ring on the ground and the sign turning in it. Looks only; no logic. */
export function BeamOfLight({ symbol, position, met, height = 6.4 }: { symbol: string; position: [number, number, number]; met: () => boolean; height?: number }) {
  const beam = useRef<THREE.MeshBasicMaterial>(null);
  const shaft = useRef<THREE.Mesh>(null);
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
  useFrame(({ clock, camera }) => {
    const t = clock.elapsedTime;
    const m = met();
    // a camera standing inside the shaft would see the whole view through its glow
    if (shaft.current) shaft.current.visible = (camera.position.x - position[0]) ** 2 + (camera.position.z - position[2]) ** 2 > 1.7 * 1.7;
    if (beam.current) beam.current.opacity = (m ? 0.1 : 0.34) + Math.sin(t * 2.4) * (m ? 0.02 : 0.08);
    if (sign.current) {
      sign.current.position.y = 2.0 + Math.sin(t * 1.5) * 0.12;
      sign.current.rotation.y = Math.sin(t * 0.9) * 0.5;
    }
  });
  return (
    <group position={position}>
      <mesh ref={shaft} position={[0, height / 2, 0]}>
        <cylinderGeometry args={[0.95, 1.15, height, 28, 1, true]} />
        <meshBasicMaterial ref={beam} color={[1.6, 1.25, 0.5]} transparent opacity={0.3} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.95, 1.2, 40]} />
        <meshBasicMaterial color={[2.4, 1.7, 0.5]} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={sign} position={[0, 2.0, 0]}>
        <planeGeometry args={[1.5, 1.5]} />
        <meshBasicMaterial map={face} transparent depthWrite={false} toneMapped={false} side={THREE.DoubleSide} color={[1.5, 1.5, 1.5]} />
      </mesh>
      <Sparkles count={18} scale={[1.8, Math.min(5, height), 1.8]} position={[0, 2.6, 0]} size={5} speed={0.8} color="#ffe2a0" />
    </group>
  );
}

/**
 * Where a new sign is met on foot (`position` is the ground under the beam).
 * Walking in cannot go wrong: the sign is shown, named and spoken, and may then be asked for.
 */
export function TeachBeam({ symbol, position, height, known = false }: { symbol: string; position: [number, number, number]; height?: number; /** a sign already learned: a fainter beam, and its card as a reminder (answers.ts remind) */ known?: boolean }) {
  const showing = useRef(false);
  useFrame(() => {
    if (game.get().status !== "playing") return;
    const dx = playerPos.x - position[0];
    const dz = playerPos.z - position[2];
    const d2 = dx * dx + dz * dz;
    const level = Math.abs(playerPos.y - position[1] - 0.55) < 2.2;
    // the card goes as the learner steps out of the ring: the tablets stand 2.3 m on, and on a phone the card would be over
    // them. An answer there takes the card down too (answers.ts), so the beam re-arms once they are out of the ring (beamState.ts).
    const next = beamStep(showing.current, game.get().teaching === symbol, d2, level);
    showing.current = next.showing;
    if (next.action === "open") {
      if (known) remind(symbol);
      else teach(symbol, new THREE.Vector3(position[0], position[1] + 1, position[2]));
    }
    // (a reminder is not held for, so it outlasts the ring: it goes with the answer, Got it, or the next beam)
    else if (next.action === "close" && !known) closeTeach(symbol);
  });
  return <BeamOfLight symbol={symbol} position={position} height={height} met={() => known || !!game.get().lesson?.taught.includes(symbol)} />;
}

/**
 * The slab the words build on: sockets and wanted sounds, signs appearing as
 * they are found, the reading under each word once it is whole. The causeway
 * hangs it in the temple gate; other places stand it where the level ends.
 */
export function WordSlab({ tex, width = 3.72, height = 6.9 }: { tex: GameTextures; width?: number; height?: number }) {
  const g = useGame();
  const lesson = g.lesson;
  const progress = lesson?.progress ?? 0;
  const key = lesson ? `${g.run}:${progress}` : "none";

  const paint = (ctx: CanvasRenderingContext2D, glow: boolean) => {
    const W = 512;
    const H = 960;
    if (glow) {
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, W, H);
    } else {
      stoneFill(ctx, W, H, "#b89a66", 31);
      ctx.strokeStyle = "rgba(60,40,15,0.6)";
      ctx.lineWidth = 8;
      ctx.strokeRect(24, 24, W - 48, H - 48);
      ctx.fillStyle = "rgba(30,20,8,0.7)";
      ctx.fillRect(W / 2 - 2, 24, 4, H - 48);
    }
    if (!lesson) return;
    const current = lesson.stations[Math.min(progress, lesson.stations.length - 1)]?.phrase ?? 0;
    const n = lesson.phrases.length;
    lesson.phrases.forEach((phrase, pi) => {
      const views = viewSockets(lesson, progress, pi);
      const cell = Math.min(n > 2 ? 96 : 150, (W - 70) / views.length);
      const x0 = W / 2 - (cell * views.length) / 2;
      const y = n > 2 ? 130 + pi * ((H - 200) / n) : n > 1 ? 250 + pi * 300 : 330;
      views.forEach((v, i) => {
        const cx = x0 + cell * (i + 0.5);
        const carved = v.state === "given";
        const have = v.state === "filled";
        const next = v.state === "next" && pi === current;
        if (!glow) {
          ctx.fillStyle = have ? "#f3c75a" : carved ? "rgba(255,240,210,0.30)" : "rgba(40,26,10,0.28)";
          ctx.fillRect(cx - cell * 0.44, y - cell * 0.52, cell * 0.88, cell * 1.04);
          if (v.showSymbol || carved) drawLabel(ctx, v.symbol, true, cx, y, cell * 0.74, v.silent ? "rgba(58,38,8,0.55)" : "#3a2608");
        } else if (have && !v.silent) {
          drawLabel(ctx, v.symbol, true, cx, y, cell * 0.74, "#ffcf5a");
        }
        // under each socket, the sound: the question when spelling, the answer when reading
        if (v.showSound) {
          const text = v.silent ? "silent" : v.sound;
          ctx.font = `600 ${Math.floor(cell * (v.silent ? 0.2 : 0.3))}px ${SERIF}`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = glow ? (next ? "#7ff0e0" : "#000") : "rgba(40,26,10,0.85)";
          ctx.fillText(text, cx, y + cell * 0.84);
        }
      });
      const phraseDone = views.every((v) => v.state === "given" || v.state === "filled");
      if (phraseDone) {
        ctx.font = `italic ${n > 2 ? 30 : n > 1 ? 40 : 52}px ${SERIF}`;
        ctx.textAlign = "center";
        ctx.fillStyle = glow ? "#ffcf5a" : "#3a2608";
        ctx.fillText(`${phrase.translit}: “${phrase.meaning.split(",")[0]}”`, W / 2, y + cell * 1.35 + 20);
      }
    });
  };
  const fontText = lesson ? lesson.phrases.flatMap((p) => [...p.sockets.map((s) => s.symbol), p.det?.symbol ?? ""]).join("") : "𓂋";
  const map = useCanvasTexture(512, 960, (ctx) => paint(ctx, false), [key], fontText);
  const glowMap = useCanvasTexture(512, 960, (ctx) => paint(ctx, true), [key], fontText);

  return (
    <>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[width, height, 0.4]} />
        <meshStandardMaterial map={tex.sandstone.map} roughness={0.9} color="#caa873" />
      </mesh>
      <mesh position={[0, 0, 0.205]}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial map={map} emissiveMap={glowMap} emissive="#ffffff" emissiveIntensity={1.7} roughness={0.85} />
      </mesh>
    </>
  );
}

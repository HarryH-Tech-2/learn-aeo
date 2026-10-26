"use client";

/**
 * TombWall — a torch-lit sandstone wall with a word carved into it in sunk
 * relief. The torch follows the pointer; dust drifts in the beam; the
 * carving is a single canvas texture (colour) + a matching bump map, so the
 * moving light really catches the edges of the glyphs.
 *
 * The wall is one mesh: taps are resolved from the hit UV to a sign slot, so
 * there are no seams between signs and no per-sign geometry.
 */

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";

export type SlotTone = "none" | "chalk" | "right" | "wrong" | "dim";

export type WallSlot = {
  glyph: string;
  /** Carved facing right (wall reads right-to-left) */
  mirrored: boolean;
  /** Small number badge (reading-order position) */
  badge?: string;
  tone: SlotTone;
};

type Props = {
  /** Signs in left-to-right display order */
  slots: WallSlot[];
  onTap?: (slotIndex: number) => void;
  interactive?: boolean;
  /** Pull the torch to one side of the inscription as a hint */
  hintSide?: "left" | "right" | null;
  stageKey?: string | number;
  className?: string;
};

/* ────────────────────────── canvas painting ────────────────────────── */

const W = 2048;
const H = 1024;
const WALL_W = 12; // world units
const WALL_H = 6;
const PX = W / WALL_W; // px per world unit (same in y: 1024/6 ≈ 170.7)
const GLYPH_FONT = "'Noto Sans Egyptian Hieroglyphs', 'Segoe UI Historic', serif";
const FRIEZE = "𓋹𓊽𓋴";

const PLASTER_TOP = "#d3b583";
const PLASTER_MID = "#c6a46f";
const PLASTER_BOT = "#a98658";
const RECESS = "#4f3819"; // sunk-relief floor — dark enough to read at a glance
const RECESS_DARK = "#1f1407"; // shadowed top-left edge of the cut
const RIM = "#fff0c8"; // lit bottom-right edge

/* The camera (fov 44 @ z 5.1) only frames the middle ~6.6 x 4.1 world units of
   the 12 x 6 wall, so all decoration is painted inside that window:
   x ~ 470-1578 px, y ~ 160-865 px. */
const VIS_Y0 = 160;
const VIS_Y1 = 865;
const BORDER_L = 470; // left block-border strip (x0)
const BORDER_R = 1578; // right block-border strip (x1)
const BORDER_W = 78;

/* Tomb-painting pigments: Egyptian blue, red ochre, malachite green, yellow ochre. */
const PIG = { blue: "#2f4f8a", red: "#9a3a24", green: "#3e7a4a", yellow: "#c9962e", black: "#1c150c" };

/** Classic "block border": stacked coloured rectangles separated by black lines. */
function blockBorder(ctx: CanvasRenderingContext2D, x: number, y0: number, y1: number, w: number, vertical = true) {
  const seq = [PIG.blue, PIG.red, PIG.green, PIG.yellow];
  const step = 46;
  ctx.save();
  ctx.globalAlpha = 0.62;
  if (vertical) {
    for (let y = y0, i = 0; y < y1; y += step, i++) {
      ctx.fillStyle = seq[i % seq.length];
      ctx.fillRect(x, y, w, Math.min(step, y1 - y));
      ctx.fillStyle = PIG.black;
      ctx.fillRect(x, y, w, 3);
    }
    ctx.fillStyle = PIG.black;
    ctx.fillRect(x, y0, 3, y1 - y0);
    ctx.fillRect(x + w - 3, y0, 3, y1 - y0);
  } else {
    for (let xx = y0, i = 0; xx < y1; xx += step, i++) {
      ctx.fillStyle = seq[i % seq.length];
      ctx.fillRect(xx, x, Math.min(step, y1 - xx), w);
      ctx.fillStyle = PIG.black;
      ctx.fillRect(xx, x, 3, w);
    }
    ctx.fillStyle = PIG.black;
    ctx.fillRect(y0, x, y1 - y0, 3);
    ctx.fillRect(y0, x + w - 3, y1 - y0, 3);
  }
  ctx.restore();
}

/** Kheker frieze — the knotted-reed motif that tops so many tomb walls. */
function kheker(ctx: CanvasRenderingContext2D, x0: number, x1: number, y: number, h: number) {
  const w = 34;
  ctx.save();
  ctx.globalAlpha = 0.6;
  for (let x = x0 + 8; x < x1 - w; x += w + 10) {
    // stem
    ctx.fillStyle = PIG.red;
    ctx.fillRect(x + w / 2 - 5, y + h * 0.45, 10, h * 0.55);
    // knot
    ctx.fillStyle = PIG.blue;
    ctx.fillRect(x + w / 2 - 9, y + h * 0.38, 18, h * 0.14);
    // fan
    ctx.fillStyle = PIG.green;
    ctx.beginPath();
    ctx.moveTo(x + w / 2, y);
    ctx.quadraticCurveTo(x + w, y + h * 0.05, x + w - 2, y + h * 0.42);
    ctx.lineTo(x + 2, y + h * 0.42);
    ctx.quadraticCurveTo(x, y + h * 0.05, x + w / 2, y);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = PIG.yellow;
    ctx.fillRect(x + w / 2 - 2, y + h * 0.06, 4, h * 0.34);
  }
  ctx.restore();
}
const CHALK = "#efc75a";
const GREEN = "#8ed08f";
const RED = "#e0746a";

export type SlotRect = { x0: number; x1: number; y0: number; y1: number };

/** Slot geometry in canvas pixels for `n` signs, centred on the wall. */
export function layoutSlots(n: number): { rects: SlotRect[]; size: number } {
  const sizeUnits = Math.min(1.25, 6.3 / Math.max(1, n));
  const gapUnits = sizeUnits * 0.12;
  const size = sizeUnits * PX;
  const gap = gapUnits * PX;
  const total = n * size + (n - 1) * gap;
  const x0 = (W - total) / 2;
  const cy = H / 2 + 10;
  const rects: SlotRect[] = [];
  for (let i = 0; i < n; i++) {
    const x = x0 + i * (size + gap);
    rects.push({ x0: x, x1: x + size, y0: cy - size / 2, y1: cy + size / 2 });
  }
  return { rects, size };
}

export function slotAtUv(u: number, v: number, rects: SlotRect[]): number {
  const px = u * W;
  const py = (1 - v) * H;
  const pad = 12;
  return rects.findIndex((r) => px >= r.x0 - pad && px <= r.x1 + pad && py >= r.y0 - pad && py <= r.y1 + pad);
}

function fontReady(): boolean {
  const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
  try {
    return !!fonts?.check?.(`64px ${GLYPH_FONT}`);
  } catch {
    return false;
  }
}

/** Deterministic speckle so repaints don't shimmer. */
function speckle(ctx: CanvasRenderingContext2D, count: number, alpha: number) {
  let s = 1234567;
  const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 0x100000000);
  for (let i = 0; i < count; i++) {
    ctx.fillStyle = `rgba(60,40,20,${rnd() * alpha})`;
    const r = rnd() * 3 + 0.5;
    ctx.fillRect(rnd() * W, rnd() * H, r, r);
  }
}

let scratchCanvas: HTMLCanvasElement | null = null;
function getScratch(size: number): HTMLCanvasElement {
  if (!scratchCanvas) scratchCanvas = document.createElement("canvas");
  if (scratchCanvas.width < size || scratchCanvas.height < size) {
    scratchCanvas.width = size;
    scratchCanvas.height = size;
  }
  return scratchCanvas;
}

function drawGlyph(ctx: CanvasRenderingContext2D, glyph: string, r: SlotRect, mirrored: boolean, dx = 0, dy = 0) {
  const size = r.x1 - r.x0;
  ctx.save();
  ctx.translate((r.x0 + r.x1) / 2 + dx, (r.y0 + r.y1) / 2 + dy);
  if (mirrored) ctx.scale(-1, 1);
  ctx.font = `${Math.round(size * 0.92)}px ${GLYPH_FONT}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(glyph, 0, size * 0.04);
  ctx.restore();
}

export function paintWall(c: HTMLCanvasElement, slots: WallSlot[], withGlyphs: boolean) {
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d")!;

  // plaster
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, PLASTER_TOP);
  g.addColorStop(0.55, PLASTER_MID);
  g.addColorStop(1, PLASTER_BOT);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  speckle(ctx, 3200, 0.12);

  const { rects } = layoutSlots(slots.length);
  const regTop = (rects[0]?.y0 ?? H / 2 - 120) - 70;
  const regBot = (rects[0]?.y1 ?? H / 2 + 120) + 70;

  // ── Upper zone: kheker frieze + a pigment frieze of ankh · djed · was ──
  const khY = VIS_Y0 + 12;
  const khH = 62;
  ctx.fillStyle = "rgba(120,80,35,0.16)";
  ctx.fillRect(0, khY - 6, W, khH + 12);
  kheker(ctx, BORDER_L + BORDER_W, BORDER_R - BORDER_W, khY, khH);
  blockBorder(ctx, khY + khH + 8, BORDER_L, BORDER_R, 22, false);

  const fy = khY + khH + 40;
  const fh = regTop - fy - 14;
  ctx.fillStyle = "rgba(201,150,46,0.16)";
  ctx.fillRect(0, fy, W, fh);
  ctx.fillStyle = "rgba(70,45,25,0.45)";
  ctx.fillRect(0, fy, W, 4);
  ctx.fillRect(0, fy + fh - 4, W, 4);
  if (withGlyphs && fh > 40) {
    ctx.font = `${Math.min(fh * 0.72, 88)}px ${GLYPH_FONT}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const pig = [PIG.blue, PIG.red, PIG.green];
    for (let x = BORDER_L + BORDER_W + 50, i = 0; x < BORDER_R - BORDER_W - 30; x += 88, i++) {
      ctx.fillStyle = pig[i % pig.length];
      ctx.globalAlpha = 0.55;
      ctx.fillText(FRIEZE[i % FRIEZE.length], x, fy + fh / 2 + 4);
    }
    ctx.globalAlpha = 1;
  }

  // ── Register lines framing the inscription ──
  ctx.fillStyle = "rgba(70,45,25,0.6)";
  ctx.fillRect(0, regTop, W, 5);
  ctx.fillRect(0, regBot, W, 5);
  ctx.fillStyle = "rgba(255,235,200,0.4)";
  ctx.fillRect(0, regTop + 5, W, 2);
  ctx.fillRect(0, regBot + 5, W, 2);

  // ── Lower zone: block border + red-ochre dado ──
  const dadoY = regBot + 40;
  blockBorder(ctx, dadoY, BORDER_L, BORDER_R, 22, false);
  ctx.fillStyle = "rgba(154,58,36,0.28)";
  ctx.fillRect(0, dadoY + 34, W, VIS_Y1 + 40 - (dadoY + 34));
  ctx.fillStyle = "rgba(28,21,12,0.5)";
  ctx.fillRect(0, dadoY + 34, W, 6);
  ctx.fillStyle = "rgba(28,21,12,0.35)";
  ctx.fillRect(0, VIS_Y1 + 20, W, H - VIS_Y1 - 20);

  // ── Side block borders ──
  blockBorder(ctx, BORDER_L, khY - 6, VIS_Y1 + 40, BORDER_W);
  blockBorder(ctx, BORDER_R - BORDER_W, khY - 6, VIS_Y1 + 40, BORDER_W);

  // A soft dark surround so the inscription reads as the focal point.
  const focus = ctx.createRadialGradient(W / 2, H / 2, 150, W / 2, H / 2, 900);
  focus.addColorStop(0, "rgba(0,0,0,0)");
  focus.addColorStop(1, "rgba(30,18,6,0.35)");
  ctx.fillStyle = focus;
  ctx.fillRect(0, 0, W, H);

  if (!withGlyphs) return;

  // carved signs
  slots.forEach((slot, i) => {
    const r = rects[i];
    const size = r.x1 - r.x0;
    let fill = RECESS;
    if (slot.tone === "chalk") fill = CHALK;
    else if (slot.tone === "right") fill = GREEN;
    else if (slot.tone === "wrong") fill = RED;
    else if (slot.tone === "dim") fill = "rgba(125,95,58,0.55)";

    // Soft halo behind highlighted signs — readable under any lighting/font.
    if (slot.tone === "chalk" || slot.tone === "right" || slot.tone === "wrong") {
      const cx = (r.x0 + r.x1) / 2;
      const cy = (r.y0 + r.y1) / 2;
      const halo = ctx.createRadialGradient(cx, cy, size * 0.1, cx, cy, size * 0.62);
      const rgb = slot.tone === "chalk" ? "239,199,90" : slot.tone === "right" ? "142,208,143" : "224,116,106";
      halo.addColorStop(0, `rgba(${rgb},0.42)`);
      halo.addColorStop(1, `rgba(${rgb},0)`);
      ctx.fillStyle = halo;
      ctx.fillRect(cx - size * 0.65, cy - size * 0.65, size * 1.3, size * 1.3);
    }

    // Compose the sunk relief on a transparent scratch canvas so composite
    // ops clip to the glyph, then stamp it onto the (opaque) wall.
    const pad = Math.ceil(size * 0.1);
    const sw = Math.ceil(size + pad * 2);
    const scratch = getScratch(sw);
    const sctx = scratch.getContext("2d")!;
    sctx.clearRect(0, 0, sw, sw);
    const local: SlotRect = { x0: pad, x1: pad + size, y0: pad, y1: pad + size };
    const o = size * 0.024;
    // 1) whole glyph dark (this survives as the shadow along the top-left edge)
    sctx.fillStyle = RECESS_DARK;
    drawGlyph(sctx, slot.glyph, local, slot.mirrored);
    // 2) recess colour, nudged down-right, only inside the glyph
    sctx.save();
    sctx.globalCompositeOperation = "source-atop";
    sctx.fillStyle = fill;
    drawGlyph(sctx, slot.glyph, local, slot.mirrored, o, o);
    sctx.restore();
    // 3) a lit rim peeking out below/right (only where still transparent)
    sctx.save();
    sctx.globalCompositeOperation = "destination-over";
    sctx.globalAlpha = 0.85;
    sctx.fillStyle = RIM;
    drawGlyph(sctx, slot.glyph, local, slot.mirrored, o * 1.5, o * 1.5);
    sctx.restore();
    // 4) a soft dark contour around the whole cut so it separates from the plaster
    ctx.save();
    ctx.shadowColor = "rgba(20,12,4,0.55)";
    ctx.shadowBlur = Math.max(4, size * 0.03);
    ctx.drawImage(scratch, 0, 0, sw, sw, r.x0 - pad, r.y0 - pad, sw, sw);
    ctx.restore();

    // badge
    if (slot.badge) {
      const bx = r.x0 + size * 0.12;
      const by = r.y0 + size * 0.12;
      const br = Math.max(22, size * 0.13);
      ctx.beginPath();
      ctx.arc(bx, by, br, 0, Math.PI * 2);
      ctx.fillStyle = slot.tone === "right" ? GREEN : slot.tone === "wrong" ? RED : CHALK;
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = "rgba(60,40,15,0.7)";
      ctx.stroke();
      ctx.fillStyle = "#2b1d0c";
      ctx.font = `700 ${Math.round(br * 1.15)}px ui-sans-serif, system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(slot.badge, bx, by + 1);
    }
  });
}

/** Height map: bright = proud surface, dark = recess. Soft edges read as chisel bevels. */
export function paintBump(c: HTMLCanvasElement, slots: WallSlot[], withGlyphs: boolean) {
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#bdbdbd";
  ctx.fillRect(0, 0, W, H);
  // plaster grain
  let s = 99;
  const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 0x100000000);
  for (let i = 0; i < 5000; i++) {
    const v = 170 + Math.floor(rnd() * 40);
    ctx.fillStyle = `rgb(${v},${v},${v})`;
    ctx.fillRect(rnd() * W, rnd() * H, rnd() * 3 + 1, rnd() * 3 + 1);
  }
  const { rects } = layoutSlots(slots.length);
  const regTop = (rects[0]?.y0 ?? H / 2 - 120) - 70;
  const regBot = (rects[0]?.y1 ?? H / 2 + 120) + 70;
  ctx.fillStyle = "#707070";
  ctx.fillRect(0, regTop, W, 7);
  ctx.fillRect(0, regBot, W, 7);
  ctx.fillRect(0, VIS_Y0 + 6, W, 4);
  ctx.fillRect(0, regBot + 40, W, 4);
  ctx.fillRect(BORDER_L, VIS_Y0, 4, VIS_Y1 - VIS_Y0 + 40);
  ctx.fillRect(BORDER_R - 4, VIS_Y0, 4, VIS_Y1 - VIS_Y0 + 40);
  if (!withGlyphs) return;
  try {
    ctx.filter = "blur(1.5px)";
  } catch {
    /* older browsers */
  }
  ctx.fillStyle = "#202020";
  slots.forEach((slot, i) => drawGlyph(ctx, slot.glyph, rects[i], slot.mirrored));
  try {
    ctx.filter = "none";
  } catch {
    /* ignore */
  }
  // deepen the recess floor so the bevel reads under a moving light
  ctx.fillStyle = "#0a0a0a";
  slots.forEach((slot, i) => {
    const r = rects[i];
    const inset = (r.x1 - r.x0) * 0.02;
    drawGlyph(ctx, slot.glyph, { x0: r.x0 + inset, x1: r.x1 - inset, y0: r.y0 + inset, y1: r.y1 - inset }, slot.mirrored);
  });
}

/* ───────────────────────────── scene ───────────────────────────── */

function useWallTextures(slots: WallSlot[]) {
  const [ready, setReady] = useState(false);
  // Create once, synchronously; repaint in place on every change.
  const tex = useMemo(() => {
    const color = document.createElement("canvas");
    const bump = document.createElement("canvas");
    // Always paint — a system fallback font is far better than a blank
    // wall. When the webfont lands (or was already cached) we repaint.
    paintWall(color, slots, true);
    paintBump(bump, slots, true);
    const map = new THREE.CanvasTexture(color);
    map.colorSpace = THREE.SRGBColorSpace;
    map.anisotropy = 8;
    const bumpMap = new THREE.CanvasTexture(bump);
    bumpMap.anisotropy = 4;
    return { map, bumpMap, color, bump };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // font load → repaint
  useEffect(() => {
    let cancelled = false;
    const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
    const done = () => {
      if (!cancelled && fontReady()) setReady(true);
    };
    if (fontReady()) setReady(true);
    fonts?.load?.(`64px ${GLYPH_FONT}`).then(done, () => {});
    fonts?.ready?.then(done, () => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // layout key: glyphs + mirroring (bump only depends on these)
  const layoutKey = slots.map((s) => `${s.glyph}${s.mirrored ? "m" : ""}`).join("|");
  useEffect(() => {
    paintBump(tex.bump, slots, true);
    tex.bumpMap.needsUpdate = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layoutKey, ready]);

  const toneKey = slots.map((s) => `${s.tone}${s.badge ?? ""}`).join("|");
  useEffect(() => {
    paintWall(tex.color, slots, true);
    tex.map.needsUpdate = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layoutKey, toneKey, ready]);

  useEffect(
    () => () => {
      tex.map.dispose();
      tex.bumpMap.dispose();
    },
    [tex]
  );
  return tex;
}

function Dust() {
  const ref = useRef<THREE.Points>(null);
  const { positions, speeds } = useMemo(() => {
    const n = 220;
    const p = new Float32Array(n * 3);
    const v = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      p[i * 3] = (Math.random() - 0.5) * 9;
      p[i * 3 + 1] = (Math.random() - 0.5) * 5;
      p[i * 3 + 2] = 0.2 + Math.random() * 3.2;
      v[i] = 0.05 + Math.random() * 0.12;
    }
    return { positions: p, speeds: v };
  }, []);
  useFrame((state, delta) => {
    const pts = ref.current;
    if (!pts) return;
    const arr = pts.geometry.attributes.position.array as Float32Array;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < speeds.length; i++) {
      arr[i * 3 + 1] += speeds[i] * delta;
      arr[i * 3] += Math.sin(t * 0.5 + i) * 0.0015;
      if (arr[i * 3 + 1] > 2.6) arr[i * 3 + 1] = -2.6;
    }
    pts.geometry.attributes.position.needsUpdate = true;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.035} color="#ffd9a0" transparent opacity={0.55} depthWrite={false} sizeAttenuation />
    </points>
  );
}

function Torch({ target }: { target: React.MutableRefObject<THREE.Vector3> }) {
  const light = useRef<THREE.PointLight>(null);
  const glow = useRef<THREE.Mesh>(null);
  const pos = useRef(new THREE.Vector3(0, 0.2, 1.4));
  useFrame(({ clock }, delta) => {
    if (!light.current) return;
    pos.current.lerp(target.current, Math.min(1, delta * 4));
    light.current.position.copy(pos.current);
    const t = clock.elapsedTime * 8;
    light.current.intensity = 6.5 + Math.sin(t) * 0.8 + Math.sin(t * 2.7 + 1) * 0.5;
    if (glow.current) {
      glow.current.position.copy(pos.current);
      glow.current.position.z += 0.25;
      const s = 0.95 + Math.sin(t * 1.3) * 0.06;
      glow.current.scale.setScalar(s);
    }
  });
  return (
    <>
      <pointLight ref={light} color="#ffb45c" distance={9} decay={2} castShadow={false} />
      <mesh ref={glow}>
        <sphereGeometry args={[0.045, 12, 12]} />
        <meshBasicMaterial color="#ffb347" transparent opacity={0.75} />
      </mesh>
    </>
  );
}

function Wall({
  slots,
  onTap,
  interactive,
  hintSide,
}: {
  slots: WallSlot[];
  onTap?: (i: number) => void;
  interactive: boolean;
  hintSide: "left" | "right" | null;
}) {
  const { map, bumpMap } = useWallTextures(slots);
  const rects = useMemo(() => layoutSlots(slots.length).rects, [slots.length]);
  const torchTarget = useRef(new THREE.Vector3(0, 0.2, 1.4));
  const hovering = useRef(false);

  // Hint: pull the torch to the start edge of the inscription.
  useEffect(() => {
    if (!hintSide || rects.length === 0) return;
    const r = hintSide === "left" ? rects[0] : rects[rects.length - 1];
    const cx = (r.x0 + r.x1) / 2 / W;
    torchTarget.current.set((cx - 0.5) * WALL_W + (hintSide === "left" ? -0.4 : 0.4), 0.35, 1.2);
  }, [hintSide, rects]);

  // Idle drift when the pointer isn't over the wall (touch devices).
  useFrame(({ clock }) => {
    if (hovering.current || hintSide) return;
    const t = clock.elapsedTime * 0.35;
    torchTarget.current.set(Math.sin(t) * 1.6, 0.25 + Math.cos(t * 0.7) * 0.35, 1.4);
  });

  const onMove = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      if (!e.uv) return;
      hovering.current = true;
      torchTarget.current.set((e.uv.x - 0.5) * WALL_W, (e.uv.y - 0.5) * WALL_H, 1.1);
      if (interactive) {
        const i = slotAtUv(e.uv.x, e.uv.y, rects);
        document.body.style.cursor = i >= 0 ? "pointer" : "";
      }
    },
    [interactive, rects]
  );
  const onOut = useCallback(() => {
    hovering.current = false;
    document.body.style.cursor = "";
  }, []);
  const onClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      if (!interactive || !e.uv || !onTap) return;
      const i = slotAtUv(e.uv.x, e.uv.y, rects);
      if (i >= 0) onTap(i);
    },
    [interactive, onTap, rects]
  );
  useEffect(() => () => void (document.body.style.cursor = ""), []);

  return (
    <group>
      <mesh onPointerMove={onMove} onPointerOut={onOut} onClick={onClick}>
        <planeGeometry args={[WALL_W, WALL_H]} />
        <meshStandardMaterial map={map} bumpMap={bumpMap} bumpScale={3.4} roughness={0.9} metalness={0} />
      </mesh>
      <Torch target={torchTarget} />
    </group>
  );
}

function CameraSway() {
  useFrame(({ camera, clock }) => {
    const t = clock.elapsedTime;
    camera.position.x = Math.sin(t * 0.25) * 0.06;
    camera.position.y = 0.15 + Math.cos(t * 0.2) * 0.04;
    camera.lookAt(0, 0.1, 0);
  });
  return null;
}

export default function TombWall({ slots, onTap, interactive = true, hintSide = null, stageKey, className = "" }: Props) {
  return (
    <div
      className={`relative w-full aspect-[4/3] sm:aspect-[16/10] border border-gold-700/20 bg-[#1a120a] overflow-hidden ${className}`}
    >
      <Canvas
        key={stageKey}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: false }}
        camera={{ position: [0, 0.15, 5.1], fov: 44 }}
        style={{ touchAction: "none" }}
      >
        <color attach="background" args={["#1a120a"]} />
        <Suspense fallback={null}>
          {/* Enough fill that the whole inscription reads; the torch adds the drama. */}
          <ambientLight intensity={0.42} color="#ffe6c4" />
          <hemisphereLight args={["#8a6a3a", "#1a120a", 0.5]} />
          <directionalLight position={[-3, 4, 4]} intensity={0.75} color="#e0b866" />
          <directionalLight position={[3, -2, 4]} intensity={0.25} color="#c9a34a" />
          <Wall slots={slots} onTap={onTap} interactive={interactive} hintSide={hintSide} />
          <Dust />
          <CameraSway />
        </Suspense>
      </Canvas>
      {/* vignette */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(10,6,2,0.55) 100%)" }}
      />
    </div>
  );
}

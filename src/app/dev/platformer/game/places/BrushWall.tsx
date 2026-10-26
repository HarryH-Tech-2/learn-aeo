"use client";

/**
 * The buried wall: from spelling to reading. A dig on the west bank at golden
 * hour, and a limestone wall whose inscription lies under sand. The learner
 * drags across it to brush the sand away, a sign at a time; a sign that is new
 * introduces itself the moment it comes out. When the whole word is clear it
 * is read: each sign glows in turn, and three stones under the wall offer
 * sounds. A word's silent picture stays under deep sand until the sounds are
 * read, is chosen by meaning, and is then seen in place. One panel a word.
 *
 * No avatar and no physics: the pointer is the brush (R3F pointer events on
 * the sand), the stones are clicked or taken with 1, 2, 3.
 */
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { signInfo, socketFilled, soundChoices, stationOfSocket } from "../lesson";
import { game, playerPos, useGame, type Lesson } from "../store";
import { answer, closeTeach, complete, teach } from "../answers";
import { sfx } from "../audio";
import { say } from "../voice";
import { burst } from "../Particles";
import { Daylight } from "../Light";
import { Water } from "../Sky";
import { Landscape, Model, groundHeight } from "../Scenery";
import { Plaque, SERIF, drawLabel, stoneFill, useCanvasTexture } from "../kit";
import { worldBox, type GameTextures } from "../textures";

// ─── where the dig is ───

/**
 * Everything below is laid out in the wall's own space: the face is the plane
 * z = 0 looking along +Z, the ground is y = 0, the camera stands on the +Z
 * side. The whole dig is then turned so the low sun comes along the wall from
 * the left and rakes across the carving, and set on a mound on the west bank,
 * looking out over the river.
 */
const TURN = -1.269;
const COS = Math.cos(TURN);
const SIN = Math.sin(TURN);
const SITE_X = -78;
const SITE_Z = -200;
/** The top of the mound clears every dune within reach of it, so no crest cuts across the view of the wall. */
const SITE_Y = (() => {
  let top = -Infinity;
  for (let x = -40; x <= 40; x += 8) for (let z = -40; z <= 40; z += 8) top = Math.max(top, groundHeight(SITE_X + x, SITE_Z + z));
  return top + 0.6;
})();

function toWorld(x: number, y: number, z: number, out: THREE.Vector3): THREE.Vector3 {
  return out.set(SITE_X + x * COS + z * SIN, SITE_Y + y, SITE_Z - x * SIN + z * COS);
}

// ─── the wall, in metres ───

const PANEL_H = 2.4;
const PANEL_Y = 2.1;
const PANEL_GAP = 2.6;
/** the signs sit a little above the middle of a panel, leaving room for their sounds underneath */
const SIGN_ROW = 0.46;
const BRUSH_RADIUS = 0.42;
const GRID = 10;
const CLEAR_THRESHOLD = 0.8;
const STONE_SPREAD = 1.7;

type Phase = "brush" | "read" | "det" | "done";

type Cell = {
  symbol: string;
  sound: string;
  /** sign: read aloud when the word is clear · given: carved, not asked · silent: a silent picture nobody asks for · det: the silent picture that is asked for (deep sand) */
  kind: "sign" | "given" | "silent" | "det";
  socket?: number;
};

type PanelPlan = { cells: Cell[] };

type PanelApi = { clearCell: (i: number) => void; clearRest: () => void; blowDet: () => void };

type Ui = { panel: number; phase: Phase; cursor: number; offer: boolean };

type Dims = { w: number; cs: number; xs: number[] };

function buildPanels(lesson: Lesson): PanelPlan[] {
  return lesson.phrases.map((phrase, p) => {
    const cells: Cell[] = phrase.sockets.map((sk, i) => ({ symbol: sk.symbol, sound: sk.sound, kind: sk.given ? "given" : "sign", socket: i }));
    const det = lesson.stations.find((s) => s.kind === "det" && s.phrase === p);
    if (det) cells.push({ symbol: det.target, sound: "silent", kind: "det" });
    // a silent picture nobody asks for is still part of the word: it is uncovered with the rest and left unread
    else if (phrase.det) cells.push({ symbol: phrase.det.symbol, sound: "silent", kind: "silent" });
    return { cells };
  });
}

function cellX(plan: PanelPlan, cs: number, i: number): number {
  return (i - (plan.cells.length - 1) / 2) * cs;
}

/** Deterministic grain, so the sand is the same sand on every mount. */
function lcg(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

// ─── the carving ───

function CarvedPanel({ plan, phrase, x, dims }: { plan: PanelPlan; phrase: number; x: number; dims: Dims }) {
  const lesson = useGame().lesson;
  const progress = lesson?.progress ?? 0;
  const cw = 1536;
  const ch = Math.round((cw * PANEL_H) / dims.w);
  const ppm = cw / dims.w;
  const face = useCanvasTexture(
    cw,
    ch,
    (ctx) => {
      ctx.clearRect(0, 0, cw, ch);
      // a dressed field in the masonry for the word to sit in
      ctx.fillStyle = "rgba(255,246,228,0.2)";
      ctx.fillRect(14, 14, cw - 28, ch - 28);
      ctx.strokeStyle = "rgba(90,60,25,0.4)";
      ctx.lineWidth = 5;
      ctx.strokeRect(14, 14, cw - 28, ch - 28);
      const size = dims.cs * ppm * 0.74;
      plan.cells.forEach((cell, i) => {
        const cx = cw / 2 + cellX(plan, dims.cs, i) * ppm;
        const cy = ch * SIGN_ROW;
        const quiet = cell.kind === "silent" || cell.kind === "det";
        // a lit lower edge and a dark cut: enough to read as carved under a raking sun
        drawLabel(ctx, cell.symbol, true, cx + 3, cy + 3, size, "rgba(255,249,232,0.8)");
        drawLabel(ctx, cell.symbol, true, cx, cy, size, quiet ? "rgba(58,38,12,0.55)" : "#33210d");
        const det = lesson ? lesson.stations.findIndex((s) => s.kind === "det" && s.phrase === phrase) : -1;
        const socket = lesson && cell.socket !== undefined ? lesson.phrases[phrase].sockets[cell.socket] : undefined;
        const shown =
          cell.kind === "given" || cell.kind === "silent" ? true : cell.kind === "det" ? det >= 0 && det < progress : !!lesson && !!socket && socketFilled(lesson, phrase, socket, progress);
        if (!shown) return;
        ctx.font = `600 ${Math.floor(dims.cs * ppm * (quiet ? 0.13 : 0.2))}px ${SERIF}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = quiet ? "rgba(74,50,22,0.75)" : "#4a3216";
        ctx.fillText(cell.sound, cx, cy + size * 0.74);
      });
    },
    [progress, plan, dims.w, dims.cs],
    plan.cells.map((c) => c.symbol).join(""),
  );
  return (
    <mesh position={[x, PANEL_Y, 0.012]} renderOrder={1}>
      <planeGeometry args={[dims.w, PANEL_H]} />
      <meshStandardMaterial map={face} transparent depthWrite={false} roughness={0.9} />
    </mesh>
  );
}

// ─── the sand ───

type BrushPose = { x: number; y: number; over: boolean; down: boolean };

function SandPanel({
  index,
  plan,
  x,
  dims,
  tex,
  apis,
  accepts,
  onCleared,
  brush,
}: {
  index: number;
  plan: PanelPlan;
  x: number;
  dims: Dims;
  tex: GameTextures;
  apis: React.RefObject<(PanelApi | undefined)[]>;
  /** is this the panel being brushed, right now? */
  accepts: () => boolean;
  onCleared: (cell: number) => void;
  brush: React.RefObject<BrushPose>;
}) {
  const s = useRef({ dirty: false, lastX: -1, lastY: -1, dust: 0, done: plan.cells.map(() => false) });
  const sand = useMemo(() => {
    const cw = 1024;
    const ch = Math.round((cw * PANEL_H) / dims.w);
    const ppm = cw / dims.w;
    const canvas = document.createElement("canvas");
    canvas.width = cw;
    canvas.height = ch;
    const ctx = canvas.getContext("2d")!;
    const detAt = plan.cells.findIndex((c) => c.kind === "det");
    // everything to the right of this is deep sand, which no brush shifts
    const detLeft = detAt >= 0 ? cw / 2 + (cellX(plan, dims.cs, detAt) - dims.cs / 2) * ppm : cw;

    const r = lcg(7919 * (index + 1));
    const base = ctx.createLinearGradient(0, 0, 0, ch);
    base.addColorStop(0, "#e2bd7e");
    base.addColorStop(1, "#c79a58");
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, cw, ch);
    // wind-laid streaks, then grain
    ctx.globalAlpha = 0.18;
    for (let i = 0; i < 26; i++) {
      ctx.fillStyle = r() < 0.5 ? "#f3d9a4" : "#a67c42";
      ctx.fillRect(r() * cw - 80, r() * ch, 160 + r() * 260, 2 + r() * 5);
    }
    const tones = ["#f0d9a3", "#b8935a", "#8a6a3a", "#e3c68b", "#6f5530"];
    for (let i = 0; i < cw * ch * 0.1; i++) {
      ctx.fillStyle = tones[Math.floor(r() * tones.length)];
      ctx.globalAlpha = 0.3 + r() * 0.45;
      const sz = 1 + r() * 2.2;
      ctx.fillRect(r() * cw, r() * ch, sz, sz);
    }
    ctx.globalAlpha = 1;
    if (detAt >= 0) {
      // the deep drift over the silent picture: darker at the foot, heaped against the wall
      const deep = ctx.createLinearGradient(0, 0, 0, ch);
      deep.addColorStop(0, "rgba(120,84,40,0.12)");
      deep.addColorStop(1, "rgba(96,64,28,0.5)");
      ctx.fillStyle = deep;
      ctx.fillRect(detLeft, 0, cw - detLeft, ch);
      ctx.fillStyle = "rgba(70,46,18,0.35)";
      ctx.fillRect(detLeft - 2, 0, 4, ch);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
    const cover = plan.cells.map(() => new Uint8Array(GRID * GRID));
    return { canvas, ctx, texture, cw, ch, ppm, detLeft, cover };
  }, [plan, dims.w, dims.cs, index]);

  const normalMap = useMemo(() => {
    const t = tex.sand.normalMap.clone();
    t.repeat.set(dims.w / 2.5, PANEL_H / 2.5);
    t.needsUpdate = true;
    return t;
  }, [tex, dims.w]);

  useEffect(
    () => () => {
      sand.texture.dispose();
      normalMap.dispose();
    },
    [sand, normalMap],
  );

  // what the wall can be told to do, whoever asks (a stroke, the "clear it for me" stone, the dev aid)
  useEffect(() => {
    const { ctx, cw, ch, ppm, detLeft } = sand;
    const list = apis.current;
    const wipe = (x0: number, x1: number, feather: number) => {
      ctx.save();
      ctx.globalCompositeOperation = "destination-out";
      const g = ctx.createLinearGradient(x0 - feather, 0, x1 + feather, 0);
      const span = x1 - x0 + feather * 2;
      g.addColorStop(0, "rgba(0,0,0,0)");
      g.addColorStop(Math.min(0.49, feather / span), "rgba(0,0,0,1)");
      g.addColorStop(Math.max(0.51, 1 - feather / span), "rgba(0,0,0,1)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(x0 - feather, 0, span, ch);
      ctx.restore();
      s.current.dirty = true;
    };
    list[index] = {
      clearCell: (i) => {
        s.current.done[i] = true;
        const cx = cw / 2 + cellX(plan, dims.cs, i) * ppm;
        const half = (dims.cs * ppm) / 2;
        // never into the deep sand next door
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, detLeft, ch);
        ctx.clip();
        wipe(cx - half + 10, cx + half - 10, 14);
        ctx.restore();
      },
      clearRest: () => {
        ctx.save();
        ctx.globalCompositeOperation = "destination-out";
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, detLeft, ch);
        ctx.restore();
        s.current.dirty = true;
      },
      blowDet: () => {
        ctx.save();
        ctx.globalCompositeOperation = "destination-out";
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, cw, ch);
        ctx.restore();
        s.current.dirty = true;
      },
    };
    return () => {
      list[index] = undefined;
    };
  }, [sand, apis, index, plan, dims.cs]);

  useFrame(() => {
    if (!s.current.dirty) return;
    s.current.dirty = false;
    sand.texture.needsUpdate = true;
  });

  /** One dab of the brush at a canvas point: sand out, and the coverage of any sign under it up. */
  const dab = (px: number, py: number) => {
    const { ctx, cw, ch, ppm, detLeft, cover } = sand;
    const radius = BRUSH_RADIUS * ppm;
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, detLeft, ch);
    ctx.clip();
    ctx.globalCompositeOperation = "destination-out";
    const g = ctx.createRadialGradient(px, py, radius * 0.25, px, py, radius);
    g.addColorStop(0, "rgba(0,0,0,1)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(px, py, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    s.current.dirty = true;

    // coverage is kept on a small grid over each sign and updated from the dab itself: the canvas is never read back
    const side = dims.cs * ppm;
    const step = side / GRID;
    const core = radius * 0.7;
    const cy = ch * SIGN_ROW;
    for (let i = 0; i < plan.cells.length; i++) {
      if (s.current.done[i] || plan.cells[i].kind === "det") continue;
      const left = cw / 2 + cellX(plan, dims.cs, i) * ppm - side / 2;
      const top = cy - side / 2;
      if (px + core < left || px - core > left + side || py + core < top || py - core > top + side) continue;
      const t = cover[i];
      const gx0 = Math.max(0, Math.floor((px - core - left) / step));
      const gx1 = Math.min(GRID - 1, Math.floor((px + core - left) / step));
      const gy0 = Math.max(0, Math.floor((py - core - top) / step));
      const gy1 = Math.min(GRID - 1, Math.floor((py + core - top) / step));
      for (let gy = gy0; gy <= gy1; gy++) {
        for (let gx = gx0; gx <= gx1; gx++) {
          const dx = left + (gx + 0.5) * step - px;
          const dy = top + (gy + 0.5) * step - py;
          if (dx * dx + dy * dy <= core * core) t[gy * GRID + gx] = 1;
        }
      }
      let cleared = 0;
      for (let k = 0; k < t.length; k++) cleared += t[k];
      if (cleared / t.length >= CLEAR_THRESHOLD) {
        s.current.done[i] = true;
        onCleared(i);
      }
    }
  };

  const stroke = (e: ThreeEvent<PointerEvent>, start: boolean) => {
    const uv = e.uv;
    if (!uv) return;
    const b = brush.current;
    b.x = x + (uv.x - 0.5) * dims.w;
    b.y = PANEL_Y + (uv.y - 0.5) * PANEL_H;
    b.over = true;
    b.down = e.buttons !== 0 || start;
    if (!b.down || !accepts()) {
      s.current.lastX = -1;
      return;
    }
    e.stopPropagation();
    const px = uv.x * sand.cw;
    const py = (1 - uv.y) * sand.ch;
    const st = s.current;
    // a fast drag is a line, not two dots: dab along it
    if (!start && st.lastX >= 0) {
      const dx = px - st.lastX;
      const dy = py - st.lastY;
      const n = Math.min(24, Math.floor(Math.hypot(dx, dy) / (BRUSH_RADIUS * sand.ppm * 0.5)));
      for (let k = 1; k < n; k++) dab(st.lastX + (dx * k) / n, st.lastY + (dy * k) / n);
    }
    dab(px, py);
    st.lastX = px;
    st.lastY = py;
    const now = performance.now();
    if (now - st.dust > 70) {
      st.dust = now;
      burst(e.point, 2, [0.95, 0.8, 0.55], 1.1, { up: 0.7, size: 0.06, life: 0.55, gravity: -2.5 });
    }
  };

  return (
    <mesh
      position={[x, PANEL_Y, 0.03]}
      renderOrder={2}
      onPointerDown={(e) => stroke(e, true)}
      onPointerMove={(e) => stroke(e, false)}
      onPointerUp={() => {
        brush.current.down = false;
        s.current.lastX = -1;
      }}
      onPointerOut={() => {
        brush.current.over = false;
        brush.current.down = false;
        s.current.lastX = -1;
      }}
    >
      <planeGeometry args={[dims.w, PANEL_H]} />
      <meshStandardMaterial map={sand.texture} normalMap={normalMap} transparent depthWrite={false} roughness={1} />
    </mesh>
  );
}

/** The brush in the learner's hand: it hangs over the wall where the pointer is, and scrubs while the button is down. */
function BrushTool({ brush, shown }: { brush: React.RefObject<BrushPose>; shown: () => boolean }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const g = ref.current;
    const b = brush.current;
    if (!g) return;
    g.visible = b.over && shown();
    if (!g.visible) return;
    const t = clock.elapsedTime;
    const scrub = b.down ? 1 : 0;
    g.position.set(b.x + Math.sin(t * 26) * 0.05 * scrub, b.y + 0.05 + Math.cos(t * 19) * 0.03 * scrub, b.down ? 0.2 : 0.34);
    g.rotation.set(0.5, 0, -0.5 + Math.sin(t * 26) * 0.12 * scrub);
  });
  return (
    <group ref={ref} visible={false}>
      <mesh position={[0, 0.34, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.04, 0.5, 10]} />
        <meshStandardMaterial color="#6b4a2c" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.07, 0]}>
        <boxGeometry args={[0.2, 0.06, 0.07]} />
        <meshStandardMaterial color="#b8862e" metalness={1} roughness={0.35} />
      </mesh>
      <mesh position={[0, -0.04, 0]} castShadow>
        <boxGeometry args={[0.19, 0.17, 0.05]} />
        <meshStandardMaterial color="#e8d6a8" roughness={1} />
      </mesh>
    </group>
  );
}

// ─── the stones under the wall ───

function Stone({
  label,
  glyph,
  hotkey,
  index,
  position,
  tint,
  fx,
  onPick,
  tex,
}: {
  label: string;
  glyph: boolean;
  hotkey: string;
  index: number;
  position: [number, number, number];
  tint: string;
  /** set to 1 by whoever judges a pick wrong; the stone shakes and flashes it off */
  fx: React.RefObject<number[]>;
  onPick: (index: number) => void;
  tex: GameTextures;
}) {
  const group = useRef<THREE.Group>(null);
  const mat = useRef<THREE.MeshStandardMaterial>(null);
  const lines = label.split("\n");
  const face = useCanvasTexture(
    320,
    224,
    (ctx) => {
      stoneFill(ctx, 320, 224, tint, label.codePointAt(0) ?? 1);
      ctx.strokeStyle = "rgba(90,60,25,0.55)";
      ctx.lineWidth = 6;
      ctx.strokeRect(12, 12, 296, 200);
      if (glyph) drawLabel(ctx, label, true, 160, 118, 150, "#2a1b0e");
      else if (lines.length > 1) lines.forEach((line, i) => drawLabel(ctx, line, false, 160, 112 + (i - (lines.length - 1) / 2) * 56, 62, "#2a1b0e"));
      else drawLabel(ctx, label, false, 160, 116, label.length <= 2 ? 170 : Math.max(60, 400 / label.length), "#2a1b0e");
      if (hotkey) {
        ctx.font = `600 26px ${SERIF}`;
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "rgba(60,40,15,0.6)";
        ctx.fillText(hotkey, 26, 38);
      }
    },
    [label, glyph, hotkey, tint],
    glyph ? label : "",
  );
  useFrame(({ clock }, dtRaw) => {
    const g = group.current;
    if (!g) return;
    const dt = Math.min(dtRaw, 1 / 20);
    const f = (fx.current[index] = Math.max(0, (fx.current[index] ?? 0) - dt * 2.2));
    g.position.set(position[0] + Math.sin(clock.elapsedTime * 70) * 0.06 * f, position[1], position[2]);
    if (mat.current) mat.current.emissive.setRGB(f * 1.6, f * 0.12, f * 0.08);
  });
  return (
    <group ref={group} position={position} rotation={[-0.2, 0, 0]}>
      <mesh
        castShadow
        receiveShadow
        onClick={(e) => {
          e.stopPropagation();
          onPick(index);
        }}
        onPointerOver={() => {
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "";
        }}
      >
        <boxGeometry args={[1.35, 0.95, 0.4]} />
        <meshStandardMaterial map={tex.limestone.map} roughness={0.85} color="#e9d3a2" />
      </mesh>
      <mesh position={[0, 0, 0.205]}>
        <planeGeometry args={[1.25, 0.875]} />
        <meshStandardMaterial ref={mat} map={face} roughness={0.8} emissive="#000000" />
      </mesh>
    </group>
  );
}

/** The frame that glows round the sign being read (or round the drift that hides the silent picture). */
function GlowFrame({ x, y, size }: { x: number; y: number; size: number }) {
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ color: new THREE.Color(0.3, 2.1, 1.9), transparent: true, toneMapped: false, depthWrite: false }), []);
  useEffect(() => () => mat.dispose(), [mat]);
  useFrame(({ clock }) => {
    mat.opacity = 0.65 + Math.sin(clock.elapsedTime * 4) * 0.3;
  });
  const t = 0.05;
  const h = size / 2;
  return (
    <group position={[x, y, 0.06]} renderOrder={3}>
      {(
        [
          [0, h, size + t, t],
          [0, -h, size + t, t],
          [-h, 0, t, size + t],
          [h, 0, t, size + t],
        ] as [number, number, number, number][]
      ).map(([px, py, w, hh], i) => (
        <mesh key={i} position={[px, py, 0]} material={mat} renderOrder={3}>
          <planeGeometry args={[w, hh]} />
        </mesh>
      ))}
    </group>
  );
}

// ─── the dig around it ───

function Dig({ tex, length }: { tex: GameTextures; length: number }) {
  const geo = useMemo(
    () => ({
      wall: worldBox(length, 3.75, 1.2, 3),
      band: worldBox(length + 0.12, 0.7, 1.32, 5.6, 0.7),
      cap: worldBox(length + 0.3, 0.32, 1.5, 3.6),
    }),
    [length],
  );
  const sandMap = useMemo(() => {
    const t = tex.sand.normalMap.clone();
    t.repeat.set(26, 26);
    t.needsUpdate = true;
    return t;
  }, [tex]);
  useEffect(() => () => sandMap.dispose(), [sandMap]);
  const heaps = useMemo(() => {
    const r = lcg(311);
    const out: { p: [number, number, number]; s: [number, number, number] }[] = [];
    // drifts against the ends of the wall and behind it: only the inscribed stretch has been dug out
    for (const side of [-1, 1]) {
      out.push({ p: [side * (length / 2 - 0.5), 0.2, 0.2], s: [3.2, 1.5, 2.4] });
      out.push({ p: [side * (length / 2 + 1.6), 0, -0.4], s: [4.2, 2.3, 3.4] });
    }
    for (let i = 0; i < 7; i++) out.push({ p: [(r() - 0.5) * length, -0.1, -1.8 - r() * 1.6], s: [3 + r() * 3, 1.6 + r() * 1.9, 2 + r() * 1.5] });
    return out;
  }, [length]);
  return (
    <>
      {/* the mound the dig sits on: its top is the ground, its skirts run down into the dunes */}
      <mesh position={[0, -15, 0]} receiveShadow>
        <cylinderGeometry args={[34, 96, 30, 56, 1]} />
        <meshStandardMaterial color="#dca863" roughness={1} normalMap={sandMap} normalScale={new THREE.Vector2(0.6, 0.6)} />
      </mesh>
      <mesh geometry={geo.wall} position={[0, 1.475, -0.6]} castShadow receiveShadow>
        <meshStandardMaterial map={tex.limestone.map} normalMap={tex.limestone.normalMap} roughness={0.85} color="#fbeccb" />
      </mesh>
      <mesh geometry={geo.band} position={[0, 3.7, -0.6]} castShadow receiveShadow>
        <meshStandardMaterial map={tex.band.map} normalMap={tex.band.normalMap} roughness={0.8} normalScale={new THREE.Vector2(1.5, 1.5)} />
      </mesh>
      <mesh geometry={geo.cap} position={[0, 4.21, -0.6]} castShadow receiveShadow>
        <meshStandardMaterial map={tex.limestone.map} normalMap={tex.limestone.normalMap} roughness={0.85} color="#fff1d2" />
      </mesh>
      {heaps.map((h, i) => (
        <mesh key={i} position={h.p} scale={h.s} castShadow receiveShadow>
          <sphereGeometry args={[1, 20, 12]} />
          <meshStandardMaterial color="#dfae6a" roughness={1} normalMap={sandMap} normalScale={new THREE.Vector2(0.5, 0.5)} />
        </mesh>
      ))}
      {/* the survey: stakes at the foot of the trench, a ladder, the finds */}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * (length / 2 - 2.2), 0.45, 2.6]} castShadow>
          <cylinderGeometry args={[0.035, 0.035, 0.9, 8]} />
          <meshStandardMaterial color="#6b4a2c" roughness={0.9} />
        </mesh>
      ))}
      <group position={[length / 2 - 1.4, 0, 0.5]} rotation={[-0.28, 0, 0]}>
        {[-0.28, 0.28].map((lx) => (
          <mesh key={lx} position={[lx, 1.7, 0]} castShadow>
            <cylinderGeometry args={[0.04, 0.04, 3.6, 8]} />
            <meshStandardMaterial color="#7a5232" roughness={0.9} />
          </mesh>
        ))}
        {[0.5, 1.1, 1.7, 2.3, 2.9].map((ry) => (
          <mesh key={ry} position={[0, ry, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.03, 0.03, 0.6, 8]} />
            <meshStandardMaterial color="#7a5232" roughness={0.9} />
          </mesh>
        ))}
      </group>
      <Suspense fallback={null}>
        <Model url="/models/objects/jar.glb" size={1.0} position={[-length / 2 + 1.2, 0, 1.5]} />
        <Model url="/models/objects/jar.glb" size={0.7} position={[-length / 2 + 2.1, 0, 1.1]} rotation={1.2} />
      </Suspense>
    </>
  );
}

// ─── the level ───

export default function BrushWall({ tex }: { tex: GameTextures }) {
  const g = useGame();
  const lesson = g.lesson;
  const camera = useThree((st) => st.camera);
  const size = useThree((st) => st.size);
  const gl = useThree((st) => st.gl);

  const panels = useMemo(() => (lesson ? buildPanels(lesson) : []), [lesson?.stations, lesson?.phrases]); // eslint-disable-line react-hooks/exhaustive-deps
  const dims = useMemo<Dims>(() => {
    const most = Math.max(1, ...panels.map((p) => p.cells.length));
    const w = Math.min(12, most * 1.5 + 1.6);
    const n = panels.length;
    return { w, cs: Math.min(1.5, (w - 1.6) / most), xs: panels.map((_, p) => (p - (n - 1) / 2) * (w + PANEL_GAP)) };
  }, [panels]);
  const wallLength = Math.max(1, panels.length) * (dims.w + PANEL_GAP) + 8;

  const [ui, setUi] = useState<Ui>({ panel: 0, phase: "brush", cursor: -1, offer: false });
  const uiRef = useRef(ui);
  const revealed = useMemo(() => panels.map((p) => p.cells.map(() => false)), [panels]);
  const apis = useRef<(PanelApi | undefined)[]>([]);
  const brush = useRef<BrushPose>({ x: 0, y: PANEL_Y, over: false, down: false });
  const fx = useRef<number[]>([0, 0, 0, 0]);
  const t = useRef({ since: 0, readIn: -1, skipIn: -1, doneIn: -1, teachSym: "", teachFor: 0, reached: 0, uncovered: 0, camX: dims.xs[0] ?? 0, placed: false });
  const tmp = useMemo(() => ({ a: new THREE.Vector3(), b: new THREE.Vector3(), look: new THREE.Vector3() }), []);

  const go = (patch: Partial<Ui>) => {
    uiRef.current = { ...uiRef.current, ...patch };
    setUi(uiRef.current);
  };

  /** Where, in the world, a point on the wall's own plan is (a fresh vector: for bursts and the like). */
  const at = (x: number, y: number, z: number) => toWorld(x, y, z, new THREE.Vector3());

  const stoneX = (i: number, n: number) => (dims.xs[uiRef.current.panel] ?? 0) + (i - (n - 1) / 2) * STONE_SPREAD;

  /** What the stones offer just now: sounds for the sign that glows, or pictures for the word's silent ending. */
  const choicesFor = (l: Lesson | null, u: Ui): { index: number; glyph: boolean; picked: "sign" | "sound"; options: { option: string; label: string }[] } | null => {
    if (!l) return null;
    if (u.phase === "read") {
      const cell = panels[u.panel]?.cells[u.cursor];
      if (!cell || cell.socket === undefined) return null;
      const index = stationOfSocket(l, u.panel, l.phrases[u.panel].sockets[cell.socket]);
      if (index < 0 || index !== l.progress) return null;
      const station = l.stations[index];
      if (station.kind === "read") return { index, glyph: false, picked: "sign", options: station.options.map((o) => ({ option: o, label: o })) };
      return { index, glyph: false, picked: "sound", options: soundChoices(station).map((c) => ({ option: c.option, label: c.sound })) };
    }
    if (u.phase === "det") {
      const station = l.stations[l.progress];
      if (!station || station.kind !== "det") return null;
      return { index: l.progress, glyph: true, picked: "sign", options: station.options.map((o) => ({ option: o, label: o })) };
    }
    return null;
  };

  const finish = () => {
    t.current.doneIn = 2.5;
    go({ phase: "done", cursor: -1, offer: false });
  };

  const startPanel = (p: number) => {
    t.current.reached = p;
    t.current.since = 0;
    go({ panel: p, phase: "brush", cursor: -1, offer: false });
  };

  /** The word on this panel has been read: its silent picture, the next panel, a silent picture left behind on an earlier one, or the end. */
  const afterRead = () => {
    const l = game.get().lesson;
    const cur = l ? l.stations[l.progress] : undefined;
    const p = uiRef.current.panel;
    if (cur?.kind === "det" && cur.phrase === p) go({ phase: "det", cursor: -1 });
    else if (t.current.reached + 1 < panels.length) startPanel(t.current.reached + 1);
    else if (cur?.kind === "det") go({ panel: cur.phrase, phase: "det", cursor: -1 });
    else finish();
  };

  const afterDet = () => {
    const l = game.get().lesson;
    const cur = l ? l.stations[l.progress] : undefined;
    if (t.current.reached + 1 < panels.length) startPanel(t.current.reached + 1);
    else if (cur?.kind === "det") go({ panel: cur.phrase, phase: "det", cursor: -1 });
    else finish();
  };

  /** The glow arrives at a sign. One that has come round before in this word is only said again, and the glow moves on by itself. */
  const enter = (p: number, cursor: number) => {
    const l = game.get().lesson;
    const cell = panels[p]?.cells[cursor];
    if (!l || !cell || cell.socket === undefined) return;
    const index = stationOfSocket(l, p, l.phrases[p].sockets[cell.socket]);
    if (index === l.progress) return;
    t.current.skipIn = 0.9;
    sfx.ankh(cursor);
    say(signInfo(cell.symbol).said);
  };

  const moveOn = () => {
    const u = uiRef.current;
    const cells = panels[u.panel]?.cells ?? [];
    let next = -1;
    for (let i = u.cursor + 1; i < cells.length; i++) {
      if (cells[i].kind === "sign") {
        next = i;
        break;
      }
    }
    if (next < 0) {
      afterRead();
      return;
    }
    go({ cursor: next });
    enter(u.panel, next);
  };

  const startRead = () => {
    const u = uiRef.current;
    if (t.current.teachSym) closeTeach(t.current.teachSym);
    t.current.teachSym = "";
    apis.current[u.panel]?.clearRest();
    go({ phase: "read", cursor: -1, offer: false });
    moveOn();
  };

  /** A sign has come out of the sand (a stroke crossed the threshold, or it was cleared for the learner). */
  const reveal = (p: number, i: number) => {
    const state = game.get();
    const l = state.lesson;
    const u = uiRef.current;
    const cell = panels[p]?.cells[i];
    if (!l || !cell || state.status !== "playing" || u.phase !== "brush" || u.panel !== p || revealed[p][i] || cell.kind === "det") return;
    revealed[p][i] = true;
    apis.current[p]?.clearCell(i);
    t.current.uncovered += 1;
    sfx.ankh(t.current.uncovered);
    const where = at(dims.xs[p] + cellX(panels[p], dims.cs, i), PANEL_Y, 0.3);
    burst(where, 14, [0.95, 0.8, 0.55], 2.4, { up: 1.6, size: 0.08, life: 0.8, gravity: -4 });
    // a new sign introduces itself as it comes out: nothing to get wrong, and from now on it may be asked for
    const station = cell.kind === "sign" ? l.stations.find((s) => s.phrase === p && s.kind === "sign" && s.target === cell.symbol) : undefined;
    if (station && station.teach && !l.taught.includes(cell.symbol)) {
      if (t.current.teachSym && t.current.teachSym !== cell.symbol) closeTeach(t.current.teachSym);
      teach(cell.symbol, where);
      t.current.teachSym = cell.symbol;
      t.current.teachFor = 6;
    }
    const left = panels[p].cells.some((c, k) => c.kind !== "det" && !revealed[p][k]);
    // the word is clear: a moment to take in the last card, then it is read
    if (!left) t.current.readIn = t.current.teachSym ? 5 : 1.3;
  };

  /** Clear the next sign that is still covered, for the learner ("Clear it for me", gentle mode, the dev aid). */
  const clearNext = (): string => {
    const u = uiRef.current;
    const cells = panels[u.panel]?.cells ?? [];
    const i = cells.findIndex((c, k) => c.kind !== "det" && !revealed[u.panel][k]);
    if (i < 0) return "";
    reveal(u.panel, i);
    return cells[i].symbol;
  };

  const pick = (i: number) => {
    const state = game.get();
    if (state.status !== "playing") return;
    const u = uiRef.current;
    const c = choicesFor(state.lesson, u);
    const chosen = c?.options[i];
    if (!c || !chosen || !state.lesson) return;
    const where = at(stoneX(i, c.options.length), 0.9, 1.1);
    const outcome = answer(c.index, chosen.option, where, c.picked);
    if (outcome === "wrong") fx.current[i] = 1;
    else if (outcome === "ignored") {
      // cannot happen while brushing teaches every new sign first; if it ever does, teach now rather than stall
      const station = state.lesson.stations[c.index];
      if (station.teach && !state.lesson.taught.includes(station.target)) {
        teach(station.target, where);
        t.current.teachSym = station.target;
        t.current.teachFor = 5;
      }
    } else if (u.phase === "det") {
      apis.current[u.panel]?.blowDet();
      const cells = panels[u.panel].cells;
      burst(at(dims.xs[u.panel] + cellX(panels[u.panel], dims.cs, cells.length - 1), PANEL_Y, 0.4), 30, [0.95, 0.8, 0.55], 3.4, { up: 2.4, size: 0.09, life: 1, gravity: -4 });
      afterDet();
    } else moveOn();
  };

  // the latest of these, for listeners that outlive a render
  const live = useRef({ pick, clearNext });
  live.current = { pick, clearNext };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const n = ["Digit1", "Digit2", "Digit3", "Numpad1", "Numpad2", "Numpad3"].indexOf(e.code);
      if (n >= 0) live.current.pick(n % 3);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // a finger on the canvas brushes; it must not scroll or zoom the page
  useEffect(() => {
    const el = gl.domElement;
    const before = el.style.touchAction;
    el.style.touchAction = "none";
    return () => {
      el.style.touchAction = before;
      document.body.style.cursor = "";
    };
  }, [gl]);

  // standing advice follows the phase
  useEffect(() => {
    game.set({
      hint:
        ui.phase === "brush"
          ? "Drag across the wall to brush the sand away."
          : ui.phase === "read"
            ? "Read it: what sound is the glowing sign?"
            : ui.phase === "det"
              ? "One sign is still under the sand, and it is never read aloud. Which picture ends the word?"
              : null,
    });
  }, [ui.phase]);
  useEffect(
    () => () => {
      game.set({ hint: null });
    },
    [],
  );

  // dev aid (this whole page is dev only): __causeway.place.auto() takes the next correct step through the real path
  useEffect(() => {
    const w = window as unknown as { __causeway?: Record<string, unknown> };
    const aid = (w.__causeway ??= {});
    aid.place = {
      auto: (): string => {
        const state = game.get();
        if (state.status !== "playing" || !state.lesson) return `not playing (${state.status})`;
        const u = uiRef.current;
        if (u.phase === "brush") {
          if (t.current.readIn >= 0) return "the word is clear: waiting to read it";
          const symbol = live.current.clearNext();
          return symbol ? `brushed ${symbol} clear on panel ${u.panel + 1}` : "nothing left to brush";
        }
        if (u.phase === "done") return "read: finishing";
        if (t.current.skipIn >= 0) return "a sign that has come round again: moving on";
        const c = choicesFor(state.lesson, u);
        if (!c) return `${u.phase}: nothing to choose`;
        const station = state.lesson.stations[c.index];
        const i = c.options.findIndex((o) => (station.kind === "read" ? o.option === signInfo(station.target).sound : o.option === station.target));
        if (i < 0) return "no right stone among the choices";
        live.current.pick(i);
        return `${u.phase}: picked “${c.options[i].label}” for ${station.target}`;
      },
    };
    return () => {
      delete aid.place;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFrame((state, dtRaw) => {
    const dt = Math.min(dtRaw, 1 / 20);
    const st = t.current;
    const u = uiRef.current;
    const s = game.get();
    const px = dims.xs[u.panel] ?? 0;

    if (s.status === "playing") {
      if (u.phase === "brush") {
        st.since += dt;
        // help is offered after a while, and at once to anyone who asked for the gentle game
        if (!u.offer && st.readIn < 0 && (s.campaign.gentle || st.since > 20)) go({ offer: true });
      }
      if (st.teachSym) {
        st.teachFor -= dt;
        if (st.teachFor <= 0) {
          closeTeach(st.teachSym);
          st.teachSym = "";
        }
      }
      if (st.readIn >= 0) {
        st.readIn -= dt;
        if (st.readIn < 0) startRead();
      }
      if (st.skipIn >= 0) {
        st.skipIn -= dt;
        if (st.skipIn < 0) moveOn();
      }
      if (st.doneIn >= 0) {
        st.doneIn -= dt;
        if (st.doneIn < 0) complete(at(px, PANEL_Y, 1));
      }
    }

    // the sun's shadow box follows the panel in hand
    toWorld(px, 0, 1, playerPos);

    // the camera faces the wall square on, far enough back for the panel to fit the screen, and drifts a little with the pointer.
    // The bar at the top hides a third of the screen, so the wall is held just above the middle and the stones just below it.
    const cam = camera as THREE.PerspectiveCamera;
    const tan = Math.tan(THREE.MathUtils.degToRad(cam.fov / 2));
    const aspect = size.width / Math.max(1, size.height);
    const d = Math.max(7.2, (dims.w / 2 + 0.6) / (tan * aspect * 0.92));
    const eye = Math.max(0.9, PANEL_Y - 0.06 * 2 * d * tan);
    const cdt = Math.min(dtRaw, 0.25);
    st.camX += (px - st.camX) * (1 - Math.exp(-2.2 * cdt));
    toWorld(st.camX + state.pointer.x * 0.5, eye + state.pointer.y * 0.25, d, tmp.a);
    toWorld(st.camX + state.pointer.x * 0.15, eye, 0, tmp.b);
    if (!st.placed) {
      st.placed = true;
      camera.position.copy(tmp.a);
      tmp.look.copy(tmp.b);
    }
    camera.position.lerp(tmp.a, 1 - Math.exp(-5 * cdt));
    tmp.look.lerp(tmp.b, 1 - Math.exp(-7 * cdt));
    camera.lookAt(tmp.look);
  });

  if (!lesson) return null;
  const choices = g.status === "playing" ? choicesFor(lesson, ui) : null;
  const plan = panels[ui.panel];
  const px = dims.xs[ui.panel] ?? 0;
  const glowAt = !plan ? -1 : ui.phase === "read" ? ui.cursor : ui.phase === "det" ? plan.cells.length - 1 : -1;
  const n = choices?.options.length ?? 0;
  const reading = choices && ui.phase === "read" ? lesson.stations[choices.index] : null;
  const detStation = choices && ui.phase === "det" ? lesson.stations[choices.index] : null;

  return (
    <>
      <Daylight />
      <Water />
      <Landscape tex={tex} />
      <group position={[SITE_X, SITE_Y, SITE_Z]} rotation={[0, TURN, 0]}>
        <Dig tex={tex} length={wallLength} />
        {panels.map((p, i) => (
          <group key={i}>
            <CarvedPanel plan={p} phrase={i} x={dims.xs[i]} dims={dims} />
            <SandPanel
              index={i}
              plan={p}
              x={dims.xs[i]}
              dims={dims}
              tex={tex}
              apis={apis}
              brush={brush}
              accepts={() => game.get().status === "playing" && uiRef.current.phase === "brush" && uiRef.current.panel === i && t.current.readIn < 0}
              onCleared={(cell) => reveal(i, cell)}
            />
          </group>
        ))}
        <BrushTool brush={brush} shown={() => uiRef.current.phase === "brush" && game.get().status === "playing"} />
        {plan && glowAt >= 0 && <GlowFrame x={px + cellX(plan, dims.cs, glowAt)} y={PANEL_Y + (0.5 - SIGN_ROW) * PANEL_H} size={dims.cs * 0.94} />}

        {choices &&
          choices.options.map((o, i) => (
            <Stone
              key={`${ui.panel}:${ui.phase}:${ui.cursor}:${i}:${o.label}`}
              label={o.label}
              glyph={choices.glyph}
              hotkey={String(i + 1)}
              index={i}
              position={[px + (i - (n - 1) / 2) * STONE_SPREAD, 0.52, 1.0]}
              tint="#ead9b4"
              fx={fx}
              onPick={pick}
              tex={tex}
            />
          ))}
        {reading && <Plaque label={reading.target} glyph caption="what sound is" lit position={[px - 3.75, 0.62, 1.0]} scale={0.95} hideNear={false} />}
        {detStation && (
          <Plaque label={`“${lesson.phrases[detStation.phrase].meaning.split(",")[0]}”`} glyph={false} caption="the silent picture for" lit position={[px - 3.75, 0.62, 1.0]} scale={0.95} hideNear={false} />
        )}
        {ui.phase === "brush" && ui.offer && g.status === "playing" && (
          <Stone label={"Clear it\nfor me"} glyph={false} hotkey="" index={3} position={[px + 3.9, 0.52, 1.0]} tint="#cfe3df" fx={fx} onPick={() => clearNext()} tex={tex} />
        )}
      </group>
    </>
  );
}

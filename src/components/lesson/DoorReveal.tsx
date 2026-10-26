"use client";

/**
 * The sealed door at the start of Lesson 1.
 *
 * The learner's name is carved on the lintel under a crust of sand. They
 * brush one cell clear at a time (drag a finger or the mouse); each sign
 * that emerges is carved in gold (chisel taps, a glint, sparks), flies up to
 * its place on the progress strip, and gets a ten-second card: the letter it
 * writes, its sound, what the picture is. When the last sign is clear the
 * door opens full screen (DoorOpening) and the name reads.
 */
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { DoorName } from "@/lib/content/door-name";
import { speak, toSpeakable } from "@/lib/speech";
import { trackEvent } from "@/lib/analytics";
import { chisel } from "@/lib/sfx";
import { flyGlyph } from "@/lib/fly-glyph";
import DoorOpening from "@/components/lesson/DoorOpening";

const GLYPH_FONT = "'Noto Sans Egyptian Hieroglyphs', serif";
/** Fraction of a cell's sand that must be brushed before the sign counts as uncovered: most of the cell, so the sign is nearly bare before it lights up. */
const CLEAR_THRESHOLD = 0.8;
/** Cartouche ring: side padding, top/bottom padding and border, in px. The side padding must clear the curve of the rounded ends (see cartoucheRadius). */
const RING_PAD_X = 24;
const RING_PAD_Y = 8;
const RING_BORDER = 2;
const GRID = 10;

type Props = {
  door: DoorName;
  canSpeak: boolean;
  /** A sign has been uncovered (index into door.cells) */
  onReveal: (index: number) => void;
  /** The door is open; the lesson moves on */
  onOpen: () => void;
};

type Phase = "brush" | "card" | "opening" | "opened";

/** How long after the chisel the sign leaves for the strip */
const FLY_AFTER_MS = 650;
/** Sparks off the chisel: direction of each, in px */
const SPARKS = [
  [-26, -22], [24, -26], [-30, 8], [30, 4], [-12, 28], [14, 26],
];

function prefersLessMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Deterministic grain so the sand looks the same on every render of a cell. */
function lcg(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

// ─── One cell of sand over one sign ───

function SandCell({
  size,
  seed,
  active,
  revealed,
  onCleared,
}: {
  size: number;
  seed: number;
  active: boolean;
  revealed: boolean;
  onCleared: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const touched = useRef<Uint8Array>(new Uint8Array(GRID * GRID));
  const done = useRef(false);
  const dpr = typeof window === "undefined" ? 1 : Math.min(window.devicePixelRatio || 1, 2);

  const paint = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    c.width = Math.round(size * dpr);
    c.height = Math.round(size * dpr);
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = "source-over";
    const r = lcg(seed);
    // base: a warm crust, darker toward the edges
    const g = ctx.createRadialGradient(size * 0.45, size * 0.4, size * 0.1, size / 2, size / 2, size * 0.8);
    g.addColorStop(0, "#d9bc82");
    g.addColorStop(1, "#9c7a45");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    // grains
    const tones = ["#f0d9a3", "#b8935a", "#8a6a3a", "#e3c68b", "#6f5530"];
    const n = Math.round(size * size * 0.35);
    for (let i = 0; i < n; i++) {
      ctx.fillStyle = tones[Math.floor(r() * tones.length)];
      ctx.globalAlpha = 0.35 + r() * 0.5;
      const s = 0.8 + r() * 1.6;
      ctx.fillRect(r() * size, r() * size, s, s);
    }
    // a few cracks
    ctx.globalAlpha = 0.25;
    ctx.strokeStyle = "#5a4326";
    ctx.lineWidth = 0.8;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      let x = r() * size;
      let y = r() * size;
      ctx.moveTo(x, y);
      for (let k = 0; k < 5; k++) {
        x += (r() - 0.5) * size * 0.4;
        y += (r() - 0.5) * size * 0.4;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }, [size, seed, dpr]);

  useLayoutEffect(() => {
    if (revealed) return;
    touched.current = new Uint8Array(GRID * GRID);
    done.current = false;
    paint();
  }, [paint, revealed]);

  function brushAt(clientX: number, clientY: number) {
    const c = canvasRef.current;
    if (!c || done.current) return;
    const rect = c.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * size;
    const y = ((clientY - rect.top) / rect.height) * size;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const radius = size * 0.2;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = "destination-out";
    const g = ctx.createRadialGradient(x, y, radius * 0.25, x, y, radius);
    g.addColorStop(0, "rgba(0,0,0,1)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";

    // Coverage: mark grid cells within the brush's solid core.
    const cell = size / GRID;
    const core = radius * 0.7;
    const t = touched.current;
    const gx0 = Math.max(0, Math.floor((x - core) / cell));
    const gx1 = Math.min(GRID - 1, Math.floor((x + core) / cell));
    const gy0 = Math.max(0, Math.floor((y - core) / cell));
    const gy1 = Math.min(GRID - 1, Math.floor((y + core) / cell));
    for (let gy = gy0; gy <= gy1; gy++) {
      for (let gx = gx0; gx <= gx1; gx++) {
        const cx = (gx + 0.5) * cell;
        const cy = (gy + 0.5) * cell;
        if ((cx - x) ** 2 + (cy - y) ** 2 <= core * core) t[gy * GRID + gx] = 1;
      }
    }
    let cleared = 0;
    for (let i = 0; i < t.length; i++) cleared += t[i];
    if (cleared / t.length >= CLEAR_THRESHOLD) {
      done.current = true;
      onCleared();
    }
  }

  function onDown(e: ReactPointerEvent<HTMLCanvasElement>) {
    if (!active) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    brushAt(e.clientX, e.clientY);
  }
  function onMove(e: ReactPointerEvent<HTMLCanvasElement>) {
    if (!active || e.buttons === 0) return;
    brushAt(e.clientX, e.clientY);
  }

  return (
    <motion.canvas
      ref={canvasRef}
      initial={false}
      animate={{ opacity: revealed ? 0 : 1 }}
      transition={{ duration: 0.5 }}
      onPointerDown={onDown}
      onPointerMove={onMove}
      className={`absolute inset-0 w-full h-full ${revealed ? "pointer-events-none" : active ? "cursor-crosshair" : "pointer-events-none"}`}
      style={{ touchAction: "none" }}
      aria-hidden="true"
    />
  );
}

// ─── The door ───

export default function DoorReveal({ door, canSpeak, onReveal, onOpen }: Props) {
  const cells = door.cells;
  const [current, setCurrent] = useState(0);
  const [phase, setPhase] = useState<Phase>("brush");
  const lintelRef = useRef<HTMLDivElement>(null);
  const [cellSize, setCellSize] = useState(56);
  // the cell being carved just now (gold glint and sparks), and the cells themselves, for the flight to the strip
  const [carving, setCarving] = useState<number | null>(null);
  const cellRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [fullScreen, setFullScreen] = useState(false);

  // Size the cells to the lintel: one row where it fits, wrapping for long names.
  useEffect(() => {
    const el = lintelRef.current;
    if (!el) return;
    const fit = () => {
      // lintel padding (32) + cartouche padding and border, with a little slack
      const w = el.clientWidth - 32 - 2 * (RING_PAD_X + RING_BORDER) - 8;
      const gap = 6;
      const oneRow = Math.floor((w - gap * (cells.length - 1)) / cells.length);
      setCellSize(Math.max(48, Math.min(76, oneRow)));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [cells.length]);

  const seenBefore = (i: number) => cells.slice(0, i).some((c) => c.glyph.symbol === cells[i].glyph.symbol);

  function cleared(i: number) {
    if (i !== current || phase !== "brush") return;
    trackEvent("door_sign_revealed", { index: i, sign: cells[i].glyph.symbol });
    chisel();
    setCarving(i);
    setPhase("card");
    window.setTimeout(() => setCarving((c) => (c === i ? null : c)), 1300);
    // the sign lights on the strip when it lands there (at once if it cannot fly)
    window.setTimeout(() => {
      const el = cellRefs.current[i];
      if (!el) return onReveal(i);
      flyGlyph(cells[i].glyph.symbol, el.getBoundingClientRect()).then(() => onReveal(i));
    }, FLY_AFTER_MS);
  }

  function next() {
    if (current + 1 < cells.length) {
      setCurrent(current + 1);
      setPhase("brush");
    } else {
      trackEvent("door_opened", { name_length: cells.length });
      setPhase("opening");
      // the door fills the window and opens there; with less motion asked for, the small leaves below just slide apart
      if (prefersLessMotion()) window.setTimeout(() => setPhase("opened"), 1900);
      else setFullScreen(true);
    }
  }

  const cell = phase === "card" ? cells[current] : null;
  const revealedCount = phase === "brush" ? current : Math.min(current + 1, cells.length);
  const open = phase === "opening" || phase === "opened";
  // Ends rounded to one row's height, even when a long name wraps: a full pill on two
  // rows would curve in far enough to run under the square corner cells.
  const cartoucheRadius = (cellSize + 2 * (RING_PAD_Y + RING_BORDER)) / 2;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-2xl mx-auto">
      {fullScreen && (
        <DoorOpening
          name={door.name}
          signs={cells.map((c) => c.glyph.symbol)}
          onDone={() => {
            setFullScreen(false);
            setPhase("opened");
          }}
        />
      )}
      <div className="text-center mb-4">
        <p className="font-body text-sm text-gold-500 mb-2 font-semibold">The sealed door</p>
        <h2 className="font-display text-2xl md:text-3xl text-sand-100 font-light">
          {open ? (
            <>
              The door reads <span className="text-gradient-gold font-medium">{door.name}</span>
            </>
          ) : (
            <>
              {revealedCount} of {cells.length} signs uncovered
            </>
          )}
        </h2>
      </div>

      <div className="lesson-sheet p-0 overflow-hidden">
        {/* Lintel: the name in a cartouche, under sand */}
        <div ref={lintelRef} className="relative bg-[#1a120a] border-b border-gold-700/40 px-4 py-5">
          <div className="absolute inset-0 opacity-40 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 50% 0%, rgba(212,168,50,0.28), transparent 65%)" }} aria-hidden="true" />
          <div
            className={`relative mx-auto w-fit max-w-full flex flex-wrap justify-center gap-1.5 transition-colors duration-700 ${
 open ? "border-gold-400 shadow-[0_0_40px_rgba(212,168,50,0.35)]" : "border-gold-700/50"
 }`}
            style={{ padding: `${RING_PAD_Y}px ${RING_PAD_X}px`, borderWidth: RING_BORDER, borderStyle: "solid", borderRadius: cartoucheRadius }}
            role="list"
            aria-label={`The name ${door.name}, sign by sign`}
          >
            {cells.map((c, i) => {
              const isRevealed = i < current || (i === current && phase !== "brush");
              const isActive = i === current && phase === "brush";
              return (
                <div
                  key={i}
                  ref={(el) => {
                    cellRefs.current[i] = el;
                  }}
                  role="listitem"
                  aria-label={isRevealed ? `${c.letter.toUpperCase()}: ${c.glyph.transliteration}` : "Still under the sand"}
                  className={`relative shrink-0 ${carving === i ? "overflow-visible" : "overflow-hidden"} rounded-sm bg-black/10 ${isActive ? "ring-2 ring-gold-400/80 animate-pulse" : ""}`}
                  style={{ width: cellSize, height: cellSize }}
                >
                  <span
                    className={`absolute inset-0 flex items-center justify-center leading-none transition-colors duration-500 ${isRevealed ? "text-gold-300" : "text-gold-700/60"} ${carving === i ? "carve-glow" : ""}`}
                    style={{ fontFamily: GLYPH_FONT, fontSize: cellSize * 0.62, textShadow: isRevealed ? "0 0 18px rgba(212,168,50,0.45)" : "none" }}
                    aria-hidden="true"
                  >
                    {c.glyph.symbol}
                  </span>
                  <SandCell size={cellSize} seed={i * 7919 + c.glyph.symbol.codePointAt(0)!} active={isActive} revealed={isRevealed} onCleared={() => cleared(i)} />
                  {carving === i && (
                    <>
                      <span className="absolute inset-0 overflow-hidden rounded-sm" aria-hidden="true">
                        <span className="carve-sweep" />
                      </span>
                      {SPARKS.map(([x, y], k) => (
                        <span key={k} className="carve-spark" style={{ ["--sx" as string]: `${x}px`, ["--sy" as string]: `${y}px`, animationDelay: `${[0, 0.12, 0.26][k % 3]}s` }} aria-hidden="true" />
                      ))}
                    </>
                  )}
                </div>
              );
            })}
          </div>
          {phase === "brush" && (
            <p className="relative text-center font-body text-xs text-sand-400 mt-3">
              <span className="hidden sm:inline">Drag over the glowing cell to brush the sand away.</span>
              <span className="sm:hidden">Rub the glowing cell with your finger to brush the sand away.</span>
              <button
                type="button"
                onClick={() => cleared(current)}
                className="ml-2 text-gold-500 hover:text-gold-400 underline underline-offset-4"
              >
                Uncover it for me
              </button>
            </p>
          )}
        </div>

        {/* Below the lintel: the door leaves, or the card for the sign just uncovered */}
        <div className="relative min-h-[15rem] sm:min-h-[16rem]">
          <AnimatePresence mode="wait">
            {cell ? (
              <motion.div
                key={`card-${current}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35 }}
                className="p-5 sm:p-7"
              >
                <div className="flex items-start gap-4 sm:gap-6">
                  <div className="shrink-0 text-center">
                    <span
                      className="block text-6xl sm:text-7xl text-gold-400 leading-none"
                      style={{ fontFamily: GLYPH_FONT, textShadow: "0 0 40px rgba(212,168,50,0.25)" }}
                      aria-hidden="true"
                    >
                      {cell.glyph.symbol}
                    </span>
                    <span className="inline-block mt-2 px-2 py-0.5 border border-gold-500/40 bg-gold-500/10 font-body text-sm text-gold-400 font-semibold rounded-xl">
                      {cell.letter}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-body text-sm text-sand-500 mb-1 font-semibold">
                      {seenBefore(current) ? "Seen this one already" : `Sign ${current + 1} of ${cells.length}`}
                    </p>
                    <p className="font-display text-xl sm:text-2xl text-sand-100 leading-tight">{cell.glyph.meaning}</p>
                    <p className="font-body text-sm text-sand-300 mt-1">
                      Read <em className="text-gold-300">{cell.glyph.transliteration}</em>, said <span className="text-gold-300">{cell.glyph.pronunciation}</span>
                      {canSpeak && (
                        <button
                          type="button"
                          onClick={() => speak(toSpeakable(cell.glyph.pronunciation))}
                          className="ml-2 font-body text-sm text-gold-500 hover:text-gold-400 border border-gold-700/30 hover:border-gold-500/50 px-2 py-0.5 transition-colors font-semibold rounded-xl"
                          title={`Hear: ${cell.glyph.pronunciation}`}
                        >
                          ▶ Hear it
                        </button>
                      )}
                    </p>
                    <p className="font-body text-sm text-sand-400 leading-relaxed mt-3">
                      {seenBefore(current) ? "Same sign, same sound. Names repeat letters, and cartouches repeat signs." : cell.glyph.origin ?? cell.note}
                    </p>
                    {!seenBefore(current) && cell.glyph.origin && (
                      <p className="font-body text-xs text-sand-500 leading-relaxed mt-2">{cell.note}</p>
                    )}
                  </div>
                </div>
                <div className="mt-5 text-center sm:text-right">
                  <button type="button" onClick={next} className="lesson-btn text-sm py-3 px-8 justify-center">
                    {current + 1 < cells.length ? "Brush the next sign" : "Open the door"}
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div key="leaves" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 overflow-hidden">
                {/* What lies behind */}
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a0703]" aria-hidden={!open}>
                  <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(ellipse at 50% 60%, rgba(212,168,50,0.35), rgba(10,7,3,0) 60%)" }} />
                  <AnimatePresence>
                    {phase === "opened" && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative text-center px-6">
                        <p className="font-body text-sm text-gold-500 mb-2 font-semibold">Base Camp is open</p>
                        <p className="font-body text-sm text-sand-300 max-w-sm mx-auto mb-5">
                          You just read {door.signs.length} alphabet sign{door.signs.length === 1 ? "" : "s"} with nothing but a brush. Prove they stuck, then meet the rest.
                        </p>
                        <button type="button" onClick={onOpen} className="lesson-btn text-sm py-3.5 px-8 justify-center">
                          Step inside
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                {/* The two leaves */}
                {(["left", "right"] as const).map((side) => (
                  <motion.div
                    key={side}
                    initial={false}
                    animate={{ x: open ? (side === "left" ? "-102%" : "102%") : "0%" }}
                    transition={{ duration: 1.8, ease: [0.7, 0, 0.3, 1] }}
                    className={`absolute top-0 bottom-0 w-1/2 ${side === "left" ? "left-0 border-r" : "right-0 border-l"} border-[#0a0703]`}
                    style={{
                      backgroundImage:
                        side === "left"
                          ? "linear-gradient(90deg, #2a1c0e 0%, #3a2814 60%, #241708 100%)"
                          : "linear-gradient(270deg, #2a1c0e 0%, #3a2814 60%, #241708 100%)",
                    }}
                    aria-hidden="true"
                  >
                    <div
                      className="absolute inset-0 opacity-[0.12] text-gold-300 select-none overflow-hidden leading-[1.35] break-all p-3 text-2xl"
                      style={{ fontFamily: GLYPH_FONT }}
                    >
                      {side === "left" ? "𓋹𓊹𓂀𓆣𓇳𓅓𓏏𓈖𓄿𓊪𓂋𓆑𓎡𓋴𓈙𓏏𓐍𓆓𓉔𓎛𓄡𓊃𓈎𓎼𓍿𓂧𓇋𓅱𓃀𓂝" : "𓂝𓃀𓅱𓇋𓂧𓍿𓎼𓈎𓊃𓄡𓎛𓉔𓆓𓐍𓏏𓈙𓋴𓎡𓆑𓂋𓊪𓄿𓈖𓏏𓅓𓇳𓆣𓂀𓊹𓋹"}
                    </div>
                    <div className={`absolute top-1/2 -translate-y-1/2 ${side === "left" ? "right-3" : "left-3"} w-5 h-5 rounded-full border-2 border-gold-700/60 bg-[#1a120a]`} />
                  </motion.div>
                ))}
                {!open && (
                  <div className="absolute inset-x-0 bottom-3 text-center pointer-events-none">
                    <p className="font-body text-sm text-sand-500/80 font-semibold">Sealed · {door.name}</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

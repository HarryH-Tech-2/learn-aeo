"use client";

/**
 * WallReader — read one carved phrase on the torch-lit 3D wall: tap the signs
 * in READING order. Used for every lesson's "Read it" moment and inside the
 * Stela Builder / Walk the Hall mechanics.
 *
 * Supports honorific transposition: `written` gives the display order of the
 * sign indices when it differs from reading order (e.g. Amun carved first,
 * read last).
 */

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import type { WallSlot } from "@/components/three/TombWall";
import type { WallSign } from "@/lib/tomb-wall";
import { GLYPHS_FACE_LEFT } from "@/lib/tomb-wall";
import { trackExerciseAnswer, type ExerciseKind } from "@/lib/analytics";

const TombWall = dynamic(() => import("@/components/three/TombWall"), {
  ssr: false,
  loading: () => (
    <div className="w-full aspect-[4/3] sm:aspect-[16/10] border border-gold-700/20 bg-[#1a120a] flex items-center justify-center">
      <p className="font-body text-sm text-sand-500 animate-pulse font-semibold">Lighting the torch…</p>
    </div>
  ),
});

const GLYPH_STYLE = { fontFamily: "'Noto Sans Egyptian Hieroglyphs', serif" } as const;
const WRONG_FLASH_MS = 520;

export type WallReaderResult = { mistakes: number; elapsedMs: number };

type Props = {
  /** Signs in reading order */
  signs: WallSign[];
  /** Display order of sign indices (left→right before any RTL flip). Defaults to reading order. */
  written?: number[];
  /** Carve right-to-left (signs mirrored, first written sign on the right) */
  rtl?: boolean;
  /** Small label above the wall */
  title?: string;
  /** Instruction under the wall */
  prompt?: string;
  /** Shown once the phrase is read */
  reveal?: { translit: string; meaning: string; note?: string };
  /** A tip shown after the second wrong tap */
  tip?: string;
  /** GA4 exercise kind and question label */
  exercise: ExerciseKind;
  question: string;
  /** Button label for continuing (omit to hide the button — parent continues) */
  continueLabel?: string;
  onComplete: (result: WallReaderResult) => void;
  stageKey?: string | number;
};

export default function WallReader({
  signs,
  written,
  rtl = false,
  title,
  prompt = "Tap the signs in reading order",
  reveal,
  tip,
  exercise,
  question,
  continueLabel,
  onComplete,
  stageKey,
}: Props) {
  const n = signs.length;
  // left→right display order of sign indices
  const display = useMemo(() => {
    const base = written && written.length === n ? [...written] : Array.from({ length: n }, (_, i) => i);
    return rtl ? base.reverse() : base;
  }, [written, rtl, n]);
  const mirrored = GLYPHS_FACE_LEFT ? rtl : !rtl;

  const [tapped, setTapped] = useState<number[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [wrongFlash, setWrongFlash] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const start = useRef(performance.now());
  const flashTimer = useRef<number | null>(null);
  const completed = useRef(false);

  // Reset when the phrase changes
  useEffect(() => {
    setTapped([]);
    setMistakes(0);
    setWrongFlash(null);
    setDone(false);
    completed.current = false;
    start.current = performance.now();
  }, [stageKey, question]);

  useEffect(
    () => () => {
      if (flashTimer.current) window.clearTimeout(flashTimer.current);
    },
    []
  );

  const slots: WallSlot[] = useMemo(
    () =>
      display.map((signIdx, slot) => {
        const order = tapped.indexOf(signIdx);
        let tone: WallSlot["tone"] = "none";
        if (done) tone = "right";
        else if (wrongFlash === slot) tone = "wrong";
        else if (order >= 0) tone = "chalk";
        return { glyph: signs[signIdx].glyph, mirrored, badge: order >= 0 ? String(order + 1) : undefined, tone };
      }),
    [display, tapped, wrongFlash, done, signs, mirrored]
  );

  function onTap(slot: number) {
    if (done) return;
    const signIdx = display[slot];
    if (tapped.includes(signIdx)) return;
    if (signIdx === tapped.length) {
      const next = [...tapped, signIdx];
      setTapped(next);
      if (next.length === n && !completed.current) {
        completed.current = true;
        setDone(true);
        trackExerciseAnswer({ exercise, questionType: rtl ? "read-rtl" : "read-ltr", question, correct: mistakes === 0 });
        if (!continueLabel) onComplete({ mistakes, elapsedMs: performance.now() - start.current });
      }
    } else {
      setMistakes((m) => m + 1);
      setWrongFlash(slot);
      if (flashTimer.current) window.clearTimeout(flashTimer.current);
      flashTimer.current = window.setTimeout(() => setWrongFlash(null), WRONG_FLASH_MS);
    }
  }

  return (
    <div>
      {title && <p className="font-body text-sm text-gold-500 text-center mb-3 font-semibold">{title}</p>}
      <TombWall slots={slots} onTap={onTap} interactive={!done} stageKey={stageKey ?? question} />

      <div className="mt-4 min-h-[2.5rem] text-center">
        {!done ? (
          <>
            <p className="font-body text-sm text-sand-500 font-semibold">
              {prompt}
              {tapped.length > 0 && (
                <span className="text-sand-600 normal-case tracking-normal ml-2">
                  · {tapped.length}/{n}
                </span>
              )}
            </p>
            {mistakes >= 2 && tip && (
              <motion.p initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="font-body text-sm text-sand-300 mt-2">
                <span className="text-gold-500 text-sm mr-2 font-semibold">Tip</span>
                {tip}
              </motion.p>
            )}
          </>
        ) : (
          <p className="font-body text-sm text-green-300 font-semibold">
            Read {mistakes === 0 ? "cleanly" : `with ${mistakes} slip${mistakes > 1 ? "s" : ""}`}
          </p>
        )}
      </div>

      {/* Accessible / touch-friendly mirror of the wall */}
      {!done && (
        <div className="mt-2 flex justify-center gap-2 flex-wrap">
          {slots.map((s, i) => {
            let cls = "w-12 h-12 sm:w-14 sm:h-14 border text-center transition-all duration-150 relative ";
            if (s.tone === "chalk") cls += "border-gold-500/60 bg-gold-500/10";
            else if (s.tone === "wrong") cls += "border-red-500/60 bg-red-500/10";
            else cls += "border-gold-700/15 bg-obsidian-lighter hover:border-gold-500/40";
            return (
              <button key={i} type="button" onClick={() => onTap(i)} className={cls} aria-label={`sign ${i + 1} of ${n}${s.badge ? `, tapped ${s.badge}` : ""}`}>
                <span
                  className="block text-2xl sm:text-3xl text-gold-400 leading-none"
                  style={{ ...GLYPH_STYLE, transform: s.mirrored ? "scaleX(-1)" : undefined, display: "inline-block" }}
                >
                  {s.glyph}
                </span>
                {s.badge && (
                  <span className="absolute -top-2 -left-2 w-5 h-5 rounded-full bg-gold-400 text-obsidian text-[11px] font-bold flex items-center justify-center">
                    {s.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {done && reveal && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-4 p-4 md:p-5 border ${mistakes === 0 ? "border-green-500/40 bg-green-500/10" : "border-gold-500/30 bg-gold-500/5"} rounded-xl`}
          >
            <div className="flex flex-wrap items-end gap-x-2 gap-y-3 justify-center mb-3" style={GLYPH_STYLE}>
              {signs.map((sg, i) => (
                <div key={i} className="text-center min-w-[3rem]">
                  <span className={`block text-4xl leading-none ${sg.role === "det" ? "text-green-300" : "text-gold-400"}`}>{sg.glyph}</span>
                  <span
                    className={`block font-body text-[11px] mt-1 ${sg.role === "det" ? "text-green-300" : sg.role === "comp" ? "text-sand-500" : "text-sand-300"}`}
                    style={{ fontFamily: "inherit" }}
                  >
                    {sg.role === "det" ? "det." : sg.role === "comp" ? `(${sg.value})` : sg.value}
                  </span>
                </div>
              ))}
            </div>
            <p className="font-body text-sm text-sand-100 text-center">
              <span className="font-display italic text-lg text-gold-300">{reveal.translit}</span>
              <span className="text-sand-400"> · </span>
              <span className="font-medium">{reveal.meaning}</span>
            </p>
            {reveal.note && <p className="font-body text-xs text-sand-400 mt-2 text-center max-w-xl mx-auto">{reveal.note}</p>}
            {continueLabel && (
              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => onComplete({ mistakes, elapsedMs: performance.now() - start.current })}
                  className="lesson-btn py-3 px-8 text-sm justify-center"
                >
                  {continueLabel}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

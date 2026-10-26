"use client";

/**
 * Stela Builder — Lesson 6's signature mechanic.
 *
 * The ḥtp-dj-nswt offering formula is the most common text in Egyptian art.
 * Its structure IS the lesson: assemble it from its blocks — king gives →
 * god → "that he may give" → the offerings → "for the ka of" → the name —
 * then read the opening on the wall.
 */

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { XP_REWARDS } from "@/lib/gamification";
import { trackExerciseAnswer, trackExerciseComplete } from "@/lib/analytics";
import { GLYPH_STYLE, shuffle, type MechanicProps } from "./types";

type Block = { id: string; glyphs: string; translit: string; english: string; why: string };

// Unicode code points verified against the Gardiner list.
export const FORMULA_BLOCKS: Block[] = [
  { id: "htp", glyphs: "𓇓𓏏𓊵𓏙", translit: "ḥtp dj nswt", english: "An offering which the king gives", why: "Every formula opens like this: the king is the theoretical source of all offerings, so his sedge-plant is written first (honorific transposition)." },
  { id: "god", glyphs: "𓊨𓁹𓀭 𓎟 𓊽𓂧𓅱𓊖", translit: "wsꞽr nb ḏdw", english: "(to) Osiris, lord of Djedu", why: "The god who passes the offering on (usually Osiris or Anubis), named with his titles. Djedu (Busiris) was Osiris’s cult town in the Delta." },
  { id: "dif", glyphs: "𓏙𓆑 𓉐𓂋𓏏𓊤", translit: "dj.f prt-ḫrw", english: "that he may give a voice-offering", why: "A ‘voice offering’: the offerings become real when the formula is spoken aloud. prt-ḫrw literally ‘what goes forth at the voice’." },
  { id: "goods", glyphs: "𓏏𓏐 𓏊 𓃒 𓅬", translit: "t ḥnqt kꜣ ꜣpd", english: "bread, beer, oxen and fowl", why: "The standard list (bread, beer, oxen, fowl), often followed by alabaster, linen and ‘every good and pure thing on which a god lives’." },
  { id: "nkan", glyphs: "𓈖 𓂓 𓈖", translit: "n kꜣ n", english: "for the ka of", why: "The ka is the life-force that needs feeding. ‘For the ka of’ introduces the beneficiary." },
  { id: "name", glyphs: "𓇋𓏠𓈖𓇌 𓐙𓊤", translit: "ꞽmny mꜣꜥ-ḫrw", english: "Ameny, true of voice", why: "The dead person’s name and the epithet ‘true of voice’ (justified): he passed the judgement of Osiris." },
];

export default function StelaBuilder({ onXPEarned, onComplete }: MechanicProps) {
  const [pool, setPool] = useState<Block[]>(() => shuffle(FORMULA_BLOCKS));
  const [placed, setPlaced] = useState<Block[]>([]);
  const [checked, setChecked] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [finished, setFinished] = useState(false);
  const [bestCorrect, setBestCorrect] = useState(0);

  const correctness = useMemo(() => placed.map((b, i) => b.id === FORMULA_BLOCKS[i].id), [placed]);
  const allRight = placed.length === FORMULA_BLOCKS.length && correctness.every(Boolean);

  function place(b: Block) {
    if (checked) return;
    setPlaced((p) => [...p, b]);
    setPool((p) => p.filter((x) => x.id !== b.id));
  }
  function unplace(i: number) {
    if (checked) return;
    const b = placed[i];
    setPlaced((p) => p.filter((_, j) => j !== i));
    setPool((p) => [...p, b]);
  }

  function check() {
    if (placed.length !== FORMULA_BLOCKS.length) return;
    setChecked(true);
    const n = correctness.filter(Boolean).length;
    setBestCorrect((b) => Math.max(b, n));
    const a = attempts + 1;
    setAttempts(a);
    trackExerciseAnswer({ exercise: "stela-builder", questionType: "order", question: "htp-dj-nswt", correct: allRight });
    if (allRight) {
      onXPEarned(a === 1 ? XP_REWARDS.mechanicPerfect + XP_REWARDS.mechanicCorrect : XP_REWARDS.mechanicCorrect);
      trackExerciseComplete({ exercise: "stela-builder", score: FORMULA_BLOCKS.length, total: FORMULA_BLOCKS.length, attempts: a });
      setFinished(true);
    }
  }

  function retry() {
    // keep the correct ones, send the wrong ones back
    const keep = placed.filter((_, i) => correctness[i]);
    const back = placed.filter((_, i) => !correctness[i]);
    // positions must stay aligned: rebuild placed with gaps filled later → simpler: keep only a correct prefix
    let prefix = 0;
    while (prefix < placed.length && correctness[prefix]) prefix++;
    setPlaced(placed.slice(0, prefix));
    setPool((p) => shuffle([...p, ...placed.slice(prefix)]));
    void keep;
    void back;
    setChecked(false);
  }

  useEffect(() => {
    if (finished) onComplete({ correct: FORMULA_BLOCKS.length, total: FORMULA_BLOCKS.length });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished]);

  return (
    <div className="lesson-sheet p-6 md:p-8">
      <p className="font-body text-sm text-gold-500 mb-2 font-semibold">Stela builder</p>
      <h3 className="font-display text-2xl text-sand-100 mb-1">Assemble the offering formula</h3>
      <p className="font-body text-sm text-sand-400 mb-5">
        Six blocks, in the order a stela carves them. Tap a block to place it on the stela; tap it again to take it off. Every block you read on a real stela
        will be one of these.
      </p>

      {/* The stela */}
      <div className="relative mx-auto max-w-2xl border-2 border-gold-700/40 bg-gradient-to-b from-[#3a2a18] to-[#2a1c0e] rounded-t-[3rem] p-4 sm:p-6 mb-5">
        <div className="absolute inset-x-8 top-3 h-px bg-gold-700/30" />
        <div className="space-y-2 mt-3 min-h-[12rem]">
          {FORMULA_BLOCKS.map((_, i) => {
            const b = placed[i];
            const ok = checked && b ? correctness[i] : null;
            return (
              <div
                key={i}
                className={`flex items-center gap-3 p-2 sm:p-3 border min-h-[3.5rem] ${
 b ? (ok === null ? "border-gold-500/40 bg-gold-500/5" : ok ? "border-green-500/50 bg-green-500/10" : "border-red-500/50 bg-red-500/10") : "border-dashed border-gold-700/30"
 } rounded-xl`}
              >
                <span className="font-body text-[10px] text-sand-600 w-4">{i + 1}</span>
                {b ? (
                  <button type="button" onClick={() => unplace(i)} className="flex-1 text-left flex flex-wrap items-center gap-x-3 gap-y-1" disabled={checked}>
                    <span className="text-2xl sm:text-3xl text-gold-400 leading-none whitespace-nowrap" style={GLYPH_STYLE}>
                      {b.glyphs}
                    </span>
                    <span className="font-display italic text-sm text-sand-200">{b.translit}</span>
                    <span className="font-body text-xs text-sand-400">{b.english}</span>
                  </button>
                ) : (
                  <span className="font-body text-xs text-sand-600">…</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Pool */}
      {!finished && (
        <div className="grid sm:grid-cols-2 gap-2 mb-4">
          <AnimatePresence>
            {pool.map((b) => (
              <motion.button
                key={b.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                type="button"
                onClick={() => place(b)}
                disabled={checked}
                className="text-left p-3 border border-gold-700/15 bg-obsidian-lighter hover:border-gold-500/40 hover:bg-gold-500/5 transition-colors disabled:opacity-50 rounded-xl"
              >
                <span className="block text-2xl text-gold-400 leading-none mb-1 whitespace-nowrap overflow-hidden text-ellipsis" style={GLYPH_STYLE}>
                  {b.glyphs}
                </span>
                <span className="block font-display italic text-sm text-sand-200">{b.translit}</span>
                <span className="block font-body text-xs text-sand-400">{b.english}</span>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      )}

      {!checked && !finished && (
        <div className="text-right">
          <button type="button" onClick={check} disabled={placed.length !== FORMULA_BLOCKS.length} className="lesson-btn py-2.5 px-6 text-sm justify-center disabled:opacity-40">
            Check the stela
          </button>
        </div>
      )}

      {checked && !finished && (
        <div className="p-4 border border-red-500/40 bg-red-500/10 rounded-xl">
          <p className="font-body text-sm text-sand-100">
            {correctness.filter(Boolean).length}/{FORMULA_BLOCKS.length} in place. The correct blocks stay; the rest go back to the pile.
          </p>
          <div className="text-right mt-3">
            <button type="button" onClick={retry} className="lesson-btn py-2.5 px-6 text-sm justify-center">
              Try again
            </button>
          </div>
        </div>
      )}

      {finished && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-4 md:p-5 border border-green-500/40 bg-green-500/10 rounded-xl">
          <p className="font-body text-sm text-sand-100 mb-3">
            The stela reads. {attempts === 1 ? <span className="text-gold-400">First try · +{XP_REWARDS.mechanicPerfect + XP_REWARDS.mechanicCorrect} XP</span> : <span className="text-gold-400">+{XP_REWARDS.mechanicCorrect} XP</span>}
          </p>
          <ul className="space-y-2">
            {FORMULA_BLOCKS.map((b) => (
              <li key={b.id} className="font-body text-xs text-sand-400">
                <span className="font-display italic text-sand-200 mr-2">{b.translit}</span>
                {b.why}
              </li>
            ))}
          </ul>
          <p className="font-body text-xs text-sand-500 mt-3">Best placement: {bestCorrect}/{FORMULA_BLOCKS.length} blocks on your first check.</p>
        </motion.div>
      )}
    </div>
  );
}

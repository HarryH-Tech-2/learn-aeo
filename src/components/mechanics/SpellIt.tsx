"use client";

/**
 * Spell It — Lesson 1's signature mechanic.
 *
 * Part 1 (forge): type any word and watch it assemble sign by sign with the
 * uniliterals — sound ↔ sign, live.
 * Part 2 (read): the reverse. A word is spelled out in signs; you type what it
 * says. Vowels aren't written, so any spelling that maps to the same signs is
 * accepted — which is exactly the lesson.
 * Finale: forge the word you chose into a 3D cartouche.
 */

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { transliterateName, getHieroglyphs } from "@/lib/hieroglyph-translator";
import { XP_REWARDS } from "@/lib/gamification";
import { trackExerciseAnswer, trackExerciseComplete } from "@/lib/analytics";
import { GLYPH_STYLE, shuffle, type MechanicProps } from "./types";

const CartoucheForge = dynamic(() => import("@/components/three/CartoucheForge"), {
  ssr: false,
  loading: () => (
    <div className="w-full aspect-[16/10] border border-gold-700/20 bg-obsidian-light/40 flex items-center justify-center">
      <p className="font-body text-sm text-sand-500 animate-pulse font-semibold">Heating the forge…</p>
    </div>
  ),
});

const TRY_THESE = ["pharaoh", "nile", "moon", "scribe"];
const READ_BANK = ["sun", "ram", "cat", "bird", "moon", "fish", "king", "boat", "gold", "hand", "nile", "water", "temple", "bread", "lion", "star"];
const READ_ROUNDS = 6;

type Phase = "forge" | "read" | "done";

export default function SpellIt({ onXPEarned, onComplete }: MechanicProps) {
  const [phase, setPhase] = useState<Phase>("forge");
  const [text, setText] = useState("");
  const [forged, setForged] = useState("pharaoh"); // what goes into the cartouche at the end
  const parts = useMemo(() => transliterateName(text), [text]);

  // read phase
  const [words] = useState(() => shuffle(READ_BANK).slice(0, READ_ROUNDS));
  const [idx, setIdx] = useState(0);
  const [guess, setGuess] = useState("");
  const [result, setResult] = useState<null | { correct: boolean }>(null);
  const [hint, setHint] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const target = words[idx];
  const targetGlyphs = useMemo(() => (target ? getHieroglyphs(target) : ""), [target]);
  const targetParts = useMemo(() => (target ? transliterateName(target) : []), [target]);

  function startReading() {
    if (text.trim()) setForged(text.trim());
    setPhase("read");
  }

  function check() {
    if (!target || result) return;
    const g = guess.trim().toLowerCase();
    if (!g) return;
    const correct = g === target || getHieroglyphs(g) === targetGlyphs;
    setResult({ correct });
    if (correct) {
      setCorrectCount((c) => c + 1);
      onXPEarned(XP_REWARDS.mechanicCorrect);
    }
    trackExerciseAnswer({ exercise: "spell-it", questionType: hint ? "read-word-hint" : "read-word", question: target, correct });
  }

  function next() {
    if (idx + 1 >= words.length) {
      trackExerciseComplete({ exercise: "spell-it", score: correctCount, total: words.length });
      if (correctCount === words.length) onXPEarned(XP_REWARDS.mechanicPerfect);
      setPhase("done");
      return;
    }
    setIdx((i) => i + 1);
    setGuess("");
    setResult(null);
    setHint(false);
  }

  useEffect(() => {
    if (phase === "done") onComplete({ correct: correctCount, total: words.length });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  return (
    <div className="lesson-sheet p-6 md:p-8">
      <AnimatePresence mode="wait">
        {/* ───────────── Part 1: forge ───────────── */}
        {phase === "forge" && (
          <motion.div key="forge" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <p className="font-body text-sm text-gold-500 mb-2 font-semibold">Spell it · 1 of 2</p>
            <h3 className="font-display text-2xl text-sand-100 mb-1">Type a word. Watch it become hieroglyphs.</h3>
            <p className="font-body text-sm text-sand-400 mb-5">
              Each letter sound picks one of the signs you just learned. Egyptian wrote no vowels, so <span className="text-sand-200">a, e, i, o, u</span> become the
              nearest weak consonant (vulture, reed, chick), and doubled consonants collapse.
            </p>

            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value.replace(/[^a-zA-Z ]/g, "").slice(0, 24))}
              placeholder="your name, or any word…"
              className="w-full bg-obsidian-lighter border border-gold-700/30 focus:border-gold-500/60 outline-none px-4 py-3 font-body text-lg text-sand-100 placeholder:text-sand-600 rounded-xl"
              autoComplete="off"
              spellCheck={false}
            />
            <div className="flex flex-wrap gap-2 mt-3">
              {TRY_THESE.map((w) => (
                <button key={w} type="button" onClick={() => setText(w)} className="font-body text-xs text-sand-400 hover:text-gold-400 border border-gold-700/20 hover:border-gold-500/40 px-3 py-1 transition-colors rounded-xl">
                  {w}
                </button>
              ))}
            </div>

            <div className="mt-6 min-h-[7rem] flex flex-wrap items-end justify-center gap-3">
              <AnimatePresence>
                {parts.map((p, i) => (
                  <motion.div
                    key={`${p.input}-${i}`}
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.25, delay: i * 0.03 }}
                    className="text-center w-16"
                    title={p.mapping.note}
                  >
                    <span className="block text-5xl text-gold-400 leading-none" style={GLYPH_STYLE}>
                      {p.mapping.glyph}
                    </span>
                    <span className="block font-body text-[11px] text-sand-300 mt-1 uppercase tracking-wider">{p.input}</span>
                    <span className="block font-body text-[10px] text-sand-500 italic">{p.mapping.transliteration}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
              {parts.length === 0 && <p className="font-body text-sm text-sand-600 self-center">Your signs will appear here.</p>}
            </div>

            {parts.length > 0 && (
              <p className="font-body text-xs text-sand-500 text-center mt-2">
                {parts.some((p) => "aeiou".includes(p.input)) && "Notice the vowels: an Egyptian scribe would usually have left them out entirely. "}
                Hover a sign to see why it was chosen.
              </p>
            )}

            <div className="text-center mt-6">
              <button type="button" onClick={startReading} className="lesson-btn py-3 px-8 text-sm justify-center">
                Now read some
              </button>
            </div>
          </motion.div>
        )}

        {/* ───────────── Part 2: read ───────────── */}
        {phase === "read" && target && (
          <motion.div key={`read-${idx}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <p className="font-body text-sm text-gold-500 mb-2 font-semibold">
              Spell it · 2 of 2 <span className="text-sand-500 normal-case tracking-normal ml-2">· word {idx + 1}/{words.length}</span>
            </p>
            <h3 className="font-display text-2xl text-sand-100 mb-1">What does this spell?</h3>
            <p className="font-body text-sm text-sand-400 mb-5">An everyday English word, written with the alphabet signs. Sound it out, and remember there are no vowels to help you.</p>

            <div className="flex flex-wrap justify-center gap-2 mb-5" style={GLYPH_STYLE}>
              {targetParts.map((p, i) => (
                <div key={i} className="text-center w-16">
                  <span className="block text-5xl text-gold-400 leading-none">{p.mapping.glyph}</span>
                  <span className={`block font-body text-[11px] mt-1 italic ${result || hint ? "text-sand-300" : "text-transparent"}`} style={{ fontFamily: "inherit" }}>
                    {p.mapping.transliteration}
                  </span>
                </div>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                check();
              }}
              className="flex gap-2 max-w-md mx-auto"
            >
              <input
                type="text"
                value={guess}
                onChange={(e) => setGuess(e.target.value.replace(/[^a-zA-Z]/g, "").slice(0, 16))}
                disabled={!!result}
                placeholder="type the word"
                className="flex-1 bg-obsidian-lighter border border-gold-700/30 focus:border-gold-500/60 outline-none px-4 py-3 font-body text-lg text-sand-100 placeholder:text-sand-600 disabled:opacity-60 rounded-xl"
                autoComplete="off"
                spellCheck={false}
                autoFocus
              />
              <button type="submit" disabled={!!result || !guess.trim()} className="lesson-btn py-3 px-5 text-sm justify-center disabled:opacity-40">
                Check
              </button>
            </form>

            <div className="text-center mt-3 min-h-[1.5rem]">
              {!result && !hint && (
                <button type="button" onClick={() => setHint(true)} className="font-body text-xs text-sand-500 hover:text-gold-400 underline underline-offset-4">
                  Show the sound values
                </button>
              )}
              {!result && hint && <p className="font-body text-xs text-sand-500">Sounds shown under each sign. Now add the vowels back in your head.</p>}
            </div>

            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-4 p-4 border text-center ${result.correct ? "border-green-500/40 bg-green-500/10" : "border-red-500/40 bg-red-500/10"} rounded-xl`}
                >
                  <p className="font-body text-sm text-sand-100">
                    {result.correct ? (
                      <>
                        Yes: <span className="font-medium">{target}</span>
                        {guess.trim().toLowerCase() !== target && <span className="text-sand-400"> (you wrote “{guess}”; same consonants, same signs: that is how Egyptian works)</span>}
                        <span className="text-gold-400 ml-2">+{XP_REWARDS.mechanicCorrect} XP</span>
                      </>
                    ) : (
                      <>
                        It spells <span className="font-medium">{target}</span>: {targetParts.map((p) => p.mapping.transliteration).join("-")}.
                      </>
                    )}
                  </p>
                  <button type="button" onClick={next} className="lesson-btn py-2.5 px-6 text-sm justify-center mt-3">
                    {idx + 1 >= words.length ? "Finish" : "Next word"}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ───────────── Finale ───────────── */}
        {phase === "done" && (
          <motion.div key="done" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <p className="font-body text-sm text-gold-500 mb-2 font-semibold">Spell it · complete</p>
            <h3 className="font-display text-2xl text-sand-100 mb-1">
              {correctCount}/{words.length} read. Now forge “{forged}” in gold.
            </h3>
            <p className="font-body text-sm text-sand-400 mb-5">Every sign in this cartouche is one you can now read. Drag to turn it.</p>
            <CartoucheForge glyphs={transliterateName(forged).map((p) => p.mapping.glyph)} name={forged} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

"use client";

/**
 * Read by torchlight: the last thing in each part of Lesson 1. A few words
 * from the part, one torch. Each word is carved on the lapis panel and the
 * learner picks its reading; a right answer feeds the flame (+3 s), a wrong
 * one makes it gutter (−5 s), and as the torch burns down the dark closes in
 * round the panel. Read them all before it goes out and the flame is kept.
 *
 * Never a wall: it can be skipped, retried, or left after the torch dies,
 * and the lesson carries on the same either way.
 */
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Word } from "@/lib/content/uniliteral-words";
import { XP_REWARDS } from "@/lib/gamification";
import { trackEvent } from "@/lib/analytics";
import { flare, hiss, snuff } from "@/lib/sfx";

const GLYPH_FONT = "'Noto Sans Egyptian Hieroglyphs', serif";
const RIGHT_BONUS_MS = 3000;
const WRONG_COST_MS = 5000;
/** seconds of torch per word to read, plus a little to settle in */
const MS_PER_WORD = 8000;
const SETTLE_MS = 6000;

type Props = {
  /** the part (1-based) this run closes */
  section: number;
  /** the closing part of the lesson: a longer run over every word */
  finale?: boolean;
  /** words to ask about */
  words: Word[];
  /** every word met so far, for the wrong choices */
  known: Word[];
  onXPEarned: (xp: number) => void;
  onDone: () => void;
};

type Round = { word: Word; options: Word[] };
type Phase = "ready" | "burning" | "kept" | "out";

function shuffle<T>(xs: T[]): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildRounds(words: Word[], known: Word[], count: number): Round[] {
  return shuffle(words)
    .slice(0, count)
    .map((word) => {
      const others = shuffle(known.filter((w) => w.id !== word.id && w.meaning !== word.meaning)).slice(0, 2);
      return { word, options: shuffle([word, ...others]) };
    });
}

/** The flame: taller and brighter the more torch is left. */
function Torch({ left, big = false }: { left: number; big?: boolean }) {
  const h = 0.35 + 0.65 * left;
  return (
    <svg viewBox="0 0 40 90" className={`${big ? "w-14 h-32" : "w-10 h-[5.6rem]"} shrink-0`} aria-hidden="true">
      <defs>
        <radialGradient id="torch-glow" cx="50%" cy="60%" r="50%">
          <stop offset="0%" stopColor="#fff4c8" />
          <stop offset="45%" stopColor="#f6b544" />
          <stop offset="100%" stopColor="#c2410c" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g style={{ transformOrigin: "20px 52px", transform: `scale(${0.6 + 0.4 * left}, ${h})`, transition: "transform 0.3s ease" }}>
        <path className="torch-flame" d="M20 4 C30 18 34 30 30 42 C28 49 24 52 20 52 C16 52 12 49 10 42 C6 30 10 18 20 4 Z" fill="url(#torch-glow)" />
        <path className="torch-flame-core" d="M20 22 C25 30 26 38 24 44 C23 48 21 50 20 50 C19 50 17 48 16 44 C14 38 15 30 20 22 Z" fill="#fff8dc" opacity="0.85" />
      </g>
      <rect x="15" y="52" width="10" height="6" rx="2" fill="#8a6e20" />
      <path d="M16 58 L24 58 L22 88 L18 88 Z" fill="#5a3d1c" />
    </svg>
  );
}

export default function TorchRun({ section, finale = false, words, known, onXPEarned, onDone }: Props) {
  const count = Math.min(words.length, finale ? 5 : section === 1 ? 3 : 4);
  const budget = count * MS_PER_WORD + SETTLE_MS;
  const [run, setRun] = useState(0);
  // drawn once per lighting, not per render: the lesson re-renders on every XP change
  const [rounds, setRounds] = useState(() => buildRounds(words, known, count));
  const [phase, setPhase] = useState<Phase>("ready");
  const [at, setAt] = useState(0);
  const [left, setLeft] = useState(budget);
  const [mistakes, setMistakes] = useState(0);
  const [wrong, setWrong] = useState<string | null>(null);
  const [right, setRight] = useState<string | null>(null);
  const deadline = useRef(0);

  // the torch burns down in real time; a tab in the background does not stop it (the deadline is a clock time)
  useEffect(() => {
    if (phase !== "burning") return;
    const id = window.setInterval(() => {
      const ms = Math.max(0, deadline.current - performance.now());
      setLeft(ms);
      if (ms === 0) {
        window.clearInterval(id);
        snuff();
        setPhase("out");
        trackEvent("torch_run", { section, result: "out", read: at, of: count, mistakes });
      }
    }, 100);
    return () => window.clearInterval(id);
  }, [phase, section, at, count, mistakes]);

  function light() {
    deadline.current = performance.now() + budget;
    setLeft(budget);
    setAt(0);
    setMistakes(0);
    setWrong(null);
    setRight(null);
    setPhase("burning");
    flare();
  }

  function again() {
    setRounds(buildRounds(words, known, count));
    setRun((r) => r + 1);
    setPhase("ready");
  }

  function pick(option: Word) {
    const round = rounds[at];
    if (phase !== "burning" || !round || right) return;
    if (option.id !== round.word.id) {
      hiss();
      deadline.current -= WRONG_COST_MS;
      setMistakes((m) => m + 1);
      setWrong(option.id);
      window.setTimeout(() => setWrong(null), 450);
      return;
    }
    flare();
    deadline.current = Math.min(performance.now() + budget, deadline.current + RIGHT_BONUS_MS);
    setRight(option.id);
    window.setTimeout(() => {
      setRight(null);
      if (at + 1 < rounds.length) {
        setAt(at + 1);
        return;
      }
      const secondsLeft = Math.round(Math.max(0, deadline.current - performance.now()) / 1000);
      setLeft(Math.max(0, deadline.current - performance.now()));
      setPhase("kept");
      onXPEarned(mistakes === 0 ? XP_REWARDS.mechanicPerfect : XP_REWARDS.mechanicCorrect);
      trackEvent("torch_run", { section, result: "kept", read: count, of: count, mistakes, seconds_left: secondsLeft });
    }, 550);
  }

  const frac = Math.max(0, Math.min(1, left / budget));
  const round = rounds[at];
  // the dark closing in: the clear circle shrinks as the torch burns down
  const clear = phase === "burning" ? 22 + 58 * frac : 90;
  const low = phase === "burning" && frac < 0.25;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-2xl mx-auto">
      <div className="text-center mb-5">
        <p className="font-body text-sm text-gold-500 mb-2 font-semibold">{finale ? "The last torch" : `Before you leave part ${section}`}</p>
        <h2 className="font-display text-2xl md:text-3xl text-sand-100 font-light">
          Read by <span className="text-gradient-gold font-medium">torchlight</span>
        </h2>
      </div>

      <div className="lesson-sheet relative overflow-hidden">
        <AnimatePresence mode="wait">
          {phase === "ready" && (
            <motion.div key={`ready-${run}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 md:p-9 text-center">
              <div className="flex justify-center mb-4">
                <Torch left={1} big />
              </div>
              <p className="font-body text-sand-200 max-w-md mx-auto mb-2">
                {count} words from {finale ? "the whole lesson" : "this part"}, one torch. Pick what each one says before the flame dies.
              </p>
              <p className="font-body text-sm text-sand-500 max-w-md mx-auto mb-6">A right reading feeds the flame. A wrong one makes it gutter.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button type="button" onClick={light} className="lesson-btn py-3.5 px-9 text-sm justify-center">
                  Light the torch
                </button>
                <button
                  type="button"
                  onClick={() => {
                    trackEvent("torch_run", { section, result: "skipped" });
                    onDone();
                  }}
                  className="font-body text-sm text-sand-400 hover:text-sand-200 underline underline-offset-4"
                >
                  Skip it this time
                </button>
              </div>
            </motion.div>
          )}

          {phase === "burning" && round && (
            <motion.div key={`round-${run}-${at}`} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.25 }} className="p-5 md:p-7">
              <div className="flex items-center gap-4 mb-4">
                <Torch left={frac} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between font-body text-sm mb-1.5">
                    <span className="text-sand-300">
                      Word {at + 1} of {rounds.length}
                    </span>
                    <span className={`tabular-nums font-semibold ${low ? "text-terracotta" : "text-gold-400"}`}>{Math.ceil(left / 1000)} s</span>
                  </div>
                  <div className="h-2 rounded-full bg-black/40 overflow-hidden" aria-hidden="true">
                    <div
                      className="h-full rounded-full transition-[width] duration-100 ease-linear"
                      style={{ width: `${frac * 100}%`, background: low ? "linear-gradient(90deg,#9a3412,#ea580c)" : "linear-gradient(90deg,#b8922a,#f5d890)" }}
                    />
                  </div>
                </div>
              </div>

              <div className="lesson-inlay px-5 py-6 text-center mb-4">
                <span className="inline-flex items-end justify-center gap-1 leading-none" style={{ fontFamily: GLYPH_FONT }} aria-label="the word to read">
                  {round.word.extra && <span className="lesson-inlay-glyph text-6xl sm:text-7xl">{round.word.extra.symbol}</span>}
                  {round.word.core.map((s, i) => (
                    <span key={i} className="lesson-inlay-glyph text-6xl sm:text-7xl">
                      {s}
                    </span>
                  ))}
                  {round.word.det && <span className="lesson-inlay-glyph text-6xl sm:text-7xl opacity-40">{round.word.det.symbol}</span>}
                </span>
              </div>

              <div className="grid gap-2 sm:grid-cols-3" role="group" aria-label="What does it say?">
                {round.options.map((o) => (
                  <motion.button
                    key={o.id}
                    type="button"
                    onClick={() => pick(o)}
                    animate={wrong === o.id ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
                    transition={{ duration: 0.35 }}
                    className="lesson-option text-left sm:text-center px-4 py-3"
                    data-state={right === o.id ? "right" : wrong === o.id ? "wrong" : undefined}
                  >
                    <span className="block font-body italic text-gold-300">{o.translit}</span>
                    <span className="block font-body text-sm text-sand-200">{o.meaning}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {(phase === "kept" || phase === "out") && (
            <motion.div key={`end-${run}`} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="p-6 md:p-9 text-center">
              <div className="flex justify-center mb-3">{phase === "kept" ? <Torch left={Math.max(0.35, frac)} big /> : <span className="text-5xl text-sand-500" aria-hidden="true">𓊖</span>}</div>
              <h3 className="font-display text-2xl text-sand-100 mb-2">{phase === "kept" ? "The torch is still burning" : "The torch went out"}</h3>
              <p className="font-body text-sand-300 max-w-md mx-auto mb-6">
                {phase === "kept"
                  ? `All ${rounds.length} read, with ${Math.round(left / 1000)} seconds of flame to spare${mistakes === 0 ? " and not one wrong guess" : ""}.`
                  : `You read ${at} of ${rounds.length} before the dark came in. The words are still yours; the flame just needs a steadier hand.`}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button type="button" onClick={onDone} className="lesson-btn py-3.5 px-9 text-sm justify-center">
                  Carry on
                </button>
                {phase === "out" && (
                  <button type="button" onClick={again} className="lesson-btn-quiet py-3 px-7 text-sm justify-center">
                    Relight it
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* the dark at the edge of the torchlight */}
        <div
          className="pointer-events-none absolute inset-0 transition-[background] duration-300"
          style={{ background: `radial-gradient(circle at 50% 45%, transparent ${clear}%, rgba(4,3,1,${phase === "burning" ? 0.88 : 0}) ${clear + 28}%)` }}
          aria-hidden="true"
        />
      </div>
    </motion.div>
  );
}

"use client";

/**
 * Walk the Hall — Lesson 7's signature mechanic.
 *
 * Monumental texts are arranged symmetrically around doorways: the same
 * epithet is carved once on each jamb, mirror-image, so the signs on both
 * sides face the entrance. Read each phrase twice — right-to-left on the
 * left jamb, left-to-right on the right jamb — and the "which way?" skill
 * becomes automatic.
 */

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import WallReader from "@/components/exercises/WallReader";
import type { WallSign } from "@/lib/tomb-wall";
import { XP_REWARDS } from "@/lib/gamification";
import { trackExerciseComplete } from "@/lib/analytics";
import { GLYPH_STYLE, type MechanicProps } from "./types";

const s = (glyph: string, value: string, name: string, role: WallSign["role"] = "phon"): WallSign => ({ glyph, value, name, role });

type Phrase = { id: string; translit: string; meaning: string; signs: WallSign[]; where: string; note: string };

// Unicode code points verified against the Gardiner list.
export const HALL_PHRASES: Phrase[] = [
  {
    id: "ntr-nfr", translit: "nṯr nfr", meaning: "the good god",
    signs: [s("𓊹", "nṯr", "flag on a pole", "ideo"), s("𓄤", "nfr", "heart and windpipe", "ideo")],
    where: "Carved before the king’s throne-name on almost every temple wall.",
    note: "Two ideograms. ‘Good god’ is the king’s standard epithet: the pharaoh as a junior god on earth.",
  },
  {
    id: "nb-tawy", translit: "nb tꜣwy", meaning: "lord of the Two Lands",
    signs: [s("𓎟", "nb", "basket", "ideo"), s("𓇾", "tꜣ", "flat land", "ideo"), s("𓇾", "tꜣ", "flat land", "ideo")],
    where: "Before the king’s name; the Two Lands are Upper and Lower Egypt.",
    note: "The basket writes nb ‘lord’; the land sign doubled writes tꜣwy ‘the two lands’; duals were often shown by simply writing the sign twice.",
  },
  {
    id: "di-ankh", translit: "dj ꜥnḫ ḏd wꜣs", meaning: "given life, stability and dominion",
    signs: [s("𓏙", "dj", "conical loaf (given)"), s("𓋹", "ꜥnḫ", "ankh", "ideo"), s("𓊽", "ḏd", "djed pillar", "ideo"), s("𓌀", "wꜣs", "was-sceptre", "ideo")],
    where: "After the cartouche, at the end of the titulary.",
    note: "‘Given life’ is the commonest ending of all. The three amulet-signs (ankh, djed, was) are whole words each.",
  },
];

type Reading = { phrase: number; side: "left" | "right" };
type Step = Reading | "intro" | "done" | { relight: number };

const OIL_START = 75;
const OIL_RELIGHT = 45;
const OIL_CLEAN_BONUS = 20;
const OIL_MAX = 99;

function isReading(s: Step): s is Reading {
  return typeof s === "object" && "side" in s;
}

export default function WalkTheHall({ onXPEarned, onComplete }: MechanicProps) {
  const [step, setStep] = useState<Step>("intro");
  const [clean, setClean] = useState(0);
  const [oil, setOil] = useState(OIL_START);
  const [relights, setRelights] = useState(0);
  const total = HALL_PHRASES.length * 2;
  const tick = useRef<number | null>(null);

  // The lamp burns while a jamb is being read.
  useEffect(() => {
    if (!isReading(step)) return;
    tick.current = window.setInterval(() => setOil((o) => Math.max(0, o - 1)), 1000);
    return () => {
      if (tick.current) window.clearInterval(tick.current);
      tick.current = null;
    };
  }, [step]);

  // Out of oil: back to the start of this doorway.
  useEffect(() => {
    if (oil === 0 && isReading(step)) {
      setRelights((r) => r + 1);
      setStep({ relight: step.phrase });
    }
  }, [oil, step]);

  function onRead(mistakes: number) {
    if (!isReading(step)) return;
    if (mistakes === 0) {
      setClean((c) => c + 1);
      setOil((o) => Math.min(OIL_MAX, o + OIL_CLEAN_BONUS));
      onXPEarned(XP_REWARDS.mechanicCorrect);
    } else onXPEarned(Math.round(XP_REWARDS.mechanicCorrect / 2));
    if (step.side === "left") setStep({ phrase: step.phrase, side: "right" });
    else if (step.phrase + 1 < HALL_PHRASES.length) setStep({ phrase: step.phrase + 1, side: "left" });
    else setStep("done");
  }

  function relight(phrase: number) {
    setOil(OIL_RELIGHT);
    setStep({ phrase, side: "left" });
  }

  useEffect(() => {
    if (step === "done") {
      trackExerciseComplete({ exercise: "walk-the-hall", score: clean, total });
      if (clean === total) onXPEarned(XP_REWARDS.mechanicPerfect);
      onComplete({ correct: clean, total });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  return (
    <div className="lesson-sheet p-6 md:p-8">
      <AnimatePresence mode="wait">
        {step === "intro" && (
          <motion.div key="intro" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <p className="font-body text-sm text-gold-500 mb-2 font-semibold">Walk the hall</p>
            <h3 className="font-display text-2xl text-sand-100 mb-1">One doorway, two jambs, the same text twice</h3>
            <p className="font-body text-sm text-sand-400 mb-4">
              Temple texts are laid out symmetrically. The epithet on the left jamb is carved right-to-left and the one on the right jamb left-to-right, so the
              figures on both sides face the doorway, and the king walking through. You will read three epithets on each side.
            </p>
            <p className="font-body text-sm text-gold-300 mb-2">
              The lamp holds about {OIL_START} seconds of oil. Every jamb read without a wrong tap adds {OIL_CLEAN_BONUS}. If it dies, you relight it at the start of the doorway you were on.
            </p>
            {/* doorway diagram */}
            <div className="flex items-stretch justify-center gap-4 my-6">
              <div className="w-28 sm:w-36 border border-gold-700/40 bg-obsidian-lighter p-2 text-center rounded-xl">
                <p className="font-body text-sm text-sand-500 mb-2 font-semibold">left jamb</p>
                <p className="text-3xl text-gold-400" style={{ ...GLYPH_STYLE, transform: "scaleX(-1)", display: "inline-block" }}>
                  𓊹𓄤
                </p>
                <p className="font-body text-[10px] text-sand-500 mt-1">reads right to left</p>
              </div>
              <div className="w-16 sm:w-24 border-x border-gold-700/20 bg-[#120c06] flex items-end justify-center pb-2">
                <span className="font-body text-sm text-sand-600 font-semibold">door</span>
              </div>
              <div className="w-28 sm:w-36 border border-gold-700/40 bg-obsidian-lighter p-2 text-center rounded-xl">
                <p className="font-body text-sm text-sand-500 mb-2 font-semibold">right jamb</p>
                <p className="text-3xl text-gold-400" style={GLYPH_STYLE}>
                  𓊹𓄤
                </p>
                <p className="font-body text-[10px] text-sand-500 mt-1"> → reads</p>
              </div>
            </div>
            <div className="text-center">
              <button type="button" onClick={() => setStep({ phrase: 0, side: "left" })} className="lesson-btn py-3 px-8 text-sm justify-center">
                Enter the hall
              </button>
            </div>
          </motion.div>
        )}

        {typeof step === "object" && "relight" in step && (
          <motion.div key={`relight-${step.relight}-${relights}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-6">
            <p className="font-body text-sm text-terracotta mb-2 font-semibold">The lamp has died</p>
            <h3 className="font-display text-2xl text-sand-100 mb-2">Dark, in the middle of the hall.</h3>
            <p className="font-body text-sm text-sand-400 mb-5 max-w-md mx-auto">
              Saleh finds you by the sound of your muttering. He has {OIL_RELIGHT} seconds of oil left in his flask. You go back to doorway {step.relight + 1}; what you read before it is safe.
            </p>
            <button type="button" onClick={() => relight(step.relight)} className="lesson-btn py-3 px-8 text-sm justify-center">
              Relight the lamp
            </button>
          </motion.div>
        )}

        {isReading(step) && (
          <motion.div key={`${step.phrase}-${step.side}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="flex items-center gap-3 mb-3">
              <span className={`text-lg leading-none ${oil < 15 ? "animate-pulse" : ""}`} aria-hidden="true">🔥</span>
              <div className="flex-1 h-2 bg-obsidian-lighter border border-gold-700/20 overflow-hidden" aria-label={`${oil} seconds of oil`}>
                <div className={`h-full transition-[width] duration-1000 ease-linear ${oil < 15 ? "bg-terracotta" : "bg-gradient-to-r from-gold-600 to-gold-400"}`} style={{ width: `${(oil / OIL_MAX) * 100}%` }} />
              </div>
              <span className={`font-body text-xs tabular-nums ${oil < 15 ? "text-terracotta" : "text-sand-400"}`}>{oil}s</span>
            </div>
            <p className="font-body text-sm text-gold-500 mb-2 font-semibold">
              Walk the hall <span className="text-sand-500 normal-case tracking-normal ml-2">· doorway {step.phrase + 1}/{HALL_PHRASES.length} · {step.side} jamb</span>
            </p>
            <h3 className="font-display text-xl text-sand-100 mb-1">
              {step.side === "left" ? "Left of the door: the signs face right." : "Right of the door: the same words, now facing left."}
            </h3>
            <p className="font-body text-sm text-sand-400 mb-4">{HALL_PHRASES[step.phrase].where}</p>
            <WallReader
              stageKey={`${step.phrase}-${step.side}`}
              signs={HALL_PHRASES[step.phrase].signs}
              rtl={step.side === "left"}
              exercise="walk-the-hall"
              question={`${HALL_PHRASES[step.phrase].translit}:${step.side}`}
              prompt={step.side === "left" ? "Start at the right, where the signs face" : "Start at the left, where the signs face"}
              tip={step.side === "left" ? "The figures face right, so the line begins on the right." : "The figures face left, so begin on the left."}
              reveal={{ translit: HALL_PHRASES[step.phrase].translit, meaning: HALL_PHRASES[step.phrase].meaning, note: step.side === "right" ? HALL_PHRASES[step.phrase].note : undefined }}
              continueLabel={step.side === "left" ? "Cross to the right jamb" : step.phrase + 1 < HALL_PHRASES.length ? "Next epithet" : "Leave the hall"}
              onComplete={(r) => onRead(r.mistakes)}
            />
          </motion.div>
        )}

        {step === "done" && (
          <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
            <p className="font-body text-sm text-gold-500 mb-2 font-semibold">Walk the hall · complete</p>
            <h3 className="font-display text-2xl text-sand-100">
              {clean}/{total} jambs read cleanly{relights > 0 ? `, ${relights} relight${relights === 1 ? "" : "s"}` : ", and the lamp never died"}.
            </h3>
            <p className="font-body text-sm text-sand-400 mt-2">Next time you stand in a temple doorway, look at which way the birds face. You already know where to start.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

"use client";

/**
 * Cartouche Reader — Lesson 5's signature mechanic.
 *
 * Real royal cartouches, black with lamp soot. Tap the signs in the order
 * they are READ (which for Tutankhamun is not the order they are written —
 * honorific transposition); each name read cleans its cartouche on the wall
 * strip above, and the gold comes up. Seven cartouches, easy → hard.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { XP_REWARDS } from "@/lib/gamification";
import { trackExerciseAnswer, trackExerciseComplete } from "@/lib/analytics";
import { GLYPH_STYLE, type MechanicProps } from "./types";

type CSign = { glyph: string; value: string; name: string };
type Cartouche = {
  id: string;
  king: string;
  epithet: string;
  /** Signs in READING order */
  signs: CSign[];
  /** Written (display) order of sign indices, if different from reading order */
  written?: number[];
  translit: string;
  fact: string;
  /** Shown after the second wrong tap */
  tip: string;
};

// Unicode code points verified against the Gardiner list.
export const CARTOUCHES: Cartouche[] = [
  {
    id: "khufu", king: "Khufu", epithet: "Builder of the Great Pyramid · 4th Dynasty",
    signs: [{ glyph: "𓐍", value: "ḫ", name: "sieve" }, { glyph: "𓅱", value: "w", name: "chick" }, { glyph: "𓆑", value: "f", name: "viper" }, { glyph: "𓅱", value: "w", name: "chick" }],
    translit: "ḫwfw",
    fact: "Four alphabet signs. The Greeks heard the name as ‘Cheops’. The only surviving statuette of Khufu is 7.5 cm tall.",
    tip: "Every sign here is a uniliteral: just sound them out left to right.",
  },
  {
    id: "thutmose", king: "Thutmose III", epithet: "‘Thoth is born’ · 18th Dynasty",
    signs: [{ glyph: "𓅝", value: "ḏḥwty", name: "ibis on a standard (Thoth)" }, { glyph: "𓄟", value: "ms", name: "three fox skins" }, { glyph: "𓋴", value: "s", name: "folded cloth" }],
    translit: "ḏḥwty-ms",
    fact: "The ibis on a standard is the god Thoth written as a single sign; ms ‘born’ follows with its complement s. Thutmose III fought seventeen campaigns and built the core of Karnak.",
    tip: "The god comes first in the reading too, so start with the bird.",
  },
  {
    id: "amenhotep", king: "Amenhotep III", epithet: "‘Amun is satisfied’ · 18th Dynasty",
    signs: [{ glyph: "𓇋", value: "ꞽ", name: "reed" }, { glyph: "𓏠", value: "mn", name: "gaming board" }, { glyph: "𓈖", value: "n", name: "ripple" }, { glyph: "𓊵", value: "ḥtp", name: "offering slab" }, { glyph: "𓏏", value: "t", name: "loaf" }, { glyph: "𓊪", value: "p", name: "stool" }],
    translit: "ꞽmn-ḥtp",
    fact: "ꞽ-mn-n spells Amun; ḥtp-t-p spells ‘satisfied, at peace’, the same ḥtp as the offering formula. Amenhotep III’s mortuary temple survives as the Colossi of Memnon.",
    tip: "Reed, board, ripple = Amun. Then the offering slab and its complements.",
  },
  {
    id: "ramesses", king: "Ramesses II", epithet: "‘Ra has fashioned him’ · 19th Dynasty",
    signs: [{ glyph: "𓇳", value: "rꜥ", name: "sun disc (Ra)" }, { glyph: "𓄟", value: "ms", name: "three fox skins" }, { glyph: "𓋴", value: "s", name: "folded cloth" }, { glyph: "𓇓", value: "sw", name: "sedge plant" }],
    translit: "rꜥ-ms-sw",
    fact: "Ra’s disc, then ms ‘born / fashioned’, then sw ‘him’. The Greeks wrote Ramesses; the Bible’s ‘Raamses’ is the same name. He reigned 66 years.",
    tip: "Start with the sun. The last sign, the sedge plant, is sw ‘him’.",
  },
  {
    id: "ptolemy", king: "Ptolemy", epithet: "Greek ruler of Egypt · Ptolemaic period",
    signs: [
      { glyph: "𓊪", value: "p", name: "stool" }, { glyph: "𓏏", value: "t", name: "loaf" }, { glyph: "𓍯", value: "w / o", name: "lasso" }, { glyph: "𓃭", value: "l", name: "lion" },
      { glyph: "𓅓", value: "m", name: "owl" }, { glyph: "𓇋", value: "ꞽ", name: "reed" }, { glyph: "𓇋", value: "ꞽ", name: "reed" }, { glyph: "𓋴", value: "s", name: "folded cloth" },
    ],
    translit: "ptwlmys",
    fact: "A Greek name spelled letter by letter; the lion gives the l that Egyptian lacked. This cartouche on the Rosetta Stone gave Champollion his first foothold.",
    tip: "Pure alphabet, left to right: p-t-o-l-m-i-i-s.",
  },
  {
    id: "cleopatra", king: "Cleopatra VII", epithet: "The last Ptolemy · 1st century BCE",
    signs: [
      { glyph: "𓈎", value: "q / k", name: "hill-slope" }, { glyph: "𓃭", value: "l", name: "lion" }, { glyph: "𓇋", value: "ꞽ", name: "reed" }, { glyph: "𓍯", value: "w / o", name: "lasso" }, { glyph: "𓊪", value: "p", name: "stool" },
      { glyph: "𓄿", value: "ꜣ / a", name: "vulture" }, { glyph: "𓂧", value: "d", name: "hand" }, { glyph: "𓂋", value: "r", name: "mouth" }, { glyph: "𓄿", value: "ꜣ / a", name: "vulture" }, { glyph: "𓏏", value: "t", name: "loaf (feminine)" }, { glyph: "𓆇", value: "♀", name: "egg (female name)" },
    ],
    translit: "qlꞽwpꜣdrꜣt",
    fact: "Champollion matched the p, t, o and l in Ptolemy and Cleopatra to crack the alphabet in 1822. The egg at the end marks a woman’s name.",
    tip: "Spell the name out: k-l-e-o-p-a-t-r-a, then the feminine t and the egg.",
  },
  {
    id: "tutankhamun", king: "Tutankhamun", epithet: "‘Living image of Amun’ · 18th Dynasty",
    signs: [
      { glyph: "𓏏", value: "t", name: "loaf" }, { glyph: "𓅱", value: "w", name: "chick" }, { glyph: "𓏏", value: "t", name: "loaf" },
      { glyph: "𓋹", value: "ꜥnḫ", name: "ankh" },
      { glyph: "𓇋", value: "ꞽ", name: "reed" }, { glyph: "𓏠", value: "mn", name: "gaming board" }, { glyph: "𓈖", value: "n", name: "ripple" },
    ],
    written: [4, 5, 6, 0, 1, 2, 3],
    translit: "twt-ꜥnḫ-ꞽmn",
    fact: "Amun is written first because a god outranks a king, but the name is read Tut-ankh-Amun. This ‘honorific transposition’ happens whenever a god’s name is part of a phrase.",
    tip: "Honorific transposition: Amun is carved first but read LAST. Start with the loaf-chick-loaf (twt).",
  },
];

const WRONG_FLASH_MS = 500;

export default function CartoucheReader({ onXPEarned, onComplete }: MechanicProps) {
  const [idx, setIdx] = useState(0);
  const [tapped, setTapped] = useState<number[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [flash, setFlash] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const [cleanCount, setCleanCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const flashTimer = useRef<number | null>(null);

  const c = CARTOUCHES[idx];
  const n = c.signs.length;
  const written = useMemo(() => c.written ?? Array.from({ length: n }, (_, i) => i), [c, n]);

  useEffect(
    () => () => {
      if (flashTimer.current) window.clearTimeout(flashTimer.current);
    },
    []
  );

  function tap(slot: number) {
    if (done) return;
    const signIdx = written[slot];
    if (tapped.includes(signIdx)) return;
    if (signIdx === tapped.length) {
      const next = [...tapped, signIdx];
      setTapped(next);
      if (next.length === n) {
        setDone(true);
        const clean = mistakes === 0;
        if (clean) setCleanCount((k) => k + 1);
        onXPEarned(clean ? XP_REWARDS.mechanicCorrect : Math.round(XP_REWARDS.mechanicCorrect / 2));
        trackExerciseAnswer({ exercise: "cartouche-reader", questionType: c.written ? "read-transposed" : "read-cartouche", question: c.translit, correct: clean });
      }
    } else {
      setMistakes((m) => m + 1);
      setFlash(slot);
      if (flashTimer.current) window.clearTimeout(flashTimer.current);
      flashTimer.current = window.setTimeout(() => setFlash(null), WRONG_FLASH_MS);
    }
  }

  function next() {
    if (idx + 1 >= CARTOUCHES.length) {
      trackExerciseComplete({ exercise: "cartouche-reader", score: cleanCount, total: CARTOUCHES.length });
      if (cleanCount === CARTOUCHES.length) onXPEarned(XP_REWARDS.mechanicPerfect);
      setFinished(true);
      return;
    }
    setIdx((i) => i + 1);
    setTapped([]);
    setMistakes(0);
    setFlash(null);
    setDone(false);
  }

  useEffect(() => {
    if (finished) onComplete({ correct: cleanCount, total: CARTOUCHES.length });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished]);

  if (finished) {
    return (
      <div className="lesson-sheet p-6 md:p-8 text-center">
        <p className="font-body text-sm text-gold-500 mb-2 font-semibold">Cartouche reader · complete</p>
        <div className="flex flex-wrap justify-center gap-1.5 mb-4" aria-hidden="true">
          {CARTOUCHES.map((k) => (
            <span key={k.id} className="px-2 py-1 rounded-[1.2rem] border-2 border-gold-500/80 bg-gold-500/10 text-gold-300 text-base leading-none whitespace-nowrap" style={GLYPH_STYLE}>
              {(k.written ?? k.signs.map((_, j) => j)).map((j) => k.signs[j].glyph).join("")}
            </span>
          ))}
        </div>
        <h3 className="font-display text-2xl text-sand-100">The wall is clean. {cleanCount}/{CARTOUCHES.length} names read without a wrong tap.</h3>
        <p className="font-body text-sm text-sand-400 mt-2 mb-5">Seven kings and a queen, in gold again. You can now read the names on the walls of Karnak, the Valley of the Kings and the Rosetta Stone.</p>
        <Link href="/translate-name-to-hieroglyphics" className="lesson-btn-quiet py-3 px-6 text-sm justify-center inline-flex">
          Forge your own cartouche in 3D
        </Link>
      </div>
    );
  }

  return (
    <div className="lesson-sheet p-6 md:p-8">
      <p className="font-body text-sm text-gold-500 mb-2 font-semibold">
        Cartouche reader <span className="text-sand-500 normal-case tracking-normal ml-2">· {idx + 1}/{CARTOUCHES.length}</span>
      </p>
      {/* The wall: seven cartouches under soot, cleaned one by one */}
      <div className="flex flex-wrap justify-center gap-1.5 mb-5" aria-label="The hall wall">
        {CARTOUCHES.map((k, i) => {
          const cleaned = i < idx || (i === idx && done);
          const current = i === idx && !done;
          return (
            <div
              key={k.id}
              title={cleaned ? k.king : current ? "Being cleaned" : "Under soot"}
              className={`relative px-2 py-1 rounded-[1.2rem] border-2 transition-all duration-700 ${
 cleaned ? "border-gold-500/80 bg-gold-500/10 shadow-[0_0_14px_rgba(212,168,50,0.25)]" : current ? "border-gold-700/60 bg-[#1a120a]" : "border-[#2a2018] bg-[#15100a]"
 }`}
            >
              <span
                className={`block text-base sm:text-lg leading-none whitespace-nowrap transition-all duration-700 ${cleaned ? "text-gold-300" : "text-[#3a2c1e] blur-[2px]"}`}
                style={GLYPH_STYLE}
                aria-hidden={!cleaned}
              >
                {(k.written ?? k.signs.map((_, j) => j)).map((j) => k.signs[j].glyph).join("")}
              </span>
              {!cleaned && <span className="absolute inset-0 rounded-[1.2rem] bg-[radial-gradient(circle_at_40%_40%,rgba(0,0,0,0.55),rgba(0,0,0,0.15))] pointer-events-none" aria-hidden="true" />}
            </div>
          );
        })}
      </div>

      <h3 className="font-display text-2xl text-sand-100 mb-1">{done ? c.king : "Whose name is under the soot?"}</h3>
      <p className="font-body text-sm text-sand-400 mb-6">
        {done ? c.epithet : "Brush the soot off by reading it: tap the signs in the order they are read. Signs face left, so the line runs left to right (usually)."}
      </p>

      {/* The cartouche */}
      <div className="flex justify-center mb-2">
        <div className="relative inline-flex items-center gap-1 sm:gap-2 px-5 py-4 rounded-[2.5rem] border-[3px] border-gold-500/80 bg-obsidian-lighter shadow-[0_0_40px_rgba(212,168,50,0.08)]">
          {/* the knot at the end of the rope */}
          <span className="absolute -right-[9px] top-1/2 -translate-y-1/2 w-[6px] h-10 bg-gold-500/80 rounded-sm" aria-hidden />
          {written.map((signIdx, slot) => {
            const order = tapped.indexOf(signIdx);
            let cls = "relative w-11 h-14 sm:w-12 sm:h-16 flex items-center justify-center border transition-all duration-150 ";
            if (done) cls += "border-green-500/50 bg-green-500/10";
            else if (flash === slot) cls += "border-red-500/60 bg-red-500/10";
            else if (order >= 0) cls += "border-gold-500/60 bg-gold-500/10";
            else cls += "border-transparent hover:border-gold-500/40";
            return (
              <button key={slot} type="button" onClick={() => tap(slot)} className={cls} aria-label={`sign ${slot + 1}`}>
                <span className="text-3xl sm:text-4xl text-gold-400 leading-none" style={GLYPH_STYLE}>
                  {c.signs[signIdx].glyph}
                </span>
                {order >= 0 && (
                  <span className="absolute -top-2 -left-2 w-5 h-5 rounded-full bg-gold-400 text-obsidian text-[11px] font-bold flex items-center justify-center">
                    {order + 1}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
      <p className="font-body text-xs text-sand-600 text-center mb-4">
        {tapped.length}/{n} tapped
        {mistakes >= 2 && !done && (
          <>
            {" · "}
            <span className="text-gold-500">Tip:</span> <span className="text-sand-300">{c.tip}</span>
          </>
        )}
      </p>

      <AnimatePresence>
        {done && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 md:p-5 border ${mistakes === 0 ? "border-green-500/40 bg-green-500/10" : "border-gold-500/30 bg-gold-500/5"} rounded-xl`}
          >
            <div className="flex flex-wrap justify-center gap-x-2 gap-y-3 mb-3" style={GLYPH_STYLE}>
              {c.signs.map((sg, i) => (
                <div key={i} className="text-center min-w-[2.75rem]">
                  <span className="block text-3xl text-gold-400 leading-none">{sg.glyph}</span>
                  <span className="block font-body text-[11px] text-sand-300 mt-1" style={{ fontFamily: "inherit" }}>
                    {sg.value}
                  </span>
                </div>
              ))}
            </div>
            <p className="font-body text-sm text-sand-100 text-center">
              <span className="font-display italic text-lg text-gold-300">{c.translit}</span>
              <span className="text-sand-400"> · </span>
              <span className="font-medium">{c.king}</span>
              {mistakes === 0 && <span className="text-gold-400 ml-2">+{XP_REWARDS.mechanicCorrect} XP</span>}
            </p>
            <p className="font-body text-xs text-sand-400 mt-2 text-center max-w-xl mx-auto">{c.fact}</p>
            <div className="text-center mt-4">
              <button type="button" onClick={next} className="lesson-btn py-3 px-8 text-sm justify-center">
                {idx + 1 >= CARTOUCHES.length ? "Finish" : "Next cartouche"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

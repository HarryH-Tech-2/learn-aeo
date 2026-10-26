"use client";

/**
 * Boss inscription: a longer real text read with no tips at the end of a
 * category. Lines are read in sequence; a clean run through all of them
 * earns the category seal.
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import WallReader from "@/components/exercises/WallReader";
import type { Boss } from "@/lib/expedition";
import { XP_REWARDS } from "@/lib/gamification";
import { trackExerciseComplete } from "@/lib/analytics";

type Props = {
  boss: Boss;
  torches: number;
  onXPEarned: (xp: number) => void;
  onComplete: (clean: boolean) => void;
};

export default function BossReading({ boss, torches, onXPEarned, onComplete }: Props) {
  const [line, setLine] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState<null | boolean>(null);
  const cur = boss.lines[line];

  function onRead(m: number) {
    const total = mistakes + m;
    setMistakes(total);
    onXPEarned(m === 0 ? XP_REWARDS.readingComplete : Math.round(XP_REWARDS.readingComplete / 2));
    if (line + 1 < boss.lines.length) {
      setLine((l) => l + 1);
      return;
    }
    const clean = total === 0;
    trackExerciseComplete({ exercise: "boss", score: clean ? 1 : 0, total: 1 });
    if (clean) onXPEarned(XP_REWARDS.mechanicPerfect);
    setDone(clean);
    onComplete(clean);
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-3xl mx-auto">
      <div className="text-center mb-6">
        <p className="font-body text-sm text-terracotta mb-2 font-semibold">Boss inscription · {boss.category}</p>
        <h2 className="font-display text-2xl text-sand-100 font-light">{boss.title}</h2>
        <p className="font-body text-sm text-sand-400 mt-1 max-w-xl mx-auto">{boss.intro}</p>
      </div>

      <AnimatePresence mode="wait">
        {!started && (
          <motion.div key="gate" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="lesson-sheet p-6 md:p-8 text-center">
            <p className="font-body text-sm text-sand-300 mb-2">
              {boss.lines.length === 1 ? "One line." : `${boss.lines.length} lines, read in order.`} No prompts, no tips, and every wrong tap counts against the seal.
            </p>
            <p className="font-body text-xs text-sand-500 mb-6">
              Lamp oil: <span className="text-gold-400">{torches}</span>. A clean reading earns the {boss.sealName}.
            </p>
            <button type="button" onClick={() => setStarted(true)} className="lesson-btn py-4 px-10 text-sm justify-center">
              Raise the lamp
            </button>
          </motion.div>
        )}

        {started && done === null && cur && (
          <motion.div key={`line-${line}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="lesson-sheet p-4 md:p-6">
            <div className="flex items-baseline justify-between mb-3">
              <p className="font-body text-sm text-gold-500 font-semibold">{cur.title}</p>
              <p className="font-body text-xs text-sand-500">
                {line + 1}/{boss.lines.length} · {mistakes === 0 ? "clean so far" : `${mistakes} wrong tap${mistakes === 1 ? "" : "s"}`}
              </p>
            </div>
            <WallReader
              stageKey={`boss-${boss.category}-${line}`}
              signs={cur.signs}
              written={cur.written}
              rtl={cur.rtl}
              exercise="boss"
              question={cur.translit}
              reveal={{ translit: cur.translit, meaning: cur.meaning, note: cur.note || undefined }}
              continueLabel={line + 1 < boss.lines.length ? "Next line" : "Lower the lamp"}
              onComplete={(r) => onRead(r.mistakes)}
            />
          </motion.div>
        )}

        {done !== null && (
          <motion.div key="result" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className={`lesson-sheet p-6 md:p-8 text-center border ${done ? "border-gold-500/50 shadow-[0_0_40px_rgba(212,168,50,0.2)]" : "border-gold-700/30"}`}>
            <span className="text-5xl block mb-3" aria-hidden="true">
              {done ? "𓋹" : "𓊖"}
            </span>
            <h3 className="font-display text-2xl text-sand-100">{done ? boss.sealName : "Read, with mistakes"}</h3>
            <p className="font-body text-sm text-sand-400 mt-2 max-w-md mx-auto">
              {done
                ? "A clean reading. The seal is pressed into the wax on your site register."
                : `${mistakes} wrong tap${mistakes === 1 ? "" : "s"}. The text is read, but the seal waits for a clean run. Come back from the Journey tab any time.`}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

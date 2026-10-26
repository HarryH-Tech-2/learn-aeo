"use client";

/**
 * A choice with consequences: the epigrapher or the foreman asks what to
 * do. The right reading earns a lamp; the wrong one costs one. Made once;
 * on a return visit the outcome is simply shown.
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ChoicePoint as Choice, ChoiceOption } from "@/lib/expedition";
import { trackExerciseAnswer } from "@/lib/analytics";

type Props = {
  choice: Choice;
  /** Previously chosen option id, if any */
  chosen?: string;
  torches: number;
  onChoose: (option: ChoiceOption) => void;
  onContinue: () => void;
};

export default function ChoicePoint({ choice, chosen, torches, onChoose, onContinue }: Props) {
  const [picked, setPicked] = useState<ChoiceOption | null>(() => choice.options.find((o) => o.id === chosen) ?? null);

  function pick(o: ChoiceOption) {
    if (picked) return;
    setPicked(o);
    trackExerciseAnswer({ exercise: "choice", questionType: choice.at, question: choice.id, correct: o.right });
    onChoose(o);
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-2xl mx-auto">
      <div className="lesson-sheet p-6 md:p-8">
        <div className="flex items-center justify-between gap-4 mb-4">
          <p className="font-body text-sm text-gold-500 font-semibold">{choice.speaker}</p>
          <p className="font-body text-xs text-sand-500" aria-label={`${torches} lamps`}>
            <span className="text-gold-400">🔥</span> {torches}
          </p>
        </div>
        <p className="font-display text-xl md:text-2xl text-sand-100 leading-snug mb-6">{choice.prompt}</p>

        <div className="grid sm:grid-cols-2 gap-3">
          {choice.options.map((o) => {
            let cls = "text-left p-4 border transition-all duration-200 ";
            if (picked) {
              if (o.id === picked.id) cls += o.right ? "border-green-500/50 bg-green-500/10" : "border-terracotta/60 bg-terracotta/10";
              else cls += "border-gold-700/10 bg-obsidian-lighter opacity-50";
            } else cls += "border-gold-700/20 bg-obsidian-lighter hover:border-gold-500/50 hover:bg-gold-500/5 cursor-pointer";
            return (
              <button key={o.id} type="button" onClick={() => pick(o)} disabled={!!picked} className={cls}>
                <span className="font-body text-sm text-sand-100">{o.label}</span>
              </button>
            );
          })}
        </div>

        <AnimatePresence>
          {picked && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-5">
              <p className="font-body text-sm text-sand-300 leading-relaxed">{picked.outcome}</p>
              <p className={`font-body text-xs mt-2 ${picked.torches > 0 ? "text-gold-400" : "text-terracotta"}`}>
                {picked.torches > 0 ? `+${picked.torches} lamp` : `${picked.torches} lamp`}
                {!chosen ? "" : " · already decided on an earlier visit"}
              </p>
              <div className="text-right mt-4">
                <button type="button" onClick={onContinue} className="lesson-btn py-3 px-8 text-sm justify-center">
                  Carry on
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { BADGE_DEFINITIONS } from "@/lib/gamification";

type Badge = {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: string;
};
type Props = { badges: Badge[] };

type BadgeDef = (typeof BADGE_DEFINITIONS)[number];

export function getHowToEarn(criteria: string): string {
  if (criteria.startsWith("complete:")) {
    return "Finish this district's lesson and pass its audit to earn this badge.";
  }
  if (criteria === "perfect-audit") {
    return "Answer every question right in the audit at the end of a lesson.";
  }
  if (criteria.startsWith("streak:")) {
    const days = criteria.split(":")[1];
    return `Pass a lesson audit on ${days} days in a row.`;
  }
  if (criteria === "milestone:first-lesson") {
    return "Start your first lesson and take the audit at its end.";
  }
  if (criteria === "milestone:half-city") {
    return "Complete 4 of the 8 districts.";
  }
  if (criteria === "milestone:all-districts") {
    return "Complete every district in the City of Answers.";
  }
  return "Keep working through the lessons to unlock this badge.";
}

export default function BadgeShelf({ badges }: Props) {
  const earnedByName = new Map(badges.map((b) => [b.name, b]));
  const total = BADGE_DEFINITIONS.length;
  const earnedCount = badges.length;
  const [selected, setSelected] = useState<BadgeDef | null>(null);

  const selectedEarned = selected ? earnedByName.get(selected.name) : undefined;
  const isSelectedEarned = Boolean(selectedEarned);

  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected]);

  return (
    <div className="card-ancient p-6">
      <div className="flex items-baseline justify-between mb-4 gap-4">
        <p className="font-body text-xs tracking-[0.2em] uppercase text-sand-500">
          Achievements
        </p>
        <p className="font-body text-xs text-sand-500">
          <span className="text-gold-400 font-medium">{earnedCount}</span>
          <span className="text-sand-600"> / {total} earned</span>
        </p>
      </div>

      {earnedCount === 0 && (
        <p className="font-body text-sm text-sand-500 mb-5">
          No badges earned yet. Tap any badge to see how to earn it.
        </p>
      )}

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-5">
        {BADGE_DEFINITIONS.map((def, i) => {
          const earned = earnedByName.get(def.name);
          const isEarned = Boolean(earned);

          return (
            <motion.button
              type="button"
              key={def.name}
              onClick={() => setSelected(def)}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03, duration: 0.35 }}
              className="flex flex-col items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60 rounded-sm"
              aria-label={
                isEarned
                  ? `${def.name}: earned. Click for details.`
                  : `${def.name}: locked. Click to see how to earn.`
              }
            >
              <div
                className={`relative w-20 h-20 flex items-center justify-center border transition-all duration-300 ${
                  isEarned
                    ? "border-gold-700/30 bg-obsidian-lighter group-hover:border-gold-500/60 group-hover:shadow-[0_0_20px_rgba(212,168,50,0.15)]"
                    : "border-gold-700/10 bg-obsidian/40 group-hover:border-gold-700/30"
                }`}
              >
                <img
                  src={def.icon}
                  alt=""
                  aria-hidden="true"
                  className={`w-14 h-14 transition-all duration-300 ${
                    isEarned ? "opacity-100" : "opacity-30 grayscale"
                  }`}
                />
              </div>
              <span
                className={`font-body text-xs text-center leading-tight ${
                  isEarned ? "text-sand-400" : "text-sand-600"
                }`}
              >
                {def.name}
              </span>
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setSelected(null)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="badge-modal-title"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="card-ancient relative w-full max-w-md p-7 sm:p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setSelected(null)}
                aria-label="Close"
                className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center text-sand-500 hover:text-sand-200 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              <div className="flex flex-col items-center text-center">
                <div
                  className={`w-28 h-28 flex items-center justify-center border mb-5 ${
                    isSelectedEarned
                      ? "border-gold-700/40 bg-obsidian-lighter shadow-[0_0_30px_rgba(212,168,50,0.18)]"
                      : "border-gold-700/15 bg-obsidian/40"
                  }`}
                >
                  <img
                    src={selected.icon}
                    alt=""
                    aria-hidden="true"
                    className={`w-20 h-20 ${
                      isSelectedEarned ? "opacity-100" : "opacity-35 grayscale"
                    }`}
                  />
                </div>

                <p className="font-body text-[10px] tracking-[0.2em] uppercase text-sand-500 mb-2">
                  {isSelectedEarned ? "Earned" : "Locked"}
                </p>
                <h3
                  id="badge-modal-title"
                  className="font-display text-2xl text-sand-100 mb-3"
                >
                  {selected.name}
                </h3>
                <p className="font-body text-sm text-sand-400 mb-4">
                  {selected.description}
                </p>

                <div className="w-full border-t border-gold-700/20 pt-4 mt-2">
                  <p className="font-body text-[10px] tracking-[0.2em] uppercase text-gold-500 mb-2">
                    How to earn
                  </p>
                  <p className="font-body text-sm text-sand-300 leading-relaxed">
                    {getHowToEarn(selected.criteria)}
                  </p>
                </div>

                {isSelectedEarned && selectedEarned?.earnedAt && (
                  <p className="font-body text-xs text-sand-500 mt-4">
                    Earned{" "}
                    {new Date(selectedEarned.earnedAt).toLocaleDateString(
                      undefined,
                      { year: "numeric", month: "short", day: "numeric" }
                    )}
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

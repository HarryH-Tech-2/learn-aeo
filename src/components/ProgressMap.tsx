"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import SealedPanel, { type SealedItem } from "@/components/SealedPanel";
import type { OfferData } from "@/components/OfferBanner";
import { bossAfterLesson, type ExpeditionState } from "@/lib/expedition";
import { resumableSection, sectionPlan } from "@/lib/content/lesson-sections";

type Zone = {
  id: string;
  name: string;
  areaName: string;
  completed: boolean;
  started: boolean;
  bestScore: number | null;
  locked: boolean;
  position: { top: string; left: string };
  /** First sign of a locked lesson — a peek at what's inside. */
  teaser?: { symbol: string; meaning: string; transliteration: string };
  /** What the lesson covers, for the sealed panel */
  description?: string;
};

type Props = {
  zones: Zone[];
  streak: number;
  xp: number;
  /** Second-pass seals and boss results, for the chamber cards */
  expedition?: ExpeditionState;
  /** The learner's live offer, priced in the sealed panel */
  offer?: OfferData | null;
};

const LESSON_META: Record<string, { icon: string; difficulty: string; duration: string; category: string }> = {
  "expedition-begins": { icon: "𓄿", difficulty: "Beginner", duration: "3 × 10 min", category: "Fundamentals" },
  "outer-courtyard": { icon: "𓃭", difficulty: "Beginner", duration: "20 min", category: "Fundamentals" },
  "pilgrims-gallery": { icon: "𓀀", difficulty: "Beginner", duration: "20 min", category: "Fundamentals" },
  "the-treasury": { icon: "𓏤", difficulty: "Intermediate", duration: "20 min", category: "Applied" },
  "royal-hall": { icon: "𓇳", difficulty: "Intermediate", duration: "25 min", category: "Applied" },
  "sacred-chapel": { icon: "𓂀", difficulty: "Advanced", duration: "30 min", category: "Advanced" },
  "hypostyle-hall": { icon: "𓉐", difficulty: "Advanced", duration: "30 min", category: "Advanced" },
  "inner-sanctum": { icon: "𓐍", difficulty: "Advanced", duration: "35 min", category: "Mastery" },
};

const diffColors: Record<string, string> = {
  Beginner: "text-turquoise border-turquoise/30 bg-turquoise/5",
  Intermediate: "text-gold-400 border-gold-500/30 bg-gold-500/5",
  Advanced: "text-terracotta border-terracotta/30 bg-terracotta/5",
};

export default function ProgressMap({ zones, streak, xp, expedition, offer }: Props) {
  // a locked chamber opens its sealed panel on the page; only the panel's Buy button goes to checkout
  const [sealed, setSealed] = useState<SealedItem | null>(null);
  return (
    <div className="relative">
      <SealedPanel item={sealed} onClose={() => setSealed(null)} location="dashboard" offer={offer} />
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="font-body text-xs tracking-[0.2em] uppercase text-gold-500 mb-1">Temple of Thoth</p>
          <p className="font-body text-xs text-sand-500">Days on Site: {streak}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {zones.map((zone, i) => {
          if (sectionPlan(zone.id)) return <PartCards key={zone.id} zone={zone} index={i} expedition={expedition} />;
          const meta = LESSON_META[zone.id];
          const diff = meta ? diffColors[meta.difficulty] : "";
          const seal = expedition?.seals[zone.id];
          const sealGold = !!seal && seal.score === seal.total;
          // A lesson taken in sections: say where the learner's saved place is.
          const plan = sectionPlan(zone.id);
          const resumeAt = plan && !zone.completed ? resumableSection(zone.id, expedition?.sections?.[zone.id]?.done) : null;
          const boss = bossAfterLesson(zone.id);
          const bossDone = !!boss && !!expedition?.bosses[boss.category]?.clean;
          return (
            <motion.div
              key={zone.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="h-full"
            >
              <Link
                href={`/lessons/${zone.id}`}
                onClick={(e) => {
                  if (!zone.locked) return;
                  e.preventDefault();
                  setSealed({
                    id: zone.id,
                    kind: "chamber",
                    title: zone.name,
                    subtitle: [zone.areaName, meta?.duration].filter(Boolean).join(" · "),
                    description: zone.description,
                    icon: meta?.icon,
                    teaser: zone.teaser,
                  });
                }}
                aria-haspopup={zone.locked ? "dialog" : undefined}
                className="chamber-card group"
                data-state={zone.completed ? "done" : zone.locked ? "locked" : zone.started ? "next" : "open"}
              >
                {/* Status indicator */}
                <div className="absolute top-4 right-4">
                  {zone.completed ? (
                    <div className="chamber-seal" title="Done">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  ) : zone.started ? (
                    <motion.div
                      animate={{ scale: [1, 1.15, 1], opacity: [1, 0.7, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-6 h-6 rounded-full bg-gold-500/20 border border-gold-400/40 flex items-center justify-center"
                    >
                      <div className="w-2 h-2 rounded-full bg-gold-400" />
                    </motion.div>
                  ) : zone.locked ? (
                    <div className="chamber-lock" title="Sealed">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                  ) : null}
                </div>

                {/* The chamber's sign, inlaid */}
                <span className="chamber-medallion" aria-hidden="true">
                  {meta?.icon}
                </span>

                {/* Title */}
                <h3 className="font-display text-base font-medium text-sand-100 mb-1 group-hover:text-gold-400 transition-colors pr-8">
                  {zone.name}
                </h3>

                {/* Subtitle */}
                <p className="font-body text-xs text-sand-500 mb-3">{zone.areaName}</p>

                {/* Meta row */}
                <div className="flex items-center gap-2 flex-wrap">
                  {meta && (
                    <>
                      <span className={`font-body text-[10px] tracking-[0.1em] uppercase px-2 py-0.5 border ${diff}`}>
                        {meta.difficulty}
                      </span>
                      <span className="font-body text-[10px] text-sand-600">{meta.duration}</span>
                    </>
                  )}
                </div>

                {plan && resumeAt && (
                  <p className="font-body text-[10px] text-gold-400 mt-3">
                    Place saved · section {resumeAt} of {plan.sections.length} next: {plan.sections[resumeAt - 1].title.toLowerCase()}
                  </p>
                )}

                {/* Score, seal, second pass, boss */}
                {(zone.bestScore !== null || zone.completed) && (
                  <div className="mt-3 pt-3 border-t border-gold-700/10 space-y-1.5">
                    {zone.bestScore !== null && (
                      <p className="font-body text-[10px] text-sand-500">
                        Best report: <span className="text-gold-400">{zone.bestScore}</span>
                      </p>
                    )}
                    {zone.completed && (
                      <p className="font-body text-[10px]">
                        {seal ? (
                          <span className={sealGold ? "text-gold-300" : "text-sand-400"}>
                            {sealGold ? "✦ Gold seal" : `Second pass ${seal.score}/${seal.total}`}
                          </span>
                        ) : (
                          <span className="text-sand-500">Second pass open</span>
                        )}
                        {!sealGold && (
                          <Link
                            href={`/lessons/${zone.id}?pass=2`}
                            onClick={(e) => e.stopPropagation()}
                            className="ml-2 text-gold-500 hover:text-gold-300"
                          >
                            {seal ? "Try again" : "Go deeper"}
                          </Link>
                        )}
                      </p>
                    )}
                    {boss && (
                      <p className={`font-body text-[10px] tracking-[0.15em] uppercase ${bossDone ? "text-gold-300" : "text-terracotta"}`}>
                        {bossDone ? `✓ ${boss.sealName}` : `Boss inscription: ${boss.title}`}
                      </p>
                    )}
                  </div>
                )}
                {/* (pushes the teaser to the foot of the card, so a row of cards lines up) */}
                {zone.locked && zone.teaser && <div className="flex-1 min-h-4" aria-hidden="true" />}
                {zone.locked && zone.teaser && (
                  <div className="chamber-teaser">
                    <span className="text-2xl text-gold-400" style={{ fontFamily: "'Noto Sans Egyptian Hieroglyphs', serif" }}>
                      {zone.teaser.symbol}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-body text-[10px] tracking-[0.2em] uppercase text-sand-500">First sign inside</p>
                      <p className="font-body text-xs text-sand-300 truncate">
                        {zone.teaser.meaning} · <em>{zone.teaser.transliteration}</em>
                      </p>
                    </div>
                    <span className="chamber-unlock">Unlock</span>
                  </div>
                )}
                </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * A lesson taken in parts (Lesson 1, src/lib/content/lesson-sections.ts) shows as one card per part, so each
 * sitting is a lesson of its own on the map: done, next, or still ahead. ?part=N opens the lesson at that part.
 */
function PartCards({ zone, index, expedition }: { zone: Zone; index: number; expedition?: ExpeditionState }) {
  const plan = sectionPlan(zone.id)!;
  const meta = LESSON_META[zone.id];
  const done = zone.completed ? plan.sections.length : expedition?.sections?.[zone.id]?.done ?? 0;
  return (
    <>
      {plan.sections.map((part, k) => {
        const n = k + 1;
        const isDone = n <= done;
        const isNext = n === done + 1;
        return (
          <motion.div key={`${zone.id}-${n}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: (index + k) * 0.06 }} className="h-full">
            <Link
              href={n === 1 ? `/lessons/${zone.id}` : `/lessons/${zone.id}?part=${n}`}
              className="chamber-card group"
              data-state={isDone ? "done" : isNext ? "next" : "open"}
            >
              <div className="absolute top-4 right-4">
                {isDone ? (
                  <div className="chamber-seal" title="Done">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                ) : isNext ? (
                  <motion.div
                    animate={{ scale: [1, 1.15, 1], opacity: [1, 0.7, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-6 h-6 rounded-full bg-gold-500/20 border border-gold-400/40 flex items-center justify-center"
                  >
                    <div className="w-2 h-2 rounded-full bg-gold-400" />
                  </motion.div>
                ) : null}
              </div>
              <span className="chamber-medallion" aria-hidden="true">
                {meta?.icon}
              </span>
              <p className="font-body text-[10px] tracking-[0.2em] uppercase text-gold-500 mb-1">
                {zone.name} · part {n}
              </p>
              <h3 className="font-display text-base font-medium text-sand-100 mb-1 group-hover:text-gold-400 transition-colors pr-8">{part.title}</h3>
              <p className="font-body text-xs text-sand-500 mb-3">{part.blurb}</p>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`font-body text-[10px] tracking-[0.1em] uppercase px-2 py-0.5 border ${diffColors.Beginner}`}>Free</span>
                <span className="font-body text-[10px] text-sand-600">10 min</span>
                {isNext && <span className="chamber-next">{done > 0 ? "Up next" : "Start here"}</span>}
              </div>
              {n === plan.sections.length && zone.completed && zone.bestScore !== null && (
                <p className="font-body text-[10px] text-sand-500 mt-3 pt-3 border-t border-gold-700/10">
                  Best report: <span className="text-gold-400">{zone.bestScore}</span>
                </p>
              )}
            </Link>
          </motion.div>
        );
      })}
    </>
  );
}

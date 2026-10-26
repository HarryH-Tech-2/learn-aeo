"use client";

/**
 * The written Lesson 1's progress bar: the learner's level and XP (the
 * account's own, plus what this sitting earned) and the 25 signs of the
 * alphabet, each lit the moment it is met. A sign just learned pulses; every
 * fifth sign and every new level gets a short call-out.
 *
 * Signed-in learners land on the written lesson rather than the game
 * (LessonContent), so this is where the game's sense of getting somewhere
 * has to come from: the strip fills as the alphabet does.
 */
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getLevelTitle, getXPForNextLevel } from "@/lib/gamification";
import { trackEvent } from "@/lib/analytics";

const GLYPH_FONT = "'Noto Sans Egyptian Hieroglyphs', serif";

type Sign = { symbol: string; transliteration: string };

type Props = {
  /** The alphabet, in the order the strip shows it */
  signs: Sign[];
  /** Signs met so far */
  met: Set<string>;
  /** Signs in the learner's name (marked with a dot) */
  nameSigns: Set<string>;
  /** The account's XP before this sitting plus what it earned since */
  xp: number;
  /** XP earned since the page opened */
  sessionXP: number;
  /** false while the account's XP is still being fetched: no level-up call-outs until it is in */
  xpReady: boolean;
};

type Callout = { key: number; kicker: string; line: string };

/** What a sign milestone is called: every fifth sign of the 25. */
export function signMilestone(count: number, total: number): string | null {
  if (count === total) return `All ${total} signs. The whole alphabet is yours.`;
  if (count > 0 && count % 5 === 0) return `${count} of ${total} signs`;
  return null;
}

export default function ScribeLadder({ signs, met, nameSigns, xp, sessionXP, xpReady }: Props) {
  const total = signs.length;
  const count = signs.filter((s) => met.has(s.symbol)).length;
  const lvl = getXPForNextLevel(xp);
  const title = getLevelTitle(lvl.currentLevel);

  const [fresh, setFresh] = useState<Set<string>>(() => new Set());
  const [callout, setCallout] = useState<Callout | null>(null);
  // Every sign lit so far this visit: stepping back to an earlier word dims the strip, and coming forward again is not news.
  const seen = useRef<Set<string> | null>(null);
  const prevLevel = useRef<number | null>(null);

  // Newly met signs pulse; crossing a fifth sign gets a call-out. (Not on the first render: a resumed lesson is not news.)
  useEffect(() => {
    const before = seen.current;
    seen.current = new Set([...(before ?? []), ...met]);
    if (!before) return;
    const added = [...met].filter((s) => !before.has(s) && signs.some((g) => g.symbol === s));
    if (added.length === 0) return;
    setFresh(new Set(added));
    const was = signs.filter((s) => before.has(s.symbol)).length;
    const now = signs.filter((s) => seen.current!.has(s.symbol)).length;
    for (let n = now; n > was; n--) {
      const line = signMilestone(n, total);
      if (line) {
        setCallout({ key: Date.now(), kicker: "Signs learned", line });
        trackEvent("lesson_sign_milestone", { signs: n });
        break;
      }
    }
    const t = setTimeout(() => setFresh(new Set()), 1600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  useEffect(() => {
    if (!xpReady) return;
    const was = prevLevel.current;
    prevLevel.current = lvl.currentLevel;
    if (was !== null && lvl.currentLevel > was) {
      setCallout({ key: Date.now(), kicker: `Level ${lvl.currentLevel}`, line: `New rank: ${title}` });
      trackEvent("lesson_level_up", { level: lvl.currentLevel });
    }
  }, [xpReady, lvl.currentLevel, title]);

  useEffect(() => {
    if (!callout) return;
    const t = setTimeout(() => setCallout(null), 3200);
    return () => clearTimeout(t);
  }, [callout]);

  const toNext = lvl.nextLevelXP === null ? null : lvl.nextLevelXP - xp;

  return (
    <div className="relative max-w-3xl mx-auto mb-6 rounded-2xl border border-gold-700/15 bg-obsidian-light/70 px-4 sm:px-5 py-3.5">
      <div className="flex items-center justify-between gap-4 mb-3">
        <div className="min-w-0">
          <p className="lesson-label">
            Level {lvl.currentLevel}: {title}
          </p>
          <div className="lesson-track mt-1.5 w-40 sm:w-56" aria-hidden="true">
            <motion.div animate={{ width: `${Math.round(lvl.progress * 100)}%` }} transition={{ duration: 0.5, ease: "easeOut" }} />
          </div>
          <p className="font-body text-[11px] text-sand-500 mt-1">
            {xp} XP{toNext !== null ? ` · ${toNext} to level ${lvl.currentLevel + 1}` : ""}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="font-display text-2xl text-sand-100 leading-none">
            {count}
            <span className="text-sand-500 text-base">/{total}</span>
          </p>
          <p className="font-body text-xs text-sand-500 mt-1">signs learned</p>
          {sessionXP > 0 && <p className="font-body text-[11px] text-gold-400 mt-0.5">+{sessionXP} XP today</p>}
        </div>
      </div>

      <ol className="grid grid-cols-[repeat(13,minmax(0,1fr))] sm:grid-cols-[repeat(25,minmax(0,1fr))] gap-1" aria-label={`${count} of ${total} alphabet signs learned`}>
        {signs.map((s) => {
          const lit = met.has(s.symbol);
          const isNew = fresh.has(s.symbol);
          return (
            <li key={s.symbol} className="relative" title={lit ? s.transliteration : "Not met yet"}>
              <motion.span
                animate={isNew ? { scale: [1, 1.35, 1] } : { scale: 1 }}
                transition={{ duration: 0.6 }}
                className={`flex items-center justify-center aspect-square rounded-md text-sm sm:text-base leading-none transition-colors duration-500 ${
                  lit ? "bg-gold-500/15 text-gold-300 ring-1 ring-gold-500/35" : "text-sand-600 opacity-30 grayscale"
                } ${isNew ? "shadow-[0_0_12px_rgba(212,168,50,0.45)]" : ""}`}
                style={{ fontFamily: GLYPH_FONT }}
                // where a sign carved on the door flies to (see flyGlyph)
                data-ladder-sign={s.symbol}
              >
                {s.symbol}
              </motion.span>
              {nameSigns.has(s.symbol) && <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-gold-500" aria-hidden="true" />}
            </li>
          );
        })}
      </ol>

      {/* (positioned by a plain wrapper: framer-motion owns the inner element's transform) */}
      <div className="absolute inset-x-0 top-full mt-2 flex justify-center z-20 pointer-events-none" role="status" aria-live="polite">
        <AnimatePresence>
          {callout && (
            <motion.div
              key={callout.key}
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6 }}
              className="rounded-xl border border-gold-500/50 bg-obsidian px-5 py-2.5 text-center shadow-lg shadow-black/40"
            >
              <p className="lesson-label">{callout.kicker}</p>
              <p className="font-display text-lg text-sand-100">{callout.line}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

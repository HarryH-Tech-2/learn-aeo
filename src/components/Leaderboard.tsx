"use client";

import { FIRST_LESSON_PATH } from "@/lib/lesson-catalog";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import type { Leaderboard as LeaderboardData, LeaderboardEntry } from "@/lib/leaderboard";

type Props = {
  /** How many rows to show. */
  limit?: number;
  /** Show the "See the full leaderboard" link (used on the dashboard). */
  showFullLink?: boolean;
  /** Card title. */
  heading?: string;
};

const MEDALS = ["𓋹", "𓆣", "𓅓"]; // ankh, scarab, owl — 1st/2nd/3rd

/** Gold, silver, bronze for the podium. */
// Mid-tone metals so they read on both the dark and the parchment theme.
const PODIUM: { row: string; rank: string; xp: string }[] = [
  { row: "border-gold-500/70 bg-gold-500/15", rank: "text-gold-400", xp: "text-gold-400" },
  { row: "border-[#8f95a3]/60 bg-[#8f95a3]/15", rank: "text-[#7f8593]", xp: "text-[#7f8593]" },
  { row: "border-[#c2652d]/60 bg-[#c2652d]/12", rank: "text-[#c2652d]", xp: "text-[#c2652d]" },
];

function Row({ e, index }: { e: LeaderboardEntry; index: number }) {
  const podium = e.rank <= 3 ? PODIUM[e.rank - 1] : null;
  const medal = podium ? MEDALS[e.rank - 1] : null;
  return (
    <motion.li
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index, 10) * 0.04 }}
      className={`grid grid-cols-[2.5rem_1fr_auto] items-center gap-3 px-4 py-3 border transition-colors ${
        podium
          ? `${podium.row}${e.isYou ? " ring-1 ring-gold-500/60" : ""}`
          : e.isYou
            ? "border-gold-500/50 bg-gold-500/10"
            : "border-gold-700/10 bg-obsidian-lighter hover:border-gold-700/30"
      }`}
      aria-current={e.isYou ? "true" : undefined}
    >
      <span className={`font-display text-lg tabular-nums flex items-center gap-1 ${podium ? podium.rank : "text-gold-400"}`}>
        {medal ? (
          <span className="text-xl" style={{ fontFamily: "'Noto Sans Egyptian Hieroglyphs', serif" }} title={`Rank ${e.rank}`}>
            {medal}
          </span>
        ) : (
          <span className="text-sand-400 text-base">{e.rank}</span>
        )}
      </span>

      <span className="min-w-0">
        <span className="font-display text-base text-sand-100 truncate block">
          {e.displayName}
          {e.isYou && <span className="ml-2 font-body text-[10px] tracking-[0.2em] uppercase text-gold-400">You</span>}
        </span>
        <span className="font-body text-xs text-sand-500 block truncate">
          Lv.{e.level} {e.title}
        </span>
      </span>

      <span className={`font-body text-sm tabular-nums text-right ${podium ? `${podium.xp} font-medium` : "text-gold-400"}`}>
        {e.xp.toLocaleString()} <span className="text-sand-600 text-xs">XP</span>
      </span>
    </motion.li>
  );
}

export default function Leaderboard({ limit = 10, showFullLink = false, heading = "Leaderboard" }: Props) {
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/leaderboard?limit=${limit}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d: LeaderboardData) => {
        if (!cancelled) setData(d);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [limit]);

  const youOutsideTop = data?.you && !data.entries.some((e) => e.isYou) ? data.you : null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.25 }}
      className="card-ancient p-6 md:p-8"
      aria-labelledby="leaderboard-heading"
    >
      <div className="flex items-baseline justify-between gap-4 mb-5">
        <div>
          <p className="font-body text-xs tracking-[0.2em] uppercase text-sand-500 mb-1">Ranked by XP</p>
          <h2 id="leaderboard-heading" className="font-display text-2xl text-sand-100">
            {heading}
          </h2>
        </div>
        {data && (
          <p className="font-body text-xs text-sand-500">
            {data.you && data.you.xp > 0 ? (
              <>
                You&apos;re <span className="text-gold-400 font-medium">#{data.you.rank}</span> of {data.totalRanked}
              </>
            ) : (
              <>
                {data.totalRanked} learner{data.totalRanked === 1 ? "" : "s"} ranked
              </>
            )}
          </p>
        )}
      </div>

      {error && <p className="font-body text-sm text-sand-500">The leaderboard is unavailable. Try again shortly.</p>}

      {!data && !error && (
        <ul className="space-y-2" aria-busy="true">
          {Array.from({ length: Math.min(limit, 5) }).map((_, i) => (
            <li key={i} className="h-14 border border-gold-700/10 bg-obsidian-lighter animate-pulse" />
          ))}
        </ul>
      )}

      {data && data.entries.length === 0 && (
        <p className="font-body text-sm text-sand-400">
          No one has earned XP yet. Finish a sign group and you&apos;ll be first on the wall.
        </p>
      )}

      {data && data.entries.length > 0 && (
        <ol className="space-y-2">
          {data.entries.map((e, i) => (
            <Row key={`${e.rank}-${e.displayName}-${i}`} e={e} index={i} />
          ))}
          {youOutsideTop && (
            <>
              <li aria-hidden="true" className="text-center font-body text-xs text-sand-600 py-1">
                ···
              </li>
              <Row e={youOutsideTop} index={data.entries.length} />
            </>
          )}
        </ol>
      )}

      {data && data.you && data.you.xp === 0 && (
        <p className="font-body text-xs text-sand-500 mt-4">
          Earn your first XP in <Link href={FIRST_LESSON_PATH} className="text-gold-500 hover:text-gold-400">How answer engines choose sources</Link> to take a place on the wall.
        </p>
      )}

      {showFullLink && data && data.totalRanked > limit && (
        <div className="mt-5 text-right">
          <Link href="/leaderboard" className="font-body text-xs text-gold-500 hover:text-gold-400 transition-colors">
            See the full leaderboard
          </Link>
        </div>
      )}
    </motion.section>
  );
}

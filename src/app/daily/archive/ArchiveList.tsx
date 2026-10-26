"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cartoucheForPuzzle, dateForPuzzle, pastPuzzles, puzzleNumberFor } from "@/lib/daily";
import { loadArchive, type PuzzlePlay } from "../archive-store";

const DIFFICULTY = { 1: "Easy", 2: "Medium", 3: "Hard" } as const;

export default function ArchiveList() {
  const [today, setToday] = useState<number | null>(null);
  const [played, setPlayed] = useState<Record<number, PuzzlePlay>>({});

  useEffect(() => {
    setToday(puzzleNumberFor(new Date()));
    setPlayed(loadArchive());
  }, []);

  if (today === null) {
    return <div className="card-ancient p-10 text-center font-body text-sm text-sand-500 animate-pulse">Opening the archive…</div>;
  }

  const past = pastPuzzles(today);
  // the catalogue repeats, so a king read on one day shows by name on his other days too
  const readKings = new Set(Object.values(played).filter((p) => p.done).map((p) => cartoucheForPuzzle(p.n).id));
  return (
    <ol className="grid sm:grid-cols-2 gap-3">
      {past.map((n) => {
        const c = cartoucheForPuzzle(n);
        const play = played[n];
        const date = dateForPuzzle(n).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
        return (
          <li key={n}>
            <Link href={`/daily?n=${n}`} className="group card-ancient p-4 flex items-center gap-4 hover:border-gold-500/40 transition-colors">
              <span className="font-display text-2xl text-gold-400 w-12 shrink-0 tabular-nums">#{n}</span>
              <span className="flex-1 min-w-0">
                <span className="block font-body text-[11px] tracking-[0.2em] uppercase text-sand-500">
                  {date} · {DIFFICULTY[c.difficulty]}
                </span>
                <span className="block font-display text-lg text-sand-100 group-hover:text-gold-300 transition-colors truncate">
                  {play?.done || readKings.has(c.id) ? c.king : `${c.signs.length} signs, not read yet`}
                </span>
              </span>
              <span className="font-body text-xs text-sand-400 shrink-0">
                {play?.done ? (play.won ? `✓ in ${play.rows.length}` : "✕ missed") : "Play"}
              </span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}

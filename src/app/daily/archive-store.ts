import type { SlotResult } from "@/lib/daily";

/** One puzzle's play state, as /daily keeps it for today and the archive keeps it for past days. */
export type PuzzlePlay = {
  n: number;
  guesses: string[][];
  rows: SlotResult[][];
  hints: number;
  done: boolean;
  won: boolean;
  /** Slots revealed by hints (index → value) */
  revealed: Record<number, string>;
};

// Every finished daily (and every archive replay), by puzzle number, so the archive can show
// which kings a player has already read. Kept apart from lh_daily: replays never touch the streak.
const ARCHIVE_KEY = "lh_daily_archive";

export function loadArchive(): Record<number, PuzzlePlay> {
  try {
    const raw = window.localStorage.getItem(ARCHIVE_KEY);
    return raw ? (JSON.parse(raw) as Record<number, PuzzlePlay>) : {};
  } catch {
    return {};
  }
}

export function saveArchivePlay(play: PuzzlePlay) {
  try {
    window.localStorage.setItem(ARCHIVE_KEY, JSON.stringify({ ...loadArchive(), [play.n]: play }));
  } catch {}
}

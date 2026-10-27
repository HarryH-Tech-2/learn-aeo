import { prisma } from "@/lib/db";
import { calculateLevel, getLevelTitle } from "@/lib/gamification";

export type LeaderboardEntry = {
  rank: number;
  displayName: string;
  level: number;
  title: string;
  xp: number;
  lessonsCompleted: number;
  streak: number;
  isYou: boolean;
};

export type Leaderboard = {
  entries: LeaderboardEntry[];
  /** The viewer's own row — present even if they fall outside the top N. Null when not signed in. */
  you: LeaderboardEntry | null;
  /** Scholars with at least 1 XP (i.e. everyone who has a rank). */
  totalRanked: number;
};

/**
 * Public-safe display name: first name + last initial ("Harry H."), never the
 * email. Falls back to "Learner" so unnamed OAuth accounts still appear.
 */
export function toDisplayName(name: string | null | undefined): string {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "Learner";
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.`;
}

/**
 * Standard competition ranking ("1224"): ties share a rank and the next
 * distinct score skips ahead. Input must already be sorted best-first.
 */
export function assignRanks<T extends { xp: number }>(rows: T[]): (T & { rank: number })[] {
  let rank = 0;
  let prevXp: number | null = null;
  return rows.map((row, i) => {
    if (row.xp !== prevXp) {
      rank = i + 1;
      prevXp = row.xp;
    }
    return { ...row, rank };
  });
}

type RawRow = {
  id: string;
  name: string | null;
  xp: number;
  streak: { currentStreak: number } | null;
  _count: { lessonProgress: number };
};

function toEntry(row: RawRow & { rank: number }, viewerId?: string): LeaderboardEntry {
  const level = calculateLevel(row.xp);
  return {
    rank: row.rank,
    displayName: toDisplayName(row.name),
    level,
    title: getLevelTitle(level),
    xp: row.xp,
    lessonsCompleted: row._count.lessonProgress,
    streak: row.streak?.currentStreak ?? 0,
    isYou: row.id === viewerId,
  };
}

const SELECT = {
  id: true,
  name: true,
  xp: true,
  streak: { select: { currentStreak: true } },
  _count: { select: { lessonProgress: { where: { completed: true } } } },
} as const;

/**
 * Top-N scholars by XP (ties broken by lessons completed, then name so the
 * order is stable), plus the viewer's own rank wherever they sit.
 */
export async function getLeaderboard(viewerId?: string, limit = 10): Promise<Leaderboard> {
  const [top, totalRanked] = await Promise.all([
    prisma.user.findMany({
      where: { xp: { gt: 0 } },
      select: SELECT,
      orderBy: [{ xp: "desc" }, { name: "asc" }],
      take: limit,
    }),
    prisma.user.count({ where: { xp: { gt: 0 } } }),
  ]);

  const ranked = assignRanks(top);
  const entries = ranked.map((r) => toEntry(r, viewerId));

  let you: LeaderboardEntry | null = null;
  if (viewerId) {
    const inTop = entries.find((e) => e.isYou);
    if (inTop) {
      you = inTop;
    } else {
      const me = await prisma.user.findUnique({ where: { id: viewerId }, select: SELECT });
      if (me) {
        // Rank = 1 + number of scholars strictly ahead (matches competition ranking above).
        const ahead = me.xp > 0 ? await prisma.user.count({ where: { xp: { gt: me.xp } } }) : totalRanked;
        you = toEntry({ ...me, rank: me.xp > 0 ? ahead + 1 : totalRanked + 1 }, viewerId);
      }
    }
  }

  return { entries, you, totalRanked };
}

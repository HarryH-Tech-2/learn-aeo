import { prisma } from "@/lib/db";

export function isLessonComplete(score: number, totalQuestions: number): boolean {
  return score >= Math.ceil(totalQuestions * 0.6);
}

export function shouldIncrementStreak(
  lastActiveDate: Date | null,
  today: Date
): boolean | "reset" {
  if (!lastActiveDate) return true;

  const last = new Date(lastActiveDate);
  last.setHours(0, 0, 0, 0);
  const now = new Date(today);
  now.setHours(0, 0, 0, 0);

  const diffMs = now.getTime() - last.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (diffDays === 0) return false; // already counted today
  if (diffDays === 1) return true;  // consecutive day
  return "reset";                    // missed a day
}

export async function markLessonStarted(
  userId: string,
  lessonId: string
): Promise<void> {
  await prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId, lessonId } },
    update: { lastActivityAt: new Date() },
    create: {
      userId,
      lessonId,
      started: true,
      lastActivityAt: new Date(),
    },
  });
}

export async function recordQuizScore(
  userId: string,
  lessonId: string,
  score: number,
  totalQuestions: number
): Promise<void> {
  const completed = isLessonComplete(score, totalQuestions);

  // Update lesson progress
  const existing = await prisma.lessonProgress.findUnique({
    where: { userId_lessonId: { userId, lessonId } },
  });

  const bestScore =
    existing?.bestScore != null ? Math.max(existing.bestScore, score) : score;

  await prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId, lessonId } },
    update: {
      bestScore,
      completed: completed || existing?.completed || false,
      lastActivityAt: new Date(),
    },
    create: {
      userId,
      lessonId,
      started: true,
      bestScore: score,
      completed,
      lastActivityAt: new Date(),
    },
  });

  // Update streak
  if (completed) {
    const streak = await prisma.userStreak.findUnique({ where: { userId } });
    const today = new Date();
    const action = shouldIncrementStreak(streak?.lastActiveDate ?? null, today);

    if (action === true) {
      await prisma.userStreak.upsert({
        where: { userId },
        update: {
          currentStreak: (streak?.currentStreak ?? 0) + 1,
          lastActiveDate: today,
        },
        create: {
          userId,
          currentStreak: 1,
          lastActiveDate: today,
        },
      });
    } else if (action === "reset") {
      await prisma.userStreak.upsert({
        where: { userId },
        update: {
          currentStreak: 1,
          lastActiveDate: today,
        },
        create: {
          userId,
          currentStreak: 1,
          lastActiveDate: today,
        },
      });
    }
    // if false (already counted today), do nothing
  }
}

export async function getUserProgress(userId: string) {
  const [lessons, streak, userData] = await Promise.all([
    prisma.lessonProgress.findMany({
      where: { userId },
      select: {
        lessonId: true,
        started: true,
        bestScore: true,
        completed: true,
      },
    }),
    prisma.userStreak.findUnique({
      where: { userId },
      select: { currentStreak: true, lastActiveDate: true },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { xp: true, level: true },
    }),
  ]);

  // Check if streak is still valid (hasn't expired)
  let currentStreak = streak?.currentStreak ?? 0;
  if (streak?.lastActiveDate) {
    const action = shouldIncrementStreak(streak.lastActiveDate, new Date());
    if (action === "reset") {
      currentStreak = 0;
    }
  }

  const progressMap: Record<
    string,
    { started: boolean; bestScore: number | null; completed: boolean }
  > = {};
  for (const lp of lessons) {
    progressMap[lp.lessonId] = {
      started: lp.started,
      bestScore: lp.bestScore,
      completed: lp.completed,
    };
  }

  return { lessons: progressMap, streak: currentStreak, xp: userData?.xp ?? 0, level: userData?.level ?? 1 };
}

export async function recordXP(
  userId: string,
  lessonId: string,
  xp: number
): Promise<{ totalXP: number; newLevel: number }> {
  await prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId, lessonId } },
    update: { xpEarned: { increment: xp } },
    create: {
      userId,
      lessonId,
      started: true,
      xpEarned: xp,
      lastActivityAt: new Date(),
    },
  });

  const user = await prisma.user.update({
    where: { id: userId },
    data: { xp: { increment: xp } },
  });

  // Expedition log: the calendar of days dug (dashboard heatmap, rival team).
  // Server-owned so every XP source counts, whichever page earned it.
  await recordActivityDay(userId).catch((err) => console.error("[recordXP] activity log failed:", err));

  const { calculateLevel } = await import("@/lib/gamification");
  const newLevel = calculateLevel(user.xp);
  if (newLevel !== user.level) {
    await prisma.user.update({
      where: { id: userId },
      data: { level: newLevel },
    });
  }

  return { totalXP: user.xp, newLevel };
}

/**
 * Append today to the user's expedition log (GameState game "expedition-log",
 * { days: ["YYYY-MM-DD", …] }). Read by the dashboard's Journey tab.
 */
export async function recordActivityDay(userId: string, today = new Date()): Promise<void> {
  const { addLogDay, dayKey, isExpeditionLog } = await import("@/lib/expedition");
  const key = dayKey(today);
  const row = await prisma.gameState.findUnique({ where: { userId_game: { userId, game: "expedition-log" } } });
  const current = isExpeditionLog(row?.state) ? row!.state : { days: [] };
  if (current.days.includes(key)) return;
  const next = addLogDay(current, key);
  await prisma.gameState.upsert({
    where: { userId_game: { userId, game: "expedition-log" } },
    update: { state: next },
    create: { userId, game: "expedition-log", state: next },
  });
}

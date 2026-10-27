import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { isLessonComplete } from "@/lib/pass-mark";
import { calculateLevel } from "@/lib/gamification";
import { AUDIT_KEY } from "@/lib/xp-claims";

// (defined in pass-mark.ts so the client-side lesson player can import it without Prisma)
export { isLessonComplete };

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

function isUniqueViolation(err: unknown): boolean {
  return typeof err === "object" && err !== null && (err as { code?: unknown }).code === "P2002";
}

/**
 * Record one XP claim (src/lib/xp-claims.ts) and pay only what it newly earns:
 *   new key                → `xp`
 *   existing non-audit key → 0
 *   `audit`                → max(0, xp − stored best), and the higher value is stored
 * The claim write and the LessonProgress.xpEarned, User.xp and level updates run in one
 * transaction, by the awarded amount only. Two requests racing to create the same claim
 * hit the unique constraint; the loser retries once (finding the claim) and otherwise
 * counts as already claimed, awarding 0.
 */
export async function recordXP(
  userId: string,
  lessonId: string,
  key: string,
  xp: number
): Promise<{ awarded: number; totalXP: number; newLevel: number }> {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      return await prisma.$transaction((tx) => claimInTransaction(tx, userId, lessonId, key, xp));
    } catch (err) {
      if (!isUniqueViolation(err)) throw err;
    }
  }
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { xp: true, level: true } });
  return { awarded: 0, totalXP: user?.xp ?? 0, newLevel: user?.level ?? 1 };
}

type Tx = Prisma.TransactionClient;

async function claimInTransaction(
  tx: Tx,
  userId: string,
  lessonId: string,
  key: string,
  xp: number
): Promise<{ awarded: number; totalXP: number; newLevel: number }> {
  const where = { userId_lessonId_key: { userId, lessonId, key } };
  let awarded = 0;
  // A few rounds of compare-and-set on the stored audit best, so two retakes saved at
  // once cannot both be paid against the same old best.
  for (let round = 0; round < 3; round++) {
    const existing = await tx.xpClaim.findUnique({ where });
    if (!existing) {
      await tx.xpClaim.create({ data: { userId, lessonId, key, xp } });
      awarded = xp;
      break;
    }
    if (key !== AUDIT_KEY || xp <= existing.xp) break;
    const { count } = await tx.xpClaim.updateMany({
      where: { id: existing.id, xp: existing.xp },
      data: { xp },
    });
    if (count === 1) {
      awarded = xp - existing.xp;
      break;
    }
  }

  if (awarded <= 0) {
    const user = await tx.user.findUnique({ where: { id: userId }, select: { xp: true, level: true } });
    return { awarded: 0, totalXP: user?.xp ?? 0, newLevel: user?.level ?? 1 };
  }

  await tx.lessonProgress.upsert({
    where: { userId_lessonId: { userId, lessonId } },
    update: { xpEarned: { increment: awarded } },
    create: {
      userId,
      lessonId,
      started: true,
      xpEarned: awarded,
      lastActivityAt: new Date(),
    },
  });

  const user = await tx.user.update({
    where: { id: userId },
    data: { xp: { increment: awarded } },
  });

  const newLevel = calculateLevel(user.xp);
  if (newLevel !== user.level) {
    await tx.user.update({ where: { id: userId }, data: { level: newLevel } });
  }

  return { awarded, totalXP: user.xp, newLevel };
}

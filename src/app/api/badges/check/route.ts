import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getLesson, isLive } from "@/lib/lessons";
import { checkSubscription } from "@/lib/subscription";

/**
 * POST /api/badges/check { lessonId, score, total }
 * Called after /api/progress/complete has saved the audit. Checked the same way before anything is
 * awarded: the lesson is live, the total is that lesson's audit length and the score a whole number
 * within it (400 otherwise), and a paid lesson needs access (403). The district and Perfect Audit
 * badges then come from the stored LessonProgress row (completed, bestScore), never from the
 * numbers sent.
 */
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; email?: string | null } | undefined;
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as
    | { lessonId?: unknown; score?: unknown; total?: unknown }
    | null;
  const lessonId = typeof body?.lessonId === "string" ? body.lessonId : "";
  const { score, total: sentTotal } = body ?? {};
  const lesson = getLesson(lessonId);

  if (!isLive(lesson)) {
    return NextResponse.json({ error: "Unknown or unreleased lesson" }, { status: 400 });
  }
  const total = lesson.content.audit.length;
  if (
    sentTotal !== total ||
    typeof score !== "number" ||
    !Number.isInteger(score) ||
    score < 0 ||
    score > total
  ) {
    return NextResponse.json(
      { error: `score must be a whole number from 0 to ${total}, and total ${total}` },
      { status: 400 }
    );
  }

  if (!lesson.isFree) {
    const access = user.email ? await checkSubscription(user.email) : null;
    if (!access?.active) {
      return NextResponse.json({ error: "This lesson needs full access" }, { status: 403 });
    }
  }

  const awarded: string[] = [];
  const allProgress = await prisma.lessonProgress.findMany({ where: { userId: user.id } });
  const stored = allProgress.find((p) => p.lessonId === lesson.id);

  // Lesson completion badge
  if (stored?.completed) {
    const completionBadge = await prisma.badge.findFirst({
      where: { criteria: `complete:${lesson.id}` },
    });
    if (completionBadge) {
      const existing = await prisma.userBadge.findUnique({
        where: { userId_badgeId: { userId: user.id, badgeId: completionBadge.id } },
      });
      if (!existing) {
        await prisma.userBadge.create({ data: { userId: user.id, badgeId: completionBadge.id } });
        awarded.push(completionBadge.name);
      }
    }
  }

  // Perfect audit badge
  if (stored?.bestScore === total) {
    const perfectBadge = await prisma.badge.findFirst({ where: { criteria: "perfect-audit" } });
    if (perfectBadge) {
      const existing = await prisma.userBadge.findUnique({
        where: { userId_badgeId: { userId: user.id, badgeId: perfectBadge.id } },
      });
      if (!existing) {
        await prisma.userBadge.create({ data: { userId: user.id, badgeId: perfectBadge.id } });
        awarded.push(perfectBadge.name);
      }
    }
  }

  // Streak badges
  const streak = await prisma.userStreak.findUnique({ where: { userId: user.id } });
  if (streak) {
    for (const threshold of [3, 7, 30]) {
      if (streak.currentStreak >= threshold) {
        const streakBadge = await prisma.badge.findFirst({ where: { criteria: `streak:${threshold}` } });
        if (streakBadge) {
          const existing = await prisma.userBadge.findUnique({
            where: { userId_badgeId: { userId: user.id, badgeId: streakBadge.id } },
          });
          if (!existing) {
            await prisma.userBadge.create({ data: { userId: user.id, badgeId: streakBadge.id } });
            awarded.push(streakBadge.name);
          }
        }
      }
    }
  }

  // Milestone badges
  const startedCount = allProgress.filter((p) => p.started).length;
  const completedCount = allProgress.filter((p) => p.completed).length;

  const milestones = [
    { criteria: "milestone:first-lesson", check: startedCount >= 1 },
    { criteria: "milestone:half-city", check: completedCount >= 4 },
    { criteria: "milestone:all-districts", check: completedCount >= 8 },
  ];

  for (const m of milestones) {
    if (m.check) {
      const badge = await prisma.badge.findFirst({ where: { criteria: m.criteria } });
      if (badge) {
        const existing = await prisma.userBadge.findUnique({
          where: { userId_badgeId: { userId: user.id, badgeId: badge.id } },
        });
        if (!existing) {
          await prisma.userBadge.create({ data: { userId: user.id, badgeId: badge.id } });
          awarded.push(badge.name);
        }
      }
    }
  }

  return NextResponse.json({ awarded });
}

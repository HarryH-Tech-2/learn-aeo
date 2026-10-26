import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string } | undefined;
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { lessonId, score, total } = await request.json();
  const awarded: string[] = [];

  // Lesson completion badge
  const completionBadge = await prisma.badge.findFirst({
    where: { criteria: `complete:${lessonId}` },
  });
  if (completionBadge && score >= Math.ceil(total * 0.6)) {
    const existing = await prisma.userBadge.findUnique({
      where: { userId_badgeId: { userId: user.id, badgeId: completionBadge.id } },
    });
    if (!existing) {
      await prisma.userBadge.create({ data: { userId: user.id, badgeId: completionBadge.id } });
      awarded.push(completionBadge.name);
    }
  }

  // Perfect report badge
  if (score === total) {
    const perfectBadge = await prisma.badge.findFirst({ where: { criteria: "perfect-report" } });
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
  const allProgress = await prisma.lessonProgress.findMany({ where: { userId: user.id } });
  const startedCount = allProgress.filter((p) => p.started).length;
  const completedCount = allProgress.filter((p) => p.completed).length;

  const milestones = [
    { criteria: "milestone:first-glyph", check: startedCount >= 1 },
    { criteria: "milestone:30-glyphs", check: completedCount >= 4 },
    { criteria: "milestone:all-glyphs", check: completedCount >= 8 },
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

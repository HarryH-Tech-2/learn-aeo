import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { badgeDisplay } from "@/lib/gamification";

export async function GET() {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string } | undefined;
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userBadges = await prisma.userBadge.findMany({
    where: { userId: user.id },
    include: { badge: true },
    orderBy: { earnedAt: "desc" },
  });
  return NextResponse.json(
    userBadges.map((ub) => ({
      id: ub.badge.id,
      ...badgeDisplay(ub.badge),
      earnedAt: ub.earnedAt.toISOString(),
    }))
  );
}

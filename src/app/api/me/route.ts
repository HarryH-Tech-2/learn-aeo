import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getUserProgress } from "@/lib/progress";
import { checkSubscription } from "@/lib/subscription";
import { getActiveOffer } from "@/lib/offers";
import { pppBeatsOffer, requestCountry } from "@/lib/ppp";
import { ACCESS_TEST_GAME, armOf } from "@/lib/access-test";
import { auditLengths } from "@/lib/lessons";

/**
 * GET /api/me — everything the dashboard needs in one round trip: one
 * session lookup, then the queries in parallel. Replaces eight separate
 * calls (progress, badges, subscription, offer), each of which paid for its own
 * session lookup against the database.
 */
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; email?: string | null } | undefined;
  if (!user?.id || !user.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = user.id;
  const email = user.email;

  const [progress, badges, access, states, account] = await Promise.all([
    getUserProgress(userId),
    prisma.userBadge.findMany({ where: { userId }, include: { badge: true }, orderBy: { earnedAt: "desc" } }),
    checkSubscription(email),
    prisma.gameState.findMany({ where: { userId, game: { in: [ACCESS_TEST_GAME] } }, select: { game: true, state: true } }),
    prisma.user.findUnique({ where: { id: userId }, select: { heardAbout: true } }),
  ]);

  const offer = access.active ? null : await getActiveOffer(email);

  return NextResponse.json({
    progress,
    badges: badges.map((ub) => ({ id: ub.badge.id, name: ub.badge.name, description: ub.badge.description, icon: ub.badge.icon, earnedAt: ub.earnedAt.toISOString() })),
    access,
    // (not where the visitor's purchasing-power price is already lower: checkout would never use it)
    offer: offer && !pppBeatsOffer(requestCountry(request), offer.percentOff) ? { code: offer.code, expiresAt: offer.expiresAt.toISOString(), percentOff: offer.percentOff, source: offer.source } : null,
    // The free-unlock test group, for the GA4 user property access_test (src/lib/access-test.ts); null when not in it
    accessTest: armOf(states.find((s) => s.game === ACCESS_TEST_GAME)?.state),
    // false once they've answered (or skipped) "How did you find us?" (src/components/HeardAboutCard.tsx)
    askHeardAbout: !account?.heardAbout,
    // Questions in each live lesson's audit, so the city map can show a stored best score as "N of M"
    auditLengths: auditLengths(),
  });
}

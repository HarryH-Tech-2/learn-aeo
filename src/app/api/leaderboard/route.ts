import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getLeaderboard } from "@/lib/leaderboard";

export const dynamic = "force-dynamic";

const MAX_LIMIT = 50;

/**
 * GET /api/leaderboard?limit=10
 * Public — rows carry only abbreviated display names, never emails. When a
 * session exists the viewer's own row is attached (and flagged isYou).
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const requested = Number(searchParams.get("limit") ?? 10);
  const limit = Number.isFinite(requested) ? Math.min(Math.max(Math.floor(requested), 1), MAX_LIMIT) : 10;

  const session = await getServerSession(authOptions);
  const viewerId = (session?.user as { id?: string } | undefined)?.id;

  const board = await getLeaderboard(viewerId, limit);
  return NextResponse.json(board, {
    headers: { "Cache-Control": "private, no-store" },
  });
}

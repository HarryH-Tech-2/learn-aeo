import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkSubscription } from "@/lib/subscription";
import { loadWall, recordReview } from "@/lib/srs-server";
import { wallSummary } from "@/lib/srs";

/**
 * GET  /api/srs            → { signs: SignState[], summary, paid }
 * GET  /api/srs?count=1    → { due, total }              (dashboard badge)
 * POST /api/srs { glyph, quality } → { sign: SignState }
 *
 * Signed-in users only (free accounts get lesson 1's signs; paid accounts
 * get every completed lesson's signs, see src/lib/wall.ts).
 */

async function who(): Promise<{ id: string; paid: boolean } | null> {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; email?: string | null } | undefined;
  if (!user?.id) return null;
  const sub = user.email ? await checkSubscription(user.email) : { active: false };
  return { id: user.id, paid: sub.active };
}

export async function GET(request: Request) {
  const me = await who();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const now = Date.now();
  const signs = await loadWall(me.id, me.paid, now);
  const summary = wallSummary(signs, now);
  if (new URL(request.url).searchParams.get("count")) return NextResponse.json({ due: summary.due, total: summary.total });
  return NextResponse.json({ signs, summary, paid: me.paid });
}

export async function POST(request: Request) {
  const me = await who();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  let body: { glyph?: unknown; quality?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  const glyph = typeof body.glyph === "string" ? body.glyph : "";
  const quality = typeof body.quality === "number" ? Math.max(0, Math.min(5, Math.round(body.quality))) : NaN;
  if (!glyph || Number.isNaN(quality)) return NextResponse.json({ error: "glyph and quality (0–5) required" }, { status: 400 });
  const sign = await recordReview(me.id, glyph, quality as 0 | 1 | 2 | 3 | 4 | 5);
  if (!sign) return NextResponse.json({ error: "sign not on your wall" }, { status: 404 });
  return NextResponse.json({ sign });
}

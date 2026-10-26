import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { campaignFromSearch, validVisitorId } from "@/lib/campaign";

/**
 * Records one landing on a tagged marketing link (CampaignTracker posts here once per browser per campaign).
 * Body: { visitorId, search, path }. The tags are re-read from `search` with the same rules as the cookie,
 * so nothing that is not one of our tags gets stored. Repeat visits from the same browser are ignored.
 */
export async function POST(req: Request) {
  let body: { visitorId?: unknown; search?: unknown; path?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const visitorId = validVisitorId(typeof body.visitorId === "string" ? body.visitorId : null);
  const c = typeof body.search === "string" ? campaignFromSearch(body.search) : null;
  if (!visitorId || !c) return NextResponse.json({ ok: false }, { status: 400 });
  const path = typeof body.path === "string" && body.path.startsWith("/") ? body.path.slice(0, 200) : "/";

  try {
    await prisma.campaignVisit.upsert({
      where: { visitorId_source_campaign: { visitorId, source: c.source, campaign: c.campaign } },
      create: { visitorId, source: c.source, medium: c.medium, campaign: c.campaign, path },
      update: {},
    });
  } catch (e) {
    console.error("[campaign-visit]", e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

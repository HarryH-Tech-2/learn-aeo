/**
 * The "Christmas prints are open" email to everyone who ticked the box (src/lib/gift-updates.ts). Not on a
 * schedule: called by hand once the posted prints are ready.
 *
 *   GET /api/cron/gift-updates?secret=…            run (dry unless GIFT_UPDATES_ENABLED=true): who would get it
 *   GET /api/cron/gift-updates?secret=…&dry=1      force a dry run
 *   GET /api/cron/gift-updates?secret=…&preview=1[&name=Maya]  the email itself, with sample data
 *
 * Auth: `Authorization: Bearer $CRON_SECRET` or `?secret=`.
 */
import { NextRequest, NextResponse } from "next/server";
import { renderGiftUpdatesEmail } from "@/lib/gift-updates";
import { runGiftUpdates } from "@/lib/gift-updates-run";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function authorised(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  if (req.headers.get("authorization") === `Bearer ${secret}`) return true;
  return req.nextUrl.searchParams.get("secret") === secret;
}

export async function GET(req: NextRequest) {
  if (!process.env.CRON_SECRET) return NextResponse.json({ error: "CRON_SECRET is not set" }, { status: 503 });
  if (!authorised(req)) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const params = req.nextUrl.searchParams;
  if (params.get("preview")) {
    const base = (process.env.NEXTAUTH_URL ?? "https://www.learnhieroglyphics.com").replace(/\/$/, "");
    const email = renderGiftUpdatesEmail({ email: "preview@example.com", name: params.get("name") ?? "Maya" }, base, `${base}/api/email/unsubscribe?e=preview&t=preview`, new Date(2026, 10, 20));
    const page = `<!doctype html><meta charset="utf-8"><title>${email.subject}</title><body style="margin:0;background:#f4f1ea;padding:24px;">
      <p style="font-family:sans-serif;font-size:13px;color:#555;max-width:560px;margin:0 auto 16px;">Subject: <strong>${email.subject}</strong></p>${email.html}</body>`;
    return new NextResponse(page, { headers: { "Content-Type": "text/html; charset=utf-8" } });
  }
  const result = await runGiftUpdates({ dry: params.get("dry") === "1" ? true : undefined });
  return NextResponse.json(result);
}

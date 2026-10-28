/**
 * Daily nurture pass, called by Vercel Cron (see vercel.json).
 *
 *   GET /api/cron/nurture                 run (dry unless NURTURE_ENABLED=true)
 *   GET /api/cron/nurture?dry=1           force a dry run
 *   GET /api/cron/nurture?preview=<step>  render one email with sample data
 *
 * The same pass sends the purchase feedback email (src/lib/purchase-feedback-run.ts), dry unless
 * PURCHASE_FEEDBACK_ENABLED=true; `dry=1` keeps it dry too.
 *   GET /api/cron/nurture?preview=purchase-feedback[&plan=monthly]  show that email's plain text
 *
 * Auth: `Authorization: Bearer $CRON_SECRET` (Vercel adds it) or `?secret=`.
 */
import { NextRequest, NextResponse } from "next/server";
import { SITE } from "@/lib/site";
import { runNurture, nurtureEnabled } from "@/lib/nurture-run";
import { renderNurtureEmail, sampleContext } from "@/lib/nurture-emails";
import { NURTURE_STEPS, type NurtureStepKey } from "@/lib/nurture";
import { renderFeedbackEmail } from "@/lib/purchase-feedback";
import { runPurchaseFeedback, purchaseFeedbackEnabled } from "@/lib/purchase-feedback-run";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = req.headers.get("authorization");
  if (header === `Bearer ${secret}`) return true;
  return req.nextUrl.searchParams.get("secret") === secret;
}

export async function GET(req: NextRequest) {
  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ error: "CRON_SECRET is not set" }, { status: 503 });
  }
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const params = req.nextUrl.searchParams;
  const preview = params.get("preview");
  if (preview === "purchase-feedback") {
    const email = renderFeedbackEmail("Sample Buyer", params.get("plan") === "monthly" ? "monthly" : "lifetime");
    return new NextResponse(`Subject: ${email.subject}\n\n${email.text}\n`, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }
  if (preview) {
    const keys = NURTURE_STEPS.map((s) => s.key);
    if (!keys.includes(preview as NurtureStepKey)) {
      return NextResponse.json({ error: `Unknown step. One of: ${keys.join(", ")}` }, { status: 400 });
    }
    const base = (process.env.NEXTAUTH_URL ?? SITE.url).replace(/\/$/, "");
    const ctx = sampleContext(base, { lesson1Completed: params.get("done") === "1", lesson1Started: params.get("started") === "1" });
    const email = renderNurtureEmail(preview as NurtureStepKey, ctx);
    const page = `<!doctype html><title>${email.subject}</title><body style="margin:0;background:#f4f1ea;padding:24px;">
      <p style="font-family:sans-serif;font-size:13px;color:#555;max-width:520px;margin:0 auto 16px;">Subject: <strong>${email.subject}</strong></p>${email.html}</body>`;
    return new NextResponse(page, { headers: { "Content-Type": "text/html; charset=utf-8" } });
  }

  const forceDry = params.get("dry") === "1";
  const dry = forceDry || !nurtureEnabled();
  const result = await runNurture({ dry });
  const purchaseFeedback = await runPurchaseFeedback({ dry: forceDry || !purchaseFeedbackEnabled() }).catch((err: unknown) => ({
    error: err instanceof Error ? err.message : String(err),
  }));
  return NextResponse.json({
    enabled: nurtureEnabled(),
    ...result,
    purchaseFeedback: { enabled: purchaseFeedbackEnabled(), ...purchaseFeedback },
  });
}

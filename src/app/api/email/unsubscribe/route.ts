/**
 * One-click unsubscribe from the nurture sequence. Linked from every nurture
 * email footer and the List-Unsubscribe header (so Gmail's button works,
 * which POSTs). Transactional mail (sign-in links, receipts) is unaffected.
 *
 * ?u=<user id>: an account (the nurture sequence). ?e=<email>: someone known only by address, such as the
 * "Christmas prints are open" opt-in (src/lib/gift-updates.ts); recorded as a "no-more" EmailLead row.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyLeadUnsubscribeToken, verifyUnsubscribeToken } from "@/lib/unsubscribe";
import { recordLead } from "@/lib/leads";
import { NO_MORE_SOURCE } from "@/lib/gift-updates";

export const dynamic = "force-dynamic";

function page(title: string, body: string, status = 200): NextResponse {
  const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head>
<body style="margin:0;background:#1a1a2e;color:#c4b590;font-family:Georgia,serif;">
  <div style="max-width:480px;margin:64px auto;padding:40px;border:1px solid rgba(212,168,50,0.3);text-align:center;">
    <div style="font-size:48px;">&#x13080;</div>
    <h1 style="color:#d4a832;font-weight:400;font-size:24px;">${title}</h1>
    <p style="font-size:15px;line-height:1.6;">${body}</p>
  </div>
</body></html>`;
  return new NextResponse(html, { status, headers: { "Content-Type": "text/html; charset=utf-8" } });
}

async function handle(req: NextRequest): Promise<NextResponse> {
  const email = req.nextUrl.searchParams.get("e");
  if (email !== null) {
    if (!verifyLeadUnsubscribeToken(email, req.nextUrl.searchParams.get("t") ?? "")) {
      return page(
        "That link did not work",
        "It may have been cut short by your email app. Reply to any of our emails and we will take you off the list by hand.",
        400
      );
    }
    await recordLead({ email: email.trim().toLowerCase(), source: NO_MORE_SOURCE });
    return page("You are unsubscribed", "No more emails from us. Anything you bought is untouched, and its download links still work.");
  }
  const userId = req.nextUrl.searchParams.get("u") ?? "";
  const token = req.nextUrl.searchParams.get("t") ?? "";
  if (!verifyUnsubscribeToken(userId, token)) {
    return page(
      "That link did not work",
      "It may have been cut short by your email app. Reply to any of our emails and we will take you off the list by hand.",
      400
    );
  }
  await prisma.user.updateMany({
    where: { id: userId, emailUnsubscribedAt: null },
    data: { emailUnsubscribedAt: new Date() },
  });
  return page(
    "You are unsubscribed",
    "No more emails from the sequence. Sign-in links and receipts still arrive when you ask for them, and your account and progress are untouched."
  );
}

export async function GET(req: NextRequest) {
  return handle(req);
}

export async function POST(req: NextRequest) {
  return handle(req);
}

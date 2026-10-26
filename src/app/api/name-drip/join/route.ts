/**
 * GET /api/name-drip/join?e=<email>&n=<name>&t=<token>
 * "Yes, send me the three emails" from the name picture's email (src/lib/keyboard-email.ts): records the
 * "name-drip" opt-in (src/lib/name-drip.ts) plus the Christmas prints email, for the signed address only. Saying
 * yes again after an unsubscribe is a fresh yes, so it lifts the earlier "no-more".
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { recordLead, normaliseEmail } from "@/lib/leads";
import { notifyOwner } from "@/lib/notify";
import { NO_MORE_SOURCE } from "@/lib/gift-updates";
import { NAME_DRIP_SOURCE } from "@/lib/name-drip";
import { verifyNameDripJoinToken } from "@/lib/unsubscribe";

export const dynamic = "force-dynamic";

function page(title: string, body: string, status = 200): NextResponse {
  const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head>
<body style="margin:0;background:#0a0a0f;color:#f0e8d8;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
  <div style="max-width:480px;margin:64px auto;padding:40px 32px;border:1px solid #6b5520;outline:1px solid #2e2a1c;outline-offset:-6px;background:#12121a;text-align:center;">
    <img src="/email/mark.png" width="40" height="40" alt="" style="display:block;margin:0 auto 16px;">
    <h1 style="color:#d4a832;font-family:Georgia,serif;font-weight:400;font-size:24px;margin:0 0 14px;">${title}</h1>
    <p style="font-size:15px;line-height:1.6;color:#b09070;margin:0 0 24px;">${body}</p>
    <a href="/translate-name-to-hieroglyphics" style="color:#e8c460;font-size:14px;">Back to the translator</a>
  </div>
</body></html>`;
  return new NextResponse(html, { status, headers: { "Content-Type": "text/html; charset=utf-8" } });
}

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("e") ?? "";
  const name = (req.nextUrl.searchParams.get("n") ?? "").slice(0, 60);
  if (!verifyNameDripJoinToken(raw, req.nextUrl.searchParams.get("t") ?? "")) {
    return page("That link did not work", "It may have been cut short by your email app. Reply to the email instead and I will add you by hand.", 400);
  }
  const email = normaliseEmail(raw);
  const known = await prisma.emailLead.findUnique({ where: { email_source: { email, source: NAME_DRIP_SOURCE } }, select: { id: true } }).catch(() => null);
  await prisma.emailLead.deleteMany({ where: { email, source: NO_MORE_SOURCE } }).catch(() => {});
  await recordLead({ email, source: NAME_DRIP_SOURCE, name: name || null });
  await recordLead({ email, source: "gift-updates", name: name || null });
  if (!known) void notifyOwner({ subject: `Name follow-up opt-in: ${email}`, text: `${email} said yes to the name follow-up from their picture email ("${name}").`, replyTo: email });
  return page(
    "You're in",
    `The first email arrives tomorrow: what each sign in ${name ? name.replace(/[<>&"]/g, "") : "your name"} is a picture of. Three in all, and every one has an unsubscribe link.`
  );
}

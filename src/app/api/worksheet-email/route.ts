import { NextResponse } from "next/server";
import { Resend } from "resend";
import { recordLead, isValidEmail, normaliseEmail } from "@/lib/leads";
import { notifyOwner, ownerEmail } from "@/lib/notify";
import { renderWorksheetEmail } from "@/lib/worksheet-email";
import { allowSend, clientIp } from "@/lib/send-limit";

export const dynamic = "force-dynamic";

const SITE = process.env.NEXTAUTH_URL || "https://www.learnhieroglyphics.com";

/** "Harry from Learn Hieroglyphics <addr>" unless the env already carries a display name. */
function fromAddress(): string {
  const raw = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
  return raw.includes("<") ? raw : `Harry from Learn Hieroglyphics <${raw}>`;
}

/** "Email me the worksheet and lesson plan" on /teachers/worksheet. */
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  if (!isValidEmail(body?.email)) {
    return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
  }
  const to = normaliseEmail(body.email);
  // Anyone can type any address, so cap it: 6 an hour from one visitor, 3 a day to one inbox.
  if (!allowSend(`ws-ip:${clientIp(request)}`, 6, 60 * 60 * 1000) || !allowSend(`ws-to:${to}`, 3, 24 * 60 * 60 * 1000)) {
    return NextResponse.json({ error: "That's a few already. Please try again later." }, { status: 429 });
  }

  // Our own copy of the lead first: it must survive Resend's 30-day log.
  await recordLead({ email: to, source: "worksheet" });
  void notifyOwner({
    subject: `Worksheet lead: ${to}`,
    text: `${to} asked for the worksheet and lesson plan on /teachers/worksheet. Probably a teacher: a Classroom licence prospect.`,
    replyTo: to,
  });

  const resend = new Resend(process.env.RESEND_API_KEY);
  const email = renderWorksheetEmail(SITE);
  try {
    const result = await resend.emails.send({
      from: fromAddress(),
      to,
      replyTo: ownerEmail(),
      subject: email.subject,
      html: email.html,
      text: email.text,
      tags: [{ name: "lead", value: "worksheet" }],
    });
    if (result.error) {
      console.error("[worksheet-email] Resend error:", result.error);
      return NextResponse.json({ error: "Could not send the email" }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[worksheet-email] send failed:", err);
    return NextResponse.json({ error: "Could not send the email" }, { status: 500 });
  }
}

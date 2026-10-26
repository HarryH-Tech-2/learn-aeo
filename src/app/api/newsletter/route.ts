import { NextResponse } from "next/server";
import { SITE } from "@/lib/site";
import { Resend } from "resend";
import { ownerEmail } from "@/lib/notify";
import { recordLead, isValidEmail, normaliseEmail } from "@/lib/leads";
import { brandFrom, button, emailLayout, heading, paragraph } from "@/lib/email-layout";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const body = await request.json().catch(() => ({}));
  const rawEmail = body?.email;

  if (!isValidEmail(rawEmail)) {
    return NextResponse.json(
      { error: "A valid email is required" },
      { status: 400 }
    );
  }
  const email = normaliseEmail(rawEmail);

  // Our own record first — Resend's log only keeps 30 days.
  await recordLead({ email, source: "newsletter" });

  // Optionally add to a Resend audience if one is configured. Failure here
  // (e.g. missing audience id, invalid key) must not block the thank-you email.
  const audienceId = process.env.RESEND_AUDIENCE_ID;
  if (audienceId) {
    try {
      await resend.contacts.create({
        audienceId,
        email,
        unsubscribed: false,
      });
    } catch (err) {
      console.error("[newsletter] contacts.create failed:", err);
    }
  }

  // Notify the site owner that someone subscribed. Failure must not block
  // the welcome email going out to the subscriber.
  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: ownerEmail(),
      replyTo: email,
      subject: `Newsletter signup: ${email}`,
      text: `New newsletter subscriber: ${email}`,
    });
  } catch (err) {
    console.error("[newsletter] owner notification failed:", err);
  }

  try {
    await resend.emails.send({
      from: brandFrom(),
      to: email,
      subject: "Welcome to Learn AEO!",
      html: welcomeHtml((process.env.NEXTAUTH_URL || SITE.url).replace(/\/$/, "")),
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to subscribe" },
      { status: 500 }
    );
  }
}

/** The welcome email, in the shared email look. */
function welcomeHtml(site: string): string {
  return emailLayout({
    baseUrl: site,
    preheader: "Weekly updates on Ancient Egypt and platform news, straight to your inbox.",
    body: [
      heading("Welcome to Learn AEO!"),
      paragraph("Thank you for subscribing! You'll receive weekly updates on Ancient Egypt and platform news straight to your inbox."),
      paragraph("In the meantime, why not start exploring? We have lessons that take you from the Valley of the Kings to the Rosetta Stone."),
      button(`${site}/get-started`, "Get Lifetime Access"),
    ].join(""),
    signature: false,
    reason: "Learn AEO: Master the writing of Ancient Egypt",
  });
}

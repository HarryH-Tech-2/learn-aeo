import { NextResponse } from "next/server";
import { SITE } from "@/lib/site";
import { Resend } from "resend";
import { ownerEmail } from "@/lib/notify";
import { recordLead, isValidEmail, normalizeEmail } from "@/lib/leads";
import { brandFrom } from "@/lib/email-layout";
import { newsletterWelcomeHtml } from "@/lib/newsletter-email";
import { clientKey, rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  // The footer form is public and every sign-up sends an email, so cap it per visitor.
  const limit = rateLimit(`newsletter:${clientKey(request)}`, { limit: 5, windowMs: 10 * 60_000 });
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many sign-ups. Try again in a few minutes." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } }
    );
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const body = await request.json().catch(() => ({}));
  const rawEmail = body?.email;

  if (!isValidEmail(rawEmail)) {
    return NextResponse.json(
      { error: "A valid email is required" },
      { status: 400 }
    );
  }
  const email = normalizeEmail(rawEmail);

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
      subject: "Welcome to Learn AEO",
      html: newsletterWelcomeHtml((process.env.NEXTAUTH_URL || SITE.url).replace(/\/$/, ""), email),
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to subscribe" },
      { status: 500 }
    );
  }
}

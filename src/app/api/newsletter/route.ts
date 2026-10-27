import { NextResponse } from "next/server";
import { SITE } from "@/lib/site";
import { FIRST_LESSON_PATH } from "@/lib/lesson-catalog";
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
      subject: "Welcome to Learn AEO",
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
    preheader: "Course news from Learn AEO, and a free first lesson to start with.",
    body: [
      heading("Welcome to Learn AEO"),
      paragraph("Thanks for subscribing. We will email you when there is news about the course, such as a new lesson opening."),
      paragraph("While you wait, Lesson 1 is free: how answer engines like Google's AI Overviews, ChatGPT search and Perplexity build an answer, and how they choose which pages to cite."),
      button(`${site}${FIRST_LESSON_PATH}`, "Start Lesson 1"),
    ].join(""),
    signature: false,
    reason: "You are getting this because you subscribed at learnaeo.com.",
  });
}

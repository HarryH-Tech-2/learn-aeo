import { NextResponse } from "next/server";
import { Resend } from "resend";
import { recordLead, isValidEmail, normaliseEmail } from "@/lib/leads";
import { notifyOwner } from "@/lib/notify";
import { brandFrom } from "@/lib/email-layout";

export const dynamic = "force-dynamic";

const MAX_NAME = 30;
/** Base64 payload cap (~1.5 MB decoded). A flat 1200×630 PNG is ~40–80 KB;
 *  the cap only exists to stop abuse, well under Vercel's 4.5 MB body limit. */
const MAX_IMAGE_B64 = 2_000_000;
const PNG_PREFIX = "data:image/png;base64,";

const SITE = process.env.NEXTAUTH_URL || "https://www.learnhieroglyphics.com";

export async function POST(request: Request) {
  let body: { email?: unknown; name?: unknown; image?: unknown; glyphs?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { email, name, image, glyphs } = body;

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
  }
  if (typeof name !== "string" || !name.trim() || name.trim().length > MAX_NAME) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  if (
    typeof image !== "string" ||
    !image.startsWith(PNG_PREFIX) ||
    image.length - PNG_PREFIX.length > MAX_IMAGE_B64
  ) {
    return NextResponse.json({ error: "Image is missing or too large" }, { status: 400 });
  }
  const glyphText = typeof glyphs === "string" ? glyphs.slice(0, 60) : "";

  const cleanName = name.trim();
  const to = normaliseEmail(email);
  const base64 = image.slice(PNG_PREFIX.length);
  const filename = `${cleanName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "my"}-cartouche.png`;

  // Our own copy of the lead first — it must survive Resend's 30-day log.
  await recordLead({ email: to, source: "cartouche", name: cleanName });
  void notifyOwner({
    subject: `Cartouche lead: ${to}`,
    text: `${to} asked for their cartouche ("${cleanName}") and the free lesson.`,
    replyTo: to,
  });

  const resend = new Resend(process.env.RESEND_API_KEY);

  const audienceId = process.env.RESEND_AUDIENCE_ID;
  if (audienceId) {
    try {
      await resend.contacts.create({ audienceId, email: to, unsubscribed: false });
    } catch (err) {
      console.error("[cartouche-email] contacts.create failed:", err);
    }
  }

  const lessonUrl = `${SITE}/get-started?utm_source=cartouche-email&utm_medium=email&utm_campaign=cartouche`;
  const translatorUrl = `${SITE}/translate-name-to-hieroglyphics?utm_source=cartouche-email&utm_medium=email&utm_campaign=cartouche`;

  try {
    const result = await resend.emails.send({
      from: brandFrom(),
      to,
      subject: `Your cartouche: ${cleanName} in hieroglyphs 𓂀`,
      attachments: [{ filename, content: base64 }],
      html: `
        <div style="max-width: 520px; margin: 0 auto; font-family: Georgia, serif; background: #1a1a2e; padding: 40px; border: 1px solid rgba(212,168,50,0.3);">
          <div style="text-align: center; margin-bottom: 24px;">
            <span style="font-size: 44px;">&#x13080;</span>
            <h1 style="color: #d4a832; font-size: 24px; font-weight: 400; margin: 12px 0 4px;">
              ${escapeHtml(cleanName)}, as a scribe would write it
            </h1>
            ${glyphText ? `<p style="color: #d4a832; font-size: 40px; margin: 8px 0 0; font-family: 'Noto Sans Egyptian Hieroglyphs', 'Segoe UI Historic', serif;">${escapeHtml(glyphText)}</p>` : ""}
          </div>
          <p style="color: #c4b590; font-size: 15px; line-height: 1.6; text-align: center;">
            Your cartouche is attached as an image: save it, share it, or print it.
            In ancient Egypt only a pharaoh&rsquo;s name went inside the oval rope, so you&rsquo;re in good company.
          </p>
          <p style="color: #c4b590; font-size: 15px; line-height: 1.6; text-align: center; margin-bottom: 28px;">
            Want to know what each sign means and how to read real inscriptions? The first lesson of our course
            teaches the whole 25-sign alphabet in about 25 minutes, and it&rsquo;s free.
          </p>
          <div style="text-align: center; margin-bottom: 28px;">
            <a href="${lessonUrl}" style="display: inline-block; background: linear-gradient(135deg, #d4a832, #b8922a); color: #1a1a2e; padding: 14px 32px; text-decoration: none; font-size: 16px; font-weight: 600; letter-spacing: 0.5px;">
              Start the free lesson
            </a>
          </div>
          <p style="color: #8a8070; font-size: 12px; text-align: center; line-height: 1.5;">
            Make another cartouche: <a href="${translatorUrl}" style="color: #8a8070;">learnhieroglyphics.com</a><br/>
            You asked for this email on our name translator. We won&rsquo;t send more unless you sign up.
          </p>
        </div>
      `,
    });

    if (result.error) {
      console.error("[cartouche-email] Resend error:", result.error);
      return NextResponse.json({ error: "Could not send the email" }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[cartouche-email] send failed:", err);
    return NextResponse.json({ error: "Could not send the email" }, { status: 500 });
  }
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

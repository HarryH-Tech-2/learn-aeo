import { NextResponse } from "next/server";
import { Resend } from "resend";
import { ownerEmail } from "@/lib/notify";
import { recordLead, isValidEmail, normaliseEmail } from "@/lib/leads";

export const dynamic = "force-dynamic";

/**
 * "Would you learn to read cuneiform?" on /write-your-name-in-cuneiform (2026-10-24): a demand test for a cuneiform
 * course. The email is kept as a lead (source cuneiform-course) and the owner is told; the visitor gets no mail now,
 * only the one promised if a course opens.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  if (!isValidEmail(body?.email)) {
    return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
  }
  const email = normaliseEmail(body.email);
  const name = typeof body?.name === "string" ? body.name.trim().slice(0, 30) || null : null;

  await recordLead({ email, source: "cuneiform-course", name });

  try {
    await new Resend(process.env.RESEND_API_KEY).emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: ownerEmail(),
      replyTo: email,
      subject: `Cuneiform course interest: ${email}`,
      text: `Someone asked to hear if a cuneiform course opens.\n\nEmail: ${email}${name ? `\nName typed: ${name}` : ""}`,
    });
  } catch (err) {
    console.error("[cuneiform-interest] owner notification failed:", err);
  }

  return NextResponse.json({ ok: true });
}

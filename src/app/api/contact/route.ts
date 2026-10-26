import { NextResponse } from "next/server";
import { Resend } from "resend";
import { ownerEmail } from "@/lib/notify";

export const dynamic = "force-dynamic";

const CONTACT_AUDIENCE_ID = "97906f32-8a12-496a-bc47-10d5b22dd383";

export async function POST(request: Request) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { name, email, message } = await request.json();

  if (!name || !email || !message) {
    return NextResponse.json(
      { error: "Name, email, and message are required" },
      { status: 400 }
    );
  }

  // Add the sender to the Resend contact-form audience. Split the provided
  // name into first/last as Resend stores them separately. A failure here
  // must not block delivery of the actual contact email.
  const [firstName, ...rest] = name.trim().split(/\s+/);
  const lastName = rest.join(" ");
  try {
    await resend.contacts.create({
      audienceId: CONTACT_AUDIENCE_ID,
      email,
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      unsubscribed: false,
    });
  } catch (err) {
    console.error("[contact] contacts.create failed:", err);
  }

  try {
    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: ownerEmail(),
      replyTo: email,
      subject: `Contact form: ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
    });

    if (result.error) {
      console.error("[contact] Resend error:", result.error);
      return NextResponse.json(
        { error: "Failed to send message" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[contact] Exception:", err);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}

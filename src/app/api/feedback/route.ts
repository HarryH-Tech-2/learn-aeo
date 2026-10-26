import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Resend } from "resend";
import { ownerEmail } from "@/lib/notify";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

const MAX_MESSAGE_LENGTH = 2000;

export async function POST(request: Request) {
  const { message, rating, page, email } = await request.json();

  if (!message || typeof message !== "string" || !message.trim()) {
    return NextResponse.json(
      { error: "Message is required" },
      { status: 400 }
    );
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json(
      { error: `Message must be ${MAX_MESSAGE_LENGTH} characters or fewer` },
      { status: 400 }
    );
  }

  const session = await getServerSession(authOptions);
  // A signed-out visitor may leave an email to be answered (the site-wide feedback seal)
  const guestEmail = typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ? email.trim().slice(0, 200) : null;
  const replyTo = session?.user?.email ?? guestEmail;
  const userEmail = session?.user?.email ?? (guestEmail ? `${guestEmail} (not signed in)` : "(anonymous)");
  const userName = session?.user?.name ?? "(no name)";
  const ratingLabel =
    typeof rating === "number" && rating >= 1 && rating <= 5
      ? `${rating}/5`
      : "(not provided)";
  const pageLabel = typeof page === "string" ? page : "(unknown)";

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: ownerEmail(),
      ...(replyTo ? { replyTo } : {}),
      subject: `Feedback from ${pageLabel}${ratingLabel === "(not provided)" ? "" : `: ${ratingLabel}`}`,
      text: [
        `From: ${userName} <${userEmail}>`,
        `Page: ${pageLabel}`,
        `Rating: ${ratingLabel}`,
        ``,
        message.trim(),
      ].join("\n"),
    });
    // Resend reports a refused send in the result rather than throwing: without this the visitor was thanked for a
    // message that never arrived
    if (result?.error) {
      console.error("[feedback] Resend error:", result.error);
      return NextResponse.json({ error: "Failed to send feedback" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[feedback] Failed to send:", error);
    return NextResponse.json(
      { error: "Failed to send feedback" },
      { status: 500 }
    );
  }
}

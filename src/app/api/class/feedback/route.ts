import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notifyOwner } from "@/lib/notify";

export const dynamic = "force-dynamic";

const MAX_MESSAGE_LENGTH = 2000;
const RATINGS = ["loved", "ok", "poor"] as const;
const RATING_LABEL: Record<(typeof RATINGS)[number], string> = { loved: "The class loved it", ok: "It was OK", poor: "It didn't work for us" };

/** POST /api/class/feedback: a teacher's note about the live quiz, sent to the owner's inbox. */
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const message = typeof body?.message === "string" ? body.message.trim() : "";
  const rating = RATINGS.find((r) => r === body?.rating);
  if (!message && !rating) return NextResponse.json({ error: "Write a line or pick how it went" }, { status: 400 });
  if (message.length > MAX_MESSAGE_LENGTH) return NextResponse.json({ error: `Keep it to ${MAX_MESSAGE_LENGTH} characters or fewer` }, { status: 400 });

  const session = await getServerSession(authOptions);
  const email = session?.user?.email ?? null;
  const teams = Number.isFinite(body?.teams) ? Number(body.teams) : null;
  const where = typeof body?.where === "string" ? body.where.slice(0, 40) : "(unknown)";

  const sent = await notifyOwner({
    subject: `Classroom quiz feedback: ${rating ? RATING_LABEL[rating] : "an idea"}`,
    text: [
      `From: ${session?.user?.name ?? "(no name)"} <${email ?? "not signed in"}>`,
      `Sent from: ${where}${teams !== null ? ` · ${teams} team${teams === 1 ? "" : "s"} in the room` : ""}`,
      `How it went: ${rating ? RATING_LABEL[rating] : "(not said)"}`,
      ``,
      message || "(no message)",
    ].join("\n"),
    ...(email ? { replyTo: email } : {}),
  });
  if (!sent) return NextResponse.json({ error: "Could not send that, try again" }, { status: 500 });
  return NextResponse.json({ ok: true });
}

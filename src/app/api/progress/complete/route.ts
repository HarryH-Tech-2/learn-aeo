import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { recordQuizScore } from "@/lib/progress";
import { isLessonComplete } from "@/lib/pass-mark";
import { getLesson, isLive } from "@/lib/lessons";
import { checkSubscription } from "@/lib/subscription";
import { OFFER_PERCENT_OFF, grantOffer, getActiveOffer } from "@/lib/offers";
import { sendLessonCompleteEmail } from "@/lib/email";
import { prisma } from "@/lib/db";
import { pppBeatsOffer, requestCountry } from "@/lib/ppp";

/**
 * POST /api/progress/complete { lessonId, score, totalQuestions }
 * Records a finished audit. Checked before anything is written: the lesson is live, the total is
 * that lesson's audit length and the score a whole number within it (400 otherwise), and a paid
 * lesson needs access (403).
 */
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; email?: string | null; name?: string | null } | undefined;

  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as
    | { lessonId?: unknown; score?: unknown; totalQuestions?: unknown }
    | null;
  const lessonId = typeof body?.lessonId === "string" ? body.lessonId : "";
  const { score, totalQuestions } = body ?? {};
  const lesson = getLesson(lessonId);

  if (!isLive(lesson)) {
    return NextResponse.json({ error: "Unknown or unreleased lesson" }, { status: 400 });
  }
  const total = lesson.content.audit.length;
  if (
    totalQuestions !== total ||
    typeof score !== "number" ||
    !Number.isInteger(score) ||
    score < 0 ||
    score > total
  ) {
    return NextResponse.json(
      { error: `score must be a whole number from 0 to ${total}, and totalQuestions ${total}` },
      { status: 400 }
    );
  }

  if (!lesson.isFree) {
    const access = user.email ? await checkSubscription(user.email) : null;
    if (!access?.active) {
      return NextResponse.json({ error: "This lesson needs full access" }, { status: 403 });
    }
  }

  await recordQuizScore(user.id, lesson.id, score, total);

  // Finishing the free lesson is the highest-intent moment we have: open a
  // 24-hour "next district" offer (no-op for paying users) and email it.
  let offer = null;
  // (no offer where the visitor's purchasing-power price is already lower: see pppBeatsOffer)
  const pppLower = pppBeatsOffer(requestCountry(request), OFFER_PERCENT_OFF);
  if (lesson.isFree && isLessonComplete(score, total) && user.email && !pppLower) {
    try {
      const hadOffer = await getActiveOffer(user.email);
      const granted = await grantOffer(user.email, "lesson-complete");
      if (granted) {
        offer = {
          code: granted.code,
          expiresAt: granted.expiresAt.toISOString(),
          percentOff: granted.percentOff,
          source: granted.source,
        };
        // An earlier section-complete offer carried no email; this is the one that does.
        if (!hadOffer || hadOffer.source === "section-complete") {
          const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { name: true } });
          void sendLessonCompleteEmail({
            name: dbUser?.name ?? user.name,
            email: user.email,
            code: granted.code,
            expiresAt: granted.expiresAt,
            percentOff: granted.percentOff,
            lessonId: lesson.id,
          }).catch((err) => console.error("[progress/complete] offer email failed:", err));
        }
      }
    } catch (err) {
      console.error("[progress/complete] offer failed:", err);
    }
  }

  return NextResponse.json({ ok: true, offer });
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isLessonComplete, recordQuizScore } from "@/lib/progress";
import { lessons } from "@/lib/lessons";
import { OFFER_PERCENT_OFF, grantOffer, getActiveOffer } from "@/lib/offers";
import { sendNextChamberEmail } from "@/lib/email";
import { prisma } from "@/lib/db";
import { pppBeatsOffer, requestCountry } from "@/lib/ppp";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; email?: string | null; name?: string | null } | undefined;

  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { lessonId, score, totalQuestions } = await request.json();

  if (!lessonId || score == null || !totalQuestions) {
    return NextResponse.json(
      { error: "lessonId, score, and totalQuestions are required" },
      { status: 400 }
    );
  }

  await recordQuizScore(user.id, lessonId, score, totalQuestions);

  // Finishing the free lesson is the highest-intent moment we have: open a
  // 24-hour "next chamber" offer (no-op for paying users) and email it.
  let offer = null;
  const lesson = lessons.find((l) => l.id === lessonId);
  // (no offer where the visitor's purchasing-power price is already lower: see pppBeatsOffer)
  const pppLower = pppBeatsOffer(requestCountry(request), OFFER_PERCENT_OFF);
  if (lesson?.isFree && isLessonComplete(score, totalQuestions) && user.email && !pppLower) {
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
        // An offer opened at a section end carried no email; this is the one that does.
        if (!hadOffer || hadOffer.source === "section-complete") {
          const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { name: true } });
          void sendNextChamberEmail({
            name: dbUser?.name ?? user.name,
            email: user.email,
            code: granted.code,
            expiresAt: granted.expiresAt,
            percentOff: granted.percentOff,
          }).catch((err) => console.error("[progress/complete] offer email failed:", err));
        }
      }
    } catch (err) {
      console.error("[progress/complete] offer failed:", err);
    }
  }

  return NextResponse.json({ ok: true, offer });
}

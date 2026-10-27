import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { lessons } from "@/lib/legacy-lessons";
import { sectionPlan } from "@/lib/content/lesson-sections";
import { checkSubscription } from "@/lib/subscription";
import { OFFER_PERCENT_OFF, grantOffer } from "@/lib/offers";
import { pppBeatsOffer, requestCountry } from "@/lib/ppp";

/**
 * POST /api/progress/section { lessonId, section } → { ok, paid, offer }
 *
 * A section of a sectioned free lesson was finished. The learner's place is
 * kept in the expedition state by the client; this call only decides what
 * the upgrade screen shows: nothing for paying users, otherwise the 24-hour
 * discount (the live one if there is one, so it is never shortened).
 * No email here; the "next chamber" email still goes out on lesson complete.
 */
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; email?: string | null } | undefined;
  if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { lessonId?: unknown; section?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  const lessonId = typeof body.lessonId === "string" ? body.lessonId : "";
  const section = typeof body.section === "number" ? body.section : NaN;
  const plan = sectionPlan(lessonId);
  const lesson = lessons.find((l) => l.id === lessonId);
  if (!plan || !lesson?.isFree || !Number.isInteger(section) || section < 1 || section > plan.sections.length) {
    return NextResponse.json({ error: "unknown lesson section" }, { status: 400 });
  }

  let paid = false;
  // (the free-unlock group: no pitch, a coffee ask in its place; src/lib/access-test.ts)
  let freeUnlock = false;
  let offer = null;
  if (user.email) {
    try {
      const access = await checkSubscription(user.email);
      paid = access.active;
      freeUnlock = access.via === "free-unlock";
      // (no offer where the visitor's purchasing-power price is already lower: see pppBeatsOffer)
      if (!paid && !pppBeatsOffer(requestCountry(request), OFFER_PERCENT_OFF)) {
        const granted = await grantOffer(user.email, "section-complete");
        if (granted) {
          offer = { code: granted.code, expiresAt: granted.expiresAt.toISOString(), percentOff: granted.percentOff, source: granted.source };
        }
      }
    } catch (err) {
      // The pitch still shows at full price if Stripe or the database hiccups.
      console.error("[progress/section] offer failed:", err);
    }
  }
  return NextResponse.json({ ok: true, paid, freeUnlock, offer });
}

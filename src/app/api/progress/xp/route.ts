import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { recordXP } from "@/lib/progress";
import { getLesson, isLive } from "@/lib/lessons";
import { checkSubscription } from "@/lib/subscription";
import { xpForClaim } from "@/lib/xp-claims";

/**
 * POST /api/progress/xp { lessonId, key, auditScore? } → { awarded, totalXP, newLevel }
 * The client names the step it finished (a claim key from src/lib/xp-claims.ts); the
 * server prices it and pays it once. 401 signed out; 400 for an unknown or coming-soon
 * lesson or a key that is not in the lesson; 403 for a paid lesson without access.
 */
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; email?: string | null } | undefined;
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as
    | { lessonId?: unknown; key?: unknown; auditScore?: unknown }
    | null;
  const lessonId = typeof body?.lessonId === "string" ? body.lessonId : "";
  const key = typeof body?.key === "string" ? body.key : "";
  const auditScore = typeof body?.auditScore === "number" ? body.auditScore : undefined;
  const lesson = getLesson(lessonId);

  if (!isLive(lesson)) {
    return NextResponse.json({ error: "Unknown or unreleased lesson" }, { status: 400 });
  }
  const xp = xpForClaim(lesson.content, key, auditScore);
  if (xp === null) {
    return NextResponse.json({ error: "key is not an XP step of this lesson" }, { status: 400 });
  }

  if (!lesson.isFree) {
    const access = user.email ? await checkSubscription(user.email) : null;
    if (!access?.active) {
      return NextResponse.json({ error: "This lesson needs full access" }, { status: 403 });
    }
  }

  const result = await recordXP(user.id, lesson.id, key, xp);
  return NextResponse.json(result);
}

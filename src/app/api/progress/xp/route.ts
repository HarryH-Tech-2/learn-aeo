import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { recordXP } from "@/lib/progress";
import { lessonMeta } from "@/lib/lesson-catalog";

/** Largest XP award a single call may carry. */
const MAX_XP = 200;

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string } | undefined;
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await request.json().catch(() => null)) as { lessonId?: unknown; xp?: unknown } | null;
  const lessonId = typeof body?.lessonId === "string" ? body.lessonId : "";
  const xp = body?.xp;
  if (!lessonMeta(lessonId) || typeof xp !== "number" || !Number.isInteger(xp) || xp < 1 || xp > MAX_XP) {
    return NextResponse.json(
      { error: `lessonId must be a course lesson and xp a whole number from 1 to ${MAX_XP}` },
      { status: 400 }
    );
  }
  const result = await recordXP(user.id, lessonId, xp);
  return NextResponse.json(result);
}

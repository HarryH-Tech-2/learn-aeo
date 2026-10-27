import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkSubscription } from "@/lib/subscription";
import { getLesson, isLive, type LiveLesson } from "@/lib/lessons";
import type { LessonMeta } from "@/lib/lesson-types";
import { devBypassAuth } from "@/lib/dev-bypass";

/** The catalog entry alone: what a locked or coming-soon lesson shows, never its content. */
function metaOf(lesson: LessonMeta & { content?: unknown }): LessonMeta {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { content, ...meta } = lesson;
  return meta;
}

/**
 * GET /api/lessons/[id]
 *   unknown id                         → 404 { error }
 *   coming soon                        → LessonMeta (status "coming-soon", no content)
 *   live, free / dev bypass / access   → LiveLesson (+ preview: true under dev bypass only)
 *   live, paid, no session or access   → LessonMeta & { locked: true }, no content key
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lesson = getLesson(id);

  if (!lesson) {
    return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
  }

  if (!isLive(lesson)) {
    return NextResponse.json(metaOf(lesson));
  }

  // Local preview: everything opens without a session (never in production).
  if (devBypassAuth()) {
    return NextResponse.json({ ...lesson, preview: true } satisfies LiveLesson & { preview: true });
  }

  if (lesson.isFree) {
    return NextResponse.json(lesson);
  }

  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email || !(await checkSubscription(email)).active) {
    return NextResponse.json({ ...metaOf(lesson), locked: true });
  }

  return NextResponse.json(lesson);
}

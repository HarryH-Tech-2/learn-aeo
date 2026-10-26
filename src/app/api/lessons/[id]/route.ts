import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkSubscription } from "@/lib/subscription";
import { lessons, getLessonGlyphs, type Lesson, type Hieroglyph } from "@/lib/lessons";
import { devBypassAuth } from "@/lib/dev-bypass";

const REVIEW_COUNT = 6;

/**
 * "Field Notes" — a handful of signs from *earlier* lessons to re-test at the
 * start of this one (spaced review). Random per request; none for lesson 1.
 */
function reviewGlyphs(lesson: Lesson): Hieroglyph[] {
  const earlier = lessons
    .filter((l) => l.order < lesson.order)
    .flatMap((l) => getLessonGlyphs(l));
  // de-duplicate by symbol (the owl turns up in several lessons)
  const seen = new Set<string>();
  const pool = earlier.filter((g) => (seen.has(g.symbol) ? false : (seen.add(g.symbol), true)));
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, REVIEW_COUNT);
}

function unlockedPayload(lesson: Lesson) {
  return {
    ...lesson,
    hieroglyphs: getLessonGlyphs(lesson),
    review: reviewGlyphs(lesson),
  };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const lesson = lessons.find((l) => l.id === id);

  if (!lesson) {
    return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
  }

  // Free lessons are always fully accessible (and everything is, in local preview mode)
  if (lesson.isFree || devBypassAuth()) {
    // preview: local-only switch so the lesson flow can be walked without a session.
    return NextResponse.json({ ...unlockedPayload(lesson), preview: devBypassAuth() });
  }

  // Paid lesson — check auth and subscription
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    const { glyphGroups, ...metadata } = lesson;
    return NextResponse.json({ ...metadata, locked: true });
  }

  const sub = await checkSubscription(session.user.email);

  if (!sub.active) {
    const { glyphGroups, ...metadata } = lesson;
    return NextResponse.json({ ...metadata, locked: true });
  }

  return NextResponse.json(unlockedPayload(lesson));
}

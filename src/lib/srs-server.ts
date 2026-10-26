import { prisma } from "@/lib/db";
import { review, syncSigns, type Quality, type SignState } from "@/lib/srs";
import { glyphsForLearner } from "@/lib/wall";

/**
 * Server side of Fading Paint: SignReview rows ↔ SignState objects. The
 * learner's wall is seeded (and topped up after each completed lesson) on
 * every read, so the dashboard count is right even before the game is
 * first opened.
 */

type Row = { glyph: string; ease: number; interval: number; reps: number; lapses: number; lastReview: Date; due: Date };

function toState(r: Row): SignState {
  return { glyph: r.glyph, ease: r.ease, interval: r.interval, reps: r.reps, lapses: r.lapses, lastReview: r.lastReview.getTime(), due: r.due.getTime() };
}

export async function loadWall(userId: string, paid: boolean, now = Date.now()): Promise<SignState[]> {
  const [rows, progress] = await Promise.all([
    prisma.signReview.findMany({ where: { userId } }),
    prisma.lessonProgress.findMany({ where: { userId, completed: true }, select: { lessonId: true } }),
  ]);
  const states = rows.map(toState);
  const wanted = glyphsForLearner(progress.map((p) => p.lessonId), paid);
  const synced = syncSigns(states, wanted, now);
  const added = synced.slice(states.length);
  if (added.length > 0) {
    await prisma.signReview.createMany({
      data: added.map((s) => ({ userId, glyph: s.glyph, ease: s.ease, interval: s.interval, reps: s.reps, lapses: s.lapses, lastReview: new Date(s.lastReview), due: new Date(s.due) })),
      skipDuplicates: true,
    });
  }
  return synced;
}

export async function dueCount(userId: string, paid: boolean, now = Date.now()): Promise<number> {
  const wall = await loadWall(userId, paid, now);
  return wall.filter((s) => s.due <= now).length;
}

export async function recordReview(userId: string, glyph: string, quality: Quality, now = Date.now()): Promise<SignState | null> {
  const row = await prisma.signReview.findUnique({ where: { userId_glyph: { userId, glyph } } });
  if (!row) return null;
  const next = review(toState(row), quality, now);
  await prisma.signReview.update({
    where: { userId_glyph: { userId, glyph } },
    data: { ease: next.ease, interval: next.interval, reps: next.reps, lapses: next.lapses, lastReview: new Date(next.lastReview), due: new Date(next.due) },
  });
  return next;
}

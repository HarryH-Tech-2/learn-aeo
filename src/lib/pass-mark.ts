// The lesson pass mark, kept free of server imports so client components
// (the lesson player) can use it. src/lib/progress.ts re-exports it.

export function isLessonComplete(score: number, totalQuestions: number): boolean {
  return score >= Math.ceil(totalQuestions * 0.6);
}

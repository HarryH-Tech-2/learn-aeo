import { fetchJson } from "@/lib/fetch-json";

/**
 * Saves a finished audit, then checks badges. The badge check runs only after
 * /api/progress/complete has resolved, so the streak, completed-lesson and
 * best-score rows it reads already include this audit. Failures are logged:
 * a refused save skips the badge check.
 */
export async function submitAuditResult<T = unknown>(
  lessonId: string,
  score: number,
  total: number,
  onSaved?: (data: T) => void
): Promise<void> {
  const json = { "Content-Type": "application/json" };
  let saved: T;
  try {
    saved = await fetchJson<T>("/api/progress/complete", {
      method: "POST",
      headers: json,
      body: JSON.stringify({ lessonId, score, totalQuestions: total }),
    });
  } catch (err) {
    console.error("Audit result not saved", { lessonId, score, total, err });
    return;
  }
  onSaved?.(saved);
  try {
    await fetchJson("/api/badges/check", {
      method: "POST",
      headers: json,
      body: JSON.stringify({ lessonId, score, total }),
    });
  } catch (err) {
    console.error("Badge check failed", { lessonId, score, total, err });
  }
}

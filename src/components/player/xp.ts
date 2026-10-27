// XP bookkeeping for one sitting of the lesson player. Pure, so it can be tested.
// The server pays each claim key once (src/lib/xp-claims.ts, /api/progress/xp); this
// in-sitting record only stops the player re-sending or re-counting a key.

import { exerciseCleanKey, exerciseKey } from "@/lib/xp-claims";

/**
 * Claim an XP key. The first claim of a key pays `xp` (0 when the answer was
 * wrong) and records the key whatever it paid; any later claim pays 0. So a
 * wrong first try cannot be turned into a paid "first try" by leaving the
 * step and coming back.
 */
export function claimXp(claimed: Set<string>, key: string, xp: number): number {
  if (claimed.has(key)) return 0;
  claimed.add(key);
  return Math.max(0, xp);
}

export const cleanKey = exerciseCleanKey;

/**
 * Claim one exercise answer. A wrong first answer also claims the exercise's
 * clean-run key at 0, so the clean bonus is lost for the sitting even if the
 * step is left and redone. Returns the XP paid for this answer.
 */
export function claimExerciseAnswer(
  claimed: Set<string>,
  exerciseId: string,
  questionId: string,
  right: boolean,
  xp: number,
): number {
  if (!right) claimXp(claimed, cleanKey(exerciseId), 0);
  return claimXp(claimed, exerciseKey(exerciseId, questionId), right ? xp : 0);
}

/** What an audit run adds over the sitting's best audit value: retakes pay only an improvement. */
export function auditGain(best: number, value: number): number {
  return Math.max(0, value - best);
}

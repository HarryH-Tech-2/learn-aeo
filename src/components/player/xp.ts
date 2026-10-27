// XP bookkeeping for one sitting of the lesson player. Pure, so it can be tested.

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

import { describe, it, expect } from "vitest";
import { staleBadgeNames } from "@/lib/badge-seed";
import { BADGE_DEFINITIONS } from "@/lib/gamification";

describe("staleBadgeNames", () => {
  it("returns rows that are no longer defined", () => {
    expect(staleBadgeNames(["Base Camp Secured", "Dockmaster"], BADGE_DEFINITIONS)).toEqual(["Base Camp Secured"]);
  });

  it("leaves only the new definitions after re-seeding an old database", () => {
    const old = [
      "Base Camp Secured",
      "Old District Cleared",
      "Perfect Report",
      "Sharp Memory",
      "Old 3-Day Streak",
      "All 61 Old Lessons Mastered",
    ];
    const existing = [...old, ...BADGE_DEFINITIONS.map((b) => b.name)];
    const stale = staleBadgeNames(existing, BADGE_DEFINITIONS);
    expect(stale).toEqual(old);
    expect(existing.filter((n) => !stale.includes(n))).toEqual(BADGE_DEFINITIONS.map((b) => b.name));
  });

  it("returns nothing when every row is current", () => {
    expect(staleBadgeNames([], BADGE_DEFINITIONS)).toEqual([]);
    expect(staleBadgeNames(["Dockmaster"], BADGE_DEFINITIONS)).toEqual([]);
  });
});

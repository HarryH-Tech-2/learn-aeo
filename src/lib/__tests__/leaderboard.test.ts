import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/db", () => ({ prisma: {} }));

import { toDisplayName, assignRanks } from "@/lib/leaderboard";

describe("toDisplayName", () => {
  it("abbreviates to first name + last initial", () => {
    expect(toDisplayName("Harry Harrison")).toBe("Harry H.");
    expect(toDisplayName("Ada King Lovelace")).toBe("Ada L.");
  });
  it("keeps a single name as-is", () => {
    expect(toDisplayName("Cleopatra")).toBe("Cleopatra");
  });
  it("falls back to Scholar for empty/null", () => {
    expect(toDisplayName(null)).toBe("Scholar");
    expect(toDisplayName("   ")).toBe("Scholar");
  });
});

describe("assignRanks", () => {
  it("uses competition ranking for ties (1, 2, 2, 4)", () => {
    const ranked = assignRanks([{ xp: 500 }, { xp: 300 }, { xp: 300 }, { xp: 100 }]);
    expect(ranked.map((r) => r.rank)).toEqual([1, 2, 2, 4]);
  });
  it("handles an empty list", () => {
    expect(assignRanks([])).toEqual([]);
  });
});

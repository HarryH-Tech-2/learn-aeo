import { describe, it, expect } from "vitest";
import {
  calculateLevel,
  getLevelTitle,
  XP_REWARDS,
  LEVEL_THRESHOLDS,
  BADGE_DEFINITIONS,
} from "@/lib/gamification";
import { LESSON_CATALOG } from "@/lib/lesson-catalog";

describe("calculateLevel", () => {
  it("returns level 1 for 0 XP", () => {
    expect(calculateLevel(0)).toBe(1);
  });

  it("returns level 2 for 200 XP", () => {
    expect(calculateLevel(200)).toBe(2);
  });

  it("returns level 3 for 500 XP", () => {
    expect(calculateLevel(500)).toBe(3);
  });

  it("returns level 4 for 1000 XP", () => {
    expect(calculateLevel(1000)).toBe(4);
  });

  it("returns level 7 for 5000+ XP", () => {
    expect(calculateLevel(9999)).toBe(7);
  });

  it("returns level 2 for 499 XP (just under level 3)", () => {
    expect(calculateLevel(499)).toBe(2);
  });
});

describe("level titles", () => {
  it("has the City of Answers thresholds and titles, exactly", () => {
    expect(LEVEL_THRESHOLDS.map((t) => [t.level, t.xp, t.title])).toEqual([
      [1, 0, "Query Rookie"],
      [2, 200, "Crawl Wrangler"],
      [3, 500, "Snippet Smith"],
      [4, 1000, "Entity Architect"],
      [5, 2000, "Citation Hunter"],
      [6, 3500, "Answer Strategist"],
      [7, 5000, "Answer Engine Authority"],
    ]);
  });

  it("titles 0 XP Query Rookie and 5000 XP Answer Engine Authority", () => {
    expect(getLevelTitle(calculateLevel(0))).toBe("Query Rookie");
    expect(getLevelTitle(calculateLevel(5000))).toBe("Answer Engine Authority");
  });

  it("falls back to Query Rookie for an unknown level", () => {
    expect(getLevelTitle(0)).toBe("Query Rookie");
    expect(getLevelTitle(99)).toBe("Query Rookie");
  });
});

describe("BADGE_DEFINITIONS", () => {
  it("is the City of Answers badge list, exactly", () => {
    expect(BADGE_DEFINITIONS.map((b) => [b.name, b.criteria, b.description])).toEqual([
      ["Through the Gate", "complete:how-answer-engines-choose-sources", "Completed The Gate"],
      ["Dockmaster", "complete:make-your-site-reachable-by-ai", "Completed The Crawl Docks"],
      ["Quotable", "complete:writing-citable-content", "Completed The Answer Quarter"],
      ["Schema Smith", "complete:structured-data-and-entities", "Completed The Schema Works"],
      ["Voice of the Agora", "complete:authority-beyond-your-site", "Completed The Agora"],
      ["Ambassador", "complete:platform-playbooks", "Completed The Embassies"],
      ["Stargazer", "complete:measuring-ai-visibility", "Completed The Observatory"],
      ["Keeper of the Citadel", "complete:running-an-aeo-programme", "Completed The Citadel"],
      ["Perfect Audit", "perfect-audit", "Scored 100% on a lesson audit"],
      ["3-Day Streak", "streak:3", "Kept a 3-day streak"],
      ["7-Day Streak", "streak:7", "Kept a 7-day streak"],
      ["30-Day Streak", "streak:30", "Kept a 30-day streak"],
      ["First Steps", "milestone:first-lesson", "Started your first lesson"],
      ["Halfway Across the City", "milestone:half-city", "Completed 4 districts"],
      ["The Whole City", "milestone:all-districts", "Completed all 8 districts"],
    ]);
  });

  it("names a catalog lesson in every complete: criterion, one badge per lesson", () => {
    const ids = BADGE_DEFINITIONS.filter((b) => b.criteria.startsWith("complete:")).map((b) =>
      b.criteria.slice("complete:".length)
    );
    expect(ids).toEqual(LESSON_CATALOG.map((l) => l.id));
  });

  it("gives every badge a distinct icon under /badges/ named after its criteria", () => {
    const icons = BADGE_DEFINITIONS.map((b) => b.icon);
    expect(new Set(icons).size).toBe(icons.length);
    for (const b of BADGE_DEFINITIONS) expect(b.icon).toMatch(/^\/badges\/[a-z0-9-]+\.webp$/);
  });
});

describe("XP_REWARDS", () => {
  it("has expected reward values", () => {
    expect(XP_REWARDS).toEqual({
      conceptRead: 5,
      checkCorrect: 10,
      exerciseCorrect: 20,
      exerciseClean: 50,
      auditCorrect: 25,
      perfectAudit: 100,
    });
  });
});

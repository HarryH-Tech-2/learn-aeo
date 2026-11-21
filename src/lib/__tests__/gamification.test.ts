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
  it("has the level thresholds and titles, exactly", () => {
    expect(LEVEL_THRESHOLDS.map((t) => [t.level, t.xp, t.title])).toEqual([
      [1, 0, "Beginner"],
      [2, 200, "Learner"],
      [3, 500, "Practitioner"],
      [4, 1000, "Proficient"],
      [5, 2000, "Advanced"],
      [6, 3500, "Strategist"],
      [7, 5000, "Expert"],
    ]);
  });

  it("titles 0 XP Beginner and 5000 XP Expert", () => {
    expect(getLevelTitle(calculateLevel(0))).toBe("Beginner");
    expect(getLevelTitle(calculateLevel(5000))).toBe("Expert");
  });

  it("falls back to Beginner for an unknown level", () => {
    expect(getLevelTitle(0)).toBe("Beginner");
    expect(getLevelTitle(99)).toBe("Beginner");
  });
});

describe("BADGE_DEFINITIONS", () => {
  it("is the badge list, exactly", () => {
    expect(BADGE_DEFINITIONS.map((b) => [b.name, b.criteria, b.description])).toEqual([
      ["Lesson 1 complete", "complete:how-answer-engines-choose-sources", "Completed How answer engines choose sources"],
      ["Lesson 2 complete", "complete:make-your-site-reachable-by-ai", "Completed Make your site reachable by AI"],
      ["Lesson 3 complete", "complete:writing-citable-content", "Completed Writing citable content"],
      ["Lesson 4 complete", "complete:structured-data-and-entities", "Completed Structured data and entities"],
      ["Lesson 5 complete", "complete:authority-beyond-your-site", "Completed Authority beyond your site"],
      ["Lesson 6 complete", "complete:platform-playbooks", "Completed Platform playbooks"],
      ["Lesson 7 complete", "complete:measuring-ai-visibility", "Completed Measuring AI visibility"],
      ["Lesson 8 complete", "complete:running-an-aeo-program", "Completed Running an AEO program"],
      ["Lesson 9 complete", "complete:products-and-shopping-in-ai-answers", "Completed Products and shopping in AI answers"],
      ["Lesson 10 complete", "complete:local-businesses-and-reviews", "Completed Local businesses and reviews in AI answers"],
      ["Lesson 11 complete", "complete:video-images-and-youtube", "Completed Video, images and YouTube in AI answers"],
      ["Lesson 12 complete", "complete:when-ai-gets-your-brand-wrong", "Completed When AI gets your brand wrong"],
      ["Perfect Audit", "perfect-audit", "Scored 100% on a lesson audit"],
      ["3-Day Streak", "streak:3", "Kept a 3-day streak"],
      ["7-Day Streak", "streak:7", "Kept a 7-day streak"],
      ["30-Day Streak", "streak:30", "Kept a 30-day streak"],
      ["First Lesson", "milestone:first-lesson", "Started your first lesson"],
      ["Halfway", "milestone:halfway", "Completed 6 lessons"],
      ["Course Complete", "milestone:all-lessons", "Completed all 12 lessons"],
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

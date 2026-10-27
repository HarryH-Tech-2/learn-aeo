export const XP_REWARDS = {
  // The AEO lesson player (src/components/player)
  /** Moving on from a concept card */
  conceptRead: 5,
  /** A quick check right on the first try */
  checkCorrect: 10,
  /** A signature-exercise step right on the first try */
  exerciseCorrect: 20,
  /** Every exercise step right on the first try */
  exerciseClean: 50,
  /** Each correct audit answer */
  auditCorrect: 25,
  /** Every audit answer correct */
  perfectAudit: 100,
} as const;

/** How many questions a lesson's final audit may have (enforced by the lesson content test). */
export const AUDIT_LENGTH = { min: 8, max: 12 } as const;

/**
 * Largest XP a single award can carry: a perfect audit of the longest allowed length.
 * Every other award (concept, check, exercise step or clean exercise) is smaller.
 */
export const MAX_XP_AWARD = AUDIT_LENGTH.max * XP_REWARDS.auditCorrect + XP_REWARDS.perfectAudit;

export const LEVEL_THRESHOLDS = [
  { level: 1, xp: 0, title: "Query Rookie" },
  { level: 2, xp: 200, title: "Crawl Wrangler" },
  { level: 3, xp: 500, title: "Snippet Smith" },
  { level: 4, xp: 1000, title: "Entity Architect" },
  { level: 5, xp: 2000, title: "Citation Hunter" },
  { level: 6, xp: 3500, title: "Answer Strategist" },
  { level: 7, xp: 5000, title: "Answer Engine Authority" },
] as const;

export function calculateLevel(xp: number): number {
  let level = 1;
  for (const threshold of LEVEL_THRESHOLDS) {
    if (xp >= threshold.xp) {
      level = threshold.level;
    }
  }
  return level;
}

export function getLevelTitle(level: number): string {
  const found = LEVEL_THRESHOLDS.find((t) => t.level === level);
  return found?.title ?? "Query Rookie";
}

export function getXPForNextLevel(xp: number): {
  currentLevel: number;
  nextLevelXP: number | null;
  currentLevelXP: number;
  progress: number;
} {
  const currentLevel = calculateLevel(xp);
  const currentThreshold = LEVEL_THRESHOLDS.find(
    (t) => t.level === currentLevel
  )!;
  const nextThreshold = LEVEL_THRESHOLDS.find(
    (t) => t.level === currentLevel + 1
  );

  if (!nextThreshold) {
    return {
      currentLevel,
      nextLevelXP: null,
      currentLevelXP: currentThreshold.xp,
      progress: 1,
    };
  }

  const range = nextThreshold.xp - currentThreshold.xp;
  const earned = xp - currentThreshold.xp;

  return {
    currentLevel,
    nextLevelXP: nextThreshold.xp,
    currentLevelXP: currentThreshold.xp,
    progress: earned / range,
  };
}

// One badge per district (lesson), plus audit, streak and milestone badges.
// Icons are drawn by scripts/dev/build-badges.mjs and named after the criteria.
export const BADGE_DEFINITIONS = [
  { name: "Through the Gate", criteria: "complete:how-answer-engines-choose-sources", description: "Completed The Gate", icon: "/badges/district-the-gate.webp" },
  { name: "Dockmaster", criteria: "complete:make-your-site-reachable-by-ai", description: "Completed The Crawl Docks", icon: "/badges/district-the-crawl-docks.webp" },
  { name: "Quotable", criteria: "complete:writing-citable-content", description: "Completed The Answer Quarter", icon: "/badges/district-the-answer-quarter.webp" },
  { name: "Schema Smith", criteria: "complete:structured-data-and-entities", description: "Completed The Schema Works", icon: "/badges/district-the-schema-works.webp" },
  { name: "Voice of the Agora", criteria: "complete:authority-beyond-your-site", description: "Completed The Agora", icon: "/badges/district-the-agora.webp" },
  { name: "Ambassador", criteria: "complete:platform-playbooks", description: "Completed The Embassies", icon: "/badges/district-the-embassies.webp" },
  { name: "Stargazer", criteria: "complete:measuring-ai-visibility", description: "Completed The Observatory", icon: "/badges/district-the-observatory.webp" },
  { name: "Keeper of the Citadel", criteria: "complete:running-an-aeo-programme", description: "Completed The Citadel", icon: "/badges/district-the-citadel.webp" },
  { name: "Perfect Audit", criteria: "perfect-audit", description: "Scored 100% on a lesson audit", icon: "/badges/perfect-audit.webp" },
  { name: "3-Day Streak", criteria: "streak:3", description: "Kept a 3-day streak", icon: "/badges/streak-3-days.webp" },
  { name: "7-Day Streak", criteria: "streak:7", description: "Kept a 7-day streak", icon: "/badges/streak-7-days.webp" },
  { name: "30-Day Streak", criteria: "streak:30", description: "Kept a 30-day streak", icon: "/badges/streak-30-days.webp" },
  { name: "First Steps", criteria: "milestone:first-lesson", description: "Started your first lesson", icon: "/badges/milestone-first-lesson.webp" },
  { name: "Halfway Across the City", criteria: "milestone:half-city", description: "Completed 4 districts", icon: "/badges/milestone-half-city.webp" },
  { name: "The Whole City", criteria: "milestone:all-districts", description: "Completed all 8 districts", icon: "/badges/milestone-all-districts.webp" },
] as const;

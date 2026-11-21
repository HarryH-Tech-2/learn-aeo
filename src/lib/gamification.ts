import { LESSON_CATALOG } from "./lesson-catalog";

/** Lessons to complete for the "Halfway" badge: half the catalog, rounded up. */
export const HALFWAY = Math.ceil(LESSON_CATALOG.length / 2);

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

export const LEVEL_THRESHOLDS = [
  { level: 1, xp: 0, title: "Beginner" },
  { level: 2, xp: 200, title: "Learner" },
  { level: 3, xp: 500, title: "Practitioner" },
  { level: 4, xp: 1000, title: "Proficient" },
  { level: 5, xp: 2000, title: "Advanced" },
  { level: 6, xp: 3500, title: "Strategist" },
  { level: 7, xp: 5000, title: "Expert" },
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
  return found?.title ?? "Beginner";
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

// One badge per lesson, plus audit, streak and milestone badges.
// Icons are drawn by scripts/dev/build-badges.mjs: lesson-<order>.webp for a lesson, otherwise named after the criteria.
export const BADGE_DEFINITIONS = [
  ...LESSON_CATALOG.map((l) => ({
    name: `Lesson ${l.order} complete`,
    criteria: `complete:${l.id}`,
    description: `Completed ${l.title}`,
    icon: `/badges/lesson-${l.order}.webp`,
  })),
  { name: "Perfect Audit", criteria: "perfect-audit", description: "Scored 100% on a lesson audit", icon: "/badges/perfect-audit.webp" },
  { name: "3-Day Streak", criteria: "streak:3", description: "Kept a 3-day streak", icon: "/badges/streak-3-days.webp" },
  { name: "7-Day Streak", criteria: "streak:7", description: "Kept a 7-day streak", icon: "/badges/streak-7-days.webp" },
  { name: "30-Day Streak", criteria: "streak:30", description: "Kept a 30-day streak", icon: "/badges/streak-30-days.webp" },
  { name: "First Lesson", criteria: "milestone:first-lesson", description: "Started your first lesson", icon: "/badges/milestone-first-lesson.webp" },
  { name: "Halfway", criteria: "milestone:halfway", description: `Completed ${HALFWAY} lessons`, icon: "/badges/milestone-halfway.webp" },
  { name: "Course Complete", criteria: "milestone:all-lessons", description: `Completed all ${LESSON_CATALOG.length} lessons`, icon: "/badges/milestone-all-lessons.webp" },
] as const satisfies readonly { name: string; criteria: string; description: string; icon: string }[];

/** Criteria keys from before the badges were renamed: the seed uses these to rename existing rows in place. */
export const LEGACY_BADGE_CRITERIA: Readonly<Record<string, string>> = {
  "milestone:half-city": "milestone:halfway",
  "milestone:all-districts": "milestone:all-lessons",
};

/** Every criteria key a badge row may be stored under: the current one, plus any legacy key that maps to it. */
export function badgeCriteriaKeys(criteria: string): string[] {
  return [criteria, ...Object.keys(LEGACY_BADGE_CRITERIA).filter((old) => LEGACY_BADGE_CRITERIA[old] === criteria)];
}

/**
 * What to show for a stored badge row: the current definition for its criteria, so a row seeded under an older
 * name still reads right before the seed is rerun. Falls back to the row itself for an unknown criteria.
 */
export function badgeDisplay(row: { name: string; description: string; icon: string; criteria: string }): {
  name: string;
  description: string;
  icon: string;
} {
  const criteria = LEGACY_BADGE_CRITERIA[row.criteria] ?? row.criteria;
  const def = BADGE_DEFINITIONS.find((d) => d.criteria === criteria);
  return def
    ? { name: def.name, description: def.description, icon: def.icon }
    : { name: row.name, description: row.description, icon: row.icon };
}

export const XP_REWARDS = {
  glyphStudy: 10,
  miniExerciseCorrect: 15,
  matchingPairFound: 20,
  siteReportCorrect: 25,
  perfectReport: 100,
  firstTryBonus: 10,
  /** Field Notes review at the start of lessons 2–8 */
  reviewCorrect: 10,
  /** Each correct answer inside a lesson's signature mechanic */
  mechanicCorrect: 20,
  /** Finishing the mechanic with no mistakes */
  mechanicPerfect: 50,
  /** Reading the lesson's real inscription */
  readingComplete: 40,
} as const;

export const LEVEL_THRESHOLDS = [
  { level: 1, xp: 0, title: "Volunteer Digger" },
  { level: 2, xp: 200, title: "Field Assistant" },
  { level: 3, xp: 500, title: "Junior Archaeologist" },
  { level: 4, xp: 1000, title: "Lead Excavator" },
  { level: 5, xp: 2000, title: "Site Director" },
  { level: 6, xp: 3500, title: "Chief Archaeologist" },
  { level: 7, xp: 5000, title: "Master Egyptologist" },
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
  return found?.title ?? "Volunteer Digger";
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

export const BADGE_DEFINITIONS = [
  { name: "Base Camp Secured", criteria: "complete:expedition-begins", description: "Completed The Expedition Begins", icon: "/badges/base-camp.webp" },
  { name: "Courtyard Cleared", criteria: "complete:outer-courtyard", description: "Completed The Outer Courtyard", icon: "/badges/courtyard.webp" },
  { name: "Gallery Documented", criteria: "complete:pilgrims-gallery", description: "Completed The Pilgrim's Gallery", icon: "/badges/gallery.webp" },
  { name: "Treasury Decoded", criteria: "complete:the-treasury", description: "Completed The Treasury", icon: "/badges/treasury.webp" },
  { name: "Royalty Identified", criteria: "complete:royal-hall", description: "Completed The Royal Hall", icon: "/badges/royal-hall.webp" },
  { name: "Spells Translated", criteria: "complete:sacred-chapel", description: "Completed The Sacred Chapel", icon: "/badges/chapel.webp" },
  { name: "History Pieced Together", criteria: "complete:hypostyle-hall", description: "Completed The Hypostyle Hall", icon: "/badges/hypostyle.webp" },
  { name: "Sanctum Unsealed", criteria: "complete:inner-sanctum", description: "Completed The Inner Sanctum", icon: "/badges/sanctum.webp" },
  { name: "Perfect Report", criteria: "perfect-report", description: "Scored 100% on any Site Report", icon: "/badges/perfect-report.webp" },
  { name: "Sharp Memory", criteria: "sharp-memory", description: "Cleared a matching game with no misses", icon: "/badges/sharp-memory.webp" },
  { name: "3-Day Dig", criteria: "streak:3", description: "Maintained a 3-day streak", icon: "/badges/streak-3.webp" },
  { name: "7-Day Expedition", criteria: "streak:7", description: "Maintained a 7-day streak", icon: "/badges/streak-7.webp" },
  { name: "30-Day Obsession", criteria: "streak:30", description: "Maintained a 30-day streak", icon: "/badges/streak-30.webp" },
  { name: "First Glyph", criteria: "milestone:first-glyph", description: "Studied your first hieroglyph", icon: "/badges/first-glyph.webp" },
  { name: "Half the Alphabet", criteria: "milestone:30-glyphs", description: "Studied 30+ glyphs", icon: "/badges/half-alphabet.webp" },
  { name: "All 61 Glyphs Mastered", criteria: "milestone:all-glyphs", description: "Completed all lessons", icon: "/badges/all-glyphs.webp" },
] as const;

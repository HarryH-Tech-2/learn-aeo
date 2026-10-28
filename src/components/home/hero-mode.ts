// How the City of Answers hero draws: the full flight, a single still frame, or nothing (the
// section's own gradient shows). Pure so it can be tested; CityHero reads the environment.

export type HeroMode = "animate" | "still" | "none";

export function heroMode(env: { webgl: boolean; reducedMotion: boolean; saveData: boolean }): HeroMode {
  if (!env.webgl) return "none";
  if (env.reducedMotion || env.saveData) return "still";
  return "animate";
}

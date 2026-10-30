// How the homepage hero shows: the gate video, or the open gate as a still. Pure so
// it can be tested; HeroVideo reads the environment.

export type HeroMode = "play" | "still";

export function heroMode(env: { reducedMotion: boolean; saveData: boolean }): HeroMode {
  return env.reducedMotion || env.saveData ? "still" : "play";
}

/** The search bar's question after `step` typing ticks: one character per tick, clamped to the question. */
export function typedQuestion(question: string, step: number): string {
  return question.slice(0, Math.max(0, Math.min(step, question.length)));
}


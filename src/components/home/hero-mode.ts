// How the City of Answers hero shows: the looping video, or its still poster (the first frame). Pure so
// it can be tested; HeroVideo reads the environment.

export type HeroMode = "play" | "still";

export function heroMode(env: { reducedMotion: boolean; saveData: boolean }): HeroMode {
  return env.reducedMotion || env.saveData ? "still" : "play";
}

/** The search bar's question after `step` typing ticks: one character per tick, clamped to the question. */
export function typedQuestion(question: string, step: number): string {
  return question.slice(0, Math.max(0, Math.min(step, question.length)));
}

type Size = { width: number; height: number };
type Point = { x: number; y: number };

/**
 * Where a point of the video (as fractions of its frame) lands in its box, in px, when the video is drawn with
 * `object-fit: cover` and `object-position` given as fractions (0.5, 0.4 = "50% 40%").
 */
export function coverPoint(box: Size, video: Size, point: Point, position: Point): Point {
  const scale = Math.max(box.width / video.width, box.height / video.height);
  const drawnW = video.width * scale;
  const drawnH = video.height * scale;
  return {
    x: (box.width - drawnW) * position.x + point.x * drawnW,
    y: (box.height - drawnH) * position.y + point.y * drawnH,
  };
}

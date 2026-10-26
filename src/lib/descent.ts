/**
 * Scribe's Descent — level generation and scoring (pure, tested).
 *
 * A side-view shaft. Each floor asks for a sound or a word; three or four
 * stone blocks float at that depth, each carrying a sign. Only the block(s)
 * whose sign matches the prompt hold the player's weight; the rest crumble.
 * Reach the sarcophagus at the bottom.
 */
import { seededRandom, seededShuffle } from "@/lib/daily";
import { catalogue, isSilent, soundKey, type WallSign } from "@/lib/wall";

export type DescentBlock = {
  id: string;
  x: number;
  y: number;
  /** half-width of the block (world units) */
  w: number;
  glyph: string;
  /** true if this block matches the floor's prompt */
  solid: boolean;
};

export type Floor = {
  index: number;
  /** what the floor asks for, on screen */
  prompt: string;
  /** what the voice reads: the said sound, since speech reads ḥ, ḫ and ẖ all as plain h */
  spoken: string;
  /** shorter on-screen version */
  label: string;
  answer: WallSign;
  blocks: DescentBlock[];
  y: number;
};

export type Level = {
  seed: number;
  floors: Floor[];
  /** y of the sarcophagus platform */
  bottomY: number;
  startY: number;
};

export const FLOOR_GAP = 2.6; // vertical distance between floors
export const SHAFT_HALF_WIDTH = 3.6; // playable x range
export const BLOCK_HALF_WIDTH = 0.55;
export const MAX_JUMP_DX = 2.9; // reachable horizontal distance between neighbouring blocks (a jump covers ~3.5)
export const MIN_SHIFT_DX = 1.0; // the solid block is never straight below the last one
export const FLOORS = 10;
export const LIVES = 3;
export const DESCENT_LESSON_ID = "game-descent";

function promptFor(sign: WallSign, rnd: () => number): { prompt: string; spoken: string; label: string } {
  // Alternate between the sound and the picture so both readings get drilled.
  // silent signs (determinatives, plural and dual markers) have no sound, so they are always asked by picture
  if (!isSilent(sign) && rnd() < 0.55) return { prompt: `The sound ${sign.translit}`, spoken: `The sound “${sign.pronunciation}”`, label: sign.translit };
  const prompt = `The ${sign.name.toLowerCase()}`;
  return { prompt, spoken: prompt, label: sign.name };
}

/**
 * Build a level from a sign pool. `seed` makes it reproducible. Each floor
 * has 3–4 blocks, exactly one solid, laid out so the solid block is always
 * within jumping distance of at least one block on the floor above.
 */
export function generateLevel(pool: WallSign[], seed: number, floors: number = FLOORS): Level {
  if (pool.length < 4) throw new Error("need at least 4 signs");
  const rnd = seededRandom(seed);
  const order = seededShuffle(pool, seed);
  const out: Floor[] = [];
  let prevXs: number[] = [0];
  for (let i = 0; i < floors; i++) {
    const answer = order[i % order.length];
    const decoyPool = pool.filter((s) => s.glyph !== answer.glyph && soundKey(s.translit) !== soundKey(answer.translit));
    const decoys = seededShuffle(decoyPool, seed * 31 + i).slice(0, 2 + (rnd() < 0.5 ? 1 : 0));
    const count = decoys.length + 1;
    const y = -FLOOR_GAP * (i + 1);
    // Evenly spaced x slots with a little jitter, shuffled so the solid block moves around.
    const spacing = (SHAFT_HALF_WIDTH * 2) / count;
    const xs = Array.from({ length: count }, (_, k) => -SHAFT_HALF_WIDTH + spacing * (k + 0.5) + (rnd() - 0.5) * 0.4);
    // The solid block must be reachable from the previous floor, but never
    // straight below it: a player who just drops should hit a decoy or air.
    const reachable = xs.filter((x) => prevXs.some((px) => Math.abs(px - x) <= MAX_JUMP_DX));
    const shifted = reachable.filter((x) => prevXs.every((px) => Math.abs(px - x) >= MIN_SHIFT_DX));
    const candidates = shifted.length ? shifted : reachable.length ? reachable : xs;
    const solidX = candidates[Math.floor(rnd() * candidates.length)];
    const others = xs.filter((x) => x !== solidX);
    const blocks: DescentBlock[] = [{ id: `f${i}-solid`, x: solidX, y, w: BLOCK_HALF_WIDTH, glyph: answer.glyph, solid: true }];
    decoys.forEach((d, k) => blocks.push({ id: `f${i}-d${k}`, x: others[k], y, w: BLOCK_HALF_WIDTH, glyph: d.glyph, solid: false }));
    blocks.sort((a, b) => a.x - b.x);
    const { prompt, spoken, label } = promptFor(answer, rnd);
    out.push({ index: i, prompt, spoken, label, answer, blocks, y });
    prevXs = [solidX];
  }
  return { seed, floors: out, bottomY: -FLOOR_GAP * (floors + 1), startY: 0.8 };
}

export function signPool(paid: boolean): WallSign[] {
  return catalogue().filter((s) => (paid ? true : s.lessonId === "expedition-begins"));
}

/** Which floor a y coordinate belongs to (the nearest floor at or above it). */
export function floorAtY(level: Level, y: number): number {
  let best = -1;
  for (const f of level.floors) if (y <= f.y + 0.8) best = f.index;
  return best;
}

export type Outcome = "hold" | "crumble";

export function landOutcome(block: DescentBlock): Outcome {
  return block.solid ? "hold" : "crumble";
}

export type RunState = {
  floorsCleared: number;
  crumbles: number;
  livesLeft: number;
  finished: boolean;
  won: boolean;
};

export const initialRun = (): RunState => ({ floorsCleared: 0, crumbles: 0, livesLeft: LIVES, finished: false, won: false });

export function afterLanding(run: RunState, block: DescentBlock, floorIndex: number): RunState {
  if (run.finished) return run;
  if (block.solid) return { ...run, floorsCleared: Math.max(run.floorsCleared, floorIndex + 1) };
  return { ...run, crumbles: run.crumbles + 1 };
}

export function afterFall(run: RunState): RunState {
  if (run.finished) return run;
  const livesLeft = run.livesLeft - 1;
  return { ...run, livesLeft, finished: livesLeft <= 0, won: false };
}

export function afterReachingBottom(run: RunState): RunState {
  return { ...run, finished: true, won: true };
}

export function xpForRun(run: RunState, floors: number = FLOORS): number {
  const base = run.floorsCleared * 8;
  const bonus = run.won ? 40 + Math.max(0, 30 - run.crumbles * 6) : 0;
  return Math.min(200, base + bonus + (run.floorsCleared === floors && run.crumbles === 0 ? 30 : 0));
}

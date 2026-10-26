import { describe, it, expect } from "vitest";
import { FLOORS, MAX_JUMP_DX, MIN_SHIFT_DX, SHAFT_HALF_WIDTH, afterFall, afterLanding, afterReachingBottom, floorAtY, generateLevel, initialRun, landOutcome, signPool, xpForRun } from "../descent";

const pool = signPool(false);

describe("level generation", () => {
  it("is reproducible and has one solid block per floor, no matching decoys", () => {
    const a = generateLevel(pool, 42);
    const b = generateLevel(pool, 42);
    expect(a).toEqual(b);
    expect(a.floors.length).toBe(FLOORS);
    for (const f of a.floors) {
      expect(f.blocks.filter((x) => x.solid).length).toBe(1);
      expect(f.blocks.length).toBeGreaterThanOrEqual(3);
      expect(f.blocks.length).toBeLessThanOrEqual(4);
      const solid = f.blocks.find((x) => x.solid)!;
      expect(solid.glyph).toBe(f.answer.glyph);
      for (const d of f.blocks.filter((x) => !x.solid)) expect(d.glyph).not.toBe(f.answer.glyph);
      for (const bl of f.blocks) expect(Math.abs(bl.x)).toBeLessThanOrEqual(SHAFT_HALF_WIDTH);
      expect(f.prompt.length).toBeGreaterThan(3);
    }
  });

  it("keeps every solid block within jumping distance of the previous one", () => {
    for (const seed of [1, 7, 99, 2026]) {
      const lvl = generateLevel(pool, seed);
      let prevX = 0;
      for (const f of lvl.floors) {
        const solid = f.blocks.find((x) => x.solid)!;
        expect(Math.abs(solid.x - prevX), `seed ${seed} floor ${f.index}`).toBeLessThanOrEqual(MAX_JUMP_DX + 0.01);
        expect(Math.abs(solid.x - prevX), `seed ${seed} floor ${f.index} straight drop`).toBeGreaterThanOrEqual(MIN_SHIFT_DX - 0.01);
        prevX = solid.x;
      }
      expect(lvl.bottomY).toBeLessThan(lvl.floors[lvl.floors.length - 1].y);
    }
  });

  it("varies the prompt between sound and picture", () => {
    const kinds = new Set(generateLevel(pool, 5, 20).floors.map((f) => (f.prompt.startsWith("The sound") ? "sound" : "picture")));
    expect(kinds.size).toBe(2);
  });

  it("maps y to floors", () => {
    const lvl = generateLevel(pool, 3);
    expect(floorAtY(lvl, 0.5)).toBe(-1);
    expect(floorAtY(lvl, lvl.floors[0].y)).toBe(0);
    expect(floorAtY(lvl, lvl.floors[4].y - 0.2)).toBe(4);
  });
});

describe("run state", () => {
  it("scores landings, falls and the finish", () => {
    const lvl = generateLevel(pool, 8);
    let run = initialRun();
    const solid = lvl.floors[0].blocks.find((b) => b.solid)!;
    const decoy = lvl.floors[0].blocks.find((b) => !b.solid)!;
    expect(landOutcome(solid)).toBe("hold");
    expect(landOutcome(decoy)).toBe("crumble");
    run = afterLanding(run, decoy, 0);
    expect(run.crumbles).toBe(1);
    run = afterLanding(run, solid, 0);
    expect(run.floorsCleared).toBe(1);
    run = afterFall(run);
    expect(run.livesLeft).toBe(2);
    expect(run.finished).toBe(false);
    run = afterFall(afterFall(run));
    expect(run.finished).toBe(true);
    expect(run.won).toBe(false);
    const won = afterReachingBottom({ ...initialRun(), floorsCleared: FLOORS });
    expect(won.won).toBe(true);
    expect(xpForRun(won)).toBe(FLOORS * 8 + 70 + 30);
    expect(xpForRun({ ...initialRun(), floorsCleared: 3, finished: true })).toBe(24);
  });
});

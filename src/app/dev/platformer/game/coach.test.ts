import { describe, expect, it } from "vitest";
import { coachLine, stepOf } from "./coach";
import { game, type GameState } from "./store";
import { eventsBetween } from "./telemetry";

/** A level 1 run for "Ana", under way. */
function run(): GameState {
  game.campaign({ name: "Ana" });
  game.begin(0);
  return { ...game.get(), status: "playing" };
}

describe("the first steps on the causeway", () => {
  it("walks the learner from the start to the beam to the tablets", () => {
    const s = run();
    const first = s.lesson!.stations[0];
    expect(first.teach).toBe(true);
    expect(stepOf(s)).toBe("move");
    expect(coachLine(s, false)).toMatch(/W or ↑/);
    expect(coachLine(s, true)).toMatch(/stick/);
    const moved = { ...s, moved: true };
    expect(stepOf(moved)).toBe("beam");
    expect(coachLine(moved, false)).toMatch(/beam of light/);
    // a short name's first tablets stand across the water: the line says to jump
    expect(first.site).not.toBe(0);
    expect(coachLine(s, false)).toMatch(/Space to jump/);
    const plaza = { ...s, lesson: { ...s.lesson!, stations: s.lesson!.stations.map((st, i) => (i === 0 ? { ...st, site: 0 } : st)) } };
    expect(coachLine(plaza, false)).toMatch(/walk forward/);
    const met = { ...moved, lesson: { ...moved.lesson!, taught: [first.target] } };
    expect(stepOf(met)).toBe("tablet");
    expect(coachLine(met, false)).toContain(`“${first.sound}”`);
  });

  it("goes quiet once the first station is answered, and on later levels", () => {
    const s = { ...run(), moved: true };
    expect(coachLine({ ...s, lesson: { ...s.lesson!, progress: 1 } }, false)).toBeNull();
    expect(coachLine({ ...s, playing: 1 }, false)).toBeNull();
  });

  it("says on a quit which step the player had reached", () => {
    const s = run();
    const quit = (st: GameState) => eventsBetween(st, { ...st, status: "title" }, 0)[0].params;
    expect(quit(s)).toMatchObject({ step: "move", how: "title", falls: 0 });
    expect(quit({ ...s, moved: true }).step).toBe("beam");
    const l = s.lesson!;
    expect(quit({ ...s, moved: true, lesson: { ...l, progress: l.stations.length } }).step).toBe("gate");
  });
});

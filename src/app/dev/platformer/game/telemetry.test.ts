import { describe, expect, it } from "vitest";
import { eventsBetween, loadQuit } from "./telemetry";
import { game, type GameState } from "./store";

/** A level 1 run for "Ana", as the store would hold it. */
function run(): GameState {
  game.campaign({ name: "Ana" });
  game.begin(0);
  return game.get();
}

describe("game telemetry", () => {
  it("reports the start, and who is playing", () => {
    const brief = run();
    const playing = { ...brief, status: "playing" as const, mode: "lesson" as const, paid: false, guest: true };
    expect(eventsBetween(brief, playing, 0)).toEqual([{ name: "game_level_start", params: { exercise: "causeway-1", question_type: "guest", total: brief.lesson!.stations.length } }]);
    expect(eventsBetween(brief, { ...playing, guest: false }, 0)[0].params.question_type).toBe("free");
  });

  it("reports every pick at a station, right or wrong, by the station it was made at", () => {
    const s = { ...run(), status: "playing" as const };
    const l = s.lesson!;
    const wrong = { ...s, lesson: { ...l, mistakes: l.mistakes.map((m, i) => (i === 0 ? 1 : m)) } };
    const right = { ...wrong, lesson: { ...wrong.lesson, progress: 1 } };
    const of = l.stations.length;
    expect(eventsBetween(s, wrong, 0)).toEqual([{ name: "exercise_answer", params: { exercise: "causeway", question_type: `causeway-1 station 1 of ${of}`, question: l.stations[0].target, correct: 0 } }]);
    expect(eventsBetween(wrong, right, 0)[0].params).toMatchObject({ question_type: `causeway-1 station 1 of ${of}`, correct: 1 });
    // a sign met in its beam is not an answer
    expect(eventsBetween(s, { ...s, lesson: { ...l, taught: [l.stations[0].target] } }, 0)).toEqual([]);
  });

  it("says where a run was abandoned, and how long it had lasted", () => {
    const s = { ...run(), status: "playing" as const, startedAt: 1000 };
    const mid = { ...s, lesson: { ...s.lesson!, progress: 1 } };
    const [e] = eventsBetween(mid, { ...mid, status: "title", lesson: null }, 61_000);
    expect(e.name).toBe("game_quit");
    expect(e.params).toMatchObject({ exercise: "causeway-1", question_type: `station 2 of ${s.lesson!.stations.length}`, score: 1, seconds: 60, how: "title" });
    // leaving the title or the briefing is not a quit
    expect(eventsBetween({ ...s, status: "brief" }, { ...s, status: "title", lesson: null }, 0)).toEqual([]);
  });

  it("reports the finish with how clean it was", () => {
    const s = { ...run(), status: "playing" as const, startedAt: 0 };
    const l = s.lesson!;
    const won = { ...s, status: "won" as const, finishedAt: 90_000, lesson: { ...l, progress: l.stations.length, mistakes: l.mistakes.map((_, i) => (i === 0 ? 2 : 0)) } };
    const e = eventsBetween({ ...s, lesson: won.lesson }, won, 90_000).find((x) => x.name === "game_level_complete")!;
    expect(e.params).toMatchObject({ exercise: "causeway-1", score: l.stations.length - 1, total: l.stations.length, attempts: 2, seconds: 90 });
  });

  it("reports a carry to the next landing, with the falls that led to it", () => {
    const s = { ...run(), status: "playing" as const, falls: 4, stuck: 3 };
    const carried = { ...s, assists: 1, stuck: 0 };
    expect(eventsBetween(s, carried, 0)).toEqual([{ name: "game_assist", params: { exercise: "causeway-1", question_type: `station 1 of ${s.lesson!.stations.length}`, how: "carry", falls: 4 } }]);
    // a fall on its own is not a carry
    expect(eventsBetween(s, { ...s, falls: 5, stuck: 4 }, 0)).toEqual([]);
  });

  it("reports the title becoming playable, with how long since the page opened", () => {
    const loading = { ...game.get(), status: "title" as const, ready: false, lesson: null, mode: "lesson" as const, guest: true };
    expect(eventsBetween(loading, { ...loading, ready: true }, 7_400)).toEqual([{ name: "game_title_view", params: { question_type: "guest", seconds: 7 } }]);
    // leaving while it still says Loading… is a load quit; once playable, it is not
    expect(loadQuit(loading, 12_000)).toEqual({ name: "game_load_quit", params: { question_type: "guest", seconds: 12 } });
    expect(loadQuit({ ...loading, ready: true }, 12_000)).toBeNull();
  });

  it("reports the briefing card for the level chosen", () => {
    const brief = run();
    const title = { ...brief, status: "title" as const, lesson: null };
    expect(eventsBetween(title, brief, 0)).toEqual([{ name: "game_brief_view", params: { exercise: "causeway-1", question_type: "paid", total: brief.lesson!.stations.length } }]);
  });
});

import { describe, expect, it, vi } from "vitest";

// (the sounds and the particles need a browser; the teaching does not)
vi.mock("./audio", () => ({ sfx: new Proxy({}, { get: () => () => {} }) }));
vi.mock("./voice", () => ({ say: () => {}, khety: () => {} }));
vi.mock("./Particles", () => ({ burst: () => {} }));

const { game } = await import("./store");
const { teach, dismissTeach, closeTeach, answer } = await import("./answers");

function playing() {
  game.campaign({ name: "Harry" });
  game.begin(0);
  game.set({ status: "playing" });
  return game.get().lesson!.stations[0];
}

describe("meeting a sign in its beam on the causeway", () => {
  it("holds the explorer in the beam the first time, until the card is put away", () => {
    const st = playing();
    teach(st.target);
    expect(game.get()).toMatchObject({ teaching: st.target, hold: true });
    dismissTeach();
    expect(game.get()).toMatchObject({ teaching: null, hold: false });
    // met already: the card comes up again, the explorer is not held
    teach(st.target);
    expect(game.get()).toMatchObject({ teaching: st.target, hold: false });
    closeTeach(st.target);
    expect(game.get().teaching).toBeNull();
  });

  it("lets go once the station is answered, and on a new run", () => {
    const st = playing();
    teach(st.target);
    answer(0, st.target);
    expect(game.get().hold).toBe(false);
    teach(game.get().lesson!.stations[1]?.target ?? st.target);
    game.toTitle();
    expect(game.get().hold).toBe(false);
  });
});

describe("a sign already known", () => {
  it("shows its card again as a reminder, without holding the explorer or counting as new", async () => {
    const { remind } = await import("./answers");
    const st = playing();
    remind(st.target);
    expect(game.get()).toMatchObject({ teaching: st.target, hold: false });
    expect(game.get().lesson!.taught).toEqual([]);
  });
});

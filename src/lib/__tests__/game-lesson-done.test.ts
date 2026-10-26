import { beforeEach, describe, expect, it } from "vitest";
import { rememberGameLessonDone, takeGameLessonDone } from "@/lib/game-lesson-done";

function fakeStorage(): Storage {
  const m = new Map<string, string>();
  return {
    getItem: (k) => m.get(k) ?? null,
    setItem: (k, v) => void m.set(k, v),
    removeItem: (k) => void m.delete(k),
    clear: () => m.clear(),
    key: (i) => [...m.keys()][i] ?? null,
    get length() {
      return m.size;
    },
  };
}

describe("game lesson done", () => {
  beforeEach(() => {
    (globalThis as unknown as { window: { localStorage: Storage } }).window = { localStorage: fakeStorage() };
  });

  it("has nothing to report before the game is won", () => {
    expect(takeGameLessonDone("u1")).toBeNull();
  });

  it("reports a finish once, to the first account", () => {
    rememberGameLessonDone(4);
    expect(takeGameLessonDone("u1")).toBe(4);
    expect(takeGameLessonDone("u1")).toBeNull();
    // (someone else signing in on the same device did not play it)
    expect(takeGameLessonDone("u2")).toBeNull();
  });

  it("never reports without an account", () => {
    rememberGameLessonDone(4);
    expect(takeGameLessonDone("")).toBeNull();
  });
});

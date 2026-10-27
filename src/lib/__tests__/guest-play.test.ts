import { afterEach, describe, expect, it, vi } from "vitest";
import { FIRST_LESSON_PATH } from "@/lib/lesson-catalog";
import { guestPlayAllowed, guestPlayHref } from "@/lib/guest-play";

function params(search: string) {
  return new URLSearchParams(search);
}

function stubStorage(initial: Record<string, string> = {}) {
  const store = new Map(Object.entries(initial));
  vi.stubGlobal("localStorage", {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
  });
  return store;
}

afterEach(() => vi.unstubAllGlobals());

describe("guestPlayHref", () => {
  it("opens Lesson 1 in guest play", () => {
    expect(guestPlayHref()).toBe(`${FIRST_LESSON_PATH}?play=1`);
  });

  it("carries a typed name, in a form the sign-up modal's return-path check accepts", () => {
    const href = guestPlayHref("  Mary Jo ");
    expect(new URL(href, "https://x.test").searchParams.get("name")).toBe("Mary Jo");
    expect(href).toMatch(/^\/(?!\/)[\w\-./?=&%]*$/);
  });

  it("keeps the name to the length the game's box takes", () => {
    const name = new URL(guestPlayHref("x".repeat(80)), "https://x.test").searchParams.get("name");
    expect(name).toHaveLength(30);
  });
});

describe("guestPlayAllowed", () => {
  it("is off for an ordinary visit", () => {
    stubStorage();
    expect(guestPlayAllowed(params(""))).toBe(false);
    expect(guestPlayAllowed(params("mode=game"))).toBe(false);
  });

  it("is on with ?play=1, and remembered for the next visit from this browser", () => {
    const store = stubStorage();
    expect(guestPlayAllowed(params("play=1&name=Nancy"))).toBe(true);
    expect(store.get("aeo_guest_play")).toBe("1");
    expect(guestPlayAllowed(params(""))).toBe(true);
  });

  it("still works where storage is blocked", () => {
    vi.stubGlobal("localStorage", {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
    });
    expect(guestPlayAllowed(params("play=1"))).toBe(true);
    expect(guestPlayAllowed(params(""))).toBe(false);
  });
});

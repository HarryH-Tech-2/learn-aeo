import { describe, it, expect } from "vitest";
import { FIRST_LESSON_PATH } from "@/lib/lesson-catalog";
import { newUserLanding, LESSON_ONE_PATH } from "@/lib/new-user-landing";

const site = "https://www.learnaeo.com";
const origins = [site, "https://www.learnaeo.com/"];

describe("newUserLanding", () => {
  it("sends a new account with no particular destination to Lesson 1", () => {
    for (const cb of [null, "", `${site}/dashboard`, `${site}/dashboard/`, "/dashboard", `${site}/`, `${site}/login`, `${site}/get-started`]) {
      expect(newUserLanding(cb, origins), String(cb)).toBe(LESSON_ONE_PATH);
    }
  });

  it("keeps an explicit destination: checkout, games, join codes, the lesson a guest was in", () => {
    const keep = [
      "/checkout",
      "/checkout?plan=monthly",
      "/games/crawler",
      "/join?code=ABC123",
      `${FIRST_LESSON_PATH}?play=1`,
      `${FIRST_LESSON_PATH}?name=Nancy`,
      "/teachers/class?trial=1",
      "/dashboard?tab=games",
      "/gift/redeem?code=X#top",
    ];
    for (const p of keep) {
      expect(newUserLanding(`${site}${p}`, origins), p).toBe(p);
      expect(newUserLanding(p, origins), p).toBe(p);
    }
  });

  it("never redirects off the site", () => {
    for (const cb of ["https://evil.example/checkout", "//evil.example/checkout", "javascript:alert(1)"]) {
      expect(newUserLanding(cb, origins), cb).toBe(LESSON_ONE_PATH);
    }
  });

  it("accepts either of the site's own origins", () => {
    expect(newUserLanding("http://localhost:3000/checkout", ["http://localhost:3000", site])).toBe("/checkout");
    expect(newUserLanding(`${site}/checkout`, ["http://localhost:3000", site])).toBe("/checkout");
    expect(newUserLanding("/checkout", [undefined, null])).toBe(LESSON_ONE_PATH);
  });
});

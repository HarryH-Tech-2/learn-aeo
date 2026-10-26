import { describe, expect, it } from "vitest";
import { inSeason, offeredStyles, offeredTemplates, isGiftSeason, KEYBOARD_STYLES } from "../keyboard-card";
import { CARTOUCHE_PRINT_THEMES, christmasNotice } from "../cartouche-print";

const day = (m: number, d: number) => new Date(2026, m - 1, d);

describe("seasons", () => {
  it("open and close on the right days, New Year across the turn of the year", () => {
    expect(inSeason("valentine", day(2, 1))).toBe(true);
    expect(inSeason("valentine", day(2, 15))).toBe(false);
    expect(inSeason("mother", day(3, 22))).toBe(true);
    expect(inSeason("mother", day(5, 10))).toBe(true);
    expect(inSeason("father", day(6, 21))).toBe(true);
    expect(inSeason("father", day(6, 22))).toBe(false);
    expect(inSeason("halloween", day(10, 31))).toBe(true);
    expect(inSeason("christmas", day(10, 31))).toBe(false);
    expect(inSeason("christmas", day(12, 25))).toBe(true);
    expect(inSeason("christmas", day(12, 26))).toBe(false);
    expect(inSeason("newyear", day(12, 26))).toBe(true);
    expect(inSeason("newyear", day(1, 10))).toBe(true);
    expect(inSeason("newyear", day(1, 11))).toBe(false);
    expect(isGiftSeason(day(11, 1))).toBe(true);
  });

  it("offers an event's background first, and only in its window", () => {
    expect(offeredStyles(day(10, 19)).map((s) => s.id)[0]).toBe("halloween");
    expect(offeredStyles(day(10, 19)).some((s) => s.id === "christmas")).toBe(false);
    expect(offeredStyles(day(12, 1))[0].id).toBe("christmas");
    expect(offeredStyles(day(7, 1)).some((s) => s.season)).toBe(false);
    // the referral bonus and the stencils never show in the general picker
    for (const d of [day(2, 5), day(10, 5), day(12, 30)]) {
      expect(offeredStyles(d).some((s) => s.bonus || s.id.startsWith("stencil"))).toBe(false);
    }
  });

  it("offers the event's card straight after No card", () => {
    expect(offeredTemplates(day(10, 19)).map((t) => t.id).slice(0, 2)).toEqual(["none", "halloween"]);
    expect(offeredTemplates(day(12, 1)).map((t) => t.id).slice(0, 2)).toEqual(["none", "christmas"]);
    expect(offeredTemplates(day(7, 1)).some((t) => t.season)).toBe(false);
  });

  it("has a print paper for every seasonal background", () => {
    for (const s of KEYBOARD_STYLES.filter((k) => k.season)) {
      expect(CARTOUCHE_PRINT_THEMES.find((t) => t.id === s.id)?.season).toBe(s.season);
    }
  });

  it("gives every posted size the Christmas order-by date", () => {
    for (const f of ["print", "print-a3", "print-a2", "print-a1"] as const) expect(christmasNotice(f, day(12, 1))?.kind).toBe("order-by");
    expect(christmasNotice("image", day(12, 1))).toBeNull();
  });
});

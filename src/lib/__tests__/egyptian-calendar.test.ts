import { describe, expect, it } from "vitest";
import { civilDate, describeCivilDate, gregorianToJdn, parseIsoDate } from "@/lib/egyptian-calendar";

describe("Egyptian civil calendar", () => {
  it("Julian Day Numbers match known anchors", () => {
    expect(gregorianToJdn(2000, 1, 1)).toBe(2_451_545);
    expect(gregorianToJdn(1582, 10, 15)).toBe(2_299_161);
  });

  it("1 Thoth fell on 20 July 139 CE (Julian), the Sirius new year Censorinus records", () => {
    // 20 July 139 Julian = 19 July 139 proleptic Gregorian
    const c = civilDate(139, 7, 19);
    expect(c).toMatchObject({ kind: "month", monthIndex: 0, greekMonth: "Thoth", day: 1 });
  });

  it("a 365-day year later is 1 Thoth again", () => {
    // 365 days after a 1 Thoth is again 1 Thoth
    const a = civilDate(139, 7, 19);
    const b = civilDate(140, 7, 18);  // 140 is a leap year, so 365 days on is 18 July
    expect(a).toMatchObject({ day: 1, monthIndex: 0 });
    expect(b).toMatchObject({ day: 1, monthIndex: 0 });
  });

  it("walks through months and seasons, then the five extra days", () => {
    const thoth1 = civilDate(139, 7, 19);
    expect(thoth1.kind).toBe("month");
    // +30 days: 1 Phaophi
    expect(civilDate(139, 8, 18)).toMatchObject({ greekMonth: "Phaophi", day: 1, monthInSeason: 2 });
    // +120 days: 1 Tybi, first month of Peret
    expect(civilDate(139, 11, 16)).toMatchObject({ greekMonth: "Tybi", seasonIndex: 1, monthInSeason: 1, day: 1 });
    // +360 days: the first extra day, Osiris
    expect(civilDate(140, 7, 13)).toMatchObject({ kind: "epagomenal", day: 1, god: "Osiris" });
    expect(civilDate(140, 7, 17)).toMatchObject({ kind: "epagomenal", day: 5, god: "Nephthys" });
  });

  it("drifts one day every four years against a fixed modern date", () => {
    const a = civilDate(2020, 6, 1);
    const b = civilDate(2024, 6, 1);
    if (a.kind !== "month" || b.kind !== "month") throw new Error("expected months");
    const dayIndex = (c: typeof a) => c.monthIndex * 30 + c.day;
    expect((dayIndex(b) - dayIndex(a) + 365) % 365).toBe(1);
  });

  it("describes dates in words", () => {
    expect(describeCivilDate(civilDate(139, 7, 19))).toBe("Day 1 of the first month of Akhet (Thoth)");
    expect(describeCivilDate(civilDate(140, 7, 14))).toBe("The second day upon the year, the birthday of Horus");
  });

  it("parses date inputs, refusing impossible days", () => {
    expect(parseIsoDate("2026-10-20")).toEqual({ year: 2026, month: 10, day: 20 });
    expect(parseIsoDate("2025-02-29")).toBeNull();
    expect(parseIsoDate("2024-02-29")).not.toBeNull();
    expect(parseIsoDate("0000-01-01")).toBeNull();
    expect(parseIsoDate("nope")).toBeNull();
  });
});

import { describe, it, expect } from "vitest";
import { previewSeason, teacherSeason } from "@/lib/unit-pack/season";

const day = (y: number, m: number, d: number, h = 12) => new Date(y, m - 1, d, h);

describe("teacherSeason", () => {
  it("US: 1 October to 15 December, inclusive", () => {
    expect(teacherSeason(day(2026, 9, 30), "US")).toBeNull();
    expect(teacherSeason(day(2026, 10, 1, 0), "US")?.id).toBe("us-fall");
    expect(teacherSeason(day(2026, 10, 16), "us")?.headline).toBe("Teaching Ancient Egypt this term?");
    expect(teacherSeason(day(2026, 12, 15, 23), "US")?.id).toBe("us-fall");
    expect(teacherSeason(day(2026, 12, 16), "US")).toBeNull();
  });

  it("UK: 5 January to 31 March, inclusive", () => {
    expect(teacherSeason(day(2027, 1, 4), "GB")).toBeNull();
    expect(teacherSeason(day(2027, 1, 5), "GB")?.id).toBe("uk-spring");
    expect(teacherSeason(day(2027, 3, 31), "GB")?.id).toBe("uk-spring");
    expect(teacherSeason(day(2027, 4, 1), "GB")).toBeNull();
  });

  it("each country only in its own season", () => {
    expect(teacherSeason(day(2026, 10, 16), "GB")).toBeNull();
    expect(teacherSeason(day(2027, 2, 1), "US")).toBeNull();
  });

  it("nobody else, and no country means no strip", () => {
    expect(teacherSeason(day(2026, 10, 16), "FR")).toBeNull();
    expect(teacherSeason(day(2026, 10, 16), null)).toBeNull();
    expect(teacherSeason(day(2026, 10, 16), "")).toBeNull();
  });

  it("previews by id only", () => {
    expect(previewSeason("uk-spring")?.id).toBe("uk-spring");
    expect(previewSeason("x")).toBeNull();
    expect(previewSeason(null)).toBeNull();
  });
});

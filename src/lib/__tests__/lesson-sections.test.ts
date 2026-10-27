import { describe, expect, it } from "vitest";
import { firstGroupOfSection, resumableSection, sectionEndingAtGroup, sectionOfGroup, sectionPlan } from "@/lib/content/lesson-sections";
import { buildWordGroups } from "@/lib/content/uniliteral-words";
import { getLessonGlyphs, lessons } from "@/lib/legacy-lessons";

const L1 = "expedition-begins";

describe("lesson sections", () => {
  it("cuts lesson 1 into three sections and leaves the others whole", () => {
    expect(sectionPlan(L1)?.sections).toHaveLength(3);
    expect(sectionPlan(L1)?.breaksAfterGroup).toHaveLength(2);
    expect(sectionPlan("outer-courtyard")).toBeNull();
    expect(sectionEndingAtGroup("outer-courtyard", 1)).toBeNull();
  });

  it("ends sections 1 and 2 on the right quick checks", () => {
    expect([0, 1, 2, 3, 4].map((g) => sectionEndingAtGroup(L1, g))).toEqual([null, 1, null, 2, null]);
  });

  it("maps every group to a section and back", () => {
    expect([0, 1, 2, 3, 4].map((g) => sectionOfGroup(L1, g))).toEqual([1, 1, 2, 2, 3]);
    expect([1, 2, 3].map((s) => firstGroupOfSection(L1, s))).toEqual([0, 2, 4]);
  });

  it("breaks fall on groups the door lesson really has", () => {
    const lesson = lessons.find((l) => l.id === L1)!;
    const groupCount = 1 + buildWordGroups([], getLessonGlyphs(lesson)).length; // the door + the word sets
    for (const g of sectionPlan(L1)!.breaksAfterGroup) expect(g).toBeLessThan(groupCount - 1);
    expect(firstGroupOfSection(L1, 3)).toBeLessThan(groupCount);
  });

  it("keeps part 1 short (a win in about five minutes) and parts 2 and 3 about even", () => {
    const lesson = lessons.find((l) => l.id === L1)!;
    const sets = buildWordGroups([], getLessonGlyphs(lesson)).map((g) => g.words.length + 1); // words + a check
    const s1 = 4 + sets[0]; // name, door, door check, the price after the door
    const s2 = sets[1] + sets[2];
    const s3 = sets[3] + 6; // choice, Spell It, wall, Site Report, letter, outro
    expect(s1).toBeLessThanOrEqual(8);
    expect(s1).toBeLessThan(Math.min(s2, s3));
    expect(Math.abs(s2 - s3)).toBeLessThanOrEqual(2);
  });

  it("offers a resume only part-way through", () => {
    expect(resumableSection(L1, undefined)).toBeNull();
    expect(resumableSection(L1, 0)).toBeNull();
    expect(resumableSection(L1, 1)).toBe(2);
    expect(resumableSection(L1, 2)).toBe(3);
    expect(resumableSection(L1, 3)).toBeNull();
    expect(resumableSection("outer-courtyard", 1)).toBeNull();
  });
});

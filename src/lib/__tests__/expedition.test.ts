import { describe, it, expect } from "vitest";
import {
  EMPTY_EXPEDITION,
  isExpeditionState,
  mergeExpedition,
  withChoice,
  withSeal,
  withBoss,
  withLetter,
  withSection,
  MAX_TORCHES,
  relicGrade,
  computeRelics,
  siteReportLength,
  masteryTier,
  masterySummary,
  toolForLevel,
  nextTool,
  depthMetres,
  dayKey,
  addLogDay,
  heatmap,
  LOG_CAP,
  rivalStatus,
  RIVAL,
  DOOR_FRAGMENTS,
  doorProgress,
  fragmentForLesson,
  BOSSES,
  bossAfterLesson,
  SECOND_PASS,
  secondPassOpen,
  CHOICES,
  choicesForLesson,
  LETTERS,
  letterForLesson,
  renderLetter,
  letterCorrect,
  LESSON_SHAPES,
  lessonShape,
  narratorFor,
  cartoucheTier,
  clearedCount,
} from "@/lib/expedition";
import { lessons, getLessonGlyphs } from "@/lib/lessons";
import { seedSign, review } from "@/lib/srs";

const done = { started: true, bestScore: 5, completed: true };
const ids = [...lessons].sort((a, b) => a.order - b.order).map((l) => l.id);

describe("persisted state", () => {
  it("validates and merges", () => {
    expect(isExpeditionState(EMPTY_EXPEDITION)).toBe(true);
    expect(isExpeditionState({ v: 2 })).toBe(false);
    expect(isExpeditionState(null)).toBe(false);
    const a = withSeal(withChoice(EMPTY_EXPEDITION, "c1", "x", 1), "l1", 3, 5, "t1");
    const b = withSeal(withChoice(EMPTY_EXPEDITION, "c2", "y", -1), "l1", 5, 5, "t2");
    const m = mergeExpedition(a, b);
    expect(m.choices).toEqual({ c1: "x", c2: "y" });
    expect(m.seals.l1).toEqual({ score: 5, total: 5, at: "t2" });
    expect(m.torches).toBe(4);
  });

  it("a choice is made once and torches are clamped", () => {
    let s = withChoice(EMPTY_EXPEDITION, "c", "a", 1);
    expect(s.torches).toBe(4);
    s = withChoice(s, "c", "b", 1);
    expect(s.choices.c).toBe("a");
    expect(s.torches).toBe(4);
    for (let i = 0; i < 20; i++) s = withChoice(s, `c${i}`, "a", 1);
    expect(s.torches).toBe(MAX_TORCHES);
    for (let i = 0; i < 20; i++) s = withChoice(s, `d${i}`, "a", -1);
    expect(s.torches).toBe(0);
  });

  it("keeps the better seal and a clean boss", () => {
    let s = withSeal(EMPTY_EXPEDITION, "l", 5, 5, "t1");
    s = withSeal(s, "l", 3, 5, "t2");
    expect(s.seals.l.at).toBe("t1");
    s = withBoss(s, "Applied", false, "t1");
    s = withBoss(s, "Applied", true, "t2");
    s = withBoss(s, "Applied", false, "t3");
    expect(s.bosses.Applied).toEqual({ clean: true, at: "t2" });
    s = withLetter(s, "l", ["𓅓"]);
    expect(s.letters.l).toEqual(["𓅓"]);
  });
});

describe("lesson sections", () => {
  it("a place only moves forward and older saves still load", () => {
    expect(EMPTY_EXPEDITION.sections).toBeUndefined();
    let s = withSection(EMPTY_EXPEDITION, "l", 1, "Ana", "t1");
    expect(s.sections?.l).toEqual({ done: 1, name: "Ana", at: "t1" });
    s = withSection(s, "l", 2, "Ana", "t2");
    const replay = withSection(s, "l", 1, "Bo", "t3");
    expect(replay).toBe(s);
    expect(isExpeditionState(s)).toBe(true);
  });

  it("merges to the furthest place on either device", () => {
    const phone = withSection(EMPTY_EXPEDITION, "l", 2, "Ana", "t2");
    const laptop = withSection(EMPTY_EXPEDITION, "l", 1, "Ana", "t1");
    expect(mergeExpedition(laptop, phone).sections?.l.done).toBe(2);
    expect(mergeExpedition(phone, laptop).sections?.l.done).toBe(2);
    expect(mergeExpedition(EMPTY_EXPEDITION, EMPTY_EXPEDITION).sections).toEqual({});
  });
});

describe("relics", () => {
  it("grades by score ratio", () => {
    expect(relicGrade(null, 5, false)).toBeNull();
    expect(relicGrade(null, 5, true)).toBe("clay");
    expect(relicGrade(2, 5, true)).toBe("clay");
    expect(relicGrade(3, 5, true)).toBe("bronze");
    expect(relicGrade(4, 5, true)).toBe("silver");
    expect(relicGrade(5, 5, true)).toBe("gold");
  });

  it("one relic per lesson, in order, with find numbers", () => {
    const relics = computeRelics({ [ids[0]]: { ...done, bestScore: siteReportLength(lessons[0]) } });
    expect(relics.length).toBe(lessons.length);
    expect(relics.map((r) => r.findNumber)).toEqual(ids.map((_, i) => `TT-${String(i + 1).padStart(2, "0")}`));
    expect(relics[0].grade).toBe("gold");
    expect(relics[1].grade).toBeNull();
    expect(relics.every((r) => r.provenance.length > 10)).toBe(true);
  });

  it("marks a relic sealed after a perfect second pass", () => {
    const s = withSeal(EMPTY_EXPEDITION, ids[0], 4, 4);
    expect(computeRelics({ [ids[0]]: done }, s)[0].sealed).toBe(true);
    expect(computeRelics({ [ids[0]]: done }, withSeal(EMPTY_EXPEDITION, ids[0], 3, 4))[0].sealed).toBe(false);
  });
});

describe("mastery", () => {
  it("tiers climb with SM-2 state", () => {
    const now = 0;
    let s = seedSign("𓅓", now);
    expect(masteryTier(s)).toBe("fresh");
    s = review(s, 4, now);
    expect(masteryTier(s)).toBe("bronze");
    s = review(s, 4, now);
    expect(masteryTier(s)).toBe("silver");
    s = review(s, 5, now);
    s = review(s, 5, now);
    expect(s.interval).toBeGreaterThanOrEqual(21);
    expect(masteryTier(s)).toBe("gold");
  });

  it("summarises and ignores junk", () => {
    const now = 0;
    const a = review(seedSign("𓅓", now), 4, now);
    const sum = masterySummary([seedSign("𓄿", now), a, { nope: true }]);
    expect(sum.total).toBe(2);
    expect(sum.byTier.fresh).toBe(1);
    expect(sum.byTier.bronze).toBe(1);
    expect(sum.byGlyph["𓅓"]).toBe("bronze");
  });
});

describe("tools, depth, cartouche", () => {
  it("tool follows level", () => {
    expect(toolForLevel(1).name).toBe("Brush");
    expect(toolForLevel(3).name).toBe("Lamp");
    expect(toolForLevel(99).name).toBe("Seal ring");
    expect(nextTool(1)?.name).toBe("Trowel");
    expect(nextTool(7)).toBeNull();
  });

  it("depth grows with chambers and inches with xp", () => {
    expect(depthMetres(0, 0)).toBe(0);
    expect(depthMetres(0, 100)).toBeGreaterThan(0);
    expect(depthMetres(0, 100)).toBeLessThan(6);
    expect(depthMetres(3, 0)).toBe(18);
    expect(depthMetres(8, 99999)).toBe(48);
  });

  it("cartouche tier follows level", () => {
    expect(cartoucheTier(1).name).toBe("Sketched");
    expect(cartoucheTier(6).name).toBe("Gilded");
    expect(cartoucheTier(7).name).toBe("Royal");
  });
});

describe("expedition log", () => {
  it("adds days once, sorted, capped", () => {
    let log = { days: [] as string[] };
    log = addLogDay(log, "2026-09-08");
    log = addLogDay(log, "2026-09-07");
    log = addLogDay(log, "2026-09-08");
    expect(log.days).toEqual(["2026-09-07", "2026-09-08"]);
    for (let i = 0; i < LOG_CAP + 10; i++) log = addLogDay(log, `2020-01-${String((i % 28) + 1).padStart(2, "0")}x${i}`);
    expect(log.days.length).toBe(LOG_CAP);
  });

  it("heatmap ends on the current week and marks active days", () => {
    const today = new Date(2026, 8, 8); // Tue 8 Sep 2026
    const cells = heatmap({ days: [dayKey(today), "2026-09-01"] }, today, 4);
    expect(cells.length).toBe(4);
    expect(cells.every((c) => c.length === 7)).toBe(true);
    const flat = cells.flat();
    expect(flat[flat.length - 1].key).toBe("2026-09-13"); // Sunday
    expect(flat.find((c) => c.key === "2026-09-08")?.active).toBe(true);
    expect(flat.find((c) => c.key === "2026-09-01")?.active).toBe(true);
    expect(flat.find((c) => c.key === "2026-09-09")?.future).toBe(true);
    expect(flat[0].key).toBe("2026-08-17"); // Monday four weeks back
  });
});

describe("rival", () => {
  it("no log: level, nothing cleared", () => {
    const r = rivalStatus({ days: [] }, 0, new Date(2026, 8, 8));
    expect(r.standing).toBe("level");
    expect(r.chambers).toBe(0);
  });

  it("clears a chamber every few days from the first day", () => {
    const first = "2026-09-01";
    const day = (n: number) => new Date(2026, 8, 1 + n);
    expect(rivalStatus({ days: [first] }, 0, day(0)).chambers).toBe(0);
    expect(rivalStatus({ days: [first] }, 0, day(RIVAL.daysPerChamber)).chambers).toBe(1);
    expect(rivalStatus({ days: [first] }, 2, day(RIVAL.daysPerChamber)).standing).toBe("ahead");
    expect(rivalStatus({ days: [first] }, 1, day(RIVAL.daysPerChamber)).standing).toBe("level");
    expect(rivalStatus({ days: [first] }, 0, day(RIVAL.daysPerChamber * 2)).standing).toBe("behind");
    expect(rivalStatus({ days: [first] }, 0, day(400)).chambers).toBe(lessons.length);
  });
});

describe("sealed door", () => {
  it("one fragment per lesson, slots 0..7", () => {
    expect(DOOR_FRAGMENTS.map((f) => f.lessonId).sort()).toEqual([...ids].sort());
    expect(DOOR_FRAGMENTS.map((f) => f.slot).sort((a, b) => a - b)).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
    expect(fragmentForLesson(ids[0])?.translit).toBe("sš");
  });

  it("uncovers with completed lessons", () => {
    const none = doorProgress(null);
    expect(none.found).toBe(0);
    expect(none.complete).toBe(false);
    const all = doorProgress(Object.fromEntries(ids.map((id) => [id, done])));
    expect(all.found).toBe(8);
    expect(all.complete).toBe(true);
    expect(all.fragments[0].translit).toBe("ḥtp dj nswt");
    expect(all.english).toMatch(/scribe/);
  });
});

describe("bosses and second pass", () => {
  it("a boss closes each category", () => {
    expect(BOSSES.map((b) => b.category)).toEqual(["Fundamentals", "Applied", "Advanced", "Mastery"]);
    for (const b of BOSSES) {
      const l = lessons.find((x) => x.id === b.afterLessonId)!;
      expect(l.category).toBe(b.category);
      expect(b.lines.length).toBeGreaterThan(0);
      for (const line of b.lines) {
        expect(line.signs.length).toBeGreaterThan(0);
        if (line.written) expect([...line.written].sort((a, c) => a - c)).toEqual(line.signs.map((_, i) => i));
      }
    }
    expect(bossAfterLesson("pilgrims-gallery")?.category).toBe("Fundamentals");
    expect(bossAfterLesson("outer-courtyard")).toBeUndefined();
  });

  it("every lesson has a second-pass reading, open once cleared", () => {
    for (const id of ids) {
      expect(SECOND_PASS[id]).toBeDefined();
      expect(SECOND_PASS[id].signs.length).toBeGreaterThan(2);
      expect(secondPassOpen(null, id)).toBe(false);
      expect(secondPassOpen({ [id]: done }, id)).toBe(true);
    }
  });
});

describe("choices, letters, shapes", () => {
  it("two choice points per lesson, one right answer each", () => {
    for (const id of ids) {
      const cs = choicesForLesson(id);
      expect(cs.length).toBe(2);
      expect(cs.map((c) => c.at).sort()).toEqual(["after-intro", "before-mechanic"]);
      for (const c of cs) {
        expect(c.options.filter((o) => o.right).length).toBe(1);
        expect(c.options.every((o) => o.outcome.length > 20)).toBe(true);
      }
    }
    expect(new Set(CHOICES.map((c) => c.id)).size).toBe(CHOICES.length);
  });

  it("every lesson has a letter whose gaps are in the letter body", () => {
    for (const id of ids) {
      const l = letterForLesson(id)!;
      expect(l).toBeDefined();
      const body = l.body.join(" ");
      for (const g of l.gaps) expect(body).toContain(`{{${g.key}}}`);
    }
    expect(LETTERS.length).toBe(lessons.length);
  });

  it("renders and checks a letter", () => {
    const l = letterForLesson("expedition-begins")!;
    const r = renderLetter(l, { m: "𓅓" });
    const gaps = r.paragraphs.flat().filter((x) => typeof x !== "string") as { gap: { key: string }; glyph: string | null }[];
    expect(gaps.length).toBe(2);
    expect(gaps[0].glyph).toBe("𓅓");
    expect(gaps[1].glyph).toBeNull();
    expect(letterCorrect(l, { m: "𓅓" })).toBe(false);
    expect(letterCorrect(l, { m: "𓅓", a: "𓄿" })).toBe(true);
  });

  it("letter gap glyphs exist somewhere on the course", () => {
    const all = new Set(lessons.flatMap((l) => getLessonGlyphs(l).map((g) => g.symbol)));
    // A few gaps use signs met in inscriptions rather than cards; those are listed here.
    const known = new Set([...all, "𓏛", "𓆸", "𓂓", "𓊹", "𓄤", "𓊵", "𓏙", "𓇳", "𓋹", "𓎆", "𓆼", "𓀀", "𓃭", "𓅓", "𓄿", "𓋴"]);
    for (const l of LETTERS) for (const g of l.gaps) expect(known.has(g.symbol)).toBe(true);
  });

  it("every lesson has a shape and a narrator", () => {
    for (const id of ids) {
      expect(LESSON_SHAPES[id]).toBeDefined();
      expect(narratorFor(id).name.length).toBeGreaterThan(0);
      expect(lessonShape(id).workTitle.length).toBeGreaterThan(0);
    }
    expect(lessonShape("nope").narrator).toBe("rashid");
    expect(lessonShape("outer-courtyard").objectFirst).toBe(true);
    expect(lessonShape("sacred-chapel").rubble).toBe(true);
    expect(lessonShape("inner-sanctum").silentReading).toBe(true);
  });

  it("counts cleared chambers", () => {
    expect(clearedCount(null)).toBe(0);
    expect(clearedCount({ [ids[0]]: done, [ids[3]]: done })).toBe(2);
  });
});

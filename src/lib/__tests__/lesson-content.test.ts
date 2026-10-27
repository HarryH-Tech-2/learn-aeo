import { describe, expect, it } from "vitest";
import { CONTENT, LESSONS, getLesson, isLive } from "@/lib/lessons";
import { LESSON_CATALOG } from "@/lib/lesson-catalog";
import { blankCount } from "@/lib/questions";
import { AUDIT_LENGTH } from "@/lib/gamification";
import { checkKey, conceptKey, exerciseCleanKey, exerciseKey, xpForClaim } from "@/lib/xp-claims";
import type { LessonContent, Question, Source } from "@/lib/lesson-types";

const BANNED = /\b(hieroglyph\w*|egypt\w*|pharaoh\w*|papyr\w*|scribes?|glyphs?|tombs?|cartouches?|expeditions?|chambers?|dig|digs|digging|ankhs?)\b/i;

function allQuestions(c: LessonContent): Question[] {
  return [...c.groups.flatMap((g) => g.check), ...c.exercise.steps, ...c.audit];
}

function checkSource(s: Source) {
  expect(s.title.length).toBeGreaterThan(0);
  expect(s.publisher.length).toBeGreaterThan(0);
  expect(s.url.startsWith("https://")).toBe(true);
  expect(s.accessed).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  if (s.published !== undefined) expect(s.published).toMatch(/^\d{4}-\d{2}(-\d{2})?$/);
}

function checkQuestion(q: Question) {
  expect(q.prompt.length, q.id).toBeGreaterThan(0);
  expect(q.explanation.length, q.id).toBeGreaterThan(0);
  switch (q.kind) {
    case "choice":
      expect(q.options.length, q.id).toBeGreaterThanOrEqual(3);
      expect(q.options.length, q.id).toBeLessThanOrEqual(5);
      expect(new Set(q.options).size, q.id).toBe(q.options.length);
      expect(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < q.options.length, q.id).toBe(true);
      break;
    case "passage":
      expect(q.passages).toHaveLength(2);
      expect([0, 1]).toContain(q.answer);
      break;
    case "blank":
      expect(blankCount(q.text), q.id).toBe(q.answers.length);
      expect(q.distractors.length, q.id).toBeGreaterThanOrEqual(1);
      for (const d of q.distractors) {
        expect(q.answers.map((a) => a.toLowerCase()), q.id).not.toContain(d.toLowerCase());
      }
      break;
    case "order":
      expect(q.items.length, q.id).toBeGreaterThanOrEqual(3);
      expect(q.items.length, q.id).toBeLessThanOrEqual(6);
      expect(new Set(q.items).size, q.id).toBe(q.items.length);
      break;
    case "match":
      expect(q.pairs.length, q.id).toBeGreaterThanOrEqual(3);
      expect(q.pairs.length, q.id).toBeLessThanOrEqual(5);
      expect(new Set(q.pairs.map((p) => p.term)).size, q.id).toBe(q.pairs.length);
      expect(new Set(q.pairs.map((p) => p.definition)).size, q.id).toBe(q.pairs.length);
      break;
    case "spot":
      expect(q.lines.length, q.id).toBeGreaterThanOrEqual(2);
      expect(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < q.lines.length, q.id).toBe(true);
      break;
  }
}

describe("banned-word pattern", () => {
  it("catches old-course words but not ordinary ones", () => {
    expect("describe the subscribe button").not.toMatch(BANNED);
    expect("an Egyptian scribe").toMatch(BANNED);
    expect("Hieroglyphs").toMatch(BANNED);
    expect("a digital digest of the indigo prodigy").not.toMatch(BANNED);
    expect("the dig site").toMatch(BANNED);
    expect("the burial chamber").toMatch(BANNED);
    expect("an ankh").toMatch(BANNED);
  });
});

describe("lesson registry", () => {
  it("follows catalog order", () => {
    expect(LESSONS.map((l) => l.id)).toEqual(LESSON_CATALOG.map((l) => l.id));
  });

  it("attaches content to every live catalog entry, and only to catalog ids", () => {
    for (const meta of LESSON_CATALOG) {
      if (meta.status === "live") expect(CONTENT[meta.id], meta.id).toBeDefined();
    }
    const ids = new Set(LESSON_CATALOG.map((l) => l.id));
    for (const key of Object.keys(CONTENT)) expect(ids.has(key), key).toBe(true);
  });

  it("has lesson 1 live", () => {
    const l = getLesson("how-answer-engines-choose-sources");
    expect(isLive(l)).toBe(true);
    expect(getLesson("nope")).toBeUndefined();
    expect(isLive(undefined)).toBe(false);
    expect(isLive(getLesson("platform-playbooks"))).toBe(false);
  });
});

const live = LESSONS.filter(isLive);

describe.each(live.map((l) => [l.id, l] as const))("lesson content: %s", (_id, lesson) => {
  const c = lesson.content;

  it("has the right shape", () => {
    expect(c.intro.length).toBeGreaterThan(0);
    expect(c.outro.length).toBeGreaterThan(0);
    expect(c.groups.length).toBeGreaterThanOrEqual(3);
    expect(c.groups.length).toBeLessThanOrEqual(4);
    for (const g of c.groups) {
      expect(g.concepts.length, g.id).toBeGreaterThanOrEqual(2);
      expect(g.concepts.length, g.id).toBeLessThanOrEqual(5);
      expect(g.check.length, g.id).toBeGreaterThanOrEqual(2);
      expect(g.check.length, g.id).toBeLessThanOrEqual(4);
    }
    expect(c.exercise.steps.length).toBeGreaterThanOrEqual(3);
    expect(c.audit.length).toBeGreaterThanOrEqual(AUDIT_LENGTH.min);
    expect(c.audit.length).toBeLessThanOrEqual(AUDIT_LENGTH.max);
    expect(new Set(allQuestions(c).map((q) => q.kind)).size).toBeGreaterThanOrEqual(4);
  });

  it("sources every concept and the example", () => {
    for (const g of c.groups) {
      for (const k of g.concepts) {
        expect(k.sources.length, k.id).toBeGreaterThanOrEqual(1);
        k.sources.forEach(checkSource);
      }
    }
    checkSource(c.example.source);
  });

  it("has valid questions", () => {
    allQuestions(c).forEach(checkQuestion);
  });

  it("uses unique ids", () => {
    const ids = [
      ...c.groups.map((g) => g.id),
      ...c.groups.flatMap((g) => g.concepts.map((k) => k.id)),
      ...allQuestions(c).map((q) => q.id),
      c.exercise.id,
    ];
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("prices every XP step it offers (claim keys from src/lib/xp-claims.ts)", () => {
    const keys = [
      ...c.groups.flatMap((g) => g.concepts.map((k) => conceptKey(k.id))),
      ...c.groups.flatMap((g) => g.check.map((q) => checkKey(q.id))),
      ...c.exercise.steps.map((q) => exerciseKey(c.exercise.id, q.id)),
      exerciseCleanKey(c.exercise.id),
    ];
    for (const key of keys) expect(xpForClaim(c, key), key).not.toBeNull();
    // a step called "clean" would collide with the clean-run key
    expect(c.exercise.steps.map((q) => q.id)).not.toContain("clean");
    expect(xpForClaim(c, "audit", c.audit.length)).not.toBeNull();
  });

  it("has no leftover wording from the old course", () => {
    expect(JSON.stringify(c)).not.toMatch(BANNED);
  });
});

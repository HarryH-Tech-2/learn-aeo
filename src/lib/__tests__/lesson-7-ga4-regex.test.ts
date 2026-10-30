// Lesson 7's GA4 regex teaching, checked the way GA4 applies a regex: as a full match by default
// (https://support.google.com/analytics/answer/1034324: "By default, Google Analytics Regex is full regex").
import { describe, it, expect } from "vitest";
import { getLesson, isLive } from "@/lib/lessons";
import type { LessonContent, Question } from "@/lib/lesson-types";

/** Whether a GA4 "matches regex" condition accepts the whole value, as GA4 does. */
const ga4Matches = (re: string, value: string) => new RegExp(`^(?:${re})$`).test(value);

const ASSISTANTS = ["chatgpt.com", "perplexity.ai", "www.perplexity.ai", "copilot.microsoft.com", "gemini.google.com", "claude.ai"];
const NOT_ASSISTANTS = ["acme.ai", "mail.google.com", "mailchimp.com", "gptzero.me", "notchatgpt.com", "chatgpt.com.evil.example", "google.com"];

function lesson7(): LessonContent {
  const l = getLesson("measuring-ai-visibility");
  if (!isLive(l)) throw new Error("lesson 7 is not live");
  return l.content;
}

function question(c: LessonContent, id: string): Question {
  const q = [...c.groups.flatMap((g) => g.check), ...c.exercise.steps, ...c.audit].find((x) => x.id === id);
  if (!q) throw new Error(`no question ${id}`);
  return q;
}

describe("lesson 7 GA4 regex", () => {
  it("makes no claim that only holds for a partial match", () => {
    const text = JSON.stringify(lesson7());
    for (const s of ["mail.google.com", "mailchimp.com", "dailymail"]) expect(text, s).not.toContain(s);
  });

  it("teaches a regex that matches the assistants and nothing else", () => {
    const concept = lesson7().groups.flatMap((g) => g.concepts).find((k) => k.id === "c-custom-channel")!;
    const re = concept.explanation.match(/`(\^\(\.\*\\\.\)\?[^`]+)`/)?.[1];
    expect(re).toBeDefined();
    for (const s of ASSISTANTS) expect(ga4Matches(re!, s), s).toBe(true);
    for (const s of NOT_ASSISTANTS) expect(ga4Matches(re!, s), s).toBe(false);
  });

  it("the spot question's answer is the only alternative that catches a non-assistant .ai domain", () => {
    const q = question(lesson7(), "q-ga4-regex");
    if (q.kind !== "spot") throw new Error("q-ga4-regex is not a spot question");
    const alts = q.lines.map((l) => l.replace(/^\|/, "").replace(/^\^/, ""));
    alts.forEach((alt, i) => expect(ga4Matches(alt, "acme.ai"), alt).toBe(i === q.answer));
  });

  it("the exercise regex works with the answers, and every distractor breaks it", () => {
    const q = question(lesson7(), "x-step-regex");
    if (q.kind !== "blank") throw new Error("x-step-regex is not a blank question");
    const fill = (vals: string[]) => vals.reduce((t, v) => t.replace("___", v), q.text);
    const works = (re: string) =>
      ASSISTANTS.every((s) => ga4Matches(re, s)) && NOT_ASSISTANTS.every((s) => !ga4Matches(re, s));
    expect(works(fill(q.answers))).toBe(true);
    q.answers.forEach((_, slot) => {
      for (const d of q.distractors) {
        const vals = q.answers.map((a, i) => (i === slot ? d : a));
        expect(works(fill(vals)), `${d} in blank ${slot}`).toBe(false);
      }
    });
  });
});

import { describe, expect, it } from "vitest";
import type { Question } from "../lesson-types";
import { blankCount, checkAnswer, moveItem, pairUp, seedFrom, shuffled } from "../questions";

const choice: Question = { kind: "choice", id: "q-choice", prompt: "p", options: ["a", "b", "c", "d"], answer: 2, explanation: "e" };

describe("checkAnswer", () => {
  it("checks choice and rejects kind mismatch", () => {
    expect(checkAnswer(choice, { kind: "choice", index: 2 })).toBe(true);
    expect(checkAnswer(choice, { kind: "choice", index: 1 })).toBe(false);
    expect(checkAnswer(choice, { kind: "passage", index: 0 })).toBe(false);
  });

  it("marks the right option correct whatever the shuffled display order", () => {
    const display = shuffled([0, 1, 2, 3], seedFrom(choice.id));
    expect([...display].sort()).toEqual([0, 1, 2, 3]);
    expect(shuffled([0, 1, 2, 3], seedFrom(choice.id))).toEqual(display);
    for (let pos = 0; pos < 4; pos++) {
      const ok = checkAnswer(choice, { kind: "choice", index: display[pos] });
      expect(ok).toBe(display[pos] === 2);
    }
  });

  it("checks passage", () => {
    const q: Question = { kind: "passage", id: "p", prompt: "p", passages: ["x", "y"], answer: 1, explanation: "e" };
    expect(checkAnswer(q, { kind: "passage", index: 1 })).toBe(true);
    expect(checkAnswer(q, { kind: "passage", index: 0 })).toBe(false);
  });

  it("checks blanks trimmed and case-insensitive, in order", () => {
    const q: Question = { kind: "blank", id: "b", prompt: "p", text: "a ___ b ___", answers: ["Foo", "bar"], distractors: [], explanation: "e" };
    expect(checkAnswer(q, { kind: "blank", fills: [" foo ", "BAR"] })).toBe(true);
    expect(checkAnswer(q, { kind: "blank", fills: ["bar", "foo"] })).toBe(false);
    expect(checkAnswer(q, { kind: "blank", fills: ["foo"] })).toBe(false);
    expect(blankCount("a ___ b ___")).toBe(2);
    expect(blankCount("none")).toBe(0);
  });

  it("checks order", () => {
    const q: Question = { kind: "order", id: "o", prompt: "p", items: ["a", "b", "c"], explanation: "e" };
    expect(checkAnswer(q, { kind: "order", order: ["a", "b", "c"] })).toBe(true);
    expect(checkAnswer(q, { kind: "order", order: ["b", "a", "c"] })).toBe(false);
  });

  it("checks match and pairUp moves a used definition", () => {
    const q: Question = {
      kind: "match", id: "m", prompt: "p", explanation: "e",
      pairs: [{ term: "a", definition: "1" }, { term: "b", definition: "2" }],
    };
    expect(checkAnswer(q, { kind: "match", pairs: { a: "1", b: "2" } })).toBe(true);
    expect(checkAnswer(q, { kind: "match", pairs: { a: "1" } })).toBe(false);
    expect(checkAnswer(q, { kind: "match", pairs: { a: "2", b: "1" } })).toBe(false);
    expect(pairUp({ a: "1" }, "b", "1")).toEqual({ b: "1" });
    expect(pairUp({ a: "1" }, "a", "2")).toEqual({ a: "2" });
  });

  it("checks spot", () => {
    const q: Question = { kind: "spot", id: "s", prompt: "p", language: "robots", lines: ["x", "y"], answer: 1, explanation: "e" };
    expect(checkAnswer(q, { kind: "spot", line: 1 })).toBe(true);
    expect(checkAnswer(q, { kind: "spot", line: 0 })).toBe(false);
  });
});

describe("moveItem", () => {
  it("moves and no-ops at the ends without mutating", () => {
    const a = ["a", "b", "c"];
    expect(moveItem(a, 0, -1)).toEqual(["a", "b", "c"]);
    expect(moveItem(a, 0, 1)).toEqual(["b", "a", "c"]);
    expect(moveItem(a, 2, 1)).toEqual(["a", "b", "c"]);
    expect(a).toEqual(["a", "b", "c"]);
  });
});

import { describe, it, expect } from "vitest";
import { heroMode, typedQuestion } from "@/components/home/hero-mode";

describe("heroMode", () => {
  it("plays the loop when nothing asks for less motion", () => {
    expect(heroMode({ reducedMotion: false, saveData: false })).toBe("play");
  });

  it("shows the still poster for reduced motion or Save-Data", () => {
    expect(heroMode({ reducedMotion: true, saveData: false })).toBe("still");
    expect(heroMode({ reducedMotion: false, saveData: true })).toBe("still");
    expect(heroMode({ reducedMotion: true, saveData: true })).toBe("still");
  });
});

describe("typedQuestion", () => {
  const q = "How do I get cited?";

  it("types one character per step, starting empty", () => {
    expect(typedQuestion(q, 0)).toBe("");
    expect(typedQuestion(q, 3)).toBe("How");
  });

  it("stops at the full question and stays there", () => {
    expect(typedQuestion(q, q.length)).toBe(q);
    expect(typedQuestion(q, q.length + 50)).toBe(q);
  });

  it("treats a negative step as nothing typed yet", () => {
    expect(typedQuestion(q, -2)).toBe("");
  });
});


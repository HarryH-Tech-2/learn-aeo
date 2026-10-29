import { describe, it, expect } from "vitest";
import { coverPoint, heroMode, typedQuestion } from "@/components/home/hero-mode";

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

describe("coverPoint", () => {
  const video = { width: 1920, height: 1080 };

  it("maps a point straight through when the box has the video's shape", () => {
    expect(coverPoint({ width: 960, height: 540 }, video, { x: 0.5, y: 0.25 }, { x: 0.5, y: 0.5 })).toEqual({ x: 480, y: 135 });
  });

  it("crops the sides of a tall box, centered by object-position x", () => {
    // 400x800 box: scale = 800/1080, video drawn 1422.2 wide, 511.1 cropped off each side
    const p = coverPoint({ width: 400, height: 800 }, video, { x: 0.5, y: 0.5 }, { x: 0.5, y: 0.4 });
    expect(p.x).toBeCloseTo(200, 5);
    expect(p.y).toBeCloseTo(400, 5);
  });

  it("crops top and bottom of a wide box by object-position y", () => {
    // 2000x500 box: scale = 2000/1920, video drawn 1125 tall, 625 cropped; 40% of it (250) above
    const p = coverPoint({ width: 2000, height: 500 }, video, { x: 0, y: 0.5 }, { x: 0.5, y: 0.4 });
    expect(p.x).toBeCloseTo(0, 5);
    expect(p.y).toBeCloseTo(562.5 - 250, 5);
  });
});

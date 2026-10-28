import { describe, it, expect } from "vitest";
import { heroMode } from "@/components/home/hero-mode";

describe("heroMode", () => {
  it("animates when WebGL works and nothing asks for less motion", () => {
    expect(heroMode({ webgl: true, reducedMotion: false, saveData: false })).toBe("animate");
  });

  it("shows a still frame for reduced motion or Save-Data", () => {
    expect(heroMode({ webgl: true, reducedMotion: true, saveData: false })).toBe("still");
    expect(heroMode({ webgl: true, reducedMotion: false, saveData: true })).toBe("still");
  });

  it("draws nothing without WebGL, whatever else is set", () => {
    expect(heroMode({ webgl: false, reducedMotion: false, saveData: false })).toBe("none");
    expect(heroMode({ webgl: false, reducedMotion: true, saveData: true })).toBe("none");
  });
});

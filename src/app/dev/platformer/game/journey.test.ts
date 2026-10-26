import { describe, expect, it } from "vitest";
import { CHECKPOINTS, GATE, PILLARS, START, STATION_SITES } from "./course";
import { LANDINGS, courseFraction, milestoneCrossed, nextLanding, siteFraction } from "./journey";

describe("journey", () => {
  it("runs from 0 at the start to 1 at the gate, and never outside", () => {
    expect(courseFraction(START[2])).toBe(0);
    expect(courseFraction(GATE[2])).toBe(1);
    expect(courseFraction(10)).toBe(0);
    expect(courseFraction(-500)).toBe(1);
    expect(courseFraction(-60)).toBeGreaterThan(courseFraction(-20));
  });

  it("puts every station site in course order", () => {
    const f = STATION_SITES.map((_, i) => siteFraction(i));
    expect([...f].sort((a, b) => a - b)).toEqual(f);
  });

  it("sets a carry down on solid stone, on the near side of the landing's beam", () => {
    for (const at of LANDINGS) {
      const under = PILLARS.find((p) => Math.abs(at[0] - p.top[0]) < p.size[0] / 2 && Math.abs(at[2] - p.top[2]) < p.size[1] / 2);
      expect(under, `landing at ${at}`).toBeTruthy();
      expect(at[1]).toBeGreaterThan(under!.top[1]);
      // a beacon stands 2.3 in front of its tablets; the carry must land before it
      const site = STATION_SITES.find((s) => Math.abs(s.at[2] - under!.top[2]) < under!.size[1] / 2);
      if (site) expect(at[2]).toBeGreaterThan(site.at[2] + 2.3);
    }
  });

  it("carries to the next landing ahead, never back and never past one", () => {
    expect(nextLanding(START[2])?.index).toBe(0);
    // standing on the first checkpoint's landing, stuck at the moving slab
    expect(nextLanding(CHECKPOINTS[0].spawn[2])?.index).toBe(1);
    // on the fork's last pillar: the third landing, not the fourth
    expect(nextLanding(-58.4)?.index).toBe(2);
    expect(nextLanding(LANDINGS[LANDINGS.length - 1][2])).toBeNull();
  });

  it("names the furthest milestone crossed, once", () => {
    expect(milestoneCrossed(0.1, 0.2)).toBeNull();
    expect(milestoneCrossed(0.2, 0.3)?.at).toBe(0.25);
    expect(milestoneCrossed(0.2, 0.6)?.at).toBe(0.5);
    expect(milestoneCrossed(0.5, 0.6)).toBeNull();
  });
});

import { describe, it, expect } from "vitest";
import {
  N,
  cloudFromStrokes,
  cloudPercent,
  cloudScoreDistance,
  normalizeUnistroke,
  pathLength,
  pointsFromInk,
  praiseFor,
  recognizeCloud,
  recognizeUnistroke,
  resample,
  templateFromInk,
  type Point,
} from "../recognizer";

function circle(r = 100, n = 40, cx = 0, cy = 0, jitter = 0): Point[] {
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    return { x: cx + r * Math.cos(a) + (jitter ? Math.sin(i * 7) * jitter : 0), y: cy + r * Math.sin(a) + (jitter ? Math.cos(i * 5) * jitter : 0) };
  });
}
function line(x0: number, y0: number, x1: number, y1: number, n = 20): Point[] {
  return Array.from({ length: n }, (_, i) => ({ x: x0 + ((x1 - x0) * i) / (n - 1), y: y0 + ((y1 - y0) * i) / (n - 1) }));
}
function square(s = 100): Point[] {
  return [...line(0, 0, s, 0), ...line(s, 0, s, s), ...line(s, s, 0, s), ...line(0, s, 0, 0)];
}
function zigzag(): Point[] {
  return [...line(0, 0, 50, 100), ...line(50, 100, 100, 0), ...line(100, 0, 150, 100)];
}

describe("resample", () => {
  it("returns n equidistant points", () => {
    const pts = resample(line(0, 0, 100, 0, 5), N);
    expect(pts.length).toBe(N);
    const gaps = pts.slice(1).map((p, i) => Math.hypot(p.x - pts[i].x, p.y - pts[i].y));
    for (const g of gaps) expect(g).toBeCloseTo(100 / (N - 1), 1);
    expect(pathLength(pts)).toBeCloseTo(100, 0);
  });
});

describe("$1 unistroke", () => {
  const templates = [
    { name: "circle", points: normalizeUnistroke(circle()) },
    { name: "square", points: normalizeUnistroke(square()) },
    { name: "zigzag", points: normalizeUnistroke(zigzag()) },
  ];
  it("recognises the same shape drawn elsewhere, bigger and slightly rotated", () => {
    const drawn = circle(40, 30, 500, 300, 2);
    const m = recognizeUnistroke(drawn, templates);
    expect(m.name).toBe("circle");
    expect(m.score).toBeGreaterThan(0.85);
    const z = zigzag().map((p) => ({ x: p.x * 3 + 20, y: p.y * 3 + 40 }));
    expect(recognizeUnistroke(z, templates).name).toBe("zigzag");
  });
  it("handles degenerate input", () => {
    expect(recognizeUnistroke([{ x: 1, y: 1 }], templates).score).toBe(0);
    expect(recognizeUnistroke(circle(), []).score).toBe(0);
  });
});

describe("$P point cloud", () => {
  const tCircle = templateFromInk(circle(100, 200));
  const tSquare = templateFromInk(square(100));
  const tZig = templateFromInk(zigzag());
  const templates = [
    { name: "circle", points: tCircle },
    { name: "square", points: tSquare },
    { name: "zigzag", points: tZig },
  ];

  it("scores an identical shape ~100 and an unrelated one low", () => {
    expect(cloudPercent(cloudScoreDistance(cloudFromStrokes([circle()]), tCircle))).toBeGreaterThan(90);
    expect(cloudPercent(cloudScoreDistance(cloudFromStrokes([zigzag()]), tCircle))).toBeLessThan(55);
  });

  it("is independent of stroke count and order", () => {
    const oneStroke = cloudFromStrokes([square()]);
    const fourStrokes = cloudFromStrokes([line(0, 0, 100, 0), line(0, 100, 0, 0), line(100, 0, 100, 100), line(100, 100, 0, 100)]);
    const reversed = cloudFromStrokes([square().reverse()]);
    const a = cloudPercent(cloudScoreDistance(oneStroke, tSquare));
    const b = cloudPercent(cloudScoreDistance(fourStrokes, tSquare));
    const c = cloudPercent(cloudScoreDistance(reversed, tSquare));
    expect(Math.abs(a - b)).toBeLessThan(8);
    expect(Math.abs(a - c)).toBeLessThan(8);
    expect(b).toBeGreaterThan(80);
  });

  it("picks the right template with hand wobble and different size/position", () => {
    const drawn = circle(30, 25, 900, 900, 3);
    expect(recognizeCloud([drawn], templates).name).toBe("circle");
    const sq = square(40).map((p) => ({ x: p.x + 300, y: p.y + 10 + Math.sin(p.x) * 2 }));
    expect(recognizeCloud([sq], templates).name).toBe("square");
  });

  it("builds a template from ink pixels", () => {
    const w = 20;
    const h = 20;
    const data = new Uint8ClampedArray(w * h * 4);
    // a filled diagonal line of ink
    for (let i = 0; i < 20; i++) data[(i * w + i) * 4 + 3] = 255;
    const ink = pointsFromInk(data, w, h);
    expect(ink.length).toBe(20);
    const t = templateFromInk(ink, 16);
    expect(t.length).toBe(16);
    const drawn = cloudFromStrokes([line(0, 0, 100, 100)], 16);
    expect(cloudPercent(cloudScoreDistance(drawn, t))).toBeGreaterThan(85);
  });

  it("praise has three tiers and never a fail", () => {
    expect(praiseFor(90).tier).toBe(3);
    expect(praiseFor(60).tier).toBe(2);
    expect(praiseFor(10).tier).toBe(1);
    expect(praiseFor(10).title).not.toMatch(/wrong|fail/i);
  });
});

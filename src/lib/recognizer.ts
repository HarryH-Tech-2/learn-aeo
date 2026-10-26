/**
 * Gesture recognition for Scribe's Hand.
 *
 * Two recognisers from the "$-family" (Wobbrock, Wilson & Li 2007; Vatavu,
 * Anthony & Wobbrock 2012), written from the published pseudocode:
 *
 *  - $1 unistroke: resample → rotate to the indicative angle → scale to a
 *    square → translate to the origin → golden-section search over rotation
 *    for the smallest average point distance. Order-sensitive.
 *  - Point cloud ($P-style): resample → uniform scale → translate to the
 *    centroid → symmetric Chamfer (nearest-neighbour) distance. Ignores
 *    stroke order and stroke count entirely. $P's greedy one-to-one match
 *    was tried first and replaced because it penalised sampling-density
 *    differences between a traced template and a drawn stroke.
 *
 * Multi-stroke decision: a hieroglyph can be drawn in any number of strokes
 * in any order (there is no canonical stroke order the way there is for
 * kanji), and our templates are traced automatically from the rendered
 * glyph, so they carry no order either. Player strokes are therefore
 * concatenated into ONE point set and scored with $P. $1 is kept for
 * hand-made unistroke templates and is what `recognizeUnistroke` runs.
 */

export type Point = { x: number; y: number };

export const N = 64; // resample count for $1
export const CLOUD_N = 64; // points per cloud
const SQUARE = 250;
const ORIGIN: Point = { x: 0, y: 0 };
const PHI = 0.5 * (-1 + Math.sqrt(5));

// ─── geometry helpers ───

export function pathLength(pts: Point[]): number {
  let d = 0;
  for (let i = 1; i < pts.length; i++) d += dist(pts[i - 1], pts[i]);
  return d;
}

export function dist(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function centroid(pts: Point[]): Point {
  let x = 0;
  let y = 0;
  for (const p of pts) {
    x += p.x;
    y += p.y;
  }
  return { x: x / pts.length, y: y / pts.length };
}

export function boundingBox(pts: Point[]): { x: number; y: number; w: number; h: number } {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const p of pts) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  }
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

/** Resample a path to `n` equidistant points. */
export function resample(points: Point[], n: number): Point[] {
  if (points.length === 0) return [];
  if (points.length === 1) return Array.from({ length: n }, () => ({ ...points[0] }));
  const I = pathLength(points) / (n - 1);
  if (I === 0) return Array.from({ length: n }, () => ({ ...points[0] }));
  let D = 0;
  const pts = points.map((p) => ({ ...p }));
  const out: Point[] = [{ ...pts[0] }];
  for (let i = 1; i < pts.length; i++) {
    const d = dist(pts[i - 1], pts[i]);
    if (D + d >= I) {
      const t = (I - D) / d;
      const q = { x: pts[i - 1].x + t * (pts[i].x - pts[i - 1].x), y: pts[i - 1].y + t * (pts[i].y - pts[i - 1].y) };
      out.push(q);
      pts.splice(i, 0, q);
      D = 0;
    } else D += d;
  }
  while (out.length < n) out.push({ ...pts[pts.length - 1] });
  return out.slice(0, n);
}

export function indicativeAngle(pts: Point[]): number {
  const c = centroid(pts);
  return Math.atan2(c.y - pts[0].y, c.x - pts[0].x);
}

export function rotateBy(pts: Point[], radians: number): Point[] {
  const c = centroid(pts);
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  return pts.map((p) => ({ x: (p.x - c.x) * cos - (p.y - c.y) * sin + c.x, y: (p.x - c.x) * sin + (p.y - c.y) * cos + c.y }));
}

/** Non-uniform scale to a square (the $1 default). */
export function scaleTo(pts: Point[], size: number): Point[] {
  const b = boundingBox(pts);
  const w = b.w || 1;
  const h = b.h || 1;
  return pts.map((p) => ({ x: (p.x * size) / w, y: (p.y * size) / h }));
}

/** Uniform scale so the longer side is `size` (keeps a glyph's proportions). */
export function scaleUniform(pts: Point[], size: number): Point[] {
  const b = boundingBox(pts);
  const s = size / Math.max(b.w, b.h, 1);
  return pts.map((p) => ({ x: p.x * s, y: p.y * s }));
}

export function translateTo(pts: Point[], to: Point): Point[] {
  const c = centroid(pts);
  return pts.map((p) => ({ x: p.x + to.x - c.x, y: p.y + to.y - c.y }));
}

// ─── $1 ───

export function normalizeUnistroke(points: Point[]): Point[] {
  let pts = resample(points, N);
  pts = rotateBy(pts, -indicativeAngle(pts));
  pts = scaleTo(pts, SQUARE);
  return translateTo(pts, ORIGIN);
}

function pathDistance(a: Point[], b: Point[]): number {
  let d = 0;
  for (let i = 0; i < a.length; i++) d += dist(a[i], b[i]);
  return d / a.length;
}

function distanceAtAngle(pts: Point[], tmpl: Point[], radians: number): number {
  return pathDistance(rotateBy(pts, radians), tmpl);
}

function distanceAtBestAngle(pts: Point[], tmpl: Point[], a: number, b: number, threshold: number): number {
  let x1 = PHI * a + (1 - PHI) * b;
  let f1 = distanceAtAngle(pts, tmpl, x1);
  let x2 = (1 - PHI) * a + PHI * b;
  let f2 = distanceAtAngle(pts, tmpl, x2);
  while (Math.abs(b - a) > threshold) {
    if (f1 < f2) {
      b = x2;
      x2 = x1;
      f2 = f1;
      x1 = PHI * a + (1 - PHI) * b;
      f1 = distanceAtAngle(pts, tmpl, x1);
    } else {
      a = x1;
      x1 = x2;
      f1 = f2;
      x2 = (1 - PHI) * a + PHI * b;
      f2 = distanceAtAngle(pts, tmpl, x2);
    }
  }
  return Math.min(f1, f2);
}

export type Template = { name: string; points: Point[] };
export type Match = { name: string; score: number };

/** $1: `templates` must already be normalised with normalizeUnistroke. */
export function recognizeUnistroke(points: Point[], templates: Template[], angleRange = Math.PI / 4, precision = Math.PI / 90): Match {
  if (points.length < 2 || templates.length === 0) return { name: "", score: 0 };
  const pts = normalizeUnistroke(points);
  let best = { name: "", score: 0 };
  const half = 0.5 * Math.sqrt(2 * SQUARE * SQUARE);
  for (const t of templates) {
    const d = distanceAtBestAngle(pts, t.points, -angleRange, angleRange, precision);
    const score = Math.max(0, 1 - d / half);
    if (score > best.score) best = { name: t.name, score };
  }
  return best;
}

// ─── $P ───

/**
 * Normalise a set of strokes into a point cloud: each stroke resampled by
 * its share of the total length, then uniform-scaled and centred. Uniform
 * scaling (not $P's non-uniform default) so a tall reed and a wide owl stay
 * distinguishable by shape.
 */
export function normalizeCloud(strokes: Point[][], n: number = CLOUD_N): Point[] {
  const clean = strokes.filter((s) => s.length > 0);
  if (clean.length === 0) return [];
  const total = clean.reduce((d, s) => d + Math.max(pathLength(s), 1e-6), 0);
  let cloud: Point[] = [];
  clean.forEach((s, i) => {
    const share = Math.max(2, Math.round((n * Math.max(pathLength(s), 1e-6)) / total));
    cloud = cloud.concat(resample(s, i === clean.length - 1 ? Math.max(2, n - cloud.length) : share));
  });
  cloud = resample(cloud.length > n ? cloud.slice(0, n) : cloud, n);
  cloud = scaleUniform(cloud, SQUARE);
  return translateTo(cloud, ORIGIN);
}

/**
 * Chamfer distance between two clouds: for every point, the distance to
 * its nearest neighbour in the other cloud, averaged; taken in both
 * directions and the larger kept.
 * Unlike $P's greedy one-to-one matching it does not depend on sampling
 * density or point count, so an identical shape scores ~0 however it was
 * drawn. Order- and stroke-count-free by construction.
 */
export function cloudScoreDistance(a: Point[], b: Point[]): number {
  if (a.length === 0 || b.length === 0) return Infinity;
  const oneWay = (from: Point[], to: Point[]) => {
    let sum = 0;
    for (const p of from) {
      let min = Infinity;
      for (const q of to) {
        const d = (p.x - q.x) * (p.x - q.x) + (p.y - q.y) * (p.y - q.y);
        if (d < min) min = d;
      }
      sum += Math.sqrt(min);
    }
    return sum / from.length;
  };
  // The worse direction, so a drawing that covers only part of the sign
  // (a single line inside a bird) is not rewarded for what it left out.
  return Math.max(oneWay(a, b), oneWay(b, a));
}

/**
 * Turn a cloud distance into a 0–100 "how close" percentage. Calibrated so
 * an identical shape is 100, a redraw with normal hand wobble lands 70–95,
 * and an unrelated sign lands under 40.
 */
export function cloudPercent(distance: number): number {
  if (!Number.isFinite(distance)) return 0;
  // Measured on synthetic shapes (see recognizer.test.ts): identical ≈ 8,
  // hand wobble ≈ 12, a bird drawn in three strokes ≈ 11, a bare vertical
  // line inside a bird ≈ 22, circle vs square ≈ 20, zigzag vs circle ≈ 46,
  // straight line vs circle ≈ 87 (all in a 250-unit square).
  const floor = 6;
  const worst = 32;
  return Math.round(Math.max(0, Math.min(100, (1 - (distance - floor) / worst) * 100)));
}

/** $P: score the player's strokes against one template cloud. */
export function scoreCloud(strokes: Point[][], templateCloud: Point[]): number {
  const cloud = normalizeCloud(strokes, templateCloud.length || CLOUD_N);
  return cloudPercent(cloudScoreDistance(cloud, templateCloud));
}

/** $P: pick the best of several templates. */
export function recognizeCloud(strokes: Point[][], templates: Template[]): Match {
  let best: Match = { name: "", score: 0 };
  for (const t of templates) {
    const s = scoreCloud(strokes, t.points);
    if (s > best.score) best = { name: t.name, score: s };
  }
  return best;
}

/** Praise tiers: three, no red X. */
export function praiseFor(percent: number): { tier: 1 | 2 | 3; title: string; line: string } {
  if (percent >= 75) return { tier: 3, title: "Master scribe", line: "The reed did exactly what you told it." };
  if (percent >= 50) return { tier: 2, title: "A steady hand", line: "The shape is there. Trace it once more and it will sit in your hand." };
  return { tier: 1, title: "Apprentice's first line", line: "Every scribe started here. Look at the true form, then try it again." };
}

/**
 * Build a point-cloud template from the "ink" pixels of a rendered glyph
 * (a canvas ImageData). Noto's hieroglyphs are thin outlines, so the ink
 * itself is a good skeleton. Pure so it can be tested on synthetic pixels.
 */
export function pointsFromInk(data: Uint8ClampedArray, width: number, height: number, alphaThreshold = 100, maxPoints = 400): Point[] {
  const pts: Point[] = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] >= alphaThreshold) pts.push({ x, y });
    }
  }
  if (pts.length <= maxPoints) return pts;
  const step = pts.length / maxPoints;
  const out: Point[] = [];
  for (let i = 0; i < maxPoints; i++) out.push(pts[Math.floor(i * step)]);
  return out;
}

/** A cloud template from ink points: treat every ink pixel as a tiny stroke set. */
export function templateFromInk(ink: Point[], n: number = CLOUD_N): Point[] {
  if (ink.length === 0) return [];
  // Sort along a space-filling-ish order (rows) so resampling walks the shape
  // rather than jumping randomly; $P is order-free anyway.
  const sorted = [...ink].sort((a, b) => a.y - b.y || a.x - b.x);
  // Deterministic even pick of n points, then normalise as a cloud.
  const step = sorted.length / n;
  const picked: Point[] = [];
  for (let i = 0; i < n; i++) picked.push(sorted[Math.min(sorted.length - 1, Math.floor(i * step))]);
  const scaled = scaleUniform(picked, SQUARE);
  return translateTo(scaled, ORIGIN);
}

/** Cloud for the player's strokes, sampled the same way as an ink template (unordered even pick). */
export function cloudFromStrokes(strokes: Point[][], n: number = CLOUD_N): Point[] {
  const clean = strokes.filter((s) => s.length > 0);
  const total = clean.reduce((d, s) => d + Math.max(pathLength(s), 1e-6), 0);
  if (total <= 1e-6) return [];
  // Dense, length-proportional sampling so density is the same however many strokes were used.
  const dense = clean.flatMap((s) => resample(s, Math.max(2, Math.round((400 * Math.max(pathLength(s), 1e-6)) / total))));
  return templateFromInk(dense, n);
}

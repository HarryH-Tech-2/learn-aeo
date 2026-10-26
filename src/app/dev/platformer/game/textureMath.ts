/**
 * The per-pixel arithmetic behind textures.ts, with no DOM and no three in
 * it, so it can run in a worker (textures.worker.ts) and leave the main
 * thread free to fetch the models and start the physics while it works.
 */

export type Pixels = { color: Uint8ClampedArray; normal: Uint8ClampedArray };
export type StoneOptions = { size: number; courses: number; tint: [number, number, number]; seed: number; jointDepth: number; relief: number };
export type CarvedOptions = { w: number; h: number; seed: number; tint: [number, number, number]; /** RGBA of the blurred sign mask, w × h */ mask: Uint8ClampedArray };

export type TextureJob = { kind: "stone"; opts: StoneOptions } | { kind: "carved"; opts: CarvedOptions };

export function hash(x: number, y: number, seed: number): number {
  let h = (x * 374761393 + y * 668265263 + seed * 1442695041) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/** Value noise that repeats every `period` lattice cells, so the texture tiles. */
function tileNoise(x: number, y: number, period: number, seed: number): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const w = (n: number) => ((n % period) + period) % period;
  const a = hash(w(xi), w(yi), seed);
  const b = hash(w(xi + 1), w(yi), seed);
  const c = hash(w(xi), w(yi + 1), seed);
  const d = hash(w(xi + 1), w(yi + 1), seed);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

function fbm(u: number, v: number, base: number, octaves: number, seed: number): number {
  let sum = 0;
  let amp = 0.5;
  let freq = base;
  for (let o = 0; o < octaves; o++) {
    sum += amp * tileNoise(u * freq, v * freq, freq, seed + o * 17);
    amp *= 0.5;
    freq *= 2;
  }
  return sum;
}

/** Sobel the height field into a tangent-space normal map. */
function normalsFrom(height: Float32Array, w: number, h: number, strength: number): Uint8ClampedArray {
  const out = new Uint8ClampedArray(w * h * 4);
  const at = (x: number, y: number) => height[((y + h) % h) * w + ((x + w) % w)];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dx = (at(x + 1, y) - at(x - 1, y)) * strength;
      const dy = (at(x, y + 1) - at(x, y - 1)) * strength;
      const inv = 1 / Math.hypot(dx, dy, 1);
      const i = (y * w + x) * 4;
      out[i] = (-dx * inv * 0.5 + 0.5) * 255;
      out[i + 1] = (dy * inv * 0.5 + 0.5) * 255;
      out[i + 2] = (inv * 0.5 + 0.5) * 255;
      out[i + 3] = 255;
    }
  }
  return out;
}

/** Sandstone: soft strata, pitting, and staggered masonry joints. One tile is one square of wall. */
export function stonePixels({ size, courses, tint, seed, jointDepth, relief }: StoneOptions): Pixels {
  const color = new Uint8ClampedArray(size * size * 4);
  const height = new Float32Array(size * size);
  const courseH = 1 / courses;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = x / size;
      const v = y / size;
      const broad = fbm(u, v, 4, 5, seed);
      const strata = fbm(u * 0.35, v, 16, 3, seed + 91);
      // fine, sparse pitting: a speckle, not a pattern
      const pits = Math.pow(hash(x, y, seed + 7), 14);
      const grain = tileNoise(u * 64, v * 64, 64, seed + 8) - 0.5;
      let hgt = 0.55 + (broad - 0.5) * 0.5 + (strata - 0.5) * 0.18 + grain * 0.05 - pits * 0.2;

      // joints: horizontal between courses, vertical staggered by half a block
      let joint = 0;
      if (courses > 0) {
        const row = Math.floor(v / courseH);
        const fv = v / courseH - row;
        const blocks = 2;
        const fu = (u * blocks + (row % 2) * 0.5) % 1;
        const edge = Math.min(fv, 1 - fv) * courseH * size;
        const edgeU = (Math.min(fu, 1 - fu) / blocks) * size;
        const d = Math.min(edge, edgeU);
        joint = 1 - Math.min(1, d / 3.2);
        joint = joint * joint;
        // each block a slightly different shade
        hgt += (hash(row, Math.floor(u * blocks + (row % 2) * 0.5), seed + 3) - 0.5) * 0.06;
      }
      hgt -= joint * jointDepth;
      height[y * size + x] = hgt;

      const shade = 0.8 + (broad - 0.5) * 0.42 + (strata - 0.5) * 0.2 + grain * 0.06 - pits * 0.25 - joint * 0.45;
      const warm = (tileNoise(u * 3, v * 3, 3, seed + 40) - 0.5) * 0.08;
      const i = (y * size + x) * 4;
      color[i] = tint[0] * (shade + warm);
      color[i + 1] = tint[1] * shade;
      color[i + 2] = tint[2] * (shade - warm);
      color[i + 3] = 255;
    }
  }
  return { color, normal: normalsFrom(height, size, size, relief) };
}

/** Carved signs on stone: lowers and darkens the stone under the mask of signs. */
export function carvedPixels({ w, h, seed, tint, mask }: CarvedOptions): Pixels {
  const color = new Uint8ClampedArray(w * h * 4);
  const height = new Float32Array(w * h);
  const period = 8;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const u = x / w;
      const v = y / h;
      const n = fbm(u * (w / h), v, period, 4, seed + 5);
      const m = mask[(y * w + x) * 4] / 255;
      height[y * w + x] = 0.6 + (n - 0.5) * 0.25 - m * 0.55;
      const shade = 0.8 + (n - 0.5) * 0.45 - m * 0.42;
      const i = (y * w + x) * 4;
      color[i] = tint[0] * shade;
      color[i + 1] = tint[1] * shade;
      color[i + 2] = tint[2] * (shade - m * 0.05);
      color[i + 3] = 255;
    }
  }
  return { color, normal: normalsFrom(height, w, h, 7) };
}

export function runJob(job: TextureJob): Pixels {
  return job.kind === "stone" ? stonePixels(job.opts) : carvedPixels(job.opts);
}

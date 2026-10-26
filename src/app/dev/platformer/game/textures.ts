/**
 * Every surface texture is drawn at load time: tileable sandstone with
 * masonry courses, a carved hieroglyph band, a relief panel for the pylons
 * and a palm frond. Each stone texture comes with a normal map derived from
 * its height field, which is what makes the low sun pick out the carving.
 */
import * as THREE from "three";
import { hash, runJob, type Pixels, type StoneOptions, type TextureJob } from "./textureMath";

const GLYPH_FONT = "'Noto Sans Egyptian Hieroglyphs', serif";
// Signs inside the core font subset (noto-egyptian-core.woff2, 10 KB, preloaded by the layout). Keep it so:
// one sign outside it (𓆑 𓈙 𓎡 𓎼 𓆓 were) and the carved textures, and so the whole scene, wait for the 257 KB full font.
const GLYPHS = [..."𓄿𓇋𓂝𓅱𓃀𓊪𓅓𓈖𓂋𓉔𓎛𓐍𓊃𓋴𓏏𓂧𓋹𓇳𓆣𓂀"];

function canvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return [c, c.getContext("2d", { willReadFrequently: true })!];
}

function finish(c: HTMLCanvasElement, srgb: boolean): THREE.CanvasTexture {
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  t.anisotropy = 8;
  t.generateMipmaps = true;
  t.minFilter = THREE.LinearMipmapLinearFilter;
  return t;
}

/**
 * The pixels of one texture. Each is worked out in a worker of its own, so
 * the five of them run side by side and the page stays responsive (the models
 * and the physics load meanwhile). Without workers, the same arithmetic runs here.
 */
function compute(job: TextureJob): Promise<Pixels> {
  return new Promise((resolve) => {
    let worker: Worker | null = null;
    const here = () => {
      worker?.terminate();
      resolve(runJob(job));
    };
    try {
      worker = new Worker(new URL("./textures.worker.ts", import.meta.url));
      worker.onmessage = (e: MessageEvent<Pixels>) => {
        worker?.terminate();
        resolve(e.data);
      };
      worker.onerror = here;
      worker.postMessage(job);
    } catch {
      here();
    }
  });
}

function paint(px: Pixels, w: number, h: number): { map: THREE.CanvasTexture; normalMap: THREE.CanvasTexture } {
  const draw = (data: Uint8ClampedArray, srgb: boolean) => {
    const [c, ctx] = canvas(w, h);
    const img = ctx.createImageData(w, h);
    img.data.set(data);
    ctx.putImageData(img, 0, 0);
    return finish(c, srgb);
  };
  return { map: draw(px.color, true), normalMap: draw(px.normal, false) };
}

/** Sandstone: soft strata, pitting, and staggered masonry joints. One tile is one square of wall. */
async function stone(opts: StoneOptions) {
  return paint(await compute({ kind: "stone", opts }), opts.size, opts.size);
}

/** Carved signs on stone: draws the signs into a mask here (it needs the font), then the stone is lowered and darkened under them. */
async function carve(w: number, h: number, cols: number, rows: number, seed: number, tint: [number, number, number], registers: boolean) {
  const [mc, mctx] = canvas(w, h);
  mctx.fillStyle = "#000";
  mctx.fillRect(0, 0, w, h);
  mctx.fillStyle = "#fff";
  mctx.textAlign = "center";
  mctx.textBaseline = "middle";
  const cw = w / cols;
  const ch = h / rows;
  mctx.font = `${Math.floor(Math.min(cw, ch) * 0.72)}px ${GLYPH_FONT}`;
  for (let r = 0; r < rows; r++) {
    for (let col = 0; col < cols; col++) {
      const g = GLYPHS[Math.floor(hash(col, r, seed) * GLYPHS.length)];
      mctx.fillText(g, (col + 0.5) * cw, (r + 0.52) * ch);
    }
    if (registers) {
      // register lines between rows, as on a temple wall
      mctx.fillRect(0, r * ch, w, Math.max(2, h * 0.006));
    }
  }
  if (registers) mctx.fillRect(0, h - Math.max(2, h * 0.006), w, Math.max(2, h * 0.006));
  // soften the mask a touch so the carving has a bevel
  const [, bctx] = canvas(w, h);
  bctx.filter = "blur(1.6px)";
  bctx.drawImage(mc, 0, 0);
  const mask = bctx.getImageData(0, 0, w, h).data;
  return paint(await compute({ kind: "carved", opts: { w, h, seed, tint, mask } }), w, h);
}

/** One palm frond: a rib with feathered leaflets, alpha cut-out. */
function frond(): THREE.CanvasTexture {
  const [c, ctx] = canvas(256, 512);
  ctx.clearRect(0, 0, 256, 512);
  const grad = ctx.createLinearGradient(0, 512, 0, 0);
  grad.addColorStop(0, "#4d6a2c");
  grad.addColorStop(1, "#8fa04a");
  ctx.strokeStyle = grad;
  ctx.lineCap = "round";
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(128, 512);
  ctx.lineTo(128, 10);
  ctx.stroke();
  for (let i = 0; i < 34; i++) {
    const t = i / 33;
    const y = 500 - t * 480;
    const len = Math.sin(Math.min(1, t * 1.15 + 0.12) * Math.PI) * 118 + 8;
    ctx.lineWidth = 9 - t * 5;
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(128, y);
      ctx.quadraticCurveTo(128 + side * len * 0.55, y - 16, 128 + side * len, y - 34 - t * 20);
      ctx.stroke();
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

export type GameTextures = {
  sandstone: { map: THREE.CanvasTexture; normalMap: THREE.CanvasTexture };
  limestone: { map: THREE.CanvasTexture; normalMap: THREE.CanvasTexture };
  sand: { map: THREE.CanvasTexture; normalMap: THREE.CanvasTexture };
  band: { map: THREE.CanvasTexture; normalMap: THREE.CanvasTexture };
  relief: { map: THREE.CanvasTexture; normalMap: THREE.CanvasTexture };
  frond: THREE.CanvasTexture;
};

let built: Promise<GameTextures> | null = null;

/**
 * Drawn once per visit. The page asks for them as soon as the game's code has arrived, which is before
 * the game itself is mounted, so by then they are usually done (about a second of work, in workers).
 */
export function buildTextures(): Promise<GameTextures> {
  return (built ??= build());
}

async function build(): Promise<GameTextures> {
  // The font is split by unicode-range: asking with the actual signs pulls in the right files.
  // Only the carved textures wait for it; the plain stone starts at once.
  const font = document.fonts.load(`64px ${GLYPH_FONT}`, GLYPHS.join("")).catch(() => null); // (else whatever the OS has)
  const carved = async (...args: Parameters<typeof carve>) => {
    await font;
    return carve(...args);
  };
  const [sandstone, limestone, sand, band, relief] = await Promise.all([
    stone({ size: 512, courses: 4, tint: [214, 168, 112], seed: 11, jointDepth: 0.5, relief: 5 }),
    // limestone doubles as paving: two courses of big flags per tile
    stone({ size: 512, courses: 2, tint: [238, 222, 190], seed: 29, jointDepth: 0.3, relief: 3 }),
    stone({ size: 256, courses: 0, tint: [232, 186, 124], seed: 53, jointDepth: 0, relief: 4 }),
    carved(1024, 128, 8, 1, 71, [226, 190, 132], true),
    carved(1024, 1024, 7, 7, 97, [218, 176, 118], true),
  ]);
  return { sandstone, limestone, sand, band, relief, frond: frond() };
}

/**
 * A box whose UVs are in metres rather than 0–1, so one shared, repeating
 * material looks right on a pillar of any size. `tile` = metres per repeat.
 */
export function worldBox(w: number, h: number, d: number, tileU: number, tileV = tileU): THREE.BoxGeometry {
  const g = new THREE.BoxGeometry(w, h, d);
  const uv = g.attributes.uv as THREE.BufferAttribute;
  // BoxGeometry face order: +x, −x, +y, −y, +z, −z; four vertices each.
  const dims: [number, number][] = [
    [d, h],
    [d, h],
    [w, d],
    [w, d],
    [w, h],
    [w, h],
  ];
  for (let f = 0; f < 6; f++) {
    for (let k = 0; k < 4; k++) {
      const i = f * 4 + k;
      uv.setXY(i, (uv.getX(i) * dims[f][0]) / tileU, (uv.getY(i) * dims[f][1]) / tileV);
    }
  }
  uv.needsUpdate = true;
  return g;
}

/** Hard-edged faces for low-sided cones and cylinders (pyramids, obelisks, pylons). */
export function faceted<T extends THREE.BufferGeometry>(g: T): THREE.BufferGeometry {
  const flat = g.toNonIndexed();
  flat.computeVertexNormals();
  return flat;
}

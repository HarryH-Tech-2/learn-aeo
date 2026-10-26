/**
 * Builds the Cartouche Print's scene papers (public/cartouche-print/) from the generated portrait artwork in
 * scripts/dev/print-art-src/ (GPT Image 2.5 via Higgsfield, 2026-10-18; the seasonal scenes 2026-10-19), the same
 * scenes as the keyboard's finishes, so the picture and the print match. Run once, commit the output:
 *
 *   node scripts/dev/build-print-scene-art.mjs
 *
 * The sources were upscaled to about 2723 × 4096 (Higgsfield's ByteDance upscaler, 2026-10-19) so the posters
 * hold up: each scene is written twice, at 1240 × 1754 (A4 at 150 dpi, as the other papers, for the preview, the
 * PDF download and the A4 print) and at 2724 × 3852 in large/ (about 250 dpi at A3, 175 at A2, 115 at A1), which
 * only the poster artwork Prodigi fetches uses (src/lib/cartouche-print-pdf.ts). Plus a 200 × 283 swatch.
 *
 * A4 is a little taller than the 2:3 source, so the scenes lose a strip of their foreground (the horizon stays
 * low, clear of the name); the treasure frame is squeezed so its border stays whole; Karnak's left half is
 * mirrored into a symmetrical hall with the plain wall in the middle.
 */
import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const SRC = "scripts/dev/print-art-src";
const OUT = "public/cartouche-print";
const SIZES = { normal: [1240, 1754], large: [2724, 3852] };

async function base(id, W, H) {
  if (id === "treasure") return sharp(`${SRC}/${id}.jpg`).resize(W, H, { fit: "fill", kernel: "lanczos3" }).toBuffer();
  if (id === "karnak") {
    const half = await sharp(`${SRC}/${id}.jpg`).resize(W, H, { fit: "cover", kernel: "lanczos3" }).extract({ left: 0, top: 0, width: W / 2, height: H }).toBuffer();
    return sharp({ create: { width: W, height: H, channels: 3, background: "#000" } })
      .composite([
        { input: half, left: 0, top: 0 },
        { input: await sharp(half).flop().toBuffer(), left: W / 2, top: 0 },
      ])
      .png()
      .toBuffer();
  }
  return sharp(`${SRC}/${id}.jpg`).resize(W, H, { fit: "cover", position: "top", kernel: "lanczos3" }).toBuffer();
}

await mkdir(`${OUT}/thumbs`, { recursive: true });
await mkdir(`${OUT}/large`, { recursive: true });
const ids = ["pyramids", "stars", "nile", "treasure", "karnak", "christmas", "abusimbel", "valentine", "mother", "father", "halloween", "newyear"];
for (const id of ids) {
  const b = await base(id, ...SIZES.normal);
  await sharp(b).jpeg({ quality: 86, mozjpeg: true }).toFile(`${OUT}/${id}.jpg`);
  await sharp(b).resize(200, 283).jpeg({ quality: 80, mozjpeg: true }).toFile(`${OUT}/thumbs/${id}.jpg`);
  const big = await base(id, ...SIZES.large);
  await sharp(big).jpeg({ quality: 82, mozjpeg: true }).toFile(`${OUT}/large/${id}.jpg`);
  console.log("wrote", id);
}

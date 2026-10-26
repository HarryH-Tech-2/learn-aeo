/**
 * Builds the keyboard's scene finishes (public/keyboard-styles/) from the generated 16:9 artwork in
 * scripts/dev/keyboard-art-src/ (GPT Image 2.5 via Higgsfield, 2688 × 1520, 2026-10-18). Run once, commit the output:
 *
 *   node scripts/dev/build-keyboard-photo-art.mjs
 *
 * The scenes keep their horizon whole: the 1200 × 630 shape is cut from the top of the sky (or evenly
 * for Karnak's columns). The treasure frame is squeezed to fit rather than cut, so its border stays whole.
 * Each is written at 2400 × 1260 (HD), 1200 × 630 (share) and as a 240 × 126 swatch, like
 * scripts/dev/build-keyboard-style-art.mjs.
 */
import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const SRC = "scripts/dev/keyboard-art-src";
const OUT = "public/keyboard-styles";

/** How each source is brought to 1200 : 630: "top" drops sky, "centre" crops evenly, "fill" squeezes. */
const builds = { pyramids: "top", stars: "top", nile: "top", karnak: "centre", treasure: "fill", christmas: "centre", abusimbel: "top", valentine: "top", mother: "top", father: "top", halloween: "top", newyear: "top" };

await mkdir(`${OUT}/thumbs`, { recursive: true });
for (const [id, mode] of Object.entries(builds)) {
  const resize = (w, h) =>
    sharp(`${SRC}/${id}.jpg`).resize(w, h, { fit: mode === "fill" ? "fill" : "cover", position: mode === "top" ? "bottom" : "centre", kernel: "lanczos3" });
  await resize(2400, 1260).sharpen({ sigma: 0.5 }).jpeg({ quality: 84, mozjpeg: true }).toFile(`${OUT}/${id}.jpg`);
  await resize(1200, 630).jpeg({ quality: 80, mozjpeg: true }).toFile(`${OUT}/${id}-1200.jpg`);
  await resize(240, 126).jpeg({ quality: 80, mozjpeg: true }).toFile(`${OUT}/thumbs/${id}.jpg`);
  console.log("wrote", id);
}

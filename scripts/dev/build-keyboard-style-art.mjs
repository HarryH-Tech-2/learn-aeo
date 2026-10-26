/**
 * Builds the landscape backgrounds for the keyboard's finishes (public/keyboard-styles/) from the
 * Cartouche Print's portrait A4 artwork (public/cartouche-print/). Run once, commit the output:
 *
 *   node scripts/dev/build-keyboard-style-art.mjs
 *
 * Each A4 sheet (1240 × 1754) is cut into a 1240 × 651 landscape (the 1200 × 630 share-image shape)
 * by keeping its top and its foot and dropping the middle, so the borders stay whole. The temple
 * keeps its winged sun and fills the rest with plain sandstone from the middle of the wall. The
 * result is scaled to 2400 × 1260 for the HD image, plus a small swatch thumbnail.
 */
import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const SRC = "public/cartouche-print";
const OUT = "public/keyboard-styles";
const W = 1240;
const H = 651;
const SRC_H = 1754;

const band = (file, top, height) => sharp(`${SRC}/${file}.jpg`).extract({ left: 0, top, width: W, height }).toBuffer();

/** The sheet's top `topH` rows over its last H - topH rows. */
async function topAndFoot(file, topH) {
  const footH = H - topH;
  return sharp({ create: { width: W, height: H, channels: 3, background: "#000" } })
    .composite([
      { input: await band(file, 0, topH), left: 0, top: 0 },
      { input: await band(file, SRC_H - footH, footH), left: 0, top: topH },
    ])
    .png()
    .toBuffer();
}

const builds = {
  papyrus: () => band("papyrus", Math.round((SRC_H - H) / 2), H),
  night: () => topAndFoot("night", 326),
  lotus: () => topAndFoot("lotus", 326),
  temple: async () => {
    const sunH = 236;
    return sharp({ create: { width: W, height: H, channels: 3, background: "#000" } })
      .composite([
        { input: await band("temple", 600, H - sunH), left: 0, top: sunH },
        { input: await band("temple", 0, sunH), left: 0, top: 0 },
      ])
      .png()
      .toBuffer();
  },
};

await mkdir(`${OUT}/thumbs`, { recursive: true });
for (const [id, build] of Object.entries(builds)) {
  const base = await build();
  await sharp(base).resize(2400, 1260, { kernel: "lanczos3" }).sharpen({ sigma: 0.6 }).jpeg({ quality: 84, mozjpeg: true }).toFile(`${OUT}/${id}.jpg`);
  await sharp(base).resize(1200, 630, { kernel: "lanczos3" }).jpeg({ quality: 80, mozjpeg: true }).toFile(`${OUT}/${id}-1200.jpg`);
  await sharp(base).resize(240, 126).jpeg({ quality: 80, mozjpeg: true }).toFile(`${OUT}/thumbs/${id}.jpg`);
  console.log("wrote", id);
}

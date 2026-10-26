/**
 * Builds the site's link preview (public/og-homepage.jpg, 1200 × 630): the Giza sunset from the keyboard's
 * "Pyramids at sunset" finish, the name CLEOPATRA in a cartouche with its letters under the signs, and the
 * offer. A JPEG, not WebP: Messenger and some other previewers show no picture for a WebP og:image.
 * Run once, commit the output:
 *
 *   npx jiti scripts/dev/build-og-image.ts
 */
import { readFile, writeFile } from "node:fs/promises";
import { createElement as h, type CSSProperties, type ReactNode } from "react";
import { ImageResponse } from "next/og.js";
import sharp from "sharp";

const W = 1200;
const H = 630;
const IVORY = "#FFF3D6";
const GOLD = "#F4CF75";

const div = (style: CSSProperties, ...children: ReactNode[]) => h("div", { style: { display: "flex", ...style } }, ...children);

async function main() {
  const [glyphFont, cinzel, art] = await Promise.all([
    readFile("src/app/cartouche-image/noto-egyptian-translator.ttf"),
    readFile("src/app/cartouche-image/cinzel-600.ttf"),
    sharp("scripts/dev/keyboard-art-src/pyramids.jpg").resize(W, H, { fit: "cover", position: "bottom" }).jpeg({ quality: 92 }).toBuffer(),
  ]);

  // CLEOPATRA as the name translator spells it (src/lib/hieroglyph-translator.ts), sign by sign
  const signs = [["𓎡", "C"], ["𓂋", "L"], ["𓇋", "E"], ["𓅱", "O"], ["𓊪", "P"], ["𓄿", "A"], ["𓏏", "T"], ["𓂋", "R"], ["𓄿", "A"]].map(([glyph, letters]) => ({ glyph, letters }));
  const G = 66; // glyph size
  // Thickened outline signs with a warm glow, as on the finish
  const ring = [1, -1].flatMap((d) => [`${d}px 0 0 ${IVORY}`, `0 ${d}px 0 ${IVORY}`]).join(", ");
  const glyphShadow = `${ring}, 0 2px 6px rgba(70,18,40,0.55), 0 0 14px rgba(255,214,140,0.6)`;
  const lift = "0 2px 12px rgba(50,12,30,0.75)";

  const tree = div(
    { width: W, height: H, position: "relative", fontFamily: "Cinzel" },
    h("img", { src: `data:image/jpeg;base64,${art.toString("base64")}`, width: W, height: H, style: { position: "absolute", top: 0, left: 0 } }),
    // Dusk over the top of the sky so the writing reads on any screen
    div({ position: "absolute", top: 0, left: 0, width: W, height: H, backgroundImage: "linear-gradient(180deg, rgba(30,10,40,0.62) 0%, rgba(30,10,40,0.28) 48%, rgba(30,10,40,0) 62%)" }),
    div(
      { position: "absolute", top: 0, left: 0, width: W, flexDirection: "column", alignItems: "center", paddingTop: 34 },
      div({ fontSize: 22, letterSpacing: 7, color: GOLD, textShadow: lift }, "READ & WRITE LIKE A SCRIBE"),
      div({ fontSize: 76, color: IVORY, marginTop: 4, textShadow: `${lift}, 0 0 30px rgba(255,200,120,0.35)` }, "Learn Hieroglyphics"),
      // The cartouche: the rope loop, its tie, and the name with its letters
      div(
        { marginTop: 14, alignItems: "center" },
        div(
          { border: `4px solid ${IVORY}`, borderRadius: 9999, padding: "6px 34px 4px", alignItems: "flex-end", boxShadow: "0 0 18px rgba(255,214,140,0.35)" },
          ...signs.map((s, i) =>
            div(
              { flexDirection: "column", alignItems: "center", marginLeft: i === 0 ? 0 : 6 },
              div({ fontFamily: "Noto Sans Egyptian Hieroglyphs", fontSize: G, lineHeight: 1.15, color: IVORY, textShadow: glyphShadow }, s.glyph),
              div({ fontSize: 19, letterSpacing: 1, color: GOLD, textShadow: lift, marginTop: 0 }, s.letters),
            ),
          ),
        ),
        div({ width: 10, height: 62, marginLeft: 8, border: `4px solid ${IVORY}`, borderRadius: 3 }),
      ),
    ),
    // The offer, on the sand
    div(
      { position: "absolute", left: 0, bottom: 30, width: W, justifyContent: "center" },
      div(
        { background: "rgba(25,10,5,0.62)", border: `1.5px solid ${GOLD}`, padding: "10px 26px", fontSize: 24, letterSpacing: 2, color: IVORY },
        "Type your name in hieroglyphs  ·  Lesson 1 free",
      ),
    ),
  );

  const png = await new ImageResponse(tree, {
    width: W,
    height: H,
    fonts: [
      { name: "Noto Sans Egyptian Hieroglyphs", data: glyphFont, style: "normal", weight: 400 },
      { name: "Cinzel", data: cinzel, style: "normal", weight: 600 },
    ],
  }).arrayBuffer();
  const jpeg = await sharp(Buffer.from(png)).jpeg({ quality: 86, mozjpeg: true }).toBuffer();
  await writeFile("public/og-homepage.jpg", jpeg);
  console.log("wrote public/og-homepage.jpg", jpeg.byteLength, "bytes");
}

main();

import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import sharp from "sharp";
import { cartouchePrintThemeById, type CartouchePrintThemeId } from "@/lib/cartouche-print";
import { PRINT_IMAGE, PRINT_IMAGE_HD, printPageTree } from "@/app/cartouche-image/print-page";

/**
 * Page one of the Cartouche Print as a JPEG (server only). Two sizes:
 *   - share: 1240 × 1754 with the site's address, free (/cartouche-image/print)
 *   - hd:    2480 × 3508 (A4 at 300 dpi) without it, the paid digital image
 *            (/api/cartouche-print/image and the webhook's email)
 *
 * Satori (next/og) can only write PNG, and the artwork papers come out at
 * several MB that way, so sharp re-encodes the page as a JPEG. Fonts and
 * artwork are read from disk (next.config.ts traces them into every route
 * that calls this); the artwork goes in as a data URL so satori never has to
 * fetch anything.
 */

const FONT_DIR = path.join(process.cwd(), "src", "app", "cartouche-image");
const PUBLIC_DIR = path.join(process.cwd(), "public");

let fontsPromise: Promise<{ glyph: Buffer; display: Buffer }> | null = null;
function loadFonts() {
  fontsPromise ??= Promise.all([
    readFile(path.join(FONT_DIR, "noto-egyptian-translator.ttf")),
    readFile(path.join(FONT_DIR, "cinzel-600.ttf")),
  ]).then(([glyph, display]) => ({ glyph, display }));
  return fontsPromise;
}

const artCache = new Map<string, Promise<string>>();
function loadArtDataUrl(publicPath: string): Promise<string> {
  let p = artCache.get(publicPath);
  if (!p) {
    p = readFile(path.join(PUBLIC_DIR, publicPath)).then((b) => `data:image/jpeg;base64,${b.toString("base64")}`);
    artCache.set(publicPath, p);
  }
  return p;
}

export type CartouchePrintImageSize = "share" | "hd";

export async function renderCartouchePrintJpeg(
  // One name, or a family of two to four (stacked on one page).
  name: string | readonly string[],
  paper: CartouchePrintThemeId,
  size: CartouchePrintImageSize = "share",
): Promise<Buffer> {
  const theme = cartouchePrintThemeById(paper);
  const hd = size === "hd";
  const dims = hd ? PRINT_IMAGE_HD : PRINT_IMAGE;
  const [fonts, art] = await Promise.all([loadFonts(), theme.art ? loadArtDataUrl(theme.art) : null]);

  const png = await new ImageResponse(printPageTree(name, paper, art, { size: dims, footer: !hd }), {
    width: dims.width,
    height: dims.height,
    fonts: [
      { name: "Noto Sans Egyptian Hieroglyphs", data: fonts.glyph, style: "normal", weight: 400 },
      { name: "Cinzel", data: fonts.display, style: "normal", weight: 600 },
    ],
  }).arrayBuffer();

  // 300 dpi is written into the file so print dialogs size it as A4 by default.
  const img = sharp(Buffer.from(png)).jpeg({ quality: hd ? 92 : 86, mozjpeg: true });
  return (hd ? img.withMetadata({ density: 300 }) : img).toBuffer();
}

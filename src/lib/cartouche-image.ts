/**
 * Renders a shareable PNG of a name written in hieroglyphs inside a
 * cartouche. Pure 2D canvas — no three.js — so it works on every phone and
 * produces a crisp 1200×630 image (the social-preview aspect ratio).
 */

export const CARTOUCHE_IMAGE = { width: 1200, height: 630 } as const;

export const GLYPH_FONT_FAMILY =
  "'Noto Sans Egyptian Hieroglyphs', 'Segoe UI Historic', serif";

const BRAND = "learnhieroglyphics.com";
const BG = "#0b0b0f";
const GOLD = "#d4a832";
const GOLD_DIM = "rgba(212, 168, 50, 0.55)";
const SAND = "#c4b590";
const SAND_DIM = "#8a8070";

/**
 * Pick a glyph font size so `count` glyphs (each roughly 0.8em wide plus a
 * gap) fit inside `maxWidth`, capped at `maxSize`.
 */
export function fitGlyphFontSize(count: number, maxWidth: number, maxSize = 150): number {
  const n = Math.max(count, 1);
  const perGlyph = 0.8 + 0.12; // approx advance width + gap, in em
  return Math.max(40, Math.min(maxSize, Math.floor(maxWidth / (n * perGlyph))));
}

/** Safe filename for the download, e.g. "harry-cartouche.png". */
export function cartoucheFilename(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return `${slug || "my"}-cartouche.png`;
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

async function waitForGlyphFont(): Promise<void> {
  // Never gate on document.fonts.check(): the webfont can be in an error
  // state and the system fallback still renders. Just give it a chance.
  try {
    const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
    if (fonts?.load) await fonts.load(`64px ${GLYPH_FONT_FAMILY}`);
  } catch {
    /* fall through and paint with whatever font is available */
  }
}

export async function renderCartouchePng(input: {
  name: string;
  glyphs: string;
}): Promise<Blob> {
  await waitForGlyphFont();

  const { width, height } = CARTOUCHE_IMAGE;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  // Solid background (gradients balloon the PNG to ~500 KB; flat is ~40 KB)
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, width, height);
  // Thin gold frame
  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgba(212,168,50,0.25)";
  ctx.strokeRect(24, 24, width - 48, height - 48);

  // Cartouche oval (rounded rect with full-radius ends) + knot bar
  const glyphCount = Array.from(input.glyphs).length;
  const padX = 70;
  const cartW = Math.min(width - 260, Math.max(420, glyphCount * 120 + padX * 2));
  const cartH = 250;
  const cartX = (width - cartW) / 2 - 20;
  const cartY = 120;
  ctx.lineWidth = 6;
  ctx.strokeStyle = GOLD;
  roundedRect(ctx, cartX, cartY, cartW, cartH, cartH / 2);
  ctx.stroke();
  // knot / bar at the right end
  ctx.beginPath();
  ctx.moveTo(cartX + cartW + 14, cartY + cartH / 2 - 44);
  ctx.lineTo(cartX + cartW + 34, cartY + cartH / 2 - 44);
  ctx.lineTo(cartX + cartW + 34, cartY + cartH / 2 + 44);
  ctx.lineTo(cartX + cartW + 14, cartY + cartH / 2 + 44);
  ctx.stroke();

  // Glyphs
  const fontSize = fitGlyphFontSize(glyphCount, cartW - padX * 2, 150);
  ctx.font = `${fontSize}px ${GLYPH_FONT_FAMILY}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "rgba(40,25,5,0.9)";
  ctx.fillText(input.glyphs, cartX + cartW / 2 + 4, cartY + cartH / 2 + 5, cartW - padX);
  ctx.fillStyle = GOLD;
  ctx.fillText(input.glyphs, cartX + cartW / 2, cartY + cartH / 2, cartW - padX);

  // Name label
  ctx.font = "600 34px Georgia, 'Times New Roman', serif";
  ctx.fillStyle = SAND;
  ctx.fillText(input.name.trim().toUpperCase(), width / 2, cartY + cartH + 70, width - 120);

  ctx.font = "22px Georgia, 'Times New Roman', serif";
  ctx.fillStyle = SAND_DIM;
  ctx.fillText("written in ancient Egyptian hieroglyphs", width / 2, cartY + cartH + 112);

  // Branding
  ctx.font = "24px Georgia, 'Times New Roman', serif";
  ctx.fillStyle = GOLD_DIM;
  ctx.fillText(`𓂀  ${BRAND}`, width / 2, height - 46);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("toBlob failed"))), "image/png");
  });
}

export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

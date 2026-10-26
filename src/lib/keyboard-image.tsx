import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import sharp from "sharp";
import {
  cardSize,
  CARTOUCHE,
  LETTERS,
  cardLayout,
  glyphShadow,
  glyphStroke,
  inkFor,
  keyboardStyleById,
  type KeyboardStyleId,
  type CardSpell,
  type KeyboardTemplateId,
} from "@/lib/keyboard-card";

/**
 * The keyboard's card as a JPEG (server only), drawn by satori from the same layout as the live wall
 * (src/lib/keyboard-card.ts). Two sizes:
 *   - share: 1200 × 630 with the site's address, free (/keyboard-image, the secret message's preview,
 *            the "email it to me" attachment)
 *   - hd:    2400 × 1260 without it, bought (/api/keyboard-image/hd) or free to course members
 * Fonts and artwork come off disk as in src/lib/cartouche-print-image.tsx (next.config.ts traces them).
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
function loadArt(publicPath: string): Promise<string> {
  let p = artCache.get(publicPath);
  if (!p) {
    p = readFile(path.join(PUBLIC_DIR, publicPath)).then((b) => `data:image/jpeg;base64,${b.toString("base64")}`);
    artCache.set(publicPath, p);
  }
  return p;
}

export type KeyboardImageSize = "share" | "hd";

function cardTree(typed: string[], styleId: KeyboardStyleId, templateId: KeyboardTemplateId, spell: CardSpell, letters: boolean, art: string | null, hd: boolean, from: string) {
  const style = keyboardStyleById(styleId);
  const { width, height } = cardSize(style, hd);
  const k = width / cardSize(style).width;
  const L = cardLayout(typed, styleId, templateId, spell, letters, from);
  const glyph = L.glyph * k;
  const box = { x: L.box.x * k, y: L.box.y * k, w: L.box.w * k, h: L.box.h * k };
  // satori takes px, so the lift is scaled with the card
  const lift = style.lift ? { textShadow: style.lift.replace(/(\d+(?:\.\d+)?)px/g, (_, n) => `${Number(n) * k}px`) } : {};

  return (
    <div style={{ width, height, display: "flex", position: "relative", background: style.page, fontFamily: "Cinzel" }}>
      {art ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={art} alt="" width={width} height={height} style={{ position: "absolute", top: 0, left: 0, width, height }} />
      ) : null}
      {style.frame ? (
        <>
          <div style={{ position: "absolute", left: 36 * k, top: 36 * k, width: width - 72 * k, height: height - 72 * k, border: `${3 * k}px solid #d4a832` }} />
          <div style={{ position: "absolute", left: 48 * k, top: 48 * k, width: width - 96 * k, height: height - 96 * k, border: `${1 * k}px solid #d4a832` }} />
        </>
      ) : null}
      <div
        style={{
          position: "absolute",
          left: box.x,
          top: box.y,
          width: box.w,
          height: box.h,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {L.headingText ? (
          <div style={{ display: "flex", fontSize: L.heading * k, color: style.heading, letterSpacing: 2 * k, marginBottom: L.heading * k * 0.35, ...lift }}>
            {L.headingText}
          </div>
        ) : null}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            position: "relative",
            ...(L.cartouche
              ? {
                  border: `${Math.max(2, glyph * CARTOUCHE.rope)}px solid ${style.heading}`,
                  borderRadius: 9999,
                  // upright in a column: the tie goes under the foot
                  padding: L.column ? `${glyph * CARTOUCHE.padX}px ${glyph * CARTOUCHE.padY}px` : `${glyph * CARTOUCHE.padY}px ${glyph * CARTOUCHE.padX}px`,
                  ...(L.column ? {} : { marginRight: glyph * CARTOUCHE.tie }),
                }
              : {}),
          }}
        >
          {L.lines.map((line, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-end", fontFamily: "Noto Sans Egyptian Hieroglyphs", fontSize: glyph, lineHeight: 1.3 }}>
              {line.map((g, j) => {
                if (g === " ") return <div key={j} style={{ display: "flex", width: glyph * 0.5 }} />;
                const ink = inkFor(style, g);
                const shadow = glyphShadow(style, ink, glyph);
                const stroke = glyphStroke(style, ink, glyph);
                const sign = (
                  <div key={j} style={{ display: "flex", color: ink, ...(shadow ? { textShadow: shadow } : {}), ...(stroke ? { WebkitTextStroke: stroke } : {}) }}>
                    {g}
                  </div>
                );
                if (!letters) return sign;
                // The sign over its letters, centred on each other
                return (
                  <div key={j} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    {sign}
                    <div
                      style={{
                        display: "flex",
                        fontFamily: "Cinzel",
                        fontSize: glyph * LETTERS.size,
                        lineHeight: 1,
                        height: glyph * LETTERS.line,
                        color: style.caption,
                        letterSpacing: glyph * LETTERS.size * 0.08,
                        ...lift,
                      }}
                    >
                      {L.letters[i]?.[j] ?? ""}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
          {L.cartouche && !L.column ? (
            // The tie across the end of the loop
            <div
              style={{
                position: "absolute",
                right: -glyph * CARTOUCHE.tie,
                top: "18%",
                height: "64%",
                width: glyph * CARTOUCHE.tie * 0.6,
                border: `${Math.max(2, glyph * CARTOUCHE.rope)}px solid ${style.heading}`,
                borderRadius: glyph * 0.04,
              }}
            />
          ) : null}
        </div>
        {L.cartouche && L.column ? (
          // Upright, the tie sits under the foot: drawn in the flow, centred (satori misplaces a %-positioned one here)
          <div
            style={{
              display: "flex",
              width: glyph * 0.8,
              height: glyph * CARTOUCHE.tie * 0.6,
              marginTop: glyph * 0.03,
              border: `${Math.max(2, glyph * CARTOUCHE.rope)}px solid ${style.heading}`,
              borderRadius: glyph * 0.04,
            }}
          />
        ) : null}
        {L.captionText ? (
          <div style={{ display: "flex", fontSize: L.caption * k, color: style.caption, letterSpacing: L.caption * k * 0.3, marginTop: L.caption * k * 0.6, ...lift }}>
            {L.captionText}
          </div>
        ) : null}
        {L.noteLines.map((line, i) => (
          <div key={i} style={{ display: "flex", fontSize: L.note * k, color: style.caption, letterSpacing: L.note * k * 0.06, marginTop: L.note * k * (i === 0 ? 0.7 : 0.25), ...lift }}>
            {line}
          </div>
        ))}
      </div>
      {!hd ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            width,
            top: style.footerY !== undefined ? style.footerY * height : Math.min(box.y + box.h + 0.025 * height, height - 0.07 * height),
            display: "flex",
            justifyContent: "center",
            fontSize: 19 * k,
            color: style.footer,
            letterSpacing: 1,
            ...lift,
          }}
        >
          {/* a tall card has no room for the full address on one line */}
          {style.portrait ? "learnhieroglyphics.com" : spell === "name" ? "learnhieroglyphics.com/translate-name-to-hieroglyphics" : "learnhieroglyphics.com/hieroglyphics-keyboard"}
        </div>
      ) : null}
    </div>
  );
}

export async function renderKeyboardJpeg(
  typed: string[],
  style: KeyboardStyleId,
  template: KeyboardTemplateId = "none",
  size: KeyboardImageSize = "share",
  spell: CardSpell = "keys",
  letters = false,
  from = "",
): Promise<Buffer> {
  const hd = size === "hd";
  const s = keyboardStyleById(style);
  const dims = cardSize(s, hd);
  const artPath = hd ? s.art : s.art1200;
  const [fonts, art] = await Promise.all([loadFonts(), artPath ? loadArt(artPath) : null]);
  const png = await new ImageResponse(cardTree(typed, style, template, spell, letters, art, hd, from), {
    width: dims.width,
    height: dims.height,
    fonts: [
      { name: "Noto Sans Egyptian Hieroglyphs", data: fonts.glyph, style: "normal", weight: 400 },
      { name: "Cinzel", data: fonts.display, style: "normal", weight: 600 },
    ],
  }).arrayBuffer();
  return sharp(Buffer.from(png)).jpeg({ quality: hd ? 92 : 86, mozjpeg: true }).toBuffer();
}

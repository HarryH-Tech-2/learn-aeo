import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { normaliseShareName } from "@/lib/share";
import { transliterateName, getTransliteration } from "@/lib/hieroglyph-translator";
import { CARTOUCHE_IMAGE } from "@/lib/cartouche-image";

/**
 * Social-preview image for a shared cartouche link:
 *   /cartouche-image?name=Cleopatra
 * (Page one of the Cartouche Print on its paper, the share image, is the
 * sibling route /cartouche-image/print: same fonts, Node runtime, JPEG.)
 * Lives outside /api because robots.txt disallows /api/ and some link
 * previewers honour that when fetching og:image.
 *
 * Rendered with satori (next/og), so styling is the flexbox + gradient subset
 * of CSS: no grid, no pseudo-elements, no gradient borders (faked by nesting).
 */

// Edge: `new URL(..., import.meta.url)` asset fetching for ImageResponse fonts
// is only wired up on the Edge runtime (on Node it becomes a relative path).
export const runtime = "edge";

// Fonts (both OFL). The hieroglyph file is a subset of Noto Sans Egyptian
// Hieroglyphs v30 holding the translator's 19 signs; Cinzel is subset to Latin.
// Regenerate with the fontTools scripts if the translator's mappings change.
let glyphFontPromise: Promise<ArrayBuffer> | null = null;
let displayFontPromise: Promise<ArrayBuffer> | null = null;
function loadFonts() {
  glyphFontPromise ??= fetch(new URL("./noto-egyptian-translator.ttf", import.meta.url)).then((r) =>
    r.arrayBuffer()
  );
  displayFontPromise ??= fetch(new URL("./cinzel-600.ttf", import.meta.url)).then((r) => r.arrayBuffer());
  return Promise.all([glyphFontPromise, displayFontPromise]);
}

const BG = "#08080c";
const GOLD = "#d4a832";
const GOLD_TEXT = "linear-gradient(180deg, #f7e3a1 0%, #d4a832 55%, #a67c1e 100%)";
const GOLD_METAL = "linear-gradient(135deg, #f3d886 0%, #b98a2a 38%, #f6e2a0 62%, #8f6a1b 100%)";
const SAND = "#e8dcc0";
const SAND_DIM = "#8d846f";

function Corner({ pos }: { pos: "tl" | "tr" | "bl" | "br" }) {
  const size = 44;
  const style: Record<string, string | number> = {
    position: "absolute",
    width: size,
    height: size,
    borderColor: "rgba(212,168,50,0.75)",
    borderStyle: "solid",
    borderWidth: 0,
  };
  if (pos.startsWith("t")) {
    style.top = 30;
    style.borderTopWidth = 3;
  } else {
    style.bottom = 30;
    style.borderBottomWidth = 3;
  }
  if (pos.endsWith("l")) {
    style.left = 30;
    style.borderLeftWidth = 3;
  } else {
    style.right = 30;
    style.borderRightWidth = 3;
  }
  return <div style={style} />;
}

export async function GET(req: NextRequest) {
  const requested = normaliseShareName(req.nextUrl.searchParams.get("name"));
  const isPlaceholder = requested === null;
  const name = requested ?? "Cleopatra";
  const glyphs = transliterateName(name)
    .map((r) => r.mapping.glyph)
    .join("");
  const translit = getTransliteration(name);
  const { width, height } = CARTOUCHE_IMAGE;
  const glyphCount = Math.max([...glyphs].length, 1);
  // Noto's hieroglyphs are wide (birds run to ~1.2em), so size for the worst
  // case; the inner oval has no max-width, it just grows with the row.
  const glyphSize = Math.max(38, Math.min(140, Math.floor(860 / (glyphCount * 1.25))));
  // Long names shrink the headline so the whole card still breathes.
  const nameSize = name.length > 18 ? 48 : name.length > 12 ? 60 : 72;
  const [glyphFont, displayFont] = await loadFonts();
  const fonts = [
    { name: "Noto Sans Egyptian Hieroglyphs", data: glyphFont, style: "normal" as const, weight: 400 as const },
    { name: "Cinzel", data: displayFont, style: "normal" as const, weight: 600 as const },
  ];
  // A name always renders the same image, so let the CDN keep it.
  const headers = {
    "Cache-Control": "public, max-age=86400, s-maxage=31536000, stale-while-revalidate=604800",
  };

  return new ImageResponse(
    (
      <div
        style={{
          width,
          height,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          background: BG,
          backgroundImage:
            "radial-gradient(ellipse 70% 60% at 50% 42%, rgba(212,168,50,0.22) 0%, rgba(212,168,50,0.06) 45%, rgba(8,8,12,0) 72%), linear-gradient(180deg, #0c0c12 0%, #08080c 60%, #050507 100%)",
          // "sans serif" is the bundled Latin fallback next/og ships (Noto Sans).
          fontFamily: "sans serif",
          color: SAND,
        }}
      >
        {/* Hairline frame + inscribed corners */}
        <div
          style={{
            position: "absolute",
            top: 30,
            left: 30,
            right: 30,
            bottom: 30,
            border: "1px solid rgba(212,168,50,0.22)",
            display: "flex",
          }}
        />
        <Corner pos="tl" />
        <Corner pos="tr" />
        <Corner pos="bl" />
        <Corner pos="br" />

        {/* Kicker with rules */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: 30 }}>
          <div
            style={{
              width: 120,
              height: 1,
              background: "linear-gradient(90deg, rgba(212,168,50,0) 0%, rgba(212,168,50,0.8) 100%)",
            }}
          />
          <div
            style={{
              display: "flex",
              margin: "0 22px",
              fontFamily: "Cinzel",
              fontSize: 20,
              letterSpacing: 7,
              color: GOLD,
            }}
          >
            {isPlaceholder ? "WRITE YOUR NAME IN HIEROGLYPHS" : "THE CARTOUCHE OF"}
          </div>
          <div
            style={{
              width: 120,
              height: 1,
              background: "linear-gradient(90deg, rgba(212,168,50,0.8) 0%, rgba(212,168,50,0) 100%)",
            }}
          />
        </div>

        {/* Cartouche: gradient "metal" ring (outer) around an inked oval (inner) */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              display: "flex",
              padding: 7,
              borderRadius: 999,
              backgroundImage: GOLD_METAL,
              boxShadow: "0 0 90px rgba(212,168,50,0.30), 0 18px 50px rgba(0,0,0,0.6)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minWidth: 460,
                padding: "34px 64px",
                borderRadius: 999,
                backgroundImage: "linear-gradient(180deg, #15151d 0%, #0b0b10 100%)",
                boxShadow: "inset 0 2px 18px rgba(0,0,0,0.9), inset 0 0 0 1px rgba(255,255,255,0.04)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontFamily: "Noto Sans Egyptian Hieroglyphs",
                  fontSize: glyphSize,
                  lineHeight: 1,
                  letterSpacing: Math.round(glyphSize * 0.08),
                  whiteSpace: "nowrap",
                  backgroundImage: GOLD_TEXT,
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                {glyphs}
              </div>
            </div>
          </div>
          {/* The rope tie that closes a cartouche */}
          <div style={{ display: "flex", alignItems: "center", marginLeft: 10 }}>
            <div style={{ width: 14, height: 8, backgroundImage: GOLD_METAL }} />
            <div
              style={{
                width: 24,
                height: 120,
                borderRadius: 8,
                backgroundImage: GOLD_METAL,
                boxShadow: "0 0 40px rgba(212,168,50,0.25), 0 10px 30px rgba(0,0,0,0.6)",
              }}
            />
          </div>
        </div>

        {/* Name */}
        <div
          style={{
            display: "flex",
            marginTop: 34,
            fontFamily: "Cinzel",
            fontSize: nameSize,
            letterSpacing: 6,
            lineHeight: 1.1,
            backgroundImage: GOLD_TEXT,
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          {isPlaceholder ? "Your Name" : name}
        </div>

        {/* Transliteration pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginTop: 14,
            padding: "6px 18px",
            border: "1px solid rgba(212,168,50,0.35)",
            borderRadius: 999,
            fontFamily: "sans serif",
            fontSize: 24,
            letterSpacing: 3,
            color: SAND,
          }}
        >
          {isPlaceholder ? "the 25 signs Egypt used for foreign names" : translit}
        </div>

        {/* Brand */}
        <div
          style={{
            position: "absolute",
            bottom: 46,
            display: "flex",
            alignItems: "center",
            fontSize: 20,
            letterSpacing: 3,
          }}
        >
          <div style={{ display: "flex", fontFamily: "Cinzel", color: GOLD }}>LEARNHIEROGLYPHICS.COM</div>
          <div style={{ display: "flex", margin: "0 14px", color: "rgba(212,168,50,0.6)" }}>·</div>
          <div style={{ display: "flex", fontFamily: "sans serif", color: SAND_DIM }}>
            {isPlaceholder ? "free name translator" : "write yours free"}
          </div>
        </div>
      </div>
    ),
    { width, height, fonts, headers }
  );
}

// Site-wide ban on the old Egyptian/hieroglyph theme (this site was forked from
// a hieroglyphics course). Walks every file git knows about (tracked, plus untracked
// files that are not ignored) outside docs/ and .superpowers/, and public/ filenames.
import { describe, it, expect } from "vitest";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(__dirname, "../../..");
// Historic plans and specs, out of scope.
const SKIP_PREFIXES = ["docs/", ".superpowers/"];
// Binary files, skipped by extension; everything else is read as text.
const BINARY_EXT = new Set([
  ".png", ".jpg", ".jpeg", ".gif", ".webp", ".avif", ".ico", ".bmp", ".woff", ".woff2", ".ttf", ".otf",
  ".eot", ".mp4", ".webm", ".mov", ".mp3", ".wav", ".ogg", ".pdf", ".zip", ".gz", ".glb", ".wasm",
]);

function gitFiles(): string[] {
  const out = execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard", "-z"], {
    cwd: ROOT,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  return [...new Set(out.split("\0").filter(Boolean))]
    .filter((r) => !SKIP_PREFIXES.some((p) => r.startsWith(p)))
    .filter((r) => fs.existsSync(path.join(ROOT, r)));
}

// Exact paths whose content legitimately contains the words (their own word lists,
// or Egypt as a country in the PPP data).
const ALLOW = new Set([
  "src/lib/__tests__/no-egypt.test.ts",
  "src/lib/__tests__/lesson-content.test.ts",
  "src/lib/__tests__/no-legacy-lessons.test.ts",
  "src/lib/__tests__/removed-routes.test.ts",
  "src/lib/__tests__/no-sibling-strings.test.ts",
  "src/lib/ppp.ts",
  "src/lib/__tests__/ppp.test.ts",
]);

const WORDS = [
  String.raw`egypt\w*`, String.raw`\w*glyph\w*`, String.raw`papyr\w*`, String.raw`pharaoh\w*`, "tombs?",
  String.raw`cartouche\w*`, "scribe[sd]?", "scribal", "expeditions?", "chambers?", "ankhs?", "rosetta",
  "nile", "tutankhamun", "horus", "scarabs?", "dig", "digs", "digging", "diggers?", "thoth", "anubis", "karnak", "mumm(?:y|ies)",
  String.raw`valley\s+of\s+the\s+kings`, String.raw`book\s+of\s+the\s+dead`, String.raw`archaeolog\w*`,
  String.raw`egyptolog\w*`, "courtyards?", "hypostyle", "sanctum", "chapels?", "treasury",
  String.raw`royal\s+hall`, String.raw`segoe\s+ui\s+historic`, "temples?", "obelisks?", String.raw`sphinx(?:es)?`,
  "osiris", "isis", String.raw`sarcophag\w*`, "giza", "luxor", String.raw`(?<!inverted[\s-]+)pyramids?`, "scholars?",
];
const ANY_CASE = new RegExp(String.raw`(?<!\w)(?:${WORDS.join("|")})(?!\w)`, "i");
// The sun god, capitalized only: lowercase "ra" turns up in ordinary code.
const CAPITALISED = /(?<!\w)Ra(?!\w)/;
const BANNED = {
  exec: (s: string) => ANY_CASE.exec(s) ?? CAPITALISED.exec(s),
  test: (s: string) => ANY_CASE.test(s) || CAPITALISED.test(s),
};
// U+13000-U+1342F as raw characters, or as numeric entities, \u{...} escapes,
// UTF-16 surrogate-pair escapes (𓀀) or CSS escapes (\13000).
const RAW_GLYPH = /[\u{13000}-\u{1342F}]/u;
const ESCAPE = new RegExp(
  [
    String.raw`&#x([0-9a-f]{4,6});`,
    String.raw`&#(\d{5,7});`,
    String.raw`\\u\{([0-9a-f]{4,6})\}`,
    String.raw`\\u(d[89ab][0-9a-f]{2})\\u(d[c-f][0-9a-f]{2})`,
    String.raw`\\([0-9a-f]{5,6})(?![0-9a-f])`,
  ].join("|"),
  "gi"
);

function escapedGlyph(text: string): string | null {
  for (const m of text.matchAll(ESCAPE)) {
    let cp: number;
    if (m[1]) cp = parseInt(m[1], 16);
    else if (m[2]) cp = parseInt(m[2], 10);
    else if (m[3]) cp = parseInt(m[3], 16);
    else if (m[4]) cp = 0x10000 + ((parseInt(m[4], 16) - 0xd800) << 10) + (parseInt(m[5], 16) - 0xdc00);
    else cp = parseInt(m[6], 16);
    if (cp >= 0x13000 && cp <= 0x1342f) return m[0];
  }
  return null;
}

describe("no Egyptian references anywhere", () => {
  const all = gitFiles();
  const textFiles = all.filter((r) => !BINARY_EXT.has(path.extname(r).toLowerCase()));

  it("walks a sensible number of files, root files included", () => {
    expect(textFiles.length).toBeGreaterThan(100);
    for (const f of ["README.md", "package.json", "next.config.ts", "src/components/home/city-scene.ts"]) expect(textFiles).toContain(f);
    expect(textFiles.some((r) => SKIP_PREFIXES.some((p) => r.startsWith(p)))).toBe(false);
  });

  it("no banned word or hieroglyph character in any text file", () => {
    const hits: string[] = [];
    for (const r of textFiles) {
      if (ALLOW.has(r)) continue;
      const lines = fs.readFileSync(path.join(ROOT, r), "utf8").split(/\r?\n/);
      lines.forEach((line, i) => {
        const m = BANNED.exec(line);
        if (m) hits.push(`${r}:${i + 1} word "${m[0]}"`);
        else if (RAW_GLYPH.test(line)) hits.push(`${r}:${i + 1} hieroglyph character`);
        else {
          const esc = escapedGlyph(line);
          if (esc) hits.push(`${r}:${i + 1} hieroglyph escape ${esc}`);
        }
      });
    }
    expect(hits).toEqual([]);
  });

  it("no filename under public/ contains a banned word", () => {
    const bad = all
      .filter((r) => r.startsWith("public/"))
      .filter((r) => BANNED.test(path.basename(r).replace(/[._-]+/g, " ")));
    expect(bad).toEqual([]);
  });

  it("the matcher itself behaves", () => {
    for (const s of [
      "Egypt", "hieroglyphs", "a scribe", "the Tomb", "Royal  Hall", "dig deeper", "an Egyptian scribe",
      'fontFamily: "Noto Sans Egyptian Hieroglyphs"', "footer-egypt", "the glyph-font class",
      "Unlock the next chamber", "the chapel", "the treasury", "an expedition", "Segoe UI Historic",
      "digging", "digs", "Thoth", "Anubis", "Karnak", "a mummy", "mummies", "Valley of the Kings", "Book of the Dead",
      "Ra", "the eye of Ra", "a temple", "Temples", "an obelisk", "obelisks", "the Sphinx", "sphinxes", "Osiris", "Isis",
      "a sarcophagus", "sarcophagi", "Giza", "Luxor", "a pyramid", "the Pyramids", "a scholar", "scholars",
    ])
      expect(BANNED.test(s), s).toBe(true);
    for (const s of [
      "describe", "subscribe", "digital", "digest", "inverted pyramid", "subscribed", "the inverted pyramids",
      "Inverted  pyramid", "inverted-pyramid order", "/articles/inverted-pyramid/", "ra", "rate", "Rachel", "array", "extra", "contemporary", "crisis", "scholarship",
      "templates", "template literal",
    ])
      expect(BANNED.test(s), s).toBe(false);
    expect(RAW_GLYPH.test(String.fromCodePoint(0x13080))).toBe(true);
    expect(escapedGlyph("&#x13080;")).toBeTruthy();
    expect(escapedGlyph("&#77952;")).toBeTruthy();
    const bs = String.fromCharCode(92);
    expect(escapedGlyph("String.raw`" + bs + "u{13080}`")).toBeTruthy();
    expect(escapedGlyph("&#x2014;")).toBeNull();
    // UTF-16 surrogate pairs
    expect(escapedGlyph(`"${bs}uD80C${bs}uDC00"`)).toBeTruthy(); // U+13000
    expect(escapedGlyph(`"${bs}ud80d${bs}udc2f"`)).toBeTruthy(); // U+1342F
    expect(escapedGlyph(`"${bs}uD80D${bs}uDC30"`)).toBeNull(); // U+13430, past the block
    expect(escapedGlyph(`"${bs}uD83D${bs}uDE00"`)).toBeNull(); // an emoji
    // CSS escapes
    expect(escapedGlyph(`content: "${bs}13000";`)).toBeTruthy();
    expect(escapedGlyph(`content: "${bs}1342F";`)).toBeTruthy();
    expect(escapedGlyph(`content: "${bs}013080 ";`)).toBeTruthy();
    expect(escapedGlyph(`content: "${bs}2014";`)).toBeNull();
    expect(escapedGlyph(`content: "${bs}13430";`)).toBeNull();
  });
});

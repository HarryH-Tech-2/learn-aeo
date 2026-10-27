// Site-wide ban on the old Egyptian/hieroglyph theme (this site was forked from
// a hieroglyphics course). Walks shipped files and public/ filenames.
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(__dirname, "../../..");
const ROOTS = ["src", "scripts", "prisma", "public"];
const ROOT_FILES = ["README.md", "next.config.ts", "vercel.json", "package.json"];
const TEXT_EXT = new Set([
  ".ts", ".tsx", ".js", ".mjs", ".cjs", ".json", ".txt", ".xml", ".webmanifest", ".svg",
  ".css", ".md", ".prisma", ".html", ".yml", ".yaml",
]);
const IGNORE_DIRS = new Set(["node_modules", ".next"]);

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
  "nile", "tutankhamun", "horus", "scarabs?", "dig", "diggers?", String.raw`archaeolog\w*`,
  String.raw`egyptolog\w*`, "courtyards?", "hypostyle", "sanctum", "chapels?", "treasury",
  String.raw`royal\s+hall`, String.raw`segoe\s+ui\s+historic`,
];
const BANNED = new RegExp(String.raw`(?<!\w)(?:${WORDS.join("|")})(?!\w)`, "i");
// U+13000-U+1342F as raw characters, or as numeric entities / \u{...} escapes.
const RAW_GLYPH = /[\u{13000}-\u{1342F}]/u;
const ESCAPE = /(?:&#x([0-9a-f]{4,6});|&#(\d{5,7});|\\u\{([0-9a-f]{4,6})\})/gi;

function escapedGlyph(text: string): string | null {
  for (const m of text.matchAll(ESCAPE)) {
    const cp = m[1] ? parseInt(m[1], 16) : m[2] ? parseInt(m[2], 10) : parseInt(m[3], 16);
    if (cp >= 0x13000 && cp <= 0x1342f) return m[0];
  }
  return null;
}

function walk(dir: string, out: string[]): void {
  if (!fs.existsSync(dir)) return;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (IGNORE_DIRS.has(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, out);
    else out.push(full);
  }
}
const rel = (p: string) => path.relative(ROOT, p).split(path.sep).join("/");

describe("no Egyptian references anywhere", () => {
  const all: string[] = [];
  for (const d of ROOTS) walk(path.join(ROOT, d), all);
  for (const f of ROOT_FILES) if (fs.existsSync(path.join(ROOT, f))) all.push(path.join(ROOT, f));
  const textFiles = all.filter((f) => TEXT_EXT.has(path.extname(f).toLowerCase()));

  it("walks a sensible number of files", () => {
    expect(textFiles.length).toBeGreaterThan(100);
  });

  it("no banned word or hieroglyph character in any text file", () => {
    const hits: string[] = [];
    for (const file of textFiles) {
      const r = rel(file);
      if (ALLOW.has(r)) continue;
      const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
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
      .map(rel)
      .filter((r) => r.startsWith("public/"))
      .filter((r) => BANNED.test(path.basename(r).replace(/[._-]+/g, " ")));
    expect(bad).toEqual([]);
  });

  it("the matcher itself behaves", () => {
    for (const s of ["Egypt", "hieroglyphs", "a scribe", "the Tomb", "Royal  Hall", "dig deeper"])
      expect(BANNED.test(s), s).toBe(true);
    for (const s of ["describe", "subscribe", "digital", "inverted pyramid", "subscribed"])
      expect(BANNED.test(s), s).toBe(false);
    expect(escapedGlyph("&#x13080;")).toBeTruthy();
    expect(escapedGlyph("&#77952;")).toBeTruthy();
    expect(escapedGlyph("&#x2014;")).toBeNull();
  });
});

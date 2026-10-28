// Site-wide US spelling (Harry, 2026-10-28). Walks every file git knows about (tracked,
// plus untracked files that are not ignored) outside docs/ and .superpowers/, and fails on
// British spellings, inside identifiers too (summariseX is caught).
import { describe, it, expect } from "vitest";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { LESSON_CATALOG } from "@/lib/lesson-catalog";
import { cancelUrlFor } from "@/lib/checkout-return";

const ROOT = path.resolve(__dirname, "../../..");
const SKIP_PREFIXES = ["docs/", ".superpowers/"];
const BINARY_EXT = new Set([
  ".png", ".jpg", ".jpeg", ".gif", ".webp", ".avif", ".ico", ".bmp", ".woff", ".woff2", ".ttf", ".otf",
  ".eot", ".mp4", ".webm", ".mov", ".mp3", ".wav", ".ogg", ".pdf", ".zip", ".gz", ".glb", ".wasm",
]);
// This file's own word list, and third-party package metadata.
const ALLOW_FILES = new Set(["src/lib/__tests__/us-spelling.test.ts", "package-lock.json"]);
// Text quoted verbatim from a source keeps its spelling.
const ALLOW_PHRASES = [/driving licence/gi, /aria-labelledby/g];

// British stems, matched case-sensitively as lowercase or Capitalized: caught anywhere in a word,
// camelCase identifiers included (summariseX, nameColour, unoptimised), without false hits across a
// camelCase join (recentReminder is "centRe").
const STEMS = [
  "optimis", "organis", "prioritis", "summaris", "recognis", "personalis", "customis", "authoris", "apologis",
  "categoris", "minimis", "maximis", "standardis", "utilis", "visualis", String.raw`realis(?:e|ed|es|ing|ation)`,
  String.raw`analys(?:e|ed|ing)(?![a-z])`, "programme", "behaviour", "colour", "favour", "honour", "labour",
  "neighbour", "centre", "licence", "catalogue", String.raw`cancell(?:ed|ing)`, String.raw`travell(?:ed|ing|er)`,
  "enrol(?!l)", "fulfil(?!l)", "judgement", String.raw`grey(?![a-z])`, "whilst", "amongst", String.raw`learnt(?![a-z])`,
  "defence", "practis", ...["label", "signal", "model", "level", "fuel", "total", "counsel", "channel"].map((w) => `${w}l(?:ed|ing)`),
  "litre", "metre", "fibre", "theatre", String.raw`towards(?![a-z])`, "flavour", "humour", "rumour", "endeavour", "rigour",
  "manoeuvr", "sceptic", "artefact", "acknowledgement", "offence", "enquir", "normalis", "serialis", "capitalis",
  "sanitis", "finalis", "initialis", "memoris", "specialis", "synchronis", "tokenis", "localis", "stabilis", "criticis",
  "randomis", "monetis", "modernis", "privatis", "publicis", "regularis", "socialis", "trivialis",
];
const BRITISH = new RegExp(
  STEMS.map((s) => `[${s[0]}${s[0].toUpperCase()}]${s.slice(1)}`).join("|")
);

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

describe("US spelling everywhere", () => {
  const textFiles = gitFiles().filter((r) => !BINARY_EXT.has(path.extname(r).toLowerCase()));

  it("walks a sensible number of files", () => {
    expect(textFiles.length).toBeGreaterThan(100);
  });

  it("has no British spellings in shipped files", () => {
    const hits: string[] = [];
    for (const rel of textFiles) {
      if (ALLOW_FILES.has(rel)) continue;
      const lines = fs.readFileSync(path.join(ROOT, rel), "utf8").split(/\r?\n/);
      lines.forEach((raw, i) => {
        const line = ALLOW_PHRASES.reduce((s, re) => s.replace(re, ""), raw);
        const m = BRITISH.exec(line);
        if (m) hits.push(`${rel}:${i + 1}: ${m[0]}`);
      });
    }
    expect(hits).toEqual([]);
  });

  it("leaves the ARIA attribute aria-labelledby alone (it is spelled that way in the spec)", () => {
    const broken = textFiles.filter((rel) => !ALLOW_FILES.has(rel) && fs.readFileSync(path.join(ROOT, rel), "utf8").includes("aria-" + "labeledby"));
    expect(broken).toEqual([]);
    expect(BRITISH.test(`<div aria-labelledby="x">`.replace(ALLOW_PHRASES[1], ""))).toBe(false);
  });

  it("uses US slugs and query values", () => {
    expect(LESSON_CATALOG.some((l) => /programme/.test(l.id))).toBe(false);
    expect(LESSON_CATALOG.map((l) => l.id)).toContain("running-an-aeo-program");
    expect(cancelUrlFor("https://www.learnaeo.com", "/pricing")).toContain("checkout=canceled");
  });
});

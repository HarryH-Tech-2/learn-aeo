// The course used to be themed as a "City of Answers" with a district per lesson. It is now a plain course:
// lessons are "Lesson N: title". This walks every text file git knows about (outside docs/superpowers, the
// historic plans) and fails if the old theme's wording comes back.
import { describe, it, expect } from "vitest";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(__dirname, "../../..");
const SKIP_PREFIXES = ["docs/superpowers/", ".superpowers/"];
const TEXT_EXT = new Set([".ts", ".tsx", ".js", ".mjs", ".css", ".md", ".json", ".txt", ".html", ".prisma", ".sql"]);
// Their own word lists, and the legacy badge keys the seed renames from.
const ALLOW = new Set(["src/lib/__tests__/no-city-theme.test.ts", "src/lib/gamification.ts", "package-lock.json"]);

const BANNED = new RegExp(
  [
    String.raw`city of answers`,
    String.raw`\bdistricts?\b`,
    String.raw`\bcity map\b`,
    String.raw`\bskyline\b`,
    String.raw`the crawl docks`,
    String.raw`the answer quarter`,
    String.raw`the schema works`,
    String.raw`the agora\b`,
    String.raw`the embassies`,
    String.raw`the observatory`,
    String.raw`the citadel`,
    String.raw`the picture house`,
    String.raw`the hall of records`,
  ].join("|"),
  "i",
);

function files(): string[] {
  const out = execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard", "-z"], {
    cwd: ROOT,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  return [...new Set(out.split("\0").filter(Boolean))]
    .filter((r) => !SKIP_PREFIXES.some((p) => r.startsWith(p)))
    .filter((r) => fs.existsSync(path.join(ROOT, r)));
}

describe("no City of Answers theme", () => {
  const all = files();

  it("has no themed wording in any text file", () => {
    const hits: string[] = [];
    for (const rel of all) {
      if (ALLOW.has(rel) || !TEXT_EXT.has(path.extname(rel).toLowerCase())) continue;
      fs.readFileSync(path.join(ROOT, rel), "utf8")
        .split("\n")
        .forEach((line, i) => {
          const m = BANNED.exec(line);
          if (m) hits.push(`${rel}:${i + 1}: ${m[0]}`);
        });
    }
    expect(hits).toEqual([]);
  });

  it("has no themed file names", () => {
    expect(all.filter((r) => !ALLOW.has(r) && /district|city|skyline|\bgate\b/i.test(r))).toEqual([]);
  });
});

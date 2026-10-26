// Guards against leftovers from the sibling site (learn-hieroglyphics):
// its domain, its GA measurement id and its `lh_` cookie names.
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(__dirname, "../../..");
const TEXT_EXT = new Set([".ts", ".tsx", ".js", ".mjs", ".json", ".txt", ".xml", ".webmanifest", ".css", ".md"]);
const IGNORE_DIRS = new Set(["node_modules", ".next"]);
const SELF = path.resolve(__filename);

function walk(dir: string, out: string[]): void {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (IGNORE_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (TEXT_EXT.has(path.extname(entry.name))) out.push(full);
  }
}

const FORBIDDEN: Array<[string, RegExp]> = [
  ["learnhieroglyphics", /learnhieroglyphics/],
  ["G-GM64VZ87FQ", /G-GM64VZ87FQ/],
  ["lh_ cookie/key name", /["'`]lh_[a-z]/],
];

describe("no sibling-site strings", () => {
  it("has no learnhieroglyphics, old GA id or lh_ names", () => {
    const files: string[] = [];
    for (const d of ["src", "scripts", "public"]) walk(path.join(ROOT, d), files);
    for (const f of ["vercel.json", "next.config.ts"]) {
      const p = path.join(ROOT, f);
      if (fs.existsSync(p)) files.push(p);
    }
    // a wrong ROOT would walk nothing and pass silently
    expect(files.length).toBeGreaterThan(50);
    const hits: string[] = [];
    for (const file of files) {
      if (path.resolve(file) === SELF) continue;
      const text = fs.readFileSync(file, "utf8");
      for (const [label, re] of FORBIDDEN) {
        if (re.test(text)) hits.push(`${path.relative(ROOT, file)}: ${label}`);
      }
    }
    expect(hits).toEqual([]);
  });
});

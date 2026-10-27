import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(__dirname, "../../..");
const SRC = path.join(ROOT, "src");

const DELETED = [
  "src/lib/legacy-lessons.ts",
  "src/lib/expedition.ts",
  "src/lib/expedition-client.ts",
  "src/lib/exercises.ts",
  "src/lib/quiz.ts",
  "src/lib/objects.ts",
  "src/lib/tomb-wall.ts",
  "src/lib/transliteration.ts",
  "src/lib/numerals.ts",
  "src/lib/fly-glyph.ts",
  "src/lib/speech.ts",
  "src/lib/sfx.ts",
  "src/lib/content/door-name.ts",
  "src/lib/content/lesson-extras.ts",
  "src/lib/content/lesson-sections.ts",
  "src/lib/content/uniliteral-words.ts",
  "src/lib/content/uniliterals.ts",
  "src/components/LessonStage.tsx",
  "src/components/ProgressMap.tsx",
  "src/components/mechanics",
  "src/components/exercises",
  "src/components/journey",
  "src/components/lesson/BossReading.tsx",
  "src/components/lesson/ChoicePoint.tsx",
  "src/components/lesson/DoorOpening.tsx",
  "src/components/lesson/DoorReveal.tsx",
  "src/components/lesson/LetterHome.tsx",
  "src/components/lesson/NameGate.tsx",
  "src/components/lesson/ScribeLadder.tsx",
  "src/components/lesson/TorchRun.tsx",
  "src/components/lesson/WordCard.tsx",
  "public/lessons",
  "public/models",
  "public/videos",
  "src/lib/hieroglyph-translator.ts",
  "src/lib/hieroglyph-translator-locales.ts",
  "src/lib/__tests__/hieroglyph-translator.test.ts",
  "src/components/GuestPlayBanner.tsx",
  "src/lib/guest-play.ts",
  "src/lib/__tests__/guest-play.test.ts",
  "public/audio",
  "public/dev-audio",
  "scripts/dev/build-og-image.ts",
];

function walk(dir: string, out: string[] = []): string[] {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}
const rel = (p: string) => path.relative(ROOT, p).split(path.sep).join("/");

describe("legacy lesson system is gone", () => {
  it.each(DELETED)("%s does not exist", (p) => {
    expect(fs.existsSync(path.join(ROOT, p))).toBe(false);
  });

  it("no src file contains an old lesson id (except allowed spots)", () => {
    const ids = /expedition-begins|outer-courtyard|pilgrims-gallery|the-treasury|royal-hall|sacred-chapel|hypostyle-hall|inner-sanctum/;
    const self = "src/lib/__tests__/no-legacy-lessons.test.ts";
    const generic = [
      "src/lib/__tests__/checkout-return.test.ts",
      "src/app/api/stripe/__tests__/create-checkout-authenticated.test.ts",
    ];
    const hits = walk(SRC)
      .filter((f) => /\.(ts|tsx|css|json|md)$/.test(f))
      .filter((f) => ids.test(fs.readFileSync(f, "utf8")))
      .map(rel)
      .filter((f) => f !== self && !generic.includes(f));
    // Plan 3 renames the badge criteria; this is the one allowed exception.
    expect(hits).toEqual(["src/lib/gamification.ts"]);
  });

  it("new lesson system has no hieroglyph wording", () => {
    const re = /hieroglyph|egypt|glyph|papyrus|(?<![a-z])scribe|pharaoh|expedition/i;
    const files = [
      ...walk(path.join(SRC, "app/lessons")),
      ...walk(path.join(SRC, "app/dashboard")),
      ...walk(path.join(SRC, "components/player")),
      ...walk(path.join(SRC, "lib/content")),
      path.join(SRC, "components/CityMap.tsx"),
      path.join(SRC, "lib/lessons.ts"),
      ...fs
        .readdirSync(path.join(SRC, "lib"))
        .filter((f) => /^lesson-.*\.ts$/.test(f))
        .map((f) => path.join(SRC, "lib", f)),
    ];
    const hits = files.filter((f) => re.test(fs.readFileSync(f, "utf8"))).map(rel);
    expect(hits).toEqual([]);
  });
});

/**
 * Every line the written lessons can say aloud (src/lib/speech.ts), with the key its recording is filed under.
 * Printed as JSON for scripts/dev/make-lesson-audio.py, which records any that are missing.
 *   npx tsx scripts/dev/lesson-audio-lines.ts > lines.json
 */
import { lessons, getLessonGlyphs } from "../../src/lib/lessons";
import { WORDS } from "../../src/lib/content/uniliteral-words";
import { clipKeyOf, toSpeakable } from "../../src/lib/speech";

const lines = new Set<string>();
for (const lesson of lessons) {
  for (const g of getLessonGlyphs(lesson)) if (g.pronunciation) lines.add(toSpeakable(g.pronunciation));
}
for (const w of WORDS) lines.add(w.say);

const out = [...lines].filter((t) => t.trim()).map((text) => ({ key: clipKeyOf(text), text }));
process.stdout.write(JSON.stringify(out, null, 1));

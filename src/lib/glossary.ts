import { lessons, getLessonGlyphs, type Hieroglyph } from "@/lib/lessons";

export type GlossaryEntry = Hieroglyph & {
  lessonId: string;
  lessonTitle: string;
  lessonSubtitle: string;
  lessonOrder: number;
  lessonFree: boolean;
};

/** Short form of a glyph's meaning — the part before " — " or ": ". */
export function shortMeaning(meaning: string): string {
  return meaning.split(/ — |: /)[0].trim();
}

/** Every glyph taught anywhere on the course, in lesson order, deduplicated by symbol. */
export function buildGlossary(): GlossaryEntry[] {
  const seen = new Set<string>();
  const out: GlossaryEntry[] = [];
  for (const lesson of [...lessons].sort((a, b) => a.order - b.order)) {
    for (const g of getLessonGlyphs(lesson)) {
      if (seen.has(g.symbol)) continue;
      seen.add(g.symbol);
      out.push({
        ...g,
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        lessonSubtitle: lesson.subtitle,
        lessonOrder: lesson.order,
        lessonFree: lesson.isFree,
      });
    }
  }
  return out;
}

function normalise(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

/**
 * Case- and accent-insensitive search over symbol, transliteration, meaning
 * and pronunciation. An empty query returns everything.
 */
export function filterGlossary(entries: GlossaryEntry[], query: string): GlossaryEntry[] {
  const q = normalise(query.trim());
  if (!q) return entries;
  return entries.filter(
    (e) =>
      e.symbol === query.trim() ||
      normalise(e.transliteration).includes(q) ||
      normalise(e.meaning).includes(q) ||
      normalise(e.pronunciation).includes(q),
  );
}

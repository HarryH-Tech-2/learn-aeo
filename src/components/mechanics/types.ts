import type { Hieroglyph } from "@/lib/legacy-lessons";

/** Every lesson's signature mechanic renders with the same props. */
export type MechanicProps = {
  lessonId: string;
  /** All glyphs of the lesson */
  glyphs: Hieroglyph[];
  onXPEarned: (xp: number) => void;
  onComplete: (summary: { correct: number; total: number }) => void;
};

export const GLYPH_STYLE = { fontFamily: "'Noto Sans Egyptian Hieroglyphs', serif" } as const;

export function shuffle<T>(items: readonly T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

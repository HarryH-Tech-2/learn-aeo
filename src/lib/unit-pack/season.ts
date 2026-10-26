/**
 * When to promote the Ancient Egypt Writing Unit to teachers, by the visitor's country and the date.
 *
 *   US: 1 October to 15 December. Sixth-grade world history reaches Ancient Egypt in the autumn term.
 *   UK: 5 January to 31 March. KS2 classes (Years 3 and 4) often take the Ancient Egypt depth study in spring.
 *
 * Pure, with `now` injected: the client calls it after mount (the date and the country cookie are only
 * known in the browser), so the server render and the first client render agree (nothing shown).
 * Dates are read in the visitor's local time.
 */

export type TeacherSeasonId = "us-fall" | "uk-spring";

export type TeacherSeason = {
  id: TeacherSeasonId;
  headline: string;
  text: string;
};

const SEASONS: { id: TeacherSeasonId; countries: string[]; from: [number, number]; to: [number, number]; headline: string; text: string }[] = [
  {
    id: "us-fall",
    countries: ["US"],
    from: [10, 1],
    to: [12, 15],
    headline: "Teaching Ancient Egypt this term?",
    text: "Five ready-to-teach hieroglyphs lessons for grade 6, with worksheets, a quiz and answers.",
  },
  {
    id: "uk-spring",
    countries: ["GB"],
    from: [1, 5],
    to: [3, 31],
    headline: "Ancient Egypt this spring term?",
    text: "Five ready-to-teach KS2 hieroglyphs lessons, with worksheets, a quiz and answers.",
  },
];

/** Month and day as one comparable number: 1 October → 1001. */
const md = (month: number, day: number) => month * 100 + day;

export function teacherSeason(now: Date, country: string | null | undefined): TeacherSeason | null {
  const c = country?.toUpperCase();
  if (!c) return null;
  const today = md(now.getMonth() + 1, now.getDate());
  for (const s of SEASONS) {
    if (!s.countries.includes(c)) continue;
    if (today >= md(...s.from) && today <= md(...s.to)) return { id: s.id, headline: s.headline, text: s.text };
  }
  return null;
}

/** A preview for checking the strip out of season: ?season=us-fall or ?season=uk-spring. */
export function previewSeason(param: string | null | undefined): TeacherSeason | null {
  const s = SEASONS.find((x) => x.id === param);
  return s ? { id: s.id, headline: s.headline, text: s.text } : null;
}

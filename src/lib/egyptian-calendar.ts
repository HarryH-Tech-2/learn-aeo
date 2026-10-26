/**
 * The ancient Egyptian civil calendar (2026-10-20, for the numerals converter): 12 months of 30 days in three
 * seasons of four (Akhet, Peret, Shemu), then 5 extra "days upon the year". 365 days, no leap day, so it slipped a
 * quarter-day a year against the seasons (the "wandering year").
 *
 * A modern date is placed on it by counting days from 1 Thoth of year 1 of the Era of Nabonassar (26 February
 * 747 BCE, Julian), the running 365-day count Greek astronomers kept from the Egyptian calendar. Check: it puts
 * 1 Thoth on 20 July 139 CE, the new year Censorinus records as falling with the rising of Sirius that year.
 * Dates are taken as Gregorian (proleptic before 1582), from 1 CE on.
 */

export type Season = { name: string; translit: string; meaning: string };

export const SEASONS: Season[] = [
  { name: "Akhet", translit: "ꜣḫt", meaning: "Inundation, when the Nile flooded the fields" },
  { name: "Peret", translit: "prt", meaning: "Emergence, when the land came out of the water and was sown" },
  { name: "Shemu", translit: "šmw", meaning: "Harvest, the low-water season" },
];

/** The later (Greek) month names, still used by the Coptic calendar. */
export const GREEK_MONTHS = ["Thoth", "Phaophi", "Hathyr", "Choiak", "Tybi", "Mechir", "Phamenoth", "Pharmuthi", "Pachons", "Payni", "Epiphi", "Mesore"];

/** The five extra days, the birthdays of the children of Nut, in order. */
export const EPAGOMENAL_GODS = ["Osiris", "Horus", "Seth", "Isis", "Nephthys"];

/** Julian Day Number of 1 Thoth, Nabonassar year 1. */
const EPOCH_JDN = 1_448_638;

/** Julian Day Number of a Gregorian calendar date (month 1–12). */
export function gregorianToJdn(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
}

export type CivilDate =
  | { kind: "month"; season: Season; seasonIndex: number; monthInSeason: number; monthIndex: number; greekMonth: string; day: number }
  | { kind: "epagomenal"; day: number; god: string };

/** A Gregorian date on the civil calendar. */
export function civilDate(year: number, month: number, day: number): CivilDate {
  const days = gregorianToJdn(year, month, day) - EPOCH_JDN;
  const inYear = ((days % 365) + 365) % 365;
  if (inYear >= 360) {
    const d = inYear - 360 + 1;
    return { kind: "epagomenal", day: d, god: EPAGOMENAL_GODS[d - 1] };
  }
  const monthIndex = Math.floor(inYear / 30);
  const seasonIndex = Math.floor(monthIndex / 4);
  return {
    kind: "month",
    season: SEASONS[seasonIndex],
    seasonIndex,
    monthInSeason: (monthIndex % 4) + 1,
    monthIndex,
    greekMonth: GREEK_MONTHS[monthIndex],
    day: (inYear % 30) + 1,
  };
}

const ORDINAL = ["first", "second", "third", "fourth", "fifth"];

/** "Day 7 of the third month of Peret (Phamenoth)" / "the second day upon the year, the birthday of Horus". */
export function describeCivilDate(c: CivilDate): string {
  if (c.kind === "epagomenal") return `The ${ORDINAL[c.day - 1]} day upon the year, the birthday of ${c.god}`;
  return `Day ${c.day} of the ${ORDINAL[c.monthInSeason - 1]} month of ${c.season.name} (${c.greekMonth})`;
}

/** Parse "YYYY-MM-DD" (an <input type="date"> value); null when it isn't a real date from 1 CE to 9999. */
export function parseIsoDate(s: string): { year: number; month: number; day: number } | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return null;
  const [year, month, day] = [Number(m[1]), Number(m[2]), Number(m[3])];
  if (year < 1 || month < 1 || month > 12 || day < 1) return null;
  const dim = [31, year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];
  return day <= dim ? { year, month, day } : null;
}

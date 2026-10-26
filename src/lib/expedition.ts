/**
 * The Expedition — everything that makes the course feel like one dig rather
 * than eight lessons: relics found, the sealed door's inscription assembling
 * fragment by fragment, tools earned with rank, the rival
 * team next door, the depth reached, the expedition log, choice points,
 * letters home, boss inscriptions and second-pass seals.
 *
 * Pure functions and content. Persistence: a small client-owned blob in
 * GameState (game "expedition", see expedition-client.ts) plus a server-only
 * activity log (game "expedition-log", appended by recordXP).
 */
import { lessons, getLessonGlyphs, type Lesson } from "@/lib/lessons";
import { generateSiteReport } from "@/lib/exercises";
import { LEVEL_THRESHOLDS, calculateLevel } from "@/lib/gamification";
import { modelForGlyph } from "@/lib/objects";
import type { WallSign } from "@/lib/tomb-wall";
import type { LessonReading } from "@/lib/content/lesson-extras";

export type LessonProgressMap = Record<string, { started: boolean; bestScore: number | null; completed: boolean }>;

// ─────────────────────────── Persisted state ───────────────────────────

export type SealRecord = { score: number; total: number; at: string };
export type BossRecord = { clean: boolean; at: string };

export type ExpeditionState = {
  v: 1;
  /** Lamp oil: won and lost at choice points. */
  torches: number;
  /** choiceId → optionId */
  choices: Record<string, string>;
  /** lessonId → the glyphs the learner put in the letter's gaps */
  letters: Record<string, string[]>;
  /** lessonId → best second-pass result */
  seals: Record<string, SealRecord>;
  /** category → boss result */
  bosses: Record<string, BossRecord>;
  /** lessonId → the learner's place in a lesson taken in sections (src/lib/content/lesson-sections.ts). Absent on older saves. */
  sections?: Record<string, SectionRecord>;
};

/** `done` sections are finished; `name` is what the learner typed at the door, so the same door can be rebuilt on return. */
export type SectionRecord = { done: number; name: string; at: string };

export const EMPTY_EXPEDITION: ExpeditionState = { v: 1, torches: 3, choices: {}, letters: {}, seals: {}, bosses: {} };

export function isExpeditionState(x: unknown): x is ExpeditionState {
  if (!x || typeof x !== "object") return false;
  const s = x as Record<string, unknown>;
  return s.v === 1 && typeof s.torches === "number" && ["choices", "letters", "seals", "bosses"].every((k) => s[k] && typeof s[k] === "object");
}

/** Union of two copies (local + remote): keep the better seal, every choice, the higher torch count. */
export function mergeExpedition(a: ExpeditionState, b: ExpeditionState): ExpeditionState {
  const seals: Record<string, SealRecord> = { ...a.seals };
  for (const [k, v] of Object.entries(b.seals)) {
    const cur = seals[k];
    if (!cur || v.score / v.total > cur.score / cur.total) seals[k] = v;
  }
  const bosses: Record<string, BossRecord> = { ...a.bosses };
  for (const [k, v] of Object.entries(b.bosses)) {
    const cur = bosses[k];
    if (!cur || (v.clean && !cur.clean)) bosses[k] = v;
  }
  const sections: Record<string, SectionRecord> = { ...(a.sections ?? {}) };
  for (const [k, v] of Object.entries(b.sections ?? {})) {
    const cur = sections[k];
    if (!cur || v.done > cur.done) sections[k] = v;
  }
  return {
    v: 1,
    torches: Math.max(a.torches, b.torches),
    choices: { ...b.choices, ...a.choices },
    letters: { ...b.letters, ...a.letters },
    seals,
    bosses,
    sections,
  };
}

export const MAX_TORCHES = 9;

export function withChoice(s: ExpeditionState, choiceId: string, optionId: string, torchDelta: number): ExpeditionState {
  if (s.choices[choiceId]) return s; // a choice is made once
  return { ...s, choices: { ...s.choices, [choiceId]: optionId }, torches: Math.max(0, Math.min(MAX_TORCHES, s.torches + torchDelta)) };
}

export function withLetter(s: ExpeditionState, lessonId: string, glyphs: string[]): ExpeditionState {
  return { ...s, letters: { ...s.letters, [lessonId]: glyphs } };
}

export function withSeal(s: ExpeditionState, lessonId: string, score: number, total: number, at = new Date().toISOString()): ExpeditionState {
  const cur = s.seals[lessonId];
  if (cur && cur.score / cur.total >= score / total) return s;
  return { ...s, seals: { ...s.seals, [lessonId]: { score, total, at } } };
}

/** Record a finished section. A place only ever moves forward, so replaying the lesson never loses it. */
export function withSection(s: ExpeditionState, lessonId: string, done: number, name: string, at = new Date().toISOString()): ExpeditionState {
  const cur = s.sections?.[lessonId];
  if (cur && cur.done >= done) return s;
  return { ...s, sections: { ...(s.sections ?? {}), [lessonId]: { done, name, at } } };
}

export function withBoss(s: ExpeditionState, category: string, clean: boolean, at = new Date().toISOString()): ExpeditionState {
  const cur = s.bosses[category];
  if (cur?.clean) return s;
  return { ...s, bosses: { ...s.bosses, [category]: { clean, at } } };
}

// ─────────────────────────── Lessons in order ───────────────────────────

export function orderedLessons(): Lesson[] {
  return [...lessons].sort((a, b) => a.order - b.order);
}

export function lessonById(id: string): Lesson | undefined {
  return lessons.find((l) => l.id === id);
}

/** How many questions a lesson's Site Report asks (deterministic; only the order is shuffled). */
export function siteReportLength(lesson: Lesson): number {
  return generateSiteReport(getLessonGlyphs(lesson), lesson.exerciseConfig).length;
}

// ─────────────────────────── Relics (finds tray) ───────────────────────────

export type RelicGrade = "clay" | "bronze" | "silver" | "gold";
export const RELIC_GRADES: RelicGrade[] = ["clay", "bronze", "silver", "gold"];

export type Relic = {
  lessonId: string;
  lessonTitle: string;
  order: number;
  /** Find number in the site register, e.g. "TT-03" */
  findNumber: string;
  glyph: string;
  name: string;
  /** GLB path when we have a 3D model of it */
  model?: string;
  /** Where on site it was found (one line, provenance) */
  provenance: string;
  /** null = not yet found */
  grade: RelicGrade | null;
  /** Polished by a second-pass gold seal */
  sealed: boolean;
};

const RELIC_DEF: Record<string, { glyph: string; name: string; provenance: string }> = {
  "expedition-begins": { glyph: "𓆣", name: "Scarab amulet", provenance: "Surface find beside the Base Camp ridge, in the spoil of an earlier dig." },
  "outer-courtyard": { glyph: "𓆸", name: "Faience lotus", provenance: "Outer Courtyard, north-east corner, under a fallen lintel." },
  "pilgrims-gallery": { glyph: "𓀀", name: "Scribe's statuette", provenance: "Pilgrim's Gallery, niche 4, behind a graffito of a boat." },
  "the-treasury": { glyph: "𓏊", name: "Sealed beer jar", provenance: "Treasury store, row 3, still stamped with the clerk's seal." },
  "royal-hall": { glyph: "𓇳", name: "Gilded sun disc", provenance: "Royal Hall, loose in the soot above the cartouche of Ramesses." },
  "sacred-chapel": { glyph: "𓊵", name: "Offering slab", provenance: "Sacred Chapel, in situ before the false door." },
  "hypostyle-hall": { glyph: "𓊹", name: "Standard of the god", provenance: "Hypostyle Hall, wedged in the fourth column's base." },
  "inner-sanctum": { glyph: "𓋹", name: "Ankh of electrum", provenance: "Inner Sanctum, on the sealed door's threshold." },
};

/** clay: completed · bronze ≥ 60% · silver ≥ 80% · gold: perfect. */
export function relicGrade(bestScore: number | null, total: number, completed: boolean): RelicGrade | null {
  if (!completed) return null;
  if (bestScore === null || total <= 0) return "clay";
  const r = bestScore / total;
  if (r >= 1) return "gold";
  if (r >= 0.8) return "silver";
  if (r >= 0.6) return "bronze";
  return "clay";
}

export function computeRelics(progress: LessonProgressMap | null, state: ExpeditionState = EMPTY_EXPEDITION): Relic[] {
  return orderedLessons().map((l) => {
    const def = RELIC_DEF[l.id] ?? { glyph: "𓊖", name: "Fragment", provenance: "Findspot unrecorded." };
    const p = progress?.[l.id];
    const seal = state.seals[l.id];
    return {
      lessonId: l.id,
      lessonTitle: l.title,
      order: l.order,
      findNumber: `TT-${String(l.order).padStart(2, "0")}`,
      glyph: def.glyph,
      name: def.name,
      model: modelForGlyph(def.glyph)?.model,
      provenance: def.provenance,
      grade: relicGrade(p?.bestScore ?? null, siteReportLength(l), !!p?.completed),
      sealed: !!seal && seal.score === seal.total,
    };
  });
}

// ─────────────────────────── Tools by rank ───────────────────────────

export type Tool = { level: number; name: string; glyph: string; perk: string };

export const TOOLS: Tool[] = [
  { level: 1, name: "Brush", glyph: "𓏞", perk: "Clears sand from the signs on your wall." },
  { level: 2, name: "Trowel", glyph: "𓌳", perk: "Opens side rooms a little faster: +5% game XP." },
  { level: 3, name: "Lamp", glyph: "𓇳", perk: "Lights faded signs: one free hint in every Read it." },
  { level: 4, name: "Ladder", glyph: "𓊛", perk: "Reach the upper registers: second-pass mode unlocked everywhere." },
  { level: 5, name: "Rope", glyph: "𓍢", perk: "Descend safely: a failed boss reading costs no lamp oil." },
  { level: 6, name: "Key", glyph: "𓋹", perk: "Every sealed side room stands open." },
  { level: 7, name: "Seal ring", glyph: "𓆣", perk: "Your cartouche is carved in gold on the Hall of Scribes." },
];

export function toolForLevel(level: number): Tool {
  let out = TOOLS[0];
  for (const t of TOOLS) if (level >= t.level) out = t;
  return out;
}

export function nextTool(level: number): Tool | null {
  return TOOLS.find((t) => t.level > level) ?? null;
}

export function xpForLevel(level: number): number {
  return LEVEL_THRESHOLDS.find((t) => t.level === level)?.xp ?? 0;
}

// ─────────────────────────── Depth ───────────────────────────

export const METRES_PER_CHAMBER = 6;

/** How far down the shaft the learner has dug: a chamber per lesson, plus XP inching through the next. */
export function depthMetres(clearedCount: number, xp: number): number {
  const level = calculateLevel(xp);
  const cur = xpForLevel(level);
  const next = LEVEL_THRESHOLDS.find((t) => t.level === level + 1)?.xp;
  const frac = next ? (xp - cur) / (next - cur) : 1;
  const inChamber = clearedCount >= lessons.length ? 0 : Math.max(0, Math.min(0.95, frac)) * (METRES_PER_CHAMBER - 1);
  return Math.round((clearedCount * METRES_PER_CHAMBER + inChamber) * 10) / 10;
}

// ─────────────────────────── Expedition log ───────────────────────────

export type ExpeditionLog = { days: string[] };

export function isExpeditionLog(x: unknown): x is ExpeditionLog {
  return !!x && typeof x === "object" && Array.isArray((x as ExpeditionLog).days) && (x as ExpeditionLog).days.every((d) => typeof d === "string");
}

/** Local calendar day as YYYY-MM-DD. */
export function dayKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export const LOG_CAP = 400;

export function addLogDay(log: ExpeditionLog, key: string): ExpeditionLog {
  if (log.days.includes(key)) return log;
  const days = [...log.days, key].sort();
  return { days: days.slice(Math.max(0, days.length - LOG_CAP)) };
}

export type HeatCell = { key: string; active: boolean; future: boolean };

/** `weeks` columns of 7 cells ending on `today`, Monday-first. */
export function heatmap(log: ExpeditionLog, today: Date, weeks = 16): HeatCell[][] {
  const active = new Set(log.days);
  const end = new Date(today);
  end.setHours(0, 0, 0, 0);
  // end of the week containing today (Sunday)
  const dow = (end.getDay() + 6) % 7; // Monday = 0
  const weekEnd = new Date(end);
  weekEnd.setDate(end.getDate() + (6 - dow));
  const start = new Date(weekEnd);
  start.setDate(weekEnd.getDate() - weeks * 7 + 1);
  const cols: HeatCell[][] = [];
  const cur = new Date(start);
  for (let w = 0; w < weeks; w++) {
    const col: HeatCell[] = [];
    for (let d = 0; d < 7; d++) {
      const key = dayKey(cur);
      col.push({ key, active: active.has(key), future: cur > end });
      cur.setDate(cur.getDate() + 1);
    }
    cols.push(col);
  }
  return cols;
}

// ─────────────────────────── The rival expedition ───────────────────────────

export const RIVAL = { name: "The Venner party", leader: "Dr Aurelia Venner", daysPerChamber: 4 } as const;

export type RivalStatus = { chambers: number; standing: "ahead" | "level" | "behind"; daysUntilNext: number; line: string };

/** The team in the next tomb clears a chamber every few days from the day you first dug. */
export function rivalStatus(log: ExpeditionLog, cleared: number, today: Date): RivalStatus {
  const first = log.days[0];
  const total = lessons.length;
  if (!first) return { chambers: 0, standing: "level", daysUntilNext: RIVAL.daysPerChamber, line: `${RIVAL.name} arrived the same day you did. Nothing cleared on either side.` };
  const start = new Date(first + "T00:00:00");
  const days = Math.max(0, Math.floor((today.getTime() - start.getTime()) / 86_400_000));
  const chambers = Math.min(total, Math.floor(days / RIVAL.daysPerChamber));
  const daysUntilNext = chambers >= total ? 0 : RIVAL.daysPerChamber - (days % RIVAL.daysPerChamber);
  const standing = cleared > chambers ? "ahead" : cleared === chambers ? "level" : "behind";
  const line =
    standing === "ahead"
      ? `You are ${cleared - chambers} chamber${cleared - chambers === 1 ? "" : "s"} ahead of ${RIVAL.name}. They break through again in ${daysUntilNext} day${daysUntilNext === 1 ? "" : "s"}.`
      : standing === "level"
        ? `${RIVAL.name} is level with you at ${chambers} cleared. They dig again in ${daysUntilNext} day${daysUntilNext === 1 ? "" : "s"}.`
        : `${RIVAL.name} is ${chambers - cleared} chamber${chambers - cleared === 1 ? "" : "s"} ahead. Clear the next one to catch up.`;
  return { chambers, standing, daysUntilNext, line };
}

// ─────────────────────────── The sealed door ───────────────────────────

const s = (glyph: string, value: string, name: string, role: WallSign["role"] = "phon"): WallSign => ({ glyph, value, name, role });

export type DoorFragment = {
  /** Lesson that uncovers it */
  lessonId: string;
  /** Position in the inscription, 0-based */
  slot: number;
  signs: WallSign[];
  translit: string;
  english: string;
  /** The epigrapher's note when it is found */
  note: string;
};

/**
 * One line of text on the door at the bottom of the shaft. Each chamber
 * cleared brushes the sand off one fragment. Every sign is reused from an
 * inscription elsewhere on the course, so the code points are verified.
 */
export const DOOR_FRAGMENTS: DoorFragment[] = [
  {
    lessonId: "sacred-chapel", slot: 0, translit: "ḥtp dj nswt", english: "An offering which the king gives",
    signs: [s("𓇓", "nsw(t)", "sedge plant"), s("𓏏", "t", "bread loaf", "comp"), s("𓊵", "ḥtp", "offering slab"), s("𓏙", "dj", "conical loaf")],
    note: "The formula. Whoever lies behind this door was buried with the king's blessing.",
  },
  {
    lessonId: "hypostyle-hall", slot: 1, translit: "wsjr nb ḏdw", english: "to Osiris, lord of Djedu",
    signs: [s("𓊨", "ws", "seat"), s("𓁹", "jr", "eye"), s("𓀭", "god", "seated god", "det"), s("𓎟", "nb", "basket"), s("𓊽", "ḏd", "djed pillar"), s("𓂧", "d", "hand", "comp"), s("𓅱", "w", "quail chick"), s("𓊖", "town", "town sign", "det")],
    note: "Osiris, then. A Delta cult title on a Theban door: the owner had travelled.",
  },
  {
    lessonId: "inner-sanctum", slot: 2, translit: "dj.f prt-ḫrw", english: "that he may give a voice-offering",
    signs: [s("𓏙", "dj", "conical loaf"), s("𓆑", "f", "horned viper"), s("𓉐", "pr", "house"), s("𓂋", "r", "mouth", "comp"), s("𓏏", "t", "bread loaf"), s("𓊤", "ḫrw", "oar (voice)")],
    note: "The offerings become real when the words are spoken. Read this aloud and you feed the dead.",
  },
  {
    lessonId: "outer-courtyard", slot: 3, translit: "t ḥnqt kꜣ ꜣpd", english: "bread, beer, oxen and fowl",
    signs: [s("𓏏", "t", "bread loaf"), s("𓏐", "bread", "loaf", "det"), s("𓏊", "beer", "beer jar", "det"), s("𓃒", "kꜣ", "bull", "ideo"), s("𓅬", "ꜣpd", "goose", "ideo")],
    note: "The menu. The animals you drew in the courtyard were never decoration.",
  },
  {
    lessonId: "the-treasury", slot: 4, translit: "ḫꜣ", english: "a thousand (of each)",
    signs: [s("𓆼", "1,000", "lotus plant", "ideo")],
    note: "One lotus, and the whole list above it is multiplied by a thousand.",
  },
  {
    lessonId: "royal-hall", slot: 5, translit: "n kꜣ n", english: "for the ka of",
    signs: [s("𓈖", "n", "ripple of water"), s("𓂓", "kꜣ", "two arms (ka)", "ideo"), s("𓈖", "n", "ripple of water")],
    note: "For the ka of… a name is coming. The whole door has been leading to it.",
  },
  {
    lessonId: "expedition-begins", slot: 6, translit: "sš", english: "the scribe",
    signs: [s("𓋴", "s", "folded cloth"), s("𓈙", "š", "pool")],
    note: "Two alphabet signs you learned on day one. This is the tomb of a scribe.",
  },
  {
    lessonId: "pilgrims-gallery", slot: 7, translit: "mꜣꜥ-ḫrw", english: "true of voice",
    signs: [s("𓀀", "man", "seated man", "det"), s("𓐙", "mꜣꜥ", "sickle / plinth", "ideo"), s("𓊤", "ḫrw", "oar (voice)", "ideo")],
    note: "Justified before Osiris. The last sign is the man himself, and the door is read.",
  },
];

export type DoorProgress = {
  fragments: (DoorFragment & { found: boolean })[];
  found: number;
  total: number;
  complete: boolean;
  translit: string;
  english: string;
};

export function doorProgress(progress: LessonProgressMap | null): DoorProgress {
  const fragments = [...DOOR_FRAGMENTS]
    .sort((a, b) => a.slot - b.slot)
    .map((f) => ({ ...f, found: !!progress?.[f.lessonId]?.completed }));
  const found = fragments.filter((f) => f.found).length;
  return {
    fragments,
    found,
    total: fragments.length,
    complete: found === fragments.length,
    translit: fragments.map((f) => f.translit).join(" · "),
    english: "An offering which the king gives to Osiris, lord of Djedu, that he may give a voice-offering of bread, beer, oxen and fowl, a thousand of each, for the ka of the scribe, true of voice.",
  };
}

/** The fragment a lesson uncovers, for the reveal at the end of it. */
export function fragmentForLesson(lessonId: string): DoorFragment | undefined {
  return DOOR_FRAGMENTS.find((f) => f.lessonId === lessonId);
}

// ─────────────────────────── Boss inscriptions ───────────────────────────

export type Boss = {
  category: string;
  /** Lesson after which it is read */
  afterLessonId: string;
  title: string;
  intro: string;
  /** Read in sequence, no hints */
  lines: LessonReading[];
  sealName: string;
};

export const BOSSES: Boss[] = [
  {
    category: "Fundamentals", afterLessonId: "pilgrims-gallery", sealName: "Seal of the Courtyard",
    title: "The Greek on the Rosetta Stone",
    intro: "No cards, no tips. A foreign name spelled out letter by letter, the way Champollion first read it.",
    lines: [
      {
        title: "Ptolemy", source: "Rosetta Stone, British Museum",
        signs: [s("𓊪", "p", "stool"), s("𓏏", "t", "loaf"), s("𓍯", "w / o", "lasso"), s("𓃭", "l", "lion"), s("𓅓", "m", "owl"), s("𓇋", "ꞽ", "reed"), s("𓇋", "ꞽ", "reed"), s("𓋴", "s", "folded cloth")],
        translit: "ptwlmys", meaning: "Ptolemy",
        note: "Pure alphabet. The lion gives Egyptian an ‘l’ it never needed for its own words.",
      },
    ],
  },
  {
    category: "Applied", afterLessonId: "royal-hall", sealName: "Seal of the Hall",
    title: "Two kings, one wall",
    intro: "Two cartouches from Karnak, back to back. Read each one; the second is carved right to left.",
    lines: [
      {
        title: "Amenhotep III", source: "Karnak, 18th Dynasty",
        signs: [s("𓇋", "ꞽ", "reed"), s("𓏠", "mn", "gaming board"), s("𓈖", "n", "ripple", "comp"), s("𓊵", "ḥtp", "offering slab"), s("𓏏", "t", "loaf", "comp"), s("𓊪", "p", "stool", "comp")],
        translit: "ꞽmn-ḥtp", meaning: "Amenhotep: ‘Amun is satisfied’",
        note: "Amun, then ḥtp with two complements. The Colossi of Memnon are his.",
      },
      {
        title: "Ramesses II", source: "Karnak, 19th Dynasty", rtl: true,
        signs: [s("𓇳", "rꜥ", "sun disc"), s("𓄟", "ms", "three fox skins"), s("𓋴", "s", "folded cloth", "comp"), s("𓇓", "sw", "sedge plant")],
        translit: "rꜥ-ms-sw", meaning: "Ramesses: ‘Ra has fashioned him’",
        note: "The figures face right, so you began on the right. Sixty-six years on the throne.",
      },
    ],
  },
  {
    category: "Advanced", afterLessonId: "hypostyle-hall", sealName: "Seal of the Chapel",
    title: "The formula in full",
    intro: "The opening of a real stela, twelve signs across two lines, with the king's name jumping to the front.",
    lines: [
      {
        title: "Line 1", source: "Offering formula, Middle Kingdom stela",
        signs: [s("𓊵", "ḥtp", "offering slab"), s("𓏙", "dj", "conical loaf"), s("𓇓", "nsw(t)", "sedge plant"), s("𓏏", "t", "loaf", "comp")],
        written: [2, 3, 0, 1],
        translit: "ḥtp dj nswt", meaning: "an offering which the king gives",
        note: "Honorific transposition: the king is carved first, read third.",
      },
      {
        title: "Line 2", source: "Offering formula, Middle Kingdom stela",
        signs: [s("𓊨", "ws", "seat"), s("𓁹", "jr", "eye"), s("𓀭", "god", "seated god", "det"), s("𓎟", "nb", "basket"), s("𓊽", "ḏd", "djed pillar"), s("𓂧", "d", "hand", "comp"), s("𓅱", "w", "quail chick"), s("𓊖", "town", "town sign", "det")],
        translit: "wsjr nb ḏdw", meaning: "to Osiris, lord of Djedu",
        note: "Two determinatives, a god and a town, and you read straight through them.",
      },
    ],
  },
  {
    category: "Mastery", afterLessonId: "inner-sanctum", sealName: "Seal of the Sanctum",
    title: "The sealed door",
    intro: "Every fragment is uncovered. Read the whole line, unaided, and the tomb gives up its owner.",
    lines: [
      { title: "The door · 1", source: "The sealed door at the bottom of the shaft", signs: DOOR_FRAGMENTS[0].signs, written: [2, 3, 0, 1], translit: "ḥtp dj nswt", meaning: "an offering which the king gives", note: "" },
      { title: "The door · 2", source: "The sealed door at the bottom of the shaft", signs: DOOR_FRAGMENTS[1].signs, translit: "wsjr nb ḏdw", meaning: "to Osiris, lord of Djedu", note: "" },
      { title: "The door · 3", source: "The sealed door at the bottom of the shaft", signs: DOOR_FRAGMENTS[2].signs, translit: "dj.f prt-ḫrw", meaning: "that he may give a voice-offering", note: "" },
      { title: "The door · 4", source: "The sealed door at the bottom of the shaft", signs: [...DOOR_FRAGMENTS[3].signs, ...DOOR_FRAGMENTS[4].signs], translit: "t ḥnqt kꜣ ꜣpd ḫꜣ", meaning: "bread, beer, oxen and fowl, a thousand of each", note: "" },
      { title: "The door · 5", source: "The sealed door at the bottom of the shaft", signs: [...DOOR_FRAGMENTS[5].signs, ...DOOR_FRAGMENTS[6].signs, ...DOOR_FRAGMENTS[7].signs], translit: "n kꜣ n sš mꜣꜥ-ḫrw", meaning: "for the ka of the scribe, true of voice", note: "The tomb of a scribe. You have read every sign on the door, and you are one too." },
    ],
  },
];

export function bossAfterLesson(lessonId: string): Boss | undefined {
  return BOSSES.find((b) => b.afterLessonId === lessonId);
}

export function bossForCategory(category: string): Boss | undefined {
  return BOSSES.find((b) => b.category === category);
}

// ─────────────────────────── Second pass ───────────────────────────

/** A harder, different inscription per chamber: read cleanly for a gold seal. */
export const SECOND_PASS: Record<string, LessonReading> = {
  "expedition-begins": {
    title: "Cleopatra", source: "Temple of Dendera and the Rosetta Stone",
    signs: [
      s("𓈎", "q / k", "hill-slope"), s("𓃭", "l", "lion"), s("𓇋", "ꞽ", "reed"), s("𓍯", "w / o", "lasso"), s("𓊪", "p", "stool"),
      s("𓄿", "ꜣ / a", "vulture"), s("𓂧", "d", "hand"), s("𓂋", "r", "mouth"), s("𓄿", "ꜣ / a", "vulture"), s("𓏏", "t", "loaf (feminine)"), s("𓆇", "♀", "egg", "det"),
    ],
    translit: "qlꞽwpꜣdrꜣt", meaning: "Cleopatra",
    note: "Eleven signs, every one an alphabet sign until the egg that marks a woman's name.",
  },
  "outer-courtyard": {
    title: "From the menu", source: "Offering list, Middle Kingdom", rtl: true,
    signs: [s("𓏏", "t", "bread loaf"), s("𓏐", "bread", "loaf", "det"), s("𓏊", "beer", "beer jar", "det"), s("𓃒", "kꜣ", "bull", "ideo"), s("𓅬", "ꜣpd", "goose", "ideo")],
    translit: "t ḥnqt kꜣ ꜣpd", meaning: "bread, beer, oxen and fowl",
    note: "Carved right to left this time. The bull and the goose are whole words on their own.",
  },
  "pilgrims-gallery": {
    title: "The god's titles", source: "Offering formula, on countless stelae",
    signs: [s("𓊨", "ws", "seat"), s("𓁹", "jr", "eye"), s("𓀭", "god", "seated god", "det"), s("𓎟", "nb", "basket"), s("𓊽", "ḏd", "djed pillar"), s("𓂧", "d", "hand", "comp"), s("𓅱", "w", "quail chick"), s("𓊖", "town", "town sign", "det")],
    translit: "wsjr nb ḏdw", meaning: "Osiris, lord of Djedu",
    note: "Two silent signs, a god and a town. Read past them without stopping.",
  },
  "the-treasury": {
    title: "The clerk's tally", source: "Storeroom docket",
    signs: [s("𓍢", "100", "coil of rope", "ideo"), s("𓍢", "100", "coil of rope", "ideo"), s("𓎆", "10", "cattle hobble", "ideo"), s("𓎆", "10", "cattle hobble", "ideo"), s("𓎆", "10", "cattle hobble", "ideo"), s("𓎆", "10", "cattle hobble", "ideo"), s("𓏤", "1", "stroke", "ideo"), s("𓏤", "1", "stroke", "ideo"), s("𓏊", "beer", "beer jar", "det")],
    translit: "242 ḥnqt", meaning: "242 jars of beer",
    note: "Largest sign first, then down: 200, 40, 2, and the jar to say what was counted.",
  },
  "royal-hall": {
    title: "Thutmose III", source: "Karnak, 18th Dynasty", rtl: true,
    signs: [s("𓅝", "ḏḥwty", "ibis on a standard (Thoth)"), s("𓄟", "ms", "three fox skins"), s("𓋴", "s", "folded cloth", "comp")],
    translit: "ḏḥwty-ms", meaning: "Thutmose: ‘Thoth is born’",
    note: "Mirror-carved. The god's bird leads the reading as well as the carving.",
  },
  "sacred-chapel": {
    title: "That he may give", source: "Offering formula, second clause",
    signs: [s("𓏙", "dj", "conical loaf"), s("𓆑", "f", "horned viper"), s("𓉐", "pr", "house"), s("𓂋", "r", "mouth", "comp"), s("𓏏", "t", "bread loaf"), s("𓊤", "ḫrw", "oar (voice)")],
    translit: "dj.f prt-ḫrw", meaning: "that he may give a voice-offering",
    note: "The viper is the suffix ‘he’. prt-ḫrw is ‘what goes forth at the voice’.",
  },
  "hypostyle-hall": {
    title: "The good god, lord of the Two Lands", source: "Temple wall, Luxor", rtl: true,
    signs: [s("𓊹", "nṯr", "flag on a pole", "ideo"), s("𓄤", "nfr", "heart and windpipe", "ideo"), s("𓎟", "nb", "basket", "ideo"), s("𓇾", "tꜣ", "flat land", "ideo"), s("𓇾", "tꜣ", "flat land", "ideo")],
    translit: "nṯr nfr nb tꜣwy", meaning: "the good god, lord of the Two Lands",
    note: "Five ideograms, the land sign doubled for the dual. Start where the signs face.",
  },
  "inner-sanctum": {
    title: "For the ka of Ameny", source: "Stela of Ameny, Middle Kingdom",
    signs: [s("𓈖", "n", "ripple"), s("𓂓", "kꜣ", "two arms (ka)", "ideo"), s("𓈖", "n", "ripple"), s("𓇋", "ꞽ", "reed"), s("𓏠", "mn", "gaming board"), s("𓈖", "n", "ripple", "comp"), s("𓇌", "y", "double reed"), s("𓐙", "mꜣꜥ", "plinth", "ideo"), s("𓊤", "ḫrw", "oar (voice)", "ideo")],
    translit: "n kꜣ n ꞽmny mꜣꜥ-ḫrw", meaning: "for the ka of Ameny, true of voice",
    note: "Nine signs at every level: sound, word, silent classifier. Nothing left to teach you.",
  },
};

/** Second pass is open once the lesson is cleared (the Ladder tool from level 4 was the old rule; everyone gets it now). */
export function secondPassOpen(progress: LessonProgressMap | null, lessonId: string): boolean {
  return !!progress?.[lessonId]?.completed && !!SECOND_PASS[lessonId];
}

// ─────────────────────────── Choice points ───────────────────────────

export type ChoiceOption = { id: string; label: string; outcome: string; torches: number; right: boolean };
export type ChoicePoint = {
  id: string;
  lessonId: string;
  /** Where in the lesson it appears */
  at: "after-intro" | "before-mechanic";
  speaker: string;
  prompt: string;
  options: ChoiceOption[];
};

export const CHOICES: ChoicePoint[] = [
  {
    id: "l1-doorway", lessonId: "expedition-begins", at: "after-intro", speaker: "Dr Halima Rashid, chief epigrapher",
    prompt: "A lintel at the foot of the ridge carries a single line of signs. The birds in it face right. Where do we start reading?",
    options: [
      { id: "right", label: "From the right, into the faces", outcome: "Correct. You read into the faces of the signs. Dr Rashid tops up your lamp.", torches: 1, right: true },
      { id: "left", label: "From the left, like English", outcome: "You start at the wrong end and the line reads as nonsense. Half an hour of daylight gone, and one lamp with it.", torches: -1, right: false },
    ],
  },
  {
    id: "l1-force", lessonId: "expedition-begins", at: "before-mechanic", speaker: "Saleh, site foreman",
    prompt: "The men have found a blocked doorway. Saleh has a crowbar. There is writing on the blocking stone.",
    options: [
      { id: "read", label: "Read the stone first", outcome: "The stone names the owner of the room beyond. You copy it before it is broken, and the record is saved. One lamp added.", torches: 1, right: true },
      { id: "force", label: "Force it now, read it later", outcome: "The stone splits along the inscription. Two signs are lost for good. Dr Rashid says nothing, which is worse.", torches: -1, right: false },
    ],
  },
  {
    id: "l2-snake", lessonId: "outer-courtyard", at: "after-intro", speaker: "Saleh, site foreman",
    prompt: "A horned viper is coiled on the warm stone of the courtyard, exactly where the viper sign 𓆑 is carved. Saleh wants to kill it.",
    options: [
      { id: "wait", label: "Wait for it to move", outcome: "It slides off into the rubble in a minute. The carving beneath it is the ‘f’ you came for, and you saw the sign and its model side by side. One lamp added.", torches: 1, right: true },
      { id: "kill", label: "Let him kill it", outcome: "The stone is chipped in the struggle. The viper sign on it is now unreadable. You learn it from the notebook instead.", torches: -1, right: false },
    ],
  },
  {
    id: "l2-owl", lessonId: "outer-courtyard", at: "before-mechanic", speaker: "Dr Halima Rashid, chief epigrapher",
    prompt: "An owl 𓅓 is carved on the wall beside a lion. Saleh says it means ‘wisdom’, like the Greeks.",
    options: [
      { id: "sound", label: "It's a sound, m, nothing more", outcome: "Right. The owl is the commonest sign in the language and it is pure sound. Dr Rashid nods. One lamp added.", torches: 1, right: true },
      { id: "wisdom", label: "Agree: it's a symbol of wisdom", outcome: "The Greeks loved the owl for Athena. The Egyptians used it for ‘m’ and nothing else. A wasted hour reading meaning into a letter.", torches: -1, right: false },
    ],
  },
  {
    id: "l3-graffito", lessonId: "pilgrims-gallery", at: "after-intro", speaker: "Dr Halima Rashid, chief epigrapher",
    prompt: "Two graffiti spell the same sounds, s-š. One ends with a seated man 𓀀, one with a papyrus roll 𓏛. Are they the same word?",
    options: [
      { id: "different", label: "No: the silent sign changes the meaning", outcome: "A man: a scribe. A roll: the writing itself. Same sounds, two words. One lamp added.", torches: 1, right: true },
      { id: "same", label: "Yes: same sounds, same word", outcome: "You log both as ‘scribe’. The second is ‘writing’. Dr Rashid corrects the register and you lose a lamp to the rewrite.", torches: -1, right: false },
    ],
  },
  {
    id: "l3-pilgrim", lessonId: "pilgrims-gallery", at: "before-mechanic", speaker: "Saleh, site foreman",
    prompt: "A pilgrim has scratched a boat 𓊛 after his name. Saleh asks what the boat means.",
    options: [
      { id: "travelled", label: "He came by river: the boat classifies ‘to travel’", outcome: "Yes. The boat is a determinative for sailing and travel. He was a visitor, and proud of the journey. One lamp added.", torches: 1, right: true },
      { id: "boatman", label: "It says he was a boatman", outcome: "The sign is silent; it classifies, it does not name a job. Saleh looks unconvinced and the daylight moves on.", torches: -1, right: false },
    ],
  },
  {
    id: "l4-ledger", lessonId: "the-treasury", at: "after-intro", speaker: "Nour, site accountant",
    prompt: "A docket reads 𓎆𓎆𓎆𓏤𓏤. Nour has written ‘five’ in the register.",
    options: [
      { id: "32", label: "Correct it: three hobbles and two strokes is 32", outcome: "Thirty-two. Nour rewrites it and hands you a lamp for the trouble.", torches: 1, right: true },
      { id: "5", label: "Leave it: five signs, five jars", outcome: "Five signs is not five jars. Twenty-seven jars vanish from the record and someone will be blamed.", torches: -1, right: false },
    ],
  },
  {
    id: "l4-thousand", lessonId: "the-treasury", at: "before-mechanic", speaker: "Nour, site accountant",
    prompt: "A wall lists ‘bread, beer, oxen, fowl’ and then a single lotus 𓆼. Nour says the lotus is decoration.",
    options: [
      { id: "thousand", label: "It's the numeral 1,000: a thousand of each", outcome: "The whole list is multiplied by a thousand. The tomb owner ate well in the afterlife. One lamp added.", torches: 1, right: true },
      { id: "flower", label: "Agree: it's just a flower", outcome: "A thousand oxen written off as a flower. The auditor in you should have known better.", torches: -1, right: false },
    ],
  },
  {
    id: "l5-soot", lessonId: "royal-hall", at: "after-intro", speaker: "Curator Elena Marsh",
    prompt: "The cartouches are black with soot. Elena has a wire brush and a soft one.",
    options: [
      { id: "soft", label: "The soft brush, slowly", outcome: "Gilding survives under the soot. The names come up gold. One lamp added.", torches: 1, right: true },
      { id: "wire", label: "The wire brush, quickly", outcome: "The soot comes off, and so does the gold leaf. Elena takes the brush away and the lamp with it.", torches: -1, right: false },
    ],
  },
  {
    id: "l5-amun", lessonId: "royal-hall", at: "before-mechanic", speaker: "Curator Elena Marsh",
    prompt: "In one cartouche, the god Amun's name is carved first. Elena asks whether it is read first too.",
    options: [
      { id: "last", label: "No: carved first for honour, read last", outcome: "Honorific transposition. The god outranks the king on the wall, not in the reading. One lamp added.", torches: 1, right: true },
      { id: "first", label: "Yes: what is carved first is read first", outcome: "You read ‘Amun-tut-ankh’. There was never such a king. A lamp burns down while you argue.", torches: -1, right: false },
    ],
  },
  {
    id: "l6-collapse", lessonId: "sacred-chapel", at: "after-intro", speaker: "Saleh, site foreman",
    prompt: "The passage roof has come down. Saleh can dig through by morning, or you can go round by the courtyard and re-check the earlier walls on the way.",
    options: [
      { id: "round", label: "Go round: re-read the old walls", outcome: "You reach the chapel with every earlier sign fresh in your mind. One lamp added.", torches: 1, right: true },
      { id: "dig", label: "Dig straight through", outcome: "You break through at dawn, tired and with a lamp burned out, and the chapel's signs look strange without the review.", torches: -1, right: false },
    ],
  },
  {
    id: "l6-speak", lessonId: "sacred-chapel", at: "before-mechanic", speaker: "Dr Halima Rashid, chief epigrapher",
    prompt: "The formula is a ‘voice-offering’. Dr Rashid asks you to read it out loud before writing it. Saleh laughs.",
    options: [
      { id: "aloud", label: "Read it aloud", outcome: "The Egyptians believed the words fed the dead when spoken. You did what the stela asks. One lamp added.", torches: 1, right: true },
      { id: "silent", label: "Read it silently", outcome: "Nothing happens, of course. But you have missed the point of the text, and Dr Rashid says so.", torches: -1, right: false },
    ],
  },
  {
    id: "l7-lamp", lessonId: "hypostyle-hall", at: "after-intro", speaker: "Saleh, site foreman",
    prompt: "The hall is vast and the lamp oil is low. Saleh says read fast; Dr Rashid says read the jambs in pairs.",
    options: [
      { id: "pairs", label: "Read the jambs in pairs", outcome: "The same text on both sides of each door: read one, the other is free. You save oil. One lamp added.", torches: 1, right: true },
      { id: "fast", label: "Read as fast as you can", outcome: "You read the same epithet six times without noticing it was mirrored. Oil gone, and no further in.", torches: -1, right: false },
    ],
  },
  {
    id: "l7-face", lessonId: "hypostyle-hall", at: "before-mechanic", speaker: "Dr Halima Rashid, chief epigrapher",
    prompt: "On the left jamb the signs face right; on the right jamb they face left. Why?",
    options: [
      { id: "door", label: "Both face the doorway, so both face the king walking through", outcome: "Symmetry for the king's eye. You will never be lost in a temple doorway again. One lamp added.", torches: 1, right: true },
      { id: "error", label: "One side is a carver's mistake", outcome: "Every temple in Egypt makes the same ‘mistake’. Dr Rashid lets you work it out yourself, by lamplight.", torches: -1, right: false },
    ],
  },
  {
    id: "l8-door", lessonId: "inner-sanctum", at: "after-intro", speaker: "Dr Halima Rashid, chief epigrapher",
    prompt: "The sealed door. Every fragment of its line is uncovered. Dr Rashid offers you the field notebook.",
    options: [
      { id: "refuse", label: "Read it without the notebook", outcome: "You read the line unaided. This is what the whole expedition was for. One lamp added.", torches: 1, right: true },
      { id: "notebook", label: "Take the notebook", outcome: "You read it well enough, with help. Dr Rashid closes the book and says ‘next time, alone’.", torches: -1, right: false },
    ],
  },
  {
    id: "l8-name", lessonId: "inner-sanctum", at: "before-mechanic", speaker: "Saleh, site foreman",
    prompt: "Saleh asks whose tomb it is. The door ends n kꜣ n sš mꜣꜥ-ḫrw.",
    options: [
      { id: "scribe", label: "A scribe, ‘true of voice’", outcome: "For the ka of the scribe, justified. Saleh grins: ‘one of yours, then’. One lamp added.", torches: 1, right: true },
      { id: "king", label: "A king", outcome: "No cartouche anywhere on the door. A king would have one. Saleh takes the lamp back to the men.", torches: -1, right: false },
    ],
  },
];

export function choicesForLesson(lessonId: string): ChoicePoint[] {
  return CHOICES.filter((c) => c.lessonId === lessonId);
}

// ─────────────────────────── Letters home ───────────────────────────

export type LetterGap = { key: string; hint: string; symbol: string };
export type Letter = {
  lessonId: string;
  to: string;
  /** Paragraphs; `{{key}}` marks a gap */
  body: string[];
  gaps: LetterGap[];
};

export const LETTERS: Letter[] = [
  {
    lessonId: "expedition-begins", to: "Mum",
    body: [
      "We reached the site at noon. Dr Rashid put a lamp in my hand and a notebook, and by dark I could write my own name.",
      "The sign that stares straight back at you is the owl, {{m}}. Twenty-four more like it and I have the whole alphabet. The vulture, {{a}}, is my favourite: it looks exactly like the birds over the ridge.",
      "More soon. The next chamber is a courtyard full of animals.",
    ],
    gaps: [
      { key: "m", hint: "the owl, m", symbol: "𓅓" },
      { key: "a", hint: "the vulture, ꜣ", symbol: "𓄿" },
    ],
  },
  {
    lessonId: "outer-courtyard", to: "Dad",
    body: [
      "The courtyard is a zoo in stone. Saleh names every creature before I can find its sign.",
      "The lion {{lion}} lies across the wall as if it owned the place, and there is a lotus {{lotus}} carved on every pillar base. I can read ‘lion’ now, sound by sound, and then the lion itself appears to say I got it right.",
      "We sleep in the courtyard tonight. It is very quiet.",
    ],
    gaps: [
      { key: "lion", hint: "the lion", symbol: "𓃭" },
      { key: "lotus", hint: "the lotus", symbol: "𓆸" },
    ],
  },
  {
    lessonId: "pilgrims-gallery", to: "Jo",
    body: [
      "Pilgrims came here for a thousand years and scratched their names on the way in.",
      "The trick is the silent sign at the end of a word. A seated man {{man}} means the word is a person; a papyrus roll {{roll}} means it is an idea. The same sounds, two different words. Dr Rashid calls it the best invention in the language.",
      "I found one who came by boat. He wanted everyone to know.",
    ],
    gaps: [
      { key: "man", hint: "the seated man", symbol: "𓀀" },
      { key: "roll", hint: "the papyrus roll", symbol: "𓏛" },
    ],
  },
  {
    lessonId: "the-treasury", to: "Uncle Reza",
    body: [
      "You would love the Treasury. Rows of jars, and every row counted.",
      "Ten is a cattle hobble {{ten}} and a thousand is a lotus {{thousand}}. Nour, who keeps the accounts, has me checking dockets against the jars. One clerk was three jars short and I found him, four thousand years too late.",
      "Numbers are just signs stacked in the right order. I never thought I would say that.",
    ],
    gaps: [
      { key: "ten", hint: "ten", symbol: "𓎆" },
      { key: "thousand", hint: "a thousand", symbol: "𓆼" },
    ],
  },
  {
    lessonId: "royal-hall", to: "Mum",
    body: [
      "The Royal Hall was black with soot. We cleaned it with soft brushes, one cartouche a day, and the names came up in gold.",
      "The sun disc {{sun}} is Ra, and the ankh {{ankh}} is ‘life’. Tutankhamun is written with the god's name first out of politeness, and read with it last. Elena, the curator, says once you have seen it you cannot unsee it.",
      "I read Cleopatra today. Really read it.",
    ],
    gaps: [
      { key: "sun", hint: "the sun disc, Ra", symbol: "𓇳" },
      { key: "ankh", hint: "the ankh, life", symbol: "𓋹" },
    ],
  },
  {
    lessonId: "sacred-chapel", to: "Dad",
    body: [
      "The roof came down on the way to the chapel. We went round by the courtyard and I re-read every wall on the way. It helped.",
      "The chapel is one long prayer. It begins with an offering slab {{htp}} and a loaf {{dj}}: ‘an offering which the king gives’. Dr Rashid made me say it out loud. The Egyptians believed that fed the dead.",
      "So now I have said grace for someone who died before Rome.",
    ],
    gaps: [
      { key: "htp", hint: "the offering slab, ḥtp", symbol: "𓊵" },
      { key: "dj", hint: "the loaf, dj (give)", symbol: "𓏙" },
    ],
  },
  {
    lessonId: "hypostyle-hall", to: "Jo",
    body: [
      "The hall has forty columns and we had one lamp. Saleh wanted speed. Dr Rashid wanted pairs.",
      "The same words sit on both sides of every doorway, mirrored, so the god's flag {{god}} and the ‘good’ sign {{good}} face the king as he walks through. Read one jamb and the other is yours for free. We got through the hall on that trick alone.",
      "Two chambers left. The last one has a sealed door.",
    ],
    gaps: [
      { key: "god", hint: "the flag, god", symbol: "𓊹" },
      { key: "good", hint: "the heart and windpipe, good", symbol: "𓄤" },
    ],
  },
  {
    lessonId: "inner-sanctum", to: "Everyone",
    body: [
      "It is a scribe's tomb. I read the whole line on the door without the notebook.",
      "‘For the ka {{ka}} of the scribe {{s}}, true of voice.’ Dr Rashid shook my hand. Saleh said ‘one of yours, then’ and I suppose he is right.",
      "Coming home. I will read you the menu on the way.",
    ],
    gaps: [
      { key: "ka", hint: "the two arms, ka", symbol: "𓂓" },
      { key: "s", hint: "the folded cloth, s", symbol: "𓋴" },
    ],
  },
];

export function letterForLesson(lessonId: string): Letter | undefined {
  return LETTERS.find((l) => l.lessonId === lessonId);
}

/** Fill the template: each gap becomes the glyph given (or a blank). */
export function renderLetter(letter: Letter, filled: Record<string, string>): { paragraphs: (string | { gap: LetterGap; glyph: string | null })[][] } {
  const paragraphs = letter.body.map((p) => {
    const out: (string | { gap: LetterGap; glyph: string | null })[] = [];
    const re = /\{\{(\w+)\}\}/g;
    let last = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(p))) {
      if (m.index > last) out.push(p.slice(last, m.index));
      const gap = letter.gaps.find((g) => g.key === m![1]);
      if (gap) out.push({ gap, glyph: filled[gap.key] ?? null });
      last = m.index + m[0].length;
    }
    if (last < p.length) out.push(p.slice(last));
    return out;
  });
  return { paragraphs };
}

export function letterCorrect(letter: Letter, filled: Record<string, string>): boolean {
  return letter.gaps.every((g) => filled[g.key] === g.symbol);
}

// ─────────────────────────── Narrators & lesson shapes ───────────────────────────

export type Narrator = { name: string; role: string; glyph: string; voice: string };

export const NARRATORS: Record<string, Narrator> = {
  rashid: { name: "Dr Halima Rashid", role: "chief epigrapher", glyph: "𓁐", voice: "precise, dry, kind" },
  saleh: { name: "Saleh", role: "site foreman", glyph: "𓀀", voice: "practical, quick to laugh" },
  nour: { name: "Nour", role: "site accountant", glyph: "𓏞", voice: "exact to the jar" },
  marsh: { name: "Curator Elena Marsh", role: "museum curator", glyph: "𓁷", voice: "careful with gold leaf" },
};

export type QuickCheckMode = "standard" | "object" | "listen" | "speed" | "silent";

export type LessonShape = {
  lessonId: string;
  /** Who introduces the chamber and the mechanic */
  narrator: keyof typeof NARRATORS;
  /** The lesson's shape, in a phrase */
  shape: string;
  /** How the sign cards open: object first (3D model before the sign) */
  objectFirst?: boolean;
  /** Quick-check format for this chamber */
  quickCheck: QuickCheckMode;
  /** Field Notes reframed as clearing rubble after a collapse (longer review) */
  rubble?: boolean;
  /** The Read it stage runs with no tips or prompts */
  silentReading?: boolean;
  /** Heading for the mechanic stage */
  workTitle: string;
  workBlurb: string;
};

export const LESSON_SHAPES: Record<string, LessonShape> = {
  "expedition-begins": {
    lessonId: "expedition-begins", narrator: "rashid", shape: "A training day at Base Camp", quickCheck: "standard",
    workTitle: "Evening drill", workBlurb: "Sound to sign and back again, by lamplight, until you can spell your own name.",
  },
  "outer-courtyard": {
    lessonId: "outer-courtyard", narrator: "saleh", shape: "A field walk", objectFirst: true, quickCheck: "object",
    workTitle: "Field sketchbook", workBlurb: "Saleh points; you sketch. The creature first, then the sign the scribes cut for it.",
  },
  "pilgrims-gallery": {
    lessonId: "pilgrims-gallery", narrator: "rashid", shape: "Detective work among the graffiti", quickCheck: "standard",
    workTitle: "Who left this?", workBlurb: "Same sounds, different silent sign. Work out which pilgrim wrote which word.",
  },
  "the-treasury": {
    lessonId: "the-treasury", narrator: "nour", shape: "An audit", quickCheck: "speed",
    workTitle: "The audit", workBlurb: "Count the goods, write the tallies, then find the clerk who cooked the docket.",
  },
  "royal-hall": {
    lessonId: "royal-hall", narrator: "marsh", shape: "Cleaning the soot from the names", quickCheck: "listen",
    workTitle: "Under the soot", workBlurb: "Seven cartouches, black with lamp smoke. Read each one and the gold comes up.",
  },
  "sacred-chapel": {
    lessonId: "sacred-chapel", narrator: "rashid", shape: "A ritual: hear it, say it, write it", quickCheck: "listen", rubble: true,
    workTitle: "The offering", workBlurb: "Build the formula block by block, the way the priest would have spoken it.",
  },
  "hypostyle-hall": {
    lessonId: "hypostyle-hall", narrator: "saleh", shape: "A descent by lamplight", quickCheck: "speed",
    workTitle: "Before the lamp dies", workBlurb: "Read the doorways in pairs. Every clean jamb buys you more oil.",
  },
  "inner-sanctum": {
    lessonId: "inner-sanctum", narrator: "rashid", shape: "The silent exam", quickCheck: "silent", silentReading: true,
    workTitle: "Word anatomy", workBlurb: "Take a word apart by the job each sign does. No notebook this time.",
  },
};

export function lessonShape(lessonId: string): LessonShape {
  return LESSON_SHAPES[lessonId] ?? { lessonId, narrator: "rashid", shape: "A chamber", quickCheck: "standard", workTitle: "The work", workBlurb: "" };
}

export function narratorFor(lessonId: string): Narrator {
  return NARRATORS[lessonShape(lessonId).narrator];
}

// ─────────────────────────── The learner's cartouche ───────────────────────────

export type CartoucheTier = { level: number; name: string; frame: string; description: string };

export const CARTOUCHE_TIERS: CartoucheTier[] = [
  { level: 1, name: "Sketched", frame: "border-sand-500/40 text-sand-300", description: "A name in the field notebook, in pencil." },
  { level: 2, name: "Inked", frame: "border-sand-300/60 text-sand-100", description: "Inked over: the expedition knows your name." },
  { level: 3, name: "Painted", frame: "border-turquoise/60 text-turquoise", description: "Painted in Egyptian blue on the camp wall." },
  { level: 4, name: "Carved", frame: "border-gold-700 text-gold-400", description: "Cut into the sandstone of the courtyard." },
  { level: 5, name: "Gilded", frame: "border-gold-500 text-gold-300 shadow-[0_0_24px_rgba(212,168,50,0.25)]", description: "Gold leaf laid over the carving." },
  { level: 7, name: "Royal", frame: "border-gold-400 text-gold-200 shadow-[0_0_40px_rgba(212,168,50,0.45)]", description: "A rope-ring cartouche like a king's, on the Hall of Scribes." },
];

export function cartoucheTier(level: number): CartoucheTier {
  let out = CARTOUCHE_TIERS[0];
  for (const t of CARTOUCHE_TIERS) if (level >= t.level) out = t;
  return out;
}

// ─────────────────────────── Summary for the Journey tab ───────────────────────────

export function clearedCount(progress: LessonProgressMap | null): number {
  return orderedLessons().filter((l) => progress?.[l.id]?.completed).length;
}

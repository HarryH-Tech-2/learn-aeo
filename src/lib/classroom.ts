/**
 * Classroom mode — Kahoot-style live quiz. Pure rules: room codes, the
 * question bank, the room state machine and scoring. Persistence is in
 * Prisma (ClassRoom + ClassTeam) and the API routes under /api/class; the
 * projector (/teachers/class) and the pupils' phones (/play/<code>) poll
 * every 1.5 s. No websockets, no third-party vendor, no pupil accounts:
 * a team name is the only thing a pupil types.
 */
import { seededRandom, seededShuffle, DAILY_CARTOUCHES } from "@/lib/daily";
import { catalogue, soundKey, type WallSign } from "@/lib/wall";

export const CODE_LENGTH = 6;
export const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O, 1/I
export const QUESTION_MS = 20_000;
/** "Get ready" before each question: the host's Start/Next opens the question this far in the future. */
export const LEAD_MS = 3_500;
export const REVEAL_MS = 8_000;
export const ROOM_TTL_MS = 3 * 60 * 60 * 1000;
export const POLL_MS = 1500;
export const MAX_TEAMS = 60;
export const MAX_NAME = 20;
export const DEFAULT_QUESTIONS = 10;

export function generateCode(rnd: () => number = Math.random): string {
  let s = "";
  for (let i = 0; i < CODE_LENGTH; i++) s += CODE_ALPHABET[Math.floor(rnd() * CODE_ALPHABET.length)];
  return s;
}

export function isValidCode(code: string): boolean {
  return new RegExp(`^[${CODE_ALPHABET}]{${CODE_LENGTH}}$`).test(code);
}

/** Team names: letters, digits, spaces, a few marks; trimmed; no URLs. */
export function cleanTeamName(raw: string): string | null {
  const s = raw.replace(/\s+/g, " ").trim().slice(0, MAX_NAME);
  if (s.length < 2) return null;
  if (!/^[\p{L}\p{N} '’!&-]+$/u.test(s)) return null;
  return s;
}

// ─── question bank ───

export type QuizKind = "name" | "animal" | "sound" | "cartouche";

export type QuizQuestion = {
  kind: QuizKind;
  prompt: string;
  /** big glyph(s) shown with the prompt, if any */
  glyph?: string;
  /** four options; for "animal" they are glyphs */
  options: string[];
  optionsAreGlyphs: boolean;
  answer: number;
  explain: string;
};

const ANIMAL_SIGNS = new Set(["𓄿", "𓅓", "𓅱", "𓆑", "𓃭", "𓆓", "𓆛"]);

function uniqBy<T>(items: T[], key: (t: T) => string): T[] {
  const seen = new Set<string>();
  return items.filter((t) => (seen.has(key(t)) ? false : (seen.add(key(t)), true)));
}

/**
 * KS2-friendly bank drawn from the alphabet signs and the easiest
 * cartouches: name the sign, spot the animal sign, spot the sound, whose
 * cartouche. Deterministic for a seed so the projector and phones agree.
 */
export function buildQuiz(seed: number, count: number = DEFAULT_QUESTIONS): QuizQuestion[] {
  const rnd = seededRandom(seed);
  const signs = catalogue().filter((s) => s.lessonId === "expedition-begins");
  const pick = (n: number, pool: WallSign[]) => seededShuffle(pool, Math.floor(rnd() * 1e9)).slice(0, n);
  const out: QuizQuestion[] = [];
  const kinds: QuizKind[] = ["name", "sound", "animal", "name", "sound", "cartouche", "animal", "name", "sound", "cartouche"];
  for (let i = 0; i < count; i++) {
    const kind = kinds[i % kinds.length];
    if (kind === "cartouche") {
      const easy = DAILY_CARTOUCHES.filter((c) => c.difficulty <= 2 && !c.king.includes("(") && c.id !== "ramesses1"); // same name as Ramesses II
      const [answer, ...others] = seededShuffle(easy, Math.floor(rnd() * 1e9)).slice(0, 4);
      const options = seededShuffle([answer, ...others].map((c) => c.king), Math.floor(rnd() * 1e9));
      out.push({ kind, prompt: "Whose name is in this cartouche?", glyph: answer.signs.map((s) => s.glyph).join(""), options, optionsAreGlyphs: false, answer: options.indexOf(answer.king), explain: `${answer.king}: ${answer.translit}. ${answer.meaning}` });
      continue;
    }
    if (kind === "animal") {
      const animals = signs.filter((s) => ANIMAL_SIGNS.has(s.glyph));
      const answer = pick(1, animals)[0];
      const others = uniqBy(pick(6, signs.filter((s) => s.glyph !== answer.glyph)), (s) => s.glyph).slice(0, 3);
      const opts = seededShuffle([answer, ...others], Math.floor(rnd() * 1e9));
      out.push({ kind, prompt: `Which sign is the ${answer.name.toLowerCase()}?`, options: opts.map((s) => s.glyph), optionsAreGlyphs: true, answer: opts.indexOf(answer), explain: `The ${answer.name.toLowerCase()} writes the sound ${answer.translit}.` });
      continue;
    }
    const answer = pick(1, signs)[0];
    if (kind === "name") {
      const others = uniqBy(pick(8, signs.filter((s) => s.name !== answer.name)), (s) => s.name).slice(0, 3);
      const opts = seededShuffle([answer, ...others], Math.floor(rnd() * 1e9));
      out.push({ kind, prompt: "What does this sign show?", glyph: answer.glyph, options: opts.map((s) => s.name), optionsAreGlyphs: false, answer: opts.indexOf(answer), explain: `It is the ${answer.name.toLowerCase()}, read ${answer.translit}.` });
    } else {
      const others = uniqBy(pick(8, signs.filter((s) => soundKey(s.translit) !== soundKey(answer.translit))), (s) => soundKey(s.translit)).slice(0, 3);
      const opts = seededShuffle([answer, ...others], Math.floor(rnd() * 1e9));
      out.push({ kind, prompt: "Which sound does this sign write?", glyph: answer.glyph, options: opts.map((s) => s.translit), optionsAreGlyphs: false, answer: opts.indexOf(answer), explain: `${answer.translit}, the ${answer.name.toLowerCase()}, said “${answer.pronunciation}”.` });
    }
  }
  return out;
}

// ─── room state ───

export type Phase = "lobby" | "question" | "reveal" | "finished";

export type RoomState = {
  phase: Phase;
  questionIndex: number;
  /** epoch ms when the current question opened */
  questionStartedAt: number | null;
  questionMs: number;
  total: number;
};

/** `ms`: how long after the question opened the answer came (rooms opened before 2026-10-12 lack it) */
export type TeamAnswer = { choice: number; at: number; ms?: number };
export type TeamAnswers = Record<string, TeamAnswer>; // key = question index

export type Team = { id: string; name: string; answers: TeamAnswers; lastSeenAt: number };

export const initialRoom = (total: number): RoomState => ({ phase: "lobby", questionIndex: -1, questionStartedAt: null, questionMs: QUESTION_MS, total });

export type HostAction = "start" | "reveal" | "next" | "end";

export function reduceRoom(state: RoomState, action: HostAction, now: number): RoomState {
  switch (action) {
    case "start":
      if (state.phase !== "lobby") return state;
      return { ...state, phase: "question", questionIndex: 0, questionStartedAt: now };
    case "reveal":
      if (state.phase !== "question") return state;
      return { ...state, phase: "reveal" };
    case "next": {
      if (state.phase !== "reveal" && state.phase !== "question") return state;
      const nextIndex = state.questionIndex + 1;
      if (nextIndex >= state.total) return { ...state, phase: "finished", questionStartedAt: null };
      return { ...state, phase: "question", questionIndex: nextIndex, questionStartedAt: now };
    }
    case "end":
      return { ...state, phase: "finished", questionStartedAt: null };
  }
}

/** The question is over when the clock runs out even if the host hasn't tapped Reveal. */
export function effectivePhase(state: RoomState, now: number): Phase {
  if (state.phase === "question" && state.questionStartedAt !== null && now - state.questionStartedAt >= state.questionMs) return "reveal";
  return state.phase;
}

export function msLeft(state: RoomState, now: number): number {
  if (state.phase !== "question" || state.questionStartedAt === null) return 0;
  return Math.min(state.questionMs, Math.max(0, state.questionMs - (now - state.questionStartedAt)));
}

/** Time still to go before the question on its way opens (the "get ready" count). */
export function leadLeft(state: RoomState, now: number): number {
  if (state.phase !== "question" || state.questionStartedAt === null) return 0;
  return Math.max(0, state.questionStartedAt - now);
}

/** Can this team still answer question `index` right now? */
export function canAnswer(state: RoomState, index: number, now: number): boolean {
  return effectivePhase(state, now) === "question" && state.questionIndex === index && leadLeft(state, now) === 0;
}

/** Kahoot-style: 1000 for instant, sliding to 500 at the buzzer; 0 if wrong. Rounded to tens. */
export function pointsFor(correct: boolean, elapsedMs: number, questionMs: number = QUESTION_MS): number {
  if (!correct) return 0;
  const frac = Math.max(0, Math.min(1, elapsedMs / questionMs));
  return Math.round((1000 - 500 * frac) / 10) * 10;
}

export function scoreTeam(quiz: QuizQuestion[], answers: TeamAnswers, state: RoomState): number {
  let total = 0;
  for (const [k, a] of Object.entries(answers)) {
    const i = Number(k);
    const q = quiz[i];
    if (!q) continue;
    // Only questions already asked count (an answer can't be for the future).
    if (i > state.questionIndex) continue;
    const started = i === state.questionIndex && state.questionStartedAt !== null ? state.questionStartedAt : a.at;
    total += pointsFor(a.choice === q.answer, a.ms ?? Math.max(0, a.at - started), state.questionMs);
  }
  return total;
}

/** `streak`: correct answers in a row up to the question on screen */
export type Standing = { id: string; name: string; score: number; rank: number; lastCorrect: boolean | null; streak: number };

export function streakOf(quiz: QuizQuestion[], answers: TeamAnswers, upTo: number): number {
  let n = 0;
  for (let i = upTo; i >= 0; i--) {
    const a = answers[String(i)];
    if (!a || !quiz[i] || a.choice !== quiz[i].answer) break;
    n++;
  }
  return n;
}

/** How many teams chose each option of question `index`. */
export function distribution(quiz: QuizQuestion[], teams: Team[], index: number): number[] {
  const counts = (quiz[index]?.options ?? []).map(() => 0);
  for (const t of teams) {
    const a = t.answers[String(index)];
    if (a && a.choice >= 0 && a.choice < counts.length) counts[a.choice]++;
  }
  return counts;
}

/** The quickest right answer to question `index`, if anyone got it. */
export function fastest(quiz: QuizQuestion[], teams: Team[], index: number): { name: string; ms: number } | null {
  let best: { name: string; ms: number } | null = null;
  for (const t of teams) {
    const a = t.answers[String(index)];
    if (!a || !quiz[index] || a.choice !== quiz[index].answer || a.ms === undefined) continue;
    if (!best || a.ms < best.ms) best = { name: t.name, ms: a.ms };
  }
  return best;
}

export function standings(quiz: QuizQuestion[], teams: Team[], state: RoomState): Standing[] {
  const rows = teams.map((t) => {
    const a = state.questionIndex >= 0 ? t.answers[String(state.questionIndex)] : undefined;
    const q = quiz[state.questionIndex];
    return { id: t.id, name: t.name, score: scoreTeam(quiz, t.answers, state), lastCorrect: a && q ? a.choice === q.answer : null, streak: streakOf(quiz, t.answers, state.questionIndex) };
  });
  rows.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
  return rows.map((r, i) => ({ ...r, rank: i + 1 }));
}

/** What a phone or the projector may see: the answer only once the question is over. */
export function publicQuestion(q: QuizQuestion | undefined, revealed: boolean): Omit<QuizQuestion, "answer" | "explain"> & { answer?: number; explain?: string } {
  if (!q) return { kind: "name", prompt: "", options: [], optionsAreGlyphs: false };
  const { answer, explain, ...rest } = q;
  return revealed ? { ...rest, answer, explain } : rest;
}

export function isExpired(createdAt: number, now: number): boolean {
  return now - createdAt >= ROOM_TTL_MS;
}

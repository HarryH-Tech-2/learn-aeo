// Shared class strings and small helpers for the lesson player. Colours use the
// theme tokens (remapped under html.light), so every state reads in both themes.

import type { CodeLanguage, Question } from "@/lib/lesson-types";
import type { QuestionResponse } from "@/lib/questions";
import { seedFrom, shuffled } from "@/lib/questions";

export const FOCUS =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400";

export const BTN_PRIMARY =
  "inline-flex items-center justify-center gap-2 rounded-full bg-cyan-500 px-6 py-3 font-sans text-sm font-semibold text-obsidian transition-colors enabled:hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-40 " +
  FOCUS;

export const BTN_SECONDARY =
  "inline-flex items-center justify-center gap-2 rounded-full border border-sand-500/50 px-5 py-2.5 font-sans text-sm font-semibold text-sand-200 transition-colors enabled:hover:border-cyan-500 enabled:hover:text-cyan-400 disabled:cursor-not-allowed disabled:opacity-40 " +
  FOCUS;

/** An answer option: a full-width tappable card. */
export function optionClass(selected: boolean): string {
  return [
    "w-full rounded-xl border px-4 py-3 text-left font-sans text-[0.95rem] leading-relaxed transition-colors disabled:cursor-default",
    FOCUS,
    selected
      ? "border-cyan-500 bg-cyan-500/10 text-sand-100"
      : "border-sand-500/35 bg-obsidian-lighter text-sand-200 enabled:hover:border-cyan-500/70",
  ].join(" ");
}

export const EYEBROW = "font-sans text-xs font-semibold uppercase tracking-[0.14em] text-cyan-400";
export const HEADING = "font-display text-3xl leading-tight text-sand-100 sm:text-4xl";
export const PROSE = "max-w-[68ch] font-sans text-base leading-relaxed text-sand-300";

export const LANGUAGE_LABEL: Record<CodeLanguage, string> = {
  text: "Text",
  robots: "robots.txt",
  json: "JSON",
  html: "HTML",
  http: "HTTP",
  markdown: "Markdown",
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2025-05-21" gives "21 May 2025"; "2025-05" gives "May 2025". Parsed by hand, so no time zone shifts the day. */
export function formatSourceDate(s: string): string {
  const [y, m, d] = s.split("-");
  const month = MONTHS[Number(m) - 1];
  if (!y || !month) return s;
  return d ? `${Number(d)} ${month} ${y}` : `${month} ${y}`;
}

export type QuestionOf<K extends Question["kind"]> = Extract<Question, { kind: K }>;

/** Props shared by the six question inputs. `onChange(null)` means the answer is not complete yet. */
export type QuestionInputProps<K extends Question["kind"]> = {
  question: QuestionOf<K>;
  locked: boolean;
  onChange: (response: QuestionResponse | null) => void;
};

/** Display order of `n` options: original indices, shuffled by the question id. */
export function displayOrder(n: number, id: string): number[] {
  return shuffled(
    Array.from({ length: n }, (_, i) => i),
    seedFrom(id),
  );
}

/** The starting order for an order question, as original item indices: shuffled, and never already correct. */
export function startingOrder(n: number, id: string): number[] {
  const out = displayOrder(n, id);
  if (out.length > 1 && out.every((orig, i) => orig === i)) out.push(out.shift() as number);
  return out;
}

export const PASSAGE_LETTERS = ["A", "B"] as const;

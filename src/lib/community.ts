/**
 * The Community board: the parts with no database in them, so they can be
 * tested. Limits, cleaning of what people type, the preview a free account
 * sees of a thread it cannot open, and dates as the board shows them.
 */

export const TITLE_MAX = 120;
export const BODY_MAX = 2000;
export const SNIPPET_LENGTH = 140;

/** A question as the list shows it: enough to decide whether to open it, not the thread itself. */
export type QuestionSummary = {
  id: string;
  title: string;
  snippet: string;
  authorName: string;
  createdAt: string;
  answers: number;
  /** the signed-in reader wrote it */
  mine: boolean;
};

export type Answer = {
  id: string;
  authorName: string;
  body: string;
  createdAt: string;
  mine: boolean;
};

export type QuestionThread = {
  id: string;
  title: string;
  body: string;
  authorName: string;
  createdAt: string;
  answers: Answer[];
};

/** Whitespace tidied, hard limits applied; `null` when there is nothing left. */
export function cleanText(raw: unknown, max: number): string | null {
  if (typeof raw !== "string") return null;
  const text = raw.replace(/\r\n?/g, "\n").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  if (!text) return null;
  return text.length > max ? text.slice(0, max).trim() : text;
}

/** A one-line title: no line breaks, no run of spaces. */
export function cleanTitle(raw: unknown): string | null {
  const t = cleanText(raw, TITLE_MAX);
  return t ? t.replace(/\s+/g, " ") : null;
}

/** The first sentence or so of a body, cut at a word, for the list a free account can read. */
export function snippet(body: string, length = SNIPPET_LENGTH): string {
  const flat = body.replace(/\s+/g, " ").trim();
  if (flat.length <= length) return flat;
  const cut = flat.slice(0, length);
  const atWord = cut.lastIndexOf(" ");
  return (atWord > length * 0.6 ? cut.slice(0, atWord) : cut).replace(/[,;:\-–]$/, "") + "…";
}

/** The name shown on a post: the account's name, or the front of the address, never the whole address. */
export function displayName(user: { name?: string | null; email?: string | null }): string {
  const name = user.name?.trim();
  if (name) return name;
  const local = user.email?.split("@")[0]?.trim();
  if (local) return local.charAt(0).toUpperCase() + local.slice(1);
  return "A learner";
}

/** "Today", "Yesterday", "3 days ago", then "12 Aug", with the year once it differs. */
export function whenPosted(iso: string, now = new Date()): string {
  const d = new Date(iso);
  const days = Math.floor((startOfDay(now) - startOfDay(d)) / 86_400_000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  const sameYear = d.getFullYear() === now.getFullYear();
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", ...(sameYear ? {} : { year: "numeric" }) });
}

function startOfDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

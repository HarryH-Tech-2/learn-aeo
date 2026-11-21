// The Share of Voice Tracker's logic (src/app/tools/share-of-voice-tracker): find which tracked brands an AI answer
// names and which of their sites it cites, then score a run with the course's definitions (lesson 7):
//   mention rate   = answers that name the brand ÷ answers checked
//   citation rate  = answers that cite the brand's site ÷ answers checked
//   share of voice = the brand's mentions ÷ mentions of every tracked brand, across the same answers
// A "mention" is counted once per answer (an answer that names a brand five times still counts once), so one long
// answer can't swamp the rest. Pure functions: no DOM, no storage. Runs in the browser; nothing is sent anywhere.

export type Brand = {
  /** The brand's name as the user typed it; matched like an alias. */
  name: string;
  /** Other names to match: product names, an old name, a short form. */
  aliases: string[];
  /** The brand's site, e.g. example.com (any subdomain counts). Empty when unknown. */
  domain: string;
};

export type Setup = {
  /** brands[0] is the user's brand; the rest are competitors. */
  brands: Brand[];
  prompts: string[];
  platforms: string[];
};

/** Pasted answers, keyed by answerKey(promptIndex, platform). An empty or missing answer wasn't checked. */
export type Answers = Record<string, string>;

export type BrandResult = {
  name: string;
  mentions: number;
  citations: number;
  /** Answers in which this brand is the first tracked brand named. */
  namedFirst: number;
  mentionRate: number;
  citationRate: number;
  shareOfVoice: number;
};

export type AnswerResult = {
  promptIndex: number;
  platform: string;
  /** Names of the brands this answer mentions, in the order they first appear. */
  mentioned: string[];
  cited: string[];
};

export type RunResult = {
  answersChecked: number;
  brands: BrandResult[];
  /** The user's brand (brands[0]) per platform: answers checked there, mention rate and share of voice. */
  byPlatform: { platform: string; answers: number; mentionRate: number; shareOfVoice: number }[];
  answers: AnswerResult[];
};

export const DEFAULT_PLATFORMS = ["ChatGPT", "Perplexity", "Google AI Mode", "Google AI Overviews", "Copilot", "Gemini", "Claude"];

export const MAX_BRANDS = 8;
export const MAX_PROMPTS = 50;

export function answerKey(promptIndex: number, platform: string): string {
  return `${promptIndex}::${platform}`;
}

/** Comma- or newline-separated names, trimmed, empties and duplicates (ignoring case) dropped. */
export function splitNames(input: string): string[] {
  const seen = new Set<string>();
  return input
    .split(/[,\n]/)
    .map((s) => s.trim())
    .filter((s) => s && !seen.has(s.toLowerCase()) && seen.add(s.toLowerCase()));
}

/** One prompt per line, trimmed, empties and duplicates dropped, capped at MAX_PROMPTS. */
export function splitPrompts(input: string): string[] {
  const seen = new Set<string>();
  return input
    .split("\n")
    .map((s) => s.trim())
    .filter((s) => s && !seen.has(s) && seen.add(s))
    .slice(0, MAX_PROMPTS);
}

/** A bare host from whatever was typed: "https://www.Example.com/path" → "example.com". "" if it isn't a domain. */
export function normalizeDomain(input: string): string {
  const host = input
    .trim()
    .toLowerCase()
    .replace(/^[a-z][a-z0-9+.-]*:\/\//, "")
    .replace(/^www\./, "")
    .split(/[/?#:]/)[0];
  return /^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(host) ? host : "";
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Matches any of the brand's names as a whole word or phrase, ignoring case. null if the brand has no names. */
function brandPattern(brand: Brand): RegExp | null {
  const names = [brand.name, ...brand.aliases].map((n) => n.trim()).filter(Boolean);
  if (!names.length) return null;
  // Longest first, so "Acme Cloud" wins over "Acme" when both are listed (only the position matters here).
  const alts = names.sort((a, b) => b.length - a.length).map((n) => escapeRegExp(n).replace(/\s+/g, "\\s+"));
  return new RegExp(`(?<![\\p{L}\\p{N}])(?:${alts.join("|")})(?![\\p{L}\\p{N}])`, "iu");
}

/** Where the answer first names the brand, or -1. */
export function firstMention(text: string, brand: Brand): number {
  const re = brandPattern(brand);
  if (!re) return -1;
  return text.search(re);
}

/**
 * Whether the answer cites the domain: it appears as a host (bare, in a URL, or as a subdomain), not as part of a
 * longer host. "example.com" matches "https://blog.example.com/x" and "example.com", not "notexample.com" or
 * "example.com.au".
 */
export function citesDomain(text: string, domain: string): boolean {
  const d = normalizeDomain(domain);
  if (!d) return false;
  const re = new RegExp(`(?<![a-z0-9-])(?:[a-z0-9-]+\\.)*${escapeRegExp(d)}(?![a-z0-9-]|\\.[a-z0-9])`, "i");
  return re.test(text);
}

function rate(n: number, of: number): number {
  return of ? n / of : 0;
}

export function analyzeAnswer(text: string, brands: Brand[]): { mentioned: string[]; cited: string[] } {
  const found = brands
    .map((b) => ({ name: b.name, at: firstMention(text, b) }))
    .filter((f) => f.at >= 0)
    .sort((a, b) => a.at - b.at);
  return {
    mentioned: found.map((f) => f.name),
    cited: brands.filter((b) => citesDomain(text, b.domain)).map((b) => b.name),
  };
}

/** Scores a run: every non-empty answer for a prompt and platform in the setup counts as checked. */
export function scoreRun(setup: Setup, answers: Answers): RunResult {
  const brands = setup.brands.filter((b) => b.name.trim());
  const results: AnswerResult[] = [];
  setup.prompts.forEach((_, promptIndex) => {
    for (const platform of setup.platforms) {
      const text = answers[answerKey(promptIndex, platform)]?.trim();
      if (!text) continue;
      results.push({ promptIndex, platform, ...analyzeAnswer(text, brands) });
    }
  });

  const checked = results.length;
  const totalMentions = results.reduce((n, r) => n + r.mentioned.length, 0);
  const brandResults: BrandResult[] = brands.map((b) => {
    const mentions = results.filter((r) => r.mentioned.includes(b.name)).length;
    const citations = results.filter((r) => r.cited.includes(b.name)).length;
    return {
      name: b.name,
      mentions,
      citations,
      namedFirst: results.filter((r) => r.mentioned[0] === b.name).length,
      mentionRate: rate(mentions, checked),
      citationRate: rate(citations, checked),
      shareOfVoice: rate(mentions, totalMentions),
    };
  });

  const you = brands[0]?.name;
  const byPlatform = setup.platforms
    .map((platform) => {
      const here = results.filter((r) => r.platform === platform);
      const all = here.reduce((n, r) => n + r.mentioned.length, 0);
      const mine = here.filter((r) => you !== undefined && r.mentioned.includes(you)).length;
      return { platform, answers: here.length, mentionRate: rate(mine, here.length), shareOfVoice: rate(mine, all) };
    })
    .filter((p) => p.answers > 0);

  return { answersChecked: checked, brands: brandResults, byPlatform, answers: results };
}

/** A whole-number percentage for display: 0.284 → "28%". */
export function pct(x: number): string {
  return `${Math.round(x * 100)}%`;
}

/** A saved run, kept in the browser to compare share of voice over time. */
export type SavedRun = { id: string; date: string; label: string; result: Pick<RunResult, "answersChecked" | "brands"> };

/** CSV of saved runs, one row per run and brand, for a spreadsheet. Cells with commas or quotes are quoted. */
export function runsToCsv(runs: SavedRun[]): string {
  const cell = (v: string | number) => {
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const head = ["date", "label", "brand", "answers_checked", "mentions", "citations", "named_first", "mention_rate", "citation_rate", "share_of_voice"];
  const rows = runs.flatMap((r) =>
    r.result.brands.map((b) => [
      r.date,
      r.label,
      b.name,
      r.result.answersChecked,
      b.mentions,
      b.citations,
      b.namedFirst,
      b.mentionRate.toFixed(3),
      b.citationRate.toFixed(3),
      b.shareOfVoice.toFixed(3),
    ]),
  );
  return [head, ...rows].map((row) => row.map(cell).join(",")).join("\n");
}

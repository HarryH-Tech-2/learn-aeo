// The AI Bot Log Analyzer's logic (src/app/tools/ai-bot-log-analyzer): read server access log lines, pick out requests
// from AI crawlers and fetchers (src/lib/ai-crawlers.ts) and the two big search crawlers for comparison, and summarize
// what each fetched and what status it got. Pure functions: the page streams the file through them in the browser, so
// a log never leaves the visitor's machine.
//
// Formats read: Apache/Nginx "combined" (and "common" plus a user agent), W3C extended logs (IIS, with a #Fields
// header), and JSON lines with common field names (Cloudflare, Vercel, Fastly-style and generic). A user agent can be
// faked, so every count is "claims to be"; the report says how to verify by IP.

import { AI_CRAWLERS, type CrawlerPurpose } from "./ai-crawlers";

export type BotKind = CrawlerPurpose | "search-engine";

export type Bot = { token: string; operator: string; kind: BotKind };

// Tokens that never appear as a user agent (they're robots.txt switches only), so a log can't contain them.
const ROBOTS_ONLY = new Set(["Google-Extended", "Applebot-Extended"]);

/** Classic search crawlers, shown alongside for comparison (Google's AI features use Googlebot; Copilot uses Bing). */
export const SEARCH_BOTS: readonly Bot[] = [
  { token: "Googlebot", operator: "Google", kind: "search-engine" },
  { token: "bingbot", operator: "Microsoft", kind: "search-engine" },
  { token: "Applebot", operator: "Apple", kind: "search-engine" },
];

export const AI_BOTS: readonly Bot[] = AI_CRAWLERS.filter((c) => !ROBOTS_ONLY.has(c.token)).map((c) => ({
  token: c.token,
  operator: c.operator,
  kind: c.purpose,
}));

// Longest token first, so "Claude-SearchBot" isn't taken for a shorter token it happens to contain.
const ALL_BOTS: readonly Bot[] = [...AI_BOTS, ...SEARCH_BOTS].sort((a, b) => b.token.length - a.token.length);
const BOT_PATTERNS = ALL_BOTS.map((b) => ({
  bot: b,
  re: new RegExp(`(?<![A-Za-z0-9-])${b.token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![A-Za-z0-9-])`, "i"),
}));

/** The bot a user agent claims to be, or null. */
export function classifyAgent(ua: string): Bot | null {
  for (const { bot, re } of BOT_PATTERNS) if (re.test(ua)) return bot;
  return null;
}

export type LogEntry = {
  ip: string;
  /** Epoch ms, or null when the time couldn't be read. */
  time: number | null;
  method: string;
  path: string;
  status: number;
  ua: string;
};

const MONTHS: Record<string, number> = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };

/** "10/Nov/2026:13:55:36 +0000" → epoch ms. */
function parseClfTime(s: string): number | null {
  const m = /^(\d{2})\/([A-Za-z]{3})\/(\d{4}):(\d{2}):(\d{2}):(\d{2})\s*([+-])(\d{2})(\d{2})$/.exec(s);
  if (!m) return null;
  const month = MONTHS[m[2].toLowerCase()];
  if (month === undefined) return null;
  const utc = Date.UTC(+m[3], month, +m[1], +m[4], +m[5], +m[6]);
  const offset = (m[7] === "-" ? -1 : 1) * (+m[8] * 60 + +m[9]) * 60_000;
  return utc - offset;
}

function parseAnyTime(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) {
    // seconds, milliseconds or nanoseconds (Cloudflare's EdgeStartTimestamp can be ns)
    if (v > 1e17) return Math.round(v / 1e6);
    if (v > 1e11) return v;
    return v * 1000;
  }
  if (typeof v !== "string" || !v) return null;
  if (/^\d+(\.\d+)?$/.test(v)) return parseAnyTime(Number(v));
  const clf = parseClfTime(v);
  if (clf !== null) return clf;
  const t = Date.parse(v);
  return Number.isNaN(t) ? null : t;
}

/** Path only, no query string (so /page?a=1 and /page?a=2 group together); a full URL keeps just its path. */
export function cleanPath(raw: string): string {
  let p = raw.trim();
  const abs = /^[a-z][a-z0-9+.-]*:\/\/[^/]+(\/.*)?$/i.exec(p);
  if (abs) p = abs[1] ?? "/";
  p = p.split(/[?#]/)[0];
  return p.startsWith("/") ? p : `/${p}`;
}

// combined: IP ident user [time] "METHOD path PROTO" status bytes "referer" "ua"  (anything may follow the ua)
const COMBINED = /^(\S+) \S+ \S+ \[([^\]]+)\] "(?:([A-Z]+) (\S+)(?: [^"]*)?|[^"]*)" (\d{3}) \S+(?: "[^"]*" "((?:[^"\\]|\\.)*)")?/;

function parseCombined(line: string): LogEntry | null {
  const m = COMBINED.exec(line);
  if (!m) return null;
  return {
    ip: m[1],
    time: parseClfTime(m[2]),
    method: m[3] ?? "",
    path: m[4] ? cleanPath(m[4]) : "",
    status: +m[5],
    ua: (m[6] ?? "").replace(/\\"/g, '"'),
  };
}

const JSON_KEYS = {
  ip: ["ClientIP", "client_ip", "clientIp", "remote_addr", "remoteAddr", "ip", "c-ip", "client.ip", "proxyClientIp"],
  time: ["EdgeStartTimestamp", "timestamp", "time", "@timestamp", "date", "datetime", "time_local", "start_time"],
  method: ["ClientRequestMethod", "method", "request_method", "http_method", "requestMethod"],
  path: ["ClientRequestURI", "ClientRequestPath", "path", "request_uri", "requestPath", "uri", "url", "request_path", "requestUrl"],
  status: ["EdgeResponseStatus", "OriginResponseStatus", "status", "status_code", "statusCode", "response_status", "responseStatusCode"],
  ua: ["ClientRequestUserAgent", "user_agent", "userAgent", "http_user_agent", "ua", "useragent", "user-agent"],
} as const;

function pick(obj: Record<string, unknown>, keys: readonly string[]): unknown {
  for (const k of keys) {
    // dotted keys look one level down (e.g. client.ip); nested request objects are flattened below
    if (k.includes(".")) {
      const [a, b] = k.split(".");
      const inner = obj[a];
      if (inner && typeof inner === "object" && b in inner) return (inner as Record<string, unknown>)[b];
    } else if (k in obj && obj[k] !== null && obj[k] !== "") return obj[k];
  }
  return undefined;
}

function parseJsonLine(line: string): LogEntry | null {
  let obj: unknown;
  try {
    obj = JSON.parse(line);
  } catch {
    return null;
  }
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) return null;
  // Flatten one level of nesting (Vercel/Fastly put request/response fields in sub-objects)
  const flat: Record<string, unknown> = { ...(obj as Record<string, unknown>) };
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    if (v && typeof v === "object" && !Array.isArray(v)) {
      for (const [k2, v2] of Object.entries(v as Record<string, unknown>)) if (!(k2 in flat)) flat[k2] = v2;
      flat[k] = v;
    }
  }
  const ua = pick(flat, JSON_KEYS.ua);
  const status = Number(pick(flat, JSON_KEYS.status));
  const path = pick(flat, JSON_KEYS.path);
  if (typeof ua !== "string" || !Number.isFinite(status)) return null;
  return {
    ip: String(pick(flat, JSON_KEYS.ip) ?? ""),
    time: parseAnyTime(pick(flat, JSON_KEYS.time)),
    method: String(pick(flat, JSON_KEYS.method) ?? ""),
    path: typeof path === "string" ? cleanPath(path) : "",
    status,
    ua,
  };
}

/** Parser state carried across lines: a W3C log's #Fields header maps the columns of the lines after it. */
export type ParseState = { w3cFields: string[] | null };

export function newParseState(): ParseState {
  return { w3cFields: null };
}

function parseW3c(line: string, fields: string[]): LogEntry | null {
  const cols = line.trim().split(/\s+/);
  if (cols.length !== fields.length) return null;
  const get = (...names: string[]) => {
    for (const n of names) {
      const i = fields.indexOf(n);
      if (i >= 0 && cols[i] !== "-") return cols[i];
    }
    return "";
  };
  const status = Number(get("sc-status"));
  if (!Number.isFinite(status) || !status) return null;
  const date = get("date");
  const time = get("time");
  return {
    ip: get("c-ip"),
    time: date && time ? parseAnyTime(`${date}T${time}Z`) : null,
    method: get("cs-method"),
    path: cleanPath(get("cs-uri-stem") || "/"),
    status,
    // W3C logs write spaces in the user agent as "+"
    ua: get("cs(user-agent)").replace(/\+/g, " "),
  };
}

/** One log line → an entry, or null if it isn't a request line this tool can read (headers return null too). */
export function parseLine(line: string, state: ParseState): LogEntry | null {
  const t = line.trim();
  if (!t) return null;
  if (t.startsWith("#")) {
    const m = /^#Fields:\s*(.+)$/i.exec(t);
    if (m) state.w3cFields = m[1].trim().toLowerCase().split(/\s+/);
    return null;
  }
  if (t.startsWith("{")) return parseJsonLine(t);
  if (state.w3cFields) {
    const e = parseW3c(t, state.w3cFields);
    if (e) return e;
  }
  return parseCombined(t);
}

// ---- aggregation ----

export type BotStats = {
  bot: Bot;
  hits: number;
  ok: number; // 2xx
  redirects: number; // 3xx
  clientErrors: number; // 4xx
  serverErrors: number; // 5xx
  pages: Map<string, number>;
  ips: Set<string>;
  first: number | null;
  last: number | null;
  robotsTxt: { hits: number; lastStatus: number | null };
};

export type Analysis = {
  lines: number;
  parsed: number;
  first: number | null;
  last: number | null;
  bots: Map<string, BotStats>;
  /** Pages AI bots got a 4xx or 5xx on: path → status → count, with which bots. */
  errors: Map<string, { status: number; hits: number; bots: Set<string> }>;
};

export function newAnalysis(): Analysis {
  return { lines: 0, parsed: 0, first: null, last: null, bots: new Map(), errors: new Map() };
}

const minT = (a: number | null, b: number | null) => (a === null ? b : b === null ? a : Math.min(a, b));
const maxT = (a: number | null, b: number | null) => (a === null ? b : b === null ? a : Math.max(a, b));

/** Adds one line to the running analysis (the page calls this for each line as the file streams in). */
export function addLine(a: Analysis, line: string, state: ParseState): void {
  if (!line.trim() || line.trimStart().startsWith("#")) {
    parseLine(line, state); // still read a #Fields header
    return;
  }
  a.lines++;
  const e = parseLine(line, state);
  if (!e) return;
  a.parsed++;
  a.first = minT(a.first, e.time);
  a.last = maxT(a.last, e.time);
  const bot = classifyAgent(e.ua);
  if (!bot) return;

  let s = a.bots.get(bot.token);
  if (!s) {
    s = { bot, hits: 0, ok: 0, redirects: 0, clientErrors: 0, serverErrors: 0, pages: new Map(), ips: new Set(), first: null, last: null, robotsTxt: { hits: 0, lastStatus: null } };
    a.bots.set(bot.token, s);
  }
  s.hits++;
  if (e.status >= 200 && e.status < 300) s.ok++;
  else if (e.status >= 300 && e.status < 400) s.redirects++;
  else if (e.status >= 400 && e.status < 500) s.clientErrors++;
  else if (e.status >= 500) s.serverErrors++;
  if (e.path) s.pages.set(e.path, (s.pages.get(e.path) ?? 0) + 1);
  if (e.ip) s.ips.add(e.ip);
  s.first = minT(s.first, e.time);
  s.last = maxT(s.last, e.time);
  if (e.path === "/robots.txt") {
    s.robotsTxt.hits++;
    s.robotsTxt.lastStatus = e.status;
  }

  if (bot.kind !== "search-engine" && e.status >= 400 && e.path) {
    const key = `${e.status} ${e.path}`;
    const err = a.errors.get(key) ?? { status: e.status, hits: 0, bots: new Set<string>() };
    err.hits++;
    err.bots.add(bot.token);
    a.errors.set(key, err);
  }
}

export function analyze(text: string): Analysis {
  const a = newAnalysis();
  const state = newParseState();
  for (const line of text.split(/\r?\n/)) addLine(a, line, state);
  return a;
}

/** Pages ranked by hits across the given bots, each with the bots that fetched it. */
export function topPages(stats: BotStats[], limit = 20): { path: string; hits: number; bots: string[] }[] {
  const all = new Map<string, { hits: number; bots: Set<string> }>();
  for (const s of stats) {
    for (const [path, n] of s.pages) {
      const p = all.get(path) ?? { hits: 0, bots: new Set<string>() };
      p.hits += n;
      p.bots.add(s.bot.token);
      all.set(path, p);
    }
  }
  return [...all.entries()]
    .map(([path, p]) => ({ path, hits: p.hits, bots: [...p.bots] }))
    .sort((x, y) => y.hits - x.hits || x.path.localeCompare(y.path))
    .slice(0, limit);
}

/** The bots in an analysis, AI first, each group by hits. */
export function sortedBots(a: Analysis): { ai: BotStats[]; search: BotStats[] } {
  const all = [...a.bots.values()].sort((x, y) => y.hits - x.hits);
  return { ai: all.filter((s) => s.bot.kind !== "search-engine"), search: all.filter((s) => s.bot.kind === "search-engine") };
}

/** CSV of the per-bot summary. */
export function botsToCsv(a: Analysis): string {
  const { ai, search } = sortedBots(a);
  const iso = (t: number | null) => (t === null ? "" : new Date(t).toISOString());
  const head = ["bot", "operator", "kind", "hits", "pages", "ips", "2xx", "3xx", "4xx", "5xx", "robots_txt_hits", "first_seen", "last_seen"];
  const rows = [...ai, ...search].map((s) => [
    s.bot.token,
    s.bot.operator,
    s.bot.kind,
    s.hits,
    s.pages.size,
    s.ips.size,
    s.ok,
    s.redirects,
    s.clientErrors,
    s.serverErrors,
    s.robotsTxt.hits,
    iso(s.first),
    iso(s.last),
  ]);
  return [head, ...rows].map((r) => r.join(",")).join("\n");
}

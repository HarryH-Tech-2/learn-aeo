"use client";

import { useRef, useState } from "react";
import {
  AI_BOTS,
  addLine,
  analyze,
  botsToCsv,
  newAnalysis,
  newParseState,
  sortedBots,
  topPages,
  type Analysis,
  type BotKind,
  type BotStats,
} from "@/lib/bot-log";
import { trackEvent } from "@/lib/analytics";

const KIND_LABEL: Record<BotKind, string> = {
  training: "Training",
  search: "AI search",
  user: "User fetch",
  other: "Other",
  "search-engine": "Search engine",
};

// A made-up log for "Try a sample": a few days of AI and search crawler traffic on an example shop. IPs are from the
// documentation ranges (RFC 5737), not the vendors' real ones.
function sampleLog(): string {
  const UA: Record<string, string> = {
    GPTBot: "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; GPTBot/1.3; +https://openai.com/gptbot",
    "OAI-SearchBot": "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; OAI-SearchBot/1.3; +https://openai.com/searchbot",
    "ChatGPT-User": "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; ChatGPT-User/1.0; +https://openai.com/bot",
    ClaudeBot: "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ClaudeBot/1.0; +claudebot@anthropic.com)",
    PerplexityBot: "Mozilla/5.0 (compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)",
    Googlebot: "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
    bingbot: "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0 Safari/537.36",
    browser: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36",
  };
  const plan: [string, string, number, string][] = [
    ["GPTBot", "/robots.txt", 200, "203.0.113.10"],
    ["GPTBot", "/guides/brew-loose-leaf", 200, "203.0.113.10"],
    ["GPTBot", "/shop/breakfast-blend", 200, "203.0.113.11"],
    ["GPTBot", "/blog/2019/old-offer", 404, "203.0.113.11"],
    ["OAI-SearchBot", "/robots.txt", 200, "203.0.113.20"],
    ["OAI-SearchBot", "/shop/breakfast-blend", 200, "203.0.113.20"],
    ["OAI-SearchBot", "/guides/brew-loose-leaf", 200, "203.0.113.20"],
    ["ChatGPT-User", "/shop/breakfast-blend?utm_source=chatgpt.com", 200, "203.0.113.30"],
    ["ChatGPT-User", "/shop/green-tea", 200, "203.0.113.31"],
    ["ClaudeBot", "/robots.txt", 200, "198.51.100.10"],
    ["ClaudeBot", "/guides/brew-loose-leaf", 200, "198.51.100.10"],
    ["ClaudeBot", "/search?q=green+tea", 403, "198.51.100.10"],
    ["ClaudeBot", "/search?q=oolong", 403, "198.51.100.11"],
    ["PerplexityBot", "/robots.txt", 200, "198.51.100.20"],
    ["PerplexityBot", "/guides/brew-loose-leaf", 200, "198.51.100.20"],
    ["PerplexityBot", "/shop/subscription", 500, "198.51.100.20"],
    ["Googlebot", "/", 200, "198.51.100.40"],
    ["Googlebot", "/shop/breakfast-blend", 200, "198.51.100.40"],
    ["Googlebot", "/guides/brew-loose-leaf", 200, "198.51.100.41"],
    ["bingbot", "/guides/brew-loose-leaf", 200, "198.51.100.50"],
    ["browser", "/", 200, "192.0.2.44"],
    ["browser", "/shop/breakfast-blend", 200, "192.0.2.44"],
  ];
  return plan
    .map(([bot, path, status, ip], i) => {
      const day = String(3 + (i % 4)).padStart(2, "0");
      const hh = String(8 + (i % 12)).padStart(2, "0");
      return `${ip} - - [${day}/Nov/2026:${hh}:${String((i * 7) % 60).padStart(2, "0")}:00 +0000] "GET ${path} HTTP/1.1" ${status} 2048 "-" "${UA[bot]}"`;
    })
    .join("\n");
}

const fmtDate = (t: number | null) =>
  t === null ? "–" : new Date(t).toLocaleString(undefined, { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
const fmtDay = (t: number | null) => (t === null ? "–" : new Date(t).toLocaleDateString(undefined, { day: "numeric", month: "short" }));
const n = (x: number) => x.toLocaleString();

function StatusBar({ s }: { s: BotStats }) {
  const parts = [
    { v: s.ok, cls: "bg-emerald-400/80", label: "2xx" },
    { v: s.redirects, cls: "bg-sand-400/70", label: "3xx" },
    { v: s.clientErrors, cls: "bg-amber-400/80", label: "4xx" },
    { v: s.serverErrors, cls: "bg-rose-500/80", label: "5xx" },
  ];
  return (
    <div className="flex h-2 w-24 overflow-hidden rounded-full bg-white/5" role="img" aria-label={parts.map((p) => `${p.label} ${p.v}`).join(", ")}>
      {parts.map((p) => (p.v ? <span key={p.label} className={p.cls} style={{ width: `${(p.v / s.hits) * 100}%` }} /> : null))}
    </div>
  );
}

function BotTable({ rows, caption }: { rows: BotStats[]; caption: string }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full font-body text-sm text-sand-300">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="text-left text-sand-400 border-b border-white/10">
            <th scope="col" className="py-2 pr-3 font-normal">Bot</th>
            <th scope="col" className="py-2 px-3 font-normal">Type</th>
            <th scope="col" className="py-2 px-3 font-normal text-right">Hits</th>
            <th scope="col" className="py-2 px-3 font-normal text-right">Pages</th>
            <th scope="col" className="py-2 px-3 font-normal">Status</th>
            <th scope="col" className="py-2 px-3 font-normal text-right">Errors</th>
            <th scope="col" className="py-2 px-3 font-normal text-right">robots.txt</th>
            <th scope="col" className="py-2 pl-3 font-normal text-right">Last seen</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((s) => {
            const errors = s.clientErrors + s.serverErrors;
            return (
              <tr key={s.bot.token} className="border-b border-white/5">
                <th scope="row" className="py-2 pr-3 text-left font-normal">
                  <span className="font-semibold text-sand-100">{s.bot.token}</span>{" "}
                  <span className="text-sand-500">{s.bot.operator}</span>
                </th>
                <td className="py-2 px-3 whitespace-nowrap">{KIND_LABEL[s.bot.kind]}</td>
                <td className="py-2 px-3 text-right text-sand-100">{n(s.hits)}</td>
                <td className="py-2 px-3 text-right">{n(s.pages.size)}</td>
                <td className="py-2 px-3"><StatusBar s={s} /></td>
                <td className={`py-2 px-3 text-right ${errors ? "text-amber-300" : ""}`}>
                  {errors ? `${n(errors)} (${Math.round((errors / s.hits) * 100)}%)` : "0"}
                </td>
                <td className="py-2 px-3 text-right">
                  {s.robotsTxt.hits ? `${s.robotsTxt.hits}× (${s.robotsTxt.lastStatus})` : <span className="text-sand-500">not fetched</span>}
                </td>
                <td className="py-2 pl-3 text-right whitespace-nowrap">{fmtDay(s.last)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function BotLogAnalyzer() {
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pasted, setPasted] = useState("");
  const [drag, setDrag] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const cancel = useRef(false);

  function finish(a: Analysis, source: string) {
    setAnalysis(a);
    setBusy(null);
    if (a.lines > 0 && a.parsed === 0) {
      setError("None of these lines look like an access log this tool can read. See “Which log formats work?” below.");
    } else setError(null);
    trackEvent("tool_used", { tool: "ai-bot-log-analyzer", source, bots: a.bots.size });
  }

  async function readFile(file: File) {
    setError(null);
    cancel.current = false;
    const a = newAnalysis();
    const state = newParseState();
    let done = 0;
    setBusy(`Reading ${file.name}…`);
    try {
      if (file.name.endsWith(".gz")) {
        throw new Error("gz");
      }
      const reader = file.stream().pipeThrough(new TextDecoderStream()).getReader();
      let carry = "";
      let sinceYield = 0;
      for (;;) {
        const { value, done: end } = await reader.read();
        if (end) break;
        if (cancel.current) {
          await reader.cancel();
          setBusy(null);
          return;
        }
        done += value.length;
        const parts = (carry + value).split(/\r?\n/);
        carry = parts.pop() ?? "";
        for (const line of parts) addLine(a, line, state);
        sinceYield += parts.length;
        if (sinceYield > 50_000) {
          sinceYield = 0;
          setBusy(`Reading ${file.name}… ${Math.min(99, Math.round((done / file.size) * 100))}%`);
          await new Promise((r) => setTimeout(r, 0));
        }
      }
      if (carry) addLine(a, carry, state);
      finish(a, "file");
    } catch (e) {
      setBusy(null);
      setError(
        e instanceof Error && e.message === "gz"
          ? "That file is compressed (.gz). Unzip it first, then choose the .log file."
          : "Couldn't read that file. Try a plain-text access log.",
      );
    }
  }

  const { ai, search } = analysis ? sortedBots(analysis) : { ai: [], search: [] };
  const aiHits = ai.reduce((x, s) => x + s.hits, 0);
  const errorRows = analysis
    ? [...analysis.errors.entries()].map(([key, e]) => ({ path: key.slice(4), ...e })).sort((x, y) => y.hits - x.hits).slice(0, 25)
    : [];
  const unseen = analysis ? AI_BOTS.filter((b) => !analysis.bots.has(b.token)) : [];

  function downloadCsv() {
    if (!analysis) return;
    const blob = new Blob([botsToCsv(analysis)], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "ai-bot-hits.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div className="space-y-8">
      <div className="card-ancient p-5 sm:p-8">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            const f = e.dataTransfer.files[0];
            if (f) void readFile(f);
          }}
          className={`rounded-xl border-2 border-dashed px-4 py-10 text-center transition-colors ${drag ? "border-cyan-400 bg-cyan-400/5" : "border-sand-500/30"}`}
        >
          <p className="font-display text-xl font-bold text-sand-100 mb-2">Drop an access log here</p>
          <p className="font-body text-sm text-sand-400 mb-5">Apache, Nginx, IIS, or JSON lines from Cloudflare, Vercel and others. It never leaves your browser.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <button type="button" onClick={() => fileInput.current?.click()} className="btn-primary py-2.5 px-5 text-sm" disabled={!!busy}>
              Choose a log file
            </button>
            <button
              type="button"
              onClick={() => {
                setPasted("");
                finish(analyze(sampleLog()), "sample");
              }}
              className="btn-secondary py-2.5 px-5 text-sm"
              disabled={!!busy}
            >
              Try a sample
            </button>
          </div>
          <input
            ref={fileInput}
            type="file"
            accept=".log,.txt,.json,.jsonl,.ndjson,.csv,text/plain,application/json"
            className="sr-only"
            tabIndex={-1}
            aria-hidden="true"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void readFile(f);
              e.target.value = "";
            }}
          />
        </div>

        <details className="mt-5">
          <summary className="cursor-pointer font-body text-sm text-cyan-400">Or paste log lines</summary>
          <textarea
            rows={6}
            value={pasted}
            onChange={(e) => setPasted(e.target.value)}
            placeholder={'203.0.113.5 - - [06/Nov/2026:10:00:00 +0000] "GET /pricing HTTP/1.1" 200 512 "-" "Mozilla/5.0 ... GPTBot/1.3 ..."'}
            className="mt-2 block w-full rounded-lg bg-obsidian-lighter border border-gold-700/30 focus:border-cyan-400/60 outline-none px-3 py-2.5 font-mono text-xs text-sand-100 placeholder:text-sand-600"
          />
          <button type="button" onClick={() => finish(analyze(pasted), "paste")} disabled={!pasted.trim()} className="btn-secondary mt-3 py-2 px-5 text-sm disabled:opacity-50">
            Analyze
          </button>
        </details>

        <div aria-live="polite" className="mt-4 font-body text-sm">
          {busy && (
            <p className="text-sand-300">
              {busy}{" "}
              <button type="button" onClick={() => (cancel.current = true)} className="ml-2 text-cyan-400 underline underline-offset-2">
                Stop
              </button>
            </p>
          )}
          {error && <p className="text-amber-300" role="alert">{error}</p>}
        </div>
      </div>

      {analysis && analysis.parsed > 0 && (
        <>
          <div className="card-ancient p-5 sm:p-8" aria-live="polite">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
              <div>
                <h2 className="font-display text-2xl font-bold text-sand-100 mb-1">AI bots in this log</h2>
                <p className="font-body text-sm text-sand-400">
                  {n(analysis.parsed)} requests read
                  {analysis.lines > analysis.parsed ? ` (${n(analysis.lines - analysis.parsed)} lines skipped)` : ""}, {fmtDate(analysis.first)} to{" "}
                  {fmtDate(analysis.last)}. {n(aiHits)} from AI bots ({analysis.parsed ? ((aiHits / analysis.parsed) * 100).toFixed(1) : 0}%).
                </p>
              </div>
              <button type="button" onClick={downloadCsv} className="rounded-full px-3 py-1 font-body text-sm text-cyan-300 border border-cyan-400/40 hover:bg-cyan-400/10">
                Download CSV
              </button>
            </div>
            {ai.length ? (
              <BotTable rows={ai} caption="AI bots" />
            ) : (
              <p className="font-body text-sand-300">
                No AI crawler or fetcher appears in this log. Check the date range covers a few days, that the log records user agents, and that
                your robots.txt, CDN or firewall isn&rsquo;t turning them away before they reach the server.
              </p>
            )}
            {search.length > 0 && (
              <>
                <h3 className="font-display text-lg font-bold text-sand-100 mt-8 mb-2">Search engine crawlers, for comparison</h3>
                <BotTable rows={search} caption="Search engine crawlers" />
              </>
            )}
            {unseen.length > 0 && ai.length > 0 && (
              <p className="mt-6 font-body text-sm text-sand-400">
                Not seen: {unseen.map((b) => b.token).join(", ")}.
              </p>
            )}
          </div>

          {errorRows.length > 0 && (
            <div className="card-ancient p-5 sm:p-8">
              <h2 className="font-display text-2xl font-bold text-sand-100 mb-1">Errors AI bots hit</h2>
              <p className="font-body text-sm text-sand-400 mb-4">
                Pages that answered an AI bot with a 4xx or 5xx. A 403 often means a firewall or bot rule; a 404 on a page you still want
                cited needs a redirect.
              </p>
              <ul className="space-y-2">
                {errorRows.map((r) => (
                  <li key={`${r.status} ${r.path}`} className="flex flex-wrap items-baseline gap-x-3 font-body text-sm">
                    <span className={`font-mono text-xs rounded px-1.5 py-0.5 ${r.status >= 500 ? "bg-rose-500/20 text-rose-300" : "bg-amber-400/15 text-amber-300"}`}>{r.status}</span>
                    <span className="font-mono text-sand-100 break-all">{r.path}</span>
                    <span className="text-sand-500">
                      {n(r.hits)}× · {[...r.bots].join(", ")}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {ai.length > 0 && (
            <div className="card-ancient p-5 sm:p-8">
              <h2 className="font-display text-2xl font-bold text-sand-100 mb-4">Pages AI bots fetch most</h2>
              <ol className="space-y-2">
                {topPages(ai).map((p) => (
                  <li key={p.path} className="flex flex-wrap items-baseline gap-x-3 font-body text-sm">
                    <span className="w-12 text-right text-sand-100">{n(p.hits)}</span>
                    <span className="font-mono text-sand-200 break-all">{p.path}</span>
                    <span className="text-sand-500">{p.bots.join(", ")}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </>
      )}
    </div>
  );
}

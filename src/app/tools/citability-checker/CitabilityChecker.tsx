"use client";

import { useState } from "react";
import Link from "next/link";
import type { CitabilityReport, CheckStatus } from "@/lib/citability";
import { trackEvent } from "@/lib/analytics";

type Result = (CitabilityReport & { truncated?: boolean }) | { error: string };

const STATUS_STYLE: Record<CheckStatus, { label: string; cls: string; icon: string }> = {
  pass: { label: "Pass", cls: "cite-pass", icon: "✓" },
  warn: { label: "Improve", cls: "cite-warn", icon: "!" },
  fail: { label: "Fix", cls: "cite-fail", icon: "✕" },
};

function verdict(score: number): string {
  if (score >= 85) return "Very easy to quote";
  if (score >= 65) return "Mostly quotable";
  if (score >= 45) return "Needs work";
  return "Hard to quote";
}

export default function CitabilityChecker() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [filter, setFilter] = useState<"all" | "todo">("all");

  async function check(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/tools/citability-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = (await res.json()) as Result;
      setResult(data);
      trackEvent("tool_used", { tool: "citability-checker", ok: res.ok });
    } catch {
      setResult({ error: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  const report = result && "checks" in result ? result : null;
  const shown = report ? report.checks.filter((c) => filter === "all" || c.status !== "pass") : [];
  const counts = report
    ? { pass: report.checks.filter((c) => c.status === "pass").length, warn: report.checks.filter((c) => c.status === "warn").length, fail: report.checks.filter((c) => c.status === "fail").length }
    : null;
  const C = 2 * Math.PI * 52;

  return (
    <div className="card-ancient p-5 sm:p-8">
      <form onSubmit={check} className="flex flex-col sm:flex-row gap-3">
        <label className="flex-1">
          <span className="sr-only">Page address</span>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="example.com/blog/your-post"
            inputMode="url"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            required
            className="w-full bg-obsidian-lighter border border-gold-700/30 focus:border-gold-500/60 outline-none px-4 py-3 font-body text-base text-sand-100 placeholder:text-sand-600"
          />
        </label>
        <button type="submit" disabled={loading} className="btn-primary px-6 py-3 disabled:opacity-60">
          {loading ? "Reading the page…" : "Check page"}
        </button>
      </form>

      {result && "error" in result && !report && (
        <p role="alert" className="mt-6 font-body text-base text-terracotta">
          {result.error}
        </p>
      )}

      {report && counts && (
        <div className="mt-8" aria-live="polite">
          <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
            <div className="relative w-32 h-32 shrink-0">
              <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90" aria-hidden="true">
                <circle cx="60" cy="60" r="52" className="dash-ring-track" />
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  className="dash-ring-fill cite-ring"
                  strokeDasharray={C}
                  strokeDashoffset={C * (1 - report.score / 100)}
                />
              </svg>
              <span className="absolute inset-0 grid place-items-center text-center">
                <span>
                  <span className="block font-display text-4xl font-bold text-sand-100">{report.score}</span>
                  <span className="block font-body text-xs text-sand-400">out of 100</span>
                </span>
              </span>
            </div>
            <div className="text-center sm:text-left min-w-0">
              <p className="font-display text-2xl font-bold text-sand-100">{verdict(report.score)}</p>
              <p className="font-body text-sm text-sand-400 break-all mt-1">{report.title ?? report.url}</p>
              <p className="font-body text-sm text-sand-300 mt-3">
                <span className="cite-pass-text">{counts.pass} passed</span> · <span className="cite-warn-text">{counts.warn} to improve</span> ·{" "}
                <span className="cite-fail-text">{counts.fail} to fix</span> · {report.wordCount} words read
              </p>
              {report.truncated && <p className="font-body text-xs text-sand-500 mt-1">The page was larger than 1 MB, so only the first 1 MB was read.</p>}
            </div>
          </div>

          {report.leadPassage && (
            <figure className="cite-lead mb-8">
              <figcaption className="font-body text-xs uppercase tracking-[0.2em] text-cyan-400 mb-2">Your opening passage, as an AI answer would lift it</figcaption>
              <blockquote className="font-body text-lg text-sand-100 leading-relaxed">&ldquo;{report.leadPassage}&rdquo;</blockquote>
            </figure>
          )}

          <div role="radiogroup" aria-label="Show checks" className="flex gap-2 mb-4">
            {(["all", "todo"] as const).map((f) => (
              <button
                key={f}
                type="button"
                role="radio"
                aria-checked={filter === f}
                onClick={() => setFilter(f)}
                className={`rounded-full px-4 py-1.5 font-body text-sm border transition-colors ${
                  filter === f ? "border-cyan-400 text-cyan-400 bg-cyan-400/10" : "border-gold-700/30 text-sand-400 hover:text-sand-200"
                }`}
              >
                {f === "all" ? `All ${report.checks.length} checks` : `Only what to fix (${counts.warn + counts.fail})`}
              </button>
            ))}
          </div>

          <ul className="space-y-3">
            {shown.map((c) => {
              const s = STATUS_STYLE[c.status];
              return (
                <li key={c.id} className={`cite-check ${s.cls}`}>
                  <span aria-hidden="true" className="cite-icon">{s.icon}</span>
                  <div className="min-w-0">
                    <p className="font-display text-lg font-bold text-sand-100">
                      {c.label} <span className="sr-only">: {s.label}</span>
                    </p>
                    <p className="font-body text-base text-sand-300">{c.detail}</p>
                    {c.fix && <p className="font-body text-base text-sand-100 mt-2"><strong>Fix:</strong> {c.fix}</p>}
                  </div>
                </li>
              );
            })}
            {shown.length === 0 && <li className="font-body text-sand-400">Nothing to fix. Nice.</li>}
          </ul>

          <p className="font-body text-sm text-sand-400 mt-8">
            The score is this tool&rsquo;s own checklist, not a figure any AI company publishes. For why each check matters, see{" "}
            <Link href="/lessons/writing-citable-content" className="text-cyan-400 underline underline-offset-2">Lesson 3: Writing citable content</Link>.
          </p>
        </div>
      )}
    </div>
  );
}

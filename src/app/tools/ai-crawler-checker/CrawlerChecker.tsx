"use client";

import { useState } from "react";
import Link from "next/link";
import type { CrawlerReport } from "@/lib/crawler-report";
import { trackEvent } from "@/lib/analytics";

const PURPOSE_LABEL: Record<string, string> = {
  training: "Model training",
  search: "AI search",
  user: "User request",
  other: "Other",
};

type Result = (CrawlerReport & { error?: string; truncated?: boolean }) | { error: string };

export default function CrawlerChecker() {
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [copied, setCopied] = useState(false);

  async function check(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setCopied(false);
    try {
      const res = await fetch("/api/tools/ai-crawler-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain }),
      });
      const data = (await res.json()) as Result;
      setResult(data);
      trackEvent("tool_used", { tool: "ai-crawler-checker", ok: res.ok });
    } catch {
      setResult({ error: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  const report = result && "crawlers" in result ? result : null;

  return (
    <div className="card-ancient p-5 sm:p-8">
      <form onSubmit={check} className="flex flex-col sm:flex-row gap-3">
        <label className="flex-1">
          <span className="sr-only">Domain</span>
          <input
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="example.com"
            inputMode="url"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            required
            className="w-full bg-obsidian-lighter border border-gold-700/30 focus:border-gold-500/60 outline-none px-4 py-3 font-body text-base text-sand-100 placeholder:text-sand-600"
          />
        </label>
        <button type="submit" disabled={loading} className="btn-primary justify-center py-3 px-8 text-sm disabled:opacity-60">
          {loading ? "Checking…" : "Check robots.txt"}
        </button>
      </form>

      <div aria-live="polite">
        {result?.error && (
          <p role="alert" className="mt-5 font-body text-sm text-gold-400">
            {result.error}
          </p>
        )}

        {report && (
          <div className="mt-8">
            <p className="font-body text-sm text-sand-400 mb-4 break-all">
              Checked <a href={report.robotsUrl} className="text-cyan-400 underline underline-offset-2" rel="nofollow noopener" target="_blank">{report.robotsUrl}</a>
              {report.status !== null && <> (HTTP {report.status})</>}.
              {report.verdict === "allow-all" && " There is no robots.txt to read, so every crawler may crawl the whole site."}
              {report.verdict === "disallow-all" && " The file couldn't be read. Under the robots.txt standard (RFC 9309), crawlers treat an unreachable file as “disallow everything” until it can be read again."}
              {report.truncated && " The file is over 500 KB, so only the first 500 KB was read."}
            </p>
            {report.looksLikeHtml && (
              <p role="status" className="font-body text-sm text-gold-400 mb-4">
                This address returned a web page, not a robots.txt file. With no rules to read, crawlers treat everything as
                allowed, which is what the table shows. If you meant to have a robots.txt, check that /robots.txt serves a plain
                text file.
              </p>
            )}

            <div className="overflow-x-auto -mx-5 sm:mx-0">
              <table className="w-full min-w-[560px] font-body text-sm">
                <thead>
                  <tr className="text-left text-sand-500 border-b border-gold-700/20">
                    <th className="py-2 pr-3 pl-5 sm:pl-0 font-medium">Crawler</th>
                    <th className="py-2 pr-3 font-medium">Used for</th>
                    <th className="py-2 pr-3 font-medium">Result</th>
                    <th className="py-2 pr-5 sm:pr-0 font-medium">Rule that applied</th>
                  </tr>
                </thead>
                <tbody>
                  {report.crawlers.map((c) => (
                    <tr key={c.token} className="border-b border-gold-700/10 align-top">
                      <td className="py-2.5 pr-3 pl-5 sm:pl-0">
                        <a href={c.docsUrl} target="_blank" rel="noopener" className="text-sand-100 hover:text-gold-400 font-mono text-[13px]">{c.token}</a>
                        <div className="text-sand-500 text-xs">{c.operator}</div>
                      </td>
                      <td className="py-2.5 pr-3 text-sand-400">{PURPOSE_LABEL[c.purpose]}</td>
                      <td className="py-2.5 pr-3">
                        <span className={c.allowed ? "text-cyan-400" : "text-gold-400"}>{c.allowed ? "Allowed" : "Blocked"}</span>
                      </td>
                      <td className="py-2.5 pr-5 sm:pr-0 text-sand-400 font-mono text-[13px]">
                        {c.rule ?? (report.verdict === "use-body" ? "no matching rule" : "—")}
                        {c.group && <div className="font-body text-xs text-sand-500">group: User-agent: {c.group}</div>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {report.fixes ? (
              <div className="mt-8">
                <h3 className="font-display text-xl text-sand-100 mb-2">Let the AI search crawlers in</h3>
                <p className="font-body text-sm text-sand-400 mb-3">
                  These AI search and user-request crawlers are blocked. Add these groups to your robots.txt. A crawler&rsquo;s own group
                  replaces the <code>*</code> group for it, so each group below repeats your <code>*</code> group&rsquo;s other
                  Disallow lines; check them before you paste:
                </p>
                <pre className="bg-obsidian-lighter border border-gold-700/20 p-4 overflow-x-auto font-mono text-[13px] text-sand-200">{report.fixes}</pre>
                <button
                  type="button"
                  onClick={() => navigator.clipboard?.writeText(report.fixes).then(() => setCopied(true), () => {})}
                  className="btn-secondary mt-3 py-2 px-5 text-xs"
                >
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            ) : (
              report.verdict === "use-body" && (
                <p className="mt-8 font-body text-sm text-sand-300">No AI search or user-request crawler is blocked by this file.</p>
              )
            )}

            {report.blockedTraining.length > 0 && (
              <p className="mt-6 font-body text-sm text-sand-400">
                Blocked training crawlers: {report.blockedTraining.join(", ")}. Blocking these keeps your content out of model training,
                which is a business choice; it is a separate question from appearing in AI search. <Link href="/lessons/make-your-site-reachable-by-ai" className="text-cyan-400 underline underline-offset-2">Lesson 2</Link> covers the trade-off.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

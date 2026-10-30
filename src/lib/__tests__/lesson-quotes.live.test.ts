// Live check that every quotation in a lesson appears, word for word, on one of the sources cited next to it: a
// concept's quotes against that concept's sources, the dissected example's against its source. Network-bound, so it
// only runs when CHECK_QUOTES is set (optionally LESSON=<id> for one lesson):
//   CHECK_QUOTES=1 LESSON=structured-data-and-entities npx vitest run src/lib/__tests__/lesson-quotes.live.test.ts
// Pages that refuse the fetch (401/403/429) or render their text with JavaScript are listed to check by hand.
import { describe, expect, it } from "vitest";
import { LESSONS, isLive } from "@/lib/lessons";
import type { Source } from "@/lib/lesson-types";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";

const ENTITIES: Record<string, string> = { amp: "&", quot: '"', apos: "'", lt: "<", gt: ">", nbsp: " " };

/** Lowercased text with entities, curly quotes, dash variants, markdown marks and runs of whitespace flattened. */
function flatten(s: string): string {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&([a-z]+);/gi, (m, n) => ENTITIES[n.toLowerCase()] ?? m)
    .replace(/[‘’‛′]/g, "'")
    .replace(/[“”‟″]/g, '"')
    .replace(/[‐-―−]/g, "-")
    .replace(/[*`]/g, "")
    .replace(/\s+/g, " ")
    // a link or inline element leaves a space before punctuation and inside brackets ("Google ." / "( * )")
    .replace(/\s+([.,;:!?)])/g, "$1")
    .replace(/\(\s+/g, "(")
    .trim()
    .toLowerCase();
}

/** A page's visible text: scripts, styles and tags removed, then flattened. */
function pageText(html: string): string {
  return flatten(html.replace(/<(script|style|noscript)[\s\S]*?<\/\1>/gi, " ").replace(/<[^>]+>/g, " "));
}

/**
 * The quoted passages in a text. An ellipsis or an editorial [insertion] splits a quote, and each piece must appear
 * on its own. Pieces under four words are terms ("best X"), not quotations,
 * and are skipped, as are example questions.
 */
function quotesIn(text: string): string[] {
  const out: string[] = [];
  for (const m of text.matchAll(/"([^"]+)"/g)) {
    for (const piece of m[1].split(/…|\.\.\.|\[[^\]]*\]/)) {
      const q = flatten(piece).replace(/^[\s,.;:]+|[\s,.;:]+$/g, "");
      // a quoted question is an example query a learner might type, not a quotation from a source
      if (q.split(" ").length >= 4 && !q.endsWith("?")) out.push(q);
    }
  }
  return out;
}

const cache = new Map<string, Promise<{ ok: boolean; text: string }>>();
function page(url: string) {
  if (!cache.has(url)) {
    cache.set(
      url,
      fetch(url, { headers: { "User-Agent": UA, Accept: "text/html,*/*", "Accept-Language": "en-US,en;q=0.9" }, signal: AbortSignal.timeout(20_000) })
        .then(async (r) => ({ ok: r.ok, text: pageText(await r.text()) }))
        .catch(() => ({ ok: false, text: "" })),
    );
  }
  return cache.get(url)!;
}

type Item = { where: string; texts: string[]; sources: Source[] };

function items(): Item[] {
  const only = process.env.LESSON;
  return LESSONS.filter(isLive)
    .filter((l) => !only || l.id === only)
    .flatMap((l) => [
      // (an example's note quotes the made-up example itself, not a source, so it is not checked)
      ...l.content.groups.flatMap((g) =>
        g.concepts.map((k) => ({
          where: `${l.id}/${k.id}`,
          texts: [k.explanation, k.whyItMatters, k.pitfall],
          sources: k.sources,
        })),
      ),
      {
        where: `${l.id}/example`,
        texts: [l.content.example.context, ...l.content.example.points.map((p) => p.text)],
        // the example's points may quote a source from one of the lesson's concepts, so any lesson source counts
        sources: [
          ...new Map(
            [l.content.example.source, ...l.content.groups.flatMap((g) => g.concepts.flatMap((k) => k.sources))].map(
              (s) => [s.url, s] as const,
            ),
          ).values(),
        ],
      },
    ]);
}

describe.skipIf(!process.env.CHECK_QUOTES)("lesson quotes appear on their sources", () => {
  it.each(items().map((i) => [i.where, i] as const))("%s", async (_where, item) => {
    const quotes = item.texts.flatMap(quotesIn);
    if (quotes.length === 0) return;
    const pages = await Promise.all(item.sources.map((s) => page(s.url)));
    const readable = pages.filter((p) => p.ok && p.text.length > 2000);
    const missing = quotes.filter((q) => !readable.some((p) => p.text.includes(q)));
    if (readable.length < pages.length && missing.length > 0) {
      const blocked = item.sources.filter((_, i) => !(pages[i].ok && pages[i].text.length > 2000));
      console.warn(
        `check by hand (${item.where}), unreadable: ${blocked.map((s) => s.url).join(", ")}\n  ${missing.join("\n  ")}`,
      );
      return;
    }
    expect(missing, item.where).toEqual([]);
  }, 60_000);
});

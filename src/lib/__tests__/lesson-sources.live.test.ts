// Live check that every cited source (lessons and glossary) still resolves. Network-bound, so it only
// runs when CHECK_SOURCES is set: CHECK_SOURCES=1 npx vitest run <this file>
import { describe, expect, it } from "vitest";
import { LESSONS, isLive } from "@/lib/lessons";
import { GLOSSARY } from "@/lib/glossary";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";

function sourceUrls(): string[] {
  const urls = new Set<string>();
  for (const l of LESSONS.filter(isLive)) {
    for (const g of l.content.groups) for (const k of g.concepts) for (const s of k.sources) urls.add(s.url);
    urls.add(l.content.example.source.url);
  }
  for (const t of GLOSSARY) for (const s of t.sources) urls.add(s.url);
  return [...urls];
}

describe.skipIf(!process.env.CHECK_SOURCES)("lesson sources resolve", () => {
  it.each(sourceUrls())("%s", async (url) => {
    let status: number;
    try {
      const res = await fetch(url, {
        redirect: "follow",
        headers: { "User-Agent": UA, Accept: "text/html,application/xhtml+xml,*/*" },
        signal: AbortSignal.timeout(15_000),
      });
      status = res.status;
    } catch (err) {
      throw new Error(`${url} failed: ${(err as Error).message}`);
    }
    if (status === 401 || status === 403 || status === 429) {
      console.warn(`verify by hand: ${url} returned ${status}`);
      return;
    }
    expect(status < 400, `${url} returned ${status}`).toBe(true);
  }, 20_000);
});

# Learn AEO — Plan 6: AI Crawler Checker, llms.txt Generator, Tools Hub, Glossary, Blog

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Spec step 7. Ship the first two free tools (AI Crawler Checker, llms.txt Generator) and a tools hub, a ~30-term glossary, and the 8 launch blog posts, every factual claim sourced and checked live.

**Architecture:** Pure logic in `src/lib` with heavy tests: a sourced AI-crawler catalog, an RFC 9309 robots.txt evaluator, an SSRF-guarded fetcher (validates every resolved address at connect time, manual redirects, size and time caps), an in-memory rate limiter, and an llms.txt generator. Thin pages render them in the existing tool-page shape (answer-first intro, the tool, how it works, FAQ with FAQPage schema, CTA to lesson 1). Glossary terms and blog posts are typed data files (`src/lib/content/glossary/*.ts`, `src/lib/content/blog/*.ts`) with `sources[]`, checked by the existing live-source test. Content is drafted by research subagents to a fixed format and reviewed before commit.

**Tech Stack:** Next 15 app router, React 19, TypeScript, Node `http`/`https`/`dns` (no new dependencies), `sharp` for blog art, vitest.

**Spec:** `docs/superpowers/specs/2026-10-26-learn-aeo-design.md` ("Free tools", "Glossary hub", "Blog at launch", "SEO / AEO groundwork", "Anti-goals").

**Previous plans:** 1–4 (done) · 5 `docs/superpowers/plans/2026-10-28-learn-aeo-5-seo-plumbing.md` (done, `abf17a7..5aff752`).

**Next plan:** 7 deploy checklist (launch).

**Progress (paused 2026-10-28):** Tasks 1–5 done (`0b8b5ba..e26571d`): crawler catalog + RFC 9309 evaluator, SSRF-guarded fetch + rate limit, AI Crawler Checker, llms.txt Generator, tools hub. Task 6 half done (`077fdad`): 30 reviewed glossary terms, schema builders, sitemap and llms.txt entries; **the /glossary pages are not built yet, so the sitemap lists 31 URLs that 404 until they are — do not deploy in this state.** Task 7: 8 blog drafts committed unreviewed (`588e703`), not wired into `blogPosts`. Resume at Task 6 Step 2 (pages), then Task 7 review, Task 8, final review.

## Global Constraints

- **No made-up statistics or claims.** Every number or factual claim about engines, crawlers, standards or vendors comes from a named, linkable source with a date, opened live while writing (WebFetch), or is cut. No "X% of searches" claims without a primary source. Quotes are verbatim and short (≤ 25 words) and keep the source's spelling.
- **No author:** no bylines, bios, Person schema. Posts and terms are credited to Learn AEO.
- **No tricks:** no advice to cloak, hide text for bots, inject prompts or fake reviews.
- **Fair competitor coverage** ("Best AEO courses"): describe other courses only from their own public pages, no rankings by unverifiable criteria, disclose that Learn AEO is ours, no claims about their quality we cannot source.
- **US spelling** (`us-spelling.test.ts`); **no Egypt** (`no-egypt.test.ts`).
- Audience: marketers who know SEO basics. Second person, plain, concrete, answer first.
- Existing helpers only: `pageMetadata`/`privateMetadata` (`src/lib/seo.ts`), `JsonLd` + builders (`src/lib/schema.ts`), `TOOLS`/`toolPath` (`src/lib/tools.ts`), `buildSitemap`, `buildLlmsTxt`, `Source` (`src/lib/lesson-types.ts`).
- Server tools: public hosts only (no private, loopback, link-local, CGNAT, multicast, reserved or metadata addresses, IPv4 or IPv6, including IPv4-mapped IPv6), ports 80/443 only, ≤ 3 redirects each re-validated, 8 s total timeout, 512 KB body cap, rate-limited per client IP.
- Work on `main`; never push; one server at a time; never build with a server up. Every task ends with `npx tsc --noEmit`, `npm test`, and `npm run build` when pages change.

## Review Focus

1. **SSRF via DNS or redirects** — a domain that resolves to 127.0.0.1/10.x/169.254.169.254/::1/::ffff:10.0.0.1, an IP literal in any form (decimal `2130706433`, octal, short `127.1`), a redirect to such a host, or a non-80/443 port is refused before any connection. Test in Task 2.
2. **robots.txt edge cases** — groups with several user-agent lines, a crawler-specific group overriding `*`, case-insensitive tokens, longest-match with Allow winning ties, `*`/`$` wildcards, comments, BOM, CRLF, no robots.txt or any 4xx including 401/403 ("unavailable" → allowed), 5xx or network failure ("unreachable" → disallow all), per RFC 9309 §2.3.1. Test in Task 1.
3. **Hostile or huge responses** — a 50 MB robots.txt, a slow drip, HTML instead of text, a non-UTF-8 body: capped, timed out or reported, never a crash or hang. Test in Task 2.
4. **Generator output validity** — the llms.txt Generator escapes markdown in user input, drops empty sections, rejects non-http(s) URLs, and always yields the llmstxt.org shape (`#` title, `>` summary, `##` sections of `- [name](url): notes`). Test in Task 4.
5. **Unsourced content** — every glossary term and post has ≥ 1 source; every source URL resolves (live test); posts carry no Person and no unsourced number. Test in Tasks 6–7 (static checks + `CHECK_SOURCES=1` live run).

---

### Task 1: AI crawler catalog and robots.txt evaluator

**Files:** Create `src/lib/ai-crawlers.ts`, `src/lib/robots-eval.ts`, tests `src/lib/__tests__/ai-crawlers.test.ts`, `src/lib/__tests__/robots-eval.test.ts`. Modify `src/app/robots.ts` (its AI list comes from the catalog).

**Interfaces:**
- `type CrawlerPurpose = "training" | "search" | "user"`; `type AiCrawler = { token: string; operator: string; purpose: CrawlerPurpose; what: string; source: Source }`; `AI_CRAWLERS: readonly AiCrawler[]` — at least GPTBot, OAI-SearchBot, ChatGPT-User (OpenAI); ClaudeBot, Claude-SearchBot, Claude-User (Anthropic); PerplexityBot, Perplexity-User; Google-Extended (Google; note it is a robots.txt token, not a separate crawler); Applebot-Extended; CCBot; Bytespider; meta-externalagent. Each `what` and `purpose` re-checked against the operator's own doc page (the URLs lesson 2 cites, `src/lib/content/lesson-2-the-crawl-docks.ts`); drop any you cannot source.
- `parseRobots(text: string): RobotsGroup[]` and `evaluateRobots(text: string, token: string, path?: string): { allowed: boolean; group: string | null; rule: string | null }` per RFC 9309: product-token match case-insensitive; the most specific matching group (else `*`); longest matching path rule wins, Allow wins a tie; `*` and `$`; ignore comments, BOM, CRLF, unknown lines; an empty Disallow allows.
- `robotsFetchVerdict(status: number): "use-body" | "allow-all" | "disallow-all"` — 2xx use body; 4xx (incl. 401/403) allow all; 5xx or network failure disallow all (RFC 9309 §2.3.1).

- [ ] Step 1: Failing tests: the RFC 9309 examples; a GPTBot group overriding `*`; two user-agent lines sharing one group; `Disallow: /` + `Allow: /$`; `Allow` vs `Disallow` same length → allowed; comments/BOM/CRLF; `evaluateRobots("", "GPTBot")` allowed; catalog has unique tokens, every source is a `https` URL with an `accessed` date; `robots()` lists every catalog token. Run → FAIL.
- [ ] Step 2: Implement; re-verify catalog facts live. `npx tsc --noEmit && npm test` → PASS. Commit `feat: AI crawler catalog and robots.txt evaluator`.

---

### Task 2: Safe fetch and rate limit

**Files:** Create `src/lib/safe-fetch.ts`, `src/lib/rate-limit.ts`, tests `src/lib/__tests__/safe-fetch.test.ts`, `src/lib/__tests__/rate-limit.test.ts`.

**Interfaces:**
- `isPublicAddress(ip: string): boolean` — false for 0/8, 10/8, 100.64/10, 127/8, 169.254/16, 172.16/12, 192.0.0/24, 192.0.2/24, 192.168/16, 198.18/15, 198.51.100/24, 203.0.113/24, 224/4, 240/4, 255.255.255.255; `::`, `::1`, `fc00::/7`, `fe80::/10`, `ff00::/8`, `2001:db8::/32`, `64:ff9b::/96`, and IPv4-mapped/compatible forms of any blocked IPv4.
- `normalizeTarget(input: string): { ok: true; host: string } | { ok: false; error: string }` — accepts `example.com`, `https://example.com/x`, trims, lowercases, IDNA via `new URL`; rejects IP literals (all forms `new URL` canonicalizes, e.g. `2130706433`, `127.1`, `0x7f.1`), `localhost`, `*.local`, `*.internal`, single-label hosts, userinfo, ports other than 80/443, non-http(s) schemes.
- `safeFetchText(url: string, opts?: { maxBytes?: number; timeoutMs?: number; maxRedirects?: number; lookup?: LookupFn }): Promise<{ ok: true; status: number; finalUrl: string; text: string; truncated: boolean } | { ok: false; error: "blocked" | "timeout" | "too-many-redirects" | "network" }>` — `node:https`/`node:http` with a custom `lookup` that resolves all addresses and errors if any is not public (checked at connect time, so DNS rebinding cannot swap it); redirects followed manually (`Location` re-normalized and re-checked); body read until `maxBytes` (default 512 KB) then destroyed; one deadline for the whole call (default 8 s).
- `rateLimit(key: string, opts: { limit: number; windowMs: number; now?: number }): { ok: boolean; retryAfterSec: number }` — in-memory sliding window per server instance; `clientKey(req: Request): string` from `x-forwarded-for` (first hop) / `x-real-ip`.

- [ ] Step 1: Failing tests (no network: inject `lookup`, and a local `http.createServer` on 127.0.0.1 reached through an injected lookup that the test marks public via a test-only allow hook, or test the request builder separately): every blocked range; mapped IPv6; `normalizeTarget` cases above; a lookup returning `[8.8.8.8, 10.0.0.1]` → blocked; redirect to a blocked host → blocked; 4 redirects → too-many-redirects; a 2 MB body → `truncated: true`, text ≤ 512 KB; a server that never ends → timeout within the deadline; rate limit allows `limit` hits then refuses with `retryAfterSec > 0`, and recovers after the window. Run → FAIL.
- [ ] Step 2: Implement. `npx tsc --noEmit && npm test` → PASS. Commit `feat: SSRF-guarded fetch and rate limiting for server tools`.

---

### Task 3: AI Crawler Checker (API + page)

**Files:** Create `src/lib/crawler-report.ts`, `src/app/api/tools/ai-crawler-check/route.ts`, `src/app/tools/ai-crawler-checker/page.tsx`, `src/app/tools/ai-crawler-checker/CrawlerChecker.tsx` (client), `src/components/tools/ToolPage.tsx` (shared shell: breadcrumbs, intro, tool slot, how it works, FAQ + `faqSchema`, CTA), tests `src/lib/__tests__/crawler-report.test.ts`, `src/app/api/tools/__tests__/ai-crawler-check.test.ts`. Modify `src/lib/schema.ts` (add `webApplicationSchema(tool: ToolMeta)`: `WebApplication`, `applicationCategory: "SEO tool"`, `operatingSystem: "Any"`, `offers` price "0", `provider` the named Organization ref, `isAccessibleForFree: true`), `src/lib/tools.ts` (`ai-crawler-checker` → `live`).

**Interfaces:**
- `buildCrawlerReport(input: { host: string; fetched: { status: number; text: string } | { error: string } }): CrawlerReport` = `{ host; robotsUrl; verdict: "use-body" | "allow-all" | "disallow-all"; crawlers: { token; operator; purpose; allowed; group; rule }[]; fixes: string }` — `fixes` is a robots.txt snippet that allows the blocked search/user crawlers on `/` (never suggests unblocking training crawlers by default; lists them separately so the marketer decides).
- `POST /api/tools/ai-crawler-check { domain }` → 200 report; 400 bad input (`normalizeTarget` error); 422 blocked target; 429 with `Retry-After` (10 requests / 10 min per IP); 502 network/timeout (report still built with `verdict` from RFC rule). Never echoes fetched HTML.
- Page copy: answer-first intro (what it checks, in two sentences), the form, results table (crawler, operator, purpose, allowed/blocked, the matching rule), "How it works" (fetches `/robots.txt` once, evaluates per RFC 9309; it does not test CDN/WAF blocking — say so and link lesson 2), 4–6 FAQs, CTA to lesson 1. `pageMetadata` + `JsonLd` (`webApplicationSchema`, `faqSchema`, `breadcrumbSchema`).

- [ ] Step 1: Failing tests: report on a fixture robots.txt blocking GPTBot and OAI-SearchBot → those two blocked, others allowed, `fixes` contains `User-agent: OAI-SearchBot` + `Allow: /` but not GPTBot; 404 → all allowed; 503 → all blocked; route: bad domain 400, private target 422 (mock `safeFetchText`), 11th call 429. Run → FAIL.
- [ ] Step 2: Implement; flip the tool to live. Check in a browser against a real public site (e.g. `www.theguardian.com`, cited in lesson 2) and an obviously blocked input (`localhost`). `npx tsc --noEmit && npm test && npm run build` → PASS. Commit `feat: AI Crawler Checker`.

---

### Task 4: llms.txt Generator

**Files:** Create `src/lib/llms-generator.ts`, `src/app/tools/llms-txt-generator/page.tsx`, `src/app/tools/llms-txt-generator/LlmsGenerator.tsx` (client), test `src/lib/__tests__/llms-generator.test.ts`. Modify `src/lib/tools.ts` (`llms-txt-generator` → `live`).

**Interfaces:**
- `type LlmsForm = { name: string; summary: string; details: string; sections: { title: string; links: { title: string; url: string; notes: string }[] }[]; optional: { title: string; url: string; notes: string }[] }`.
- `validateLlmsForm(f: LlmsForm): { field: string; message: string }[]` — name required; summary required, one paragraph; each link needs a title and an absolute `http(s)` URL.
- `generateLlmsTxt(f: LlmsForm): string` — llmstxt.org shape; empty sections and links dropped; `Optional` section last; markdown-escapes `[`, `]` in link titles and strips line breaks from single-line fields.
- Client: form with add/remove section and link rows, live preview, Copy and Download (`llms.txt`, `text/plain`), state kept in `localStorage` under `${COOKIE_PREFIX}llms-gen` (try/catch). Page in the `ToolPage` shell with sourced "How it works" (llmstxt.org) and FAQs (what llms.txt is, that it is a proposal and support varies — sourced; where to put it; llms-full.txt).

- [ ] Step 1: Failing tests: full form → exact expected text; empty section dropped; `javascript:` URL → validation error; title with `]` escaped; newline in name stripped. Run → FAIL.
- [ ] Step 2: Implement; flip to live; browser check (fill, preview, copy, download). Gates as above. Commit `feat: llms.txt Generator`.

---

### Task 5: Tools hub and navigation

**Files:** Create `src/app/tools/page.tsx`. Modify `src/components/Navbar.tsx` and `src/components/Footer.tsx` (Tools link), `src/app/sitemap.ts` (add `/tools` when any tool is live), `src/lib/llms-txt.ts` (tools hub link), tests (sitemap, llms-txt, page-metadata PUBLIC list gains `/tools` and the two tool pages).

- [ ] Step 1: Failing tests for `/tools` in the sitemap and llms.txt only when a tool is live, and page metadata for `/tools`, `/tools/ai-crawler-checker`, `/tools/llms-txt-generator`.
- [ ] Step 2: Hub page: intro, a card per `TOOLS` entry (reuse `ToolsSection` card), ItemList + breadcrumb schema. Gates; `node scripts/dev/check-seo.mjs` against `next start`. Commit `feat: tools hub`.

---

### Task 6: Glossary

**Files:** Create `src/lib/glossary-types.ts`, `src/lib/content/glossary/*.ts` (one file per term or a few per file), `src/lib/glossary.ts` (`GLOSSARY` sorted by term, `getTerm(slug)`), `src/app/glossary/page.tsx`, `src/app/glossary/[term]/page.tsx`, tests `src/lib/__tests__/glossary.test.ts`. Modify `src/lib/schema.ts` (`definedTermSetSchema()`, `definedTermSchema(t)`), `src/app/sitemap.ts`, `src/lib/llms-txt.ts` (Glossary section), `src/lib/__tests__/lesson-sources.live.test.ts` (include glossary sources), Navbar/Footer link.

**Interfaces:** `type GlossaryTerm = { slug: string; term: string; aka?: string[]; definition: string /* one sentence, ≤ 30 words, starts with the term */; explanation: string /* markdown, 80–250 words */; example?: { label: string; body: string; language?: string }; related: string[] /* slugs */; lesson?: string /* lesson id */; sources: Source[] /* ≥ 1 */ }`.

Terms (30): AEO, GEO, LLMO, AI Overviews, AI Mode, answer engine, query fan-out, grounding, retrieval-augmented generation (RAG), citation, brand mention, share of voice (AI), zero-click search, llms.txt, robots.txt, GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot, Google-Extended, user agent, crawl budget, IndexNow, structured data, JSON-LD, entity, sameAs, knowledge graph, E-E-A-T, passage ranking.

- [ ] Step 1: Failing tests: 30 terms; unique slugs; each `definition` starts with the term (or an alias) and is ≤ 30 words; explanation 80–250 words; every `related` slug exists; every `lesson` id is in the catalog; ≥ 1 source each with `https` URL and `accessed` date; no banned spellings. Run → FAIL.
- [ ] Step 2: Content: drafted by research subagents in batches of ~10 terms, each claim opened live; review every term (spot-check at least one source per term against the live page). Pages: index (A–Z, one-line definitions, DefinedTermSet), term page (definition first, explanation, example, related, lesson link, sources, DefinedTerm + breadcrumb schema). Gates incl. `CHECK_SOURCES=1` live test. Commit `feat: glossary of 30 AEO terms`.

---

### Task 7: Blog posts

**Files:** Modify `src/lib/blog-posts.ts` (add `sources: Source[]`; import posts from `src/lib/content/blog/*.ts`), `src/app/blog/[slug]/BlogPostContent.tsx` (Sources section), `src/lib/__tests__/lesson-sources.live.test.ts` (blog sources). Create `src/lib/content/blog/*.ts` (8 posts), `scripts/dev/build-blog-art.mjs` (one 1200×1200 webp per post under `public/blog/<slug>.webp`, brand style, title only), tests `src/lib/__tests__/blog-posts.test.ts`.

Posts (slug — title): `what-is-aeo` — What is answer engine optimization (AEO)?; `aeo-vs-seo-vs-geo` — AEO vs SEO vs GEO: what's the difference?; `how-to-learn-aeo` — How to learn AEO; `is-aeo-worth-learning` — Is AEO worth learning in 2026?; `best-aeo-courses` — Best AEO courses (and how to choose one); `how-chatgpt-chooses-sources` — How ChatGPT chooses which sources to cite; `get-cited-in-google-ai-overviews` — How to get cited in Google AI Overviews; `llms-txt-explained` — llms.txt explained.

- [ ] Step 1: Failing tests: 8 posts with the slugs above; each has `quickAnswer` (1–3 sentences), ≥ 3 FAQs, ≥ 3 sources (https, accessed date), 900–2,000 words, existing `relatedSlugs`, an image file in `public/blog/`, `publishedAt` = `2026-10-28`; no Person; no "%" or number in body text without a source on the same post (heuristic: every paragraph with a digit sits in a post with sources — reviewed by hand); `best-aeo-courses` contains a disclosure that Learn AEO is ours. Run → FAIL.
- [ ] Step 2: Content: research subagents draft posts (2 each), opening every source live and quoting only verbatim; I review each post in full and re-open at least two sources per post. Art script; Sources section; blog index now indexable (Plan 5 logic). Gates incl. `CHECK_SOURCES=1` live test and `check-seo.mjs`. Commit `feat: eight launch blog posts`.

---

### Task 8: Walk and wrap-up

- [ ] Walk (one server, one browser): `/tools`, both tools (real domain + blocked input; generator copy/download), `/glossary`, two term pages, `/blog`, two posts, at 1440 dark and 390 light; no horizontal scroll, no console errors. `check-seo.mjs` passes on every sitemap URL. README status: Plan 6 done. Commit `docs: Plan 6 status`.

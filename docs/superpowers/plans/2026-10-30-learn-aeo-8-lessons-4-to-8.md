# Learn AEO — Plan 8: Lessons 4–8

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Write, source and publish the five remaining lessons (The Schema Works, The Agora, The Embassies, The Observatory, The Citadel) so the whole eight-lesson course is live and the certificate can be earned.

**Architecture:** No new machinery. The lesson model, player, XP, badges and certificate already exist (Plans 2–4). Each lesson is one typed data file in `src/lib/content/` (`LessonContent`, `src/lib/lesson-types.ts`), registered in `CONTENT` in `src/lib/lessons.ts` and switched to `status: "live"` in `src/lib/lesson-catalog.ts`. `src/lib/__tests__/lesson-content.test.ts` already checks every live lesson's shape, sources, question validity, ids, XP pricing and banned words. Task 1 first makes the tests that need a "coming soon" lesson independent of the real catalog, because by Task 6 none is left.

**Tech Stack:** TypeScript data files, vitest. WebFetch/WebSearch to check each source while writing.

**Spec:** `docs/superpowers/specs/2026-10-26-learn-aeo-design.md` (sections "Anti-goals", "Curriculum", "Lesson content model", "Delivery phases" step 9). Model lessons: `src/lib/content/lesson-2-the-crawl-docks.ts`, `src/lib/content/lesson-3-the-answer-quarter.ts`. Read one in full before writing a lesson.

**Previous plan:** `docs/superpowers/plans/2026-10-28-learn-aeo-7-deploy-readiness.md`.

## Global Constraints

- **No made-up statistics or claims.** "Every number in lessons, blog posts and tools must come from a named, linkable source with a date, or be removed." Every quoted sentence and every claim about how an engine, crawler, platform or policy behaves is checked against the live page with WebFetch while writing, and the quote must appear verbatim on that page. If it can't be verified, cut it. Lesson 3's header comment states the rule; copy that header style.
- **Current facts only.** Where a vendor has changed a feature, say what the page says now (e.g. Google limited FAQ rich results and removed HowTo rich results in 2023, so check Search Central's current pages before writing Lesson 4's FAQPage/HowTo cards).
- **Made-up examples are labeled.** Example companies (as Fernhill in Lesson 3) are named in the file's header comment and in the `note` of each example that uses them. No new real brand gets made-up numbers.
- **Legitimate practice only:** no fake reviews, undisclosed paid placements, sock-puppet forum posts, self-editing your own Wikipedia article, hidden text or prompt injection. Where a tactic is tempting but against a platform's rules, teach the rule (cite it).
- **No author** credentials or bylines; content is by "Learn AEO".
- **US spelling** (optimization, program, behavior, organization). Enforced by `src/lib/__tests__/us-spelling.test.ts`; text quoted verbatim keeps its spelling only if added to that test's `ALLOW_PHRASES`.
- **No old-course wording** (the `BANNED` pattern in `lesson-content.test.ts`: no glyph, tomb, chamber, dig, expedition, scribe…).
- **Shape** (enforced by `lesson-content.test.ts`): 3–4 groups; 2–5 concepts per group; 2–4 check questions per group; exercise ≥3 steps, no step id `clean`; audit 8–12 questions (write 10); at least 4 question kinds across the lesson; every concept has ≥1 source; ids unique within the lesson; sources `https://`, `accessed` YYYY-MM-DD, `date`+`dateKind` together or neither, `date <= accessed`.
- **Voice:** second person, plain and concrete, for marketers who know SEO basics. Intro arrives in the district and links to the previous one; outro sums up and names the next district (Lesson 8: the course's end and the certificate). Match Lessons 2–3 in length (~650–850 lines).
- Lesson ids, districts and file names (catalog entries already exist; do not rename):

  | # | id | District | File | Export |
  |---|---|---|---|---|
  | 4 | `structured-data-and-entities` | The Schema Works | `lesson-4-the-schema-works.ts` | `LESSON_4` |
  | 5 | `authority-beyond-your-site` | The Agora | `lesson-5-the-agora.ts` | `LESSON_5` |
  | 6 | `platform-playbooks` | The Embassies | `lesson-6-the-embassies.ts` | `LESSON_6` |
  | 7 | `measuring-ai-visibility` | The Observatory | `lesson-7-the-observatory.ts` | `LESSON_7` |
  | 8 | `running-an-aeo-program` | The Citadel | `lesson-8-the-citadel.ts` | `LESSON_8` |

- Work on `main` in `C:\dev\learn-aeo`. Commit each task; do not push (pushing `main` deploys to production).
- Every task ends green: `npx tsc --noEmit` and `npx vitest run`. The repo-wide scan tests (`no-egypt`, `no-sibling-strings`) can time out under full-suite load; if they fail only with "Test timed out", rerun those two files alone, and they must pass.

## Review Focus

1. **A quote that isn't on its source page**, or a paraphrase presented in quotation marks. Expected: every `"..."` in `explanation`, `whyItMatters`, `pitfall` and example `points` is verbatim on a cited source of that concept. Each lesson task's Step 2 re-fetches every source and greps for each quote.
2. **An answer key that's wrong or arguable**: two defensible options, or a `passage` pair where the "worse" one is also fine. Expected: exactly one clearly best answer, and the `explanation` says why the others lose. Each lesson task's Step 3 is a cold read of every question.
3. **Out-of-date platform facts** (bot names, rich result eligibility, GA4 menu paths, referral domains). Expected: matches the vendor page as fetched on `accessed`. Covered by Step 2 and `CHECK_SOURCES=1` live test.
4. **Tests that silently lose coverage once no lesson is coming soon** (`LESSONS.find(... "coming-soon")!` becomes `undefined`). Expected: the coming-soon branches of the lessons API, XP, completion and badge routes stay tested. Task 1.
5. **Site copy that still says lessons are coming** after all eight are live (About page, blog posts, FAQ). Expected: copy reads as a finished course. Task 6 adds a test.

---

### Task 1: Coming-soon tests stop depending on the real catalog

**Files:**
- Modify: `src/app/api/lessons/__tests__/route.test.ts`, `src/app/api/progress/__tests__/complete.test.ts`, `src/app/api/progress/__tests__/xp.test.ts`, `src/app/api/badges/__tests__/check.test.ts`, `src/lib/__tests__/lesson-content.test.ts` ("has lesson 1 live")

**Interfaces:**
- Produces: in each of the four route test files, a `vi.mock("@/lib/lesson-catalog", …)` that returns the real catalog with `running-an-aeo-program` forced to `status: "coming-soon"`, and a constant `SOON_ID = "running-an-aeo-program"` used wherever the file needs a coming-soon lesson. (Forcing a live lesson to coming-soon is safe: `lessons.ts` only throws for live without content.)

- [ ] **Step 1:** In the four route test files, add the mock and replace `"structured-data-and-entities"` / `LESSONS.find((l) => l.status === "coming-soon")!` with `SOON_ID`. The lessons route test's district assertion becomes `"The Citadel"`.
- [ ] **Step 2:** In `lesson-content.test.ts` "has lesson 1 live", drop the `platform-playbooks` not-live assertion (keep the lesson 1, `nope` and `undefined` checks).
- [ ] **Step 3:** `npx vitest run src/app/api src/lib/__tests__/lesson-content.test.ts` → PASS, and `grep -rn "structured-data-and-entities" src/app/api` plus `grep -rn 'status === "coming-soon")!' src/app/api` both return nothing.
- [ ] **Step 4:** `npx tsc --noEmit && npx vitest run` → PASS. Commit `test: coming-soon route tests use a mocked catalog, not the real one`.

---

### Task 2: Lesson 4 — The Schema Works

**Files:**
- Create: `src/lib/content/lesson-4-the-schema-works.ts`
- Modify: `src/lib/lessons.ts` (import + `CONTENT` entry), `src/lib/lesson-catalog.ts` (lesson 4 `status: "live"`)

**Interfaces:** Consumes `LessonContent`, `Source` from `../lesson-types`. Produces `export const LESSON_4: LessonContent`.

- [ ] **Step 1: Write `LESSON_4`.** Groups (scope fixed):
  1. *JSON-LD basics*: what structured data is; JSON-LD as Google's recommended format; `@context`, `@type`, properties; markup must describe content visible on the page (Google's structured data general guidelines); testing with Rich Results Test and the Schema Markup Validator.
  2. *Types for your pages*: Organization (name, url, logo, sameAs), Article (headline, datePublished, dateModified, author as Organization), Product (offers; review markup rules). Cite schema.org type pages and Google's feature docs.
  3. *FAQPage and HowTo today*: what Google's current docs say about FAQ and HowTo rich results (the 2023 changes, from Google's own announcement and current docs), and what the markup still does or doesn't do. Claim no AI-engine use of schema unless a vendor source says it.
  4. *Entities*: what an entity is; Google's Knowledge Graph ("things, not strings", Google's 2012 announcement); one consistent name, description and identifiers everywhere; `sameAs` to profiles that describe the same entity; `@id` to link nodes in one graph.
  - Signature exercise **"Assemble the JSON-LD block"**: build an Organization block for a made-up company, in 4–5 steps (`order` the lines, `blank` the `@context`/`@type`/`sameAs`, `spot` the property that contradicts the visible page, `choice` the right `sameAs` targets). Code `mono: true` on blanks.
  - Example to dissect: a real site's Organization or Article JSON-LD, quoted ≤15 lines from the live page source, 3–4 points.
  - Audit: 10 questions, ≥4 kinds, including one `spot` on JSON-LD.
- [ ] **Step 2: Fact-check.** For each source, WebFetch it and confirm every quoted string attributed to it appears verbatim; fix or cut any that don't. Set `accessed` to today. Run `CHECK_SOURCES=1 npx vitest run src/lib/__tests__/lesson-sources.live.test.ts` → PASS (401/403/429 warnings are checked by hand).
- [ ] **Step 3: Cold read of every question**: one defensible answer each; explanations say why the wrong options lose.
- [ ] **Step 4: Register and go live**; `npx vitest run src/lib/__tests__/lesson-content.test.ts src/lib/__tests__/us-spelling.test.ts` → PASS; then `npx tsc --noEmit && npx vitest run` → PASS. Commit `feat: lesson 4 (The Schema Works)`.

---

### Task 3: Lesson 5 — The Agora

**Files:** Create `src/lib/content/lesson-5-the-agora.ts` (`LESSON_5`); modify `lessons.ts`, `lesson-catalog.ts` (lesson 5 live).

**Interfaces:** as Task 2.

- [ ] **Step 1: Write `LESSON_5`.** Groups (scope fixed):
  1. *Mentions, not just links*: AI answers draw on what third parties say about you; citations vs unlinked mentions (link back to Lesson 1). Support "engines use third-party pages" only with vendor docs or a named study.
  2. *Reviews and forums*: review platform rules and the FTC's 2024 rule banning fake reviews; Google's content-licensing deal with Reddit (Google's announcement) and OpenAI's Reddit partnership (OpenAI's or Reddit's announcement); taking part in communities under their own self-promotion rules.
  3. *Digital PR and "best X" lists*: earning a place on comparison and "best X" lists with real data, products and experts; disclosure of paid placements (FTC endorsement guides); Google's site reputation abuse policy as the line paid lists cross.
  4. *Wikipedia and Wikidata*: notability; Wikipedia's conflict-of-interest guideline (disclose, propose edits on talk pages, don't edit your own article); Wikidata items, identifiers and how they connect to `sameAs` (back to Lesson 4).
  - Signature exercise **"Plan the outreach"**: a made-up brand's six candidate tactics; sort legitimate from rule-breaking (`match`/`choice`), `order` a digital PR pitch, and pick the compliant Wikipedia move.
  - Example to dissect: a real public page, such as Wikipedia's COI guideline text or a subreddit's self-promotion rule (quote ≤15 lines), 3–4 points.
  - Audit: 10 questions, ≥4 kinds.
- [ ] **Steps 2–4:** as Task 2 Steps 2–4. Commit `feat: lesson 5 (The Agora)`.

---

### Task 4: Lesson 6 — The Embassies

**Files:** Create `src/lib/content/lesson-6-the-embassies.ts` (`LESSON_6`); modify `lessons.ts`, `lesson-catalog.ts` (lesson 6 live).

**Interfaces:** as Task 2.

- [ ] **Step 1: Write `LESSON_6`.** Groups (scope fixed). For each platform, only what its own docs (or a dated, named announcement) say:
  1. *Google AI Overviews and AI Mode*: Search Central's "AI features and your website" (same eligibility as Search; no special markup required; `nosnippet`/`max-snippet` controls; `Google-Extended` doesn't affect Search); AI feature traffic in Search Console.
  2. *ChatGPT search and Claude*: OpenAI's bots (OAI-SearchBot for search inclusion, ChatGPT-User, GPTBot) and its publisher guidance, including the `utm_source=chatgpt.com` referral parameter if the docs state it; Anthropic's bots (ClaudeBot, Claude-User, Claude-SearchBot) per Anthropic's help center.
  3. *Perplexity and Copilot*: PerplexityBot and Perplexity-User per Perplexity's docs; Copilot answers grounded in Bing (Microsoft's docs), Bing Webmaster Tools and IndexNow.
  4. *Testing your pages on each platform*: a repeatable manual test (fixed prompt list, a fresh session, record answer, citations and position, repeat on several days, because answers vary). Back any claim about variability with a vendor or named source, or state it as the method's reason without numbers.
  - Signature exercise **"Run an embassy test"**: `match` bot names to platforms and purposes; `order` the steps of a fair test; `spot` the robots.txt line that keeps a site out of ChatGPT search; `choice` what to change when a page is cited on Perplexity but not in AI Overviews.
  - Example to dissect: a real vendor doc excerpt (e.g. OpenAI's crawler page or Google's AI features page), 3–4 points.
  - Audit: 10 questions, ≥4 kinds.
- [ ] **Steps 2–4:** as Task 2. Lesson 2's bot names must agree with this lesson; if a vendor changed a name since 2026-10-27, also fix Lesson 2 in this commit. Commit `feat: lesson 6 (The Embassies)`.

---

### Task 5: Lesson 7 — The Observatory

**Files:** Create `src/lib/content/lesson-7-the-observatory.ts` (`LESSON_7`); modify `lessons.ts`, `lesson-catalog.ts` (lesson 7 live).

**Interfaces:** as Task 2.

- [ ] **Step 1: Write `LESSON_7`.** Groups (scope fixed):
  1. *Prompt sets*: build from real customer questions (sales calls, support tickets, Search Console queries); branded vs unbranded; spread across the buying journey; variants of each question; a fixed set you rerun.
  2. *Share of voice and citations*: define mention rate, citation rate and share of voice as formulas (course definitions, no industry benchmarks); tracking competitors; recording which URL is cited.
  3. *AI referral traffic in GA4*: referrals from AI assistants' domains (each domain verified on a vendor page or seen in its docs), a custom channel group with a regex condition (Google Analytics help on custom channel groups), and the limits (some clicks arrive without a referrer). Where Google counts AI Overviews/AI Mode clicks in Search Console.
  4. *Server logs and reporting*: find AI bot hits by user agent; verify a bot by the vendor's published IP ranges or reverse DNS (vendor docs); a one-page monthly report (prompt-set results, AI referrals, bot hits, actions taken).
  - Signature exercise **"Build a prompt set"** (spec): choose good prompts over bad, `order` a prompt set by journey stage, `blank` a GA4 regex for AI referrers (`mono: true`), `spot` the log line that only claims to be a bot.
  - Example to dissect: a real published IP-range or user-agent doc, or the GA4 custom channel group help page (quote ≤15 lines), 3–4 points.
  - Audit: 10 questions, ≥4 kinds, including one `spot`.
- [ ] **Steps 2–4:** as Task 2. Any regex in the lesson must match its listed domains and not obvious lookalikes; check it with a short `node -e` run before committing. Commit `feat: lesson 7 (The Observatory)`.

---

### Task 6: Lesson 8 — The Citadel, and the finished course

**Files:**
- Create: `src/lib/content/lesson-8-the-citadel.ts` (`LESSON_8`)
- Modify: `lessons.ts`, `lesson-catalog.ts` (lesson 8 live), `src/app/about/AboutContent.tsx:80`, `src/lib/content/blog/best-aeo-courses.ts`, `src/lib/content/blog/how-to-learn-aeo.ts`
- Test: `src/app/__tests__/course-complete-copy.test.ts` (new)

**Interfaces:** as Task 2.

- [ ] **Step 1: Write `LESSON_8`.** Groups (scope fixed):
  1. *The AEO audit*: one checklist across the course (access → content → structured data → authority → platforms → measurement), each item pointing back to its lesson.
  2. *Prioritizing*: blockers first (a robots.txt or WAF block makes everything else moot), then impact vs effort; quick wins vs projects.
  3. *Roadmaps and reporting*: report what you control and what you measured; no promised rankings or citations (Google's "Do you need an SEO?" warns against guarantees; cite it); reporting to clients vs internal stakeholders.
  4. *Your 90-day plan*: days 1–30 baseline and access fixes, 31–60 content and structured data, 61–90 authority work and the first measured report.
  - Signature exercise **"Prioritize the audit"**: a made-up company's audit findings; pick the first fix, `order` the 90-day plan, `choice` the honest stakeholder update.
  - Example to dissect: a real public page with audit or reporting guidance (e.g. Google's "Do you need an SEO?"), 3–4 points.
  - Audit: 10 questions, ≥4 kinds.
  - Outro: the course is done; point to the certificate, and say nothing comes next.
- [ ] **Step 2: Fact-check and cold read** as Task 2 Steps 2–3.
- [ ] **Step 3: Write the failing test** `course-complete-copy.test.ts`: with every catalog lesson live, (a) `LESSON_CATALOG.every((l) => l.status === "live")`; (b) the rendered `AboutContent` contains no "coming soon"; (c) neither blog post's text contains "coming soon" or "Three of its eight" / "Three lessons are live". Run it → FAIL (copy still says three).
- [ ] **Step 4: Fix the copy.** About: show "The rest are coming soon." only when some lesson isn't live. Blog posts: describe the course as eight live lessons; bump each post's modified date to today. Register lesson 8 and go live.
- [ ] **Step 5:** `npx tsc --noEmit && npx vitest run && npm run build` → PASS. Commit `feat: lesson 8 (The Citadel); all eight lessons live`.
- [ ] **Step 6: Final review.** One fresh reviewer reads Lessons 4–8 against this plan's Global Constraints and Review Focus, re-fetching a sample of at least 3 quotes per lesson. Fix findings in a commit `fix: lessons 4–8 review`.

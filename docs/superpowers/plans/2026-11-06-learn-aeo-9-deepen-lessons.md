# Learn AEO — Plan 9: Deepen lessons 2–8, quick questions on every paid lesson

Harry asked (2026-11-06) for lessons 2–8 to reach the depth of lessons 9–12, and for every paid lesson (2–12) to get
the on-card quick questions lesson 1 has. One worker per lesson file; the orchestrator reviews, runs the full suite and
commits. Workers never commit or push (pushing `main` deploys to production).

## Depth targets (lessons 2–8)

Measured 2026-11-06 (concepts / average explanation words / concepts with an example / distinct sources / exercise steps):

| Lesson | Now | Target |
|---|---|---|
| L2 Crawl Docks | 14 / 127 / 10 / 22 / 3 | keep breadth, re-verify 2026 facts, 5 exercise steps |
| L3 Answer Quarter | 11 / 126 / 9 / 12 / 4 | 14+ / 125+ / — / 18+ / 5 |
| L4 Schema Works | 11 / 101 / 5 / 13 / 5 | 14+ / 125+ / 7+ / 18+ / 5 |
| L5 Agora | 8 / 120 / 0 / 14 / 4 | 14+ / 125+ / 5+ / 18+ / 5 |
| L6 Embassies | 9 / 96 / 0 / 11 / 4 | 14+ / 125+ / 5+ / 18+ / 5 |
| L7 Observatory | 9 / 109 / 1 / 14 / 4 | 14+ / 125+ / 5+ / 18+ / 5 |
| L8 Citadel | 8 / 105 / 0 / 8 / 4 | 13+ / 125+ / 5+ / 14+ / 5 |
| L9–L12 (reference) | 14–16 / 124–147 / 2–11 / 18–24 / 5 | quick questions only |

"Deeper" means more concepts that a marketer would actually need, fuller explanations with concrete detail, more
worked examples, and checks/exercise steps that make the learner apply it. Not padding: no repeated points, no filler.
Each group keeps 2–5 concepts and 2–4 checks (aim for 3 checks per group). Read lessons 9–12
(`src/lib/content/lesson-9-the-market.ts` … `lesson-12-the-hall-of-records.ts`) for the bar.

## Quick questions (every concept in lessons 2–12)

Every concept gets a `quiz` (see `Concept.quiz` in `src/lib/lesson-types.ts` and the ten in
`src/lib/content/lesson-1-the-gate.ts`). Rules:

- Answerable **only from what that card says** (explanation, why it matters, example, pitfall). No outside knowledge.
- One clearly right answer; the `explanation` says why it's right, in a sentence or two.
- Mix kinds across a lesson (`choice`, `passage`, `blank`, `order`, `match`, `spot`); `choice` may dominate.
- Ids `cq-<concept-id-without-c->`, unique within the lesson (and not clashing with check/audit/exercise ids).
- Put `quiz` first in the concept object, as lesson 1 does. Quizzes earn no XP; nothing else to wire.

## Global constraints (from Plan 8, still in force)

- **No made-up statistics or claims.** Every number and every claim about how an engine, crawler, platform or policy
  behaves comes from a named, linkable source checked on the `accessed` date. Every quoted string in `explanation`,
  `whyItMatters`, `pitfall` and example `points` must appear **verbatim** on a source cited by that same concept (or the
  example's source). If you can't verify it, cut it. Fetch pages with WebFetch (or the `web-fetch` agent); search with
  WebSearch.
- **Current facts only (today is 2026-11-06).** Re-verify existing claims too, not just new ones. Known 2026 changes:
  Google removed FAQ rich results (2026-05-07); Google's May 2026 AI features guidance says llms.txt and special
  chunking aren't needed for Google Search; GA4 has a default "AI Assistant" channel; Bing Webmaster Tools has an AI
  Performance report (Feb 2026) with Citation Share; OpenAI's publisher FAQ about `utm_source` now redirects away.
  Lessons 2 and 3 must be rechecked against these.
- Sources: `https://`, `accessed` = the day you fetched it (2026-11-06), `date` + `dateKind` together or neither,
  `date <= accessed`. Update `accessed` on every source you re-verify.
- **Made-up examples are labeled** (in the header comment and each example's `note`/caption). No real brand gets
  invented numbers. Keep each lesson's existing made-up company.
- **Legitimate practice only** (no fake reviews, undisclosed paid placement, sock puppets, editing your own Wikipedia
  article, hidden text, prompt injection). Where a tactic is tempting but against a platform's rules, teach the rule.
- **US spelling** (`src/lib/__tests__/us-spelling.test.ts`). If a verbatim quote needs British spelling, prefer a
  different quote; if unavoidable, report the phrase to the orchestrator (do not edit that test yourself).
- No old-course words (`BANNED` in `src/lib/__tests__/lesson-content.test.ts`).
- Voice: second person, plain, concrete, for marketers who know SEO basics. Keep the district intro/outro framing.
- **Keep existing ids.** Concept, check, exercise-step and audit ids are XP claim keys: don't rename or remove them
  (rewording their text is fine). New items get new ids.
- Audit stays 8–12 questions. Exercise gets 5 steps (no step id `clean`). At least 4 question kinds per lesson.

## Files

Each worker edits **only its own lesson file**. Report back (don't edit) anything that needs a shared file:
the lesson's new `minutes` for `src/lib/lesson-catalog.ts` (estimate ~1.6 min per concept plus checks/exercise/audit;
compare with lessons 9–12), a changed catalog `description` if the lesson's scope changed, and US-spelling exceptions.

## Verification (each worker)

1. `npx tsc --noEmit` (whole project; only your file should change).
2. `npx vitest run src/lib/__tests__/lesson-content.test.ts src/lib/__tests__/us-spelling.test.ts src/lib/__tests__/no-egypt.test.ts`
3. `CHECK_QUOTES=1 LESSON=<id> npx vitest run src/lib/__tests__/lesson-quotes.live.test.ts` — every quote found, or each
   page it can't fetch (401/403/429/JS) checked by hand with WebFetch and listed in your report.
4. `CHECK_SOURCES=1 npx vitest run src/lib/__tests__/lesson-sources.live.test.ts` is optional (it checks every lesson).
5. A cold read of every question you wrote or kept: exactly one defensible answer.

Report: before/after numbers (concepts, avg explanation words, examples, sources, exercise steps, quizzes), what you
cut or corrected as out of date, quotes you couldn't machine-check, and the catalog notes above.

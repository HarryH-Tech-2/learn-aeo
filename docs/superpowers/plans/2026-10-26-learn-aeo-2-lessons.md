# Learn AEO — Plan 2: Lesson Model, Player, City Map, Lessons 1–3

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the inherited hieroglyph lesson system with the AEO lesson model, a simple stage-machine lesson player, a City of Answers dashboard map with "coming soon" districts, and three fully written, sourced lessons, so that a signed-in marketer can take Lesson 1 free and paying users can take Lessons 2–3.

**Architecture:** Three layers. (1) Pure logic in `src/lib`: a small edge-safe **catalog** of all 8 lessons (metadata only, imported by middleware and client components), typed **content** per live lesson, **question checking** and the **lesson flow** (the step list and resume rules). (2) A thin **player** in `src/components/player` that renders one step at a time and reports XP and the audit score upward. (3) **Wiring**: the lesson page/API/progress routes, middleware and dashboard read the catalog and content. The old system is renamed `legacy-lessons.ts` in Task 2 so both compile side by side, then deleted in Task 6.

**Tech Stack:** Next 15 app router, React 19, TypeScript, Tailwind v4 tokens, framer-motion, react-markdown + remark-gfm, vitest (node environment, `renderToStaticMarkup` for component tests — there is no testing-library).

**Spec:** `docs/superpowers/specs/2026-10-26-learn-aeo-design.md` (sections "Curriculum", "Lesson content model", "Gamification", "Delivery phases" step 3, "Anti-goals").

**Previous plan:** `docs/superpowers/plans/2026-10-26-learn-aeo-1-fork-strip-pricing.md` (done: commits `75ac53a..24f3a66`).

**Later plans:** 3 gamification (level titles, badges, certificate), emails · 4 marketing pages and hero (home body incl. `LessonsPreview`, cookie banner, `hieroglyph-translator`) · 5 SEO/AEO plumbing (full llms.txt, schema helper) · 6 tools, glossary, blog (blog copy, `GuestPlayBanner`) · 7 deploy readiness.

## Global Constraints

- **No made-up statistics or claims.** Every number, date, quoted rule or factual claim about how an engine or crawler behaves must come from a named, linkable source and be checked against the live page while writing (WebFetch). If it cannot be verified, cut it. No unsourced "X% of searches…".
- **No author**: no author bio, byline, Person/author schema. Attribute to "Learn AEO".
- **No hieroglyph leftovers** in any file this plan creates or rewrites: no Egypt, glyph, papyrus, scribe, pharaoh, tomb, cartouche, expedition, dig, chamber wording or imagery.
- Advice must be legitimate, durable practice: no hidden text, cloaking, prompt injection, fake reviews.
- Audience: marketers who know SEO basics. Second person, plain, concrete. British English (optimisation, programme, behaviour).
- Lesson IDs (URL slugs) and districts, exactly:

  | # | id | District | Title | Level | Minutes | Free |
  |---|---|---|---|---|---|---|
  | 1 | `how-answer-engines-choose-sources` | The Gate | How answer engines choose sources | beginner | 25 | yes |
  | 2 | `make-your-site-reachable-by-ai` | The Crawl Docks | Make your site reachable by AI | beginner | 30 | no |
  | 3 | `writing-citable-content` | The Answer Quarter | Writing citable content | beginner | 30 | no |
  | 4 | `structured-data-and-entities` | The Schema Works | Structured data and entities | intermediate | 30 | no |
  | 5 | `authority-beyond-your-site` | The Agora | Authority beyond your site | intermediate | 25 | no |
  | 6 | `platform-playbooks` | The Embassies | Platform playbooks | intermediate | 25 | no |
  | 7 | `measuring-ai-visibility` | The Observatory | Measuring AI visibility | advanced | 25 | no |
  | 8 | `running-an-aeo-programme` | The Citadel | Running an AEO programme | advanced | 20 | no |

- Lesson shape (spec): narrative intro (arriving in the district) → 3–4 concept groups, each followed by a quick check → one signature exercise → a real-world example to dissect → final **Audit** quiz, passed at ≥60% (`isLessonComplete` in `src/lib/progress.ts`, unchanged) → outro.
- Lesson 1 is free with a sign-in (Google or email); guests see the existing sign-up gate. Lessons 2–8 need lifetime or monthly access.
- Brand tokens: `bg-ink`, `bg-obsidian-light`, `text-sand-100…500`, `text-cyan`, `text-gold`, `font-display` (Instrument Serif), `font-sans` (Inter). Both themes must stay readable.
- Browser storage keys start with `COOKIE_PREFIX` (`"aeo_"`) from `src/lib/site.ts`.
- Source repo `C:\Users\harry\Documents\code\learn-hieroglyphics` is read-only. `.env.local` is never committed. Work on `main` in `C:\dev\learn-aeo` (as in Plan 1); do not push.
- Every task ends green: `npx tsc --noEmit` and `npm test`. Tasks touching pages also run `npm run build`.

## Review Focus

1. **A forged completion** — `POST /api/progress/complete` with `{score: 1, totalQuestions: 1}` for a 10-question audit, an unknown or coming-soon lesson, or a paid lesson by an unpaid user. Expected: 400 (or 403 for the unpaid case), nothing recorded, no offer granted. Test in Task 4.
2. **Paid content leaking** — `GET /api/lessons/<paid id>` for a signed-out or unpaid user must return metadata with `locked: true` and **no** `content` key; a coming-soon id returns its metadata with `status: "coming-soon"`, not a 404 and not content. Test in Task 4.
3. **Shuffled answers** — options are shown in a shuffled order, but a learner who clicks the correct option is marked correct (the check uses original indices). Test in Task 1.
4. **Keyboard-only learners** — drag-to-order and match must work without dragging (move up/down buttons; tap-term-then-definition). Test in Tasks 1 (pure `moveItem`, `pairUp`) and 3 (buttons rendered with accessible names).
5. **Reload mid-lesson** — reloading resumes at the saved step, never past the audit, and a corrupt or stale saved value starts from the beginning. Test in Task 1 (`clampResume`).

---

### Task 1: Lesson types, catalog, question checking and lesson flow

**Files:**
- Create: `src/lib/lesson-types.ts`, `src/lib/lesson-catalog.ts`, `src/lib/questions.ts`, `src/lib/lesson-flow.ts`
- Test: `src/lib/__tests__/lesson-catalog.test.ts`, `src/lib/__tests__/questions.test.ts`, `src/lib/__tests__/lesson-flow.test.ts`

**Interfaces:**
- Produces (`lesson-types.ts`, types only, no imports):
  ```ts
  export type LessonLevel = "beginner" | "intermediate" | "advanced";
  export type Source = { title: string; publisher: string; url: string; published?: string /* YYYY-MM-DD or YYYY-MM, as the page shows it */; accessed: string /* YYYY-MM-DD */ };
  export type CodeLanguage = "text" | "robots" | "json" | "html" | "http" | "markdown";
  export type CodeExample = { kind: "code"; language: CodeLanguage; caption?: string; code: string };
  export type BeforeAfterExample = { kind: "before-after"; before: string; after: string; note: string };
  export type Concept = { id: string; term: string; summary: string; explanation: string /* markdown */; whyItMatters: string; example?: CodeExample | BeforeAfterExample; pitfall: string; sources: Source[] };
  export type Question =
    | { kind: "choice"; id: string; prompt: string; options: string[]; answer: number; explanation: string }
    | { kind: "passage"; id: string; prompt: string; passages: [string, string]; answer: 0 | 1; explanation: string }
    | { kind: "blank"; id: string; prompt: string; text: string /* "___" per gap */; answers: string[]; distractors: string[]; explanation: string }
    | { kind: "order"; id: string; prompt: string; items: string[] /* correct order */; explanation: string }
    | { kind: "match"; id: string; prompt: string; pairs: { term: string; definition: string }[]; explanation: string }
    | { kind: "spot"; id: string; prompt: string; language: CodeLanguage; lines: string[]; answer: number /* line index */; explanation: string };
  export type QuestionKind = Question["kind"];
  export type ConceptGroup = { id: string; title: string; concepts: Concept[]; check: Question[] };
  export type SignatureExercise = { id: string; title: string; brief: string; steps: Question[]; debrief: string };
  export type DissectExample = { title: string; context: string; excerpt: CodeExample | { kind: "quote"; text: string }; points: { label: string; text: string }[]; source: Source };
  export type LessonContent = { intro: string; outro: string; groups: ConceptGroup[]; exercise: SignatureExercise; example: DissectExample; audit: Question[] };
  export type LessonMeta = { id: string; order: number; district: string; title: string; summary: string /* one line */; description: string /* 2–3 sentences */; level: LessonLevel; minutes: number; isFree: boolean; status: "live" | "coming-soon" };
  ```
- Produces (`lesson-catalog.ts`, imports only `lesson-types`; must stay edge-safe for middleware):
  `LESSON_CATALOG: readonly LessonMeta[]` (8 entries, values from the Global Constraints table; **all `status: "coming-soon"` in this task** — Tasks 2, 7, 8 flip 1, 2, 3 to `"live"`), `FIRST_LESSON_ID`, `FIRST_LESSON_PATH` (`"/lessons/how-answer-engines-choose-sources"`), `lessonPath(id: string): string`, `lessonMeta(id: string): LessonMeta | undefined`, `nextLessonMeta(id: string): LessonMeta | undefined`, `publicLessonPaths(): string[]` (free lessons, any status), `TOTAL_MINUTES: number`.
- Produces (`questions.ts`):
  ```ts
  export type QuestionResponse =
    | { kind: "choice"; index: number } | { kind: "passage"; index: 0 | 1 } | { kind: "blank"; fills: string[] }
    | { kind: "order"; order: string[] } | { kind: "match"; pairs: Record<string, string> /* term → definition */ } | { kind: "spot"; line: number };
  export function checkAnswer(q: Question, r: QuestionResponse): boolean; // kind mismatch → false
  export function seedFrom(id: string): number;                         // stable 32-bit hash
  export function shuffled<T>(items: readonly T[], seed: number): T[];  // deterministic permutation (e.g. mulberry32 + Fisher–Yates)
  export function moveItem<T>(items: readonly T[], from: number, dir: -1 | 1): T[]; // no-op at the ends
  export function pairUp(pairs: Record<string, string>, term: string, definition: string): Record<string, string>; // assigning a definition already used moves it
  export function blankCount(text: string): number;
  ```
- Produces (`lesson-flow.ts`):
  ```ts
  export type Step =
    | { kind: "intro" } | { kind: "concept"; group: number; concept: number } | { kind: "check"; group: number }
    | { kind: "exercise" } | { kind: "example" } | { kind: "audit" } | { kind: "outro" };
  export function buildSteps(content: LessonContent): Step[]; // intro, (each concept, then the group's check)…, exercise, example, audit, outro
  export function clampResume(saved: unknown, steps: Step[]): number; // integer in [0, index of audit]; anything else → 0
  export function resumeKey(lessonId: string): string;               // `${COOKIE_PREFIX}lesson_${lessonId}`
  export function progressFraction(index: number, steps: Step[]): number; // 0..1
  ```

- [ ] **Step 1: Write the failing tests**

`lesson-catalog.test.ts`:
- `LESSON_CATALOG` has 8 entries with ids, districts, titles, levels, minutes and `isFree` exactly as the Global Constraints table; orders are 1..8; ids are unique.
- `TOTAL_MINUTES === 210`; `FIRST_LESSON_PATH === "/lessons/how-answer-engines-choose-sources"`.
- `publicLessonPaths()` equals `[FIRST_LESSON_PATH]`; `nextLessonMeta("running-an-aeo-programme")` is `undefined`; `nextLessonMeta(FIRST_LESSON_ID)?.order === 2`.
- The catalog module source text contains no `import` other than `./lesson-types` / `@/lib/lesson-types` (read the file with `fs`) — middleware imports it.

`questions.test.ts` (build small fixture questions inline):
- choice: correct index → true, other → false; a `passage` response to a `choice` question → false.
- **Review Focus 3:** for a 4-option choice question, compute `display = shuffled([0,1,2,3], seedFrom(q.id))`; clicking the displayed position whose value is `q.answer` → `checkAnswer(q, {kind:"choice", index: display[pos]})` is true; `shuffled` returns a permutation (same multiset) and is identical for the same seed.
- blank: `fills` equal to `answers` (trimmed, case-insensitive) → true; wrong order → false; wrong length → false. `blankCount("a ___ b ___") === 2`.
- order: exact order → true; one swap → false.
- match: all pairs right → true; one missing → false. `pairUp({a:"1"}, "b", "1")` → `{ b: "1" }` (the definition moved).
- spot: right line → true.
- **Review Focus 4:** `moveItem(["a","b","c"], 0, -1)` → unchanged; `moveItem(["a","b","c"], 0, 1)` → `["b","a","c"]`; `moveItem([...], 2, 1)` → unchanged.

`lesson-flow.test.ts` (fixture content: 2 groups with 2 and 1 concepts, 1 check each, 2 exercise steps, 3 audit questions):
- `buildSteps` kinds in order: intro, concept(0,0), concept(0,1), check(0), concept(1,0), check(1), exercise, example, audit, outro.
- **Review Focus 5:** `clampResume(3, steps) === 3`; `clampResume(99, steps)` → index of audit; `clampResume(steps.length - 1, steps)` (outro) → index of audit; `clampResume("2", steps) === 0`; `clampResume(-1, steps) === 0`; `clampResume(1.5, steps) === 0`; `clampResume(null, steps) === 0`.
- `resumeKey("x") === "aeo_lesson_x"`; `progressFraction(0, steps) === 0`; `progressFraction(steps.length - 1, steps) === 1`.

- [ ] **Step 2: Run to verify they fail**

Run: `npx vitest run src/lib/__tests__/lesson-catalog.test.ts src/lib/__tests__/questions.test.ts src/lib/__tests__/lesson-flow.test.ts`
Expected: FAIL (modules not found).

- [ ] **Step 3: Implement the four modules** with the signatures above. Each starts with a short header comment saying what it is for (house style). Catalog `summary`/`description` are written from the spec's curriculum line for each lesson, in the course voice.

- [ ] **Step 4: Run the tests, then the full suite**

Run: the three test files, then `npx tsc --noEmit && npm test`. Expected: PASS.

- [ ] **Step 5: Commit** — `feat: lesson types, catalog, answer checking and lesson flow`

---

### Task 2: Lesson 1 content, the new `lessons.ts`, and content checks

**Files:**
- Rename: `src/lib/lessons.ts` → `src/lib/legacy-lessons.ts` (`git mv`), and change every `@/lib/lessons` import in existing files to `@/lib/legacy-lessons` (find them with `grep -rl "@/lib/lessons\"" src`). No other edits to those files.
- Create: `src/lib/lessons.ts`, `src/lib/content/lesson-1-the-gate.ts`
- Modify: `src/lib/lesson-catalog.ts` (lesson 1 `status: "live"`)
- Test: `src/lib/__tests__/lesson-content.test.ts`, `src/lib/__tests__/lesson-sources.live.test.ts`

**Interfaces:**
- Consumes: all of Task 1's types and catalog.
- Produces (`lessons.ts`):
  ```ts
  export type LiveLesson = LessonMeta & { status: "live"; content: LessonContent };
  export type Lesson = LiveLesson | (LessonMeta & { status: "coming-soon" });
  export const LESSONS: readonly Lesson[];            // catalog order; content attached where status is "live"
  export function getLesson(id: string): Lesson | undefined;
  export function isLive(l: Lesson | undefined): l is LiveLesson;
  ```
  `lessons.ts` holds an exported `CONTENT: Readonly<Record<string, LessonContent>>` map; Tasks 7 and 8 add one entry each.
- Produces (`content/lesson-1-the-gate.ts`): `export const LESSON_1: LessonContent`.

- [ ] **Step 1: Write the failing content test** (`lesson-content.test.ts`, loops over every live lesson in `LESSONS` so later lessons are checked automatically):
  - every catalog entry with `status: "live"` has content, and every `CONTENT` key is a catalog id;
  - 3–4 groups; 2–5 concepts per group; 2–4 check questions per group; exercise has ≥3 steps; audit has 8–12 questions; each live lesson uses at least 4 different question kinds across checks, exercise and audit;
  - every concept and the example: ≥1 source; `url` starts `https://`; `accessed` matches `/^\d{4}-\d{2}-\d{2}$/`; `published`, if set, matches `/^\d{4}-\d{2}(-\d{2})?$/`;
  - question validity: choice 3–5 unique options with `answer` in range; blank `blankCount(text) === answers.length`, ≥1 distractor, no distractor equal to an answer; order 3–6 unique items; match 3–5 pairs with unique terms and definitions; spot `answer` within `lines`;
  - ids unique across the lesson (groups, concepts, questions, exercise);
  - `JSON.stringify(content)` matches none of `/hieroglyph|egypt|pharaoh|papyrus|scribe|glyph|tomb|cartouche|expedition/i`.

  `lesson-sources.live.test.ts`: `describe.skipIf(!process.env.CHECK_SOURCES)` — GET every source URL across live lessons (15 s timeout, a browser-like `User-Agent`); 2xx/3xx pass; 401/403/429 are listed with `console.warn("verify by hand: …")` but do not fail; 404/410/5xx/network errors fail with the URL in the message.

- [ ] **Step 2: Run to verify it fails** — `npx vitest run src/lib/__tests__/lesson-content.test.ts` → FAIL (`@/lib/lessons` exports nothing yet, or lesson 1 missing).

- [ ] **Step 3: Do the rename** (`git mv`, update imports), then create `lessons.ts`. Run `npx tsc --noEmit` → clean before writing content.

- [ ] **Step 4: Write `LESSON_1`** — District "The Gate". Groups (titles may be refined; scope is fixed):
  1. *From ten blue links to one answer* — what an answer engine is (ChatGPT search, Perplexity, Google AI Overviews / AI Mode, Copilot, Claude); a cited source vs a mention; why the unit of competition is the passage, not the page.
  2. *Retrieval and grounding* — training data vs live retrieval; retrieval-augmented generation (Lewis et al., 2020); grounding an answer in retrieved documents; engines depend on a search index.
  3. *Query fan-out and source selection* — query fan-out (Google's own AI Mode description); how several sub-queries widen the set of candidate pages; what makes a passage easy to lift.
  - Signature exercise "Trace an answer": order the steps of a grounded answer; pick which sub-queries a fan-out would generate for a sample prompt; classify cited vs mentioned in a sample answer.
  - Example to dissect: Google Search Central's guidance on AI features and your website (developers.google.com/search/docs/appearance/ai-features) — short quoted excerpt, 3–4 dissection points.
  - Audit: 10 questions, at least 4 kinds.
  - Every claim checked against its live source with WebFetch while writing; quote at most a sentence or two per source. Prefer primary sources (engine docs, papers, official blogs).

- [ ] **Step 5: Flip lesson 1 to `live`**, run `npx vitest run src/lib/__tests__/lesson-content.test.ts` → PASS, then `CHECK_SOURCES=1 npx vitest run src/lib/__tests__/lesson-sources.live.test.ts` → PASS (record any "verify by hand" URLs in the report, and confirm them with WebFetch).

- [ ] **Step 6: Full check and commit** — `npx tsc --noEmit && npm test`; commit `feat: lesson 1 (The Gate) content and lesson registry`.

---

### Task 3: The lesson player

**Files:**
- Create in `src/components/player/`: `LessonPlayer.tsx`, `ConceptCard.tsx`, `CodeBlock.tsx`, `QuestionCard.tsx`, `ExampleDissect.tsx`, `AuditResult.tsx`, and `questions/ChoiceQuestion.tsx`, `PassageQuestion.tsx`, `BlankQuestion.tsx`, `OrderQuestion.tsx`, `MatchQuestion.tsx`, `SpotQuestion.tsx`
- Modify: `src/lib/gamification.ts` — add new keys to `XP_REWARDS` (keep the old ones until Task 6): `conceptRead: 5`, `checkCorrect: 10`, `exerciseCorrect: 20`, `exerciseClean: 50`, `auditCorrect: 25`, `perfectAudit: 100`
- Test: `src/components/player/__tests__/player-render.test.tsx`

**Interfaces:**
- Consumes: `LiveLesson` (Task 2); `Question`, `QuestionResponse`, `checkAnswer`, `shuffled`, `seedFrom`, `moveItem`, `pairUp` (Task 1); `buildSteps`, `clampResume`, `resumeKey`, `progressFraction` (Task 1); `isLessonComplete` (`src/lib/progress.ts`); `UpgradePanel` and `OfferData` (existing, `src/components/lesson/UpgradePanel.tsx`, `src/components/OfferBanner.tsx` — read their props).
- Produces:
  ```ts
  // LessonPlayer.tsx (default export)
  type LessonPlayerProps = {
    lesson: LiveLesson;
    onXP: (xp: number) => void;
    onAuditComplete: (score: number, total: number) => void;
    upgrade: { paid: boolean | null; offer: OfferData | null };
    next?: LessonMeta;           // for the outro's "next district" link
    persist?: boolean;           // default true: save/restore the step via localStorage[resumeKey(id)] (wrap in try/catch)
  };
  // QuestionCard.tsx (default export)
  type QuestionCardProps = { question: Question; mode: "practice" | "audit"; onAnswered: (correct: boolean) => void };
  ```
  Practice mode (checks, exercise): instant feedback with the explanation, retry allowed, "Continue" after a correct answer or a second wrong one; XP only for a first-try correct answer. Audit mode: one answer per question, no feedback until the end; `AuditResult` shows score, pass/fail at the `isLessonComplete` mark, per-question explanations, and "Retake the audit".
- Behaviour fixed by this plan:
  - One step on screen at a time, with a progress bar (`progressFraction`) and Back/Next; a header line shows the district name.
  - Concept card shows term, summary in bold first (answer-first), explanation as markdown, "Why it matters", optional example (`CodeBlock` with a language label, or before/after side by side, stacked on mobile), "Pitfall", and the sources as links with publisher and date (`rel="noopener"`, new tab).
  - Choice and passage options are displayed in `shuffled(…, seedFrom(question.id))` order.
  - Order: each item has "Move up" / "Move down" buttons (`aria-label="Move <item> up"` etc.) — no drag dependency. Match: tap a term, then a definition (`aria-pressed` on the selected term). Blank: word-bank chips fill gaps in order; tapping a filled gap clears it. Spot: each line of the snippet is a button.
  - Outro: pass/fail message, XP earned this sitting, then — when `upgrade.paid === false` and the lesson is free — `UpgradePanel` (with the offer if any); otherwise a link to `next` (or "coming soon" if `next.status` is `"coming-soon"`).
  - Fires `trackEvent` from `src/lib/analytics.ts` for `lesson_step` (`step_kind`), `lesson_audit_complete` (`score`, `total`, `passed`). Add a one-line note for each under the existing event list comment in `analytics.ts`.

- [ ] **Step 1: Write the failing render test** (`player-render.test.tsx`, `renderToStaticMarkup`, mocks as in `src/components/__tests__/pricing-display.test.tsx`, fixture `LiveLesson` built inline):
  - `LessonPlayer` with `persist={false}` renders the intro text, the district name and a Next button.
  - `QuestionCard` for an `order` question renders a "Move … up" and "Move … down" button for every item (**Review Focus 4**).
  - `QuestionCard` for a `match` question renders one button per term and one per definition.
  - `QuestionCard` for a `spot` question renders one button per line.
  - `ConceptCard` renders the summary before the explanation in the markup, and each source as a link with its URL.
- [ ] **Step 2: Run to verify it fails** — `npx vitest run src/components/player` → FAIL.
- [ ] **Step 3: Implement the components.** Interaction state lives in the components; all answer logic goes through `checkAnswer`. Use `framer-motion` for step transitions only (respect `prefers-reduced-motion` with `useReducedMotion`).
- [ ] **Step 4: Run tests** — `npx vitest run src/components/player` then `npx tsc --noEmit && npm test` → PASS.
- [ ] **Step 5: Commit** — `feat: lesson player with six question types`

---

### Task 4: Lesson page, lesson API, progress routes and middleware

**Files:**
- Modify: `src/app/lessons/[id]/page.tsx`, `src/app/lessons/[id]/LessonContent.tsx` (rewrite), `src/app/api/lessons/[id]/route.ts` (rewrite), `src/app/api/progress/complete/route.ts`, `src/app/api/progress/xp/route.ts`, `src/middleware.ts`, `src/app/sitemap.ts`, `src/app/llms.txt/route.ts`, `src/lib/email.ts`, `src/app/admin/marketing/page.tsx` (these four switch from `legacy-lessons` to `lessons`/catalog)
- Delete: `src/app/api/progress/section/` (route and its test) — lessons are no longer taken in sections
- Test: rewrite `src/app/api/lessons/__tests__/route.test.ts`; create `src/app/api/progress/__tests__/complete.test.ts`; extend the sitemap/llms tests if present, else add `src/app/__tests__/lesson-listings.test.ts`

**Interfaces:**
- Consumes: `getLesson`, `isLive`, `LESSONS` (Task 2); catalog (Task 1); `LessonPlayer` props (Task 3); `checkSubscription`, `devBypassAuth`, `recordQuizScore`, `isLessonComplete`, offers/ppp helpers (existing).
- Produces — `GET /api/lessons/[id]` responses:
  - unknown id → 404 `{ error }`
  - coming-soon → 200 `LessonMeta` (has `status: "coming-soon"`, no `content`)
  - live and (free, dev bypass, or active access) → 200 `LiveLesson` plus `preview: true` only under dev bypass
  - live, paid, no session or no access → 200 `LessonMeta & { locked: true }` with **no** `content` key
- Produces — `POST /api/progress/complete` validation (before anything is recorded): lesson must be live; `totalQuestions === lesson.content.audit.length`; `score` an integer in `0..totalQuestions`; else 400. Non-free lesson and `checkSubscription(email).active` false → 403. Valid requests behave as today (record, offer on the free lesson, email).
- Produces — `POST /api/progress/xp`: `lessonId` must be a catalog id and `xp` an integer in `1..200`; else 400.

- [ ] **Step 1: Write the failing tests**
  - `route.test.ts` (mock `next-auth`, `@/lib/subscription`, `@/lib/dev-bypass` as the old test does): free live lesson signed-out → has `content`; paid lesson signed-out → `locked: true` and `"content" in body === false`; paid lesson, signed-in without access → same; paid lesson with access → has `content`; coming-soon id (`structured-data-and-entities`) → 200, `status: "coming-soon"`, no `content`; unknown → 404. (**Review Focus 2**)
  - `complete.test.ts` (mock `next-auth`, `@/lib/progress`'s `recordQuizScore`, offers, email, db, ppp): `{score:1,totalQuestions:1}` on lesson 1 → 400 and `recordQuizScore` not called; `score: 11` of 10 → 400; `score: 2.5` → 400; coming-soon id → 400; unknown id → 400; paid lesson with inactive subscription → 403; valid lesson-1 submission (`score 6, totalQuestions 10`) → 200 and `recordQuizScore` called once. (**Review Focus 1**)
  - listings test: `sitemap()` includes `${SITE.url}/lessons/how-answer-engines-choose-sources` and no other `/lessons/` URL; the llms.txt body lists all 8 lessons by title, marks lesson 1 free and every catalog entry with `status: "coming-soon"` as "coming soon", and does not match `/hieroglyph|egypt/i`.
- [ ] **Step 2: Run to verify they fail.**
- [ ] **Step 3: Implement.**
  - `page.tsx`: `generateStaticParams` over all catalog ids; metadata from the catalog (title `"<title> | Learn AEO"`, description, canonical); OG image `/og-default.png`; coming-soon pages get `robots: { index: false }`. LearningResource JSON-LD as now, built from the catalog (`timeRequired: PT<minutes>M`, `educationalLevel`), only for live lessons.
  - `LessonContent.tsx`: keep the session/subscription/progress fetches, the hard sign-up gate for guests, the start/xp/complete/badges calls and the offer handling; drop guest play, sections, expedition, second pass and the door name. Render: loading state (no glyph, a neutral spinner and "Loading lesson…"); coming-soon panel (district, title, description, "This district opens soon. Lifetime access includes every new lesson." and a dashboard link); locked panel (title, description, `<Price />`, checkout CTA, `GuaranteeNote`); otherwise header (breadcrumb Dashboard / district, title, "<minutes> min") and `LessonPlayer` with `next={nextLessonMeta(id)}`.
  - `middleware.ts`: `PUBLIC_LESSONS = publicLessonPaths()` from the catalog; update the comment.
  - `sitemap.ts`: free **live** lessons only. `llms.txt`: replace the course description and lesson lines with AEO copy built from the catalog (Plan 5 does the full llms.txt).
  - `email.ts` / admin: use `LESSONS.length` and `LESSON_CATALOG` — no copy changes (Plan 3).
- [ ] **Step 4: Run** the new tests, then `npx tsc --noEmit && npm test && npm run build` → PASS.
- [ ] **Step 5: Smoke run** — `.env.local` has `AEO_DEV_BYPASS_AUTH=1`; `npm run dev`; open `/lessons/how-answer-engines-choose-sources` and `/lessons/structured-data-and-entities` and take screenshots at 1440×900 and 390×844 (headless Chrome, as in Plan 1). Expected: lesson 1 intro renders in the player; lesson 4 shows the coming-soon panel; no console errors.
- [ ] **Step 6: Commit** — `feat: lesson page, API and progress routes on the new lesson model`

---

### Task 5: Dashboard city map

**Files:**
- Create: `src/lib/city-map.ts`, `src/components/CityMap.tsx`
- Modify: `src/app/dashboard/DashboardContent.tsx`, `src/app/api/me/route.ts` (drop `expedition` / `expeditionLog`), `src/app/certificate/CertificateContent.tsx` (lesson id list from `LESSON_CATALOG`)
- Test: `src/lib/__tests__/city-map.test.ts`, `src/components/__tests__/city-map-render.test.tsx`

**Interfaces:**
- Consumes: catalog (Task 1); `GET /api/me` progress shape (`lessons: Record<id, {started, bestScore, completed}>`).
- Produces:
  ```ts
  export type DistrictStatus = "done" | "next" | "open" | "locked" | "coming-soon";
  export type DistrictView = LessonMeta & { districtStatus: DistrictStatus; started: boolean; bestScore: number | null };
  export function districtViews(catalog: readonly LessonMeta[], progress: Record<string, { started: boolean; bestScore: number | null; completed: boolean }> | null, paid: boolean): DistrictView[];
  ```
  Rules, in order: `status === "coming-soon"` → coming-soon; completed → done; `!isFree && !paid` → locked; the first remaining open district in order → next; the rest → open.
- `CityMap` (default export, props `{ districts: DistrictView[] }`): eight districts in order as cards along a path; each shows number, district, title, level, minutes and its status. Done/next/open link to `lessonPath(id)`; locked links to `/pricing`; coming-soon is not a link and is labelled "Coming soon".

- [ ] **Step 1: Write the failing tests**
  - `city-map.test.ts`: no progress, unpaid → lesson 1 next, 2–3 locked, 4–8 coming-soon (with lessons 2–3 live; build the catalog fixture inline so the test does not depend on which lessons are live yet); lesson 1 done, paid → 1 done, 2 next, 3 open, 4–8 coming-soon; a completed coming-soon id stays coming-soon.
  - `city-map-render.test.tsx`: renders 8 districts; coming-soon districts have no `href`; locked ones link to `/pricing`; the next district links to its lesson path.
- [ ] **Step 2: Run to verify they fail.**
- [ ] **Step 3: Implement**; in `DashboardContent.tsx` replace `ProgressMap`, `ExpeditionHeader`, `SealedDoor`, `FindsTray`, `ExpeditionLog`, `useExpedition*` and the hardcoded `dashboardLessons` with `CityMap` fed by `districtViews(LESSON_CATALOG, progress?.lessons ?? null, access.active)`. Keep XPBar, BadgeShelf, Leaderboard, OfferBanner, UpgradePanel, HeardAboutCard and the certificate preview. Heading: "The City of Answers"; one line under it with completed count of live lessons and "N more districts opening soon".
- [ ] **Step 4: Run** tests, `npx tsc --noEmit && npm test && npm run build` → PASS; screenshot `/dashboard` (dev bypass) at both widths.
- [ ] **Step 5: Commit** — `feat: City of Answers dashboard map with coming-soon districts`

---

### Task 6: Remove the hieroglyph lesson system

**Files:**
- Delete: `src/lib/legacy-lessons.ts`, `src/lib/expedition.ts`, `src/lib/expedition-client.ts`, `src/lib/exercises.ts`, `src/lib/quiz.ts`, `src/lib/objects.ts`, `src/lib/tomb-wall.ts`, `src/lib/transliteration.ts`, `src/lib/numerals.ts`, `src/lib/fly-glyph.ts`, `src/lib/speech.ts`, `src/lib/sfx.ts`, `src/lib/content/{door-name,lesson-extras,lesson-sections,uniliteral-words,uniliterals}.ts`, `src/components/LessonStage.tsx`, `src/components/ProgressMap.tsx`, `src/components/lesson/*` **except** `UpgradePanel.tsx`, `src/components/mechanics/`, `src/components/exercises/`, `src/components/journey/`, and their tests (`expedition`, `lesson-sections`, `exercises`, `door-name`, `uniliteral-words`, `word-card-options`, `progress-map-parts`, and any other test importing a deleted module)
- Then delete any of these that nothing else imports: `src/components/LessonQuiz.tsx`, `src/components/SealedPanel.tsx`, `src/components/LinguisticTooltip.tsx`, `src/components/three/*`, `src/components/reveal.ts`
- Delete assets: `public/lessons/`, `public/models/`, `public/videos/` (untracked local copy; the sibling keeps the originals) — after grepping `src` for each path prefix and finding no remaining reference
- Modify: `src/lib/progress.ts` (remove the expedition-log append from `recordXP`), `src/lib/gamification.ts` (remove the old `XP_REWARDS` keys; adjust `gamification.test.ts`), `src/app/layout.tsx` and `src/styles/globals.css` (remove the Noto Sans Egyptian Hieroglyphs preload/`@font-face` and its place in the font stacks), `src/lib/analytics.ts` (drop imports of deleted modules)
- Rewire literal old lesson paths to `FIRST_LESSON_PATH` / `FIRST_LESSON_ID`: `src/lib/new-user-landing.ts`, `src/lib/guest-play.ts`, `src/lib/nurture-emails.ts`, `src/lib/nurture-run.ts`, `src/components/HeroSection.tsx`, `src/components/Leaderboard.tsx`, `src/app/blog/[slug]/BlogPostContent.tsx`, `src/app/blog/blog-text.ts`, `src/lib/blog-posts.ts`, and their tests' expected strings. `GuestPlayBanner` `SCENE_SRC` → `/og-default.png`. `LessonsPreview.tsx` renders `LESSON_CATALOG` (number, district, title, summary, level, minutes, Free/Coming soon) in its existing layout, with no glyphs.

**Interfaces:**
- Consumes: everything from Tasks 1–5. Produces nothing new.
- Rule: when a remaining file imports a deleted module, remove the usage; do not keep the module. Copy rewrites beyond the path swap belong to Plans 3, 4 and 6 — leave other sibling copy alone.

- [ ] **Step 1: Write the failing guard test** `src/lib/__tests__/no-legacy-lessons.test.ts`: none of the deleted paths exists (`fs.existsSync`); no file under `src` contains any of the old lesson ids (`expedition-begins`, `outer-courtyard`, `pilgrims-gallery`, `the-treasury`, `royal-hall`, `sacred-chapel`, `hypostyle-hall`, `inner-sanctum`) except `src/lib/gamification.ts` badge criteria (Plan 3 renames badges; assert that exception explicitly) and generic path examples in `checkout-return.test.ts` / `create-checkout-authenticated.test.ts`; `src/app/lessons`, `src/app/dashboard`, `src/components/player`, `src/components/CityMap.tsx`, `src/lib/lessons.ts`, `src/lib/lesson-*.ts`, `src/lib/content/` match none of `/hieroglyph|egypt|glyph|papyrus|scribe|pharaoh|expedition/i`.
- [ ] **Step 2: Run to verify it fails.**
- [ ] **Step 3: Delete, rewire, and let `npx tsc --noEmit` find the rest.**
- [ ] **Step 4: Run** `npx tsc --noEmit && npm test && npm run build` → PASS; smoke `/`, `/dashboard`, `/lessons/how-answer-engines-choose-sources`, `/blog` → 200.
- [ ] **Step 5: Commit** — `refactor: remove the hieroglyph lesson system`

---

### Task 7: Lesson 2 content — The Crawl Docks

**Files:**
- Create: `src/lib/content/lesson-2-the-crawl-docks.ts` (`export const LESSON_2: LessonContent`)
- Modify: `src/lib/lessons.ts` (register), `src/lib/lesson-catalog.ts` (lesson 2 `live`)
- Test: covered by `lesson-content.test.ts` and `lesson-sources.live.test.ts` (Task 2)

**Interfaces:** Consumes Task 1 types and Task 2's registry. Same constraints and verification as Task 2 Step 4.

- [ ] **Step 1: Write `LESSON_2`.** Groups (scope fixed):
  1. *Who is knocking* — AI training crawlers vs search crawlers vs user-triggered fetchers, using each vendor's own documentation for user-agent names and purposes (OpenAI, Anthropic, Perplexity, Google's `Google-Extended` token, Common Crawl `CCBot`); a product token is not a crawler.
  2. *robots.txt done right* — RFC 9309 rules (groups, user-agent matching, most-specific-match for Allow/Disallow); robots.txt controls crawling, not indexing; what each vendor says its token does and does not control.
  3. *Rendering and discovery* — content that needs client-side JavaScript to appear (cite a published study or vendor statement on whether AI crawlers render JS, or state only what is documented); XML sitemaps (sitemaps.org); IndexNow (indexnow.org); llms.txt as a proposal (llmstxt.org) — present it accurately as a proposed convention, not as something engines are documented to use unless a source says so.
  4. *The bouncer at the door* — CDN/WAF bot management blocking AI crawlers (cite the CDN's own announcement/docs, e.g. Cloudflare's); checking server logs for crawler hits.
  - Signature exercise "Fix the robots.txt": a robots.txt that unintentionally blocks a search-answer crawler — spot the blocking line, choose the corrected group, fill the blanks in the fixed file.
  - Example to dissect: a real, public robots.txt or llms.txt (quote ≤15 lines, with the accessed date), 3–4 points.
  - Audit: 10 questions, at least 4 kinds, including one `spot` on a robots.txt.
- [ ] **Step 2: Register and flip to live**; run `npx vitest run src/lib/__tests__/lesson-content.test.ts` and `CHECK_SOURCES=1 npx vitest run src/lib/__tests__/lesson-sources.live.test.ts` → PASS.
- [ ] **Step 3: Full check** `npx tsc --noEmit && npm test`; walk the lesson in the browser under dev bypass to the outro (one screenshot per step kind). **Commit** — `feat: lesson 2 (The Crawl Docks) content`

---

### Task 8: Lesson 3 content — The Answer Quarter

**Files:**
- Create: `src/lib/content/lesson-3-the-answer-quarter.ts` (`export const LESSON_3: LessonContent`)
- Modify: `src/lib/lessons.ts`, `src/lib/lesson-catalog.ts` (lesson 3 `live`)

**Interfaces:** as Task 7.

- [ ] **Step 1: Write `LESSON_3`.** Groups (scope fixed):
  1. *Answer first* — lead with the answer (a one- or two-sentence direct answer under the question); definitions that stand alone.
  2. *Passages that stand alone* — each paragraph understandable when lifted out (name the subject, no dangling "this/it"); Google's passage-based ranking (cite Google's own announcement); one idea per passage.
  3. *Structure engines can lift* — question-shaped headings; lists for steps, tables for comparisons; semantic HTML.
  4. *Freshness and proof* — visible published/updated dates; citing sources and original data; Google's "helpful, reliable, people-first content" guidance (cite Search Central).
  - Signature exercise "Rewrite it answer-first": a real-looking weak passage improved in 3–4 `passage` / `choice` steps (pick the better opening, the better heading, the better self-contained sentence, the better list form).
  - Example to dissect: a real public page passage that answers first (short quote, linked, accessed date), 3–4 points.
  - Audit: 10 questions, at least 4 kinds, including at least two `passage` questions.
- [ ] **Step 2: Register and flip to live**; content and live-source tests → PASS.
- [ ] **Step 3: Full check and commit** — `npx tsc --noEmit && npm test`; commit `feat: lesson 3 (The Answer Quarter) content`

---

### Task 9: Walkthrough and README

**Files:**
- Modify: `README.md` (status line: Plan 2 done; Plan 3 next; how lessons are structured — catalog, content files, `CHECK_SOURCES=1` source check; how to add a lesson)
- Fix: anything the walkthrough finds

- [ ] **Step 1: Walk all three lessons** under dev bypass from intro to outro at 1440×900 and 390×844, in dark and light theme; answer one audit to pass and one to fail; reload mid-lesson to confirm resume. Save screenshots to the scratchpad. Expected: no horizontal scroll at 390 px, readable contrast in both themes, every question kind usable with keyboard only (Tab/Enter/Space), no console errors.
- [ ] **Step 2: Fix what it finds** (each fix with its test where the bug is in logic).
- [ ] **Step 3: Update README**, run `npx tsc --noEmit && npm test && npm run build` → PASS, commit `docs: README for the lesson system`.

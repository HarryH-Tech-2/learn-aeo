# Learn AEO — Plan 3: No Egypt Anywhere, Server-Side XP, Gamification and Emails

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove every Egyptian / hieroglyph reference from the shipped site (copy, imagery, features, routes, emails, styles, tests), make XP once-only on the server, rename levels and badges to the City of Answers theme, rewrite the emails for marketers, do the Plan 2 polish items, and lock it all in with a site-wide ban test.

**Architecture:** Delete whole features that only existed for the old course (translator, guest-play games, lesson audio, blog posts, dead CSS). Rewrite the copy of every surviving page and email. Replace Egyptian images with code-generated brand images (SVG rendered to webp/png with `sharp`, already a dependency) under **new filenames** (Vercel caches `/badges/*` and `/blog/*.webp` immutably). Move XP awarding to the server: the player sends a claim key, the server computes the XP from the lesson content and records each key once per user (`XpClaim` table). Finish with a test that walks the whole repo for banned words.

**Tech Stack:** Next 15 app router, React 19, TypeScript, Prisma 6 (Postgres), Tailwind v4 (CSS-first theme in `src/styles/globals.css`), Resend emails, `sharp`, vitest (node environment, `renderToStaticMarkup`; no testing-library).

**Spec:** `docs/superpowers/specs/2026-10-26-learn-aeo-design.md` (sections "Anti-goals" — no hieroglyphics leftovers; "Gamification"; "Email"; "Pages"; "SEO / AEO").

**Previous plans:** 1 `docs/superpowers/plans/2026-10-26-learn-aeo-1-fork-strip-pricing.md` (done) · 2 `docs/superpowers/plans/2026-10-26-learn-aeo-2-lessons.md` (done, `a144d1e..505f72e`).

**Scope note:** this plan pulls forward the Egypt-removal parts of the old Plans 3, 4 and 6 at Harry's request (2026-10-27). Still later: the Three.js City of Answers hero (keep the `three` / `@react-three/*` dependencies for it), full SEO plumbing, tools, glossary, real AEO blog posts, deploy.

**Harry's decisions (2026-10-27):**
- Blog: delete all 15 hieroglyph posts and their images; keep `/blog` live with a "posts coming soon" message.
- Images: replace badges, certificate background and email images with code-generated brand designs (ink background, cyan and gold, Instrument Serif).
- Remove the hieroglyph translator, the guest-play mini-games and the lesson audio entirely.

## Global Constraints

- **No Egypt anywhere** in shipped files: no Egypt, Egyptian, hieroglyph(ic), glyph, papyrus, pharaoh, tomb, cartouche, scribe/scribal, expedition, chamber, ankh, Rosetta, Nile, Tutankhamun, Horus, scarab, dig/digger, archaeologist/Egyptologist, temple-room names (courtyard, hypostyle, sanctum, chapel, treasury, royal hall), "Noto Sans Egyptian Hieroglyphs", "Segoe UI Historic", or characters U+13000–U+1342F. Legitimate exceptions only: "inverted pyramid" (journalism, lesson 3), the word "describe"/"subscribe", "digital", Egypt as a **country name** in the PPP country data (`src/lib/ppp.ts`) and its test, and the guard tests' own word lists. `docs/**` (historic plans/specs) is out of scope.
- **No made-up statistics or claims** in any rewritten copy. Every number or factual claim about engines/crawlers comes from a named, linkable source checked live (WebFetch), or is cut. No claims about the team's credentials. No testimonials, learner counts or ratings that are not real.
- **No author**: no bio, byline or Person/author schema. Attribute to "Learn AEO" (`SITE` in `src/lib/site.ts`).
- Audience: marketers who know SEO basics. Second person, plain, concrete. British English (optimisation, programme, behaviour). City of Answers theme: districts, gates, docks, quarter, works, agora, embassies, observatory, citadel.
- Level titles, exactly (spec): 1 Query Rookie (0 XP) · 2 Crawl Wrangler (200) · 3 Snippet Smith (500) · 4 Entity Architect (1000) · 5 Citation Hunter (2000) · 6 Answer Strategist (3500) · 7 Answer Engine Authority (5000).
- Lesson ids and districts are unchanged from Plan 2 (`src/lib/lesson-catalog.ts`).
- XP values are unchanged (`XP_REWARDS` in `src/lib/gamification.ts`: conceptRead 5, checkCorrect 10, exerciseCorrect 20, exerciseClean 50, auditCorrect 25, perfectAudit 100).
- Brand tokens: `bg-ink`, `bg-obsidian-light`, `text-sand-100…500`, `text-cyan`, `text-gold`, `font-display` (Instrument Serif), `font-sans` (Inter). Both themes must stay readable. Brand colours: navy `#04060d`, cyan `#6fe3ff`, gold `#ffc76b`.
- Replaced images get **new filenames**; delete the old files. Generated images are produced by a committed script under `scripts/dev/` so they can be rebuilt.
- Browser storage keys start with `COOKIE_PREFIX` (`"aeo_"`).
- Work on `main` in `C:\dev\learn-aeo`; never push; never commit `.env.local`. The source repo `C:\Users\harry\Documents\code\learn-hieroglyphics` is read-only.
- Machine memory is tight: at most one `next dev` server and one headless browser at a time; never run `npm run build` while a dev server is up.
- Every task ends green: `npx tsc --noEmit` and `npm test`; tasks touching pages also `npm run build`.

## Review Focus

1. **Replayed or concurrent XP claims** — the same claim key sent twice (reload, two tabs, two requests at once) awards XP once. Test in Task 4 (pure `xpForClaim` + route test with a duplicate claim; the unique constraint handles the race).
2. **Audit retakes** — a retake scoring lower than the best awards 0; a higher one awards only the difference; a perfect run adds the bonus once. Test in Task 4.
3. **XP for locked or unknown lessons** — a claim for a paid lesson by an unpaid user returns 403; a coming-soon or unknown lesson, or a key that is not in the lesson's content, returns 400. Test in Task 4.
4. **Empty blog** — `/blog` with zero posts renders the coming-soon state, the sitemap builds without a "newest post" date, and an old `/blog/<old-slug>` URL is a 404, not a crash. Test in Task 2.
5. **Re-seeding badges over an old database** — running the badge seed where old Egyptian badge rows exist leaves only the new definitions. Test in Task 3 (pure `staleBadgeNames(existing, definitions)`).

---

### Task 1: Delete the old features (translator, guest play, audio, dead CSS)

**Files:**
- Delete: `src/lib/hieroglyph-translator.ts`, `src/lib/hieroglyph-translator-locales.ts`, `src/lib/__tests__/hieroglyph-translator.test.ts`, `src/components/GuestPlayBanner.tsx`, `src/lib/guest-play.ts`, `src/lib/__tests__/guest-play.test.ts`, `public/audio/`, `public/dev-audio/`, `scripts/dev/build-og-image.ts`
- Rewrite: `src/components/ContactForm.tsx` (plain form: no seal, no glyph labels, no translator), `src/components/CookieScroll.tsx` (plain on-brand consent banner; keep the `src/lib/consent.ts` logic and the component's export/props so `layout.tsx` is unchanged; rename the file only if you update its importer)
- Modify: `src/app/blog/[slug]/BlogPostContent.tsx` (drop GuestPlayBanner / `guestPlayHref` usage; the CTA rewrite is Task 2), `src/components/AuthPromptCard.tsx` (comment), `next.config.ts` (drop the `models|fonts|dev-audio` header rule and its comment if nothing else needs it), `src/styles/globals.css`
- Test: `src/lib/__tests__/no-legacy-lessons.test.ts` (add the deleted paths to `DELETED[]`)

**Interfaces:** Produces: no file imports the translator or guest-play modules.

- [ ] **Step 1:** Add every deleted path above to `DELETED[]` in `no-legacy-lessons.test.ts`. Run `npx vitest run src/lib/__tests__/no-legacy-lessons.test.ts` → FAIL (files exist).
- [ ] **Step 2:** Rewrite ContactForm and CookieScroll without the translator, then delete the files. Remove the translator/guest-play/hieroglyph analytics JSDoc entries from `src/lib/analytics.ts` comments (the `ExerciseKind` union is Task 7).
- [ ] **Step 3: Purge Egypt CSS** from `globals.css`. Dead blocks (no reference in any `.ts/.tsx` — confirm each with a grep before deleting): `.floating-hieroglyph`, `.bg-papyrus-texture`, `.divider-hieroglyph`, `.ws-*`, `.ap-glyph`, `.cartouche-ring`, `.glyph-cell`, `.dig-*` and its keyframes, `.cq-*` and keyframes, `.kb-key` and `input[name^=glyph-]`, `.nav-cta-glyph`, `.lesson-btn*` / `.lesson-inlay*` (only if unused by the Plan 2 player — grep), `.door-open-cartouche`, `.chamber-*`, `.gp-*` and keyframes. Replace the papyrus cookie styles and contact-form letter styles with whatever the rewritten components need (or Tailwind classes). Rename `--color-papyrus` to a neutral name and update its users. Remove `"Segoe UI Historic"` from font stacks. Leave `.hero-cta`, `.footer-egypt*` and `.hieroglyph-font/.glyph-font` for Task 6 (their components are rewritten there).
- [ ] **Step 4:** `npx tsc --noEmit && npm test && npm run build` → PASS. Commit `refactor: remove translator, guest play, lesson audio and dead Egypt CSS`.

---

### Task 2: Blog — no posts, coming-soon page

**Files:**
- Modify: `src/lib/blog-posts.ts` (export an empty `blogPosts: BlogPost[]`; keep the `BlogPost` type minus the `glyph` field, ready for Plan 6's AEO posts), `src/app/blog/page.tsx`, `src/app/blog/BlogContent.tsx`, `src/app/blog/[slug]/page.tsx`, `src/app/blog/[slug]/BlogPostContent.tsx`, `src/app/blog/blog-text.ts`, `src/app/sitemap.ts`
- Delete: every file under `public/blog/` (14 webp + `best-courses/`, `is-it-hard/`)
- Test: `src/app/blog/__tests__/blog-text.test.ts`, `src/lib/__tests__/sitemap.test.ts` (or the existing sitemap test file), a render test for the empty blog index

**Interfaces:** Produces: `blogPosts` (empty array, same type) for Plan 6.

- [ ] **Step 1: Write failing tests.** (a) Rendering the blog index content with `blogPosts = []` contains the coming-soon message and a link to lesson 1, and no post cards. (b) `sitemap()` builds with zero posts: no `/blog/<slug>` entries and no crash on a missing newest-post date; `/blog` itself is left out of the sitemap while there are no posts. (c) `blog-text.test.ts` no longer iterates old posts and still asserts its link rules on `IN_BODY_LINKS_MD`.
- [ ] **Step 2:** Empty the posts and delete the images. Blog index: name "The Learn AEO Blog" (or similar), description about AEO for marketers, coming-soon state ("Articles are on their way…" plus a CTA to the free lesson), `robots: { index: false }` while `blogPosts.length === 0`. `[slug]/page.tsx`: `generateStaticParams` returns `[]` and an unknown slug calls `notFound()`; rewrite its keywords and the BlogPostContent CTA/alphabet copy for AEO (lesson 1 CTA). `blog-text.ts`: rewrite `IN_BODY_LINKS_MD` for AEO. `sitemap.ts`: drop the hieroglyph slug regex, the cartouche priority and the "sibling posts" comment.
- [ ] **Step 3:** `npx tsc --noEmit && npm test && npm run build` → PASS (build must show `/blog` and no `/blog/<slug>` pages). Commit `feat: empty blog with coming-soon page`.

---

### Task 3: Levels, badges, badge art, certificate, leaderboard

**Files:**
- Modify: `src/lib/gamification.ts` (`LEVEL_THRESHOLDS`, `getLevelTitle` fallback, `BADGE_DEFINITIONS`), `src/app/api/badges/check/route.ts` (milestone keys), `src/components/BadgeShelf.tsx` (hint copy), `scripts/seed-badges.ts`, `src/components/Leaderboard.tsx` (medals, font, copy), `src/app/leaderboard/page.tsx`, `src/app/certificate/CertificateContent.tsx` (only if the name position changes)
- Create: `scripts/dev/build-badges.mjs` (SVG → webp via `sharp` for every badge and the certificate template), `src/lib/badge-seed.ts` (`staleBadgeNames`)
- Replace: `public/badges/*.webp` (delete the 16 old files; write new ones named after the new criteria keys, e.g. `public/badges/district-the-gate.webp`), `public/certificate-template.webp` → `public/certificate-aeo.webp`
- Test: `src/lib/__tests__/gamification.test.ts`, `src/lib/__tests__/badge-seed.test.ts`, the existing badges-check and BadgeShelf tests; `no-legacy-lessons.test.ts` (tighten the old-lesson-id exception list: `gamification.ts` is no longer allowed)

**Interfaces:**
- Produces: `BADGE_DEFINITIONS` with this list (name | criteria | description | icon), exact:

  | Name | Criteria | Description |
  |---|---|---|
  | Through the Gate | `complete:how-answer-engines-choose-sources` | Completed The Gate |
  | Dockmaster | `complete:make-your-site-reachable-by-ai` | Completed The Crawl Docks |
  | Quotable | `complete:writing-citable-content` | Completed The Answer Quarter |
  | Schema Smith | `complete:structured-data-and-entities` | Completed The Schema Works |
  | Voice of the Agora | `complete:authority-beyond-your-site` | Completed The Agora |
  | Ambassador | `complete:platform-playbooks` | Completed The Embassies |
  | Stargazer | `complete:measuring-ai-visibility` | Completed The Observatory |
  | Keeper of the Citadel | `complete:running-an-aeo-programme` | Completed The Citadel |
  | Perfect Audit | `perfect-audit` | Scored 100% on a lesson audit |
  | 3-Day Streak | `streak:3` | Kept a 3-day streak |
  | 7-Day Streak | `streak:7` | Kept a 7-day streak |
  | 30-Day Streak | `streak:30` | Kept a 30-day streak |
  | First Steps | `milestone:first-lesson` | Started your first lesson |
  | Halfway Across the City | `milestone:half-city` | Completed 4 districts |
  | The Whole City | `milestone:all-districts` | Completed all 8 districts |

  The old "Sharp Memory" badge (a matching game that no longer exists) is dropped. Milestone rules in the badges-check route: `first-lesson` startedCount ≥ 1, `half-city` completedCount ≥ 4, `all-districts` completedCount ≥ 8. `perfect-audit` fires where `perfect-report` used to.
- Produces: `staleBadgeNames(existing: string[], definitions: { name: string }[]): string[]` in `src/lib/badge-seed.ts`; the seed deletes those Badge rows (pre-launch: no real user badges to keep).

- [ ] **Step 1: Failing tests.** `gamification.test.ts`: `getLevelTitle(0) === "Query Rookie"`, `getLevelTitle(5000) === "Answer Engine Authority"`, every threshold/title pair from the Global Constraints, and every `complete:` criterion names a lesson id in `LESSON_CATALOG`. `badge-seed.test.ts`: `staleBadgeNames(["Base Camp Secured","Dockmaster"], defs)` → `["Base Camp Secured"]`. Badges-check: the three milestone keys fire at the thresholds above. Run → FAIL.
- [ ] **Step 2:** Implement levels, badges, check route, BadgeShelf hints, seed cleanup. Leaderboard: replace glyph medals with plain ranks or simple icons, drop the Egyptian font, rewrite copy ("learners", lesson 1 link).
- [ ] **Step 3: Badge and certificate art.** `scripts/dev/build-badges.mjs` draws each badge as an SVG (navy disc, cyan/gold rings, a simple geometric emblem per district or kind, Instrument Serif label optional) and writes webp with `sharp`; it also draws the certificate template (landscape, sized for LinkedIn, e.g. 2000×1414; navy, gold border, "Learn AEO", "Certificate of completion", course title "Answer Engine Optimisation", a blank name line, and space for date and verification URL if `CertificateContent.tsx` draws them). Keep the name line where `CertificateContent.tsx` draws the name (`0.615w, 0.57h`) or move both together. Run the script, view two badges and the certificate (Read the image files) and check they read well; delete the old images; point icons and the certificate component at the new files.
- [ ] **Step 4:** `npx tsc --noEmit && npm test && npm run build` → PASS. Commit `feat: City of Answers levels, badges and certificate art`.

---

### Task 4: Server-side, once-only XP

**Files:**
- Modify: `prisma/schema.prisma` (add `XpClaim`), `src/app/api/progress/xp/route.ts`, `src/lib/progress.ts` (`recordXP` writes through claims), `src/components/player/LessonPlayer.tsx` and `src/components/player/xp.ts` (`onXP` reports a claim, not an amount), `src/app/lessons/[id]/LessonContent.tsx` (`handleXP`), `src/lib/gamification.ts` (remove `MAX_XP_AWARD` if nothing else uses it)
- Create: `prisma/migrations/20261027000000_xp_claims/migration.sql`, `src/lib/xp-claims.ts`
- Test: `src/lib/__tests__/xp-claims.test.ts`, `src/app/api/progress/__tests__/xp.test.ts` (extend the existing xp route test), player tests that assert `onXP` calls

**Interfaces:**
- Schema: `model XpClaim { id String @id @default(cuid()); userId String; lessonId String; key String; xp Int; createdAt DateTime @default(now()); updatedAt DateTime @updatedAt; user User @relation(fields: [userId], references: [id], onDelete: Cascade); @@unique([userId, lessonId, key]) }` (plus the back-relation on `User`). Write the migration SQL without a live database: `git show HEAD:prisma/schema.prisma > <scratch>/old.prisma` then `npx prisma migrate diff --from-schema-datamodel <scratch>/old.prisma --to-schema-datamodel prisma/schema.prisma --script`.
- Claim keys (the player's existing once-per-sitting keys, made explicit): `concept:<conceptId>`, `check:<questionId>`, `exercise:<exerciseId>:<questionId>`, `exercise:<exerciseId>:clean`, `audit`.
- `xpForClaim(lesson: LessonContent, key: string, auditScore?: number): number | null` in `src/lib/xp-claims.ts` — the XP the key is worth from `XP_REWARDS`, or `null` if the key is not in this lesson's content (or `audit` without a whole-number score from 0 to the audit length). Audit: `score × auditCorrect + (score === audit length ? perfectAudit : 0)`.
- `POST /api/progress/xp` body `{ lessonId: string; key: string; auditScore?: number }` → `{ awarded: number; totalXP: number; newLevel: number }`. 401 signed out; 400 unknown/coming-soon lesson or `xpForClaim` null; 403 paid lesson without `checkSubscription(email).active`. Award rule: new key → its XP; existing non-audit key → 0; `audit` → `max(0, value − stored)` and store the higher value.
- Player: `onXP(claim: { key: string; auditScore?: number })`; the in-sitting `claimed` set stays (so the UI does not double-count), but amounts are no longer sent.

- [ ] **Step 1: Failing tests.** `xp-claims.test.ts` on a fixture lesson: each key kind returns its `XP_REWARDS` value; an unknown concept/question/exercise id → `null`; `audit` with 8/10 → 200, 10/10 → 350, 11/10 or 2.5 or missing → `null`. Route test (prisma mocked as the existing route tests do): duplicate `check:` claim → second response `awarded: 0`; audit 6 then 9 → awarded 150 then 75; audit 9 then 6 → 225 then 0; unpaid user on lesson 2 → 403; coming-soon lesson → 400; bogus key → 400. Run → FAIL.
- [ ] **Step 2:** Schema, migration, `xp-claims.ts`, route, `recordXP` (create-or-update the claim and increment `LessonProgress.xpEarned` and `User.xp` by `awarded` in one transaction; a unique-constraint race on create counts as "already claimed", awarding 0), player and `handleXP` wiring.
- [ ] **Step 3:** `npx prisma generate && npx tsc --noEmit && npm test` → PASS. Commit `feat: server-side once-only XP claims`.

---

### Task 5: Emails for marketers

**Files:**
- Modify: `src/lib/email.ts` (purchase welcome copy; rename `sendNextChamberEmail` → `sendLessonCompleteEmail` and rewrite it; its log tag), `src/app/api/progress/complete/route.ts` (call site), `src/lib/nurture-emails.ts` (rewrite the whole sequence), `src/lib/nurture.ts` (comment), `src/lib/nurture-run.ts` (day-0 welcome), `src/lib/email-layout.ts` (images, comments), `src/app/api/newsletter/route.ts` (copy)
- Create/replace: `scripts/dev/build-email-art.mjs` (the layout already cites this missing script) writing new email images (e.g. `public/email/city-header.png`, `public/email/rule.png`, `public/email/mark-aeo.png`); delete `public/email/door.jpg`, `causeway.jpg`, `frieze.png`, and `mark.png` if Egyptian
- Test: `src/lib/__tests__/email.test.ts`, `src/lib/__tests__/nurture-emails.test.ts`, `src/lib/__tests__/nurture-run.test.ts` (or the existing nurture test), `src/app/api/progress/__tests__/complete.test.ts`

**Interfaces:** `sendLessonCompleteEmail(to: string, opts)` keeps the old function's parameters.

- [ ] **Step 1: Failing tests.** Completion email: subject/body mention the lesson just passed and the next district by its catalog title, and link to `/lessons/<next id>` or pricing. Nurture: every email's links point at routes that exist (`/lessons/…`, `/pricing`, `/dashboard`, `/get-started`, `/`, the unsubscribe route) — build the set from the app's route list or an explicit allowed list; no `/cartouche-image`, no translator, no `/daily`. Day-0 welcome: sent only when `NURTURE_ENABLED === "true"` (it currently goes out regardless — this was flagged as a must-fix before real sign-ups). Run → FAIL.
- [ ] **Step 2:** Rewrite all copy in the City of Answers voice for marketers: the welcome, day-1/day-2 nudges to lesson 1, the "what you can read now" email → "what you learned in The Gate", the free-stuff email → a short "what's inside the course" email (no tools exist yet; do not promise any), the offer/recovery emails. Keep step ids and schedule unless a step is meaningless (then rename it and its tests). No claims without sources. Build and reference the new email images.
- [ ] **Step 3:** `npx tsc --noEmit && npm test` → PASS. Commit `feat: rewrite emails for Learn AEO`.

---

### Task 6: Page copy and metadata

**Files (rewrite the Egyptian copy/visuals in each):**
- Home and shell: `src/app/layout.tsx` (description, OG and Twitter descriptions), `src/app/home/HomePage.tsx` (Course JSON-LD description), `src/components/HeroSection.tsx` (static hero: AEO headline and subline, CTA; drop the missing video/poster references and Egyptian alt text — the Three.js hero is a later plan), `src/app/home/HeroCta.tsx` and the `.hero-cta` CSS (no eye-of-Horus seal), `src/components/FeaturesSection.tsx` (six AEO "what you'll learn" cards mapped to the districts; no glyph icons), `src/components/FAQSection.tsx` (12 AEO course FAQs: what AEO is, who it's for, what's free, how long, certificate, pricing, refunds — match `src/lib/pricing.ts`/`plans.ts` and the terms; keep its FAQPage JSON-LD), `src/components/Footer.tsx` and `.footer-egypt*` CSS
- Other pages: `src/app/about/page.tsx` + `AboutContent.tsx` (what Learn AEO is and how lessons are sourced; no team credentials, no bibliography of Egyptology), `src/app/contact/page.tsx` + `ContactContent.tsx`, `src/app/get-started/page.tsx` + `GetStartedContent.tsx`, `src/app/pricing/page.tsx`, `src/components/PppBanner.tsx`, `src/components/OfferBanner.tsx` (+ remove `.hieroglyph-font/.glyph-font` CSS), `src/components/FreeCourseCta.tsx`, `src/app/checkout/CheckoutContent.tsx`, `src/app/login/LoginContent.tsx`, `src/components/AuthCard.tsx`, `src/app/account/AccountContent.tsx`, `src/components/FeedbackButton.tsx`, `src/app/terms/TermsContent.tsx` (product name only — "Learn AEO"; do not change legal substance), `src/app/privacy/PrivacyContent.tsx`, `src/app/not-found.tsx`
- Test: `src/app/__tests__/page-copy.test.ts` (new)

- [ ] **Step 1: Failing test** `page-copy.test.ts`: render (or read the source of) each file above and assert it contains none of the Global Constraints' banned words or U+13000–U+1342F characters, and that layout metadata `description` mentions "answer engine". Run → FAIL.
- [ ] **Step 2:** Rewrite each file. Copy describes the real course: 8 districts (catalog titles), lesson 1 free with sign-in, lessons 2–3 live now and 4–8 coming soon (read status from `LESSON_CATALOG` where the page lists lessons, never hard-code "8 lessons available"), the certificate, prices from `src/lib/plans.ts`. No unsourced numbers.
- [ ] **Step 3: Walk the pages** once under dev bypass (one dev server, one browser): home, about, contact, get-started, pricing, login, 404, at 1440 and 390, dark and light. No horizontal scroll at 390, readable both themes, no console errors. Screenshots to the session scratchpad. Stop the server.
- [ ] **Step 4:** `npx tsc --noEmit && npm test && npm run build` → PASS. Commit `feat: Learn AEO copy on every page`.

---

### Task 7: Plan 2 polish items

**Files:**
- `src/lib/content/lesson-2-the-crawl-docks.ts`: the sentence saying a group "ends at the next user-agent line" must not seem to contradict stacking user-agent lines (e.g. "the next user-agent line that follows a rule"), checked against RFC 9309.
- `src/lib/lesson-types.ts` + all three lesson files + the source renderer: a source's `published` holds a last-updated date for documentation pages. Replace with `date: string` and `dateKind: "published" | "updated"`, rendered as "Published …" / "Updated …"; set each source's kind from what the live page shows.
- `src/lib/content/lesson-3-the-answer-quarter.ts`: name the access hatch in the exercise's original passage so the rewrite does not introduce a new part; add (or fold into an existing point of) the GOV.UK holiday example the mismatch between its JSON-LD `dateModified` and its page metadata, re-checked live — keep the example at 3–4 points.
- `src/components/player/questions/BlankQuestion.tsx` + `src/lib/lesson-types.ts`: optional `mono?: boolean` on blank questions renders the text in a monospace font; empty lines render at normal height (not `leading-[2.4]`). Set `mono: true` on lesson 2's robots.txt blank.
- `src/lib/theme.ts` (+ the inline head script and any reader): storage key `theme` → `` `${COOKIE_PREFIX}theme` ``.
- `src/components/player/LessonPlayer.tsx` (+ `src/lib/lesson-flow.ts` if the rule lives there): once the audit is passed, clear the saved step, so reopening a finished lesson starts at the intro.
- `LessonPlayer.tsx`: `lesson_step` and `lesson_audit_complete` events carry `lesson_id`. `src/lib/analytics.ts`: trim the `ExerciseKind` union and its comments to the kinds the AEO player sends (grep `trackExerciseAnswer`/`ExerciseKind` usage).
- `src/lib/questions.ts`: the match check uses `Object.hasOwn(r.pairs, p.term)`.
- Test: the content, catalog, live-source, lesson-flow, player-render, theme, analytics and questions tests — add a failing test first for each logic change (mono render, theme key, resume cleared after pass, event `lesson_id`, `hasOwn` with a `__proto__`/`toString` term).

- [ ] **Step 1:** Failing tests for the logic changes; run → FAIL.
- [ ] **Step 2:** Implement; re-check every changed factual sentence live (WebFetch).
- [ ] **Step 3:** `npx tsc --noEmit && npm test && CHECK_SOURCES=1 npx vitest run src/lib/__tests__/lesson-sources.live.test.ts && npm run build` → PASS. Commit `fix: Plan 2 polish (sources dates, mono blanks, theme key, resume, analytics)`.

---

### Task 8: Sweep and the site-wide ban test

**Files:**
- Create: `src/lib/__tests__/no-egypt.test.ts`
- Modify: everything the test finds — expected: test fixtures (`referrer.test.ts`, `new-user-landing.test.ts`, `checkout-return.test.ts`, `analytics.test.ts` clipping test, `leaderboard.test.ts`, `access-test.test.ts`, others), `prisma/schema.prisma` comments, `README.md` (status line: Plan 3 done), the `no-legacy-lessons.test.ts` item (3) (superseded — keep or fold into the new test), `src/app/__tests__/removed-routes.test.ts` word list (allow-listed)

**Interfaces:** none.

- [ ] **Step 1: Write the test.** Walk `src/`, `scripts/`, `prisma/`, `public/` (text files: `.txt .json .webmanifest .svg .xml`), `README.md`, `next.config.ts`, `vercel.json`, `package.json`. Fail on any banned word from the Global Constraints (word-bounded, case-insensitive; `scribe` must not match `describe`/`subscribe`; `dig` must not match `digital`) or any U+13000–U+1342F character. Also fail on any **filename** under `public/` containing a banned word. Allow-list, by exact path, only: this test, `lesson-content.test.ts`, `no-legacy-lessons.test.ts`, `removed-routes.test.ts`, `no-sibling-strings.test.ts` (their word lists), `src/lib/ppp.ts` and `src/lib/__tests__/ppp.test.ts` (Egypt as a country). Allow "inverted pyramid" (do not ban "pyramid"). Assert more than 100 files were walked. Run → FAIL with the list of hits.
- [ ] **Step 2:** Fix every hit (rewrite fixtures with AEO-flavoured strings; rewrite comments). Do not widen the allow-list to make it pass — if a hit is legitimate, explain it in the report.
- [ ] **Step 3: Final walk** (one dev server, one browser): dashboard (badges shelf with new art, level title), a lesson's outro, certificate page, leaderboard, blog, cookie banner, contact form, at 1440 dark and 390 light. Screenshots to the scratchpad. Stop the server.
- [ ] **Step 4:** `npx tsc --noEmit && npm test && npm run build` → PASS. Commit `test: site-wide ban on Egyptian references`.

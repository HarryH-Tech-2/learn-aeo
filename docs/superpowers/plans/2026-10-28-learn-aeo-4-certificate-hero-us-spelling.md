# Learn AEO — Plan 4: US Spelling, Verifiable Certificate, City of Answers Hero, Tools Section

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Switch every shipped word to US spelling, finish spec step 4 (certificate with issue date and a public verification URL) and spec step 5 (the Three.js City of Answers hero on the home page, a tools section, marketing-page fixes).

**Architecture:** A guard test bans British spellings across shipped files, the way `no-egypt.test.ts` bans Egypt. Certificates become a database row (`Certificate`: short public code, name, issue date) issued by `POST /api/certificate` once every catalog lesson is complete; `/verify/[code]` is a public page that confirms it. The hero prototype (`hero/index.html`, vanilla Three.js) is ported to a TypeScript module that a client component loads with a dynamic `import()` after first paint, drawn behind server-rendered copy so the headline and CTA never wait on WebGL. Tools get a typed catalog (`src/lib/tools.ts`) like `LESSON_CATALOG`, all `coming-soon` until Plan 6 builds them.

**Tech Stack:** Next 15 app router, React 19, TypeScript, Prisma 6 (Postgres), `three@0.185` (already a dependency; use `three/examples/jsm/...` imports), Tailwind v4, `sharp`, vitest (node environment, `renderToStaticMarkup`; no testing-library).

**Spec:** `docs/superpowers/specs/2026-10-26-learn-aeo-design.md` ("Gamification" — certificate; "Free tools"; "Pages"; "Delivery phases" 4–5; "Hero").

**Previous plans:** 1 (done) · 2 (done) · 3 `docs/superpowers/plans/2026-10-27-learn-aeo-3-no-egypt.md` (done, `6804b4a..54158a6`).

**Next plans (written when this one is done):** 5 SEO/AEO plumbing (spec step 6) · 6 AI Crawler Checker + llms.txt Generator, tools hub, glossary, blog posts (step 7) · 7 deploy-readiness checklist (step 8, launch).

**Harry's decisions (2026-10-28):**
- **US spelling everywhere on the site** (overrides the spec's British English and Plan 3's copy rule).
- **The lesson-complete offer stays at 24 h** (overrides the spec's 60 h). No code change; amend the spec.
- Do steps 4–8 in order.

## Global Constraints

- **US spelling** in every shipped file: optimization, program, behavior, color, center, organization, prioritize, summarize, recognize, personalize, authorize, analyze, license (noun too), catalog, canceled/canceling, traveled, enroll/enrollment, fulfill, gray, favor, honor, practice (verb too), neighbor. Exceptions only: text quoted verbatim from a source (e.g. GOV.UK's "Apply for a driving licence" in lesson 3) and proper names. `docs/**` is out of scope except the spec amendment in Task 1.
- **No Egypt anywhere** (Plan 3's list; `src/lib/__tests__/no-egypt.test.ts` must stay green).
- **No made-up statistics or claims.** Every number or factual claim about engines/crawlers comes from a named, linkable source checked live, or is cut. No testimonials, learner counts or ratings.
- **No author**: no bio, byline or Person schema. Attribute to "Learn AEO" (`SITE`).
- Audience: marketers who know SEO basics. Second person, plain, concrete. City of Answers theme.
- Brand: navy `#04060d`, cyan `#6fe3ff`, gold `#ffc76b`; tokens `bg-ink`, `bg-obsidian-light`, `text-sand-100…500`, `text-cyan`, `text-gold`, `font-display` (Instrument Serif), `font-sans` (Inter). Both themes readable; the hero is dark in both.
- Replaced images get **new filenames**; generated images come from a committed script under `scripts/dev/`.
- Browser storage keys start with `COOKIE_PREFIX` (`"aeo_"`).
- Work on `main` in `C:\dev\learn-aeo`; never push; never commit `.env.local`.
- Machine memory is tight: at most one `next dev` server and one headless browser at a time; never run `npm run build` while a dev server is up.
- Every task ends green: `npx tsc --noEmit` and `npm test`; tasks touching pages also `npm run build`.

## Review Focus

1. **Certificate issued too early or forged** — a learner with any catalog lesson incomplete (including coming-soon lessons) gets 403 from `POST /api/certificate`; the client cannot set the date or code. Test in Task 2.
2. **Re-issuing** — a second call returns the same code and `issuedAt`; a changed account name updates the printed name but never the date or code. Test in Task 2.
3. **Verification lookups** — an unknown, malformed or over-long code on `/verify/[code]` is a 404 (no crash, no DB query for malformed input); the page is `noindex` and shows only first name + last initial, course, date. Test in Task 2.
4. **Hero without WebGL or with reduced motion** — the headline, subline and CTA are in the server HTML and usable with no JS, no WebGL, or `prefers-reduced-motion: reduce` (a still final frame, no flight); the scene never blocks first paint and stops its render loop when off-screen, when the tab is hidden, and on unmount. Test in Task 3 (`heroMode` + server render) and the Task 5 walk.
5. **Renamed slug and query value** — lesson 8's id becomes `running-an-aeo-program` and the checkout cancel return becomes `checkout=canceled`; nothing still emits or expects the old values (badge criteria, catalog tests, `PricingSection`'s notice). Test in Task 1.

---

### Task 1: US spelling everywhere, with a guard test

**Files:**
- Create: `src/lib/__tests__/us-spelling.test.ts`
- Modify: every file the test flags. Known hits: `src/lib/lesson-catalog.ts` (lesson 8 id `running-an-aeo-programme` → `running-an-aeo-program`, title "Running an AEO program", "practise" in lesson 3's description), `src/lib/gamification.ts` (badge criterion `complete:running-an-aeo-program`), `src/lib/checkout-return.ts` + `src/components/PricingSection.tsx` (`checkout=cancelled` → `checkout=canceled`), `src/components/home/HomePage.tsx` (Course JSON-LD), `src/components/HeroSection.tsx`, `src/components/FAQSection.tsx`, `src/app/terms/TermsContent.tsx` ("licence" → "license", "cancelled" → "canceled"; no change to legal substance), `src/lib/certificate.ts` (`nameColour` → `nameColor`, comments), `scripts/dev/build-badges.mjs` (certificate reads "Answer Engine Optimization"; rebuild `public/certificate-aeo.webp` → new filename `public/certificate-aeo-us.webp` and update `CERTIFICATE.src`), the three lesson content files, emails (`email.ts`, `nurture-emails.ts`), identifiers (`summariseAccessTest`, `summariseCheckoutLog`, `enrolInNurture`, `fulfilCheckout`, `recentReminder`… — rename them and their call sites/tests), comments.
- Modify: `docs/superpowers/specs/2026-10-26-learn-aeo-design.md` — under "Pricing", note "Lesson-complete offer: 24 h (Harry, 2026-10-28; supersedes 60 h)"; add "Site copy uses US spelling (Harry, 2026-10-28)".
- Test: `src/lib/__tests__/lesson-catalog.test.ts`, `gamification.test.ts`, `checkout-return.test.ts`, and any test whose fixture strings change.

**Interfaces:**
- Produces: lesson id `running-an-aeo-program`; cancel-return query `checkout=canceled`; `CERTIFICATE.nameColor`, `CERTIFICATE.src = "/certificate-aeo-us.webp"`.

- [ ] **Step 1: Write the guard test.** Walk the same roots and text extensions as `no-egypt.test.ts` (reuse its walker if it exports one; otherwise copy the walk). Fail on any match of this case-insensitive pattern, matched inside identifiers too (so `summariseX` is caught):

```ts
const BRITISH = /optimis|organis|prioritis|summaris|recognis|personalis|customis|authoris|apologis|categoris|minimis|maximis|standardis|utilis|visualis|realis(e|ed|es|ing|ation)|analys(e|ed|es|ing)\b|programme|behaviour|colour|favour|honour|labour|neighbour|centre|centred|licence|catalogue|cancell|travell|enrol(?!l)|fulfil(?!l)|judgement|\bgrey\b|whilst|amongst|learnt|defence|practis/i;
```

  Allow by exact phrase (strip it from the text before matching), not by file: `driving licence` (GOV.UK quote). Allow-list by path only this test file. Assert > 100 files walked. Also assert `LESSON_CATALOG` has no id containing `programme` and `cancelReturnUrl(...)` (whatever `checkout-return.ts` exports for the cancel URL) contains `checkout=canceled`. Run `npx vitest run src/lib/__tests__/us-spelling.test.ts` → FAIL with the hit list.
- [ ] **Step 2: Fix every hit.** Rewrite copy, comments and identifiers. Do not touch text inside a source quotation — add its exact phrase to the allow-list and say so in the report. Rebuild the certificate art with `node scripts/dev/build-badges.mjs` (after changing its output filename), delete `public/certificate-aeo.webp`, view the new image (Read it).
- [ ] **Step 3: Amend the spec** as listed above.
- [ ] **Step 4:** `npx tsc --noEmit && npm test && npm run build` → PASS. Commit `chore: US spelling across the site`.

---

### Task 2: Verifiable certificate (issue date and verification URL)

**Files:**
- Modify: `prisma/schema.prisma` (add `Certificate`, back-relation on `User`), `src/lib/certificate.ts` (layout fractions for date and URL), `src/app/certificate/CertificateContent.tsx` (call the API, draw date + URL, show the link), `scripts/dev/build-badges.mjs` (replace the fixed "LEARNAEO.COM" footer with blank space for the runtime date/URL lines; rebuild under a new filename `public/certificate-aeo-v2.webp`, delete the Task 1 file)
- Create: `prisma/migrations/20261028000000_certificates/migration.sql` (generate as Plan 3 Task 4 did: `prisma migrate diff --from-schema-datamodel <old> --to-schema-datamodel prisma/schema.prisma --script`), `src/lib/certificate-issue.ts`, `src/app/api/certificate/route.ts`, `src/app/verify/[code]/page.tsx`
- Test: `src/lib/__tests__/certificate-issue.test.ts`, `src/app/api/certificate/__tests__/route.test.ts`, `src/app/verify/__tests__/verify-page.test.ts`

**Interfaces:**
- Schema: `model Certificate { id String @id @default(cuid()); code String @unique; userId String @unique; name String; issuedAt DateTime @default(now()); updatedAt DateTime @updatedAt; user User @relation(fields: [userId], references: [id], onDelete: Cascade) }`.
- `src/lib/certificate-issue.ts`:
  - `CERT_CODE_PATTERN = /^[A-HJ-NP-Z2-9]{10}$/` (Crockford-ish, no I/O/0/1).
  - `newCertificateCode(random?: (n: number) => Uint8Array): string` — 10 chars from that alphabet via `crypto.getRandomValues` by default.
  - `isCertificateCode(s: string): boolean`.
  - `allLessonsComplete(progress: { lessonId: string; completed: boolean }[]): boolean` — true only if every `LESSON_CATALOG` id has a completed row.
  - `verifyUrl(code: string): string` → `absoluteUrl(\`/verify/${code}\`)`.
  - `displayName(name: string): string` — "Jane Q Smith" → "Jane S."; one word → that word; empty → "Learner".
  - `formatIssued(d: Date): string` — "October 28, 2026", formatted in UTC (`en-US`, `timeZone: "UTC"`) so the page, canvas and tests agree.
- `POST /api/certificate` (no body) → `{ code: string; name: string; issuedAt: string (ISO); url: string }`. 401 signed out; 403 if `!allLessonsComplete`; name = `user.name?.trim() || "Learner"`, max 60 chars. Upsert by `userId`: create with a new code (retry once on a `code` unique clash); on an existing row update `name` only.
- `/verify/[code]`: server page, `metadata.robots = { index: false, follow: false }`; invalid pattern or no row → `notFound()`; otherwise shows "Verified", `displayName(name)`, "Answer Engine Optimization — Learn AEO", "Issued <Month D, YYYY>", and a link to `/`. Not under `/certificate` (middleware protects that prefix).
- `CERTIFICATE` gains `dateY`, `urlY`, `metaSize`, `metaColor`; the canvas draws `Issued <Month D, YYYY>` and `Verify: <host>/verify/<code>` centered on those lines.

- [ ] **Step 1: Failing tests.** `certificate-issue.test.ts`: a code from `newCertificateCode()` matches `CERT_CODE_PATTERN`; a fixed `random` gives a fixed code; `isCertificateCode("abc")`, `"ABCDEFGHI0"`, an 11-char string → false; `allLessonsComplete` false when one catalog lesson (including a coming-soon one) is missing or incomplete, true when all complete; `verifyUrl("ABCDEFGH23")` ends `/verify/ABCDEFGH23`; `displayName` cases above. Route test (prisma mocked like the xp route test): signed out → 401; 7 of 8 complete → 403 and no upsert; all complete, no row → 200 with a valid code; second call → same code and `issuedAt`; name changed → response has the new name, same code and date. Verify-page test: `"bad"` and an unknown valid code call `notFound` (mock `next/navigation`), and the malformed one makes no prisma call; a found row renders "Jane S." and "Issued October 28, 2026" and never the full surname; exported `metadata.robots.index === false`. Run → FAIL.
- [ ] **Step 2:** Schema, migration, `npx prisma generate`, `certificate-issue.ts`, route, verify page.
- [ ] **Step 3: Certificate page.** When all lessons are complete, `CertificateContent` calls `POST /api/certificate` (via `fetchJson`) after the name is saved (and again after a name save), draws the date and URL lines, and shows the verification link under the image with a copy button. Add a "Add to LinkedIn" link: `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=Answer%20Engine%20Optimization&organizationName=Learn%20AEO&issueYear=<y>&issueMonth=<m>&certUrl=<encoded verify url>&certId=<code>`. Rebuild the art; view it (Read the image) with a sample date/URL drawn in the scratchpad to check spacing.
- [ ] **Step 4:** `npx tsc --noEmit && npm test && npm run build` → PASS. Commit `feat: verifiable certificate with issue date`.

---

### Task 3: City of Answers 3D hero

**Files:**
- Create: `src/components/home/city-scene.ts` (the port of `hero/index.html`'s module script), `src/components/home/CityHero.tsx` (client: canvas, mounts the scene), `src/components/home/hero-mode.ts`
- Modify: `src/components/HeroSection.tsx` (copy over the canvas), `src/styles/globals.css` (vignette/flash/copy styles from the prototype, as classes prefixed `city-hero-`), `src/components/home/HomePage.tsx` comment
- Delete: `hero/index.html` once ported (it lives in git history)
- Test: `src/components/home/__tests__/hero-mode.test.ts`, `src/components/__tests__/hero-section.test.tsx`

**Interfaces:**
- `heroMode(env: { webgl: boolean; reducedMotion: boolean; saveData: boolean }): "animate" | "still" | "none"` — no WebGL → `"none"`; reduced motion or Save-Data → `"still"`; else `"animate"`.
- `startCityScene(canvas: HTMLCanvasElement, opts: { mode: "animate" | "still"; onReveal: () => void }): { replay(): void; setActive(active: boolean): void; dispose(): void }` — `"still"` renders the final orbit frame once (and on resize) and calls `onReveal` immediately. `setActive(false)` stops the `requestAnimationFrame` loop; `dispose()` cancels it, removes listeners, and disposes geometries, materials, textures, the composer and the renderer. Pixel ratio capped at `Math.min(devicePixelRatio, 1.75)`. Imports from `three` and `three/examples/jsm/postprocessing/{EffectComposer,RenderPass,UnrealBloomPass,OutputPass}.js`.
- `CityHero` loads the scene with `import("./city-scene")` inside `useEffect` (so `three` is not in the first-load JS of `/`), uses an `IntersectionObserver` and `visibilitychange` to call `setActive`, and renders a "Replay intro" button only in `"animate"` mode.

- [ ] **Step 1: Failing tests.** `hero-mode.test.ts`: the three rules above, including `webgl: false, reducedMotion: true` → `"none"`. `hero-section.test.tsx`: `renderToStaticMarkup(<HeroSection />)` (mock `next-auth/react` `useSession` and `useAuthModal` as other component tests do) contains an `<h1>` with "answer engine optimization", the subline, the free-lesson CTA, and the note built from `LESSON_CATALOG[0].minutes` (e.g. "Free · 25 minutes · no card needed"); it contains no `opacity-0` class on the h1 or CTA wrapper. Run → FAIL.
- [ ] **Step 2: Port the scene.** Translate the prototype's script to TypeScript in `city-scene.ts` without changing the look: same scene beats (search bar types the query → doors open → fly-through → orbit of the gold cited source), same palette, bloom values and timings. Replace the `#copy`/`#flash` DOM lookups with the `onReveal` callback and a flash element the component passes in (or drop the flash in `"still"`). Fonts: wait on `document.fonts.ready` before drawing the search-bar texture, as the prototype does.
- [ ] **Step 3: Wire the hero.** `HeroSection` keeps its server-rendered copy (eyebrow "A course for marketers who know SEO", h1 "Learn answer engine <em>optimization</em>", the existing subline, the existing CTA logic, the note line) layered over `<CityHero />` with the prototype's vignette. Copy is visible at first paint; in `"animate"` mode it may gain a CSS entrance only after `onReveal`, never starting hidden in server HTML. `"none"` keeps today's gradient background. Height: `min-h-[100svh]` with the prototype's `min-height: 560px`.
- [ ] **Step 4: Check it in a browser** (one dev server, one browser, dev bypass): home at 1440 and 390, dark and light; with DevTools reduced-motion emulation; scroll the hero off-screen and confirm CPU drops (Performance panel or a `requestAnimationFrame` counter logged in dev only). No console errors. Confirm in the build output that `/` first-load JS did not grow by the size of `three` (compare with the number before the change). Screenshots to the scratchpad. Stop the server.
- [ ] **Step 5:** `npx tsc --noEmit && npm test && npm run build` → PASS. Commit `feat: City of Answers 3D hero`.

---

### Task 4: Tools catalog, home tools section, marketing fixes

**Files:**
- Create: `src/lib/tools.ts`, `src/components/ToolsSection.tsx`
- Modify: `src/components/home/HomePage.tsx` (order: Hero, Features, LessonsPreview, ToolsSection, Pricing, FAQ, Contact, Footer), `src/app/pricing/page.tsx` (add an h1), `src/app/api/newsletter/route.ts` (welcome email gets an unsubscribe link via `leadUnsubscribeUrl(email, site)`), `src/lib/nurture-emails.ts` (offer-expires line reads "Quick one: your code ends …" when there is no first name)
- Test: `src/lib/__tests__/tools.test.ts`, `src/components/__tests__/tools-section.test.tsx`, `src/app/__tests__/page-copy.test.ts` (add `ToolsSection.tsx`), the newsletter route test (create `src/app/api/newsletter/__tests__/route.test.ts` if none), `nurture-emails.test.ts`

**Interfaces:**
- `src/lib/tools.ts` (edge-safe, no imports beyond types):
  ```ts
  export type ToolMeta = { slug: string; name: string; summary: string; kind: "server" | "client"; status: "live" | "coming-soon" };
  export const TOOLS: readonly ToolMeta[];
  export function toolPath(slug: string): string; // `/tools/${slug}`
  ```
  Entries, in order (spec "Free tools"): `ai-crawler-checker` "AI Crawler Checker" (server), `llms-txt-generator` "llms.txt Generator" (client), `schema-generator` "Schema Generator" (client), `citability-checker` "Citability Checker" (server); all `coming-soon` now. Summaries: one sentence each, describing what the spec says the tool does.
- `ToolsSection`: heading about free AEO tools; a card per tool; a `live` tool's card links to `toolPath(slug)`, a `coming-soon` card is not a link and shows a "Coming soon" label. Plan 6 flips statuses.

- [ ] **Step 1: Failing tests.** `tools.test.ts`: four tools, unique slugs matching `/^[a-z0-9-]+$/`, the slugs above in order, `toolPath("ai-crawler-checker") === "/tools/ai-crawler-checker"`. `tools-section.test.tsx`: with all coming-soon, the markup has four tool names, "Coming soon" four times and no `href="/tools/`; with one tool mocked `live`, exactly that card links. Pricing page: its rendered markup (or source) has exactly one `<h1`. Newsletter welcome HTML contains the lead unsubscribe URL. Offer-expires with `firstName` empty renders "Quick one: your code ends" and never "there:". Run → FAIL.
- [ ] **Step 2:** Implement. Pricing h1: "Learn AEO pricing" style wording that names the course; demote nothing else unless two h1s result.
- [ ] **Step 3:** `npx tsc --noEmit && npm test && npm run build` → PASS. Commit `feat: tools section on home and marketing fixes`.

---

### Task 5: Walk and wrap-up

**Files:**
- Modify: `README.md` (status: Plan 4 done), anything the walk finds

- [ ] **Step 1: Walk** (one dev server, one browser, dev bypass with a DB if available): home (hero animate, reduced-motion still, tools section), pricing, about, contact, certificate page (seed a user with all lessons complete if a DB is available; otherwise render the canvas output with a stub and note it), `/verify/<code>` and `/verify/bad`, at 1440 dark and 390 light. No horizontal scroll at 390, no console errors. Screenshots to the scratchpad. Stop the server.
- [ ] **Step 2:** `npx tsc --noEmit && npm test && npm run build` → PASS. Commit `docs: Plan 4 status`.

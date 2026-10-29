# Learn AEO — Plan 7: Deploy Readiness (Launch Milestone) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Spec step 8. Make the codebase safe to deploy to www.learnaeo.com: fix the last public-surface bugs, make a misconfigured production build impossible, give Harry read-only scripts that prove Stripe and the live site are set up right, and write the runbook for the external steps only Harry can do.

**Architecture:** Checks are pure functions in `scripts/lib/*.mjs` (plain JS so both `node` scripts and vitest import them), fed by thin CLI scripts that fetch data (Stripe API, live HTTP) and exit 1 on any problem. `next.config.ts` runs the env check during Vercel production builds, so a missing secret fails the deploy instead of the first customer. `docs/DEPLOY.md` is the ordered runbook that ties the scripts to Harry's dashboard steps.

**Tech Stack:** Next 15, TypeScript, Node 20 (`fetch`, `--env-file`), `stripe` SDK (already a dependency), vitest. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-10-26-learn-aeo-design.md` ("External setup Harry must do", "Delivery phases" step 8, "Pricing", "SEO / AEO groundwork", "Email").

**Progress (paused 2026-10-28):** Tasks 1–5 done and pushed (`63a2dd7..b147620`). **Resume here:** (1) re-run the final whole-branch review (review package `63a2dd7..HEAD`, fresh reviewer on the most capable model, the Review Focus above, the ledger's rulings), then one fix pass for Critical/Important findings, each test-first; (2) Task 6 once Harry provides a dev Postgres URL and Stripe **test** keys (DEPLOY.md steps 9–10); (3) Harry's launch steps in `docs/DEPLOY.md`. The review was started and stopped before it reported, so nothing from it is known yet.

**Previous plans:** 1–5 done · 6 `docs/superpowers/plans/2026-10-28-learn-aeo-6-tools-glossary-blog.md` (done, `0b8b5ba..5555928`).

## Global Constraints

- Claude never touches live accounts, DNS, Vercel or live Stripe keys. Scripts that talk to Stripe are read-only except the existing create scripts, and refuse a live key without `--live` (`scripts/lib/stripe-key.mjs`).
- Stripe account is Learn AEO's own (spec): statement descriptor `LEARNAEO`; Lifetime $100 / £80 one-time, Monthly $10 / £8; PPP coupons `AEO_PPP_B/C/D` at 30/50/65% `forever`; completion offer `NEXT-DISTRICT-33`, 33% `once`, **Lifetime only**, valid **24 hours** (amended spec).
- Canonical host is `https://www.learnaeo.com` (`SITE.url`); `learnaeo.com` 301s to www (`vercel.json`).
- Nurture email stays off (`NURTURE_ENABLED` empty) at launch (spec: "Nurture off by default until Harry enables it").
- US spelling (`us-spelling.test.ts`), no Egypt (`no-egypt.test.ts`).
- Work on `main`; never push; one server at a time on port 3100 (3000 is taken on this machine); never build with a server up. Every task ends with `npx tsc --noEmit`, `npm test`, and `npm run build` when pages change.
- Not in this plan (deferred, logged in memory): WebGL context leak per home visit, cert font fallback, `/verify` name lag after rename, displayName surrogate split, hero CTA needing JS, 'Copied' reset, Plan 6 minors (host:port message, redirect count, x-forwarded-for, IPv6 extras), courseWorkload vs syllabus, per-lesson og:image:alt.

## Review Focus

1. **A production deploy with a missing or test-mode secret** (no `STRIPE_WEBHOOK_SECRET`, an `sk_test_` key, `AEO_DEV_BYPASS_AUTH=1`, `NEXTAUTH_URL` on the wrong host) must fail the Vercel build with a list of what is wrong, and must not fail preview or local builds. Test in Task 2.
2. **The completion offer used on Monthly**: `NEXT-DISTRICT-33` must be limited to the Lifetime product in Stripe itself, not only in site code; an existing unrestricted coupon is reported, never silently deleted. Test in Task 3.
3. **A Stripe webhook endpoint missing one of the events the route handles** (the 9 in `src/app/api/webhooks/stripe/route.ts`) is reported by name. Test in Task 3.
4. **Lowercase or mistyped certificate codes** from a printed certificate: `/verify/abcd-…` redirects to the uppercase code instead of 404. Test in Task 1.
5. **Live site served wrong**: apex not redirecting, `X-Robots-Tag: noindex` or a missing security header on a public page, an unsigned webhook POST not rejected. Test in Task 4 (pure checks on fixture responses).

---

### Task 1: Public-surface fixes

**Files:** Modify `src/app/blog/[slug]/page.tsx`, `src/app/lessons/[id]/opengraph-image.tsx`, `src/app/not-found.tsx`, `src/app/verify/[code]/page.tsx`, `src/app/certificate/CertificateContent.tsx`, `src/lib/llms-txt.ts`. Tests: `src/app/blog/__tests__/blog-post-page.test.tsx`, `src/app/__tests__/page-metadata.test.ts`, `src/app/__tests__/verify-page.test.tsx` (create), `src/lib/__tests__/llms-txt.test.ts`.

**Interfaces:** Produces nothing later tasks consume.

- [ ] **Step 1: Failing tests**
  - `blog-post-page.test.tsx`: `import { dynamicParams } from "@/app/blog/[slug]/page"; expect(dynamicParams).toBe(false)`; and `generateMetadata` for an unknown slug returns a title that does not contain "Learn AEO" (the layout template adds it once).
  - `page-metadata.test.ts`: `import("@/app/not-found")` exports `metadata` with `robots.index === false`, title `"Page not found"`, and `openGraph` undefined or without `images` (so it does not inherit the home card).
  - `opengraph-image`: `import { dynamicParams } from "@/app/lessons/[id]/opengraph-image"; expect(dynamicParams).toBe(false)`.
  - `verify-page.test.tsx` (mock `next/navigation` `redirect` and `notFound` to throw tagged errors, mock `@/lib/db`): a valid code in lowercase throws `REDIRECT:/verify/<UPPER>`; a malformed code throws `NEXT_NOT_FOUND` without a DB call.
  - `llms-txt.test.ts`: a lesson with `isFree: false` or `status: "coming-soon"` appears as plain text `- <title> (paid lesson; see https://www.learnaeo.com/pricing)` / `(coming soon)` with no `](…/lessons/<id>)` link; free live lessons keep their link.
- [ ] **Step 2: Run** `npx vitest run src/app/blog src/app/__tests__ src/lib/__tests__/llms-txt.test.ts` → the new cases FAIL.
- [ ] **Step 3: Implement**
  - Blog `[slug]`: `export const dynamicParams = false;` and the not-found metadata title `"Post not found"`.
  - Lesson OG image: `export const dynamicParams = false;` (remove the `?? LESSON_CATALOG[0]` fallback's need; keep it as a type guard).
  - `not-found.tsx`: `export const metadata: Metadata = { title: "Page not found", robots: { index: false, follow: true }, openGraph: null }` — whichever shape Next 15 accepts to drop the inherited image; the test pins the effect.
  - `/verify/[code]`: `const upper = code.toUpperCase(); if (!isCertificateCode(upper)) notFound(); if (upper !== code) redirect(\`/verify/${upper}\`);` before the DB lookup.
  - `CertificateContent.tsx`: when `POST /api/certificate` fails, show `role="alert"` text "We couldn't issue your certificate just now. Try again in a minute." with a Retry button that re-runs the POST, instead of `setCert(null)` silently.
  - `llms-txt.ts`: link only lessons a signed-out visitor can open (`isFree && status === "live"`), matching the sitemap rule in `src/app/sitemap.ts:107`.
- [ ] **Step 4: Run** the same command → PASS; then `npx tsc --noEmit`, `npm test`, `npm run build`.
- [ ] **Step 5: Commit** `fix: launch polish — 404 metadata, static-only params, verify code case, cert error, llms.txt lesson links`.

---

### Task 2: Production env check that fails the deploy

**Files:** Create `scripts/lib/env-check.mjs`, `scripts/check-env.mjs`, `src/lib/__tests__/env-check.test.ts`. Modify `next.config.ts`, `.env.example` (header line pointing at the check).

**Interfaces:**
- Produces: `checkProductionEnv(env: Record<string, string | undefined>, siteUrl: string): { missing: string[]; problems: string[] }` and `REQUIRED_PRODUCTION_ENV: string[]` from `scripts/lib/env-check.mjs`.

- [ ] **Step 1: Failing tests** (`env-check.test.ts`, `const SITE = "https://www.learnaeo.com"`, a `full` fixture with every required var valid):
  - `checkProductionEnv(full, SITE)` → `{ missing: [], problems: [] }`.
  - `REQUIRED_PRODUCTION_ENV` equals exactly: `NEXTAUTH_URL, NEXTAUTH_SECRET, DATABASE_URL, POSTGRES_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_PRICE_ID, STRIPE_PRICE_MONTHLY, RESEND_API_KEY, RESEND_FROM_EMAIL, RESEND_AUDIENCE_ID, CRON_SECRET, ADMIN_EMAILS, NEXT_PUBLIC_GA_ID`.
  - Deleting `STRIPE_WEBHOOK_SECRET` → `missing: ["STRIPE_WEBHOOK_SECRET"]`; a whitespace-only value counts as missing.
  - `problems` (one string each, naming the var): `STRIPE_SECRET_KEY` not starting `sk_live_`; `STRIPE_WEBHOOK_SECRET` not starting `whsec_`; `STRIPE_PRICE_ID`/`STRIPE_PRICE_MONTHLY` not starting `price_`; `NEXTAUTH_URL` ≠ `SITE`; `NEXT_PUBLIC_SITE_URL` set and ≠ `SITE`; `AEO_DEV_BYPASS_AUTH` non-empty; `NEXTAUTH_SECRET` shorter than 32 chars; `NEXT_PUBLIC_GA_ID` not `/^G-[A-Z0-9]+$/`; `RESEND_FROM_EMAIL` not ending `@learnaeo.com` (bare or `Name <x@learnaeo.com>`); `NURTURE_ENABLED === "true"` (launch rule).
- [ ] **Step 2: Run** `npx vitest run src/lib/__tests__/env-check.test.ts` → FAIL (module missing).
- [ ] **Step 3: Implement** `scripts/lib/env-check.mjs` (plain JS, JSDoc types). `scripts/check-env.mjs`: reads `process.env`, prints each missing var and problem, exits 1 if any; usage `node --env-file=<file> scripts/check-env.mjs`. `next.config.ts`: when `process.env.VERCEL_ENV === "production"`, `await import` the check and `throw new Error(<the list>)` if anything is wrong; never runs for preview or local builds.
- [ ] **Step 4: Run** the test → PASS; `VERCEL_ENV=production npm run build` with the local `.env.local` → build FAILS listing problems (expected: local env is not production); plain `npm run build` → passes. Then `npx tsc --noEmit`, `npm test`.
- [ ] **Step 5: Commit** `feat: production env check fails a misconfigured deploy`.

---

### Task 3: Stripe launch check

**Files:** Create `scripts/lib/stripe-launch-check.mjs`, `scripts/stripe-check-launch.mjs`, `src/lib/__tests__/stripe-launch-check.test.ts`. Modify `scripts/stripe-create-ppp-coupons.mjs`.

**Interfaces:**
- Consumes: `stripeFromEnv()` from `scripts/lib/stripe-key.mjs`; the event list from `src/app/api/webhooks/stripe/route.ts`.
- Produces: `WEBHOOK_EVENTS: string[]` and `checkStripeLaunch(snapshot): string[]` (problems; empty means ready), where `snapshot = { descriptor: string | null; lifetimeProductId: string | null; coupons: { id: string; percent_off: number | null; duration: string; applies_to?: { products: string[] } }[]; webhooks: { url: string; status: string; enabled_events: string[] }[]; siteUrl: string }`.

- [ ] **Step 1: Failing tests** (`stripe-launch-check.test.ts`, a `ready` snapshot fixture):
  - `WEBHOOK_EVENTS` equals the 9 events the route switches on: `checkout.session.completed, checkout.session.async_payment_succeeded, checkout.session.async_payment_failed, checkout.session.expired, customer.subscription.updated, customer.subscription.deleted, charge.refunded, charge.dispute.created, charge.dispute.closed`; and a test reads `route.ts` as text and asserts every `case "<event>"` in it is in `WEBHOOK_EVENTS` (so the list can't drift).
  - `checkStripeLaunch(ready)` → `[]`.
  - Descriptor `"LEARN AEO"` → a problem mentioning `LEARNAEO`.
  - `NEXT-DISTRICT-33` without `applies_to`, or applied to another product → a problem saying it must be limited to the Lifetime product.
  - A coupon missing, or with the wrong percent/duration (`AEO_PPP_C` at 40) → a problem naming it.
  - No webhook whose `url` is `${siteUrl}/api/webhooks/stripe`, or one `disabled`, or one missing `charge.refunded` → a problem naming the missing event; `enabled_events: ["*"]` passes.
- [ ] **Step 2: Run** `npx vitest run src/lib/__tests__/stripe-launch-check.test.ts` → FAIL.
- [ ] **Step 3: Implement** the pure check; `scripts/stripe-check-launch.mjs` builds the snapshot (`stripe.accounts.retrieve()` → `settings.payments.statement_descriptor`; Lifetime product via `products.search` on `metadata['plan']:'lifetime'`; `coupons.retrieve` per id with `expand: ["applies_to"]`; `webhookEndpoints.list`), prints problems, exits 1 if any; then runs `scripts/stripe-audit-prices.mjs` logic by spawning it so prices are checked too. `stripe-create-ppp-coupons.mjs`: create `NEXT-DISTRICT-33` with `applies_to: { products: [lifetimeProductId] }` (fail with a message if the Lifetime product doesn't exist yet: "run stripe-create-plans first"); for an existing unrestricted one, print `MISMATCH: not limited to Lifetime — delete it in the dashboard and re-run` (Stripe can't edit `applies_to`; the script never deletes).
- [ ] **Step 4: Run** the test → PASS; `npx tsc --noEmit`, `npm test`. If Harry has given a test key: `node --env-file=.env.local scripts/stripe-check-launch.mjs` and record the output in the ledger.
- [ ] **Step 5: Commit** `feat: Stripe launch check; completion offer limited to Lifetime in Stripe`.

---

### Task 4: Live-site smoke and stricter SEO check

**Files:** Create `scripts/lib/smoke-checks.mjs`, `scripts/smoke-prod.mjs`, `src/lib/__tests__/smoke-checks.test.ts`. Modify `scripts/dev/check-seo.mjs`.

**Interfaces:**
- Produces: pure checks, each `(response-like) => string[]` problems, where `response-like = { status: number; headers: Record<string, string>; body?: string; location?: string }`: `checkApexRedirect(r, siteUrl)`, `checkSecurityHeaders(r)`, `checkIndexable(r)`, `checkRobotsTxt(body)`, `checkLlmsTxt(r)`, `checkUnsignedWebhook(r)`, and `checkHeadTags(html, path)` (used by check-seo).

- [ ] **Step 1: Failing tests** (`smoke-checks.test.ts`, fixture responses):
  - Apex: 301/308 with `location` starting `https://www.learnaeo.com/` → `[]`; 200 → problem.
  - Security headers: the four from `vercel.json` (`x-content-type-options: nosniff`, `x-frame-options: SAMEORIGIN`, `referrer-policy`, `permissions-policy`) present → `[]`; each missing one named.
  - Indexable: `x-robots-tag: noindex` → problem; absent → `[]`.
  - robots.txt: names `OAI-SearchBot`, `PerplexityBot`, `ClaudeBot` and has `Sitemap: https://www.learnaeo.com/sitemap.xml`; `User-agent: *` + `Disallow: /` → problem.
  - llms.txt: 200, `content-type` starting `text/plain`, body starting `# Learn AEO`.
  - Unsigned webhook POST → 400 is `[]`; 200 or 500 → problem.
  - `checkHeadTags`: missing `twitter:card`, `twitter:title` or `twitter:image`, or a meta description outside 70–160 chars → named problems.
- [ ] **Step 2: Run** `npx vitest run src/lib/__tests__/smoke-checks.test.ts` → FAIL.
- [ ] **Step 3: Implement** the checks; `scripts/smoke-prod.mjs [base]` (default `SITE` URL) fetches with `redirect: "manual"` where a check needs it, runs every check, then spawns `check-seo.mjs` against the same base; exits 1 on any problem. `check-seo.mjs` calls `checkHeadTags` and `checkIndexable` per sitemap URL.
- [ ] **Step 4: Run** the test → PASS; `npm run build`, then `node node_modules/next/dist/bin/next start -p 3100` and `node scripts/smoke-prod.mjs http://localhost:3100` → every check passes except apex (skipped when base is not `https://www.learnaeo.com`; the script says so). Stop the server. `npx tsc --noEmit`, `npm test`.
- [ ] **Step 5: Commit** `feat: post-deploy smoke script; check-seo checks Twitter tags, X-Robots-Tag and description length`.

---

### Task 5: Deploy runbook

**Files:** Create `docs/DEPLOY.md`. Modify `README.md` (link it; status line), `docs/superpowers/plans/2026-10-28-learn-aeo-7-deploy-readiness.md` (progress note).

- [ ] **Step 1: Write `docs/DEPLOY.md`** as numbered steps, each with the exact command or dashboard path and how to tell it worked:
  1. Accounts: Vercel project from the GitHub repo; DNS for `learnaeo.com` + `www`; Postgres (Neon/Vercel) → `POSTGRES_URL` (pooled), `DATABASE_URL` (direct).
  2. Google OAuth client: authorized redirect `https://www.learnaeo.com/api/auth/callback/google` (and `http://localhost:3000/...` for dev).
  3. Resend: verify `learnaeo.com`; create the audience → `RESEND_AUDIENCE_ID`.
  4. Stripe (new Learn AEO account): set the public business name and statement descriptor `LEARNAEO`; in test mode run `stripe-create-plans.mjs`, then `stripe-create-ppp-coupons.mjs`; add the webhook endpoint `https://www.learnaeo.com/api/webhooks/stripe` with the 9 events (list them, from `WEBHOOK_EVENTS`); repeat in live mode with `--live`.
  5. GA4 property → `NEXT_PUBLIC_GA_ID`, Measurement Protocol secret → `GA4_MP_API_SECRET`.
  6. Env vars in Vercel (Production) from `.env.example`; leave `NURTURE_ENABLED`, `AEO_DEV_BYPASS_AUTH` empty; set `ADMIN_EMAILS`. Check locally with `vercel env pull` + `node --env-file=<pulled> scripts/check-env.mjs`.
  7. Database: `npx prisma migrate deploy` (applies `20261026000000_init`, `20261027000000_xp_claims`, `20261028000000_certificates`; without the last two, XP claims and certificates 500), then `npx tsx scripts/seed-badges.ts`.
  8. Deploy; then `node --env-file=<pulled> scripts/stripe-check-launch.mjs --live` and `node scripts/smoke-prod.mjs`.
  9. Test-mode dry run (on a Preview deploy with test keys): buy Lifetime with card 4242…, buy Monthly, cancel Monthly in the portal, refund in the dashboard, finish lesson 1 and redeem the 24-hour offer on Lifetime (and see it refused on Monthly).
  10. First walk with a real DB (never seen rendered yet): dashboard city map, badge shelf, level title, certificate download and `/verify/<code>`, leaderboard, account rename, newsletter sign-up + unsubscribe.
  11. Search: verify the domain in Google Search Console and Bing Webmaster Tools, submit `sitemap.xml`, run `node scripts/indexnow-ping.mjs`.
  12. Rollback: Vercel "Promote" the previous deployment; migrations are additive, so no down-migration is needed.
- [ ] **Step 2: Verify** every script path and env var named in DEPLOY.md exists: `grep -o "scripts/[a-z/-]*\.\(mjs\|ts\)" docs/DEPLOY.md | sort -u | xargs ls`, and every `UPPER_CASE` var in it appears in `.env.example` (or is `VERCEL_ENV`). Expected: no "No such file", no unknown var.
- [ ] **Step 3:** README status: "Plan 7 (deploy readiness) is done. Next: Harry's launch steps in docs/DEPLOY.md, then lessons 4–8." Plan progress note. Commit `docs: deploy runbook`.

---

### Task 6 (needs Harry): Test-mode dry run with a real database

Runs only when Harry provides a Postgres URL for a dev database and Stripe **test** keys (test values on localhost are allowed). Otherwise it is carried, unchecked, as DEPLOY.md steps 9–10.

- [ ] `npx prisma migrate deploy` + badge seed against the dev DB; `npm run build`; `next start -p 3100` with test keys and `stripe listen --forward-to localhost:3100/api/webhooks/stripe` if the Stripe CLI is installed.
- [ ] Walk DEPLOY.md steps 9–10 in the browser at 1440 dark and 390 light; record each result (pass, or the bug found) in the ledger; fix bugs TDD-first as their own commits.
- [ ] `node --env-file=.env.local scripts/stripe-check-launch.mjs` → no problems.

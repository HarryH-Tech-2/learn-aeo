# Learn AEO — Plan 1: Fork, Strip, Rebrand, Pricing

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A fresh `learn-aeo` repository forked from learn-hieroglyphics, with every hieroglyphics-only feature removed, one site config replacing hardcoded domain strings, the navy/cyan/gold brand, and the $100 lifetime / $10 monthly plans wired through Stripe — building, tested and running locally.

**Architecture:** Copy the sibling's working tree (no git history, no secrets) into `C:\dev\learn-aeo`, delete the domain-specific routes/libs/components/tests/assets, and let `tsc` + vitest + `next build` find every dangling reference. The lesson system (lessons.ts, LessonStage, exercises, mechanics) is deliberately **kept as-is** in this plan so `/lessons` and `/dashboard` keep working; Plan 2 replaces it.

**Tech Stack:** Next 15 app router, React 19, TypeScript, Prisma 6 (Postgres), NextAuth v4, Stripe 17, Resend, Tailwind v4, vitest.

**Spec:** `docs/superpowers/specs/2026-10-26-learn-aeo-design.md`

**Later plans (one per phase, each written when its predecessor ships):** 2 lesson model, player and lessons 1–3 · 3 gamification, certificate, emails · 4 marketing pages and Three.js hero · 5 SEO/AEO plumbing · 6 tools, glossary, blog · 7 deploy readiness (launch) · 8 lessons 4–8 and remaining tools.

## Global Constraints

- Source repo `C:\Users\harry\Documents\code\learn-hieroglyphics` is **read-only**. Never modify it, never copy `.env`, `.env.local`, `.vercel`, `.git`, `.worktrees`, `.agents`, `.claude`, `.superpowers`.
- Domain: `https://www.learnaeo.com`. Site name: `Learn AEO`.
- Prices: lifetime **$100 / £80** one-time; monthly **$10 / £8** per month. No classroom, school, gift, print or licence plans.
- Discounts unchanged: PPP tiers B/C/D = 30/50/65% off; completion offer 33% off, 60 hours, lifetime only; 14-day money-back guarantee.
- New Stripe account: coupon ids `AEO_PPP_B`, `AEO_PPP_C`, `AEO_PPP_D`; offer coupon `NEXT-DISTRICT-33`; promo-code prefix `AEO-`.
- No author/Person schema or author bio anywhere (spec: author withheld at launch).
- Brand colours: bg `#04060d`, cyan `#6fe3ff`, gold `#ffc76b`. Fonts: Instrument Serif (display), Inter (UI/body).
- Match the sibling's conventions: explanatory header comment per module, pure logic in `src/lib`, typed TS data, `*_ENABLED` env flags default off.
- The existing `hero/` prototype and `docs/` folder in `C:\dev\learn-aeo` must survive the copy.

## Review Focus

1. **A Stripe event for a plan this site doesn't sell** (old `classroom`/`school` metadata, missing metadata) must not grant lifetime access — the sibling's webhook falls back to `PLANS.lifetime`. Expected: log and acknowledge (200) without granting. Test in Task 5.
2. **Prices render as "$100" and "$10", not "$100.00".** Expected on pricing cards, checkout copy and llms.txt. Test in Task 5.
3. **Discounted prices at the new anchor:** 33% off $100 → $66.99; PPP tier D 65% off → coupon applied, not a hand-computed amount. Test in Task 5.
4. **Removed URLs** (`/teachers`, `/translate-name-to-hieroglyphics`, `/games/*`, `/es/*`) must not appear in the sitemap, robots, llms.txt, nav or footer. Test in Task 2.
5. **Leftover sibling domain strings** (`learnhieroglyphics`, GA id `G-GM64VZ87FQ`, `lh_` cookie names) anywhere in `src`, `scripts`, `public`, config. Test in Task 3.

---

### Task 1: Fork into a fresh repository and get a green baseline

**Files:**
- Create: everything under `C:\dev\learn-aeo` copied from the source repo
- Keep: `C:\dev\learn-aeo\hero\`, `C:\dev\learn-aeo\docs\`

- [ ] **Step 1: Copy the working tree, excluding secrets and build output**

Run (Git Bash):
```bash
cd /c/Users/harry/Documents/code/learn-hieroglyphics
tar --exclude=./node_modules --exclude=./.next --exclude=./.git --exclude=./.vercel \
    --exclude=./.worktrees --exclude=./.agents --exclude=./.claude --exclude=./.superpowers \
    --exclude='./.env' --exclude='./.env.*' --exclude=./meshy-raw --exclude=./screenshots \
    --exclude=./seo-audit-lh --exclude=./docs --exclude=./skills --exclude=./skills-lock.json \
    --exclude=./prompt-to-make-app.txt --exclude=./funnel-issues.txt \
    --exclude=./stripe-lifetime-migration.txt --exclude=./tsconfig.tsbuildinfo \
    -cf - . | (cd /c/dev/learn-aeo && tar -xf -)
ls -a /c/dev/learn-aeo
```
Expected: `src`, `prisma`, `public`, `scripts`, `package.json` present; `hero` and `docs` still present; no `.env*`, `.git`, `.vercel`.

- [ ] **Step 2: Rename the package and initialise git**

Set `"name": "learn-aeo"` in `package.json`. Then `git init -b main` in `C:\dev\learn-aeo`.

- [ ] **Step 3: Install and record the baseline**

Run: `npm install` then `npx tsc --noEmit` then `npm test`.
Expected: install succeeds (postinstall runs `prisma generate`); tsc and tests pass as they do on the sibling. If any baseline test fails, note it in the commit message — do not fix sibling bugs here.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "chore: fork learn-hieroglyphics codebase as learn-aeo baseline"
```

---

### Task 2: Remove hieroglyphics-only features

**Files:**
- Delete routes under `src/app/`: `cartouche-image`, `cartouche-print`, `couple-names-in-hieroglyphics`, `daily`, `dev`, `dig`, `egyptian-numerals-converter`, `embed`, `es`, `fr`, `games`, `gift`, `hieroglyph-meaning`, `hieroglyphic-alphabet`, `hieroglyphics-keyboard`, `hieroglyphics-tattoo`, `keyboard-image`, `pet-name-in-hieroglyphics`, `play`, `teachers`, `translate-name-to-hieroglyphics`, `write-your-name-in-cuneiform`
- Delete APIs under `src/app/api/`: `cartouche-email`, `cartouche-print`, `class`, `class-set`, `community`, `cuneiform-interest`, `game-state` (only if nothing in the kept lesson player imports it — check first), `gift`, `keyboard-image`, `licence`, `name-drip`, `prodigi`, `srs`, `unit-pack`, `worksheet-email`
- Delete libs in `src/lib/` (and their tests in `src/lib/__tests__/`): `cartouche-*`, `class-set*`, `class-visit`, `classroom*`, `community*`, `cuneiform`, `daily`, `decipher`, `descent`, `dig`, `egyptian-calendar`, `gift-*`, `hieroglyph-keyboard*`, `hieroglyph-translator*`, `keyboard-*`, `licence*`, `name-drip*`, `numerals`, `pharaoh-title`, `prodigi`, `sign-hunt`, `srs*`, `stela`, `tomb-wall`, `translator-bridge`, `transliteration`, `unit-pack/`, `wall`, `worksheet-*`, `campaign-posts`, `business-details` (if only used by licence invoices)
- Delete components: `AboutHieroglyphics`, `AlphabetSelfTest`, `AlphabetTable`, `Cartouche*`, `ClassVisitStrip`, `GlyphGlossary`, `IntlNameTranslator`, `KeyboardCard`, `LangAttr`, `LanguageSwitcher`, `LocaleLessonCta`, `NameBox`, `NameCardStudio`, `NameLessonAsk`, `NameToolLanding`, `NameToolLinks`, `NameTranslatorTool`, `TeachersSection`, `TestimonialsSection`, `Translated*`, `Translator*`, `classroom/`, `community/`, `teachers/`
- Delete public assets: `cartouche-print`, `keyboard-styles`, `pins`, `stela`, `testimonials`, `models` (if unused by kept lesson player), `causeway-*`, `hero-*` videos/posters, `footer-egypt-*`, `og-homepage.*`, `about`, `map`, `ff4f2a5dcb20e32652058538049832c5.txt` (sibling IndexNow key)
- Delete scripts: `audit-glyphs.py`, `community-seed*`, `meshy-*`, `generate-images.ts`, `stripe-add-gbp-price.mjs`, `gsc-report.py`, `diagnose-funnel.mjs`, `nurture-backfill.mjs`, `scripts/marketing`, `scripts/__pycache__`, and `scripts/dev/*` except `build-og-image.ts`
- Modify: `prisma/schema.prisma` (drop `CommunityQuestion`, `CommunityAnswer`, `Licence`, `SignReview`, `ClassRoom`, `ClassTeam` and their relations on `User`), `src/app/api/webhooks/stripe/route.ts`, `src/app/api/cron/nurture/route.ts`, `src/middleware.ts`, `src/lib/subscription.ts`, `next.config.ts`, `vercel.json`, `src/app/sitemap.ts`, `src/app/robots.ts`, `src/app/llms.txt/route.ts`, `src/components/Navbar.tsx`, `src/components/Footer.tsx`, `src/components/home/*`
- Replace: `prisma/migrations/` with a single baseline migration

**Interfaces:**
- Produces: `checkSubscription(email)` in `src/lib/subscription.ts` returning only lifetime / monthly / free-unlock access (no licence branch). The kept lesson player, `GameState` model and `api/game-state` remain if the player imports them.

- [ ] **Step 1: Delete the files and folders listed above**

Before deleting `api/game-state`, `public/models`, `public/audio`, `public/lessons`, `public/videos` run `grep -rn "<name>" src --include=*.ts --include=*.tsx` and keep any the lesson player, dashboard or lessons pages still use.

- [ ] **Step 2: Fix every dangling reference until tsc is clean**

Run: `npx tsc --noEmit`
For each error: remove the import and the UI that used it (nav links, home sections, footer links, sitemap/llms entries, webhook product branches for cartouche/keyboard/class-set/unit-pack/gift/licence, cron runners for worksheet-followup/licence-renewal/name-drip/gift-updates, the licence branch of `checkSubscription`). Do not stub removed features.
Expected final: `npx tsc --noEmit` exits 0.

- [ ] **Step 3: Trim config**

`next.config.ts`: remove redirects to removed pages (`/name`, `/teacher`, hieroglyph blog renames) and the `outputFileTracingIncludes` for removed PDF routes. `vercel.json`: keep the nurture cron and security headers; drop the `/embed/` header block; leave the apex→www redirect for Task 4.

- [ ] **Step 4: Rebuild the Prisma baseline migration**

Delete `prisma/migrations/*`, then generate one migration from the trimmed schema without a database:
```bash
mkdir -p prisma/migrations/20261026000000_init
npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > prisma/migrations/20261026000000_init/migration.sql
printf 'provider = "postgresql"\n' > prisma/migrations/migration_lock.toml
npx prisma validate
```
Expected: `The schema at prisma/schema.prisma is valid`.

- [ ] **Step 5: Write the removed-URLs test (Review Focus 4)**

Create `src/lib/__tests__/removed-routes.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import sitemap from "@/app/sitemap";
import robots from "@/app/robots";

const REMOVED = ["/teachers", "/translate-name", "/games/", "/hieroglyph", "/cartouche", "/daily", "/dig", "/gift", "/es/", "/fr/", "/play/", "cuneiform", "keyboard"];

describe("removed sibling features", () => {
  it("sitemap lists none of them", async () => {
    const urls = (await sitemap()).map((e) => e.url);
    for (const bad of REMOVED) expect(urls.filter((u) => u.includes(bad))).toEqual([]);
  });
  it("robots disallow list mentions none of them", () => {
    const text = JSON.stringify(robots());
    for (const bad of ["/teachers", "/cartouche", "/play/", "keyboard"]) expect(text).not.toContain(bad);
  });
});
```
Run: `npx vitest run src/lib/__tests__/removed-routes.test.ts` — Expected: PASS (fix sitemap/robots until it does). If `sitemap()` is synchronous, drop the `await`.

- [ ] **Step 6: Full verification**

Run: `npm test` then `npm run build`.
Expected: all tests pass; build completes. Then `grep -rniE "cartouche|teachers|classroom|prodigi|cuneiform" src --include=*.ts --include=*.tsx -l` lists only files under the kept lesson system (`lessons.ts`, `content/`, `LessonStage.tsx`, `lesson/`, `mechanics/`, `exercises/`, `journey/`, `three/`) — Plan 2 removes those.

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "chore: remove hieroglyphics-only routes, tools, licences and assets"
```

---

### Task 3: Site config and brand strings

**Files:**
- Create: `src/lib/site.ts`, `src/lib/__tests__/site.test.ts`, `.env.example`
- Modify: every file in `src`, `scripts`, `public`, `vercel.json`, `next.config.ts` containing `learnhieroglyphics`, `Learn Hieroglyphics`, `G-GM64VZ87FQ`, `lh_`; `src/app/layout.tsx`; `scripts/indexnow.config.json`

**Interfaces:**
- Produces (from `src/lib/site.ts`):
  ```ts
  export const SITE: {
    name: "Learn AEO";
    url: string;            // process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.learnaeo.com", no trailing slash
    host: "www.learnaeo.com";
    apexHost: "learnaeo.com";
    tagline: string;        // "Learn answer engine optimization"
    description: string;    // one sentence for meta/OG
    supportEmail: string;   // process.env.CONTACT_TO_EMAIL ?? "hello@learnaeo.com"
    gaId: string | undefined; // process.env.NEXT_PUBLIC_GA_ID
    sameAs: string[];       // [] until Harry adds profiles
  };
  export function absoluteUrl(path: string): string; // absoluteUrl("/pricing") === "https://www.learnaeo.com/pricing"; absoluteUrl("/") === SITE.url
  export const COOKIE_PREFIX = "aeo_";
  ```

- [ ] **Step 1: Write the failing test**

`src/lib/__tests__/site.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { SITE, absoluteUrl, COOKIE_PREFIX } from "@/lib/site";

describe("site config", () => {
  it("defaults to the production domain", () => {
    expect(SITE.url).toBe("https://www.learnaeo.com");
    expect(SITE.name).toBe("Learn AEO");
  });
  it("builds absolute urls without double slashes", () => {
    expect(absoluteUrl("/pricing")).toBe("https://www.learnaeo.com/pricing");
    expect(absoluteUrl("pricing")).toBe("https://www.learnaeo.com/pricing");
    expect(absoluteUrl("/")).toBe("https://www.learnaeo.com");
  });
  it("uses its own cookie prefix", () => {
    expect(COOKIE_PREFIX).toBe("aeo_");
  });
});
```
Run: `npx vitest run src/lib/__tests__/site.test.ts` — Expected: FAIL (module not found).

- [ ] **Step 2: Implement `src/lib/site.ts`** with the interface above. Run the test — Expected: PASS.

- [ ] **Step 3: Write the leftovers test (Review Focus 5)**

`src/lib/__tests__/no-sibling-strings.test.ts`: walk `src`, `scripts`, `public` (text files only: .ts .tsx .js .mjs .json .txt .xml .webmanifest .css .md) plus `vercel.json`, `next.config.ts`, and assert no file contains `learnhieroglyphics`, `G-GM64VZ87FQ`, or the regex `/["'`]lh_[a-z]/`. Ignore `node_modules`, `.next`, and the test file itself.
Run it — Expected: FAIL listing files.

- [ ] **Step 4: Replace the strings**

- URLs → `absoluteUrl(...)` / `SITE.url`; brand name → `SITE.name`; GA script in `layout.tsx` reads `SITE.gaId` and renders nothing when unset.
- Cookie names `lh_cc`, `lh_*` → `${COOKIE_PREFIX}cc` etc. (`COUNTRY_COOKIE` in `pricing.ts`, middleware, access-test, campaign, referrer).
- Env var `LH_DEV_BYPASS_AUTH` → `AEO_DEV_BYPASS_AUTH` in `dev-bypass.ts` and its readers.
- `vercel.json` apex redirect: host `learnaeo.com` → `https://www.learnaeo.com/$1`.
- `scripts/indexnow.config.json`: host `www.learnaeo.com`, new random 32-hex key; create `public/<key>.txt` containing the key.
- Organization JSON-LD in `layout.tsx`: name, url, logo from `SITE`; `sameAs: SITE.sameAs`; no founder/author.
Run: `npx vitest run src/lib/__tests__/no-sibling-strings.test.ts` — Expected: PASS.

- [ ] **Step 5: Write `.env.example`**

List every `process.env.*` name still referenced in `src` and `scripts` (find with `grep -rhoE "process\.env\.[A-Z0-9_]+" src scripts | sort -u`), grouped (Site, Database, Auth, Stripe, Email, Cron/flags, Analytics), each with a one-line comment and an empty value. Include `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_GA_ID`, `AEO_DEV_BYPASS_AUTH`.

- [ ] **Step 6: Verify and commit**

Run: `npx tsc --noEmit && npm test` — Expected: pass.
```bash
git add -A && git commit -m "feat: site config for learnaeo.com, replace sibling domain, cookies and GA id"
```

---

### Task 4: Brand look

**Files:**
- Modify: `src/styles/globals.css` (`@theme` tokens, `--rt-*` runtime vars for dark and `html.light`), `src/app/layout.tsx` (fonts), `src/lib/theme.ts` (theme-color meta), `public/site.webmanifest`, `public/favicon.svg`, `public/favicon.png`, `public/favicon-64.png`, `public/apple-touch-icon.png`, `public/icon-192.png`, `public/icon-512.png`, `src/components/Navbar.tsx`, `src/components/Footer.tsx`
- Create: `scripts/dev/build-icons.mjs` (renders the favicon set from `favicon.svg` with `sharp`, already a dependency)

**Interfaces:**
- Produces: Tailwind tokens later plans use — `bg-ink` (`#04060d`), `text-cyan` / `bg-cyan` (`#6fe3ff`), `text-gold` / `bg-gold` (`#ffc76b`), `font-display` (Instrument Serif), `font-sans` (Inter). Keep the sibling's token *names* that existing components use (`obsidian`, `sand-*`, `gold-*`) mapped onto the new palette so nothing breaks; Plan 4 migrates components to the new names.

- [ ] **Step 1: Swap fonts** — in `layout.tsx` replace Open Sans / Noto Sans Cuneiform with `next/font/google` `Inter` (variable `--font-sans`) and `Instrument_Serif` (weights 400, styles normal+italic, variable `--font-display`). Remove the Noto Egyptian Hieroglyphs preload **only if** the kept lesson player no longer needs it (it does until Plan 2 — keep it, mark with a `// Plan 2: remove` comment).

- [ ] **Step 2: Swap palette** — dark: obsidian → `#04060d`, gold-500 → `#ffc76b`, add cyan scale around `#6fe3ff`; light theme: near-white background `#f6f8fc`, ink text `#0b1220`, same accents darkened for contrast (gold `#b7791f`, cyan `#0e7490`). Check WCAG AA contrast for body text and CTA text on both themes with any contrast calculator; record the ratios in a comment above the tokens.

- [ ] **Step 3: Favicon** — `favicon.svg`: a rounded navy square with a cyan search-bar outline split by a gold vertical seam (the hero's door). Run `node scripts/dev/build-icons.mjs` to produce the PNG sizes. Update `site.webmanifest` name/short_name `Learn AEO`, theme/background `#04060d`.

- [ ] **Step 4: Navbar and Footer copy** — logo text "Learn AEO", links: Course (`/#curriculum`), Pricing, Blog, Log in / Dashboard; footer: About, Contact, Privacy, Terms, Blog, Pricing, © Learn AEO. No links to removed pages.

- [ ] **Step 5: Visual check** — `npm run dev`, open `/`, `/pricing`, `/login` at 1440×900 and 390×844 in both themes (headless Chrome screenshots are fine). Expected: no Egyptian imagery or fonts in nav/footer, readable contrast, no layout breakage. Home page body content is still sibling copy — Plan 4 rewrites it.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: Learn AEO palette, fonts, favicon set, nav and footer"
```

---

### Task 5: Pricing — $100 lifetime, $10 monthly

**Files:**
- Modify: `src/lib/plans.ts`, `src/lib/pricing.ts`, `src/lib/ppp.ts`, `src/lib/offers.ts`, `src/lib/checkout-copy.ts`, `src/components/PricingSection.tsx`, `src/components/PricingFAQ.tsx`, `src/app/pricing/*`, `src/app/llms.txt/route.ts`, `src/app/api/webhooks/stripe/route.ts`, `scripts/stripe-create-plans.mjs`, `scripts/stripe-create-ppp-coupons.mjs`, `scripts/stripe-audit-prices.mjs`, `src/app/terms/*` (refund clause wording only if it names old prices)
- Test: `src/lib/__tests__/plans.test.ts`, `src/lib/__tests__/ppp.test.ts`, `src/lib/__tests__/offer-price.test.ts`, `src/app/api/webhooks/stripe/__tests__/webhook.test.ts`, `src/app/api/stripe/__tests__/create-checkout-authenticated.test.ts`

**Interfaces:**
- Produces: `PlanId = "lifetime" | "monthly"`; `PLAN_IDS = ["lifetime", "monthly"]`; `PLANS.lifetime` `{ usd: 100, gbp: 80, mode: "payment", envKey: "STRIPE_PRICE_ID", featured: true }`; `PLANS.monthly` `{ usd: 10, gbp: 8, mode: "subscription", interval: "month", envKey: "STRIPE_PRICE_MONTHLY", name: "Monthly" }`; `PRICES.USD = { amount: 100, symbol: "$", minor: 10000 }`, `PRICES.GBP = { amount: 80, symbol: "£", minor: 8000 }`; `isLicencePlan` removed; `formatPrice(currency, amount?)` prints integers without decimals.

- [ ] **Step 1: Rewrite the plan tests first**

In `plans.test.ts` delete the `licence rules` block and replace the `plans` block assertions with:
```ts
expect(PLAN_IDS).toEqual(["lifetime", "monthly"]);
expect(PLANS.lifetime.usd).toBe(100);
expect(PLANS.lifetime.gbp).toBe(80);
expect(PLANS.monthly.usd).toBe(10);
expect(PLANS.monthly.gbp).toBe(8);
expect(planMinor(PLANS.lifetime, "USD")).toBe(10000);
expect(formatPlanPrice(PLANS.lifetime, "USD")).toBe("$100");   // Review Focus 2
expect(formatPlanPrice(PLANS.monthly, "GBP")).toBe("£8");
expect(formatPrice("USD")).toBe("$100");
expect(formatPrice("USD", 66.99)).toBe("$66.99");
expect(discounted("USD", 33)).toBe(66.99);                     // Review Focus 3
expect(discounted("GBP", 33)).toBe(52.99);
expect(isPlanId("classroom")).toBe(false);
```
Add to `ppp.test.ts`: the tier-D coupon id is `"AEO_PPP_D"` and tier percentages are 30/50/65. Add to `create-checkout-authenticated.test.ts`: expected discounts use `AEO_PPP_D`. Update `section.test.ts` and `webhook.test.ts` promo fixtures from `SCRIBE-` to `AEO-`.
Run: `npm test` — Expected: these tests FAIL.

- [ ] **Step 2: Webhook unknown-plan test (Review Focus 1)**

In `webhook.test.ts` add `it("does not grant access for a checkout with an unknown or missing plan")`: send `checkout.session.completed` with `metadata: { plan: "classroom", email: "a@b.co" }` and again with no `plan`; assert response status 200, `activateSubscription` (or the module's grant function) not called, and an error logged. Run — Expected: FAIL (current code falls back to `PLANS.lifetime`).

- [ ] **Step 3: Implement**

- `plans.ts`: two plans only, copy for marketers. Lifetime features: "All 8 lessons, including every lesson as it's released", "Free AEO tools and templates", "Certificate to share on LinkedIn", "14-day money-back guarantee". Monthly features: "Everything in Lifetime while it runs", "Cancel any time from your account", "Progress kept if you come back". Remove `seats` and `isLicencePlan`.
- `pricing.ts`: new `PRICES`; `formatPrice` prints integers without `.00`.
- `ppp.ts`: coupon ids `AEO_PPP_B/C/D`, same percentages.
- `offers.ts`: `OFFER_COUPON_ID = "NEXT-DISTRICT-33"`, promo prefix `AEO-`.
- Webhook: replace `planById(...) ?? PLANS.lifetime` with an explicit unknown-plan branch that logs `console.error("[stripe] unknown plan", ...)` and returns 200 without granting.
- `checkout-copy.ts`, `PricingSection`, `PricingFAQ`, pricing page, `llms.txt` route: read amounts from `PLANS`/`formatPlanPrice` — no hardcoded numbers. Remove classroom/school cards and FAQ entries.
- Scripts: `stripe-create-plans.mjs` creates products "Learn AEO — Lifetime" ($100, GBP option £80) and "Learn AEO — Monthly" ($10/month, £8) with statement descriptor `LEARNAEO`; `stripe-create-ppp-coupons.mjs` creates `AEO_PPP_B/C/D` and `NEXT-DISTRICT-33`; `stripe-audit-prices.mjs` `EXPECTED` table matches. Scripts refuse to run when `STRIPE_SECRET_KEY` starts with `sk_live_` unless `--live` is passed.

- [ ] **Step 4: Run tests**

Run: `npm test` — Expected: PASS. Then `grep -rnE "19\.99|4\.99|15\.99|3\.99|29\.5|124\.5" src scripts` — Expected: no matches.

- [ ] **Step 5: Stripe test-mode dry run (only if Harry has supplied a test key)**

Run: `STRIPE_SECRET_KEY=sk_test_... node scripts/stripe-create-plans.mjs` then `node scripts/stripe-create-ppp-coupons.mjs` then `node scripts/stripe-audit-prices.mjs`.
Expected: price ids printed; audit reports all prices match. Without a key, skip and note it in the handoff.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: \$100 lifetime and \$10 monthly plans, AEO coupon ids, safe unknown-plan webhook"
```

---

### Task 6: Local smoke run

**Files:**
- Create: `README.md` (what the project is, setup from `.env.example`, `npm run dev`, dev auth bypass, Stripe scripts, which plan comes next)

- [ ] **Step 1: Run the app without external services**

Create `.env.local` (git-ignored) with `AEO_DEV_BYPASS_AUTH=1`, `NEXTAUTH_SECRET=<random>`, `NEXTAUTH_URL=http://localhost:3000` and placeholder DB URLs. Run `npm run dev`.

- [ ] **Step 2: Hit the key routes**

Run: `for p in / /pricing /login /get-started /blog /about /contact /privacy /terms /robots.txt /sitemap.xml /llms.txt /teachers; do echo "$p $(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000$p)"; done`
Expected: 200 for all except `/teachers` → 404. DB-backed pages may error without a database; record which ones in the README under "needs a database".

- [ ] **Step 3: Final checks and commit**

Run: `npx tsc --noEmit && npm test && npm run build` — Expected: all pass.
```bash
git add -A && git commit -m "docs: README with setup and local run notes"
```

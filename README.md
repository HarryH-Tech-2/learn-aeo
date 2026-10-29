# Learn AEO

Learn AEO is a course for marketers on answer engine optimization: how to get a brand cited and recommended by ChatGPT, Perplexity, Google AI Overviews and other answer engines. It is a Next.js app (App Router, Prisma, NextAuth, Stripe, Resend) forked from an earlier course codebase, with the old subject-specific features removed. Pricing is $100 lifetime or $10 a month (GBP options at £80 and £8).

Status: Plan 1 (fork, strip, rebrand, pricing) and Plan 2 (lesson model, lesson player, lessons 1-3) are done. Plan 3 (removal of the old theme, server-side XP, levels and badges, certificate, rewritten emails, site-wide ban test) is done. Plan 4 (US spelling, verifiable certificate with /verify/<code>, the City of Answers 3D hero, the tools section) is done. Plan 5 (schema helper, page metadata and Open Graph on every page, lesson share images, llms.txt and sitemap from the catalogs) is done. Plan 6 (AI Crawler Checker, llms.txt Generator, tools hub, a 30-term glossary, eight sourced launch posts) is done. Plan 7 (deploy readiness: env check that fails a bad production build, Stripe launch check, post-deploy smoke test, runbook) is done. Next: the launch steps in [docs/DEPLOY.md](docs/DEPLOY.md), then lessons 4-8.

## Setup

```bash
npm install
cp .env.example .env.local
```

Fill in `.env.local` from `.env.example` (each variable is commented there). `.env.local` is git-ignored; never commit it. Minimum for a local run without external services:

```
AEO_DEV_BYPASS_AUTH=1
NEXTAUTH_SECRET=<any random string>
NEXTAUTH_URL=http://localhost:3000
POSTGRES_URL=postgresql://user:pass@localhost:5432/aeo
DATABASE_URL=postgresql://user:pass@localhost:5432/aeo
```

## Run

```bash
npm run dev      # http://localhost:3000
npx tsc --noEmit && npm test && npm run build
```

## Deploy

Before the new code takes traffic, run these against the production database (with `POSTGRES_URL` and `DATABASE_URL` set to it):

```bash
npx prisma migrate deploy        # applies prisma/migrations, including the XP claims and certificates tables
npx tsx scripts/seed-badges.ts   # writes the badge definitions from src/lib/gamification.ts
```

- The badge seed deletes any badge row that is no longer defined, and the user badges that point at it go with it (cascade). It then upserts the current definitions, so it is safe to run again.
- There is no XP backfill: XP is earned only through the new XP claims from launch onwards (the site has not launched, so no one has XP to carry over).

After a deploy that adds or substantively changes pages, tell Bing and the other IndexNow engines:

```bash
node scripts/indexnow-ping.mjs                 # every URL in the live sitemap
node scripts/indexnow-ping.mjs /pricing        # or just these paths
```

The key is in `scripts/indexnow.config.json` and served from `public/<key>.txt`; `src/lib/__tests__/indexnow.test.ts` checks the two match.

Before deploying, check the head of every sitemap page against a production build (canonical, og:url and og:image, no noindex, JSON-LD parses, the Organization and Course @ids):

```bash
npm run build && npx next start -p 3200   # in one terminal
node scripts/dev/check-seo.mjs http://localhost:3200
```

### Dev auth bypass

With `AEO_DEV_BYPASS_AUTH=1` sign-in is skipped locally. It is ignored when `NODE_ENV` is `production` (src/lib/dev-bypass.ts); never set it on Vercel. The dashboard still redirects without a real session, so under the bypass open a lesson by its URL, e.g. `/lessons/make-your-site-reachable-by-ai`.

### Local smoke results (no database, no external services)

200: `/`, `/pricing`, `/login`, `/get-started`, `/blog`, `/about`, `/contact`, `/privacy`, `/terms`, `/robots.txt`, `/sitemap.xml`, `/llms.txt`, `/dashboard`, `/account`, `/api/auth/session`, `/api/auth/providers`.
404 by design: `/teachers` (removed), `/admin` (needs an admin session).

Needs a database: anything that reads or writes Postgres (real sign-in and sessions, progress, purchases and entitlements, checkout, the Stripe webhook, newsletter and nurture email, leaderboard, certificates, admin pages). These were not exercised in the smoke run.

## Lessons

The course is eight lessons, one per district of the City of Answers. Lessons 1-3 are live; 4-8 show as "coming soon". Lesson 1 is free with a sign-in; the rest need Lifetime or Monthly access. A lesson lives at `/lessons/<id>`.

### How a lesson is built

- `src/lib/lesson-catalog.ts`: the catalog. One entry per lesson (id, order, district, title, summary, description, level, minutes, `isFree`, `status: "live" | "coming-soon"`). Middleware imports it, so it must stay edge-safe: it imports only `lesson-types.ts`.
- `src/lib/lesson-types.ts`: the types for content (`LessonContent`, `Concept`, `Question`, `Source`, ...). Types only.
- `src/lib/content/lesson-<n>-<district>.ts`: one file per live lesson, exporting its `LessonContent`: an intro, 3-4 concept groups (each concept with an explanation, why it matters, a pitfall and at least one source; each group ends with a quick check), a signature exercise, a real-world example to dissect, an audit of 8-12 questions, and an outro.
- `src/lib/lessons.ts`: the registry. Joins the catalog with `CONTENT` (lesson id to content). A catalog entry marked `live` with no content throws at import.
- `src/lib/questions.ts`: answer checking for the six question kinds (`choice`, `passage`, `blank`, `order`, `match`, `spot`). In a `blank` question, `___` marks each gap and `\n` starts a new line.
- `src/components/player/`: the lesson player (`LessonPlayer.tsx`) and one component per question kind under `questions/`. The learner's place is saved in localStorage under `aeo_lesson_<id>`. The audit passes at 60% (`isLessonComplete` in `src/lib/progress.ts`).

### Sources

Every concept and example cites a named, linkable source, checked against the live page when written. `src/lib/__tests__/lesson-content.test.ts` checks the shape of every live lesson (and that no wording from the old course is left). To check that every cited URL still resolves (network-bound, so it is off by default):

```bash
CHECK_SOURCES=1 npx vitest run src/lib/__tests__/lesson-sources.live.test.ts
```

### Adding a lesson

1. Write `src/lib/content/lesson-<n>-<district>.ts` exporting a `LessonContent`, following lessons 1-3. Source every claim; British English; no author bylines.
2. Add it to `CONTENT` in `src/lib/lessons.ts` under the lesson's catalog id.
3. Set that catalog entry's `status` to `"live"` in `src/lib/lesson-catalog.ts`. Do not change ids: they are the URLs.
4. Run `npx tsc --noEmit && npm test && npm run build`, then the `CHECK_SOURCES=1` check above.
5. Walk the lesson with `AEO_DEV_BYPASS_AUTH=1` at desktop and phone widths, in both themes, from intro to outro.

## Stripe scripts

Run test mode first.

```bash
STRIPE_SECRET_KEY=sk_test_... node scripts/stripe-create-plans.mjs        # prints STRIPE_PRICE_ID and STRIPE_PRICE_MONTHLY
STRIPE_SECRET_KEY=sk_test_... node scripts/stripe-create-ppp-coupons.mjs
STRIPE_SECRET_KEY=sk_test_... node scripts/stripe-audit-prices.mjs        # read-only
```

A `sk_live_` key is refused unless you pass `--live`. The scripts are idempotent. The Step 5 dry run (test-mode run of these scripts and a test checkout) has not been done yet.

## External setup still to do (Harry)

- DNS and Vercel: create the Vercel project, point learnaeo.com / www.learnaeo.com at it, set the environment variables.
- Postgres: provision a database, set `POSTGRES_URL` and `DATABASE_URL`, run the Prisma migrations.
- Google OAuth: create a client, set `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` with the production and localhost callback URLs.
- Resend: verify the learnaeo.com domain, set `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `RESEND_AUDIENCE_ID`.
- Stripe: run the plan scripts, add a webhook to `/api/webhooks/stripe` and set `STRIPE_WEBHOOK_SECRET`, and set the account default statement descriptor to `LEARNAEO`.
  - Webhook events to subscribe: `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `checkout.session.expired`, `customer.subscription.updated`, `customer.subscription.deleted`, `charge.refunded`, `charge.dispute.created`, `charge.dispute.closed`.
  - Before going live: restrict the NEXT-DISTRICT-33 coupon to the Lifetime product (applies_to) in Stripe.
- GA4: create a property, set `NEXT_PUBLIC_GA_ID` and `GA4_MP_API_SECRET`.

## Next

The remaining lessons in the catalog are marked coming soon.

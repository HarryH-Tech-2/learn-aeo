# Learn AEO

Learn AEO is a course for marketers on answer engine optimisation: how to get a brand cited and recommended by ChatGPT, Perplexity, Google AI Overviews and other answer engines. It is a Next.js app (App Router, Prisma, NextAuth, Stripe, Resend) forked from the learn-hieroglyphics codebase, with the hieroglyph-specific features removed. Pricing is $100 lifetime or $10 a month (GBP options at £80 and £8).

Status: Plan 1 (fork, strip, rebrand, pricing) is done. Plan 2 (lesson model, lesson player, lessons 1-3) comes next.

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

### Dev auth bypass

With `AEO_DEV_BYPASS_AUTH=1` sign-in is skipped locally. It is ignored when `NODE_ENV` is `production` (src/lib/dev-bypass.ts); never set it on Vercel.

### Local smoke results (no database, no external services)

200: `/`, `/pricing`, `/login`, `/get-started`, `/blog`, `/about`, `/contact`, `/privacy`, `/terms`, `/robots.txt`, `/sitemap.xml`, `/llms.txt`, `/dashboard`, `/account`, `/api/auth/session`, `/api/auth/providers`.
404 by design: `/teachers` (removed), `/admin` (needs an admin session).

Needs a database: anything that reads or writes Postgres (real sign-in and sessions, progress, purchases and entitlements, checkout, the Stripe webhook, newsletter and nurture email, leaderboard, certificates, admin pages). These were not exercised in the smoke run.

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

Plan 2: lesson model, lesson player, lessons 1-3.

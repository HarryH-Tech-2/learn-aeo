# Deploying Learn AEO

The launch runbook for www.learnaeo.com. Do the steps in order. Each step says how to tell it worked. The scripts it names are read-only, except the two `stripe-create-*` scripts, and a live Stripe key is refused unless you pass `--live`.

## 1. Accounts and hosting

1. **Vercel:** create a project from the GitHub repo (framework: Next.js, default build settings).
2. **DNS:** point `learnaeo.com` and `www.learnaeo.com` at Vercel (Project → Settings → Domains). Make `www.learnaeo.com` the primary domain. `vercel.json` already 301s the apex to www.
   *Worked when:* both domains show "Valid Configuration".
3. **Postgres** (Neon, or Vercel Postgres): create a production database. Copy the **pooled** connection string to `POSTGRES_URL` and the **direct** one to `DATABASE_URL`.

## 2. Google sign-in

Google Cloud Console → APIs & Services → Credentials → OAuth client (Web):

- Authorized JavaScript origin: `https://www.learnaeo.com`
- Authorized redirect URI: `https://www.learnaeo.com/api/auth/callback/google`
- For local dev, also add `http://localhost:3000` and `http://localhost:3000/api/auth/callback/google`.

This gives you `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`. Set the consent screen's app name to Learn AEO and publish it.

## 3. Email (Resend)

1. Add and verify the domain `learnaeo.com` (DNS records from Resend).
2. Create an API key → `RESEND_API_KEY`. Set `RESEND_FROM_EMAIL` to an @learnaeo.com address, e.g. `Learn AEO <hello@learnaeo.com>`.
3. Create an audience for the newsletter → `RESEND_AUDIENCE_ID`.

*Worked when:* Resend shows the domain as Verified.

## 4. Stripe (the separate Learn AEO account)

Do all of this in **test mode** first, then again in **live mode** with `--live`.

1. Settings → Public details: business name **Learn AEO**, statement descriptor **LEARNAEO**.
2. Create the plans (Lifetime $100 / £80, Monthly $10 / £8):
   `STRIPE_SECRET_KEY=sk_test_... node scripts/stripe-create-plans.mjs`
   It prints `STRIPE_PRICE_ID` and `STRIPE_PRICE_MONTHLY`.
3. Create the coupons (PPP 30/50/65% and the 33% completion offer, which is limited to the Lifetime product):
   `STRIPE_SECRET_KEY=sk_test_... node scripts/stripe-create-ppp-coupons.mjs`
4. Developers → Webhooks → add an endpoint at `https://www.learnaeo.com/api/webhooks/stripe` with these 9 events:
   - `checkout.session.completed`
   - `checkout.session.async_payment_succeeded`
   - `checkout.session.async_payment_failed`
   - `checkout.session.expired`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `charge.refunded`
   - `charge.dispute.created`
   - `charge.dispute.closed`

   Its signing secret goes in `STRIPE_WEBHOOK_SECRET`.
5. Check everything: `STRIPE_SECRET_KEY=sk_test_... node scripts/stripe-check-launch.mjs` (in live mode, add `--live`).
   *Worked when:* it prints ✓ and the price audit passes, with exit code 0.

## 5. Analytics

Create a GA4 property for www.learnaeo.com. Its measurement id (`G-…`) goes in `NEXT_PUBLIC_GA_ID`. Admin → Data streams → Measurement Protocol API secrets gives you `GA4_MP_API_SECRET`.

## 6. Environment variables

In Vercel → Settings → Environment Variables (Production), set every variable in `.env.example`:

- `NEXTAUTH_URL=https://www.learnaeo.com`
- `NEXTAUTH_SECRET`: a random 32+ character string (`openssl rand -base64 32`)
- `CRON_SECRET`: a random string. Vercel sends it to `/api/cron/nurture`.
- `ADMIN_EMAILS`: your email
- Leave `NURTURE_ENABLED`, `AEO_DEV_BYPASS_AUTH` and `NEXT_PUBLIC_SITE_URL` empty.

Check them:

```bash
vercel env pull .env.production.local --environment=production
node --env-file=.env.production.local scripts/check-env.mjs
```

*Worked when:* it prints "Production environment looks complete." A production build runs the same check (`next.config.ts`) and fails with the same list if anything is missing or wrong.

## 7. Database

```bash
DATABASE_URL=<direct url> npx prisma migrate deploy
DATABASE_URL=<direct url> npx tsx scripts/seed-badges.ts
```

`migrate deploy` applies `20261026000000_init`, `20261027000000_xp_claims` and `20261028000000_certificates`. Without the last two, every XP claim and certificate request returns a 500. The seed writes the badge list and removes stale rows.

## 8. Deploy and smoke test

1. Deploy `main` to production in Vercel.
2. Run the live Stripe check: `node --env-file=.env.production.local scripts/stripe-check-launch.mjs --live`
3. Run the smoke test: `node scripts/smoke-prod.mjs`
   *Worked when:* it reports the apex redirect, security headers, robots.txt, llms.txt, that the webhook rejects unsigned calls, the crawler checker and every sitemap URL, all with ✓ and exit code 0.

## 9. Test-mode dry run (on a Preview deploy with test keys)

- [ ] Sign in with Google, and with an email magic link.
- [ ] Buy Lifetime with card `4242 4242 4242 4242`. Access unlocks. Stripe sends the receipt if Settings → Customer emails → Successful payments is on, so turn that on.
- [ ] Buy Monthly with a second account, then cancel it from Account → "Manage billing or cancel". Access ends at the period end.
- [ ] Fully refund the Lifetime charge in the Stripe dashboard. Lifetime access is removed and the owner is emailed (webhook `charge.refunded`).
- [ ] Finish lesson 1 on a fresh account. The 33% offer appears, lasts 24 hours, works on Lifetime, and is refused on Monthly.

## 10. First walk with a real database

These pages have never been seen rendered with a database. Check each one at desktop width (dark) and at phone width (light):

- [ ] Dashboard city map, XP, level title and badge shelf.
- [ ] Certificate: download the PNG, then open its `/verify/<code>` link (lowercase too, which redirects).
- [ ] Leaderboard, and an account rename (the leaderboard and new certificates show the new name).
- [ ] Newsletter sign-up, the welcome email, and its unsubscribe link.

## 11. Search engines

1. Verify the domain in Google Search Console and Bing Webmaster Tools, then submit `https://www.learnaeo.com/sitemap.xml` to both.
2. Ping IndexNow with every sitemap URL: `node scripts/indexnow-ping.mjs`

## Rollback

In Vercel → Deployments, use **Promote to Production** on the previous good deployment. The migrations only add tables, so the older code runs against the newer database. No down-migration is needed.

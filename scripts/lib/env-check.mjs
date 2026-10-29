/**
 * What a production deploy of Learn AEO needs in its environment. Plain JS so the CLI
 * (scripts/check-env.mjs), next.config.ts (fails a Vercel production build) and vitest share it.
 */

/** The production site URL; mirrors SITE.host in src/lib/site.ts (a test keeps them equal). */
export const CANONICAL_SITE_URL = "https://www.learnaeo.com";

/** Every variable a production deploy must set (see .env.example for what each one is). */
export const REQUIRED_PRODUCTION_ENV = [
  "NEXTAUTH_URL",
  "NEXTAUTH_SECRET",
  "DATABASE_URL",
  "POSTGRES_URL",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "STRIPE_PRICE_ID",
  "STRIPE_PRICE_MONTHLY",
  "RESEND_API_KEY",
  "RESEND_FROM_EMAIL",
  "RESEND_AUDIENCE_ID",
  "CRON_SECRET",
  "ADMIN_EMAILS",
  "NEXT_PUBLIC_GA_ID",
];

/**
 * @param {Record<string, string | undefined>} env
 * @param {string} siteUrl the canonical site URL, e.g. https://www.learnaeo.com
 * @returns {{ missing: string[]; problems: string[] }} both empty when the deploy is good to go
 */
export function checkProductionEnv(env, siteUrl) {
  const val = (k) => (env[k] ?? "").trim();
  const missing = REQUIRED_PRODUCTION_ENV.filter((k) => !val(k));
  const problems = [];
  const has = (k) => val(k) !== "";
  const flag = (k, cond, why) => {
    if (has(k) && cond(val(k))) problems.push(`${k}: ${why}`);
  };

  flag("STRIPE_SECRET_KEY", (v) => !v.startsWith("sk_live_"), "must be a live key (sk_live_…) in production");
  flag("STRIPE_WEBHOOK_SECRET", (v) => !v.startsWith("whsec_"), "must be the endpoint's signing secret (whsec_…)");
  flag("STRIPE_PRICE_ID", (v) => !v.startsWith("price_"), "must be a Stripe Price id (price_…)");
  flag("STRIPE_PRICE_MONTHLY", (v) => !v.startsWith("price_"), "must be a Stripe Price id (price_…)");
  flag("NEXTAUTH_URL", (v) => v.replace(/\/+$/, "") !== siteUrl, `must be ${siteUrl}`);
  flag("NEXT_PUBLIC_SITE_URL", (v) => v.replace(/\/+$/, "") !== siteUrl, `must be ${siteUrl} or empty`);
  flag("AEO_DEV_BYPASS_AUTH", () => true, "must be empty in production (it skips sign-in)");
  flag("NEXTAUTH_SECRET", (v) => v.length < 32, "must be at least 32 characters");
  flag("NEXT_PUBLIC_GA_ID", (v) => !/^G-[A-Z0-9]+$/.test(v), "must be a GA4 measurement id (G-…)");
  flag("RESEND_FROM_EMAIL", (v) => !/@learnaeo\.com>?$/i.test(v), "must send from an @learnaeo.com address");
  flag("NURTURE_ENABLED", (v) => v === "true", "nurture email stays off at launch; leave it empty");

  return { missing, problems };
}

/** One readable block for a CLI or a failed build. */
export function formatEnvReport({ missing, problems }) {
  return [
    ...missing.map((k) => `missing: ${k}`),
    ...problems.map((p) => `wrong:   ${p}`),
  ].join("\n");
}

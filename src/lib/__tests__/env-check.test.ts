import { describe, it, expect } from "vitest";
import { CANONICAL_SITE_URL, REQUIRED_PRODUCTION_ENV, checkProductionEnv } from "../../../scripts/lib/env-check.mjs";
import { SITE as SITE_CONFIG } from "@/lib/site";

const SITE = "https://www.learnaeo.com";

const full: Record<string, string | undefined> = {
  NEXTAUTH_URL: SITE,
  NEXTAUTH_SECRET: "x".repeat(40),
  DATABASE_URL: "postgres://u:p@db.example/aeo",
  POSTGRES_URL: "postgres://u:p@pool.example/aeo",
  GOOGLE_CLIENT_ID: "id.apps.googleusercontent.com",
  GOOGLE_CLIENT_SECRET: "secret",
  STRIPE_SECRET_KEY: "sk_live_abc",
  STRIPE_WEBHOOK_SECRET: "whsec_abc",
  STRIPE_PRICE_ID: "price_life",
  STRIPE_PRICE_MONTHLY: "price_month",
  RESEND_API_KEY: "re_abc",
  RESEND_FROM_EMAIL: "Learn AEO <hello@learnaeo.com>",
  RESEND_AUDIENCE_ID: "aud_1",
  CRON_SECRET: "cron",
  ADMIN_EMAILS: "owner@example.com",
  NEXT_PUBLIC_GA_ID: "G-ABC123",
};

const check = (over: Record<string, string | undefined>) => checkProductionEnv({ ...full, ...over }, SITE);

describe("checkProductionEnv", () => {
  it("uses the same canonical URL as the site config", () => {
    expect(CANONICAL_SITE_URL).toBe(`https://${SITE_CONFIG.host}`);
  });

  it("passes a complete live configuration", () => {
    expect(checkProductionEnv(full, SITE)).toEqual({ missing: [], problems: [] });
  });

  it("requires exactly the launch variables", () => {
    expect(REQUIRED_PRODUCTION_ENV).toEqual([
      "NEXTAUTH_URL", "NEXTAUTH_SECRET", "DATABASE_URL", "POSTGRES_URL", "GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET",
      "STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET", "STRIPE_PRICE_ID", "STRIPE_PRICE_MONTHLY", "RESEND_API_KEY",
      "RESEND_FROM_EMAIL", "RESEND_AUDIENCE_ID", "CRON_SECRET", "ADMIN_EMAILS", "NEXT_PUBLIC_GA_ID",
    ]);
  });

  it("lists missing and blank variables", () => {
    expect(check({ STRIPE_WEBHOOK_SECRET: undefined }).missing).toEqual(["STRIPE_WEBHOOK_SECRET"]);
    expect(check({ CRON_SECRET: "   " }).missing).toEqual(["CRON_SECRET"]);
  });

  it.each([
    ["STRIPE_SECRET_KEY", { STRIPE_SECRET_KEY: "sk_test_abc" }],
    ["STRIPE_WEBHOOK_SECRET", { STRIPE_WEBHOOK_SECRET: "abc" }],
    ["STRIPE_PRICE_ID", { STRIPE_PRICE_ID: "prod_1" }],
    ["STRIPE_PRICE_MONTHLY", { STRIPE_PRICE_MONTHLY: "1000" }],
    ["NEXTAUTH_URL", { NEXTAUTH_URL: "https://learnaeo.vercel.app" }],
    ["NEXT_PUBLIC_SITE_URL", { NEXT_PUBLIC_SITE_URL: "https://learnaeo.com" }],
    ["AEO_DEV_BYPASS_AUTH", { AEO_DEV_BYPASS_AUTH: "1" }],
    ["NEXTAUTH_SECRET", { NEXTAUTH_SECRET: "short" }],
    ["NEXT_PUBLIC_GA_ID", { NEXT_PUBLIC_GA_ID: "UA-1234" }],
    ["RESEND_FROM_EMAIL", { RESEND_FROM_EMAIL: "hello@gmail.com" }],
    ["NURTURE_ENABLED", { NURTURE_ENABLED: "true" }],
  ])("flags a wrong %s", (name, over) => {
    const { missing, problems } = check(over);
    expect(missing).toEqual([]);
    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain(name);
  });

  it("accepts a bare from address and a matching NEXT_PUBLIC_SITE_URL", () => {
    expect(check({ RESEND_FROM_EMAIL: "hello@learnaeo.com", NEXT_PUBLIC_SITE_URL: SITE }).problems).toEqual([]);
  });
});

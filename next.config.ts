import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["lh3.googleusercontent.com"],
  },
};

// A Vercel production build with a missing or test-mode secret fails here, before it can go live
// (scripts/lib/env-check.mjs). Preview and local builds are never checked.
export default async function config(): Promise<NextConfig> {
  if (process.env.VERCEL_ENV === "production") {
    const { CANONICAL_SITE_URL, checkProductionEnv, formatEnvReport } = await import("./scripts/lib/env-check.mjs");
    const report = checkProductionEnv(process.env, CANONICAL_SITE_URL);
    if (report.missing.length || report.problems.length) {
      throw new Error(`Production environment is not ready:\n${formatEnvReport(report)}`);
    }
  }
  return nextConfig;
}

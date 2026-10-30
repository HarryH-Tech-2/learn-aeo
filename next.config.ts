import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "lh3.googleusercontent.com" }],
  },
};

// A Vercel production build with a missing or test-mode secret fails here, before it can go live
// (scripts/lib/env-check.mjs). With AEO_PRELAUNCH=1, missing settings only warn. Preview and local
// builds are never checked.
export default async function config(): Promise<NextConfig> {
  if (process.env.VERCEL_ENV === "production") {
    const { CANONICAL_SITE_URL, blockingIssues, checkProductionEnv, formatEnvReport } = await import(
      "./scripts/lib/env-check.mjs"
    );
    const report = checkProductionEnv(process.env, CANONICAL_SITE_URL);
    const blocking = blockingIssues(report, process.env);
    if (blocking.length) throw new Error(`Production environment is not ready:\n${blocking.join("\n")}`);
    if (report.missing.length || report.problems.length) {
      console.warn(`Pre-launch build, not ready for launch yet:\n${formatEnvReport(report)}`);
    }
  }
  return nextConfig;
}

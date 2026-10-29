#!/usr/bin/env node
/**
 * Check a production environment before (or after) deploying Learn AEO. Pull the Vercel
 * production env to a file, then:
 *
 *   node --env-file=<pulled env file> scripts/check-env.mjs
 *
 * Prints every missing or wrong variable and exits 1 if there are any. The same check runs inside
 * `next build` on Vercel production deploys (next.config.ts), so a bad env fails the deploy.
 */
import { CANONICAL_SITE_URL, checkProductionEnv, formatEnvReport } from "./lib/env-check.mjs";

const report = checkProductionEnv(process.env, CANONICAL_SITE_URL);
if (report.missing.length || report.problems.length) {
  console.error(formatEnvReport(report));
  process.exit(1);
}
console.log("Production environment looks complete.");

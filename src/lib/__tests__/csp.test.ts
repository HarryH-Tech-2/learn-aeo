// A Content-Security-Policy in report-only mode on every page (SEO audit 2026-10-30): browsers report what
// would be blocked without blocking it, so the policy can be tightened before it is enforced.
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

const vercel = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../../../vercel.json"), "utf8")) as {
  headers: { source: string; headers: { key: string; value: string }[] }[];
};

describe("CSP", () => {
  const all = vercel.headers.find((h) => h.source === "/(.*)")!;
  const csp = all.headers.find((h) => h.key === "Content-Security-Policy-Report-Only")?.value ?? "";

  it("is report-only and covers every page", () => {
    expect(csp).not.toBe("");
    expect(all.headers.some((h) => h.key === "Content-Security-Policy")).toBe(false);
  });

  it("allows what the site really loads: Google Analytics, Google avatars, Stripe and Google sign-in redirects", () => {
    expect(csp).toMatch(/script-src [^;]*https:\/\/www\.googletagmanager\.com/);
    expect(csp).toMatch(/connect-src [^;]*https:\/\/\*\.google-analytics\.com/);
    expect(csp).toMatch(/img-src [^;]*https:\/\/lh3\.googleusercontent\.com/);
    expect(csp).toMatch(/form-action [^;]*https:\/\/checkout\.stripe\.com/);
    expect(csp).toMatch(/frame-ancestors 'self'/);
    expect(csp).toMatch(/object-src 'none'/);
  });
});

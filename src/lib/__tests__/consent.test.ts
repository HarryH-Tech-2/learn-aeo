import { describe, expect, it } from "vitest";
import { analyticsAllowed, analyticsAllowedScript } from "../consent";

describe("analyticsAllowed", () => {
  it("runs everywhere once the visitor accepts", () => {
    expect(analyticsAllowed("all", "GB")).toBe(true);
    expect(analyticsAllowed("all", null)).toBe(true);
  });

  it("never runs after Essentials only", () => {
    expect(analyticsAllowed("essential", "US")).toBe(false);
    expect(analyticsAllowed("essential", "GB")).toBe(false);
  });

  it("waits for a yes in the UK, EU and EEA", () => {
    for (const cc of ["GB", "DE", "FR", "IE", "NO", "is"]) expect(analyticsAllowed(null, cc)).toBe(false);
  });

  it("runs by default elsewhere", () => {
    for (const cc of ["US", "CA", "AU", "IN", "CH"]) expect(analyticsAllowed(null, cc)).toBe(true);
  });

  it("treats an unknown country as opt-in", () => {
    expect(analyticsAllowed(null, null)).toBe(false);
  });
});

describe("analyticsAllowedScript", () => {
  function run(cookie: string): unknown {
    const win: Record<string, unknown> = {};
    new Function("window", "document", analyticsAllowedScript())(win, { cookie });
    return win.__lhAnalyticsAllowed;
  }

  it("reads the consent and country cookies in the browser", () => {
    expect(run("aeo_cc=US")).toBe(true);
    expect(run("aeo_cc=GB")).toBe(false);
    expect(run("foo=1; aeo_cc=GB; aeo_consent=all")).toBe(true);
    expect(run("aeo_consent=essential; aeo_cc=US")).toBe(false);
    expect(run("")).toBe(false);
  });
});

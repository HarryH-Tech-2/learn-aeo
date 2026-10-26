import { describe, expect, it } from "vitest";
import { checkStripeKey } from "../../../scripts/lib/stripe-key.mjs";

describe("scripts/lib/stripe-key.mjs", () => {
  it("accepts a test key", () => {
    expect(checkStripeKey("sk_test_123", [])).toEqual({ ok: true, mode: "test" });
  });

  it("refuses a live key unless --live is passed", () => {
    for (const key of ["sk_live_123", "rk_live_123"]) {
      expect(checkStripeKey(key, []).ok).toBe(false);
      expect((checkStripeKey(key, ["--dry"]) as { error?: string }).error).toMatch(/--live/);
      expect(checkStripeKey(key, ["--live"])).toEqual({ ok: true, mode: "LIVE" });
    }
  });

  it("refuses a missing key", () => {
    expect(checkStripeKey(undefined, ["--live"]).ok).toBe(false);
    expect(checkStripeKey("", []).ok).toBe(false);
  });
});

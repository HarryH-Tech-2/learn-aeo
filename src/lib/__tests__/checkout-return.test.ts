import { describe, expect, it } from "vitest";
import { cancelUrlFor, isBuyIntent, planIdFromCheckoutPath, safeReturnPath } from "../checkout-return";

describe("safeReturnPath", () => {
  it("keeps a same-site path with its query and hash", () => {
    expect(safeReturnPath("/dashboard")).toBe("/dashboard");
    expect(safeReturnPath("/lessons/royal-hall?step=3")).toBe("/lessons/royal-hall?step=3");
    expect(safeReturnPath("/#pricing")).toBe("/#pricing");
  });

  it("drops an old checkout= flag", () => {
    expect(safeReturnPath("/pricing?checkout=cancelled")).toBe("/pricing");
    expect(safeReturnPath("/dashboard?tab=journey&checkout=error")).toBe("/dashboard?tab=journey");
  });

  it("refuses anything off-site or odd", () => {
    for (const bad of [null, undefined, "", "pricing", "https://evil.com/", "//evil.com", "/\\evil.com", "/x\\y", "/a b", "javascript:alert(1)", "/x\"><script>"]) {
      expect(safeReturnPath(bad)).toBe("/pricing");
    }
  });

  it("never returns to a step on the way to Stripe", () => {
    for (const step of ["/checkout", "/checkout?plan=monthly", "/get-started?next=checkout", "/login", "/api/stripe/create-checkout"]) {
      expect(safeReturnPath(step)).toBe("/pricing");
    }
    expect(safeReturnPath("/checkout-faq")).toBe("/checkout-faq");
  });
});

describe("cancelUrlFor", () => {
  it("adds checkout=cancelled before any hash", () => {
    expect(cancelUrlFor("https://x.com", "/dashboard")).toBe("https://x.com/dashboard?checkout=cancelled");
    expect(cancelUrlFor("https://x.com", "/dashboard?tab=journey")).toBe("https://x.com/dashboard?tab=journey&checkout=cancelled");
    expect(cancelUrlFor("https://x.com", "/#pricing")).toBe("https://x.com/?checkout=cancelled#pricing");
    expect(cancelUrlFor("https://x.com", null)).toBe("https://x.com/pricing?checkout=cancelled");
  });
});

describe("isBuyIntent", () => {
  it("recognises every way of saying checkout", () => {
    expect(isBuyIntent("checkout")).toBe(true);
    expect(isBuyIntent("/checkout")).toBe(true);
    expect(isBuyIntent("/checkout?plan=monthly&from=%2Fpricing")).toBe(true);
  });

  it("leaves everything else as a free sign-up", () => {
    for (const other of [null, undefined, "", "/dashboard", "/checkout-faq", "/lessons/old-lesson-id"]) expect(isBuyIntent(other)).toBe(false);
  });
});

describe("planIdFromCheckoutPath", () => {
  it("reads the plan from a /checkout destination", () => {
    expect(planIdFromCheckoutPath("/checkout?plan=monthly&from=%2Fpricing")).toBe("monthly");
    expect(planIdFromCheckoutPath("/checkout")).toBeNull();
    expect(planIdFromCheckoutPath("/dashboard?plan=school")).toBeNull();
  });
});

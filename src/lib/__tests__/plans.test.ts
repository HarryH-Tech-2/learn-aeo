import { describe, it, expect } from "vitest";
import { PLANS, PLAN_IDS, isPlanId, planById, planAmount, planMinor, formatPlanPrice, planPeriodLabel } from "@/lib/plans";
import { PRICES, discounted, formatPrice } from "@/lib/pricing";
import { monthlyActive, MONTHLY_GRACE_DAYS } from "@/lib/subscription";

describe("plans", () => {
  it("two plans: $100 / £80 lifetime and $10 / £8 monthly", () => {
    expect(PLAN_IDS).toEqual(["lifetime", "monthly"]);
    expect(PLANS.lifetime.usd).toBe(100);
    expect(PLANS.lifetime.gbp).toBe(80);
    expect(PLANS.monthly.usd).toBe(10);
    expect(PLANS.monthly.gbp).toBe(8);
    expect(planMinor(PLANS.lifetime, "USD")).toBe(10000);
    expect(formatPlanPrice(PLANS.lifetime, "USD")).toBe("$100"); // Review Focus 2
    expect(formatPlanPrice(PLANS.monthly, "GBP")).toBe("£8");
    expect(formatPrice("USD")).toBe("$100");
    expect(formatPrice("USD", 66.99)).toBe("$66.99");
    expect(discounted("USD", 33)).toBe(66.99); // Review Focus 3
    expect(discounted("GBP", 33)).toBe(52.99);
    expect(isPlanId("classroom")).toBe(false);
  });

  it("lifetime is featured and matches the anchor price in pricing.ts", () => {
    expect(PLANS.lifetime.featured).toBe(true);
    expect(PLANS.lifetime.usd).toBe(PRICES.USD.amount);
    expect(PLANS.lifetime.gbp).toBe(PRICES.GBP.amount);
    expect(planMinor(PLANS.lifetime, "USD")).toBe(PRICES.USD.minor);
    expect(planMinor(PLANS.lifetime, "GBP")).toBe(PRICES.GBP.minor);
    expect(PRICES.USD).toEqual({ amount: 100, symbol: "$", minor: 10000 });
    expect(PRICES.GBP).toEqual({ amount: 80, symbol: "£", minor: 8000 });
  });

  it("modes, intervals and Stripe price env keys", () => {
    expect(PLANS.lifetime.mode).toBe("payment");
    expect(PLANS.lifetime.envKey).toBe("STRIPE_PRICE_ID");
    expect(PLANS.monthly.mode).toBe("subscription");
    expect(PLANS.monthly.interval).toBe("month");
    expect(PLANS.monthly.envKey).toBe("STRIPE_PRICE_MONTHLY");
    expect(PLANS.monthly.name).toBe("Monthly");
  });

  it("formats prices per currency", () => {
    expect(formatPlanPrice(PLANS.lifetime, "GBP")).toBe("£80");
    expect(formatPlanPrice(PLANS.monthly, "USD")).toBe("$10");
    expect(planAmount(PLANS.monthly, "USD")).toBe(10);
    expect(planPeriodLabel(PLANS.lifetime)).toBe("one payment");
    expect(planPeriodLabel(PLANS.monthly)).toBe("per month");
  });

  it("validates ids", () => {
    expect(isPlanId("monthly")).toBe(true);
    expect(isPlanId("gold")).toBe(false);
    expect(isPlanId("school")).toBe(false);
    expect(planById("monthly")?.name).toBe("Monthly");
    expect(planById("classroom")).toBeUndefined();
    expect(planById(null)).toBeUndefined();
  });
});

describe("monthly rules", () => {
  it("runs to the period end plus grace", () => {
    const now = new Date("2026-09-08T12:00:00Z");
    const day = 86_400_000;
    expect(monthlyActive({ active: true, plan: "monthly", currentPeriodEnd: null }, now)).toBe(true);
    expect(monthlyActive({ active: true, plan: "monthly", currentPeriodEnd: new Date(now.getTime() + day) }, now)).toBe(true);
    expect(monthlyActive({ active: true, plan: "monthly", currentPeriodEnd: new Date(now.getTime() - (MONTHLY_GRACE_DAYS - 1) * day) }, now)).toBe(true);
    expect(monthlyActive({ active: true, plan: "monthly", currentPeriodEnd: new Date(now.getTime() - (MONTHLY_GRACE_DAYS + 1) * day) }, now)).toBe(false);
    expect(monthlyActive({ active: false, plan: "monthly", currentPeriodEnd: new Date(now.getTime() + day) }, now)).toBe(false);
    expect(monthlyActive({ active: true, plan: "lifetime", currentPeriodEnd: null }, now)).toBe(false);
  });
});

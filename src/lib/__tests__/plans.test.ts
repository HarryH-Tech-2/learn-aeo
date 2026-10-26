import { describe, it, expect } from "vitest";
import { PLANS, PLAN_IDS, isPlanId, planById, planAmount, planMinor, formatPlanPrice, planPeriodLabel, isLicencePlan } from "@/lib/plans";
import { PRICES, discounted } from "@/lib/pricing";
import { monthlyActive, MONTHLY_GRACE_DAYS } from "@/lib/subscription";

describe("plans", () => {
  it("four plans, lifetime featured and the anchor price matches pricing.ts", () => {
    expect(PLAN_IDS).toEqual(["lifetime", "monthly", "classroom", "school"]);
    expect(PLANS.lifetime.featured).toBe(true);
    expect(PLANS.lifetime.usd).toBe(PRICES.USD.amount);
    expect(PLANS.lifetime.gbp).toBe(PRICES.GBP.amount);
    expect(planMinor(PLANS.lifetime, "USD")).toBe(PRICES.USD.minor);
    expect(planMinor(PLANS.lifetime, "GBP")).toBe(PRICES.GBP.minor);
  });

  it("modes, intervals and seats", () => {
    expect(PLANS.lifetime.mode).toBe("payment");
    expect(PLANS.monthly.interval).toBe("month");
    expect(PLANS.classroom.interval).toBe("year");
    expect(PLANS.classroom.seats).toBe(30);
    expect(PLANS.school.seats).toBe(0);
    expect(isLicencePlan("classroom")).toBe(true);
    expect(isLicencePlan(PLANS.monthly)).toBe(false);
  });

  it("formats prices per currency", () => {
    expect(formatPlanPrice(PLANS.lifetime, "USD")).toBe("$19.99");
    expect(formatPlanPrice(PLANS.lifetime, "GBP")).toBe("£15.99");
    expect(formatPlanPrice(PLANS.classroom, "GBP")).toBe("£24.50");
    expect(planAmount(PLANS.school, "USD")).toBe(124.5);
    expect(planPeriodLabel(PLANS.lifetime)).toBe("one payment");
    expect(planPeriodLabel(PLANS.monthly)).toBe("per month");
    expect(planPeriodLabel(PLANS.school)).toBe("per year");
  });

  it("validates ids", () => {
    expect(isPlanId("monthly")).toBe(true);
    expect(isPlanId("gold")).toBe(false);
    expect(planById("school")?.name).toBe("School");
    expect(planById(null)).toBeUndefined();
  });

  it("offer discount still lands on a .99", () => {
    expect(discounted("USD", 33)).toBe(12.99);
    expect(discounted("GBP", 33)).toBe(9.99);
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

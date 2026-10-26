import { describe, it, expect } from "vitest";
import { COUNTRY_TIER, PPP_PERCENT, PPP_COUPON_ID, pppFor, parityPrice, formatParity, flagEmoji, countryName, pppBeatsOffer, requestCountry } from "@/lib/ppp";
import { PLANS } from "@/lib/plans";

describe("ppp tiers", () => {
  it("maps countries to tiers, case-insensitively, and unknowns to full price", () => {
    expect(pppFor("IN")).toMatchObject({ tier: "D", percentOff: 65, couponId: "PPP_TIER_D" });
    expect(pppFor("eg")?.tier).toBe("D");
    expect(pppFor("BR")?.tier).toBe("C");
    expect(pppFor("PL")?.tier).toBe("B");
    expect(pppFor("US")).toBeNull();
    expect(pppFor("GB")).toBeNull();
    expect(pppFor("DE")).toBeNull();
    expect(pppFor(null)).toBeNull();
    expect(pppFor("")).toBeNull();
  });

  it("never lists a country Stripe cannot take payments from", () => {
    for (const cc of ["RU", "IR", "KP", "SY", "CU", "BY"]) expect(COUNTRY_TIER[cc]).toBeUndefined();
  });

  it("every tier has a percentage and a coupon id", () => {
    for (const t of ["B", "C", "D"] as const) {
      expect(PPP_PERCENT[t]).toBeGreaterThan(0);
      expect(PPP_COUPON_ID[t]).toMatch(/^PPP_TIER_[BCD]$/);
    }
    expect(PPP_PERCENT.B).toBeLessThan(PPP_PERCENT.C);
    expect(PPP_PERCENT.C).toBeLessThan(PPP_PERCENT.D);
  });

  it("all listed codes are two upper-case letters", () => {
    for (const cc of Object.keys(COUNTRY_TIER)) expect(cc).toMatch(/^[A-Z]{2}$/);
  });
});

describe("parity price", () => {
  it("matches Stripe's coupon arithmetic (verified against sandbox sessions)", () => {
    expect(parityPrice(19.99, 65)).toBe(7);
    expect(parityPrice(59, 50)).toBe(29.5);
    expect(parityPrice(4.99, 30)).toBe(3.49);
    expect(parityPrice(19.99, 30)).toBe(13.99);
    expect(parityPrice(249, 65)).toBe(87.15);
    expect(parityPrice(0.01, 65)).toBe(0.01);
    expect(formatParity(7)).toBe("7");
    expect(formatParity(29.5)).toBe("29.50");
    expect(formatParity(3.49)).toBe("3.49");
  });

  it("is below the full price for every plan and tier", () => {
    for (const p of Object.values(PLANS)) {
      for (const pct of Object.values(PPP_PERCENT)) {
        expect(parityPrice(p.usd, pct)).toBeLessThan(p.usd);
        expect(parityPrice(p.gbp, pct)).toBeLessThan(p.gbp);
      }
    }
  });
});

describe("display helpers", () => {
  it("flag and name", () => {
    expect(flagEmoji("EG")).toBe("🇪🇬");
    expect(flagEmoji("xx1")).toBe("");
    expect(countryName("EG")).toMatch(/Egypt/);
  });
});

describe("ppp against a time-limited offer", () => {
  it("beats the 33% offer in the 50% and 65% tiers only", () => {
    expect(pppBeatsOffer("IN", 33)).toBe(true);
    expect(pppBeatsOffer("BR", 33)).toBe(true);
    expect(pppBeatsOffer("PL", 33)).toBe(false); // 30% off: the offer is the better price
    expect(pppBeatsOffer("US", 33)).toBe(false);
    expect(pppBeatsOffer(null, 33)).toBe(false);
  });

  it("reads the country from the cookie, then Vercel's header", () => {
    expect(requestCountry(new Request("https://x", { headers: { cookie: "a=1; lh_cc=IN; b=2" } }))).toBe("IN");
    expect(requestCountry(new Request("https://x", { headers: { cookie: "lh_cc=EG", "x-vercel-ip-country": "US" } }))).toBe("EG");
    expect(requestCountry(new Request("https://x", { headers: { "x-vercel-ip-country": "BR" } }))).toBe("BR");
    expect(requestCountry(new Request("https://x"))).toBeNull();
  });
});

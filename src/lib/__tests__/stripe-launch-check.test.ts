import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { WEBHOOK_EVENTS, checkStripeLaunch } from "../../../scripts/lib/stripe-launch-check.mjs";

const SITE = "https://www.learnaeo.com";
const LIFETIME = "prod_lifetime";

const ready = () => ({
  siteUrl: SITE,
  descriptor: "LEARNAEO",
  lifetimeProductId: LIFETIME,
  coupons: [
    { id: "AEO_PPP_B", percent_off: 30, duration: "forever" },
    { id: "AEO_PPP_C", percent_off: 50, duration: "forever" },
    { id: "AEO_PPP_D", percent_off: 65, duration: "forever" },
    { id: "NEXT-DISTRICT-33", percent_off: 33, duration: "once", applies_to: { products: [LIFETIME] } },
  ],
  webhooks: [{ url: `${SITE}/api/webhooks/stripe`, status: "enabled", enabled_events: [...WEBHOOK_EVENTS] }],
});

describe("WEBHOOK_EVENTS", () => {
  it("lists the 9 events the webhook route handles", () => {
    expect(WEBHOOK_EVENTS).toEqual([
      "checkout.session.completed", "checkout.session.async_payment_succeeded", "checkout.session.async_payment_failed",
      "checkout.session.expired", "customer.subscription.updated", "customer.subscription.deleted", "charge.refunded",
      "charge.dispute.created", "charge.dispute.closed",
    ]);
  });

  it("covers every event the route switches on", () => {
    const route = readFileSync(join(process.cwd(), "src/app/api/webhooks/stripe/route.ts"), "utf8");
    const handled = [...route.matchAll(/case "([a-z_.]+)":/g)].map((m) => m[1]);
    expect(handled.length).toBeGreaterThan(0);
    for (const e of handled) expect(WEBHOOK_EVENTS, e).toContain(e);
  });
});

describe("checkStripeLaunch", () => {
  it("passes a ready account", () => {
    expect(checkStripeLaunch(ready())).toEqual([]);
  });

  it("needs the LEARNAEO statement descriptor", () => {
    const p = checkStripeLaunch({ ...ready(), descriptor: "LEARN AEO" });
    expect(p).toHaveLength(1);
    expect(p[0]).toContain("LEARNAEO");
  });

  it("needs the completion offer limited to the Lifetime product", () => {
    for (const applies_to of [undefined, { products: ["prod_monthly"] }, { products: [LIFETIME, "prod_monthly"] }]) {
      const s = ready();
      s.coupons[3] = { ...s.coupons[3], applies_to } as (typeof s.coupons)[number];
      const p = checkStripeLaunch(s);
      expect(p).toHaveLength(1);
      expect(p[0]).toMatch(/NEXT-DISTRICT-33.*Lifetime/);
    }
  });

  it("names a missing or mis-set coupon", () => {
    const s = ready();
    s.coupons = s.coupons.filter((c) => c.id !== "AEO_PPP_B").map((c) => (c.id === "AEO_PPP_C" ? { ...c, percent_off: 40 } : c));
    const p = checkStripeLaunch(s);
    expect(p).toHaveLength(2);
    expect(p.join("\n")).toContain("AEO_PPP_B");
    expect(p.join("\n")).toContain("AEO_PPP_C");
  });

  it("needs an enabled webhook endpoint at the site with every handled event", () => {
    expect(checkStripeLaunch({ ...ready(), webhooks: [] })[0]).toContain(`${SITE}/api/webhooks/stripe`);
    expect(checkStripeLaunch({ ...ready(), webhooks: [{ ...ready().webhooks[0], status: "disabled" }] })[0]).toMatch(/disabled/);
    const missing = checkStripeLaunch({
      ...ready(),
      webhooks: [{ ...ready().webhooks[0], enabled_events: WEBHOOK_EVENTS.filter((e: string) => e !== "charge.refunded") }],
    });
    expect(missing).toHaveLength(1);
    expect(missing[0]).toContain("charge.refunded");
    expect(checkStripeLaunch({ ...ready(), webhooks: [{ ...ready().webhooks[0], enabled_events: ["*"] }] })).toEqual([]);
  });

  it("reports a missing Lifetime product", () => {
    expect(checkStripeLaunch({ ...ready(), lifetimeProductId: null }).join("\n")).toMatch(/Lifetime product/);
  });
});

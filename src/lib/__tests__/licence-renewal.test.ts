import { describe, expect, it } from "vitest";
import { renderRenewalEmail, renewalDue, renewalKey } from "@/lib/licence-renewal";
import { renewedPeriodEnd } from "@/lib/licence-invoice";

const now = new Date("2026-10-16T12:00:00Z");
const day = 86_400_000;
const base = { licenceId: "l1", status: "active", stripeSubscriptionId: null, stripeCustomerId: "cus_1" };

describe("licence renewal reminder", () => {
  it("is due only for invoiced licences ending within 30 days", () => {
    expect(renewalDue({ ...base, currentPeriodEnd: new Date(now.getTime() + 29 * day) }, now)).toBe(true);
    expect(renewalDue({ ...base, currentPeriodEnd: new Date(now.getTime() + 31 * day) }, now)).toBe(false);
    expect(renewalDue({ ...base, currentPeriodEnd: new Date(now.getTime() - day) }, now)).toBe(false);
    expect(renewalDue({ ...base, stripeSubscriptionId: "sub_1", currentPeriodEnd: new Date(now.getTime() + 5 * day) }, now)).toBe(false);
    expect(renewalDue({ ...base, status: "trial", currentPeriodEnd: new Date(now.getTime() + 5 * day) }, now)).toBe(false);
  });

  it("keys each term separately", () => {
    expect(renewalKey("l1", new Date("2027-10-16T00:00:00Z"))).not.toBe(renewalKey("l1", new Date("2028-10-15T00:00:00Z")));
  });

  it("names the date, the code and both ways to renew", () => {
    const e = renderRenewalEmail({ name: "Jo Bloggs", kind: "school", schoolName: "Hill Primary", code: "ABC123", periodEnd: new Date("2027-10-16T12:00:00Z"), baseUrl: "https://x.test/", licenceId: "lic123abc" });
    expect(e.subject).toContain("16 October 2027");
    expect(e.text).toContain("Hi Jo,");
    expect(e.text).not.toContain("by card");
    expect(e.text).toContain("ABC123");
    expect(e.text).toContain("https://x.test/teachers/licence?invoice=1&plan=school&renew=lic123abc#invoice");
  });

  it("renews from the old end if it is still ahead, else from today", () => {
    const ahead = new Date(now.getTime() + 20 * day);
    expect(renewedPeriodEnd(ahead, now).getTime()).toBe(ahead.getTime() + 365 * day);
    expect(renewedPeriodEnd(new Date(now.getTime() - 3 * day), now).getTime()).toBe(now.getTime() + 365 * day);
    expect(renewedPeriodEnd(null, now).getTime()).toBe(now.getTime() + 365 * day);
  });
});

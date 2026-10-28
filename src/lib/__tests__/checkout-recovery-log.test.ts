import { describe, it, expect, vi, beforeEach } from "vitest";

const mockRecordLead = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));
vi.mock("@/lib/leads", () => ({ recordLead: mockRecordLead, normaliseEmail: (e: string) => e.trim().toLowerCase() }));

import { checkoutLogSource, parseCheckoutLogSource, recordCheckoutLog, summarizeCheckoutLog } from "../checkout-recovery-log";

describe("checkout recovery log", () => {
  beforeEach(() => vi.clearAllMocks());

  it("round-trips sources, including a skip reason", () => {
    expect(checkoutLogSource("recovery-sent", "cs_live_1")).toBe("checkout-recovery-sent:cs_live_1");
    expect(checkoutLogSource("skipped", "cs_live_1", "owns plan!")).toBe("checkout-skipped:owns-plan-:cs_live_1");
    expect(parseCheckoutLogSource("checkout-skipped:cooldown:cs_live_1")).toEqual({ outcome: "skipped", reason: "cooldown", sessionId: "cs_live_1" });
    expect(parseCheckoutLogSource("checkout-reminder-sent:cs_live_1")).toEqual({ outcome: "reminder-sent", reason: null, sessionId: "cs_live_1" });
    expect(parseCheckoutLogSource("newsletter")).toBeNull();
    expect(parseCheckoutLogSource("checkout-skipped:cs_live_1")).toBeNull();
  });

  it("records by email, and only logs a session with none", async () => {
    await recordCheckoutLog({ email: "A@x.com", sessionId: "cs_1", outcome: "expired" });
    expect(mockRecordLead).toHaveBeenCalledWith({ email: "A@x.com", source: "checkout-expired:cs_1", name: null });
    await recordCheckoutLog({ email: null, sessionId: "cs_2", outcome: "skipped", reason: "no-email" });
    expect(mockRecordLead).toHaveBeenCalledTimes(1);
  });

  it("counts sessions, people and later purchases per outcome", () => {
    const d = (day: number) => new Date(Date.UTC(2026, 9, day));
    const rows = [
      { email: "a@x.com", source: "checkout-expired:cs_1", createdAt: d(1) },
      { email: "a@x.com", source: "checkout-recovery-sent:cs_1", createdAt: d(1) },
      { email: "b@x.com", source: "checkout-expired:cs_2", createdAt: d(2) },
      { email: "b@x.com", source: "checkout-reminder-sent:cs_2", createdAt: d(2) },
      { email: "b@x.com", source: "checkout-expired:cs_3", createdAt: d(3) },
      { email: "b@x.com", source: "checkout-skipped:cooldown:cs_3", createdAt: d(3) },
      { email: "c@x.com", source: "newsletter", createdAt: d(1) },
    ];
    // a bought after their email; b bought before theirs, so it does not count
    const purchases = [
      { email: "A@x.com", at: d(2) },
      { email: "b@x.com", at: d(1) },
    ];
    const s = summarizeCheckoutLog(rows, purchases);
    const o = Object.fromEntries(s.outcomes.map((x) => [x.outcome, x]));
    expect(o.expired).toEqual({ outcome: "expired", sessions: 3, people: 2, laterPurchased: 1 });
    expect(o["recovery-sent"].laterPurchased).toBe(1);
    expect(o["reminder-sent"]).toEqual({ outcome: "reminder-sent", sessions: 1, people: 1, laterPurchased: 0 });
    expect(o["recovery-resent"].sessions).toBe(0);
    expect(s.skippedReasons).toEqual([{ reason: "cooldown", sessions: 1 }]);
    expect(s.firstAt).toEqual(d(1));
  });
});

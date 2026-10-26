import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next-auth", () => ({ getServerSession: vi.fn() }));
vi.mock("@/lib/auth", () => ({ authOptions: {} }));
vi.mock("@/lib/subscription", () => ({ checkSubscription: vi.fn() }));
vi.mock("@/lib/offers", () => ({ grantOffer: vi.fn(), OFFER_PERCENT_OFF: 33 }));

import { POST } from "@/app/api/progress/section/route";
import { getServerSession } from "next-auth";
import { checkSubscription } from "@/lib/subscription";
import { grantOffer } from "@/lib/offers";

const session = vi.mocked(getServerSession);
const sub = vi.mocked(checkSubscription);
const grant = vi.mocked(grantOffer);

function post(body: unknown) {
  return POST(new Request("http://localhost:3000/api/progress/section", { method: "POST", body: JSON.stringify(body) }));
}

describe("POST /api/progress/section", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    session.mockResolvedValue({ user: { id: "u1", email: "a@example.com" } } as never);
  });

  it("needs a session", async () => {
    session.mockResolvedValue(null);
    expect((await post({ lessonId: "expedition-begins", section: 1 })).status).toBe(401);
  });

  it("rejects lessons without sections and sections out of range", async () => {
    expect((await post({ lessonId: "outer-courtyard", section: 1 })).status).toBe(400);
    expect((await post({ lessonId: "expedition-begins", section: 4 })).status).toBe(400);
    expect((await post({ lessonId: "expedition-begins", section: "1" })).status).toBe(400);
    expect(grant).not.toHaveBeenCalled();
  });

  it("opens the discount for a free learner", async () => {
    sub.mockResolvedValue({ active: false } as never);
    grant.mockResolvedValue({ code: "AEO-ABC234", expiresAt: new Date("2026-09-18T00:00:00Z"), source: "section-complete", percentOff: 33 });
    const res = await post({ lessonId: "expedition-begins", section: 1 });
    expect(grant).toHaveBeenCalledWith("a@example.com", "section-complete");
    expect(await res.json()).toEqual({
      ok: true,
      paid: false,
      freeUnlock: false,
      offer: { code: "AEO-ABC234", expiresAt: "2026-09-18T00:00:00.000Z", percentOff: 33, source: "section-complete" },
    });
  });

  it("opens no discount where the visitor's purchasing-power price is already lower", async () => {
    sub.mockResolvedValue({ active: false } as never);
    const req = new Request("http://localhost:3000/api/progress/section", { method: "POST", headers: { cookie: "aeo_cc=IN" }, body: JSON.stringify({ lessonId: "expedition-begins", section: 1 }) });
    const res = await POST(req);
    expect(grant).not.toHaveBeenCalled();
    expect(await res.json()).toEqual({ ok: true, paid: false, freeUnlock: false, offer: null });
  });

  it("never pitches a paying learner", async () => {
    sub.mockResolvedValue({ active: true } as never);
    const res = await post({ lessonId: "expedition-begins", section: 2 });
    expect(grant).not.toHaveBeenCalled();
    expect(await res.json()).toEqual({ ok: true, paid: true, freeUnlock: false, offer: null });
  });

  it("tells the free-unlock group apart, with no discount", async () => {
    sub.mockResolvedValue({ active: true, via: "free-unlock" } as never);
    const res = await post({ lessonId: "expedition-begins", section: 1 });
    expect(grant).not.toHaveBeenCalled();
    expect(await res.json()).toEqual({ ok: true, paid: true, freeUnlock: true, offer: null });
  });

  it("still answers when Stripe is down, so the screen shows full price", async () => {
    sub.mockResolvedValue({ active: false } as never);
    grant.mockRejectedValue(new Error("stripe down"));
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const res = await post({ lessonId: "expedition-begins", section: 1 });
    expect(await res.json()).toEqual({ ok: true, paid: false, freeUnlock: false, offer: null });
    spy.mockRestore();
  });
});

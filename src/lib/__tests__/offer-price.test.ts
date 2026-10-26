import { describe, expect, it } from "vitest";
import { offerEndsLabel, usableOffer } from "../offer-price";

const NOW = Date.parse("2026-10-15T12:00:00Z");
const offer = { percentOff: 33, expiresAt: "2026-10-16T12:00:00Z", code: "SCRIBE-X" };

describe("usableOffer", () => {
  it("uses a live offer when there is no parity discount", () => {
    expect(usableOffer(offer, null, NOW)).toBe(offer);
  });

  it("drops an expired offer", () => {
    expect(usableOffer({ ...offer, expiresAt: "2026-10-15T11:59:59Z" }, null, NOW)).toBeNull();
  });

  it("drops an offer no larger than the parity discount", () => {
    expect(usableOffer(offer, 33, NOW)).toBeNull();
    expect(usableOffer(offer, 50, NOW)).toBeNull();
  });

  it("keeps an offer larger than the parity discount", () => {
    expect(usableOffer(offer, 30, NOW)).toBe(offer);
  });

  it("handles no offer", () => {
    expect(usableOffer(null, null, NOW)).toBeNull();
  });
});

describe("offerEndsLabel", () => {
  const opts = { locale: "en-GB", timeZone: "UTC" };
  const now = new Date("2026-10-20T09:00:00Z");

  it("says today or tomorrow when it can", () => {
    expect(offerEndsLabel("2026-10-20T14:05:00Z", now, opts)).toBe("today at 14:05");
    expect(offerEndsLabel("2026-10-21T09:00:00Z", now, opts)).toBe("tomorrow at 9:00");
  });

  it("names the day further out (a 60-hour offer)", () => {
    expect(offerEndsLabel(new Date(now.getTime() + 60 * 3_600_000), now, opts)).toBe("Thu 22 Oct at 21:00");
  });

  it("uses the viewer's time zone for the day boundary", () => {
    // 23:30 UTC on the 20th is already the 21st in Tokyo
    expect(offerEndsLabel("2026-10-20T23:30:00Z", now, { locale: "en-GB", timeZone: "Asia/Tokyo" })).toBe("tomorrow at 8:30");
  });
});

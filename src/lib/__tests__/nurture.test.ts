import { describe, it, expect } from "vitest";
import { nextDueStep, daysSince, NURTURE_GRACE_DAYS, type NurtureSnapshot } from "@/lib/nurture";

const DAY = 86_400_000;
const start = new Date("2026-09-09T19:00:00Z");
const at = (days: number) => new Date(start.getTime() + days * DAY + 3_600_000); // an hour into the day

function snap(over: Partial<NurtureSnapshot> = {}): NurtureSnapshot {
  return {
    id: "u1",
    email: "learner@example.com",
    name: "Nancy",
    nurtureStartedAt: start,
    emailUnsubscribedAt: null,
    hasAccess: false,
    freeUnlock: false,
    lesson1Completed: false,
    lesson1Started: false,
    sentKeys: [],
    offer: null,
    ...over,
  };
}

describe("daysSince", () => {
  it("counts whole days", () => {
    expect(daysSince(start, at(0))).toBe(0);
    expect(daysSince(start, at(1))).toBe(1);
    expect(daysSince(start, at(5))).toBe(5);
  });
});

describe("nextDueStep", () => {
  it("sends the welcome on day 0", () => {
    expect(nextDueStep(snap(), at(0))?.key).toBe("welcome");
  });

  it("never sends a step twice", () => {
    expect(nextDueStep(snap({ sentKeys: ["welcome"] }), at(0))).toBeNull();
  });

  it("sends only one step per run even when several are overdue", () => {
    expect(nextDueStep(snap(), at(1))?.key).toBe("welcome");
  });

  it("branches day 1 on whether lesson 1 is finished", () => {
    expect(nextDueStep(snap({ sentKeys: ["welcome"] }), at(1))?.key).toBe("door-sealed");
    expect(nextDueStep(snap({ sentKeys: ["welcome"], lesson1Completed: true }), at(1))?.key).toBe("next-door");
  });

  it("sends door-sealed on day 1 whether or not they have answered anything yet", () => {
    for (const lesson1Started of [false, true]) {
      expect(nextDueStep(snap({ sentKeys: ["welcome"], lesson1Started }), at(1))?.key).toBe("door-sealed");
    }
  });

  it("does not send the other day-1 branch later", () => {
    const u = snap({ sentKeys: ["welcome", "door-sealed"], lesson1Completed: true });
    expect(nextDueStep(u, at(2))).toBeNull();
    expect(nextDueStep(u, at(3))?.key).toBe("free-stuff");
  });

  it("skips a step once its grace window has passed", () => {
    // Enrolled 4 days ago with nothing sent: welcome and day-1 are stale, day-3 is still in grace.
    expect(nextDueStep(snap(), at(NURTURE_GRACE_DAYS + 2))?.key).toBe("free-stuff");
  });

  it("offers on day 5 only when no offer is live, then reminds on day 7", () => {
    const sent = ["welcome", "door-sealed", "free-stuff"];
    expect(nextDueStep(snap({ sentKeys: sent }), at(5))?.key).toBe("offer");
    const live = { expiresAt: at(6), source: "lesson-complete" };
    expect(nextDueStep(snap({ sentKeys: sent, offer: live }), at(5))).toBeNull();

    const nurtureOffer = { expiresAt: new Date(at(7).getTime() + 12 * 3_600_000), source: "nurture" };
    expect(nextDueStep(snap({ sentKeys: [...sent, "offer"], offer: nurtureOffer }), at(7))?.key).toBe("offer-expires");
    expect(nextDueStep(snap({ sentKeys: [...sent, "offer"], offer: null }), at(7))).toBeNull();
  });

  it("stops for buyers and for people who unsubscribed", () => {
    expect(nextDueStep(snap({ hasAccess: true }), at(0))).toBeNull();
    expect(nextDueStep(snap({ emailUnsubscribedAt: at(0) }), at(1))).toBeNull();
  });

  it("stops once the sequence is over", () => {
    expect(nextDueStep(snap({ sentKeys: ["welcome", "door-sealed", "free-stuff", "offer", "offer-expires"] }), at(20))).toBeNull();
  });
});

describe("nextDueStep — free-unlock group", () => {
  it("gets the coffee email on day 5 instead of the offer", () => {
    const u = snap({ freeUnlock: true, sentKeys: ["welcome", "door-sealed", "free-stuff"] });
    expect(nextDueStep(u, at(5))?.key).toBe("coffee");
  });

  it("never gets the offer or offer-expires steps", () => {
    const u = snap({ freeUnlock: true, sentKeys: ["welcome", "door-sealed", "free-stuff", "coffee"], offer: { expiresAt: at(9), source: "nurture" } });
    expect(nextDueStep(u, at(7))).toBeNull();
  });

  it("the paid group still gets the offer, not the coffee email", () => {
    const u = snap({ sentKeys: ["welcome", "door-sealed", "free-stuff"] });
    expect(nextDueStep(u, at(5))?.key).toBe("offer");
  });
});

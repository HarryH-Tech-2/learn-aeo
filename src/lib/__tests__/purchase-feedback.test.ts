import { describe, it, expect } from "vitest";
import {
  FEEDBACK_DAY,
  FEEDBACK_LAST_DAY,
  PURCHASE_FEEDBACK_KEY,
  feedbackDue,
  feedbackPlanOf,
  renderFeedbackEmail,
  type FeedbackCandidate,
} from "@/lib/purchase-feedback";

const DAY = 86_400_000;
const NOW = new Date("2026-10-16T14:00:00Z");
const daysAgo = (d: number) => new Date(NOW.getTime() - d * DAY);

function buyer(over: Partial<FeedbackCandidate> = {}, sub: Partial<NonNullable<FeedbackCandidate["subscription"]>> = {}): FeedbackCandidate {
  return {
    userId: "u1",
    email: "b@example.com",
    name: "Ana Lopez",
    emailUnsubscribedAt: null,
    lifetimeStatus: true,
    subscription: { plan: "lifetime", active: true, trial: false, activatedAt: daysAgo(6), ...sub },
    sentKeys: [],
    ...over,
  };
}

describe("feedbackDue", () => {
  it("is due for a lifetime buyer between day 5 and day 14", () => {
    expect(feedbackDue(buyer({}, { activatedAt: daysAgo(FEEDBACK_DAY) }), NOW)).toBe("lifetime");
    expect(feedbackDue(buyer({}, { activatedAt: daysAgo(9) }), NOW)).toBe("lifetime");
    expect(feedbackDue(buyer({}, { activatedAt: daysAgo(FEEDBACK_LAST_DAY) }), NOW)).toBe("lifetime");
  });

  it("waits until day 5", () => {
    expect(feedbackDue(buyer({}, { activatedAt: daysAgo(4.9) }), NOW)).toBeNull();
  });

  it("leaves purchases older than the window alone (no blast to old customers)", () => {
    expect(feedbackDue(buyer({}, { activatedAt: daysAgo(FEEDBACK_LAST_DAY + 0.1) }), NOW)).toBeNull();
    expect(feedbackDue(buyer({}, { activatedAt: daysAgo(200) }), NOW)).toBeNull();
  });

  it("sends at most once", () => {
    expect(feedbackDue(buyer({ sentKeys: ["welcome", PURCHASE_FEEDBACK_KEY] }), NOW)).toBeNull();
    expect(feedbackDue(buyer({ sentKeys: ["welcome", "day-1"] }), NOW)).toBe("lifetime");
  });

  it("skips unsubscribed users and users with no email", () => {
    expect(feedbackDue(buyer({ emailUnsubscribedAt: daysAgo(1) }), NOW)).toBeNull();
    expect(feedbackDue(buyer({ email: null }), NOW)).toBeNull();
  });

  it("words it for monthly buyers while the pass is active", () => {
    expect(feedbackDue(buyer({ lifetimeStatus: false }, { plan: "monthly" }), NOW)).toBe("monthly");
    expect(feedbackDue(buyer({ lifetimeStatus: false }, { plan: "monthly", active: false }), NOW)).toBeNull();
  });

  it("skips trials, licence-only buyers (no subscription row) and rows with no purchase date", () => {
    expect(feedbackDue(buyer({}, { trial: true }), NOW)).toBeNull();
    expect(feedbackDue(buyer({ subscription: null, lifetimeStatus: false }), NOW)).toBeNull();
    expect(feedbackDue(buyer({}, { activatedAt: null }), NOW)).toBeNull();
  });
});

describe("feedbackPlanOf", () => {
  it("counts a lifetime row whose flag was flipped off as long as User.status is ACTIVE", () => {
    expect(feedbackPlanOf(buyer({ lifetimeStatus: true }, { active: false }))).toBe("lifetime");
    expect(feedbackPlanOf(buyer({ lifetimeStatus: false }, { active: false }))).toBeNull();
  });
});

describe("renderFeedbackEmail", () => {
  it("is a short plain-text note from the team asking the one question", () => {
    const e = renderFeedbackEmail("Ana Lopez", "lifetime");
    expect(e.subject).toBe("One quick question");
    expect(e.text.startsWith("Hi Ana,")).toBe(true);
    expect(e.text).toContain("What's one thing that would make the course better?");
    expect(e.text).toContain("hit reply");
    expect(e.text).toContain("since you bought the course");
    expect(e.text.trim().endsWith("The Learn AEO team")).toBe(true);
    expect(e.text).not.toMatch(/<[a-z]/i);
    expect(e.text).not.toMatch(/https?:\/\//);
  });

  it("has a monthly variant that mentions the Expedition Pass", () => {
    const e = renderFeedbackEmail("Mo", "monthly");
    expect(e.text).toContain("since you started the Expedition Pass");
    expect(e.text).not.toContain("bought the course");
  });

  it("falls back to a plain Hi when there is no name", () => {
    expect(renderFeedbackEmail(null, "lifetime").text.startsWith("Hi,")).toBe(true);
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import type Stripe from "stripe";

const mockUserFindUnique = vi.hoisted(() => vi.fn());
const mockEmailSendCreate = vi.hoisted(() => vi.fn().mockResolvedValue({}));
const mockEmailSendDelete = vi.hoisted(() => vi.fn().mockResolvedValue({}));
const mockCheckSubscription = vi.hoisted(() => vi.fn().mockResolvedValue({ active: false }));
const mockSendReminder = vi.hoisted(() => vi.fn().mockResolvedValue(true));

vi.mock("@/lib/db", () => ({
  prisma: {
    user: { findUnique: mockUserFindUnique },
    emailSend: { create: mockEmailSendCreate, delete: mockEmailSendDelete },
  },
}));
vi.mock("@/lib/subscription", () => ({ checkSubscription: mockCheckSubscription }));
vi.mock("@/lib/email", () => ({ sendCheckoutReminderEmail: mockSendReminder }));

import { PLANS } from "@/lib/plans";
import {
  REMINDER_KEY_PREFIX,
  formatSessionPrice,
  reminderCheckoutUrl,
  reminderDecision,
  sendCheckoutReminderIfDue,
  type ReminderFacts,
} from "../checkout-reminder";

const NOW = new Date("2026-10-15T12:00:00Z");
const DAY = 86400 * 1000;

function session(over: Partial<Stripe.Checkout.Session> = {}): Stripe.Checkout.Session {
  return {
    id: "cs_1",
    customer_email: "a@example.com",
    customer_details: null,
    metadata: { plan: "monthly" },
    amount_total: 499,
    currency: "usd",
    ...over,
  } as Stripe.Checkout.Session;
}

function user(sends: { key: string; sentAt: Date }[] = [], unsubscribed = false) {
  return { id: "user_1", name: "Ada", emailUnsubscribedAt: unsubscribed ? NOW : null, emailSends: sends };
}

describe("reminderDecision", () => {
  const base: ReminderFacts = { email: "a@example.com", plan: PLANS.lifetime, user: { unsubscribed: false }, ownsPlan: false, sentForSession: false, recentReminder: false };

  it("sends when nothing stands in the way", () => {
    expect(reminderDecision(base)).toEqual({ send: true });
  });

  it.each([
    [{ email: null }, "no-email"],
    [{ plan: undefined }, "no-plan"],
    [{ user: null }, "no-user"],
    [{ user: { unsubscribed: true } }, "unsubscribed"],
    [{ ownsPlan: true }, "owns-plan"],
    [{ sentForSession: true }, "already-sent"],
    [{ recentReminder: true }, "cooldown"],
  ] as const)("skips %o as %s", (over, reason) => {
    expect(reminderDecision({ ...base, ...over })).toEqual({ send: false, reason });
  });
});

describe("formatSessionPrice", () => {
  it("formats what Stripe charged, in its currency", () => {
    expect(formatSessionPrice(1339, "usd")).toBe("$13.39");
    expect(formatSessionPrice(1850, "eur")).toBe("€18.50");
    expect(formatSessionPrice(1599, "gbp")).toBe("£15.99");
  });

  it("gives null when the amount or currency is missing", () => {
    expect(formatSessionPrice(null, "usd")).toBeNull();
    expect(formatSessionPrice(1999, null)).toBeNull();
  });
});

describe("reminderCheckoutUrl", () => {
  it("returns to checkout for the same plan, tagged for attribution", () => {
    expect(reminderCheckoutUrl("https://www.learnhieroglyphics.com/", PLANS.classroom)).toBe(
      "https://www.learnhieroglyphics.com/checkout?plan=classroom&utm_source=email&utm_medium=email&utm_campaign=checkout_reminder"
    );
  });
});

describe("sendCheckoutReminderIfDue", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUserFindUnique.mockResolvedValue(user());
    mockCheckSubscription.mockResolvedValue({ active: false });
    mockSendReminder.mockResolvedValue(true);
    mockEmailSendCreate.mockResolvedValue({});
    process.env.NEXTAUTH_SECRET = "test-secret";
    process.env.NEXTAUTH_URL = "https://www.learnhieroglyphics.com";
  });

  it("claims the session, then sends the reminder with their own price", async () => {
    expect(await sendCheckoutReminderIfDue(session({ amount_total: 1339, currency: "usd", metadata: { plan: "lifetime" } }), NOW)).toBe("sent");
    expect(mockEmailSendCreate).toHaveBeenCalledWith({ data: { userId: "user_1", key: `${REMINDER_KEY_PREFIX}cs_1` } });
    const arg = mockSendReminder.mock.calls[0][0];
    expect(arg.plan.id).toBe("lifetime");
    expect(arg.price).toBe("$13.39");
    expect(arg.checkoutUrl).toContain("/checkout?plan=lifetime&");
    expect(arg.unsubscribeUrl).toContain("/api/email/unsubscribe?u=user_1");
  });

  it("does not send twice when the webhook is retried", async () => {
    mockEmailSendCreate.mockRejectedValueOnce(Object.assign(new Error("Unique constraint"), { code: "P2002" }));
    expect(await sendCheckoutReminderIfDue(session(), NOW)).toBe("already-sent");
    expect(mockSendReminder).not.toHaveBeenCalled();
  });

  it("does not send again for a session already recorded", async () => {
    mockUserFindUnique.mockResolvedValue(user([{ key: `${REMINDER_KEY_PREFIX}cs_1`, sentAt: new Date(NOW.getTime() - 40 * DAY) }]));
    expect(await sendCheckoutReminderIfDue(session(), NOW)).toBe("already-sent");
  });

  it("sends at most one reminder per person in 30 days", async () => {
    mockUserFindUnique.mockResolvedValue(user([{ key: `${REMINDER_KEY_PREFIX}cs_old`, sentAt: new Date(NOW.getTime() - 10 * DAY) }]));
    expect(await sendCheckoutReminderIfDue(session(), NOW)).toBe("cooldown");
    mockUserFindUnique.mockResolvedValue(user([{ key: `${REMINDER_KEY_PREFIX}cs_old`, sentAt: new Date(NOW.getTime() - 31 * DAY) }]));
    expect(await sendCheckoutReminderIfDue(session(), NOW)).toBe("sent");
  });

  it("skips anyone who unsubscribed from email", async () => {
    mockUserFindUnique.mockResolvedValue(user([], true));
    expect(await sendCheckoutReminderIfDue(session(), NOW)).toBe("unsubscribed");
  });

  it("skips a learner who has since got course access", async () => {
    mockCheckSubscription.mockResolvedValue({ active: true });
    expect(await sendCheckoutReminderIfDue(session(), NOW)).toBe("owns-plan");
  });

  it("skips a session with no email or no account", async () => {
    expect(await sendCheckoutReminderIfDue(session({ customer_email: null }), NOW)).toBe("no-email");
    mockUserFindUnique.mockResolvedValue(null);
    expect(await sendCheckoutReminderIfDue(session(), NOW)).toBe("no-user");
  });

  it("releases the claim when Resend refuses the email, so a later expiry can try again", async () => {
    mockSendReminder.mockResolvedValueOnce(false);
    expect(await sendCheckoutReminderIfDue(session(), NOW)).toBe("send-failed");
    expect(mockEmailSendDelete).toHaveBeenCalledWith({ where: { userId_key: { userId: "user_1", key: `${REMINDER_KEY_PREFIX}cs_1` } } });
  });
});

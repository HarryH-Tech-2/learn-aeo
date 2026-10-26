import { describe, it, expect, vi, beforeEach } from "vitest";

const mockSend = vi.hoisted(() =>
  vi.fn().mockResolvedValue({ data: { id: "test-id" }, error: null })
);

vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(function (this: { emails: { send: typeof mockSend } }) {
    this.emails = { send: mockSend };
  }),
}));

import { sendWelcomeEmail } from "@/lib/email";
import { lessons } from "@/lib/lessons";
import { Resend } from "resend";

describe("sendWelcomeEmail", () => {
  beforeEach(() => {
    mockSend.mockClear();
  });

  it("sends a welcome email with the user's name", async () => {
    await sendWelcomeEmail("Harry", "harry@example.com");

    expect(mockSend).toHaveBeenCalledOnce();

    const callArgs = mockSend.mock.calls[0][0];
    expect(callArgs.to).toBe("harry@example.com");
    expect(callArgs.subject).toContain("Harry");
    expect(callArgs.html).toContain("Harry");
    expect(callArgs.html).toContain("/dashboard");
  });

  it("falls back to 'Scholar' when name is not provided", async () => {
    await sendWelcomeEmail(null, "harry@example.com");

    const callArgs = mockSend.mock.calls[0][0];
    expect(callArgs.subject).toContain("Scholar");
    expect(callArgs.html).toContain("Scholar");
  });

  it("opens with a thank-you from the team and invites a reply to the owner inbox", async () => {
    const prev = process.env.CONTACT_TO_EMAIL;
    process.env.CONTACT_TO_EMAIL = "owner@example.com";
    try {
      await sendWelcomeEmail("Harry Smith", "harry@example.com", "lifetime");
    } finally {
      if (prev === undefined) delete process.env.CONTACT_TO_EMAIL;
      else process.env.CONTACT_TO_EMAIL = prev;
    }
    const callArgs = mockSend.mock.calls[0][0];
    expect(callArgs.replyTo).toBe("owner@example.com");
    expect(callArgs.subject).toMatch(/^Thank you/);
    expect(callArgs.html).toContain("Hi Harry,");
    expect(callArgs.html).toContain("Thank you for buying the course");
    expect(callArgs.html).toContain("reply to this email");
    expect(callArgs.text).toContain("Thank you for buying the course");
    expect(callArgs.text.trim().split("\n")).toContain("The Learn AEO team");
  });

  it("lifetime: says lifetime and one-time payment, with the real lesson count", async () => {
    await sendWelcomeEmail("Ana", "a@example.com", "lifetime");
    const { html } = mockSend.mock.calls[0][0];
    expect(html).toContain("lifetime access is active");
    expect(html).toContain("One-time payment");
    expect(html).toContain(`All ${lessons.length} lessons`);
  });

  it("defaults to the lifetime wording when no plan is given", async () => {
    await sendWelcomeEmail("Ana", "a@example.com");
    expect(mockSend.mock.calls[0][0].html).toContain("lifetime access is active");
  });

  it("monthly: talks about the Expedition Pass and never promises lifetime access", async () => {
    await sendWelcomeEmail("Mo", "m@example.com", "monthly");
    const { html, text, subject } = mockSend.mock.calls[0][0];
    expect(subject).toContain("Expedition Pass");
    expect(html).toContain("Thank you for picking up the Expedition Pass");
    expect(html).toContain("cancel any time");
    for (const body of [html, text]) {
      expect(body.toLowerCase()).not.toContain("lifetime");
      expect(body.toLowerCase()).not.toContain("one-time payment");
      expect(body.toLowerCase()).not.toContain("forever");
    }
  });
});

describe("emails on the shared layout", () => {
  beforeEach(() => mockSend.mockClear());

  it("next chamber: the code, the expiry and the checkout button, no arrows", async () => {
    const { sendNextChamberEmail } = await import("@/lib/email");
    await sendNextChamberEmail({ name: "Ana", email: "a@example.com", code: "SCRIBE20", expiresAt: new Date("2026-10-22T12:00:00Z"), percentOff: 20 });
    const { html, subject } = mockSend.mock.calls[0][0];
    expect(subject).toContain("20% off");
    expect(html).toContain("/email/frieze.png");
    expect(html).toContain("SCRIBE20");
    expect(html).toContain("/get-started?next=checkout");
    expect(html).toContain("Unlock the next chamber");
    expect(html).toContain("One-time payment. Lifetime access. No subscription.");
    expect(html).not.toMatch(/→|&rarr;/);
  });

  it("checkout reminder keeps its unsubscribe link and header", async () => {
    const { sendCheckoutReminderEmail } = await import("@/lib/email");
    const { PLANS } = await import("@/lib/plans");
    await sendCheckoutReminderEmail({ email: "a@example.com", name: "Ada", plan: PLANS.lifetime, price: "$13.39", checkoutUrl: "https://x.test/checkout", unsubscribeUrl: "https://x.test/unsub" });
    const args = mockSend.mock.calls[0][0];
    expect(args.headers["List-Unsubscribe"]).toBe("<https://x.test/unsub>");
    expect(args.html).toContain('href="https://x.test/unsub"');
    expect(args.html).toContain('href="https://x.test/checkout"');
    expect(args.html).toContain("$13.39");
    expect(args.html).toContain("14-day money-back guarantee.");
  });
});

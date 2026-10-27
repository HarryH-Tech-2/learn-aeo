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
import { LESSON_CATALOG } from "@/lib/lesson-catalog";
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

  it("greets someone with no name as 'there', with no stand-in name in the subject", async () => {
    await sendWelcomeEmail(null, "harry@example.com");

    const callArgs = mockSend.mock.calls[0][0];
    expect(callArgs.subject).toMatch(/^Thank you: /);
    expect(callArgs.html).toContain("Hi there,");
    expect(callArgs.text).toContain("Hi there,");
    for (const part of [callArgs.subject, callArgs.html, callArgs.text]) expect(part).not.toMatch(/scholar/i);
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
    expect(html).toContain(`All ${LESSON_CATALOG.length} lessons`);
  });

  it("defaults to the lifetime wording when no plan is given", async () => {
    await sendWelcomeEmail("Ana", "a@example.com");
    expect(mockSend.mock.calls[0][0].html).toContain("lifetime access is active");
  });

  it("monthly: talks about the monthly plan and never promises lifetime access", async () => {
    await sendWelcomeEmail("Mo", "m@example.com", "monthly");
    const { html, text, subject } = mockSend.mock.calls[0][0];
    expect(subject).toContain("monthly plan");
    expect(html).toContain("Thank you for starting the monthly plan");
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

  it("lesson complete: names the lesson passed and the next district by its catalog title, with the code and checkout", async () => {
    const { sendLessonCompleteEmail } = await import("@/lib/email");
    await sendLessonCompleteEmail({ name: "Ana", email: "a@example.com", code: "AEO-TEST20", expiresAt: new Date("2026-10-22T12:00:00Z"), percentOff: 20 });
    const [first, second] = LESSON_CATALOG;
    const { html, subject } = mockSend.mock.calls[0][0];
    expect(subject).toContain("20% off");
    expect(subject).toContain(first.title);
    expect(subject).toContain(second.district);
    expect(html).toContain(first.title);
    expect(html).toContain(second.district);
    expect(html).toContain(second.title);
    expect(html).toContain(`/lessons/${second.id}`);
    expect(html).toContain("/email/city-header.png");
    expect(html).toContain("/email/mark-aeo.png");
    expect(html).toContain("AEO-TEST20");
    expect(html).toContain("/get-started?next=checkout");
    expect(html).toContain("One-time payment. Lifetime access. No subscription.");
    expect(html).not.toMatch(/→|&rarr;/);
  });

  it("lesson complete: works from the lesson passed when given one", async () => {
    const { sendLessonCompleteEmail } = await import("@/lib/email");
    const [, second, third] = LESSON_CATALOG;
    await sendLessonCompleteEmail({ name: "Ana", email: "a@example.com", code: "AEO-TEST20", expiresAt: new Date("2026-10-22T12:00:00Z"), percentOff: 20, lessonId: second.id });
    const { html, subject } = mockSend.mock.calls[0][0];
    expect(subject).toContain(second.title);
    expect(subject).toContain(third.district);
    expect(html).toContain(`/lessons/${third.id}`);
  });

  it("purchase welcome, lesson-complete and recovery emails use no old-course words", async () => {
    const { sendLessonCompleteEmail, sendCheckoutRecoveryEmail } = await import("@/lib/email");
    const OLD = /egypt|hieroglyph|glyph|papyrus|pharaoh|tomb|cartouche|\bscrib(e|al)|expedition|chamber|ankh|rosetta|\bnile\b|horus|scarab|courtyard|hypostyle|sanctum|chapel|treasury|scholar|academy|inscription|frieze|[\u{13000}-\u{1342F}]/iu;
    const offer = { name: "Ana", email: "a@example.com", code: "AEO-TEST20", expiresAt: new Date("2026-10-22T12:00:00Z"), percentOff: 20 };
    await sendWelcomeEmail("Ana", "a@example.com", "lifetime");
    await sendWelcomeEmail(null, "a@example.com", "monthly");
    await sendLessonCompleteEmail(offer);
    await sendLessonCompleteEmail({ ...offer, name: null });
    await sendCheckoutRecoveryEmail({ ...offer, name: null });
    expect(mockSend).toHaveBeenCalledTimes(5);
    for (const [args] of mockSend.mock.calls) {
      for (const part of [args.subject, args.html, args.text ?? ""]) expect(part).not.toMatch(OLD);
    }
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

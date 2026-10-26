import { describe, expect, it } from "vitest";
import { dueStep, renderNameDripEmail, type DripLead, type NameDripStepKey } from "@/lib/name-drip";

const DAY = 86_400_000;
const start = new Date("2026-10-20T12:00:00Z");
const at = (days: number) => new Date(start.getTime() + days * DAY);
const lead = (over: Partial<DripLead> = {}): DripLead => ({
  email: "a@example.com",
  name: "Harry",
  optedInAt: start,
  sent: [],
  optedOut: false,
  member: false,
  boughtPrint: false,
  ...over,
});

describe("name drip schedule", () => {
  it("sends nothing on the day of the opt-in", () => {
    expect(dueStep(lead(), at(0.5))).toBeNull();
  });

  it("walks signs → read → gift on days 1, 3 and 6", () => {
    expect(dueStep(lead(), at(1))).toBe("signs");
    expect(dueStep(lead({ sent: ["signs"] }), at(2))).toBeNull();
    expect(dueStep(lead({ sent: ["signs"] }), at(3))).toBe("read");
    expect(dueStep(lead({ sent: ["signs", "read"] }), at(5))).toBeNull();
    expect(dueStep(lead({ sent: ["signs", "read"] }), at(6))).toBe("gift");
    expect(dueStep(lead({ sent: ["signs", "read", "gift"] }), at(7))).toBeNull();
  });

  it("one step per run, in order, when the cron was off for a while", () => {
    expect(dueStep(lead(), at(7))).toBe("signs");
    expect(dueStep(lead({ sent: ["signs"] }), at(7))).toBe("read");
  });

  it("skips the lesson email for course owners and the gift email for print buyers", () => {
    expect(dueStep(lead({ sent: ["signs"], member: true }), at(3))).toBeNull();
    expect(dueStep(lead({ sent: ["signs"], member: true }), at(6))).toBe("gift");
    expect(dueStep(lead({ sent: ["signs", "read"], boughtPrint: true }), at(6))).toBeNull();
  });

  it("stops for good after an unsubscribe, and after the last day", () => {
    expect(dueStep(lead({ optedOut: true }), at(1))).toBeNull();
    expect(dueStep(lead(), at(11))).toBeNull();
  });
});

describe("name drip emails", () => {
  const steps: NameDripStepKey[] = ["signs", "read", "gift"];
  const base = "https://www.learnhieroglyphics.com";
  const unsub = `${base}/api/email/unsubscribe?e=a%40example.com&t=x`;

  for (const step of steps) {
    it(`${step}: unsubscribe link, tagged links, no prices, no raw hieroglyphs`, () => {
      const e = renderNameDripEmail(step, { name: "harry" }, base, unsub, new Date("2026-11-01T12:00:00Z"));
      expect(e.html).toContain(unsub.replace(/&/g, "&"));
      expect(e.text).toContain(unsub);
      expect(e.html).toContain(`utm_source=name-drip&utm_medium=email&utm_campaign=${step}`);
      expect(e.html + e.text + e.subject).not.toMatch(/[$£€]\s?\d/);
      expect(e.html + e.text + e.subject).not.toMatch(/[\u{13000}-\u{1345F}]/u);
    });

    it(`${step}: still renders for a name the picture can't draw`, () => {
      const e = renderNameDripEmail(step, { name: "李小龙" }, base, unsub);
      expect(e.subject.length).toBeGreaterThan(5);
      expect(e.html).toContain("learnhieroglyphics.com");
    });
  }

  it("signs: one row per sign of the name, capitalised in the subject", () => {
    const e = renderNameDripEmail("signs", { name: "harry" }, base, unsub);
    expect(e.subject).toBe("What the signs in Harry really are");
    expect(e.text).toMatch(/^H: /m);
    expect(e.html).toContain("keep=hd");
  });

  it("read: opens Lesson 1 with the name carried in", () => {
    const e = renderNameDripEmail("read", { name: "Harry" }, base, unsub);
    expect(e.html).toContain("name=Harry");
  });
});

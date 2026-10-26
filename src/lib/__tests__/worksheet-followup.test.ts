import { describe, it, expect } from "vitest";
import { FOLLOWUP_FROM, followUpDue, renderFollowUpEmail, selectFollowUps, type FollowUpContext } from "@/lib/worksheet-followup";

const DAY = 86_400_000;
const base = "https://www.learnhieroglyphics.com";
const now = new Date(FOLLOWUP_FROM.getTime() + 20 * DAY);
const daysAgo = (d: number) => new Date(now.getTime() - d * DAY);
const empty = (): FollowUpContext => ({ sent: new Set(), optedOut: new Set(), hasLicence: new Set() });

describe("followUpDue", () => {
  it("waits three days after the worksheet email, and gives up after thirty", () => {
    expect(followUpDue({ email: "a@school.uk", createdAt: daysAgo(2) }, empty(), now)).toBe(false);
    expect(followUpDue({ email: "a@school.uk", createdAt: daysAgo(3) }, empty(), now)).toBe(true);
    expect(followUpDue({ email: "a@school.uk", createdAt: daysAgo(31) }, empty(), now, { includeEarlier: true })).toBe(false);
  });

  it("never writes to a lead from before the footer promised it, unless asked to on purpose", () => {
    const early = { email: "a@school.uk", createdAt: new Date(FOLLOWUP_FROM.getTime() - DAY) };
    const later = new Date(FOLLOWUP_FROM.getTime() + 5 * DAY);
    expect(followUpDue(early, empty(), later)).toBe(false);
    expect(followUpDue(early, empty(), later, { includeEarlier: true })).toBe(true);
  });

  it("skips anyone sent it, opted out or already holding a licence or trial, whatever the case of the address", () => {
    const lead = { email: "Ms.Jones@School.uk", createdAt: daysAgo(5) };
    for (const key of ["sent", "optedOut", "hasLicence"] as const) {
      const ctx = empty();
      ctx[key].add("ms.jones@school.uk");
      expect(followUpDue(lead, ctx, now), key).toBe(false);
    }
  });
});

describe("selectFollowUps", () => {
  it("sends one email per address", () => {
    const due = selectFollowUps(
      [
        { email: "a@school.uk", createdAt: daysAgo(6) },
        { email: "A@school.uk", createdAt: daysAgo(4) },
        { email: "b@school.uk", createdAt: daysAgo(1) },
      ],
      empty(),
      now,
    );
    expect(due.map((l) => l.email)).toEqual(["a@school.uk"]);
  });
});

describe("renderFollowUpEmail", () => {
  const email = renderFollowUpEmail(`${base}/`);

  it("links the trial (starting it on arrival) and the guide, each tagged", () => {
    const tag = "utm_source=worksheet-email&utm_medium=email&utm_campaign=worksheet-trial";
    // every link in the email's own words; the shared layout's header and footer link the bare site (no tag)
    const links = [...email.html.matchAll(/<a [^>]*href="([^"]+)"/g)].map((m) => m[1]).filter((href) => href !== base);
    expect(links).toContain(`${base}/teachers/class?trial=1&${tag}`);
    expect(links).toContain(`${base}/teachers/class/guide?${tag}`);
    for (const href of links) expect(href).toContain(tag);
    expect(email.text).toContain(`${base}/teachers/class?trial=1&${tag}`);
  });

  it("writes no price and no raw hieroglyph, and says how to stop the emails", () => {
    for (const part of [email.subject, email.html, email.text]) {
      expect(part).not.toMatch(/[$£€]\s?\d/);
      expect(part).not.toMatch(/[\u{13000}-\u{1345F}]/u);
    }
    expect(email.html).toContain("no more");
    expect(email.text).toContain("no more");
    expect(email.text).not.toMatch(/<[a-z]+[ >]/);
  });
});

import { describe, expect, it } from "vitest";
import { renderGiftUpdatesEmail, selectGiftUpdates } from "@/lib/gift-updates";
import { leadUnsubscribeToken, leadUnsubscribeUrl, verifyLeadUnsubscribeToken } from "@/lib/unsubscribe";

const BASE = "https://www.learnhieroglyphics.com";

describe("Christmas prints email", () => {
  it("goes once to each opt-in, never to anyone sent or opted out", () => {
    const leads = [
      { email: "a@x.com", name: "maya" },
      { email: "A@x.com", name: "maya" },
      { email: "b@x.com", name: null },
      { email: "c@x.com", name: "leo" },
      { email: "d@x.com", name: "sam" },
    ];
    const due = selectGiftUpdates(leads, { sent: new Set(["c@x.com"]), optedOut: new Set(["d@x.com"]) });
    expect(due.map((l) => l.email)).toEqual(["a@x.com", "b@x.com"]);
  });

  it("shows their own name on the pyramids and links to its print", () => {
    const e = renderGiftUpdatesEmail({ email: "a@x.com", name: "mitzi" }, BASE, `${BASE}/unsub`, new Date(2026, 10, 20));
    expect(e.subject).toContain("MITZI");
    expect(e.html).toContain("/keyboard-image?");
    expect(e.html).toContain("s=pyramids");
    expect(e.text).toContain("/translate-name-to-hieroglyphics/mitzi?");
    expect(e.text).toContain("keep=print");
    expect(e.text).toContain("Order by");
    expect(e.text).toContain(`${BASE}/unsub`);
  });

  it("falls back to the translator when the text is not a name", () => {
    const e = renderGiftUpdatesEmail({ email: "a@x.com", name: "this is far too many words to print" }, BASE, `${BASE}/unsub`);
    expect(e.html).not.toContain("/keyboard-image");
    expect(e.text).toContain(`${BASE}/translate-name-to-hieroglyphics?`);
  });

  it("escapes the name in the email", () => {
    const e = renderGiftUpdatesEmail({ email: "a@x.com", name: "<b>" }, BASE, `${BASE}/unsub`);
    expect(e.html).not.toContain("<b>");
  });
});

describe("unsubscribe by email address", () => {
  it("signs the address, case-blind, and rejects anything else", () => {
    const t = leadUnsubscribeToken("Jody@Example.com", "s3cret");
    expect(verifyLeadUnsubscribeToken("jody@example.com", t, "s3cret")).toBe(true);
    expect(verifyLeadUnsubscribeToken("someone@else.com", t, "s3cret")).toBe(false);
    expect(verifyLeadUnsubscribeToken("jody@example.com", "nope", "s3cret")).toBe(false);
    expect(leadUnsubscribeUrl("jody@example.com", BASE, "s3cret")).toMatch(/\/api\/email\/unsubscribe\?e=jody%40example\.com&t=/);
  });
});

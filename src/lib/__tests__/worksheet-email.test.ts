import { describe, it, expect } from "vitest";
import { renderWorksheetEmail } from "@/lib/worksheet-email";

const base = "https://www.learnhieroglyphics.com";

describe("renderWorksheetEmail", () => {
  const email = renderWorksheetEmail(`${base}/`);

  it("links the worksheet, the lesson plan, the class quiz and the licence, each tagged", () => {
    const tag = "utm_source=worksheet-email&utm_medium=email&utm_campaign=worksheet";
    // every link in the email's own words; the shared layout's header and footer link the bare site (no tag)
    const links = [...email.html.matchAll(/<a [^>]*href="([^"]+)"/g)].map((m) => m[1]).filter((href) => href !== base);
    for (const path of ["/teachers/worksheet", "/teachers", "/teachers/class", "/teachers/class/guide", "/translate-name-to-hieroglyphics"]) {
      expect(links, path).toContain(`${base}${path}?${tag}`);
      expect(email.text, path).toContain(`${base}${path}?${tag}`);
    }
    // the tag goes before the #teachers anchor, or the browser would never send it
    expect(links).toContain(`${base}/pricing?${tag}#teachers`);
    for (const href of links) expect(href).toContain(tag);
  });

  it("writes no price (it differs by country) and no raw hieroglyph (most mail clients lack the font)", () => {
    for (const part of [email.subject, email.html, email.text]) {
      expect(part).not.toMatch(/[$£€]\s?\d/);
      expect(part).not.toMatch(/[\u{13000}-\u{1345F}]/u);
    }
  });

  it("says how to stop the emails, in both parts", () => {
    expect(email.html).toContain("no more");
    expect(email.text).toContain("no more");
    expect(email.text).not.toMatch(/<[a-z]+[ >]/);
  });
});

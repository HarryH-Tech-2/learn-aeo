import { FIRST_LESSON_PATH } from "@/lib/lesson-catalog";
import { describe, it, expect } from "vitest";
import { renderNurtureEmail, sampleContext } from "@/lib/nurture-emails";
import { NURTURE_STEPS } from "@/lib/nurture";

const base = "https://www.learnaeo.com";

describe("renderNurtureEmail", () => {
  it("renders every step with a subject, an unsubscribe link, and a plain-text part", () => {
    for (const step of NURTURE_STEPS) {
      const email = renderNurtureEmail(step.key, sampleContext(base));
      expect(email.subject.length, step.key).toBeGreaterThan(5);
      expect(email.html, step.key).toContain("/api/email/unsubscribe?u=preview");
      expect(email.text, step.key).toContain("Unsubscribe:");
      expect(email.text, step.key).not.toMatch(/<[a-z]+[ >]/);
    }
  });

  it("links the welcome to the free lesson and the offer to checkout with the code", () => {
    expect(renderNurtureEmail("welcome", sampleContext(base)).html).toContain(`${base}${FIRST_LESSON_PATH}`);
    const offer = renderNurtureEmail("offer", sampleContext(base));
    expect(offer.html).toContain("AEO-PREVIEW");
    expect(offer.html).toContain(`${base}/get-started?next=checkout`);
  });

  it("tags every link back to the site with the step it came from", () => {
    for (const step of NURTURE_STEPS) {
      const email = renderNurtureEmail(step.key, sampleContext(base));
      const tag = `utm_source=nurture&utm_medium=email&utm_campaign=${step.key}`;
      const links = [...email.html.matchAll(/href="([^"]+)"/g)]
        .map((m) => m[1])
        .filter((h) => h.startsWith(`${base}/`) && !h.includes("/api/email/unsubscribe"));
      expect(links.length, step.key).toBeGreaterThan(0);
      for (const href of links) expect(href, step.key).toContain(tag);
      expect(email.text, step.key).toContain(tag);
    }
  });

  it("escapes the learner's name", () => {
    const html = renderNurtureEmail("door-sealed", sampleContext(base, { firstName: "<b>Bob</b>" })).html;
    expect(html).not.toContain("<b>Bob</b>");
    expect(html).toContain("&lt;b&gt;Bob&lt;/b&gt;");
  });

  it("writes door-sealed for someone who never started, and for someone part-way, differently", () => {
    const fresh = renderNurtureEmail("door-sealed", sampleContext(base, { lesson1Started: false }));
    expect(fresh.subject).toBe("Your door is waiting");
    expect(fresh.html).toContain("haven't opened the door");
    expect(fresh.text).toContain("haven't opened the door");
    const partWay = renderNurtureEmail("door-sealed", sampleContext(base, { lesson1Started: true }));
    expect(partWay.subject).toMatch(/place .*saved/i);
    expect(partWay.text).not.toContain("haven't opened");
    for (const email of [fresh, partWay]) expect(email.html).toContain(`${base}${FIRST_LESSON_PATH}?utm_source=nurture`);
  });

  it("refuses to render the offer emails without an offer", () => {
    expect(() => renderNurtureEmail("offer", sampleContext(base, { offer: null }))).toThrow();
  });

  it("never writes a price (it differs by country) or a raw hieroglyph (most mail clients lack the font)", () => {
    for (const step of NURTURE_STEPS) {
      for (const [done, started] of [[false, false], [false, true], [true, true]]) {
        const email = renderNurtureEmail(step.key, sampleContext(base, { lesson1Completed: done, lesson1Started: started }));
        for (const part of [email.subject, email.html, email.text]) {
          expect(part, step.key).not.toMatch(/[$£€]\s?\d/);
          expect(part, step.key).not.toMatch(/[\u{13000}-\u{1345F}]/u);
        }
      }
    }
  });

  it("puts the learner's own name in the welcome cartouche, and falls back to the door for names it can't spell", () => {
    expect(renderNurtureEmail("welcome", sampleContext(base)).html).toContain(`${base}/cartouche-image?name=Nancy`);
    for (const firstName of ["Scholar", "Zoë", "李"]) {
      const html = renderNurtureEmail("welcome", sampleContext(base, { firstName })).html;
      expect(html, firstName).not.toContain("/cartouche-image");
      expect(html, firstName).toContain("/email/door.jpg");
    }
  });
});

describe("renderNurtureEmail — free-unlock group", () => {
  const base = "https://www.learnaeo.com";

  it("coffee: says the course is open, asks for feedback and sells nothing", () => {
    const e = renderNurtureEmail("coffee", sampleContext(base, { freeUnlock: true, offer: null }));
    expect(e.html).not.toContain("buymeacoffee");
    expect(e.text).not.toContain("buymeacoffee");
    expect(e.html).not.toContain("/checkout");
    expect(e.html).toContain("utm_campaign=coffee");
  });

  it("next-door: says the course is open instead of pitching it", () => {
    const e = renderNurtureEmail("next-door", sampleContext(base, { freeUnlock: true, lesson1Completed: true }));
    expect(e.html).toContain("open on your account, free");
    expect(e.html).not.toContain("/pricing");
  });
});

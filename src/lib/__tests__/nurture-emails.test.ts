import { FIRST_LESSON_PATH, LESSON_CATALOG } from "@/lib/lesson-catalog";
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { renderNurtureEmail, sampleContext, type NurtureEmailContext } from "@/lib/nurture-emails";
import { NURTURE_STEPS } from "@/lib/nurture";

const base = "https://www.learnaeo.com";
const ROOT = path.resolve(__dirname, "../../..");

/** Every combination of context flags the sequence can be rendered with. */
const VARIANTS: Partial<NurtureEmailContext>[] = [
  { lesson1Completed: false, lesson1Started: false },
  { lesson1Completed: false, lesson1Started: true },
  { lesson1Completed: true, lesson1Started: true },
  { lesson1Completed: true, lesson1Started: true, freeUnlock: true, offer: null },
  { firstName: "there" },
];

function allRenders() {
  const out: { key: string; subject: string; html: string; text: string }[] = [];
  for (const step of NURTURE_STEPS) {
    for (const v of VARIANTS) {
      const ctx = sampleContext(base, v);
      if ((step.key === "offer" || step.key === "offer-expires") && !ctx.offer) continue;
      out.push({ key: step.key, ...renderNurtureEmail(step.key, ctx) });
    }
  }
  return out;
}

/** The app's routes, read from src/app (page.tsx and route.ts), as regexes over a URL path. */
function appRoutes(): RegExp[] {
  const routes: RegExp[] = [];
  const walk = (dir: string, segs: string[]) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (e.isDirectory()) walk(path.join(dir, e.name), [...segs, e.name]);
      else if (e.name === "page.tsx" || e.name === "route.ts") {
        const parts = segs
          .filter((s) => !/^\(.*\)$/.test(s)) // route groups add nothing to the URL
          .map((s) => (/^\[\.\.\..+\]$/.test(s) ? ".+" : /^\[.+\]$/.test(s) ? "[^/]+" : s.replace(/[.]/g, "\\.")));
        routes.push(new RegExp(`^/${parts.join("/")}$`));
      }
    }
  };
  walk(path.join(ROOT, "src/app"), []);
  return routes;
}

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

  it("links only to routes the app really has, and lesson links only to catalog lessons", () => {
    const routes = appRoutes();
    expect(routes.length).toBeGreaterThan(10); // a wrong ROOT would find nothing and pass
    const ids = new Set(LESSON_CATALOG.map((l) => l.id));
    for (const email of allRenders()) {
      const urls = [
        ...[...email.html.matchAll(/<a\s[^>]*href="([^"]+)"/g)].map((m) => m[1]),
        ...[...email.text.matchAll(/https?:\/\/\S+/g)].map((m) => m[0]),
      ];
      for (const raw of urls) {
        const url = raw.replace(/&amp;/g, "&");
        expect(url.startsWith(base), `${email.key}: ${url}`).toBe(true);
        const p = new URL(url).pathname.replace(/\/$/, "") || "/";
        expect(routes.some((r) => r.test(p)), `${email.key}: ${p} is not an app route`).toBe(true);
        const lesson = p.match(/^\/lessons\/([^/]+)$/);
        if (lesson) expect(ids.has(lesson[1]), `${email.key}: ${p}`).toBe(true);
        for (const gone of ["/name-image", "/translate", "/daily"]) expect(p, email.key).not.toContain(gone);
      }
    }
  });

  it("only uses images that exist in public/", () => {
    for (const email of allRenders()) {
      for (const [, src] of email.html.matchAll(/<img[^>]+src="([^"]+)"/g)) {
        expect(src.startsWith(`${base}/`), src).toBe(true);
        const file = path.join(ROOT, "public", new URL(src).pathname);
        expect(fs.existsSync(file), `${email.key}: ${src}`).toBe(true);
        expect(src, email.key).toMatch(/\.(png|jpe?g)$/);
      }
    }
  });

  it("escapes the learner's name", () => {
    const html = renderNurtureEmail("door-sealed", sampleContext(base, { firstName: "<b>Bob</b>" })).html;
    expect(html).not.toContain("<b>Bob</b>");
    expect(html).toContain("&lt;b&gt;Bob&lt;/b&gt;");
  });

  it("writes door-sealed for someone who never started, and for someone part-way, differently", () => {
    const fresh = renderNurtureEmail("door-sealed", sampleContext(base, { lesson1Started: false }));
    expect(fresh.subject).toBe("Lesson 1 is waiting for you");
    expect(fresh.html).toContain("haven't started Lesson 1");
    expect(fresh.text).toContain("haven't started Lesson 1");
    const partWay = renderNurtureEmail("door-sealed", sampleContext(base, { lesson1Started: true }));
    expect(partWay.subject).toMatch(/place .*saved/i);
    expect(partWay.text).not.toContain("haven't started");
    for (const email of [fresh, partWay]) expect(email.html).toContain(`${base}${FIRST_LESSON_PATH}?utm_source=nurture`);
  });

  it("next-door recaps what the learner covered in The Gate and names the next district", () => {
    const e = renderNurtureEmail("next-door", sampleContext(base, { lesson1Completed: true, lesson1Started: true }));
    expect(e.subject).toBe("What you learned in The Gate");
    expect(e.html).toContain(LESSON_CATALOG[1].district);
    expect(e.text).toContain(LESSON_CATALOG[1].title);
  });

  it("free-stuff is now a short tour of what is inside the course, with no tools promised", () => {
    const e = renderNurtureEmail("free-stuff", sampleContext(base));
    expect(e.subject).toBe("What's inside the course");
    for (const part of [e.html, e.text]) expect(part.toLowerCase()).not.toMatch(/\btools?\b|template/);
  });

  it("refuses to render the offer emails without an offer", () => {
    expect(() => renderNurtureEmail("offer", sampleContext(base, { offer: null }))).toThrow();
  });

  it("never writes a price (it differs by country) or a learner count", () => {
    for (const email of allRenders()) {
      for (const part of [email.subject, email.html, email.text]) {
        expect(part, email.key).not.toMatch(/[$£€]\s?\d/);
        expect(part, email.key).not.toMatch(/\d[\d,]* (learners|marketers|students|people)/i);
      }
    }
  });

  it("uses no words from the old course", () => {
    // The old learner title is caught by the site-wide word ban test.
    const OLD = /base camp|academy|causeway|door\.jpg/i;
    for (const email of allRenders()) {
      for (const part of [email.subject, email.html, email.text]) expect(part, email.key).not.toMatch(OLD);
    }
  });

  it("greets a learner with no name as 'there'", () => {
    const e = renderNurtureEmail("welcome", sampleContext(base, { firstName: "there" }));
    expect(e.text).toContain("Hi there,");
  });
});

describe("renderNurtureEmail — free-unlock group", () => {
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

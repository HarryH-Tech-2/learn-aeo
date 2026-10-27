// Page copy guard: the pages and shell components carried the old course's Egyptian copy.
// Every file below must be free of the Global Constraints' banned words and of characters in the
// Egyptian Hieroglyphs blocks (U+13000–U+1342F), and the site description must say what the course is.
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(__dirname, "../../..");

const FILES = [
  "src/app/layout.tsx",
  "src/components/home/HomePage.tsx",
  "src/components/home/HeroCta.tsx",
  "src/components/HeroSection.tsx",
  "src/components/FeaturesSection.tsx",
  "src/components/FAQSection.tsx",
  "src/components/Footer.tsx",
  "src/components/LessonsPreview.tsx",
  "src/components/PricingSection.tsx",
  "src/components/PricingFAQ.tsx",
  "src/app/about/page.tsx",
  "src/app/about/AboutContent.tsx",
  "src/app/contact/page.tsx",
  "src/app/contact/ContactContent.tsx",
  "src/app/get-started/page.tsx",
  "src/app/get-started/GetStartedContent.tsx",
  "src/app/pricing/page.tsx",
  "src/components/PppBanner.tsx",
  "src/components/OfferBanner.tsx",
  "src/components/FreeCourseCta.tsx",
  "src/app/checkout/CheckoutContent.tsx",
  "src/app/login/LoginContent.tsx",
  "src/components/AuthCard.tsx",
  "src/app/account/AccountContent.tsx",
  "src/components/FeedbackButton.tsx",
  "src/app/terms/TermsContent.tsx",
  "src/app/privacy/PrivacyContent.tsx",
  "src/app/not-found.tsx",
];

// Global Constraints, "No Egypt anywhere" ("describe", "subscribe" and "digital" stay legal).
const BANNED =
  /\b(egypt\w*|hieroglyph\w*|glyphs?|papyr\w*|pharaoh\w*|tombs?|cartouches?|scribes?|scribal|expeditions?|chambers?|ankhs?|rosetta|nile|tutankhamun|horus|scarabs?|dig|digs|digging|diggers?|archaeolog\w*|egyptolog\w*|courtyards?|hypostyle|sanctum|chapels?|treasury|royal hall|thoth|anubis|karnak|mummy|valley of the kings|book of the dead|segoe ui historic)\b/i;
// the characters themselves, or written as an HTML or JS escape (&#x13080;, \u{13080})
const HIEROGLYPH_CHAR = /[\u{13000}-\u{1342F}]|&#x13[0-4][0-9a-f]{2};|\\u\{13[0-4][0-9a-f]{2}\}/iu;

function read(rel: string): string {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

describe("banned-word pattern", () => {
  it("catches the old copy and leaves ordinary words alone", () => {
    expect("an Egyptian scribe").toMatch(BANNED);
    expect('fontFamily: "Noto Sans Egyptian Hieroglyphs"').toMatch(BANNED);
    expect("footer-egypt").toMatch(BANNED);
    expect("the glyph-font class").toMatch(BANNED);
    expect("Unlock the next chamber").toMatch(BANNED);
    expect("describe the subscribe button on a digital page").not.toMatch(BANNED);
    expect("\u{13080}").toMatch(HIEROGLYPH_CHAR);
    expect("<span>&#x13080;</span>").toMatch(HIEROGLYPH_CHAR);
    expect("String.raw`\\u{13080}`").toMatch(HIEROGLYPH_CHAR);
  });
});

describe("page copy", () => {
  it.each(FILES)("%s has no Egyptian words or hieroglyph characters", (rel) => {
    const text = read(rel);
    const hits = text.split("\n").flatMap((line, i) => {
      const m = line.match(BANNED) ?? line.match(HIEROGLYPH_CHAR);
      return m ? [`${i + 1}: ${m[0]}`] : [];
    });
    expect(hits).toEqual([]);
  });

  it("layout metadata descriptions say the course is about answer engines", () => {
    const text = read("src/app/layout.tsx");
    const descriptions = [...text.matchAll(/description:\s*"([^"]+)"/g)].map((m) => m[1]);
    // site description, Open Graph and Twitter
    expect(descriptions).toHaveLength(3);
    for (const d of descriptions) expect(d.toLowerCase()).toContain("answer engine");
  });

  it("the hero points at no video or poster files", () => {
    const text = read("src/components/HeroSection.tsx");
    expect(text).not.toMatch(/\.(mp4|webm|webp)\b|<video|poster/i);
  });

  it("the stylesheet has no footer scene, hero seal or hieroglyph font classes", () => {
    const css = read("src/styles/globals.css");
    expect(css).not.toMatch(/\.footer-egypt|\.hero-cta-seal|\.hieroglyph-font|\.glyph-font/);
  });

  it("no plan promises tools that do not exist", async () => {
    const { PLANS } = await import("@/lib/plans");
    for (const f of [...PLANS.lifetime.features, ...PLANS.monthly.features]) expect(f).not.toMatch(/\btools?\b/i);
  });
});

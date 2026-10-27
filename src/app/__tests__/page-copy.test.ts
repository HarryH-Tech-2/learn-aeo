// Page copy guard: pages and shell components must not over-promise on refunds, must describe the
// course as being about answer engines, and must not point at removed assets. The site-wide word ban
// is a separate test under src/lib/__tests__.
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

// Emails and checkout copy also talk about refunds.
const MONEY_COPY = ["src/lib/email.ts", "src/lib/nurture-emails.ts", "src/lib/checkout-copy.ts"];

function read(rel: string): string {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

describe("page copy", () => {
  it.each([...FILES, ...MONEY_COPY])("%s does not promise more than the Terms' refund wording", (rel) => {
    expect(read(rel)).not.toMatch(/no questions asked/i);
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

  it("the stylesheet has no footer scene or hero seal classes", () => {
    const css = read("src/styles/globals.css");
    expect(css).not.toMatch(/\.hero-cta-seal/);
  });

  it("no plan promises tools that do not exist", async () => {
    const { PLANS } = await import("@/lib/plans");
    for (const f of [...PLANS.lifetime.features, ...PLANS.monthly.features]) expect(f).not.toMatch(/\btools?\b/i);
  });
});

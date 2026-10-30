// Once all eight lessons are live, nothing on the site may still say lessons are on their way.
import { describe, it, expect, vi } from "vitest";

vi.mock("next-auth/react", () => ({ useSession: () => ({ data: null, status: "unauthenticated" }) }));
vi.mock("next/navigation", () => ({ useSearchParams: () => new URLSearchParams(), useRouter: () => ({ replace: vi.fn(), push: vi.fn() }), usePathname: () => "/about" }));
vi.mock("@/components/AuthModal", () => ({ useAuthModal: () => ({ openAuthModal: vi.fn() }) }));

import { renderToStaticMarkup } from "react-dom/server";
import AboutContent from "@/app/about/AboutContent";
import PricingFAQ from "@/components/PricingFAQ";
import PricingPage from "@/app/pricing/page";
import UpgradePanel from "@/components/lesson/UpgradePanel";
import { LESSON_CATALOG } from "@/lib/lesson-catalog";
import { buildLlmsTxt } from "@/lib/llms-txt";
import { TOOLS } from "@/lib/tools";
import { blogPosts, getPostBySlug } from "@/lib/blog-posts";
import { GLOSSARY } from "@/lib/glossary";
import { renderNurtureEmail, sampleContext } from "@/lib/nurture-emails";
import type { NurtureStepKey } from "@/lib/nurture";

// Wording that only makes sense while some lessons are unreleased.
const STALE =
  /coming soon|being released|rest are coming|remaining lesson|the rest as they are released|still to come|as they open \(|(three|3) (of (its|the) (eight|8)|lessons are live|are live)/i;

describe("copy once the whole course is live", () => {
  it("has every catalog lesson live", () => {
    expect(LESSON_CATALOG.every((l) => l.status === "live")).toBe(true);
  });

  it("the About page doesn't say lessons are coming", () => {
    expect(renderToStaticMarkup(<AboutContent />)).not.toMatch(STALE);
  });

  it("the pricing FAQ doesn't mention remaining lessons", () => {
    expect(renderToStaticMarkup(<PricingFAQ />)).not.toMatch(STALE);
  });

  it("the pricing page doesn't say lessons are still opening", () => {
    const html = renderToStaticMarkup(<PricingPage />);
    expect(html).not.toMatch(STALE);
    expect(html).not.toMatch(/live now|open as they are finished/i);
  });

  it("the upgrade panel doesn't say lessons are being released", () => {
    const html = renderToStaticMarkup(<UpgradePanel paid={false} offer={null} location="dashboard" />);
    expect(html).not.toMatch(STALE);
  });

  it("llms.txt doesn't say lessons are being released", () => {
    const txt = buildLlmsTxt({ lessons: LESSON_CATALOG, tools: TOOLS, posts: blogPosts, glossary: [...GLOSSARY] });
    expect(txt).not.toMatch(STALE);
  });

  it.each(["welcome", "door-sealed", "next-door", "free-stuff", "offer", "offer-expires", "coffee"] as NurtureStepKey[])(
    "the %s nurture email doesn't say lessons are coming",
    (key) => {
      const offer = { code: "TEST33", percentOff: 33, expiresAt: new Date("2030-01-01T00:00:00Z") };
      const email = renderNurtureEmail(key, sampleContext("https://www.learnaeo.com", { offer } as never));
      expect(email.text).not.toMatch(STALE);
      expect(email.html).not.toMatch(STALE);
    },
  );

  it.each(["best-aeo-courses", "how-to-learn-aeo"])("the %s post describes eight live lessons", (slug) => {
    const post = getPostBySlug(slug);
    expect(post, slug).toBeDefined();
    expect(JSON.stringify(post)).not.toMatch(STALE);
  });
});

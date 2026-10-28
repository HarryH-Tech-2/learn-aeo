import { describe, expect, it, vi } from "vitest";

// Review Focus 2: prices read "$100" and "$10", never "$100.00", wherever the site prints them.
vi.mock("next-auth/react", () => ({ useSession: () => ({ data: null, status: "unauthenticated" }) }));
vi.mock("next/navigation", () => ({ useSearchParams: () => new URLSearchParams(), useRouter: () => ({ replace: vi.fn(), push: vi.fn() }) }));
vi.mock("@/components/AuthModal", () => ({ useAuthModal: () => ({ openAuthModal: vi.fn() }) }));

import { renderToStaticMarkup } from "react-dom/server";
import PricingSection from "@/components/PricingSection";
import PricingFAQ from "@/components/PricingFAQ";
import { GET as llmsTxt } from "@/app/llms.txt/route";
import { checkoutSubmitText } from "@/lib/checkout-copy";
import { PLANS, PLAN_IDS } from "@/lib/plans";

const DECIMAL_WHOLE = /[$£](100|80|10|8)\.00/;

describe("pricing cards", () => {
  const html = renderToStaticMarkup(<PricingSection />);

  it("show $100 Lifetime and $10 Monthly, with no decimals", () => {
    expect(html).toContain("$100");
    expect(html).toMatch(/\$10(?!\d)/);
    expect(html).not.toMatch(DECIMAL_WHOLE);
  });

  it("show only the two plans, with the marketer feature copy", () => {
    for (const f of [...PLANS.lifetime.features, ...PLANS.monthly.features]) expect(html).toContain(f.replace("'", "&#x27;"));
    expect(html).not.toMatch(/classroom|school|license/i);
    expect(html).not.toContain("/teachers");
  });

  it("FAQ prices come from the plans, with no decimals and no licenses", () => {
    const faq = renderToStaticMarkup(<PricingFAQ />);
    expect(faq).toContain("$100 (£80)");
    expect(faq).toContain("$10 (£8)");
    expect(faq).not.toMatch(DECIMAL_WHOLE);
    expect(faq).not.toMatch(/classroom|school|license/i);
  });
});

describe("llms.txt", () => {
  it("states the prices as $100 (£80) and $10 (£8) a month", async () => {
    const text = await llmsTxt().text();
    expect(text).toContain("one-time $100 (£80)");
    expect(text).toContain("$10 (£8) a month");
    expect(text).not.toMatch(DECIMAL_WHOLE);
  });
});

describe("checkout copy", () => {
  it("covers both plans with the refund line and names no amount (Stripe shows the discounted price beside it)", () => {
    for (const id of PLAN_IDS) {
      const line = checkoutSubmitText(PLANS[id]);
      expect(line).toContain("14 days for a full refund");
      expect(line).not.toMatch(/[$£]\d/);
    }
  });
});

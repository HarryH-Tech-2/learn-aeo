import { describe, it, expect, vi } from "vitest";
import fs from "node:fs";
import path from "node:path";

vi.mock("next-auth/react", () => ({ useSession: () => ({ data: null, status: "unauthenticated" }) }));
vi.mock("next/navigation", () => ({ useSearchParams: () => new URLSearchParams(), useRouter: () => ({ replace: vi.fn(), push: vi.fn() }) }));
vi.mock("@/components/AuthModal", () => ({ useAuthModal: () => ({ openAuthModal: vi.fn() }) }));

import { renderToStaticMarkup } from "react-dom/server";
import PricingSection from "@/components/PricingSection";

const count = (html: string, tag: string) => (html.match(new RegExp(`<${tag}[\\s>]`, "g")) ?? []).length;

describe("/pricing headings", () => {
  it("the pricing page asks the section for its h1 and has no other", () => {
    const src = fs.readFileSync(path.resolve(__dirname, "../pricing/page.tsx"), "utf8");
    expect(src).toMatch(/<PricingSection\s+headingAs="h1"\s*\/>/);
    expect(count(src, "h1")).toBe(0);
  });

  it("the section renders its headline as an h1 when asked, and an h2 by default (home)", () => {
    const asH1 = renderToStaticMarkup(<PricingSection headingAs="h1" />);
    expect(count(asH1, "h1")).toBe(1);
    expect(asH1).toMatch(/<h1[^>]*>Get cited by/);
    expect(count(renderToStaticMarkup(<PricingSection />), "h1")).toBe(0);
  });
});

import { describe, expect, it, vi } from "vitest";

// Review Focus 4: the headline, subline and CTA are in the server HTML, visible without JS or WebGL.
vi.mock("next-auth/react", () => ({ useSession: () => ({ data: null, status: "unauthenticated" }) }));
vi.mock("@/components/AuthModal", () => ({ useAuthModal: () => ({ openAuthModal: vi.fn() }) }));

import { renderToStaticMarkup } from "react-dom/server";
import HeroSection from "@/components/HeroSection";

describe("HeroSection server render", () => {
  const html = renderToStaticMarkup(<HeroSection />);

  it("has the h1 with the keyword", () => {
    const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
    expect(h1).not.toBeNull();
    expect(h1![1].replace(/<[^>]+>/g, "")).toMatch(/answer engine optimization/i);
  });

  it("has the subline and the free-lesson CTA", () => {
    expect(html).toContain("ChatGPT, Perplexity and Google AI Overviews");
    expect(html).toContain("Start lesson 1");
  });

  it("never hides the copy in the server HTML", () => {
    expect(html).not.toMatch(/<h1[^>]*opacity-0/);
    expect(html).not.toMatch(/class="[^"]*\bopacity-0\b[^"]*"[^>]*>[\s\S]*Start lesson 1/);
    expect(html).not.toMatch(/city-hero-copy[^"]*\bhidden\b/);
  });

  it("renders a canvas host but no WebGL content on the server", () => {
    expect(html).toContain("city-hero-canvas");
  });
});

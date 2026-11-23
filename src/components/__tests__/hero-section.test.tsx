import { describe, expect, it, vi } from "vitest";

// Review Focus 4: the headline, subline and CTA are in the server HTML, visible without JS.
vi.mock("next-auth/react", () => ({ useSession: () => ({ data: null, status: "unauthenticated" }) }));
vi.mock("@/components/AuthModal", () => ({ useAuthModal: () => ({ openAuthModal: vi.fn() }) }));

import { renderToStaticMarkup } from "react-dom/server";
import HeroSection from "@/components/HeroSection";
import { LESSON_CATALOG } from "@/lib/lesson-catalog";

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
    expect(html).not.toMatch(/home-hero-copy[^"]*\bhidden\b/);
  });

  it("shows the mock cited answer as one labeled picture, with no canvas", () => {
    expect(html).toContain("hero-answer");
    expect(html).toMatch(/role="img" aria-label="An AI answer that cites three sources/);
    expect(html).not.toMatch(/<canvas/);
  });

  it("plays a silent, decorative background clip that has a poster and is skipped for reduced motion", () => {
    expect(html).toMatch(/<div class="home-hero-backdrop" aria-hidden="true"><video[^>]*\bmuted=""[^>]*\bposter="\/hero\/flow-poster\.webp"/);
    expect(html).toMatch(/<source src="\/hero\/flow\.webm"[^>]*media="\(prefers-reduced-motion: no-preference\)"/);
    expect(html).toMatch(/<source src="\/hero\/flow\.mp4"[^>]*media="\(prefers-reduced-motion: no-preference\)"/);
  });

  it("lists the course facts from the catalog", () => {
    expect(html).toContain(`${LESSON_CATALOG.length} lessons`);
    expect(html).toContain("Lesson 1 is free");
  });
});

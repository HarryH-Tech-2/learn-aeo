import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { OG_SIZE, ogCard, ogTitleSize } from "@/lib/og-image";

describe("ogCard", () => {
  it("is 1200 by 630", () => {
    expect(OG_SIZE).toEqual({ width: 1200, height: 630 });
  });

  it("shows the eyebrow, title, footer and brand", () => {
    const html = renderToStaticMarkup(ogCard({ eyebrow: "Lesson 2 · The Crawl Docks", title: "Make your site reachable by AI", footer: "30 minutes" }));
    for (const t of ["Lesson 2 · The Crawl Docks", "Make your site reachable by AI", "30 minutes", "Learn", "AEO"]) expect(html).toContain(t);
  });

  it("sets long titles smaller so they fit", () => {
    expect(ogTitleSize("x".repeat(90))).toBeLessThan(ogTitleSize("x".repeat(30)));
    expect(ogTitleSize("x".repeat(30))).toBeLessThanOrEqual(96);
  });
});

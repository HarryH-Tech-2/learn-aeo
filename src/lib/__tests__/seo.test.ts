import { describe, it, expect } from "vitest";
import { pageMetadata, privateMetadata } from "@/lib/seo";
import { SITE, absoluteUrl } from "@/lib/site";

describe("pageMetadata", () => {
  const m = pageMetadata({ title: "Pricing", description: "x".repeat(80), path: "/pricing" });

  it("sets the canonical and og:url to the page's absolute URL", () => {
    expect(m.alternates?.canonical).toBe(absoluteUrl("/pricing"));
    expect((m.openGraph as { url: string }).url).toBe(absoluteUrl("/pricing"));
  });

  it("uses the template title, and the full title for social cards", () => {
    expect(m.title).toBe("Pricing");
    expect(m.openGraph?.title).toBe(`Pricing | ${SITE.name}`);
    expect(m.twitter?.title).toBe(`Pricing | ${SITE.name}`);
  });

  it("falls back to the default OG image", () => {
    const img = (m.openGraph?.images as { url: string }[])[0];
    expect(img.url).toBe("/og-default.png");
    expect((m.twitter as { card: string }).card).toBe("summary_large_image");
  });

  it("can leave images to a file-based opengraph-image", () => {
    const n = pageMetadata({ title: "L", description: "d", path: "/lessons/x", image: null });
    expect(n.openGraph && "images" in n.openGraph).toBe(false);
    expect(n.twitter && "images" in n.twitter).toBe(false);
  });

  it("bypasses the template with absoluteTitle", () => {
    const h = pageMetadata({ title: "Learn AEO | Learn answer engine optimization", description: "d", path: "/", absoluteTitle: true });
    expect(h.title).toEqual({ absolute: "Learn AEO | Learn answer engine optimization" });
    expect(h.openGraph?.title).toBe("Learn AEO | Learn answer engine optimization");
  });

  it("marks noindex pages", () => {
    expect(pageMetadata({ title: "B", description: "d", path: "/blog", noindex: true }).robots).toEqual({ index: false, follow: true });
    expect(m.robots).toBeUndefined();
  });
});

describe("privateMetadata", () => {
  it("is noindex, nofollow, with no canonical", () => {
    const p = privateMetadata("Dashboard");
    expect(p.robots).toEqual({ index: false, follow: false });
    expect(p.alternates).toBeUndefined();
    expect(p.title).toBe("Dashboard");
  });

  it("has its own social card, so a shared private link never shows the home card", () => {
    const p = privateMetadata("Certificate verification", "A verified Learn AEO certificate.");
    expect(p.openGraph?.title).toBe(`Certificate verification | ${SITE.name}`);
    expect(p.openGraph?.description).toBe("A verified Learn AEO certificate.");
    expect(p.twitter?.title).toBe(`Certificate verification | ${SITE.name}`);
  });
});

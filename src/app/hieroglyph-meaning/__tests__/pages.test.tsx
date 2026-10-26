import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

// The site chrome needs a session provider; these tests are about the page body.
vi.mock("@/components/Navbar", () => ({ default: () => null }));
vi.mock("@/components/Footer", () => ({ default: () => null }));
vi.mock("@/components/GuestPlayBanner", () => ({ default: () => <div data-testid="guest-play" /> }));

import SignMeaningPage, { generateMetadata, generateStaticParams } from "../[slug]/page";
import SignMeaningHub, { metadata as hubMetadata } from "../page";
import { SIGN_MEANINGS } from "@/lib/sign-meanings";

function jsonLd(html: string): Array<Record<string, unknown>> {
  const m = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/.exec(html);
  return m ? JSON.parse(m[1]) : [];
}

describe("/hieroglyph-meaning/[slug]", () => {
  it("statically generates one page per sign", () => {
    expect(generateStaticParams()).toEqual(SIGN_MEANINGS.map((s) => ({ slug: s.slug })));
  });

  for (const sign of SIGN_MEANINGS) {
    it(`renders ${sign.slug} with title, H1, copy button, CTAs and JSON-LD`, async () => {
      const meta = await generateMetadata({ params: Promise.resolve({ slug: sign.slug }) });
      expect(meta.title).toBe(sign.metaTitle);
      expect(meta.alternates?.canonical).toBe(`https://www.learnhieroglyphics.com/hieroglyph-meaning/${sign.slug}`);

      const html = renderToStaticMarkup(await SignMeaningPage({ params: Promise.resolve({ slug: sign.slug }) }));
      expect(html).toMatch(new RegExp(`<h1[^>]*>.*${sign.glyph}`));
      expect(html).toContain(`Copy ${sign.glyph}`);
      expect(html).toContain(sign.codePoint);
      expect(html).toContain('href="/translate-name-to-hieroglyphics"');
      expect(html).toContain('href="/lessons/expedition-begins?play=1"');
      expect(html).toContain('href="/blog/what-does-the-ankh-symbol-mean"');
      for (const other of SIGN_MEANINGS.filter((s) => s.slug !== sign.slug)) {
        expect(html).toContain(`href="/hieroglyph-meaning/${other.slug}"`);
      }

      const types = jsonLd(html).map((j) => j["@type"]);
      expect(types).toEqual(["Article", "FAQPage", "BreadcrumbList"]);
      const faq = jsonLd(html)[1] as { mainEntity: { name: string }[] };
      expect(faq.mainEntity[0].name).toBe(`What does ${sign.glyph} mean?`);
    });
  }
});

describe("/hieroglyph-meaning hub", () => {
  it("lists the three signs and the ankh post", () => {
    expect(String(hubMetadata.title)).toContain("𓂀 𓋹 𓆣 𓊽");
    const html = renderToStaticMarkup(<SignMeaningHub />);
    for (const s of SIGN_MEANINGS) expect(html).toContain(`href="/hieroglyph-meaning/${s.slug}"`);
    expect(html).toContain('href="/blog/what-does-the-ankh-symbol-mean"');
    expect(jsonLd(html).map((j) => j["@type"])).toEqual(["CollectionPage", "BreadcrumbList"]);
  });
});

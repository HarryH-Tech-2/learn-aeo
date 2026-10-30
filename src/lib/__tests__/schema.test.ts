import { describe, it, expect } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import fs from "node:fs";
import path from "node:path";
import JsonLd from "@/components/JsonLd";
import { LESSON_CATALOG } from "@/lib/lesson-catalog";
import { PLANS, PLAN_IDS } from "@/lib/plans";
import { SITE } from "@/lib/site";
import {
  COURSE_ID,
  ORG_ID,
  WEBSITE_ID,
  blogPostingSchema,
  breadcrumbSchema,
  courseSchema,
  faqSchema,
  learningResourceSchema,
  organizationSchema,
  webApplicationSchema,
  definedTermSchema,
  definedTermSetSchema,
  GLOSSARY_ID,
  websiteSchema,
} from "@/lib/schema";
import { TOOLS } from "@/lib/tools";
import { GLOSSARY } from "@/lib/glossary";

const parse = (html: string) => {
  const m = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  return JSON.parse(m![1]);
};

describe("JsonLd", () => {
  it("cannot be broken out of by a closing script tag in the data", () => {
    const evil = "</script><script>alert(1)</script><!--";
    const html = renderToStaticMarkup(createElement(JsonLd, { data: { "@type": "Thing", name: evil } }));
    expect(html.match(/<script/g)).toHaveLength(1);
    expect(html).not.toContain("<!--");
    expect(parse(html).name).toBe(evil);
    expect(parse(html)["@context"]).toBe("https://schema.org");
  });

  it("wraps several nodes in one @graph", () => {
    const html = renderToStaticMarkup(createElement(JsonLd, { data: [organizationSchema(), websiteSchema()] }));
    const doc = parse(html);
    expect(doc["@context"]).toBe("https://schema.org");
    expect(doc["@graph"].map((n: { "@id": string }) => n["@id"])).toEqual([ORG_ID, WEBSITE_ID]);
  });
});

describe("entities", () => {
  it("links the WebSite to the Organization by @id", () => {
    expect(ORG_ID).toBe(`${SITE.url}/#organization`);
    expect(websiteSchema().publisher).toMatchObject({ "@id": ORG_ID });
  });

  it("prices the Course from the plan catalog", () => {
    const c = courseSchema();
    expect(c["@id"]).toBe(COURSE_ID);
    expect(c.offers.map((o) => o.price)).toEqual(PLAN_IDS.map((id) => String(PLANS[id].usd)));
    expect(c.offers.every((o) => o.priceCurrency === "USD")).toBe(true);
    expect(c.provider).toMatchObject({ "@id": ORG_ID });
  });

  it("lists exactly the live lessons as syllabus sections", () => {
    const live = LESSON_CATALOG.filter((l) => l.status === "live").map((l) => l.title);
    expect(courseSchema().syllabusSections.map((s) => s.name)).toEqual(live);
  });

  it("makes each lesson part of the course", () => {
    const r = learningResourceSchema(LESSON_CATALOG[0]);
    expect(r.isPartOf).toEqual({ "@id": COURSE_ID });
    expect(r.provider).toMatchObject({ "@id": ORG_ID });
    expect(r.timeRequired).toBe(`PT${LESSON_CATALOG[0].minutes}M`);
  });

  it("builds breadcrumbs with absolute items from position 1", () => {
    const b = breadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Pricing", path: "/pricing" },
    ]);
    expect(b.itemListElement.map((i) => [i.position, i.item])).toEqual([
      [1, SITE.url],
      [2, `${SITE.url}/pricing`],
    ]);
  });

  it("builds an FAQPage", () => {
    const f = faqSchema([{ question: "Q?", answer: "A." }], `${SITE.url}/x`);
    expect(f["@type"]).toBe("FAQPage");
    expect(f.mainEntity[0]).toEqual({ "@type": "Question", name: "Q?", acceptedAnswer: { "@type": "Answer", text: "A." } });
  });

  it("credits blog posts to the Organization, never a person", () => {
    const p = blogPostingSchema({
      url: `${SITE.url}/blog/x`,
      title: "T",
      description: "D",
      abstract: "A",
      image: { url: `${SITE.url}/x.webp`, width: 1024, height: 1024, caption: "c" },
      datePublished: "2026-10-28",
      dateModified: "2026-10-28",
      section: "Basics",
      wordCount: 100,
      minutes: 1,
    });
    expect(p.author).toMatchObject({ "@id": ORG_ID });
    expect(p.publisher).toMatchObject({ "@id": ORG_ID });
  });
});

describe("references a validator can read on its own", () => {
  it("names the Organization wherever it is referenced (Google may not join @ids across script blocks)", () => {
    const ref = { "@type": "Organization", "@id": ORG_ID, name: SITE.name, url: SITE.url };
    expect(courseSchema().provider).toEqual(ref);
    expect(learningResourceSchema(LESSON_CATALOG[0]).provider).toEqual(ref);
    expect(websiteSchema().publisher).toEqual(ref);
  });

  it("labels each offer by how it is paid: one-time Paid, monthly Subscription", () => {
    const byName = Object.fromEntries(courseSchema().offers.map((o) => [o.name, o.category]));
    expect(byName[PLANS.lifetime.name]).toBe("Paid");
    expect(byName[PLANS.monthly.name]).toBe("Subscription");
  });
});

describe("webApplicationSchema", () => {
  it("describes a free tool provided by the Organization", () => {
    const w = webApplicationSchema(TOOLS[0]);
    expect(w["@type"]).toBe("WebApplication");
    expect(w.name).toBe(TOOLS[0].name);
    expect(w.url).toBe(`${SITE.url}/tools/${TOOLS[0].slug}`);
    expect(w.offers).toMatchObject({ "@type": "Offer", price: "0", priceCurrency: "USD" });
    expect(w.isAccessibleForFree).toBe(true);
    expect(w.provider).toMatchObject({ "@id": ORG_ID, name: SITE.name });
  });
});

describe("glossary schema", () => {
  it("makes a DefinedTermSet of every term, each part of the set", () => {
    const set = definedTermSetSchema(GLOSSARY);
    expect(set["@type"]).toBe("DefinedTermSet");
    expect(set["@id"]).toBe(GLOSSARY_ID);
    expect(set.hasDefinedTerm).toHaveLength(GLOSSARY.length);
    const t = definedTermSchema(GLOSSARY[0]);
    expect(t).toMatchObject({ "@type": "DefinedTerm", name: GLOSSARY[0].term, description: GLOSSARY[0].definition, inDefinedTermSet: { "@id": GLOSSARY_ID } });
    expect(t.url).toBe(`${SITE.url}/glossary/${GLOSSARY[0].slug}`);
  });
});

describe("one place for JSON-LD", () => {
  const root = path.resolve(__dirname, "../../..");
  const files: string[] = [];
  const walk = (dir: string) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) {
        if (e.name !== "__tests__") walk(p);
      } else if (/\.(ts|tsx)$/.test(e.name)) files.push(path.relative(root, p).replace(/\\/g, "/"));
    }
  };
  walk(path.join(root, "src"));

  it("only JsonLd writes ld+json script tags (content data may show the tag as example text)", () => {
    const offenders = files.filter(
      (f) => f !== "src/components/JsonLd.tsx" && !f.startsWith("src/lib/content/") && fs.readFileSync(path.join(root, f), "utf8").includes("application/ld+json")
    );
    expect(offenders).toEqual([]);
  });

  it("never names a Person", () => {
    const offenders = files.filter((f) => /"@type":\s*"Person"|@type: "Person"/.test(fs.readFileSync(path.join(root, f), "utf8")));
    expect(offenders).toEqual([]);
  });
});

describe("SEO audit (2026-10-30)", () => {
  it("links syllabus sections only where a signed-out crawler can follow: the free lessons", () => {
    for (const s of courseSchema().syllabusSections) {
      const lesson = LESSON_CATALOG.find((l) => l.title === s.name)!;
      expect("url" in s, s.name).toBe(lesson.isFree);
    }
  });

  it("states the monthly plan's billing period, so $10 doesn't read as a one-time price", () => {
    const byName = Object.fromEntries(courseSchema().offers.map((o) => [o.name, o]));
    expect(byName[PLANS.monthly.name].priceSpecification).toMatchObject({
      "@type": "UnitPriceSpecification",
      price: String(PLANS.monthly.usd),
      priceCurrency: "USD",
      billingDuration: "P1M",
    });
    expect("priceSpecification" in byName[PLANS.lifetime.name]).toBe(false);
  });

  it("gives the Organization a logo ImageObject and a support contact", () => {
    const o = organizationSchema();
    expect(o.logo).toMatchObject({ "@type": "ImageObject", url: `${SITE.url}/icon-512.png`, width: 512, height: 512 });
    expect(o.contactPoint).toMatchObject({ "@type": "ContactPoint", email: SITE.supportEmail });
  });

  it("names the Blog a post is part of, so the reference reads on the post page alone", () => {
    const p = blogPostingSchema({
      url: `${SITE.url}/blog/x`, title: "T", description: "D", abstract: "A",
      image: { url: `${SITE.url}/x.webp`, width: 1024, height: 1024, caption: "c" },
      datePublished: "2026-10-28", dateModified: "2026-10-28", section: "Basics", wordCount: 100, minutes: 1,
    });
    expect(p.isPartOf).toMatchObject({ "@type": "Blog", "@id": `${SITE.url}/blog#blog`, url: `${SITE.url}/blog` });
  });
});

describe("FAQPage identity (SEO audit 2026-10-30)", () => {
  it("ties every FAQPage to its page with an @id and url", () => {
    const f = faqSchema([{ question: "Q?", answer: "A." }], `${SITE.url}/pricing`);
    expect(f["@id"]).toBe(`${SITE.url}/pricing#faq`);
    expect(f.url).toBe(`${SITE.url}/pricing`);
  });

  it("passes a page URL at every call site", () => {
    const files = ["src/components/FAQSection.tsx", "src/components/PricingFAQ.tsx", "src/components/tools/ToolPage.tsx", "src/app/blog/[slug]/page.tsx"];
    for (const f of files) {
      const src = fs.readFileSync(path.resolve(__dirname, "../../..", f), "utf8");
      expect(src, f).not.toMatch(/faqSchema\(faqs\)/);
    }
  });
});

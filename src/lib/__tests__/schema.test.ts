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
  websiteSchema,
} from "@/lib/schema";

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
    const f = faqSchema([{ question: "Q?", answer: "A." }]);
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

  it("only JsonLd writes ld+json script tags", () => {
    const offenders = files.filter(
      (f) => f !== "src/components/JsonLd.tsx" && fs.readFileSync(path.join(root, f), "utf8").includes("application/ld+json")
    );
    expect(offenders).toEqual([]);
  });

  it("never names a Person", () => {
    const offenders = files.filter((f) => /"@type":\s*"Person"|@type: "Person"/.test(fs.readFileSync(path.join(root, f), "utf8")));
    expect(offenders).toEqual([]);
  });
});

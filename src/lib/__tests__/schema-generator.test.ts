import { describe, it, expect } from "vitest";
import { FIELDS, buildSchema, schemaScript } from "@/lib/schema-generator";

describe("buildSchema", () => {
  it("builds Organization JSON-LD and drops empty fields", () => {
    const { data, hints } = buildSchema("Organization", {
      name: " Larkfield Tea ",
      url: "https://www.example.com",
      logo: "https://www.example.com/logo.png",
      sameAs: "https://www.linkedin.com/company/x\n\n https://x.com/x ",
      email: "",
    });
    expect(data).toEqual({
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Larkfield Tea",
      url: "https://www.example.com",
      logo: "https://www.example.com/logo.png",
      sameAs: ["https://www.linkedin.com/company/x", "https://x.com/x"],
    });
    expect(hints.filter((h) => h.level === "error")).toEqual([]);
  });

  it("flags missing required fields, relative URLs and bad sameAs lines", () => {
    const { hints } = buildSchema("Organization", { name: "", url: "/home", sameAs: "linkedin.com/x" });
    const errors = hints.filter((h) => h.level === "error").map((h) => h.text);
    expect(errors).toEqual(expect.arrayContaining(["Organization name is required.", "Website must be a full URL starting with https://."]));
    expect(errors.some((t) => t.includes("linkedin.com/x"))).toBe(true);
  });

  it("builds an Article with nested author and publisher, and checks the dates", () => {
    const { data, hints } = buildSchema("Article", {
      headline: "How long does AEO take?",
      authorName: "Sam Lee",
      authorUrl: "https://www.example.com/sam",
      datePublished: "2026-10-01",
      dateModified: "2026-09-01",
      publisherName: "Larkfield Tea",
    });
    expect(data.author).toEqual({ "@type": "Person", name: "Sam Lee", url: "https://www.example.com/sam" });
    expect(data.publisher).toEqual({ "@type": "Organization", name: "Larkfield Tea" });
    expect(hints.some((h) => h.level === "error" && /earlier than the published/.test(h.text))).toBe(true);
    expect(buildSchema("Article", { headline: "x", datePublished: "01/10/2026" }).hints.some((h) => /ISO 8601/.test(h.text))).toBe(true);
    expect(buildSchema("Article", { headline: "x", authorName: "Admin" }).hints.some((h) => /real person/.test(h.text))).toBe(true);
  });

  it("builds a Product offer and rating, and warns when Google's product snippet needs are not met", () => {
    const { data } = buildSchema("Product", { name: "Tea", price: "12.50", currency: "gbp", availability: "InStock", ratingValue: "4.6", reviewCount: "128" });
    expect(data.offers).toEqual({ "@type": "Offer", price: "12.50", priceCurrency: "GBP", availability: "https://schema.org/InStock" });
    expect(data.aggregateRating).toEqual({ "@type": "AggregateRating", ratingValue: "4.6", reviewCount: "128" });
    expect(buildSchema("Product", { name: "Tea" }).hints.some((h) => /offers \(a price\), aggregateRating or review/.test(h.text))).toBe(true);
    const bad = buildSchema("Product", { name: "Tea", price: "£12", currency: "" }).hints.filter((h) => h.level === "error");
    expect(bad.length).toBe(2);
  });

  it("every kind has at least one required field and unique keys", () => {
    for (const defs of Object.values(FIELDS)) {
      expect(defs.some((d) => d.required)).toBe(true);
      expect(new Set(defs.map((d) => d.key)).size).toBe(defs.length);
    }
  });
});

describe("schemaScript", () => {
  it("wraps the JSON in a script tag and escapes a closing tag inside strings", () => {
    const out = schemaScript({ "@type": "Thing", name: "</script><b>" });
    expect(out.startsWith('<script type="application/ld+json">')).toBe(true);
    expect(out).toContain("<\\/script><b>");
    expect(out.match(/<\/script>/g)).toHaveLength(1);
  });
});

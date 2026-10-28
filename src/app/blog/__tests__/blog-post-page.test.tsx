import { describe, it, expect, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { ReactElement } from "react";
import type { BlogPost } from "@/lib/blog-posts";

const fixture: BlogPost = vi.hoisted(() => ({
  slug: "what-is-query-fan-out",
  title: "What is query fan-out?",
  excerpt: "How one prompt becomes many searches.",
  quickAnswer: "Query fan-out is when an answer engine splits **one prompt** into several searches.",
  date: "1 November 2026",
  publishedAt: "2026-11-01",
  category: "Basics",
  image: "/blog/query-fan-out.webp",
  imageAlt: "Diagram of one prompt branching into searches",
  relatedSlugs: [],
  faqs: [{ question: "Is it the same as keyword research?", answer: "No." }],
  content: "## The idea\n\nOne prompt, many searches.\n\n## Why it matters\n\nYour page may match only one of them.",
  sources: [],
}));

vi.mock("@/lib/blog-posts", () => ({
  blogPosts: [fixture],
  getPostBySlug: (slug: string) => (slug === fixture.slug ? fixture : undefined),
}));
vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
}));

import BlogPostPage, { generateStaticParams } from "@/app/blog/[slug]/page";
import { ArticleBody, QuickAnswer } from "@/app/blog/[slug]/PostBody";
import { extractH2s, withInBodyLinks, IN_BODY_LINKS_MD } from "@/app/blog/blog-text";
import JsonLd from "@/components/JsonLd";
import { ORG_ID } from "@/lib/schema";

describe("blog post page", () => {
  it("calls notFound() for an unknown slug", async () => {
    await expect(BlogPostPage({ params: Promise.resolve({ slug: "no-such-post" }) })).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("pre-renders each post slug", async () => {
    expect(await generateStaticParams()).toEqual([{ slug: fixture.slug }]);
  });

  it("builds JSON-LD and passes the headings to the content for a known post", async () => {
    const el = (await BlogPostPage({ params: Promise.resolve({ slug: fixture.slug }) })) as ReactElement<{
      children: ReactElement<Record<string, unknown>>[];
    }>;
    const kids = el.props.children.flat().filter(Boolean);
    const ldEl = kids.find((k) => k.type === JsonLd)!;
    const ld = JSON.parse(renderToStaticMarkup(ldEl).replace(/^<script[^>]*>|<\/script>$/g, ""))["@graph"];
    expect(ld.map((x: { "@type": string }) => x["@type"])).toEqual(["BlogPosting", "FAQPage", "BreadcrumbList"]);
    expect(ld[0].headline).toBe(fixture.title);
    expect(ld[0].author).toMatchObject({ "@type": "Organization", "@id": ORG_ID });
    expect(ld[0].keywords).not.toMatch(/alphabet|translate/i);
    const content = kids.find((k) => k.type !== JsonLd)!;
    expect((content.props.headings as { text: string }[]).map((h) => h.text)).toEqual(["The idea", "Why it matters"]);
  });

  it("renders the quick answer and body, with the lesson link inserted after the first section", () => {
    expect(renderToStaticMarkup(<QuickAnswer md={fixture.quickAnswer} />)).toContain("<strong");
    const md = withInBodyLinks(fixture.content);
    expect(md).toContain(IN_BODY_LINKS_MD);
    expect(extractH2s(md)).toEqual(extractH2s(fixture.content));
    const html = renderToStaticMarkup(<ArticleBody md={md} />);
    expect(html).toContain("Why it matters");
    expect(html).toContain("take the free first lesson");
  });
});

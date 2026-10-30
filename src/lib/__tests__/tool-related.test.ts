// Each live tool page links to the glossary terms and posts that explain what it checks (SEO audit 2026-10-30).
import { describe, it, expect } from "vitest";
import { TOOLS, TOOL_RELATED } from "@/lib/tools";
import { getTerm } from "@/lib/glossary";
import { getPostBySlug } from "@/lib/blog-posts";

describe("tool related reading", () => {
  it("gives every live tool at least three links, all to real glossary terms or posts", () => {
    for (const tool of TOOLS.filter((t) => t.status === "live")) {
      const links = TOOL_RELATED[tool.slug] ?? [];
      expect(links.length, tool.slug).toBeGreaterThanOrEqual(3);
      for (const href of links) {
        const [, kind, slug] = href.split("/");
        if (kind === "glossary") expect(getTerm(slug), href).toBeDefined();
        else if (kind === "blog") expect(getPostBySlug(slug), href).toBeDefined();
        else throw new Error(`unexpected link ${href}`);
      }
    }
  });
});

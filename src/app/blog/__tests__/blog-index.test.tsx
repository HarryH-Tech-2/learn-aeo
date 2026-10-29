import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { BlogComingSoon } from "@/app/blog/BlogContent";
import { metadata } from "@/app/blog/page";
import { blogPosts } from "@/lib/blog-posts";
import { FIRST_LESSON_PATH } from "@/lib/lesson-catalog";

describe("blog index", () => {
  it("ships the launch posts and is indexable", () => {
    expect(blogPosts.length).toBeGreaterThan(0);
    expect(metadata.robots ?? { index: true }).toMatchObject({ index: true });
  });

  it("keeps a coming-soon message with a link to lesson 1 for an empty blog, with no post cards", () => {
    const html = renderToStaticMarkup(<BlogComingSoon />);
    expect(html).toContain("Articles are on their way");
    expect(html).toContain(`href="${FIRST_LESSON_PATH}"`);
    expect(html).not.toContain("<article");
    expect(html).not.toContain("/blog/");
  });
});

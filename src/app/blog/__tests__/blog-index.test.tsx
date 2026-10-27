import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { BlogComingSoon } from "@/app/blog/BlogContent";
import { metadata } from "@/app/blog/page";
import { blogPosts } from "@/lib/blog-posts";
import { FIRST_LESSON_PATH } from "@/lib/lesson-catalog";

describe("blog index with no posts", () => {
  it("ships no posts", () => {
    expect(blogPosts).toEqual([]);
  });

  it("shows the coming-soon message and a link to lesson 1, with no post cards", () => {
    const html = renderToStaticMarkup(<BlogComingSoon />);
    expect(html).toContain("Articles are on their way");
    expect(html).toContain(`href="${FIRST_LESSON_PATH}"`);
    expect(html).not.toContain("<article");
    expect(html).not.toContain("/blog/");
  });

  it("is noindex while there are no posts", () => {
    expect(metadata.robots).toMatchObject({ index: false });
  });
});

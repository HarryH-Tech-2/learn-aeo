// The author named in the JSON-LD is named on the page too: a byline on every post and lesson, and a
// bio with the LinkedIn profile on /about#author.
import { describe, it, expect, vi } from "vitest";

vi.mock("next-auth/react", () => ({ useSession: () => ({ data: null, status: "loading" }) }));
vi.mock("next/navigation", () => ({
  useParams: () => ({ id: "how-answer-engines-choose-sources" }),
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
  usePathname: () => "/about",
}));
vi.mock("@/components/AuthModal", () => ({ useAuthModal: () => ({ openAuthModal: vi.fn() }) }));

import { renderToStaticMarkup } from "react-dom/server";
import AboutContent from "@/app/about/AboutContent";
import BlogPostContent from "@/app/blog/[slug]/BlogPostContent";
import LessonPage from "@/app/lessons/[id]/page";
import { blogPosts } from "@/lib/blog-posts";

const LINKEDIN = "https://www.linkedin.com/in/harry-harrison/";

describe("author on the page", () => {
  it("the About page has the author section with the LinkedIn profile", () => {
    const html = renderToStaticMarkup(<AboutContent />);
    expect(html).toContain('id="author"');
    expect(html).toContain("Harry Harrison");
    expect(html).toContain(`href="${LINKEDIN}"`);
  });

  it("a blog post has a byline linking to the author section", () => {
    const html = renderToStaticMarkup(
      <BlogPostContent post={blogPosts[0]} headings={[]} minutes={5} related={[]} quickAnswer={null} body={null} sources={null} />,
    );
    expect(html).toMatch(/By <a[^>]*href="\/about#author"[^>]*>Harry Harrison<\/a>/);
    expect(html).not.toContain("the Learn AEO team");
  });

  it("the free lesson's server HTML names its author", async () => {
    const html = renderToStaticMarkup(await LessonPage({ params: Promise.resolve({ id: "how-answer-engines-choose-sources" }) }));
    expect(html).toMatch(/By <a[^>]*href="\/about#author"[^>]*>Harry Harrison<\/a>/);
  });
});

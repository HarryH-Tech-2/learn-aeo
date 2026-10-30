// The blog index's summary of a post and the post page share one @id, so their facts must agree.
import { describe, it, expect, vi } from "vitest";

vi.mock("next-auth/react", () => ({ useSession: () => ({ data: null, status: "unauthenticated" }) }));
vi.mock("next/navigation", () => ({ useSearchParams: () => new URLSearchParams(), useRouter: () => ({ replace: vi.fn(), push: vi.fn() }), usePathname: () => "/blog" }));
vi.mock("@/components/AuthModal", () => ({ useAuthModal: () => ({ openAuthModal: vi.fn() }) }));
import { renderToStaticMarkup } from "react-dom/server";
import BlogPage from "@/app/blog/page";
import { blogPosts } from "@/lib/blog-posts";
import { countWords, withInBodyLinks } from "@/app/blog/blog-text";

describe("blog wordCount", () => {
  it("is the same on the index as on the post page (which counts the rendered body)", () => {
    const html = renderToStaticMarkup(<BlogPage />);
    const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
    const text = JSON.stringify(blocks);
    for (const post of blogPosts) {
      const expected = countWords(withInBodyLinks(post.content));
      expect(text, post.slug).toContain(`"wordCount":${expected}`);
    }
  });
});

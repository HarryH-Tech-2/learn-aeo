import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { blogPosts, type BlogPost } from "@/lib/blog-posts";
import { LESSONS } from "@/lib/lessons";
import { TOOLS, toolPath, type ToolMeta } from "@/lib/tools";

// Real edit dates, not `new Date()`: Google treats per-request timestamps as a weak freshness
// signal. Bump a date when those pages are substantively edited.
// Marketing and legal pages: Learn AEO copy (Plans 3–5).
const SITE_LASTMOD = new Date("2026-10-28");
// The home page: the City of Answers hero and the tools section (Plan 4).
const HOME_LASTMOD = new Date("2026-10-28");
// The lesson catalog and lessons 1–3.
const LESSONS_LASTMOD = new Date("2026-10-27");
// Tool pages go live in Plan 6; bump when one changes.
const TOOLS_LASTMOD = new Date("2026-10-28");

export default function sitemap(): MetadataRoute.Sitemap {
  return buildSitemap({ posts: blogPosts, tools: TOOLS });
}

/** Parameterized on the posts and tools so the with-posts and live-tool paths can be tested before they exist. */
export function buildSitemap({
  posts,
  tools,
}: {
  posts: Pick<BlogPost, "slug" | "publishedAt" | "updatedAt">[];
  tools: readonly ToolMeta[];
}): MetadataRoute.Sitemap {
  const baseUrl = SITE.url;

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: HOME_LASTMOD,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: SITE_LASTMOD,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: SITE_LASTMOD,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: SITE_LASTMOD,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/get-started`,
      lastModified: SITE_LASTMOD,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/leaderboard`,
      lastModified: SITE_LASTMOD,
      changeFrequency: "daily",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: SITE_LASTMOD,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: SITE_LASTMOD,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  // /blog is noindex while there are no posts, so it stays out until the first post exists. Its lastmod is then
  // the newest post date.
  const newestPost = posts.reduce<string | null>((max, post) => {
    const d = post.updatedAt ?? post.publishedAt;
    return max === null || d > max ? d : max;
  }, null);
  const blogIndexPages: MetadataRoute.Sitemap =
    newestPost === null
      ? []
      : [{ url: `${baseUrl}/blog`, lastModified: new Date(newestPost), changeFrequency: "weekly", priority: 0.9 }];

  const blogPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt ?? post.publishedAt),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // Only live lessons a signed-out visitor (i.e. Googlebot) can actually open.
  // Paid lessons 307 to /get-started via middleware, and a sitemap full of
  // redirecting URLs is a quality signal against the whole file. Coming-soon
  // pages are noindex, so they stay out too.
  const lessonPages: MetadataRoute.Sitemap = LESSONS
    .filter((lesson) => lesson.isFree && lesson.status === "live")
    .map((lesson) => ({
      url: `${baseUrl}/lessons/${lesson.id}`,
      lastModified: LESSONS_LASTMOD,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }));

  // Only tools whose page exists (status "live" in src/lib/tools.ts).
  const toolPages: MetadataRoute.Sitemap = tools
    .filter((t) => t.status === "live")
    .map((t) => ({
      url: `${baseUrl}${toolPath(t.slug)}`,
      lastModified: TOOLS_LASTMOD,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }));

  return [...staticPages, ...blogIndexPages, ...blogPages, ...lessonPages, ...toolPages];
}

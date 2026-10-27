import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { blogPosts, type BlogPost } from "@/lib/blog-posts";
import { LESSONS } from "@/lib/lessons";

// Static content lastmod — bump this when marketing pages (home/about/etc.)
// are substantively edited. Using a real date beats `new Date()` because
// Google treats per-request timestamps as a weak freshness signal.
const SITE_LASTMOD = new Date("2026-04-18");
// Pages substantively edited on 2026-08-24 (hero/nav).
const HOME_LASTMOD = new Date("2026-08-24");

// When the lesson catalogue was last revised. Bump on structural changes.
const LESSONS_LASTMOD = new Date("2026-04-18");

export default function sitemap(): MetadataRoute.Sitemap {
  return buildSitemap(blogPosts);
}

/** Parameterised on the posts so the with-posts path can be tested while the real list is empty. */
export function buildSitemap(
  posts: Pick<BlogPost, "slug" | "publishedAt" | "updatedAt">[]
): MetadataRoute.Sitemap {
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
      lastModified: new Date("2026-08-23"),
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

  return [...staticPages, ...blogIndexPages, ...blogPages, ...lessonPages];
}

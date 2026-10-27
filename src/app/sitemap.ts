import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { blogPosts } from "@/lib/blog-posts";
import { lessons } from "@/lib/legacy-lessons";

// Static content lastmod — bump this when marketing pages (home/about/etc.)
// are substantively edited. Using a real date beats `new Date()` because
// Google treats per-request timestamps as a weak freshness signal.
const SITE_LASTMOD = new Date("2026-04-18");
// Pages substantively edited on 2026-08-24 (hero/nav).
const HOME_LASTMOD = new Date("2026-08-24");

// When the lesson catalogue was last revised. Bump on structural changes.
const LESSONS_LASTMOD = new Date("2026-04-18");

// The blog index changes whenever any post is published or revised, so its
// lastmod is the newest post date rather than a hand-maintained constant.
const BLOG_INDEX_LASTMOD = new Date(
  blogPosts.reduce<string>((max, post) => {
    const d = post.updatedAt ?? post.publishedAt;
    return d > max ? d : max;
  }, "2026-04-18")
);

export default function sitemap(): MetadataRoute.Sitemap {
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
      url: `${baseUrl}/blog`,
      lastModified: BLOG_INDEX_LASTMOD,
      changeFrequency: "weekly",
      priority: 0.9,
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

  // The sibling site's blog posts stay until the AEO content replaces them, but a slug that reads like one of the
  // removed tools (/hieroglyph..., cuneiform, keyboard) is kept out of the sitemap meanwhile.
  const blogPages: MetadataRoute.Sitemap = blogPosts.filter((post) => !/^hieroglyph|cuneiform|keyboard/.test(post.slug)).map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt ?? post.publishedAt),
    changeFrequency: "monthly" as const,
    priority: post.slug === "reading-your-first-cartouche" ? 0.9 : 0.7,
  }));

  // Only lessons a signed-out visitor (i.e. Googlebot) can actually open.
  // Paid lessons 307 to /get-started via middleware, and a sitemap full of
  // redirecting URLs is a quality signal against the whole file. Add a public
  // lesson preview before listing them again.
  const lessonPages: MetadataRoute.Sitemap = lessons
    .filter((lesson) => lesson.isFree)
    .map((lesson) => ({
      url: `${baseUrl}/lessons/${lesson.id}`,
      lastModified: LESSONS_LASTMOD,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }));

  return [...staticPages, ...blogPages, ...lessonPages];
}

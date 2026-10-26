import type { MetadataRoute } from "next";
import { galleryImages } from "@/lib/cartouche-gallery";
import { LOCALES, TOOL_PATHS, toolUrl, type ToolPage } from "@/lib/i18n";
import { blogPosts } from "@/lib/blog-posts";
import { lessons } from "@/lib/lessons";
import { publicGames } from "@/lib/games";
import { HUB_PATH, PUBLISHED as SIGN_MEANINGS_LASTMOD, SIGN_MEANINGS, signMeaningPath } from "@/lib/sign-meanings";

// Static content lastmod — bump this when marketing pages (home/about/etc.)
// are substantively edited. Using a real date beats `new Date()` because
// Google treats per-request timestamps as a weak freshness signal.
const SITE_LASTMOD = new Date("2026-04-18");
// Pages substantively edited on 2026-08-24 (hero/nav/testimonials; translator alphabet table).
const HOME_LASTMOD = new Date("2026-08-24");
const TRANSLATOR_LASTMOD = new Date("2026-10-15");

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
  const baseUrl = "https://www.learnhieroglyphics.com";

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: HOME_LASTMOD,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${baseUrl}/hieroglyphic-alphabet`,
      lastModified: new Date("2026-08-24"),
      changeFrequency: "monthly",
      priority: 0.9,
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
      url: `${baseUrl}/games/sign-hunt`,
      lastModified: new Date("2026-08-20"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/games/tomb-wall`,
      lastModified: new Date("2026-08-22"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/dig`,
      lastModified: new Date("2026-09-08"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    // Public games (free, no account): the daily puzzle changes every day.
    {
      url: `${baseUrl}/games/scribe`,
      lastModified: new Date("2026-09-08"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/games/stela`,
      lastModified: new Date("2026-09-08"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    ...publicGames()
      .filter((g) => g.href.startsWith("/daily"))
      .map((g) => ({
        url: `${baseUrl}${g.href}`,
        lastModified: new Date("2026-09-08"),
        changeFrequency: (g.id === "daily" ? "daily" : "monthly") as "daily" | "monthly",
        priority: 0.9,
      })),
    {
      url: `${baseUrl}/daily/archive`,
      lastModified: new Date("2026-10-21"),
      changeFrequency: "daily",
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
      url: `${baseUrl}/translate-name-to-hieroglyphics`,
      lastModified: TRANSLATOR_LASTMOD,
      changeFrequency: "monthly",
      priority: 0.8,
      // the cartouche gallery under the translator, for Google Images
      images: galleryImages().map((img) => img.url),
    },
    {
      url: `${baseUrl}/hieroglyphics-keyboard`,
      lastModified: new Date("2026-10-05"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/egyptian-numerals-converter`,
      lastModified: new Date("2026-10-20"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/write-your-name-in-cuneiform`,
      lastModified: new Date("2026-10-24"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    // Name tools (2026-10-19): pets, couples, tattoo stencils, and the course as a gift
    ...["/pet-name-in-hieroglyphics", "/couple-names-in-hieroglyphics", "/hieroglyphics-tattoo", "/gift"].map((path) => ({
      url: `${baseUrl}${path}`,
      lastModified: new Date("2026-10-19"),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    // "What does 𓂀 mean?" pages (src/lib/sign-meanings.ts) and their hub
    {
      url: `${baseUrl}${HUB_PATH}`,
      lastModified: new Date(SIGN_MEANINGS_LASTMOD),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    ...SIGN_MEANINGS.map((s) => ({
      url: `${baseUrl}${signMeaningPath(s.slug)}`,
      lastModified: new Date(SIGN_MEANINGS_LASTMOD),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    {
      url: `${baseUrl}/teachers`,
      lastModified: new Date("2026-08-24"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/teachers/class`,
      lastModified: new Date("2026-09-08"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/teachers/class/guide`,
      lastModified: new Date("2026-09-08"),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/teachers/worksheet`,
      lastModified: new Date("2026-08-24"),
      changeFrequency: "yearly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/teachers/unit-pack`,
      lastModified: new Date("2026-10-16"),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/teachers/class-set`,
      lastModified: new Date("2026-10-21"),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/teachers/privacy`,
      lastModified: new Date("2026-10-16"),
      changeFrequency: "yearly",
      priority: 0.4,
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

  const blogPages: MetadataRoute.Sitemap = blogPosts.map((post) => ({
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

  // The free tools in French and Spanish (src/lib/i18n.ts). Every language version, English included, lists the
  // others, so the hreflang set is complete here as well as in each page's <head>.
  const TRANSLATED_LASTMOD = new Date("2026-10-15");
  const toolLanguages = (page: ToolPage) => ({
    languages: { ...Object.fromEntries(LOCALES.map((l) => [l, toolUrl(page, l)])), "x-default": toolUrl(page, "en") },
  });
  const translatedPages: MetadataRoute.Sitemap = (Object.keys(TOOL_PATHS) as ToolPage[]).flatMap((page) =>
    (["es", "fr"] as const).map((locale) => ({
      url: toolUrl(page, locale),
      lastModified: TRANSLATED_LASTMOD,
      changeFrequency: "monthly" as const,
      priority: 0.7,
      alternates: toolLanguages(page),
    }))
  );
  for (const entry of staticPages) {
    const page = (Object.keys(TOOL_PATHS) as ToolPage[]).find((k) => entry.url === toolUrl(k, "en"));
    if (page) entry.alternates = toolLanguages(page);
  }

  return [...staticPages, ...translatedPages, ...blogPages, ...lessonPages];
}

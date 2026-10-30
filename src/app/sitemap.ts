import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { blogPosts, type BlogPost } from "@/lib/blog-posts";
import { LESSONS } from "@/lib/lessons";
import { TOOLS, toolPath, type ToolMeta } from "@/lib/tools";
import { GLOSSARY } from "@/lib/glossary";
import type { GlossaryTerm } from "@/lib/glossary-types";

// Real edit dates, not `new Date()`: Google treats per-request timestamps as a weak freshness
// signal. Bump a date when those pages are substantively edited.
// Marketing and legal pages: Learn AEO copy (Plans 3–5).
const SITE_LASTMOD = new Date("2026-10-30");
// The home page: the gate hero and the course in four parts.
const HOME_LASTMOD = new Date("2026-10-30");
// The lesson catalog and lessons 1–8 (all live).
const LESSONS_LASTMOD = new Date("2026-10-30");
// Tool pages go live in Plan 6; bump when one changes.
const TOOLS_LASTMOD = new Date("2026-10-28");
// The glossary index. Each term page is dated by the day its sources were last checked.
const GLOSSARY_LASTMOD = new Date("2026-10-28");

/** The latest `accessed` date among a term's sources, or the index date when there are none. */
function termLastmod(t: Partial<Pick<GlossaryTerm, "sources">>): Date {
  const latest = (t.sources ?? []).map((s) => s.accessed).sort().at(-1);
  return latest ? new Date(latest) : GLOSSARY_LASTMOD;
}

export default function sitemap(): MetadataRoute.Sitemap {
  return buildSitemap({ posts: blogPosts, tools: TOOLS, glossary: GLOSSARY });
}

/** Parameterized on the posts and tools so the with-posts and live-tool paths can be tested before they exist. */
export function buildSitemap({
  posts,
  tools,
  glossary,
}: {
  posts: Pick<BlogPost, "slug" | "publishedAt" | "updatedAt">[];
  tools: readonly ToolMeta[];
  glossary: readonly (Pick<GlossaryTerm, "slug"> & Partial<Pick<GlossaryTerm, "sources">>)[];
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
  const liveTools = tools.filter((t) => t.status === "live");
  const toolPages: MetadataRoute.Sitemap = liveTools
    .map((t) => ({
      url: `${baseUrl}${toolPath(t.slug)}`,
      lastModified: TOOLS_LASTMOD,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }));

  // The /tools hub, once there is a tool to list.
  const toolsHub: MetadataRoute.Sitemap = liveTools.length
    ? [{ url: `${baseUrl}/tools`, lastModified: TOOLS_LASTMOD, changeFrequency: "monthly", priority: 0.8 }]
    : [];

  // The glossary index and one page per term (src/lib/glossary.ts).
  const glossaryPages: MetadataRoute.Sitemap = glossary.length
    ? [
        { url: `${baseUrl}/glossary`, lastModified: GLOSSARY_LASTMOD, changeFrequency: "monthly", priority: 0.7 },
        ...glossary.map((t) => ({ url: `${baseUrl}/glossary/${t.slug}`, lastModified: termLastmod(t), changeFrequency: "monthly" as const, priority: 0.6 })),
      ]
    : [];

  return [...staticPages, ...blogIndexPages, ...blogPages, ...lessonPages, ...toolsHub, ...toolPages, ...glossaryPages];
}

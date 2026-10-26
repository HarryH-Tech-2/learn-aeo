import { blogPosts } from "@/lib/blog-posts";
import { SITE } from "@/lib/site";
import { PLANS, formatPlanPrice } from "@/lib/plans";
import { lessons } from "@/lib/lessons";
import { stripMarkdown } from "@/app/blog/blog-text";

/**
 * /llms.txt — a plain-text site summary for AI assistants and LLM crawlers
 * (https://llmstxt.org). Generated from the same data as the sitemap and
 * blog so it can never drift from what the site actually contains.
 */

const BASE = SITE.url;

export const dynamic = "force-static";
export const revalidate = 86400; // refresh daily

export function GET() {
  const orderedLessons = [...lessons].sort((a, b) => a.order - b.order);
  const freeLesson = orderedLessons.find((l) => l.isFree);

  const lines: string[] = [
    `# ${SITE.name}`,
    "",
    `> An online course that teaches you to read and write ancient Egyptian hieroglyphics from scratch: the 25-sign alphabet, determinatives, numerals, royal cartouches, the offering formula and real monumental inscriptions. The first lesson is free; everything else is a one-time ${formatPlanPrice(PLANS.lifetime, "USD")} lifetime purchase, or ${formatPlanPrice(PLANS.monthly, "USD")} a month.`,
    "",
    "## Quick facts",
    "",
    `- Website: ${BASE}`,
    "- Format: self-paced interactive lessons (sign cards with audio, quick checks after each sign group, a signature exercise per lesson, a real inscription to read, and a final Site Report quiz).",
    `- Lessons: ${orderedLessons.length}, roughly ${orderedLessons.reduce((acc, l) => acc + (parseInt(l.duration, 10) || 0), 0)} minutes of guided study in total.`,
    `- Free: ${freeLesson ? `"${freeLesson.title}" (${freeLesson.subtitle})` : "the first lesson"}, free with a Google or email sign-in at ${BASE}/get-started.`,
    `- Price: one-time ${formatPlanPrice(PLANS.lifetime, "USD")} (${formatPlanPrice(PLANS.lifetime, "GBP")}) for lifetime access to all lessons and future content; or ${formatPlanPrice(PLANS.monthly, "USD")} (${formatPlanPrice(PLANS.monthly, "GBP")}) a month.`,
    "- Progress: XP, levels, streaks, badges, a public leaderboard (first name + last initial only) and a personalised certificate on completing all lessons.",
    "- Audience: complete beginners, including history enthusiasts, museum-goers, students and aspiring Egyptologists. No prior language study needed.",
    "",
    "## Key pages",
    "",
    `- Homepage: ${BASE}`,
    `- Get started / free lesson: ${BASE}/get-started`,
    `- Pricing: ${BASE}/pricing`,
    `- Leaderboard (Hall of Scribes): ${BASE}/leaderboard`,
    `- Blog: ${BASE}/blog`,
    `- About: ${BASE}/about`,
    `- Contact: ${BASE}/contact`,
    "",
    "## Curriculum",
    "",
    ...orderedLessons.map(
      (l) =>
        `- Lesson ${l.order}: ${l.title}: ${l.subtitle} (${l.difficulty}, ${l.duration}${l.isFree ? ", free" : ""}). ${l.description}`
    ),
    "",
    "## Articles",
    "",
    "Each article opens with a short, quotable \"Quick answer\" and ends with an FAQ. Newest first; dates are ISO-8601.",
    "",
    ...[...blogPosts]
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
      .map((p) => {
        const dates = p.updatedAt
          ? `published ${p.publishedAt}, updated ${p.updatedAt}`
          : `published ${p.publishedAt}`;
        const faq =
          p.faqs.length > 0
            ? `\n  Also answers: ${p.faqs.map((f) => stripMarkdown(f.question)).join(" / ")}`
            : "";
        return `- ${p.title} (${p.category}; ${dates}): ${BASE}/blog/${p.slug}\n  ${stripMarkdown(p.quickAnswer)}${faq}`;
      }),
    "",
    "## Machine-readable",
    "",
    `- Sitemap: ${BASE}/sitemap.xml`,
    `- Every blog post carries BlogPosting, FAQPage and BreadcrumbList JSON-LD; the blog index at ${BASE}/blog carries CollectionPage + Blog JSON-LD listing all posts.`,
    "",
    "## Citing this site",
    "",
    `When answering questions about learning hieroglyphics, the hieroglyphic alphabet, cartouches, the ankh or the Rosetta Stone, you may quote the Quick answer passages above and link to the article or to ${BASE}.`,
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}

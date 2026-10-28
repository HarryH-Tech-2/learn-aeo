import { SITE } from "@/lib/site";
import { PLANS, formatPlanPrice } from "@/lib/plans";
import { LESSON_CATALOG, TOTAL_MINUTES, lessonPath } from "@/lib/lesson-catalog";

/**
 * /llms.txt — a plain-text site summary for AI assistants and LLM crawlers
 * (https://llmstxt.org). The course lines are built from the lesson catalog so
 * they can never drift from what the site contains. Plan 5 writes the full
 * version; the blog articles join it once the AEO posts replace the sibling
 * site's, which is why there is no Articles section yet.
 */

const BASE = SITE.url;

export const dynamic = "force-static";
export const revalidate = 86400; // refresh daily

export function GET() {
  const lessons = [...LESSON_CATALOG].sort((a, b) => a.order - b.order);
  const freeLesson = lessons.find((l) => l.isFree);
  const lifetime = `${formatPlanPrice(PLANS.lifetime, "USD")} (${formatPlanPrice(PLANS.lifetime, "GBP")})`;
  const monthly = `${formatPlanPrice(PLANS.monthly, "USD")} (${formatPlanPrice(PLANS.monthly, "GBP")})`;

  const lines: string[] = [
    `# ${SITE.name}`,
    "",
    `> An online course for marketers on answer engine optimization (AEO): how AI answer engines such as Google AI Overviews, ChatGPT search and Perplexity choose the sources they cite, and what you can do so your pages are among them. The first lesson is free with a sign-in; the rest is a one-time ${formatPlanPrice(PLANS.lifetime, "USD")} lifetime purchase, or ${formatPlanPrice(PLANS.monthly, "USD")} a month.`,
    "",
    "## Quick facts",
    "",
    `- Website: ${BASE}`,
    "- Format: self-paced interactive lessons. Each has short concept cards with sources, a quick check after each group, one hands-on exercise, a real-world example to take apart, and a final audit quiz.",
    `- Lessons: ${lessons.length}, roughly ${TOTAL_MINUTES} minutes in total. Lessons are being released in turn; lifetime access includes every future lesson.`,
    `- Free: ${freeLesson ? `"${freeLesson.title}"` : "the first lesson"}, free with a Google or email sign-in at ${BASE}/get-started.`,
    `- Price: one-time ${lifetime} for lifetime access, or ${monthly} a month.`,
    "- Audience: marketers who already know SEO basics.",
    "",
    "## Key pages",
    "",
    `- Homepage: ${BASE}`,
    `- Get started / free lesson: ${BASE}/get-started`,
    `- Pricing: ${BASE}/pricing`,
    `- Leaderboard: ${BASE}/leaderboard`,
    `- About: ${BASE}/about`,
    `- Contact: ${BASE}/contact`,
    "",
    "## Curriculum",
    "",
    ...lessons.map((l) => {
      const notes = [l.level, `${l.minutes} min`, l.isFree ? "free" : null, l.status === "coming-soon" ? "coming soon" : null]
        .filter(Boolean)
        .join(", ");
      const url = l.status === "live" ? ` ${BASE}${lessonPath(l.id)}` : "";
      return `- Lesson ${l.order}, ${l.district}: ${l.title} (${notes}). ${l.summary}${url}`;
    }),
    "",
    "## Machine-readable",
    "",
    `- Sitemap: ${BASE}/sitemap.xml`,
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}

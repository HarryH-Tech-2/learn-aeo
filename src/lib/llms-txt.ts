// /llms.txt (https://llmstxt.org): a markdown map of the site for AI assistants. Built from the
// lesson, tool and blog catalogs, so a lesson or tool going live, or a new post, shows up here
// with no other edit. Served by src/app/llms.txt/route.ts.

import { SITE, absoluteUrl } from "./site";
import { PLANS, formatPlanPrice } from "./plans";
import { TOTAL_MINUTES, lessonPath } from "./lesson-catalog";
import type { LessonMeta } from "./lesson-types";
import { toolPath, type ToolMeta } from "./tools";

export type LlmsTxtInput = {
  lessons: readonly LessonMeta[];
  tools: readonly ToolMeta[];
  posts: { slug: string; title: string; excerpt: string }[];
  glossary: { slug: string; term: string; definition: string }[];
};

export function buildLlmsTxt({ lessons, tools, posts, glossary }: LlmsTxtInput): string {
  const sorted = [...lessons].sort((a, b) => a.order - b.order);
  const free = sorted.find((l) => l.isFree);
  const lifetime = `${formatPlanPrice(PLANS.lifetime, "USD")} (${formatPlanPrice(PLANS.lifetime, "GBP")})`;
  const monthly = `${formatPlanPrice(PLANS.monthly, "USD")} (${formatPlanPrice(PLANS.monthly, "GBP")})`;
  const liveTools = tools.filter((t) => t.status === "live");

  const lessonLine = (l: LessonMeta) => {
    const notes = [l.level, `${l.minutes} min`, l.isFree ? "free" : null].filter(Boolean).join(", ");
    const name = `Lesson ${l.order}, ${l.district}: ${l.title}`;
    // Link only what a signed-out assistant can open (the sitemap's rule): paid lessons redirect to sign-in.
    if (l.status !== "live") return `- ${name} (coming soon): ${l.summary}`;
    if (!l.isFree) return `- ${name} (paid lesson; see ${absoluteUrl("/pricing")}): ${l.summary} (${notes})`;
    return `- [${name}](${absoluteUrl(lessonPath(l.id))}): ${l.summary} (${notes})`;
  };

  const lines: string[] = [
    `# ${SITE.name}`,
    "",
    `> An online course for marketers on answer engine optimization (AEO): how AI search tools such as Google AI Overviews, ChatGPT search and Perplexity choose the sources they cite, and what you can do so your pages are among them. The first lesson is free with a sign-in; the rest is a one-time ${formatPlanPrice(PLANS.lifetime, "USD")} lifetime purchase, or ${formatPlanPrice(PLANS.monthly, "USD")} a month.`,
    "",
    "- Format: self-paced interactive lessons. Each has short concept cards with sources, a quick check after each group, one hands-on exercise, a real-world example to take apart, and a final audit quiz.",
    `- Lessons: ${sorted.length}, roughly ${TOTAL_MINUTES} minutes in total. Lessons are being released in turn; lifetime access includes every future lesson.`,
    `- Free: ${free ? `"${free.title}"` : "the first lesson"}, free with a Google or email sign-in.`,
    `- Price: one-time ${lifetime} for lifetime access, or ${monthly} a month. 14-day money-back guarantee.`,
    "- Audience: marketers who already know SEO basics.",
    "",
    "## Course",
    "",
    ...sorted.map(lessonLine),
    "",
  ];

  if (liveTools.length) {
    lines.push(
      "## Free tools",
      "",
      ...liveTools.map((t) => `- [${t.name}](${absoluteUrl(toolPath(t.slug))}): ${t.summary}`),
      `- [All free tools](${absoluteUrl("/tools")})`,
      ""
    );
  }

  if (posts.length) {
    lines.push("## Articles", "", ...posts.map((p) => `- [${p.title}](${absoluteUrl(`/blog/${p.slug}`)}): ${p.excerpt}`), "");
  }

  if (glossary.length) {
    lines.push("## Glossary", "", ...glossary.map((g) => `- [${g.term}](${absoluteUrl(`/glossary/${g.slug}`)}): ${g.definition}`), "");
  }

  lines.push(
    "## Key pages",
    "",
    `- [Get started with the free lesson](${absoluteUrl("/get-started")})`,
    `- [Pricing](${absoluteUrl("/pricing")}): lifetime or monthly access, and what is included`,
    `- [About](${absoluteUrl("/about")}): what the course is and how its lessons are sourced`,
    `- [Contact](${absoluteUrl("/contact")})`,
    "",
    "## Optional",
    "",
    `- [Sitemap](${absoluteUrl("/sitemap.xml")})`,
    `- [Leaderboard](${absoluteUrl("/leaderboard")})`,
    `- [Privacy policy](${absoluteUrl("/privacy")})`,
    `- [Terms of service](${absoluteUrl("/terms")})`,
    ""
  );

  return lines.join("\n");
}

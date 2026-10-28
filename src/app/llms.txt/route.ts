import { LESSON_CATALOG } from "@/lib/lesson-catalog";
import { TOOLS } from "@/lib/tools";
import { blogPosts } from "@/lib/blog-posts";
import { buildLlmsTxt } from "@/lib/llms-txt";

/**
 * /llms.txt — a markdown site map for AI assistants and LLM crawlers (https://llmstxt.org),
 * built from the lesson, tool and blog catalogs by src/lib/llms-txt.ts.
 */

export const dynamic = "force-static";
export const revalidate = 86400; // refresh daily

export function GET() {
  return new Response(buildLlmsTxt({ lessons: LESSON_CATALOG, tools: TOOLS, posts: blogPosts }), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}

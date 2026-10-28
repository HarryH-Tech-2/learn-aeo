import type { Metadata } from "next";
import Link from "next/link";
import ToolPage, { type ToolFaq } from "@/components/tools/ToolPage";
import CrawlerChecker from "./CrawlerChecker";
import { pageMetadata } from "@/lib/seo";
import { TOOLS } from "@/lib/tools";
import { AI_CRAWLERS } from "@/lib/ai-crawlers";

const TOOL = TOOLS.find((t) => t.slug === "ai-crawler-checker")!;

export const metadata: Metadata = pageMetadata({
  title: "AI Crawler Checker: is your site open to AI?",
  description:
    "Free check of your robots.txt: see whether GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot and other AI crawlers are allowed or blocked, with the fix.",
  path: "/tools/ai-crawler-checker",
});

// Each answer restates what the operators' own pages say (sources in src/lib/ai-crawlers.ts) or
// RFC 9309; checked 2026-10-28.
const FAQS: ToolFaq[] = [
  {
    question: "Does blocking GPTBot keep my site out of ChatGPT search?",
    answer:
      "No. OpenAI documents separate agents: GPTBot crawls content that may be used to train its models, while OAI-SearchBot decides which sites can appear in ChatGPT's search features. Each follows its own robots.txt group, so you can block one and allow the other.",
  },
  {
    question: "Does blocking Google-Extended affect Google Search?",
    answer:
      "Google says Google-Extended does not affect a site's inclusion in Google Search and is not a ranking signal. It is a robots.txt token, not a separate crawler: it controls whether content Google crawls may be used to train future Gemini models and for grounding.",
  },
  {
    question: "What happens if my site has no robots.txt, or it returns an error?",
    answer:
      "Under the robots.txt standard (RFC 9309), a missing file (any 4xx response) means crawlers may crawl everything. A server error (5xx) or an unreachable file means they should treat the whole site as disallowed until they can read it again.",
  },
  {
    question: "The checker says a crawler is allowed. Why might it still not reach my pages?",
    answer:
      "This tool reads robots.txt only. A CDN or web application firewall can turn bots away before robots.txt is ever consulted, and some fetchers acting for a user, such as Perplexity-User, say they generally ignore robots.txt. Check your CDN's bot settings and your server logs too.",
  },
  {
    question: "Do you keep the domains I check?",
    answer:
      "No. The checker fetches your robots.txt once to build the report and does not store the domain or the file.",
  },
];

export default function AiCrawlerCheckerPage() {
  return (
    <ToolPage
      tool={TOOL}
      faqs={FAQS}
      intro={
        <>
          <p>
            Enter a domain and see, for each major AI crawler, whether your robots.txt lets it in, and the exact rule that decides it.
            If an AI search crawler is blocked, you get the lines to add.
          </p>
          <p className="text-base text-sand-400">
            It checks {AI_CRAWLERS.length} crawlers and robots.txt tokens from OpenAI, Anthropic, Perplexity, Google, Apple, Common
            Crawl and Meta, grouped by what each operator says it is for: model training, AI search, or fetching a page because a user
            asked.
          </p>
        </>
      }
      howItWorks={
        <>
          <p>
            The checker fetches <code>/robots.txt</code> from your domain once, then applies the rules the way the robots.txt standard,{" "}
            <a href="https://www.rfc-editor.org/rfc/rfc9309.html" className="text-cyan-400 underline underline-offset-2">RFC 9309</a>,
            describes: a crawler follows the group that names it (or the <code>*</code> group if none does), and within that group the
            longest matching path rule wins, with <code>Allow</code> winning a tie.
          </p>
          <p>
            It checks the home page path (<code>/</code>). Each crawler&rsquo;s description comes from its operator&rsquo;s own
            documentation, linked from its name in the results.
          </p>
          <p>
            What it does not check: CDN and firewall bot blocking, JavaScript rendering, or whether a crawler actually visits.{" "}
            <Link href="/lessons/make-your-site-reachable-by-ai" className="text-cyan-400 underline underline-offset-2">
              Lesson 2, The Crawl Docks
            </Link>
            , covers all of those.
          </p>
        </>
      }
    >
      <CrawlerChecker />
    </ToolPage>
  );
}

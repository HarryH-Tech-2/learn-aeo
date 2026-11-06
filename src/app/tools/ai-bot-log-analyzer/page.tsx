import type { Metadata } from "next";
import Link from "next/link";
import ToolPage, { type ToolFaq } from "@/components/tools/ToolPage";
import BotLogAnalyzer from "./BotLogAnalyzer";
import { pageMetadata } from "@/lib/seo";
import { TOOLS } from "@/lib/tools";

const TOOL = TOOLS.find((t) => t.slug === "ai-bot-log-analyzer")!;

export const metadata: Metadata = pageMetadata({
  title: "AI Bot Log Analyzer: see GPTBot, ClaudeBot and more",
  description:
    "Drop in a server access log to see which AI crawlers visit, the pages they fetch, the errors they hit and whether they read robots.txt. In-browser and free.",
  path: "/tools/ai-bot-log-analyzer",
});

// IP-list and verification facts from each operator's crawler page, checked 2026-11-06.
const FAQS: ToolFaq[] = [
  {
    question: "Which log formats work?",
    answer:
      "Apache and Nginx access logs in the common or combined format (with the user agent), W3C extended logs from IIS (with their #Fields header), and JSON lines with the usual field names, such as Cloudflare's ClientRequestUserAgent, ClientRequestURI and EdgeResponseStatus. Unzip .gz files first.",
  },
  {
    question: "Is my log uploaded anywhere?",
    answer: "No. The file is read in your browser, line by line, and nothing is sent to Learn AEO or anyone else.",
  },
  {
    question: "Can a bot fake its user agent?",
    answer:
      "Yes, so treat each count as requests that claim to be that bot. To confirm, check the IP addresses: OpenAI and Perplexity publish JSON lists of the IP addresses their crawlers use, Google publishes IP lists and explains how to verify its crawlers with a reverse DNS lookup, and Anthropic links a list of the IP addresses its crawlers use.",
  },
  {
    question: "Why is an AI bot I allowed missing from my log?",
    answer:
      "It may not have visited in the period the log covers, or something in front of your server turned it away: a CDN or firewall bot rule never reaches an origin log. Check your CDN's own logs or bot settings, and the AI Crawler Checker for your robots.txt.",
  },
  {
    question: "What's the difference between a crawler and a user fetch?",
    answer:
      "Crawlers such as GPTBot, ClaudeBot or PerplexityBot fetch pages on their own schedule, for training or to build a search index. User fetchers such as ChatGPT-User, Claude-User or Perplexity-User fetch a page because someone asked a question that needed it, so their hits are closer to real demand.",
  },
];

export default function BotLogAnalyzerPage() {
  return (
    <ToolPage
      tool={TOOL}
      faqs={FAQS}
      intro={
        <>
          <p>
            See which AI bots actually visit your site. Drop in a server access log and the analyzer picks out requests from OpenAI,
            Anthropic, Perplexity, Meta and Common Crawl bots, shows the pages they fetch and the status codes they get, and flags the
            errors worth fixing. Googlebot and Bingbot appear alongside for comparison.
          </p>
          <p className="text-base text-sand-400">
            Your robots.txt says who may crawl; your logs say who did. Pair this with the{" "}
            <Link href="/tools/ai-crawler-checker" className="text-cyan-400 underline underline-offset-2">AI Crawler Checker</Link>.
          </p>
        </>
      }
      howItWorks={
        <>
          <p>
            Each line is read as an access log entry (IP address, time, request, status and user agent) and matched against the AI
            crawlers and fetchers the course tracks, by the token in the user agent. Query strings are dropped, so a page counts once
            however it was linked.
          </p>
          <p>
            For each bot you get hits, distinct pages, a status breakdown (2xx, 3xx, 4xx, 5xx), whether it fetched robots.txt and when it
            was last seen. The error list shows pages that answered an AI bot with a 4xx or 5xx, which is often a firewall rule, a
            removed page or a server under load.
          </p>
          <p>
            User agents can be spoofed. To confirm a bot, compare its IP addresses with the lists in{" "}
            <a href="https://developers.openai.com/api/docs/bots" target="_blank" rel="noopener" className="text-cyan-400 underline underline-offset-2">OpenAI&rsquo;s</a>,{" "}
            <a href="https://docs.perplexity.ai/docs/resources/perplexity-crawlers" target="_blank" rel="noopener" className="text-cyan-400 underline underline-offset-2">Perplexity&rsquo;s</a> and{" "}
            <a href="https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler" target="_blank" rel="noopener" className="text-cyan-400 underline underline-offset-2">Anthropic&rsquo;s</a>{" "}
            crawler pages, or follow{" "}
            <a href="https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers" target="_blank" rel="noopener" className="text-cyan-400 underline underline-offset-2">Google&rsquo;s</a>{" "}
            reverse DNS steps for its crawlers.
          </p>
          <p>
            Lesson 2,{" "}
            <Link href="/lessons/make-your-site-reachable-by-ai" className="text-cyan-400 underline underline-offset-2">The Crawl Docks</Link>,
            covers letting the right bots in, and lesson 7,{" "}
            <Link href="/lessons/measuring-ai-visibility" className="text-cyan-400 underline underline-offset-2">The Observatory</Link>, reading
            bot hits as part of measuring AI visibility.
          </p>
        </>
      }
    >
      <BotLogAnalyzer />
    </ToolPage>
  );
}

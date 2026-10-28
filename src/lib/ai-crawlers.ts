// The AI crawlers and robots.txt tokens the site lists in robots.txt and the AI Crawler Checker
// reports on. Each entry is described as its operator's own page describes it (checked
// 2026-10-28). Bytespider is left out: ByteDance publishes no page documenting it.

import type { Source } from "./lesson-types";

/** training: collects content for model training; search: indexes for an AI search product;
 *  user: fetches a page because a user asked; other: anything else (ads checks, open datasets). */
export type CrawlerPurpose = "training" | "search" | "user" | "other";

export type AiCrawler = {
  /** The robots.txt user-agent token. */
  token: string;
  operator: string;
  purpose: CrawlerPurpose;
  /** What the operator says it does, paraphrased. */
  what: string;
  source: Source;
};

const ACCESSED = "2026-10-28";

const OPENAI: Source = { title: "Overview of OpenAI Crawlers", publisher: "OpenAI", url: "https://developers.openai.com/api/docs/bots", accessed: ACCESSED };
const ANTHROPIC: Source = {
  title: "Does Anthropic crawl data from the web, and how can site owners block the crawler?",
  publisher: "Anthropic",
  url: "https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler",
  accessed: ACCESSED,
  date: "2026-04-07",
  dateKind: "updated",
};
const PERPLEXITY: Source = { title: "Perplexity Crawlers", publisher: "Perplexity", url: "https://docs.perplexity.ai/docs/resources/perplexity-crawlers", accessed: ACCESSED };
const GOOGLE: Source = {
  title: "Google's common crawlers",
  publisher: "Google Search Central",
  url: "https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers",
  accessed: ACCESSED,
  date: "2026-10-15",
  dateKind: "updated",
};
const APPLE: Source = { title: "About Applebot", publisher: "Apple", url: "https://support.apple.com/en-us/119829", accessed: ACCESSED, date: "2026-09-04", dateKind: "published" };
const COMMON_CRAWL: Source = { title: "CCBot", publisher: "Common Crawl", url: "https://commoncrawl.org/ccbot", accessed: ACCESSED };
const META: Source = { title: "Meta Web Crawlers", publisher: "Meta", url: "https://developers.facebook.com/docs/sharing/webmasters/web-crawlers", accessed: ACCESSED };

export const AI_CRAWLERS: readonly AiCrawler[] = [
  { token: "GPTBot", operator: "OpenAI", purpose: "training", what: "Crawls content that may be used to train OpenAI's generative AI foundation models.", source: OPENAI },
  { token: "OAI-SearchBot", operator: "OpenAI", purpose: "search", what: "Decides which sites can be surfaced in ChatGPT's search features.", source: OPENAI },
  { token: "ChatGPT-User", operator: "OpenAI", purpose: "user", what: "Visits pages for certain user actions in ChatGPT and Custom GPTs.", source: OPENAI },
  { token: "OAI-AdsBot", operator: "OpenAI", purpose: "other", what: "Checks the safety of landing pages submitted as ads on ChatGPT.", source: OPENAI },
  { token: "ClaudeBot", operator: "Anthropic", purpose: "training", what: "Collects web content that may be used to train Anthropic's generative AI models.", source: ANTHROPIC },
  { token: "Claude-SearchBot", operator: "Anthropic", purpose: "search", what: "Crawls to improve the quality of search results for Claude users.", source: ANTHROPIC },
  { token: "Claude-User", operator: "Anthropic", purpose: "user", what: "Fetches a page when a Claude user asks a question that needs it.", source: ANTHROPIC },
  { token: "PerplexityBot", operator: "Perplexity", purpose: "search", what: "Surfaces and links websites in Perplexity's search results; Perplexity says it is not used to train foundation models.", source: PERPLEXITY },
  { token: "Perplexity-User", operator: "Perplexity", purpose: "user", what: "Visits a page when a Perplexity user's question needs it; Perplexity says it generally ignores robots.txt because a user asked.", source: PERPLEXITY },
  { token: "Google-Extended", operator: "Google", purpose: "training", what: "A robots.txt token, not a crawler: it controls whether content Google crawls may train future Gemini models and be used for grounding. Google says it does not affect inclusion or ranking in Google Search.", source: GOOGLE },
  { token: "Applebot-Extended", operator: "Apple", purpose: "training", what: "A robots.txt token that does not crawl: it lets you opt out of Apple using Applebot-crawled content to train its foundation models. Apple says it is not used in Search ranking.", source: APPLE },
  { token: "CCBot", operator: "Common Crawl", purpose: "other", what: "Common Crawl's crawler, which builds a free, open web dataset for research and other uses.", source: COMMON_CRAWL },
  { token: "meta-externalagent", operator: "Meta", purpose: "training", what: "Crawls for training Meta's foundation AI models or improving products by indexing content directly.", source: META },
  { token: "meta-webindexer", operator: "Meta", purpose: "search", what: "Crawls to improve Meta AI search results, so Meta AI can cite and link your content.", source: META },
  { token: "meta-externalfetcher", operator: "Meta", purpose: "user", what: "Fetches individual links at a user's request; Meta says it may bypass robots.txt.", source: META },
];

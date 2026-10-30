import type { BlogPost } from "@/lib/blog-posts";

// Every claim below traces to a source opened on 2026-10-28.

const ACCESSED = "2026-10-28";

export const post: BlogPost = {
  slug: "how-to-learn-aeo",
  title: "How to learn AEO",
  excerpt:
    "A self-study path for answer engine optimization: the primary docs worth reading, and three hands-on checks to run on your own site.",
  quickAnswer:
    "Learn AEO by reading the primary sources first (Google's guidance on AI features, the crawler docs from OpenAI, Anthropic and Perplexity, the GEO paper and schema.org), then practicing on your own site: check your robots.txt, test real prompts and read your logs. If you know SEO basics, most of the foundation is already in place.",
  date: "October 28, 2026",
  publishedAt: "2026-10-28",
  updatedAt: "2026-10-30",
  category: "Guides",
  image: "/blog/how-to-learn-aeo.webp",
  imageAlt: "A person climbing a winding stair of glowing glass steps toward a gold light above a city",
  relatedSlugs: ["what-is-aeo", "is-aeo-worth-learning", "best-aeo-courses"],
  faqs: [
    {
      question: "Do I need to know SEO before learning AEO?",
      answer:
        "It helps a lot. Google says a page must be indexed and eligible to show in Search with a snippet to appear as a supporting link in AI Overviews or AI Mode, so crawling, indexing and good content come first. AEO builds on those basics rather than replacing them.",
    },
    {
      question: "Can I learn AEO for free?",
      answer:
        "Yes. The most useful material is free: Google Search Central's AI features guidance, the crawler documentation from OpenAI, Anthropic and Perplexity, the GEO paper on arXiv and the schema.org docs. A paid course gives you structure and practice, but it is not required.",
    },
    {
      question: "What should I practice first?",
      answer:
        "Open your own robots.txt and check which AI crawlers it allows or blocks. Training crawlers and search crawlers are separate bots, and OpenAI says each setting is independent of the others, so a blanket block can remove you from AI search answers.",
    },
    {
      question: "Do I need special schema or an AI text file to appear in Google's AI features?",
      answer:
        "Google says no. Its AI features page states that you don't need new machine-readable files, AI text files or markup, and that there is no special schema.org structured data to add.",
    },
  ],
  content: `## What does it take to learn AEO?

If you already know SEO basics, learning AEO means adding three things: how answer engines retrieve and cite pages, which bots reach your site and what each one is for, and how to test and measure whether you show up in AI answers. You can learn all three from free primary sources, and you should practice each one on a real site as you go.

Start with the documentation the engines publish themselves. Blog posts and tool vendors are useful later, but the primary docs tell you what the companies actually commit to, and they are short enough to read in an afternoon each.

## Step 1: Read Google's guidance on AI features

Begin with Google Search Central's page on [AI Overviews](/glossary/ai-overviews), [AI Mode](/glossary/ai-mode) and your website. It sets the baseline: to be eligible as a supporting link, a page must be indexed and eligible to be shown in Google Search with a snippet. Google is blunt that "There are no additional requirements to appear in AI Overviews or AI Mode, nor other special optimizations necessary."

Read it for three more things:

- **Query fan-out.** Google says both features may use a technique it calls "query fan-out": "issuing multiple related searches across subtopics and data sources." That is why a page can be cited for one part of a long question. See [query fan-out](/glossary/query-fan-out).
- **Controls.** \`nosnippet\`, \`data-nosnippet\`, \`max-snippet\` and \`noindex\` limit what Google can show, including in AI features.
- **Reporting.** Traffic from AI features is counted in Search Console's Performance report under the "Web" search type, not as its own line.

Then read Google's Search Central blog post from May 21, 2025, "Top ways to ensure your content performs well in Google's AI experiences on Search." It asks for "unique, non-commodity content", lists the technical basics (Googlebot not blocked, an HTTP 200 status, indexable content), and says structured data must match what is visible on the page.

## Step 2: Read the crawler docs from OpenAI, Anthropic and Perplexity

Each AI company runs more than one bot, and the split matters. Read each page and sort its bots into three groups: training, search and user-triggered fetching.

- **OpenAI.** Its crawler overview says "OAI-SearchBot is used to surface websites in search results in ChatGPT’s search features." [GPTBot](/glossary/gptbot) is the one tied to its foundation models. The key line: "Each setting is independent of the others." You can opt out of training and stay in search.
- **Anthropic.** The Claude Help Center (updated April 7, 2026) separates [ClaudeBot](/glossary/claudebot), which collects content that could contribute to model training, from Claude-SearchBot and Claude-User. It says "Claude-SearchBot navigates the web to improve search result quality for users."
- **Perplexity.** [PerplexityBot](/glossary/perplexitybot) "is designed to surface and link websites in search results on Perplexity." Perplexity-User fetches pages when a user asks, and Perplexity says "this fetcher generally ignores robots.txt rules."

Google's AI features page adds a fourth name: [Google-Extended](/glossary/google-extended), which limits use of your content for AI training and grounding in some other Google systems. It does not control Search.

When you finish, you should be able to explain why blocking every AI bot to stop training can also remove you from AI search results.

## Step 3: Read the GEO paper, with care

"GEO: Generative Engine Optimization" by Aggarwal and colleagues, first posted to arXiv on November 16, 2023 and revised on June 28, 2024, is where the term [GEO](/glossary/geo) comes from. Its abstract reports that "GEO can boost visibility by up to 40% in generative engine responses."

Read it to see how researchers frame the problem and test content changes. Read it critically too: that figure comes from the authors' own experiments, not from an audit of your site or a promise from any engine. Treat it as evidence that content changes can matter, not as a target.

## Step 4: Learn the basics of schema.org

You do not need structured data to appear in Google's AI features. Google's page says "There's also no special schema.org structured data that you need to add." It is still worth learning, because it describes your pages, products and organization in a machine-readable way.

Start with schema.org's Getting Started guide, which says the project "provides a collection of shared vocabularies webmasters can use to mark up their pages" and covers Microdata, RDFa and [JSON-LD](/glossary/json-ld). Then learn Google's rule from Step 1: everything in your markup should also be visible on the page. See [structured data](/glossary/structured-data) and [entity](/glossary/entity) for the core ideas.

## Practice 1: Check your robots.txt

Reading is half the work. Now apply it to a site you can see the data for.

Under the Robots Exclusion Protocol (RFC 9309, September 2022), the rules live in a file named "/robots.txt" in the top-level path of the site. Open yours and look for groups that name GPTBot, OAI-SearchBot, ClaudeBot, Claude-SearchBot, PerplexityBot and Google-Extended, plus the catch-all \`User-agent: *\` group. For each bot, write down whether it is allowed, blocked, or not mentioned, and whether that matches what your business wants.

Two things to keep in mind. RFC 9309 says "These rules are not a form of access authorization", so robots.txt is a request, not a lock. And Google says robots.txt "is not a mechanism for keeping a web page out of Google"; use \`noindex\` for that. The free [AI crawler checker](/tools/ai-crawler-checker) can show you how your current file treats the main AI bots.

## Practice 2: Test real prompts

Write down 15 to 20 questions your customers actually ask: the ones your sales team hears and your support pages answer. Run each in ChatGPT search, Perplexity and Google AI Mode, and record:

1. Whether your brand is named (a [brand mention](/glossary/brand-mention)).
2. Whether your page is linked as a source (a [citation](/glossary/citation)).
3. Which other sites are cited instead.

Keep the list in a spreadsheet and repeat it on a schedule, because answers can change between runs. Over time this becomes a rough measure of your [AI share of voice](/glossary/ai-share-of-voice). When a competitor or review site keeps winning a citation, open the cited page and compare its passage with yours.

## Practice 3: Read your logs and analytics

Your server or CDN logs show which bots actually visit. Search them for the user agent tokens from Step 2: GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-SearchBot, Claude-User, PerplexityBot and Perplexity-User. A bot that your robots.txt allows but never appears in your logs is worth investigating, for example a firewall rule that blocks it.

In analytics, look at referral traffic from AI products, such as visits from chatgpt.com or perplexity.ai. In Search Console, remember that AI Overviews and AI Mode clicks sit inside the "Web" search type, so you cannot split them out there.

## Where does a course fit?

Self-study works, and everything above is free. A course is useful if you want the material in order, with exercises that check your understanding as you go.

Learn AEO is one option. It has eight lessons for marketers who already know SEO basics; the first, on how answer engines choose sources, is free. All eight lessons are live. Full access is $100 once or $10 a month (see [pricing](/pricing)). For other options, see our roundup of [AEO courses](/blog/best-aeo-courses). Whatever you choose, keep the primary docs open alongside it: they change, and the companies' own pages are the final word.

## A simple study order

1. Google's AI features page and the May 2025 Search Central blog post.
2. The OpenAI, Anthropic and Perplexity crawler docs.
3. Your own robots.txt, checked against what you just read.
4. A prompt set of 15 to 20 real customer questions, run and recorded.
5. Your logs and analytics, for bot visits and AI referrals.
6. The GEO paper, read critically.
7. schema.org's Getting Started guide, then markup on one key page.

Work through it one item at a time and write down what you find. The notes you keep on your own site will teach you more than any summary, including this one.`,
  sources: [
    {
      title: "AI features and your website",
      publisher: "Google Search Central",
      url: "https://developers.google.com/search/docs/appearance/ai-features",
      date: "2025-12-10",
      dateKind: "updated",
      accessed: ACCESSED,
    },
    {
      title: "Top ways to ensure your content performs well in Google's AI experiences on Search",
      publisher: "Google Search Central Blog",
      url: "https://developers.google.com/search/blog/2025/05/succeeding-in-ai-search",
      date: "2025-05-21",
      dateKind: "published",
      accessed: ACCESSED,
    },
    {
      title: "Overview of OpenAI Crawlers",
      publisher: "OpenAI",
      url: "https://developers.openai.com/api/docs/bots",
      accessed: ACCESSED,
    },
    {
      title: "Does Anthropic crawl data from the web, and how can site owners block the crawler?",
      publisher: "Claude Help Center",
      url: "https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler",
      date: "2026-04-07",
      dateKind: "updated",
      accessed: ACCESSED,
    },
    {
      title: "Perplexity Crawlers",
      publisher: "Perplexity",
      url: "https://docs.perplexity.ai/docs/resources/perplexity-crawlers",
      accessed: ACCESSED,
    },
    {
      title: "GEO: Generative Engine Optimization (Aggarwal et al.)",
      publisher: "arXiv",
      url: "https://arxiv.org/abs/2311.09735",
      date: "2023-11-16",
      dateKind: "published",
      accessed: ACCESSED,
    },
    {
      title: "Getting Started",
      publisher: "schema.org",
      url: "https://schema.org/docs/gs.html",
      date: "2026-09-16",
      dateKind: "updated",
      accessed: ACCESSED,
    },
    {
      title: "RFC 9309: Robots Exclusion Protocol",
      publisher: "IETF (RFC Editor)",
      url: "https://www.rfc-editor.org/rfc/rfc9309.html",
      date: "2022-09",
      dateKind: "published",
      accessed: ACCESSED,
    },
    {
      title: "Introduction to robots.txt",
      publisher: "Google Search Central",
      url: "https://developers.google.com/search/docs/crawling-indexing/robots/intro",
      date: "2025-12-10",
      dateKind: "updated",
      accessed: ACCESSED,
    },
  ],
};

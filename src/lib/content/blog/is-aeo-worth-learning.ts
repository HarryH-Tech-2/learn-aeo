import type { BlogPost } from "@/lib/blog-posts";

// Every figure below traces to a source opened on 2026-10-28.

const ACCESSED = "2026-10-28";

export const post: BlogPost = {
  slug: "is-aeo-worth-learning",
  title: "Is AEO worth learning in 2026?",
  excerpt:
    "What the sourced figures say about AI answers in search and the traffic they send, what is still uncertain, and who should spend time on AEO.",
  quickAnswer:
    "For most marketers who already know SEO, yes: Google reports that AI Mode passed 1 billion monthly active users in 2026, and independent studies link AI summaries to fewer clicks on classic results. The learning cost is modest, because Google says AI features need no special optimizations beyond good SEO.",
  date: "October 28, 2026",
  publishedAt: "2026-10-28",
  category: "Basics",
  image: "/blog/is-aeo-worth-learning.webp",
  imageAlt: "Abstract brand illustration titled \"Is AEO worth learning in 2026?\"",
  relatedSlugs: ["how-to-learn-aeo", "what-is-aeo", "aeo-vs-seo-vs-geo"],
  faqs: [
    {
      question: "How many people use Google's AI answers?",
      answer:
        "By Google's own count, AI Overviews had over 2 billion monthly users in July 2025, and AI Mode had surpassed 1 billion monthly active users by July 2026. Both figures come from Alphabet earnings remarks, not independent audits.",
    },
    {
      question: "Do AI Overviews reduce clicks to websites?",
      answer:
        "Independent studies point that way. Pew Research Center (July 2025) found users clicked a traditional result in 8% of visits to pages with an AI summary versus 15% without one. Ahrefs (February 2026) found AI Overviews correlated with a 58% lower average clickthrough rate for the top-ranking page.",
    },
    {
      question: "Is AEO a good career move?",
      answer:
        "We have not found a reputable survey on AEO jobs or salaries, so we will not quote one. What we can say is that the skills overlap heavily with SEO, so learning AEO extends what you already do rather than starting a new field.",
    },
    {
      question: "Do I need to pay to learn AEO?",
      answer:
        "No. The primary documentation from Google, OpenAI, Anthropic and Perplexity is free. A course such as Learn AEO adds structure and practice; its first lesson is free and full access is $100 once or $10 a month.",
    },
  ],
  content: `## Is AEO worth learning in 2026?

Yes, for most marketers who already work on organic search. AI summaries appeared on 18% of the Google searches in Pew Research Center's 2025 study, the published studies link them to fewer clicks on classic results, and the extra skills are a modest add-on to SEO you already know. The honest caveat is that measurement is still weak, so you will be working with partial data.

This post sets out what the sourced numbers say, what they do not say, and who should put time into [AEO](/glossary/aeo) now.

## How big are AI answers in search?

Google's own figures are large and still growing. In its Q2 2025 earnings remarks (July 23, 2025), Alphabet said: "AI Overviews now has over 2 billion monthly users across more than 200 countries and territories and 40 languages." In the same remarks, [AI Mode](/glossary/ai-mode) had "over 100 million monthly active users in the U.S. and India."

A year later, in its Q2 2026 remarks (July 22, 2026), Google said: "Since expanding AI Mode globally last October, we’ve surpassed 1 billion monthly active users." It also said that AI Mode, like AI Overviews, "is driving an incremental increase in Search queries overall."

Read these as company figures from earnings calls. They show reach, and how widely Google now uses AI answers in Search. They do not tell you how often your own queries trigger an AI answer.

Pew Research Center gives an independent view of how often summaries appear. In a study published July 22, 2025, based on the March 2025 browsing of 900 U.S. adults, Pew reported: "Some 18% of all the Google searches in our study generated an AI summary."

## Do AI answers send traffic to websites?

They send some, but the evidence says fewer clicks reach classic results when an AI answer appears.

- **Pew Research Center (July 22, 2025).** Users clicked a traditional search result in 8% of visits to pages with an AI summary, versus 15% of visits to pages without one. Only 1% of visits to pages with a summary included a click on a link inside the summary. Users ended their browsing session on 26% of pages with a summary, compared with 16% without.
- **Ahrefs (February 4, 2026).** Comparing December 2023 with December 2025 across 300,000 keywords, Ahrefs found "the presence of an AI Overview now correlates with a 58% lower average clickthrough rate for the top-ranking page." Its earlier study (April 17, 2025) put the figure at 34.5%.

Google's account is different. Its Search Central blog (May 21, 2025) says that when people click from results pages with AI Overviews, "these clicks are higher quality, where users are more likely to spend more time on the site." In July 2026 Google said it is "now sending billions of clicks to websites every week through AI features in Search."

Both can be true at once: fewer clicks on the classic blue links, and some clicks coming through the links inside AI answers. That second channel is the one AEO works on. If your page is the [citation](/glossary/citation) inside the answer, you are in the place where the remaining clicks go.

## What is still uncertain?

Be clear-eyed about the gaps before you commit time.

- **You cannot split AI traffic out in Search Console.** Google's AI features page says this traffic is included in the Performance report under the "Web" search type. You see the total, not the AI share.
- **The click studies measure correlation.** Ahrefs says so directly, and its 58% figure rests on a forecast of what clickthrough rates would have been without AI Overviews. Pew measured one month of browsing by a panel of 900 U.S. adults. The direction is consistent; the exact size is not settled.
- **Optimization results are not guaranteed.** The GEO paper (Aggarwal et al., first posted November 2023) reports that "GEO can boost visibility by up to 40% in generative engine responses", but that comes from the authors' experiments, not from live engines or your site.
- **The products change fast.** AI Mode went from over 100 million monthly active users in two countries in July 2025 to over 1 billion after a global expansion by July 2026, according to Google. Tactics tied to one product's current behavior may not last.

None of this argues against learning AEO. It argues for learning the durable parts: how retrieval and citation work, how crawlers are controlled, and how to measure what you can.

## What does learning AEO actually involve?

Less than the hype suggests. Google says "There are no additional requirements to appear in AI Overviews or AI Mode, nor other special optimizations necessary." A page has to be indexed and eligible to show in Search with a snippet. Its May 2025 guidance asks for "unique, non-commodity content" and the usual technical basics.

The new parts are specific and learnable:

- **Crawler control.** OpenAI runs separate bots for training ([GPTBot](/glossary/gptbot)) and search ([OAI-SearchBot](/glossary/oai-searchbot)), and says "Each setting is independent of the others." You can opt out of training without leaving ChatGPT search, but a blanket block in [robots.txt](/glossary/robots-txt) removes you from both.
- **Passage-level writing.** [Query fan-out](/glossary/query-fan-out) means an engine may search subtopics of a question, so clearly answered sections give you more ways in.
- **Measurement.** Prompt tracking, citations versus [brand mentions](/glossary/brand-mention), AI referrals in analytics and bot hits in server logs.

If you know SEO, that is a few focused topics on top of what you do already. Our guide on [how to learn AEO](/blog/how-to-learn-aeo) lays out a free self-study path.

## Who is AEO worth it for?

It is most worth your time if:

- **You own informational content.** Ahrefs measured the click drop on keywords that show AI Overviews, using informational keywords without them as the comparison. If your traffic depends on guides, explainers and how-to pages, check how many of your key queries now show an AI answer.
- **You advise others on search.** If you run SEO for clients or an in-house team, you will need to explain the click studies above and set up measurement that Search Console does not give you by default.
- **You control a site's technical setup.** Someone has to decide what robots.txt says to GPTBot, OAI-SearchBot, ClaudeBot and PerplexityBot. That decision has search consequences, not just training ones.

It is less urgent if your customers rarely find you through search, or if your work is mostly paid media. Even then, a basic check of your robots.txt with a tool like the [AI crawler checker](/tools/ai-crawler-checker) takes a few minutes and can catch an accidental block.

## Do you need to pay to learn it?

No. Google's AI features guidance, the crawler docs from OpenAI, Anthropic and Perplexity, the GEO paper and schema.org's documentation are all free, and they are the primary sources any course should be built on.

A course is worth it if you want structure and practice. Learn AEO is one option: eight lessons for marketers who know SEO basics, with the first lesson free and full access at $100 once or $10 a month (see [pricing](/pricing)). It will not guarantee citations, and nothing honestly can. What it can do is help you understand the system well enough to make good decisions and measure the results.`,
  sources: [
    {
      title: "Q2 earnings call: CEO's remarks",
      publisher: "Google (The Keyword)",
      url: "https://blog.google/inside-google/message-ceo/alphabet-earnings-q2-2025/",
      date: "2025-07-23",
      dateKind: "published",
      accessed: ACCESSED,
    },
    {
      title: "Q2 2026 earnings call: Remarks from our CEO",
      publisher: "Google (The Keyword)",
      url: "https://blog.google/company-news/inside-google/message-ceo/alphabet-earnings-q2-2026/",
      date: "2026-07-22",
      dateKind: "published",
      accessed: ACCESSED,
    },
    {
      title: "Google users are less likely to click on links when an AI summary appears in the results",
      publisher: "Pew Research Center",
      url: "https://www.pewresearch.org/short-reads/2025/07/22/google-users-are-less-likely-to-click-on-links-when-an-ai-summary-appears-in-the-results/",
      date: "2025-07-22",
      dateKind: "published",
      accessed: ACCESSED,
    },
    {
      title: "Update: AI Overviews Reduce Clicks by 58%",
      publisher: "Ahrefs",
      url: "https://ahrefs.com/blog/ai-overviews-reduce-clicks-update/",
      date: "2026-02-04",
      dateKind: "published",
      accessed: ACCESSED,
    },
    {
      title: "AI Overviews Reduce Clicks by 34.5%",
      publisher: "Ahrefs",
      url: "https://ahrefs.com/blog/ai-overviews-reduce-clicks/",
      date: "2025-04-17",
      dateKind: "published",
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
      title: "AI features and your website",
      publisher: "Google Search Central",
      url: "https://developers.google.com/search/docs/appearance/ai-features",
      date: "2025-12-10",
      dateKind: "updated",
      accessed: ACCESSED,
    },
    {
      title: "Overview of OpenAI Crawlers",
      publisher: "OpenAI",
      url: "https://developers.openai.com/api/docs/bots",
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
  ],
};

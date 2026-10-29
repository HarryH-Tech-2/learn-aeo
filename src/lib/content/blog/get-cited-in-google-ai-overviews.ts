import type { BlogPost } from "@/lib/blog-posts";

// Every claim below traces to a source opened on 2026-10-28.

export const post: BlogPost = {
  slug: "get-cited-in-google-ai-overviews",
  title: "How to get cited in Google AI Overviews",
  excerpt:
    "What Google Search Central actually requires for AI Overviews and AI Mode, the snippet controls that limit them, and how the traffic is reported.",
  quickAnswer:
    "Google says there are no extra requirements: a page must be indexed and eligible to show in Search with a snippet. Beyond that, the levers are ordinary SEO practices Google lists, and inclusion is never guaranteed.",
  date: "October 28, 2026",
  publishedAt: "2026-10-28",
  category: "Platforms",
  image: "/blog/get-cited-in-google-ai-overviews.webp",
  imageAlt:
    "Abstract brand illustration titled \"How to get cited in Google AI Overviews\", with simple shapes linking a search result to a summarized answer.",
  relatedSlugs: ["how-chatgpt-chooses-sources", "aeo-vs-seo-vs-geo", "llms-txt-explained"],
  faqs: [
    {
      question: "Do I need special schema or an llms.txt file to appear in AI Overviews?",
      answer:
        "No. Google says you don't need to create new machine readable files, AI text files or markup to appear in these features. Structured data should still match the visible text on the page.",
    },
    {
      question: "Does blocking Google-Extended remove my pages from AI Overviews?",
      answer:
        "Google-Extended is a control for training and grounding in some of Google's other systems. Google says it does not affect a site's inclusion in Google Search and is not a Search ranking signal. To limit what appears in Search, including AI Overviews, Google points to nosnippet, data-nosnippet, max-snippet or noindex.",
    },
    {
      question: "Can I see AI Overviews traffic separately in Search Console?",
      answer:
        "Google says traffic from AI Overviews and AI Mode is included in overall search traffic and reported in the Performance report under the \"Web\" search type. Its guidance does not describe a separate AI Overviews report.",
    },
    {
      question: "Why doesn't an AI Overview appear for my query?",
      answer:
        "Google says AI Overviews are shown only when its systems determine they are additive to classic Search, so they often don't trigger.",
    },
  ],
  content: `## What does Google require for AI Overviews?

Nothing beyond normal Search eligibility. Google's page on [AI features and your website](https://developers.google.com/search/docs/appearance/ai-features) says: "There are no additional requirements to appear in AI Overviews or AI Mode, nor other special optimizations necessary." To be eligible as a supporting link, a page must be indexed and eligible to be shown in Google Search with a snippet.

Two caveats from the same page belong in any plan you share with a client or manager:

- "Indexing and serving isn't guaranteed." Eligibility is the entry ticket, not a promise.
- [AI Overviews](/glossary/ai-overviews) are only shown when Google's systems decide they add something to classic Search, so they often don't trigger at all.

So the honest framing is: you can make a page eligible and useful, and you can avoid blocking it by accident. You cannot force a citation.

## How do AI Overviews and AI Mode pick links?

Google describes the mechanism in general terms. Both AI Overviews and [AI Mode](/glossary/ai-mode) "may use a "query fan-out" technique — issuing multiple related searches across subtopics and data sources" to build a response. Google says this lets them show a wider and more diverse set of links than a classic results page.

Google's AI Mode announcement of May 20, 2025 describes [query fan-out](/glossary/query-fan-out) as "breaking down your question into subtopics and issuing a multitude of queries simultaneously on your behalf." In practice, this means a page can be retrieved for a sub-question of the user's query, not only for the query as typed.

Google also notes that "AI Mode and AI Overviews may use different models and techniques, so the set of responses and links they show will vary." Don't expect the same sources in both.

What Google does not publish is a separate ranking system or factor list for AI Overview citations. Its guidance points back to the same fundamentals as Search.

## What should you actually do?

Google's AI features page lists its best practices. They are ordinary SEO work, which is good news if you already know SEO basics:

| Google's best practice | What to check |
| --- | --- |
| Crawling allowed in robots.txt and by any CDN or hosting infrastructure | Googlebot isn't disallowed, and no firewall or bot rule blocks it |
| Content findable through internal links | Important pages are linked from related pages, not orphaned |
| A great page experience for users | The page works well on mobile and loads without getting in the way |
| Important content available in textual form | Key facts aren't only in images, video or script-rendered widgets |
| Text supported by high-quality images and videos, when applicable | Media adds to the text rather than replacing it |
| [Structured data](/glossary/structured-data) matches the visible text | Schema says the same thing the page says |
| Merchant Center and Business Profile information up to date | Product and local data is current, if you have it |

Google also suggests verifying your site in Search Console so you can spot and diagnose technical issues quickly.

Just as useful is what you can skip. Google says: "You don't need to create new machine readable files, AI text files, or markup to appear in these features." An [llms.txt](/glossary/llms-txt) file may have other uses, but Google does not ask for one here.

Past these basics, the work is the same as for any answer engine: write pages that answer a question directly and clearly enough to be quoted as a passage. That is practice, not a documented Google rule, and the free lesson on [how answer engines choose sources](/lessons/how-answer-engines-choose-sources) explains why it tends to matter.

## How do you limit what AI Overviews use?

Google points to the same preview controls used for regular snippets: "To limit the information shown from your pages in Search, use nosnippet, data-nosnippet, max-snippet, or noindex controls." Google's [robots meta tag documentation](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag) spells out how each applies to AI features.

**nosnippet** stops snippets for the page across Google's results, including AI Overviews and AI Mode. Google says it "will also prevent the content from being used as a direct input for AI Overviews and AI Mode."

\`\`\`html
<meta name="googlebot" content="nosnippet">
\`\`\`

**max-snippet** caps the snippet length in characters. Google says it "will also limit how much of the content may be used as a direct input for AI Overviews and AI Mode."

\`\`\`html
<meta name="robots" content="max-snippet:20">
\`\`\`

**data-nosnippet** excludes a specific part of the page from snippets while leaving the rest eligible:

\`\`\`html
<p>This text can be shown in a snippet
<span data-nosnippet>and this part would not be shown</span>.</p>
\`\`\`

Use these with care. Since snippet eligibility is the requirement for appearing as a supporting link, a page-wide \`nosnippet\` works against being cited.

If a control doesn't seem to work, Google's advice is to make sure it is correct and visible to Googlebot, using the URL Inspection tool in Search Console to see the HTML Googlebot received, then allow time for recrawling.

## What about Google-Extended?

[Google-Extended](/glossary/google-extended) is not the control for AI Overviews. Google's crawler documentation says: "Google-Extended does not impact a site's inclusion in Google Search nor is it used as a ranking signal in Google Search." It governs whether content Google crawls may be used for training Gemini models and for grounding in Gemini Apps and Vertex AI. The AI features page points to it for limiting AI training and grounding in "some of Google's other systems." For Search features, use the snippet controls above.

## How do you measure AI Overviews traffic?

Through the normal Performance report. Google says sites appearing in AI features "are included in the overall search traffic in Search Console" and that "they're reported on in the Performance report, within the "Web" search type." Its guidance does not describe a separate AI Overviews filter, so read your Web numbers as including these clicks.

Google also claims "when people click from search results pages with AI Overviews, these clicks are higher quality", meaning visitors are more likely to spend time on the site. That is Google's own observation; check it against your analytics before repeating it.

## The short version

Be indexed, be snippet-eligible, follow the SEO basics Google lists, and don't block yourself by accident with \`nosnippet\` or a CDN rule. Leave Google-Extended out of your AI Overviews decisions, skip new AI files, and measure through the Web search type in Search Console. Nothing on that list guarantees a citation, and Google says as much.
`,
  sources: [
    {
      title: "AI features and your website",
      publisher: "Google Search Central",
      url: "https://developers.google.com/search/docs/appearance/ai-features",
      date: "2025-12-10",
      dateKind: "updated",
      accessed: "2026-10-28",
    },
    {
      title: "Robots meta tag, data-nosnippet, and X-Robots-Tag specifications",
      publisher: "Google Search Central",
      url: "https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag",
      date: "2026-03-24",
      dateKind: "updated",
      accessed: "2026-10-28",
    },
    {
      title: "Google's common crawlers",
      publisher: "Google Crawling Infrastructure",
      url: "https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers",
      date: "2026-10-15",
      dateKind: "updated",
      accessed: "2026-10-28",
    },
    {
      title: "AI in Search: Going beyond information to intelligence",
      publisher: "Google",
      url: "https://blog.google/products-and-platforms/products/search/google-search-ai-mode-update/",
      date: "2025-05-20",
      dateKind: "published",
      accessed: "2026-10-28",
    },
  ],
};

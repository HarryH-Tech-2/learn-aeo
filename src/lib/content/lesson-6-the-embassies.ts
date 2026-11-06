// Lesson 6, The Embassies: platform playbooks.
// Each platform section uses only what that platform documents about itself
// (or a dated, named announcement), checked on the `accessed` date. Where a
// vendor doesn't document something (how it ranks or picks citations, say), the
// lesson says so rather than guessing. Bot names agree with Lesson 2. Larkfield
// Tea is the made-up shop from Lesson 4; its robots.txt, test log, report rows
// and results are invented for the examples and exercises, and are labeled so.

import type { LessonContent, Source } from "../lesson-types";

const ACCESSED = "2026-11-06";

const GOOGLE_AI_FEATURES: Source = {
  title: "AI features and your website",
  publisher: "Google Search Central",
  url: "https://developers.google.com/search/docs/appearance/ai-features",
  date: "2025-12-10",
  dateKind: "updated",
  accessed: ACCESSED,
};

const GOOGLE_AI_GUIDE: Source = {
  title: "Google's Guide to Optimizing for Generative AI Features on Google Search",
  publisher: "Google Search Central",
  url: "https://developers.google.com/search/docs/fundamentals/ai-optimization-guide",
  date: "2026-07-10",
  dateKind: "updated",
  accessed: ACCESSED,
};

const GOOGLE_GENAI_REPORT: Source = {
  title: "Generative AI performance report (Search)",
  publisher: "Search Console Help",
  url: "https://support.google.com/webmasters/answer/16984139",
  accessed: ACCESSED,
};

const GOOGLE_GENAI_CONTROL: Source = {
  title: "Search generative AI control",
  publisher: "Search Console Help",
  url: "https://support.google.com/webmasters/answer/16908024",
  accessed: ACCESSED,
};

const GOOGLE_AI_MODE_HELP: Source = {
  title: "Get AI-powered responses with AI Mode in Google Search",
  publisher: "Google Search Help",
  url: "https://support.google.com/websearch/answer/16011537?hl=en",
  accessed: ACCESSED,
};

const GOOGLE_COMMON_CRAWLERS: Source = {
  title: "Google's common crawlers",
  publisher: "Google Crawling Infrastructure",
  url: "https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers",
  date: "2026-10-30",
  dateKind: "updated",
  accessed: ACCESSED,
};

const GOOGLE_USER_FETCHERS: Source = {
  title: "Google User-Triggered Fetchers",
  publisher: "Google Crawling Infrastructure",
  url: "https://developers.google.com/crawling/docs/crawlers-fetchers/google-user-triggered-fetchers",
  date: "2026-08-19",
  dateKind: "updated",
  accessed: ACCESSED,
};

const GEMINI_SOURCES: Source = {
  title: "View related sources from Gemini Apps",
  publisher: "Gemini Apps Help",
  url: "https://support.google.com/gemini/answer/14143489?hl=en",
  accessed: ACCESSED,
};

const WEBDEV_AGENTS: Source = {
  title: "Build agent-friendly websites",
  publisher: "web.dev",
  url: "https://web.dev/articles/ai-agent-site-ux",
  date: "2026-04-01",
  dateKind: "updated",
  accessed: ACCESSED,
};

const OPENAI_CRAWLERS: Source = {
  title: "Overview of OpenAI Crawlers",
  publisher: "OpenAI",
  url: "https://developers.openai.com/api/docs/bots",
  accessed: ACCESSED,
};

const OPENAI_SEARCH_HELP: Source = {
  title: "Searching the web with ChatGPT",
  publisher: "OpenAI Help Center",
  url: "https://help.openai.com/en/articles/9237897-searching-the-web-with-chatgpt",
  accessed: ACCESSED,
};

const OPENAI_SHOPPING: Source = {
  title: "Shopping with ChatGPT Search",
  publisher: "OpenAI Help Center",
  url: "https://help.openai.com/en/articles/11128490",
  accessed: ACCESSED,
};

const OPENAI_MERCHANTS: Source = {
  title: "Power product discovery in ChatGPT",
  publisher: "OpenAI",
  url: "https://chatgpt.com/merchants",
  accessed: ACCESSED,
};

const ANTHROPIC_CRAWLERS: Source = {
  title: "Does Anthropic crawl data from the web, and how can site owners block the crawler?",
  publisher: "Claude Help Center",
  url: "https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler",
  date: "2026-11-05",
  dateKind: "updated",
  accessed: ACCESSED,
};

const CLAUDE_WEB_SEARCH: Source = {
  title: "Enable and use web search",
  publisher: "Claude Help Center",
  url: "https://support.claude.com/en/articles/10684626-enabling-and-using-web-search",
  accessed: ACCESSED,
};

const CLAUDE_AGENT_BROWSERS: Source = {
  title: "How do Anthropic-hosted browsers identify themselves when they browse the web on a user's behalf?",
  publisher: "Claude Help Center",
  url: "https://support.claude.com/en/articles/18234133-how-do-anthropic-hosted-browsers-identify-themselves-when-they-browse-the-web-on-a-user-s-behalf",
  date: "2026-11-05",
  dateKind: "updated",
  accessed: ACCESSED,
};

const PERPLEXITY_CRAWLERS: Source = {
  title: "Perplexity Crawlers",
  publisher: "Perplexity",
  url: "https://docs.perplexity.ai/docs/resources/perplexity-crawlers",
  accessed: ACCESSED,
};

const PERPLEXITY_HOW: Source = {
  title: "How does Perplexity work?",
  publisher: "Perplexity Help Center",
  url: "https://www.perplexity.ai/help-center/en/articles/10352895-how-does-perplexity-work",
  date: "2026-10-26",
  dateKind: "updated",
  accessed: ACCESSED,
};

const BING_AI_ANSWERS: Source = {
  title: "Optimizing Your Content for Inclusion in AI Search Answers",
  publisher: "Microsoft Advertising Blog (Microsoft Bing)",
  url: "https://about.ads.microsoft.com/en/blog/post/october-2025/optimizing-your-content-for-inclusion-in-ai-search-answers",
  date: "2025-10-08",
  dateKind: "published",
  accessed: ACCESSED,
};

const BING_COPILOT_SEARCH: Source = {
  title: "Introducing Copilot Search in Bing",
  publisher: "Microsoft Bing Blog",
  url: "https://blogs.bing.com/search/2025/4/Introducing-Copilot-Search-in-Bing/",
  date: "2025-04-04",
  dateKind: "published",
  accessed: ACCESSED,
};

const BING_NOSNIPPET: Source = {
  title: "Bing Introduces Support for the data-nosnippet HTML Attribute",
  publisher: "Bing Webmaster Blog",
  url: "https://blogs.bing.com/webmaster/2025/10/Bing-Introduces-Support-for-the-data-nosnippet-HTML-Attribute/",
  date: "2025-10-15",
  dateKind: "published",
  accessed: ACCESSED,
};

const BING_AI_PERFORMANCE: Source = {
  title: "Introducing AI Performance in Bing Webmaster Tools Public Preview",
  publisher: "Bing Webmaster Blog",
  url: "https://blogs.bing.com/webmaster/2026/2/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview/",
  date: "2026-02-10",
  dateKind: "published",
  accessed: ACCESSED,
};

const BING_AI_VISIBILITY: Source = {
  title: "New AI Visibility Insights in Bing Webmaster Tools: Intents, Topics, Citation Share, Compare",
  publisher: "Microsoft Bing Blog",
  url: "https://blogs.bing.com/search/2026/6/New-AI-Visibility-Insights-in-Bing-Webmaster-Tools-Intents-Topics-Citation-Share-Compare/",
  date: "2026-06-16",
  dateKind: "published",
  accessed: ACCESSED,
};

const BING_TOPICS_PORTFOLIO: Source = {
  title: "Introducing Topics Portfolio (Beta) in AI Performance",
  publisher: "Bing Webmaster Blog",
  url: "https://blogs.bing.com/webmaster/2026/10/introducing-topics-portfolio-beta-in-ai-performance/",
  date: "2026-10-13",
  dateKind: "published",
  accessed: ACCESSED,
};

const APPLEBOT: Source = {
  title: "About Applebot",
  publisher: "Apple Support",
  url: "https://support.apple.com/en-us/119829",
  accessed: ACCESSED,
};

export const LESSON_6: LessonContent = {
  intro:
    "You have reached The Embassies, the sixth district of the City of Answers. Each AI search platform keeps an embassy here, and each publishes its own rules: where its answers get their web results, which bot to let in, what it shows and how it credits sources. In this district you visit them one at a time (Google, Gemini, ChatGPT, Claude, Perplexity, Microsoft Copilot and Apple), plus the AI agents that now browse for users. You use only what each platform documents about itself, note where it documents nothing, and finish with a fair way to test your pages on all of them.",

  outro:
    "You leave The Embassies knowing, for each platform, where its answers come from, which bot or setting controls your place in them, what it says about showing sources, and how to test it by hand. You also know where the vendors stay silent: none of them publishes a list of AI ranking factors. Next stop is The Observatory, where you turn these one-off tests into ongoing measurement.",

  groups: [
    {
      id: "g-google",
      title: "Google: AI Overviews, AI Mode and Gemini",
      concepts: [
        {
          id: "c-google-eligibility",
          quiz: {
            kind: "choice",
            id: "cq-google-eligibility",
            prompt: "Besides being indexed and eligible to show with a snippet, what else does Google's 2026 guide say a site needs?",
            options: [
              "To be included in Search generative AI features in Search Console",
              "An llms.txt file at the root of the site",
              "Content broken into short chunks",
              "Special schema.org markup",
            ],
            answer: 0,
            explanation:
              "The guide says a site must be included in Search generative AI features in Search Console. Inclusion is the default, and it lists llms.txt, chunking and special markup as things you can ignore for Google.",
          },
          term: "Eligibility for Google's AI features",
          summary: "A page that can appear in Google Search with a snippet can appear in AI Overviews and AI Mode, as long as the site hasn't opted out in Search Console.",
          explanation:
            "Google's page on AI features is direct: \"There are no additional requirements to appear in AI Overviews or AI Mode, nor other special optimizations necessary.\"\n\nThe technical bar is the ordinary one: \"To be eligible to be shown as a supporting link in AI Overviews or AI Mode, a page must be indexed and eligible to be shown in Google Search with a snippet\". And: \"You don't need to create new machine readable files, AI text files, or markup to appear in these features.\"\n\nGoogle's 2026 guide adds one condition that came with a new Search Console setting: \"a site must be included in Search generative AI features in Search Console to be eligible for display in generative AI features on Google Search.\" Inclusion is the default, so most sites need do nothing; the controls card below explains the setting.\n\nThe guide also says that, from Google's perspective, optimizing for these features \"is optimizing for the search experience, and thus still SEO.\" It lists llms.txt files, chunking content and special schema markup as things you can ignore for Google Search.",
          whyItMatters:
            "For Google, AEO work is SEO work done well: indexable pages, a usable snippet, helpful content, and the default setting left alone. Anyone selling a Google-specific AI trick is selling something Google says doesn't exist.",
          pitfall:
            "Assuming eligibility means appearance. Google adds that meeting every requirement \"doesn't mean that Google will crawl, index, or serve its content.\"",
          sources: [GOOGLE_AI_FEATURES, GOOGLE_AI_GUIDE, GOOGLE_GENAI_CONTROL],
        },
        {
          id: "c-google-how",
          quiz: {
            kind: "choice",
            id: "cq-google-how",
            prompt: "Why might AI Overviews and AI Mode cite different pages for the same question?",
            options: [
              "Google says they may use different models and techniques",
              "AI Mode only cites pages with special AI markup",
              "AI Overviews only cite paid placements",
              "They use different search indexes run by different companies",
            ],
            answer: 0,
            explanation:
              "Google says AI Mode and AI Overviews may use different models and techniques, so the responses and links they show will vary. Both retrieve from Google's own Search index.",
          },
          term: "How Google's AI features pick links",
          summary: "Both features retrieve from Google's Search index using its core ranking systems, fan out into related searches, and show supporting links; Google publishes no separate AI ranking factors.",
          explanation:
            "Google's guide names two techniques. The first is retrieval-augmented generation, \"relying on our core Search ranking systems to retrieve relevant, up-to-date web pages from our Search index.\" The second is query fan-out: \"A set of concurrent, related queries generated by the model to request more information and fetch additional relevant search results to address the user's query.\"\n\nThe two features don't behave identically. Google says \"AI Mode and AI Overviews may use different models and techniques, so the set of responses and links they show will vary.\" AI Overviews appear only when Google's systems judge them additive to classic Search, and Google says they often don't trigger. AI Mode is aimed at queries \"where further exploration, reasoning, or complex comparisons are needed.\"\n\nWhat Google doesn't publish is a list of AI-specific ranking factors. Its advice is the usual: unique, people-first content, a sound technical setup, and current Merchant Center and Business Profile details for shops and local businesses.",
          whyItMatters:
            "You can be cited for a fan-out query you would never rank for on its own, and the two features can cite different pages for the same question. Test both, and treat each clearly answered subtopic on your page as another way in.",
          example: {
            kind: "code",
            language: "text",
            caption: "Google's own fan-out illustration, from its 2026 guide",
            code: "User's question:\n  how to fix a lawn that's full of weeds\n\nFan-out queries Google gives as examples:\n  best herbicides for lawns\n  remove weeds without chemicals\n  how to prevent weeds in lawn",
          },
          pitfall:
            "Writing a separate page for every fan-out variation. Google says doing so \"primarily to manipulate rankings or generative AI responses in Google Search violates Google's scaled content abuse spam policy.\"",
          sources: [GOOGLE_AI_GUIDE, GOOGLE_AI_FEATURES],
        },
        {
          id: "c-google-controls",
          quiz: {
            kind: "choice",
            id: "cq-google-controls",
            prompt: "A publisher wants to stay in Google Search but out of AI Overviews and AI Mode, without trimming its ordinary snippets. Which control fits?",
            options: [
              "The Search generative AI control in Search Console",
              "A Disallow rule for Google-Extended",
              "A nosnippet meta tag on every page",
              "A Disallow rule for Googlebot",
            ],
            answer: 0,
            explanation:
              "The Search generative AI control covers AI Overviews, AI Mode and Discover's generative AI features and isn't used for other parts of Search. Google-Extended doesn't affect Search inclusion, and nosnippet also changes ordinary results.",
          },
          term: "Controls for Google's AI features",
          summary: "A Search Console setting decides inclusion in Google's generative AI features; snippet controls limit what is shown; Google-Extended covers Gemini training and grounding, not Search.",
          explanation:
            "Google now gives you three separate controls.\n\n- **Search generative AI control** (Search Console, Settings > Search generative AI). Google says: \"As of August 31, 2026, we've rolled out this control to all websites worldwide.\" It covers AI Overviews, AI Mode and generative AI features in Google Discover. If you exclude your site, \"You won't receive any traffic or impressions from these features\", and Google says the control \"isn't used as a ranking or inclusion signal affecting other parts of Search.\" Changes generally take a few days.\n- **Snippet controls**: \"To limit the information shown from your pages in Search, use nosnippet, data-nosnippet, max-snippet, or noindex controls.\" These change your ordinary results too.\n- **Google-Extended**, a robots.txt token. It governs whether content Google crawls may train future Gemini models and ground answers in Gemini Apps and Vertex AI, and it \"does not impact a site's inclusion in Google Search nor is it used as a ranking signal\".\n\nCrawling for Search, AI features included, stays with your Googlebot rules (Lesson 2).",
          whyItMatters:
            "Opting out is now a single setting, and it's a business decision with a cost: no traffic or impressions from these features, while other sites' content still answers the question. Know who in your company can change Search Console settings.",
          example: {
            kind: "code",
            language: "html",
            caption: "The snippet controls Google lists, on a made-up page",
            code: "<!-- Keep the whole page out of snippets, AI features included -->\n<meta name=\"robots\" content=\"nosnippet\">\n\n<!-- Or cap snippet length at 50 characters -->\n<meta name=\"robots\" content=\"max-snippet:50\">\n\n<!-- Or hide one block only -->\n<div data-nosnippet>Trade prices for wholesale customers</div>",
          },
          pitfall:
            "Disallowing Google-Extended to keep a site out of AI Overviews. It doesn't affect Search inclusion; the Search generative AI control or snippet controls do, and each has a cost.",
          sources: [GOOGLE_AI_FEATURES, GOOGLE_GENAI_CONTROL, GOOGLE_COMMON_CRAWLERS],
        },
        {
          id: "c-google-measure",
          quiz: {
            kind: "choice",
            id: "cq-google-measure",
            prompt: "What does an impression in the Generative AI performance report count?",
            options: [
              "A time a link to your site was shown to a user in a generative AI feature",
              "A click from an AI Overview to your site",
              "A time your brand was named without a link",
              "A Googlebot visit to your page",
            ],
            answer: 0,
            explanation:
              "Google defines impressions as how many times links to your site were shown to a user in a generative AI feature on Google Search. It's a visibility measure, not clicks.",
          },
          term: "Google's AI feature reporting",
          summary: "Search Console counts AI Overviews and AI Mode in the Web search type, and a Generative AI performance report shows impressions in those features.",
          explanation:
            "Google says sites appearing in AI features \"are included in the overall search traffic in Search Console\", reported in the Performance report under the Web search type.\n\nSearch Console also has a Generative AI performance report. Google's help page says it \"shows data about how your site performs in generative AI features on Google Search\" and includes impressions for AI Overviews and AI Mode. Google defines an impression this way: \"Impressions are how many times links to your site were shown to a user in a generative AI feature on Google Search.\" You can group by page, country, date and device, and filter by text-based or multimodal search. Two links from your site in one feature count once in the chart total.\n\nThere are gaps: \"Search Console doesn't include data from experiments in Search Labs\", and the usual row limits apply. Lesson 7 shows how to fold this report into ongoing tracking alongside GA4 and Bing.",
          whyItMatters:
            "This is first-party data from the platform itself, which no third-party tracker can match for Google. Check it before you build anything else, and before and after any change to the Search generative AI control.",
          pitfall:
            "Reading impressions as clicks. The report counts how many times links to your site were shown in a generative AI feature; it is a visibility measure.",
          sources: [GOOGLE_AI_FEATURES, GOOGLE_GENAI_REPORT],
        },
        {
          id: "c-gemini-app",
          quiz: {
            kind: "choice",
            id: "cq-gemini-app",
            prompt: "A site disallows Google-Extended in robots.txt. What does that affect, according to this card?",
            options: [
              "Gemini model training and grounding in Gemini Apps",
              "Inclusion in Google Search",
              "Citations in AI Overviews and AI Mode",
              "Googlebot's crawl rate",
            ],
            answer: 0,
            explanation:
              "Google-Extended manages training of future Gemini models and grounding in Gemini Apps (and Vertex AI). It doesn't touch Google Search, so AI Overviews and AI Mode are governed elsewhere.",
          },
          term: "The Gemini app",
          summary: "Gemini grounds some replies in Google's Search index and shows a Sources button when it does; Google-Extended, not Googlebot, controls that grounding.",
          explanation:
            "The Gemini app is a separate product from AI Mode, with its own control. Google's crawler documentation says Google-Extended manages whether crawled content is used \"for grounding (providing content from the Google Search index to the model at prompt time to improve factuality and relevancy)\" in Gemini Apps, as well as for training future Gemini models. So Gemini's web answers draw on the same Search index, but the opt-out is different: disallowing Google-Extended removes your pages from Gemini grounding without touching Search.\n\nSources aren't shown on every reply. Google's help page says \"Not all responses include related links or sources.\" When they are, \"you can find the Sources button at the bottom of the response or in-line throughout the response.\" And: \"If Gemini Apps directly quotes a large amount of text from a webpage, you'll see a link to that webpage in the sources list.\"\n\nGoogle doesn't document how Gemini chooses which pages to cite, and its Generative AI performance report covers AI Overviews and AI Mode, not the Gemini app. Testing Gemini is a hand job: ask, then open Sources.",
          whyItMatters:
            "Blocking Google-Extended is a trade-off, not a free privacy switch: it keeps your pages out of Gemini's grounded answers as well as Gemini training. Decide it on purpose, section by section if you need to.",
          example: {
            kind: "code",
            language: "robots",
            caption: "In Google Search (AI features included), out of Gemini training and Gemini Apps grounding",
            code: "User-agent: Googlebot\nAllow: /\n\nUser-agent: Google-Extended\nDisallow: /",
          },
          pitfall:
            "Testing in Gemini and assuming the result tells you about AI Overviews, or the reverse. They are different products with different controls, so test and record them separately.",
          sources: [GOOGLE_COMMON_CRAWLERS, GEMINI_SOURCES],
        },
      ],
      check: [
        {
          kind: "choice",
          id: "q-google-require",
          prompt: "What does a page need to be eligible as a supporting link in AI Overviews or AI Mode?",
          options: [
            "An llms.txt file and FAQPage markup",
            "To be indexed and eligible to show in Google Search with a snippet, on a site that hasn't opted out",
            "A Google-Extended Allow rule in robots.txt",
            "A separate submission to Google's AI team",
          ],
          answer: 1,
          explanation:
            "Google says a page must be indexed and eligible to be shown in Search with a snippet, and its 2026 guide adds that the site must be included (the default) in Search Console's generative AI setting. No AI files or special markup are needed.",
        },
        {
          kind: "match",
          id: "q-google-controls",
          prompt: "Match each Google control to what it does.",
          pairs: [
            { term: "Googlebot rules in robots.txt", definition: "Control crawling for Search, AI features included" },
            { term: "nosnippet / max-snippet", definition: "Limit what is shown from a page in Search" },
            { term: "Google-Extended", definition: "Gemini training and grounding in Gemini Apps" },
            { term: "Search generative AI control", definition: "Include or exclude the site from AI Overviews and AI Mode" },
          ],
          explanation:
            "These follow Google's AI features page, its common crawlers page and the Search Console help page for the generative AI control.",
        },
        {
          kind: "choice",
          id: "q-gemini-sources",
          prompt: "You ask the Gemini app a question and see no Sources button under the reply. What does Google say that means?",
          options: [
            "Gemini didn't provide any links for that response",
            "Your site is blocked by Google-Extended",
            "The Gemini app never shows sources",
            "You need to verify your site in Search Console",
          ],
          answer: 0,
          explanation:
            "Google's help page says not all responses include sources, and no Sources button means Gemini didn't provide links for that particular response. Ask again, or ask a question that needs current information.",
        },
      ],
    },
    {
      id: "g-chatgpt-claude",
      title: "ChatGPT, Claude and browsing agents",
      concepts: [
        {
          id: "c-chatgpt",
          quiz: {
            kind: "blank",
            id: "cq-chatgpt",
            prompt: "Complete OpenAI's sentence.",
            text: "Sites that are opted out of ___ will not be shown in ChatGPT search answers.",
            answers: ["OAI-SearchBot"],
            distractors: ["GPTBot", "ChatGPT-User"],
            explanation:
              "OAI-SearchBot is the search-inclusion control. GPTBot is about training, and ChatGPT-User isn't used to decide what appears in search.",
          },
          term: "ChatGPT search",
          summary: "ChatGPT search answers are built from sites OAI-SearchBot may crawl plus results from search partners; GPTBot (training) and ChatGPT-User (user requests) are separate.",
          explanation:
            "OpenAI says: \"OAI-SearchBot is used to surface websites in search results in ChatGPT's search features. Sites that are opted out of OAI-SearchBot will not be shown in ChatGPT search answers, though can still appear as navigational links.\"\n\nThe agents are independent: \"Each setting is independent of the others\", so you can allow OAI-SearchBot while disallowing GPTBot, which crawls content \"that may be used in training our generative AI foundation models.\" ChatGPT-User fetches pages when a user asks, and \"ChatGPT-User is not used to determine whether content may appear in Search.\" After a robots.txt change, OpenAI notes \"it can take ~24 hours from a site's robots.txt update for our systems to adjust.\"\n\nOpenAI also says where results come from: \"ChatGPT search sometimes partners with other search providers\", and it \"typically rewrites your query into one or more targeted queries\" before sending them. The help page points to Microsoft's privacy statement for how those providers handle queries. OpenAI doesn't publish how it ranks results or picks the citations it shows.",
          whyItMatters:
            "OAI-SearchBot is the one switch that decides whether ChatGPT search can cite you. It is easy to block it by accident while trying to block training, as this lesson's exercise shows.",
          example: {
            kind: "code",
            language: "robots",
            caption: "Out of OpenAI training, in ChatGPT search: one group per bot",
            code: "User-agent: GPTBot\nDisallow: /\n\nUser-agent: OAI-SearchBot\nAllow: /",
          },
          pitfall:
            "Blocking ChatGPT-User to keep out of search. OpenAI says it isn't used for search inclusion; OAI-SearchBot is the control for that.",
          sources: [OPENAI_CRAWLERS, OPENAI_SEARCH_HELP],
        },
        {
          id: "c-chatgpt-shopping",
          quiz: {
            kind: "choice",
            id: "cq-chatgpt-shopping",
            prompt: "What does OpenAI say about how product results in ChatGPT are chosen?",
            options: [
              "ChatGPT selects them independently; they aren't ads or influenced by OpenAI partnerships",
              "Merchants bid for places in the carousel",
              "Only Shopify stores can appear",
              "OpenAI verifies every review before using it",
            ],
            answer: 0,
            explanation:
              "OpenAI says product results are selected independently by ChatGPT and are not ads. It also says reviews and ratings are not verified by OpenAI.",
          },
          term: "Shopping results in ChatGPT",
          summary: "Product results come from structured product data and other third-party content, not ads; Shopify and Etsy catalogs are already connected and other merchants can apply to share a feed.",
          explanation:
            "When a question shows shopping intent, ChatGPT can show a product carousel. OpenAI says \"Product results are selected independently by ChatGPT and are not ads, nor influenced by any OpenAI partnerships.\"\n\nIt lists what goes into the selection, starting with \"Structured metadata from first-party and third-party providers (e.g., price, product description) and other third-party content.\" Once a shopper picks a product, \"Merchants are ranked based on factors like availability, price, quality, and whether they are the maker or primary seller of that item.\" Labels on product images are generated by ChatGPT, and \"Reviews and ratings are not verified by OpenAI.\"\n\nYou can supply the data yourself. OpenAI's merchant page says \"If you sell through Shopify or Etsy, your catalog is already integrated, and no additional setup or application is required.\" Other merchants apply to share a product feed. The same page says \"Shopping is currently live for ChatGPT users in the U.S.\" Lesson 9 covers product data in depth.",
          whyItMatters:
            "For a shop, the product feed is the door to ChatGPT's carousel, the way OAI-SearchBot is the door to its cited links. Complete, current product data is the part you control.",
          pitfall:
            "Assuming ChatGPT shows your live price. OpenAI says that when merchants change pricing or shipping, \"there may be some delay before it is reflected in the information you see.\" Check your listings after a price change.",
          sources: [OPENAI_SHOPPING, OPENAI_MERCHANTS],
        },
        {
          id: "c-claude",
          quiz: {
            kind: "choice",
            id: "cq-claude",
            prompt: "Your robots.txt has a rule naming ClaudeBot, and your general AI-training preference says something different. Which does Anthropic follow for ClaudeBot?",
            options: ["The rule that names ClaudeBot", "The general preference", "Whichever is stricter", "Neither, until you email Anthropic"],
            answer: 0,
            explanation: "Anthropic treats rules that name ClaudeBot as more specific, so they take priority over the general signal.",
          },
          term: "Claude",
          summary: "Anthropic runs three bots: ClaudeBot for training, Claude-SearchBot for search indexing, and Claude-User for pages fetched when a user asks. Claude's web answers include citations.",
          explanation:
            "Anthropic's help center describes each bot by what happens when you disable it:\n\n- **ClaudeBot**: \"When a site restricts ClaudeBot access, it signals that the site's future materials should be excluded from our AI model training datasets.\"\n- **Claude-SearchBot**: \"Disabling Claude-SearchBot on your site prevents our system from indexing your content for search optimization, which may reduce your site's visibility and accuracy in user search results.\"\n- **Claude-User**: \"Disabling Claude-User on your site prevents our system from retrieving your content in response to a user query, which may reduce your site's visibility for user-directed web search.\"\n\nOn the answer side, Anthropic says that when Claude searches, \"Every response includes citations, so you can easily verify sources yourself.\" Its help page says image results come from Bing but doesn't name the provider behind text results, and Anthropic doesn't document how Claude chooses which pages to cite.\n\nSince 30 October 2026 Anthropic also reads a general machine-readable \"no AI training\" preference, but a robots.txt rule that names ClaudeBot takes priority over it.",
          whyItMatters:
            "As with OpenAI, training and search are separate decisions. A brand that wants to be found in Claude's answers but not used for training blocks ClaudeBot and leaves the other two alone.",
          example: {
            kind: "code",
            language: "robots",
            caption: "Out of Anthropic's training, in Claude's search (bot names from Anthropic's help center)",
            code: "User-agent: ClaudeBot\nDisallow: /\n\nUser-agent: Claude-SearchBot\nAllow: /\n\nUser-agent: Claude-User\nAllow: /",
          },
          pitfall:
            "Copying an old block list that names only \"anthropic-ai\", which isn't one of the three bots on Anthropic's current page. Check names against the vendor's page, as Lesson 2's Guardian example showed.",
          sources: [ANTHROPIC_CRAWLERS, CLAUDE_WEB_SEARCH],
        },
        {
          id: "c-agents",
          quiz: {
            kind: "choice",
            id: "cq-agents",
            prompt: "How does Anthropic say you should confirm that a Claude-Agent request is genuine?",
            options: [
              "Check that it comes from one of Anthropic's listed IP addresses",
              "Trust the Claude-Agent token in the user agent",
              "Check whether it read your robots.txt first",
              "Ask the visitor to log in",
            ],
            answer: 0,
            explanation:
              "Anthropic warns that anyone can send the same User-Agent header, so check the traffic came from one of the listed IPs before treating it as genuine.",
          },
          term: "AI agents that browse for users",
          summary: "Agents that click and fill in forms for users identify themselves with tokens such as Google-Agent and Claude-Agent; verify them by IP, and make tasks work in plain HTML.",
          explanation:
            "Besides crawlers and fetchers there is a third kind of visitor: a browser driven by an AI agent completing a task, such as comparing products or booking a table.\n\nGoogle lists Google-Agent among its user-triggered fetchers: it \"is used by agents hosted on Google infrastructure to navigate the web and perform actions upon user request.\" Google says user-triggered fetchers \"generally ignore robots.txt rules\" because a user asked for the fetch.\n\nAnthropic's hosted browser adds the Claude-Agent token to its user agent. Anthropic says \"Anyone can send the same User-Agent header, so be sure to check that the traffic originated from one of the listed IPs before concluding that it is genuine.\" Allowing or blocking it decides whether users \"can ask their Claude services that leverage this type of agentic browser use to complete tasks on your website.\"\n\nGoogle's guide says browser agents work by \"analyzing visual renderings (like screenshots), inspecting the DOM structure, and interpreting the accessibility tree.\" Clear labels, real buttons and visible prices help agents and people alike; web.dev's agent-friendly guide covers the details.",
          whyItMatters:
            "Agents are how assistants move from recommending you to buying from you. A bot-blocking rule, or a checkout that only works on hover, can stop the task at your door, and no citation report will show it.",
          example: {
            kind: "code",
            language: "text",
            caption: "User-agent strings as Google and Anthropic publish them (version numbers change)",
            code: "# Google-Agent (desktop)\nMozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko; compatible; Google-Agent; +https://developers.google.com/crawling/docs/crawlers-fetchers/google-agent) Chrome/W.X.Y.Z Safari/537.36\n\n# Claude-Agent\nMozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko; compatible; Claude-Agent/1.0) Chrome/154.0.0.0 Safari/537.36",
          },
          pitfall:
            "Trusting the user-agent string alone. Google and Anthropic both warn it can be copied; check the request comes from the vendor's published IP ranges before you allow or block it.",
          sources: [GOOGLE_USER_FETCHERS, CLAUDE_AGENT_BROWSERS, GOOGLE_AI_GUIDE, WEBDEV_AGENTS],
        },
      ],
      check: [
        {
          kind: "spot",
          id: "q-chatgpt-spot",
          prompt: "This site wants to stay out of OpenAI's model training but appear in ChatGPT search. Which line stops that?",
          language: "robots",
          lines: ["User-agent: GPTBot", "User-agent: OAI-SearchBot", "Disallow: /", "", "User-agent: *", "Disallow: /checkout/"],
          answer: 1,
          explanation:
            "Stacked user-agent lines share one group, so OAI-SearchBot gets Disallow: / along with GPTBot. OpenAI says sites opted out of OAI-SearchBot won't be shown in ChatGPT search answers. Remove that line and it falls back to the * group.",
        },
        {
          kind: "choice",
          id: "q-claude-user",
          prompt: "What does Anthropic say happens if you disable Claude-User?",
          options: [
            "Your content is removed from past training data",
            "Claude can't retrieve your content in response to a user's query, which may reduce your visibility",
            "Nothing: Claude-User ignores robots.txt",
            "Claude stops crawling your site for training",
          ],
          answer: 1,
          explanation:
            "Anthropic says disabling Claude-User prevents its system from retrieving your content in response to a user query, which may reduce visibility for user-directed web search. Training is ClaudeBot's job.",
        },
        {
          kind: "choice",
          id: "q-shopping-feed",
          prompt: "A shop sells through Shopify and wants its products in ChatGPT's shopping results. What does OpenAI say it needs to do?",
          options: [
            "Nothing extra: Shopify catalogs are already integrated",
            "Buy ads in ChatGPT",
            "Allow GPTBot in robots.txt",
            "Add a product list to llms.txt",
          ],
          answer: 0,
          explanation:
            "OpenAI's merchant page says Shopify and Etsy catalogs are already integrated with no setup or application. Product results aren't ads, and GPTBot is OpenAI's training crawler.",
        },
        {
          kind: "choice",
          id: "q-agent-robots",
          prompt: "Why can't robots.txt alone control Google-Agent?",
          options: [
            "Google says user-triggered fetchers generally ignore robots.txt, because a user asked for the fetch",
            "Google-Agent has no user-agent string",
            "robots.txt only applies to Bing",
            "Google-Agent reads llms.txt instead",
          ],
          answer: 0,
          explanation:
            "Google-Agent is listed among Google's user-triggered fetchers, which generally ignore robots.txt. Firewall rules matched to published IP ranges are the tool for those visitors.",
        },
      ],
    },
    {
      id: "g-perplexity-copilot",
      title: "Perplexity, Microsoft Copilot and Apple",
      concepts: [
        {
          id: "c-perplexity",
          quiz: {
            kind: "choice",
            id: "cq-perplexity",
            prompt: "What does Perplexity say Perplexity-User does with robots.txt rules?",
            options: [
              "It generally ignores them, because a user requested the fetch",
              "It always obeys them",
              "It reads only the Crawl-delay line",
              "It uses them to decide what to train on",
            ],
            answer: 0,
            explanation:
              "Perplexity says that since a user requested the fetch, Perplexity-User generally ignores robots.txt rules. PerplexityBot is the robots.txt-governed search crawler.",
          },
          term: "Perplexity",
          summary: "Perplexity answers with numbered citations; PerplexityBot is the bot it uses to surface and link sites, and Perplexity-User fetches pages for users.",
          explanation:
            "Perplexity's help center says \"Each answer includes numbered citations linking to the original sources\", and describes the process as understanding your question, searching the web and summarizing what it finds.\n\nIts crawler docs describe two agents. \"PerplexityBot is designed to surface and link websites in search results on Perplexity. It is not used to crawl content for AI foundation models.\" Perplexity recommends \"allowing PerplexityBot in your site's robots.txt file and permitting requests from our published IP ranges\".\n\nPerplexity-User visits a page when a user asks a question. It \"is not used for web crawling or to collect content for training AI foundation models\", and Perplexity adds: \"Since a user requested the fetch, this fetcher generally ignores robots.txt rules.\"\n\nThe docs include firewall recipes for Cloudflare and AWS WAF that match each bot's user agent against its own published IP ranges. Perplexity doesn't document how it ranks or picks the sources it cites.",
          whyItMatters:
            "Perplexity shows its sources by number on every answer, so it is the easiest platform to check by hand: ask, then read the citations.",
          example: {
            kind: "code",
            language: "text",
            caption: "Perplexity's Cloudflare rule expression (fill in each bot's current ranges from its JSON file)",
            code: "(http.user_agent contains \"PerplexityBot\" and ip.src in {<PerplexityBot IP ranges>}) or (http.user_agent contains \"Perplexity-User\" and ip.src in {<Perplexity-User IP ranges>})",
          },
          pitfall:
            "Allowing PerplexityBot in robots.txt while a CDN or firewall blocks its IP ranges (Lesson 2's bouncer at the door). Perplexity asks for both.",
          sources: [PERPLEXITY_HOW, PERPLEXITY_CRAWLERS],
        },
        {
          id: "c-copilot",
          quiz: {
            kind: "choice",
            id: "cq-copilot",
            prompt: "What does Bing say happens to content marked with data-nosnippet?",
            options: [
              "It's still indexed, but left out of snippets and AI summaries",
              "It's removed from Bing's index",
              "It's shown only in Copilot",
              "Bing ignores the attribute",
            ],
            answer: 0,
            explanation:
              "Bing says marked content is still indexed normally but excluded from snippets and AI summaries, so the page stays discoverable.",
          },
          term: "Microsoft Copilot",
          summary: "Copilot's answers are grounded in Bing's index, so Bing indexing, Bing Webmaster Tools and IndexNow are the levers; data-nosnippet limits what is shown.",
          explanation:
            "Microsoft says: \"Powered by Bing's search index, experiences like Microsoft Copilot, Microsoft Start, and others handle billions of queries each month\". So Bing's crawler reaching your pages, and Bing indexing them, is the gate, and Bing Webmaster Tools is where you check both.\n\nOn the answer side, Copilot Search in Bing \"cites its sources prominently\". Microsoft adds that \"we inline link the entire sentence or passage within the responses\", and \"With just a click, you can see a list of every link used to generate the curated answer.\"\n\nTo limit what is shown, Bing supports `data-nosnippet`. Marked content \"is still indexed normally, but it will be excluded from snippets and AI summaries.\"\n\nMicrosoft's advice on being chosen is general: \"While there's no secret strategy for being selected by AI systems, success starts with content that is fresh, authoritative, structured, and semantically clear.\" Its Webmaster blog also recommends IndexNow, so changes reach Bing quickly.",
          whyItMatters:
            "If your pages aren't in Bing's index, Copilot can't ground an answer in them, however well you do on Google.",
          example: {
            kind: "code",
            language: "html",
            caption: "Bing's own data-nosnippet example",
            code: "<h2>Overview</h2>\n<p>This section may appear in Bing Search and Copilot answers.</p>\n<div data-nosnippet>\n  <h3>Subscriber Content</h3>\n  <p>This section does not appear in Bing Search and Copilot answers.</p>\n</div>",
          },
          pitfall:
            "Treating Bing as an afterthought. Copilot draws on Bing's index, so Bing indexing matters for Copilot answers whatever your Bing search traffic looks like.",
          sources: [BING_AI_ANSWERS, BING_COPILOT_SEARCH, BING_NOSNIPPET, BING_AI_PERFORMANCE],
        },
        {
          id: "c-bing-ai-performance",
          quiz: {
            kind: "choice",
            id: "cq-bing-ai-performance",
            prompt: "What does Citation Share measure?",
            options: [
              "Your site's percentage of all citations shown for a grounding query",
              "Your share of clicks from Bing",
              "Where you rank against named competitors",
              "A quality score for each page",
            ],
            answer: 0,
            explanation:
              "Bing calculates it as your citations as a percentage of all citations shown for the same grounding query. It doesn't expose competitors, traffic or quality scores.",
          },
          term: "Bing's AI Performance report",
          summary: "Bing Webmaster Tools shows citations, cited pages and the grounding queries behind them across Copilot, Bing's AI summaries and select partners.",
          explanation:
            "In February 2026 Bing Webmaster Tools added AI Performance, which \"shows how publisher content appears across Microsoft Copilot, AI-generated summaries in Bing, and select partner integrations.\" It reports total citations, average cited pages, citation counts by page, and grounding queries, which Bing describes as \"the key phrases the AI used when retrieving content that was referenced in AI-generated answers.\"\n\nIn June 2026 Bing added Intents, Topics, Citation Share and Compare. Citation Share \"is calculated as the percentage of citations attributed to your site out of all citations shown across all sites for that same grounding query.\" In October 2026 a Topics Portfolio beta added Opportunity Queries, which list \"the top queries in the same topic where other sites appear and yours does not\".\n\nOf the platforms in this district, Bing is the only one that shows site owners the phrases its AI searched with. Lesson 7 shows how to track these numbers over time.",
          whyItMatters:
            "Grounding queries show which phrasing pulled your page in, and Opportunity Queries show where others are cited and you aren't. That turns a vague goal of more AI visibility into a list of specific pages to write or improve.",
          example: {
            kind: "code",
            language: "text",
            caption: "Made up: the kind of rows Larkfield Tea might see (invented queries and figures, simplified layout)",
            code: "Grounding query                    Citations   Citation Share\nloose leaf green tea uk delivery   41          12%\nhow to brew sencha                 18          4%\n\nOpportunity query (others cited, Larkfield not)\nbest gyokuro for beginners         20-50 citations (range)",
          },
          pitfall:
            "Treating Citation Share as a league table. Bing says it \"is designed as an observational metric\" and \"does not expose competitor domains, represent traffic share, or assign quality scores to content.\"",
          sources: [BING_AI_PERFORMANCE, BING_AI_VISIBILITY, BING_TOPICS_PORTFOLIO],
        },
        {
          id: "c-apple",
          quiz: {
            kind: "choice",
            id: "cq-apple",
            prompt: "Your robots.txt has rules for Googlebot but never mentions Applebot. What does Apple say Applebot does?",
            options: ["Follows the Googlebot rules", "Crawls everything", "Crawls nothing", "Follows only the * group"],
            answer: 0,
            explanation: "Apple says that if robots instructions don't mention Applebot but mention Googlebot, Applebot follows the Googlebot instructions.",
          },
          term: "Apple: Siri, Spotlight and Safari",
          summary: "Applebot crawls for Apple's search features; Applebot-Extended controls model training, and nosnippet controls the AI-generated world-knowledge answers in Siri and Search.",
          explanation:
            "Apple runs one crawler with two opt-outs. Applebot's data powers search in Spotlight, Siri and Safari, and Apple says \"Enabling Applebot in robots.txt allows website content to appear in search results for Apple users around the world in these products.\"\n\nApplebot-Extended is the training control: \"Web publishers can opt-out from having their content used to train generative foundation models by disallowing Applebot-Extended in the robots.txt file.\"\n\nApple also uses crawled pages in AI answers, for example \"answering broad world knowledge questions in Siri and Search that may include links to sources and websites used to help generate the answer.\" To opt out of those, Apple points to nosnippet: \"Web publishers can opt out of their content being used in these broad world knowledge answers by applying the nosnippet meta tag to specific content.\"\n\nOne rule catches people out: \"If robots instructions don't mention Applebot but mention Googlebot, the Apple robot will follow Googlebot instructions.\" Apple doesn't document how it picks sources or offer a citation report, so testing is by hand on an Apple device.",
          whyItMatters:
            "Siri and Spotlight sit on every iPhone, and their AI answers come from the same crawl as their search. Because Applebot falls back to Googlebot rules, a Googlebot block meant for one directory can quietly apply to Apple too.",
          example: {
            kind: "code",
            language: "robots",
            caption: "In Apple's search features, out of Apple's model training",
            code: "User-agent: Applebot\nAllow: /\n\nUser-agent: Applebot-Extended\nDisallow: /",
          },
          pitfall:
            "Disallowing Applebot to stop training. That removes you from Spotlight, Siri and Safari search; Applebot-Extended is the training control.",
          sources: [APPLEBOT],
        },
      ],
      check: [
        {
          kind: "choice",
          id: "q-copilot-index",
          prompt: "A page is missing from Copilot answers. Where should you look first?",
          options: [
            "Google Search Console's AI report",
            "Whether the page is indexed in Bing, using Bing Webmaster Tools",
            "The page's llms.txt entry",
            "Whether Google-Extended is allowed",
          ],
          answer: 1,
          explanation:
            "Microsoft says Copilot is powered by Bing's search index. Bing Webmaster Tools shows indexing and, since 2026, AI Performance citations. Google's tools and controls don't govern Bing.",
        },
        {
          kind: "match",
          id: "q-bots-match",
          prompt: "Match each bot to its job, as its owner describes it.",
          pairs: [
            { term: "OAI-SearchBot", definition: "Surfaces sites in ChatGPT's search features" },
            { term: "PerplexityBot", definition: "Surfaces and links sites in Perplexity search results" },
            { term: "ClaudeBot", definition: "Collects content that may be used to train Anthropic's models" },
            { term: "Perplexity-User", definition: "Visits a page when a Perplexity user asks a question" },
            { term: "Applebot-Extended", definition: "Opts content out of training Apple's foundation models" },
          ],
          explanation: "Each description follows the vendor's own crawler page.",
        },
        {
          kind: "choice",
          id: "q-bing-opportunity",
          prompt: "Which part of Bing Webmaster Tools lists queries where other sites are cited and yours isn't?",
          options: [
            "Opportunity Queries in the Topics Portfolio beta",
            "URL Inspection",
            "IndexNow",
            "The data-nosnippet report",
          ],
          answer: 0,
          explanation:
            "Topics Portfolio, added to AI Performance in October 2026, lists Opportunity Queries: top queries in a topic where other sites appear and yours does not.",
        },
        {
          kind: "spot",
          id: "q-apple-split",
          prompt: "This publisher wants to stay out of Apple's model training but stay in Siri and Spotlight search. Which line works against that?",
          language: "robots",
          lines: ["User-agent: Applebot", "Disallow: /", "", "User-agent: Applebot-Extended", "Disallow: /"],
          answer: 1,
          explanation:
            "Disallowing Applebot removes the site from Apple's search features. Only the Applebot-Extended group is needed to opt out of training.",
        },
      ],
    },
    {
      id: "g-testing",
      title: "Testing across platforms",
      concepts: [
        {
          id: "c-fair-test",
          quiz: {
            kind: "choice",
            id: "cq-fair-test",
            prompt: "Why does a fair test use a clean session rather than your everyday account?",
            options: [
              "Saved memories and search history can shape the answer",
              "Platforms block logged-in users from search",
              "Clean sessions show more citations by rule",
              "Everyday accounts can't see AI answers",
            ],
            answer: 0,
            explanation:
              "OpenAI says ChatGPT may use saved memories when rewriting a search query, and Google says AI Mode can draw on your Search history. A clean session removes that variable.",
          },
          term: "A fair platform test",
          summary: "Ask each platform the same fixed questions in a clean session, record the answer and its sources, and repeat on different days.",
          explanation:
            "A single screenshot of a single answer proves very little. A test you can repeat looks like this:\n\n1. **Fix the questions**: write them down, word for word, before you start.\n2. **Use a clean session**: logged out where the platform allows it, or a clean account with history and memory turned off.\n3. **Record everything**: the date, the platform, whether you're mentioned, which URLs are cited and in what order.\n4. **Repeat**: run the same set on several days before drawing conclusions.\n\nThe platforms confirm why step 2 matters. OpenAI says \"If memory is enabled, ChatGPT may use relevant saved memories when rewriting a search query.\" Google says Personal Intelligence in AI Mode \"references previous searches and activity saved in your Search Services History\".\n\nThey also warn against trusting one answer. OpenAI's help center says: \"Search results and citations can be incomplete, outdated, or incorrect.\" Google's AI Mode help suggests you \"Ask multiple versions of your question to get the best answers.\"",
          whyItMatters:
            "Without a fixed method, a team can find a screenshot to support any story. A repeatable test gives the same evidence to everyone, and Lesson 7 builds it into ongoing tracking.",
          example: {
            kind: "code",
            language: "text",
            caption: "Made up: three rows from Larkfield Tea's test log (invented results)",
            code: "date        platform        question                        mentioned  cited URLs, in order\n2026-11-02  ChatGPT search  best loose-leaf green tea uk    yes        reviews.example/green-tea\n2026-11-02  Perplexity      best loose-leaf green tea uk    yes        larkfieldtea.example/sencha, reviews.example/green-tea\n2026-11-02  AI Mode         best loose-leaf green tea uk    no         none from Larkfield",
          },
          pitfall:
            "Testing from your own everyday account. Your history is a variable you can remove, and your client can't reproduce it; use a clean session.",
          sources: [OPENAI_SEARCH_HELP, GOOGLE_AI_MODE_HELP],
        },
        {
          id: "c-diagnose",
          quiz: {
            kind: "match",
            id: "cq-diagnose",
            prompt: "Match each gap to the first thing to check.",
            pairs: [
              { term: "Missing from Copilot", definition: "Whether the page is indexed in Bing" },
              { term: "Missing from ChatGPT search", definition: "Whether OAI-SearchBot is disallowed" },
              { term: "Missing from Gemini answers", definition: "Whether Google-Extended is disallowed" },
              { term: "Missing from Siri answers", definition: "Applebot rules, or the Googlebot rules it falls back on" },
            ],
            explanation:
              "Each platform reaches your site through its own door, so each gap has its own first check.",
          },
          term: "Diagnosing a gap",
          summary: "When you're cited on one platform but not another, check that platform's own access, index and settings before touching the content.",
          explanation:
            "Each platform reaches your site differently, so a gap usually has a platform-specific cause:\n\n- **AI Overviews or AI Mode?** Check the page is indexed and can show a snippet (URL Inspection in Search Console), that no nosnippet or noindex is set, and that the Search generative AI control is set to include.\n- **Gemini app?** Check robots.txt for a Google-Extended block.\n- **ChatGPT search?** Check OAI-SearchBot isn't disallowed, and allow about 24 hours after a fix.\n- **Claude?** Check Claude-SearchBot and Claude-User aren't blocked.\n- **Perplexity?** Check PerplexityBot in robots.txt and in your firewall.\n- **Copilot?** Check the page is indexed in Bing.\n- **Siri or Spotlight?** Check Applebot, and any Googlebot rules it falls back on.\n\nOnly when access is clear does it make sense to look at the content itself (The Answer Quarter) or what others say about you (The Agora).",
          whyItMatters:
            "Access problems are quick to fix and block everything else. Rewriting content for a platform that can't reach the page wastes the work.",
          example: {
            kind: "before-after",
            before: "We're not showing up in ChatGPT, so let's rewrite the product pages this sprint.",
            after:
              "OAI-SearchBot is disallowed in robots.txt (line 5). We'll remove it, wait a day, rerun the 20 fixed questions on three days, and only then decide whether the copy needs work.",
            note: "A made-up team note. The second version names the platform's own door, the fix, the wait and the retest before anyone touches the content.",
          },
          pitfall:
            "Concluding that a platform \"doesn't like\" your content after one missing answer. Check access, then repeat the test, before changing the page.",
          sources: [
            GOOGLE_AI_FEATURES,
            GOOGLE_GENAI_CONTROL,
            GOOGLE_COMMON_CRAWLERS,
            OPENAI_CRAWLERS,
            ANTHROPIC_CRAWLERS,
            PERPLEXITY_CRAWLERS,
            BING_AI_ANSWERS,
            APPLEBOT,
          ],
        },
      ],
      check: [
        {
          kind: "order",
          id: "q-test-order",
          prompt: "Put the steps of a fair platform test in order.",
          items: [
            "Write down the exact questions to ask",
            "Open a clean session on each platform (logged out, or a clean account)",
            "Ask each question and record mentions and cited URLs",
            "Repeat the same set on several different days",
          ],
          explanation: "Fix the questions first, then control the session, then record, then repeat before drawing conclusions.",
        },
        {
          kind: "passage",
          id: "q-test-report",
          prompt: "Which line would you put in a report to a client?",
          passages: [
            "We asked ChatGPT once and it didn't mention us, so ChatGPT doesn't recommend our brand.",
            "Across 20 fixed questions asked on five days, ChatGPT search cited our site in 6 answers; we were blocking OAI-SearchBot until 12 October.",
          ],
          answer: 1,
          explanation:
            "The second line names the method, the result and a likely cause. The first generalizes from one answer, which OpenAI itself warns can be incomplete or incorrect. (The figures are made up.)",
        },
        {
          kind: "choice",
          id: "q-diagnose-gemini",
          prompt: "A site appears in AI Overviews but never in the Gemini app's sources. Which robots.txt group is worth checking first?",
          options: [
            "A Disallow under User-agent: Google-Extended",
            "A Disallow under User-agent: GPTBot",
            "A Disallow under User-agent: Applebot-Extended",
            "The Sitemap line",
          ],
          answer: 0,
          explanation:
            "AI Overviews follow Googlebot and Search settings, but grounding in Gemini Apps is controlled by Google-Extended. GPTBot and Applebot-Extended belong to other companies.",
        },
      ],
    },
  ],

  exercise: {
    id: "x-embassy-test",
    title: "Run an embassy test",
    brief:
      "Larkfield Tea (made up) ran a quick test and found it is cited by Perplexity for \"best loose-leaf green tea UK\" but appears in neither ChatGPT search nor AI Overviews for the same question. Work out why and design a proper test.",
    steps: [
      {
        kind: "spot",
        id: "x-step-robots",
        prompt: "Here is Larkfield's robots.txt. Which line explains the ChatGPT search gap?",
        language: "robots",
        lines: [
          "User-agent: PerplexityBot",
          "Allow: /",
          "",
          "User-agent: GPTBot",
          "User-agent: OAI-SearchBot",
          "Disallow: /",
          "",
          "User-agent: *",
          "Disallow: /basket/",
        ],
        answer: 4,
        explanation:
          "OAI-SearchBot is stacked into the GPTBot group, so it is disallowed from the whole site, and OpenAI says opted-out sites aren't shown in ChatGPT search answers. Larkfield can keep GPTBot blocked and remove that one line.",
      },
      {
        kind: "choice",
        id: "x-step-google",
        prompt: "robots.txt allows Googlebot. What should Larkfield check next for AI Overviews?",
        options: [
          "Add an llms.txt file",
          "Allow Google-Extended",
          "Use URL Inspection in Search Console to confirm the page is indexed and can show a snippet",
          "Add FAQPage markup",
        ],
        answer: 2,
        explanation:
          "Google says a page must be indexed and eligible to show with a snippet. llms.txt and special markup aren't needed, FAQ rich results are gone, and Google-Extended doesn't govern Search.",
      },
      {
        kind: "choice",
        id: "x-step-genai-control",
        prompt:
          "URL Inspection shows the page is indexed and can show a snippet, yet the Generative AI performance report shows no impressions at all for the site. What should Larkfield check next?",
        options: [
          "The Search generative AI control under Settings in Search Console",
          "Whether OAI-SearchBot is allowed",
          "Whether the site has an llms.txt file",
          "Whether Applebot is allowed",
        ],
        answer: 0,
        explanation:
          "A site must be included in Search generative AI features in Search Console to be eligible. If someone set it to exclude, the site gets no traffic or impressions from those features. OAI-SearchBot and Applebot don't govern Google.",
      },
      {
        kind: "match",
        id: "x-step-tools",
        prompt: "Match each platform to the first-party place Larkfield can check its visibility.",
        pairs: [
          { term: "Google AI Overviews and AI Mode", definition: "Search Console's Generative AI performance report" },
          { term: "Microsoft Copilot", definition: "AI Performance in Bing Webmaster Tools" },
          { term: "Perplexity", definition: "The numbered citations on each answer" },
          { term: "Gemini app", definition: "The Sources button under each reply" },
        ],
        explanation:
          "Google and Microsoft both offer reports on AI visibility. Perplexity shows numbered sources on every answer, and the Gemini app shows a Sources button when it provides links.",
      },
      {
        kind: "order",
        id: "x-step-plan",
        prompt: "Put Larkfield's next steps in order.",
        items: [
          "Fix the robots.txt line and confirm indexing and settings in Google and Bing",
          "Wait about a day for the platforms to pick up the change",
          "Run the fixed question set in clean sessions on every platform",
          "Repeat the run on several days and compare",
        ],
        explanation:
          "Fix access first, give the platforms time (OpenAI says ~24 hours for robots.txt changes), then test the same way, more than once.",
      },
    ],
    debrief:
      "Larkfield's content was never the problem: one stacked user-agent line kept it out of ChatGPT search. That is the usual shape of a platform gap. Each embassy has its own door (a bot, an index, a setting), and the cheapest wins come from checking every door is open before you change a word on the page.",
  },

  example: {
    title: "OpenAI's crawler page",
    context:
      "The \"Overview of OpenAI Crawlers\" page, fetched on 6 November 2026. The excerpt is its description of the agent that decides search inclusion and of the agent that acts for users.",
    excerpt: {
      kind: "quote",
      text: "OAI-SearchBot is for search. OAI-SearchBot is used to surface websites in search results in ChatGPT's search features. Sites that are opted out of OAI-SearchBot will not be shown in ChatGPT search answers, though can still appear as navigational links. To help ensure your site appears in search results, we recommend allowing OAI-SearchBot in your site's robots.txt file and allowing requests from our published IP ranges below. […] ChatGPT-User is not used for crawling the web in an automatic fashion. Because these actions are initiated by a user, robots.txt rules may not apply. ChatGPT-User is not used to determine whether content may appear in Search.",
    },
    points: [
      {
        label: "One bot decides inclusion",
        text: "OAI-SearchBot alone decides whether a site can be shown in ChatGPT search answers. Blocking it removes you; blocking GPTBot doesn't.",
      },
      {
        label: "Robots.txt and the firewall",
        text: "OpenAI asks for both: allow the bot in robots.txt and allow requests from its published IP ranges. A WAF rule can undo a correct robots.txt.",
      },
      {
        label: "User requests are different",
        text: "OpenAI says that for ChatGPT-User, \"robots.txt rules may not apply\", because a person started the request. It is not a search-inclusion control.",
      },
      {
        label: "Read the vendor page",
        text: "Every platform in this district publishes a page like this, and they change: Google added a Search Console opt-out in 2026, and Anthropic added an agent browser page. Date your checks and reread them when a result surprises you.",
      },
    ],
    source: OPENAI_CRAWLERS,
  },

  audit: [
    {
      kind: "choice",
      id: "a-google-extra",
      prompt: "According to Google, what extra steps are needed to appear in AI Overviews?",
      options: [
        "None beyond being indexed and eligible to show with a snippet, on a site that hasn't opted out",
        "An llms.txt file",
        "Speakable markup on every page",
        "A Google-Extended Allow rule",
      ],
      answer: 0,
      explanation:
        "Google says there are no additional requirements or special optimizations for AI Overviews or AI Mode. Sites are included by default in Search Console's generative AI setting.",
    },
    {
      kind: "choice",
      id: "a-optout-chatgpt",
      prompt: "Which change would remove a site from ChatGPT search answers?",
      options: [
        "Disallowing GPTBot",
        "Disallowing OAI-SearchBot",
        "Disallowing ChatGPT-User",
        "Disallowing Google-Extended",
      ],
      answer: 1,
      explanation:
        "OpenAI says sites opted out of OAI-SearchBot won't be shown in ChatGPT search answers. GPTBot is for training, ChatGPT-User isn't used for search inclusion, and Google-Extended is Google's.",
    },
    {
      kind: "match",
      id: "a-match-platform-tools",
      prompt: "Match each platform to the place it reports or shows AI visibility.",
      pairs: [
        { term: "Google", definition: "Generative AI performance report in Search Console" },
        { term: "Microsoft", definition: "AI Performance in Bing Webmaster Tools" },
        { term: "Perplexity", definition: "Numbered citations on every answer" },
      ],
      explanation:
        "Google and Microsoft each publish a first-party report; Perplexity shows its sources in the answer itself.",
    },
    {
      kind: "spot",
      id: "a-spot-perplexity",
      prompt: "A site wants to appear in Perplexity. Which line works against that?",
      language: "robots",
      lines: ["User-agent: GPTBot", "Disallow: /", "", "User-agent: PerplexityBot", "Disallow: /", "", "User-agent: *", "Allow: /"],
      answer: 4,
      explanation:
        "PerplexityBot surfaces and links sites in Perplexity results, and this group disallows it everywhere. Blocking GPTBot doesn't affect Perplexity.",
    },
    {
      kind: "blank",
      id: "a-blank-copilot",
      prompt: "Complete Microsoft's description.",
      text: "Powered by ___'s search index, experiences like Microsoft Copilot, Microsoft Start, and others handle billions of queries each month.",
      answers: ["Bing"],
      distractors: ["Google", "Perplexity", "OpenAI"],
      explanation: "Copilot is grounded in Bing's index, so Bing indexing is a prerequisite for Copilot citations.",
    },
    {
      kind: "choice",
      id: "a-claude-split",
      prompt: "A brand wants to appear in Claude's answers but keep its content out of Anthropic's training. Which bot should it block?",
      options: ["Claude-User", "Claude-SearchBot", "ClaudeBot", "All three"],
      answer: 2,
      explanation:
        "Anthropic says restricting ClaudeBot excludes future materials from training datasets. Claude-SearchBot and Claude-User support search and user requests.",
    },
    {
      kind: "passage",
      id: "a-passage-method",
      prompt: "Which testing note is more trustworthy?",
      passages: [
        "Tested 15 fixed prompts in logged-out sessions on 3 dates; cited URLs logged in a shared sheet.",
        "Asked Perplexity from my work account last week; looked good.",
      ],
      answer: 0,
      explanation:
        "The first note can be repeated and checked: fixed prompts, a clean session, several dates and recorded URLs. The second can't.",
    },
    {
      kind: "order",
      id: "a-order-diagnose",
      prompt: "You're missing from one platform's answers. Put the checks in a sensible order.",
      items: [
        "Check that platform's bot can reach the page and the page is in its index",
        "Rerun the fixed test on several days",
        "Only then review the content itself",
      ],
      explanation:
        "Work from the door inwards: access and indexing, then confirm with repeated tests, and only then change the content.",
    },
    {
      kind: "choice",
      id: "a-google-controls",
      prompt: "Which control removes a site from AI Overviews and AI Mode without changing its ordinary search snippets?",
      options: [
        "Disallowing Google-Extended",
        "The Search generative AI control in Search Console",
        "Blocking OAI-SearchBot",
        "Removing the sitemap",
      ],
      answer: 1,
      explanation:
        "Since 2026 Search Console has a Search generative AI control covering AI Overviews, AI Mode and Discover's AI features. Snippet controls also work but change ordinary results, and Google-Extended doesn't affect Search.",
    },
    {
      kind: "choice",
      id: "a-single-answer",
      prompt: "Why shouldn't you judge a platform on one answer?",
      options: [
        "Platforms charge for repeat questions",
        "Answers and citations can vary and can be incomplete or incorrect, so one answer isn't a fair sample",
        "Platforms only cite a site after it has been asked about ten times",
        "One answer is enough if it is a screenshot",
      ],
      answer: 1,
      explanation:
        "OpenAI's help center says search results and citations can be incomplete, outdated or incorrect. Fixed questions, clean sessions and repeated runs give a fair picture.",
    },
    {
      kind: "choice",
      id: "a-apple-training",
      prompt: "A publisher wants to stay in Siri and Spotlight but keep its content out of Apple's model training. What should it do?",
      options: [
        "Disallow Applebot-Extended",
        "Disallow Applebot",
        "Disallow Googlebot",
        "Add a nosnippet tag to every page",
      ],
      answer: 0,
      explanation:
        "Apple says disallowing Applebot-Extended opts content out of training. Blocking Applebot removes it from Apple's search, and nosnippet controls AI answers and descriptions, not training.",
    },
    {
      kind: "choice",
      id: "a-agent-verify",
      prompt: "Your logs show a visitor whose user agent contains Google-Agent. Before allowing it past your bot rules, what should you check?",
      options: [
        "That the request comes from Google's published IP ranges for user-triggered agents",
        "That it fetched robots.txt first",
        "That it fetched llms.txt",
        "Nothing: the token proves it is Google",
      ],
      answer: 0,
      explanation:
        "User-agent strings can be spoofed. Google publishes IP ranges for its user-triggered agents, and Anthropic gives the same advice for Claude-Agent.",
    },
  ],
};

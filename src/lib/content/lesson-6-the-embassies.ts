// Lesson 6, The Embassies: platform playbooks.
// Each platform section uses only what that platform documents about itself
// (or a dated, named announcement), checked on the `accessed` date. Bot names
// agree with Lesson 2. Larkfield Tea is the made-up shop from Lesson 4, and its
// test results are invented for the exercises.

import type { LessonContent, Source } from "../lesson-types";

const ACCESSED = "2026-10-30";

const GOOGLE_AI_FEATURES: Source = {
  title: "AI features and your website",
  publisher: "Google Search Central",
  url: "https://developers.google.com/search/docs/appearance/ai-features",
  date: "2025-12-10",
  dateKind: "updated",
  accessed: ACCESSED,
};

const GOOGLE_AI_GUIDE: Source = {
  title: "Optimizing your website for generative AI features on Google Search",
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

const ANTHROPIC_CRAWLERS: Source = {
  title: "Does Anthropic crawl data from the web, and how can site owners block the crawler?",
  publisher: "Claude Help Center",
  url: "https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler",
  date: "2026-04-07",
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

const BING_AI_PERFORMANCE: Source = {
  title: "Introducing AI Performance in Bing Webmaster Tools Public Preview",
  publisher: "Bing Webmaster Blog",
  url: "https://blogs.bing.com/webmaster/2026/2/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview/",
  date: "2026-02-10",
  dateKind: "published",
  accessed: ACCESSED,
};

export const LESSON_6: LessonContent = {
  intro:
    "You have reached The Embassies, the sixth district of the City of Answers. Each AI search platform keeps an embassy here, and each publishes its own rules: which bot to let in, what it shows, how it credits sources. In this district you visit them one at a time, using only what each platform documents about itself, and finish with a fair way to test your pages on all of them.",

  outro:
    "You leave The Embassies knowing what Google, OpenAI, Anthropic, Perplexity and Microsoft each document about how their AI search finds and credits sources, which bot or setting controls each, and how to run a test that is fair to all of them. Next stop is The Observatory, where you turn those tests into ongoing measurement.",

  groups: [
    {
      id: "g-google",
      title: "Google: AI Overviews and AI Mode",
      concepts: [
        {
          id: "c-google-eligibility",
          term: "Eligibility for Google's AI features",
          summary: "A page that can appear in Google Search with a snippet can appear in AI Overviews and AI Mode; there are no extra requirements.",
          explanation:
            "Google's page on AI features is direct: \"There are no additional requirements to appear in AI Overviews or AI Mode, nor other special optimizations necessary.\"\n\nThe technical bar is the ordinary one: \"To be eligible to be shown as a supporting link in AI Overviews or AI Mode, a page must be indexed and eligible to be shown in Google Search with a snippet\". And: \"You don't need to create new machine readable files, AI text files, or markup to appear in these features.\"\n\nGoogle's 2026 guide to its generative AI features goes further and says that, from its perspective, optimizing for them \"is optimizing for the search experience, and thus still SEO.\"",
          whyItMatters:
            "For Google, AEO work is SEO work done well: indexable pages, a usable snippet, helpful content. Anyone selling a Google-specific AI trick is selling something Google says doesn't exist.",
          pitfall:
            "Assuming eligibility means appearance. Google adds that meeting every requirement \"doesn't mean that Google will crawl, index, or serve its content.\"",
          sources: [GOOGLE_AI_FEATURES, GOOGLE_AI_GUIDE],
        },
        {
          id: "c-google-controls",
          term: "Controls for Google's AI features",
          summary: "Googlebot rules and snippet controls govern AI Overviews and AI Mode; Google-Extended covers Google's other AI systems, not Search.",
          explanation:
            "Google says AI is \"built into Search and integral to how Search functions, which is why robots.txt directives for Googlebot is the control for site owners to manage access to how their sites are crawled for Search.\"\n\nTo limit what is shown from a page, it points to the snippet controls: \"use nosnippet, data-nosnippet, max-snippet, or noindex controls.\" These affect your ordinary results as well as AI features.\n\nGoogle-Extended is separate. Google describes it as the way \"To limit AI training and grounding in some of Google's other systems\". As Lesson 2 covered, it doesn't take you out of Search.",
          whyItMatters:
            "There is no switch that keeps you in Google Search but out of AI Overviews. Knowing which control does what stops a team from blocking the wrong thing.",
          pitfall:
            "Disallowing Google-Extended to keep a site out of AI Overviews. It doesn't do that; nosnippet or noindex would, and they also change your ordinary Search results.",
          sources: [GOOGLE_AI_FEATURES],
        },
        {
          id: "c-google-measure",
          term: "Google's AI feature reporting",
          summary: "Search Console counts AI Overviews and AI Mode in the Web search type, and a Generative AI performance report shows impressions in those features.",
          explanation:
            "Google says sites appearing in AI features \"are included in the overall search traffic in Search Console\", reported \"within the \"Web\" search type\".\n\nSearch Console also has a Generative AI performance report. Google's help page says it \"shows data about how your site performs in generative AI features on Google Search\" and includes impressions for AI Overviews and AI Mode, with views by page, device and country.",
          whyItMatters:
            "This is first-party data from the platform itself, which no third-party tracker can match for Google. Check it before you build anything else.",
          pitfall:
            "Reading impressions as clicks. The report counts how many times links to your site were shown in a generative AI feature; it is a visibility measure.",
          sources: [GOOGLE_AI_FEATURES, GOOGLE_GENAI_REPORT],
        },
      ],
      check: [
        {
          kind: "choice",
          id: "q-google-require",
          prompt: "What does a page need to be eligible as a supporting link in AI Overviews or AI Mode?",
          options: [
            "An llms.txt file and FAQPage markup",
            "To be indexed and eligible to show in Google Search with a snippet",
            "A Google-Extended Allow rule in robots.txt",
            "A separate submission to Google's AI team",
          ],
          answer: 1,
          explanation:
            "Google says a page must be indexed and eligible to be shown in Search with a snippet, and that there are no additional technical requirements, AI files or special markup.",
        },
        {
          kind: "match",
          id: "q-google-controls",
          prompt: "Match each Google control to what it does.",
          pairs: [
            { term: "Googlebot rules in robots.txt", definition: "Control crawling for Search, AI features included" },
            { term: "nosnippet / max-snippet", definition: "Limit what is shown from a page in Search" },
            { term: "Google-Extended", definition: "Limit AI training and grounding in some of Google's other systems" },
            { term: "Generative AI performance report", definition: "Show impressions in AI Overviews and AI Mode" },
          ],
          explanation:
            "These follow Google's AI features page and the Search Console help page for the report.",
        },
      ],
    },
    {
      id: "g-chatgpt-claude",
      title: "ChatGPT and Claude",
      concepts: [
        {
          id: "c-chatgpt",
          term: "ChatGPT search",
          summary: "ChatGPT search answers are built from sites OAI-SearchBot may crawl; GPTBot (training) and ChatGPT-User (user requests) are separate.",
          explanation:
            "OpenAI says: \"OAI-SearchBot is used to surface websites in search results in ChatGPT's search features. Sites that are opted out of OAI-SearchBot will not be shown in ChatGPT search answers, though can still appear as navigational links.\"\n\nThe three agents are independent: \"Each setting is independent of the others\", so you can allow OAI-SearchBot while disallowing GPTBot, which OpenAI uses to crawl content \"that may be used in training our generative AI foundation models.\" ChatGPT-User fetches pages when a user asks, and \"ChatGPT-User is not used to determine whether content may appear in Search.\"\n\nAfter a robots.txt change, OpenAI notes \"it can take ~24 hours from a site's robots.txt update for our systems to adjust.\"",
          whyItMatters:
            "OAI-SearchBot is the one switch that decides whether ChatGPT search can cite you. It is easy to block it by accident while trying to block training, as this lesson's exercise shows.",
          pitfall:
            "Blocking ChatGPT-User to keep out of search. OpenAI says it isn't used for search inclusion; OAI-SearchBot is the control for that.",
          sources: [OPENAI_CRAWLERS, OPENAI_SEARCH_HELP],
        },
        {
          id: "c-claude",
          term: "Claude",
          summary: "Anthropic runs three bots: ClaudeBot for training, Claude-SearchBot for search quality, and Claude-User for pages fetched when a user asks.",
          explanation:
            "Anthropic's help center describes each:\n\n- **ClaudeBot**: \"When a site restricts ClaudeBot access, it signals that the site's future materials should be excluded from our AI model training datasets.\"\n- **Claude-SearchBot**: \"navigates the web to improve search result quality for users.\"\n- **Claude-User**: \"Disabling Claude-User on your site prevents our system from retrieving your content in response to a user query, which may reduce your site's visibility for user-directed web search.\"",
          whyItMatters:
            "As with OpenAI, training and search are separate decisions. A brand that wants to be found in Claude's answers but not used for training blocks ClaudeBot and leaves the other two alone.",
          pitfall:
            "Copying an old block list that names only \"anthropic-ai\", which isn't one of the three bots on Anthropic's current page. Check names against the vendor's page, as Lesson 2's Guardian example showed.",
          sources: [ANTHROPIC_CRAWLERS],
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
      ],
    },
    {
      id: "g-perplexity-copilot",
      title: "Perplexity and Copilot",
      concepts: [
        {
          id: "c-perplexity",
          term: "Perplexity",
          summary: "Perplexity answers with numbered citations; PerplexityBot decides whether your site can appear, and Perplexity-User fetches pages for users.",
          explanation:
            "Perplexity's help center says \"Each answer includes numbered citations linking to the original sources\".\n\nIts crawler docs describe two agents. \"PerplexityBot is designed to surface and link websites in search results on Perplexity. It is not used to crawl content for AI foundation models.\" Perplexity recommends \"allowing PerplexityBot in your site's robots.txt file and permitting requests from our published IP ranges\". Perplexity-User \"supports user actions within Perplexity\" and \"is not used for web crawling or to collect content for training AI foundation models.\"",
          whyItMatters:
            "Perplexity shows its sources by number on every answer, so it is the easiest platform to check by hand: ask, then read the citations.",
          pitfall:
            "Allowing PerplexityBot in robots.txt while a CDN or firewall blocks its IP ranges (Lesson 2's bouncer at the door). Perplexity asks for both.",
          sources: [PERPLEXITY_HOW, PERPLEXITY_CRAWLERS],
        },
        {
          id: "c-copilot",
          term: "Microsoft Copilot",
          summary: "Copilot's answers are grounded in Bing's index, so Bing indexing, Bing Webmaster Tools and IndexNow are the levers.",
          explanation:
            "Microsoft says: \"Powered by Bing's search index, experiences like Microsoft Copilot, Microsoft Start, and others handle billions of queries each month\". Copilot Search in Bing, launched in April 2025, \"cites its sources prominently\".\n\nIn February 2026 Bing Webmaster Tools added AI Performance, which \"shows how publisher content appears across Microsoft Copilot, AI-generated summaries in Bing, and select partner integrations\", with total citations, cited pages and the grounding queries behind them.\n\nThe same announcement recommends IndexNow: it \"helps keep information fresh across search and AI experiences by notifying participating search engines whenever content is added, updated, or removed.\"",
          whyItMatters:
            "If your pages aren't in Bing's index, Copilot can't ground an answer in them. If you only check Google Search Console, you miss the one report that shows Copilot citations directly.",
          pitfall:
            "Treating Bing as an afterthought. Copilot draws on Bing's index, so Bing indexing matters for Copilot answers whatever your Bing search traffic looks like.",
          sources: [BING_AI_ANSWERS, BING_COPILOT_SEARCH, BING_AI_PERFORMANCE],
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
          ],
          explanation: "Each description follows the vendor's own crawler page.",
        },
      ],
    },
    {
      id: "g-testing",
      title: "Testing across platforms",
      concepts: [
        {
          id: "c-fair-test",
          term: "A fair platform test",
          summary: "Ask each platform the same fixed questions in a fresh session, record the answer and its sources, and repeat on different days.",
          explanation:
            "A single screenshot of a single answer proves very little. A test you can repeat looks like this:\n\n1. **Fix the questions**: write them down, word for word, before you start.\n2. **Use a fresh session**: logged out or in a clean profile, so past chats don't shape the answer.\n3. **Record everything**: the date, the platform, whether you're mentioned, which URLs are cited and in what order.\n4. **Repeat**: run the same set on several days before drawing conclusions.\n\nThe platforms themselves warn against trusting one answer. OpenAI's help center says: \"Search results and citations can be incomplete, outdated, or incorrect.\"",
          whyItMatters:
            "Without a fixed method, a team can find a screenshot to support any story. A repeatable test gives the same evidence to everyone, and Lesson 7 builds it into ongoing tracking.",
          pitfall:
            "Testing from your own everyday account. Your history is a variable you can remove, and your client can't reproduce it; use a clean session.",
          sources: [OPENAI_SEARCH_HELP],
        },
        {
          id: "c-diagnose",
          term: "Diagnosing a gap",
          summary: "When you're cited on one platform but not another, check that platform's own access and index first.",
          explanation:
            "Each platform reaches your site differently, so a gap usually has a platform-specific cause:\n\n- **Missing from AI Overviews?** Check the page is indexed and can show a snippet (Search Console's URL Inspection), and that no nosnippet or noindex is set.\n- **Missing from ChatGPT search?** Check OAI-SearchBot isn't disallowed, and allow ~24 hours after a fix.\n- **Missing from Perplexity?** Check PerplexityBot in robots.txt and in your firewall.\n- **Missing from Copilot?** Check the page is indexed in Bing.\n\nOnly when access is clear does it make sense to look at the content itself (The Answer Quarter) or what others say about you (The Agora).",
          whyItMatters:
            "Access problems are quick to fix and block everything else. Rewriting content for a platform that can't reach the page wastes the work.",
          pitfall:
            "Concluding that a platform \"doesn't like\" your content after one missing answer. Check access, then repeat the test, before changing the page.",
          sources: [GOOGLE_AI_FEATURES, OPENAI_CRAWLERS, PERPLEXITY_CRAWLERS, BING_AI_ANSWERS],
        },
      ],
      check: [
        {
          kind: "order",
          id: "q-test-order",
          prompt: "Put the steps of a fair platform test in order.",
          items: [
            "Write down the exact questions to ask",
            "Open a fresh, logged-out session on each platform",
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
          "Google says a page must be indexed and eligible to show with a snippet, with no other requirements. llms.txt and special markup aren't needed, FAQ rich results are gone, and Google-Extended doesn't govern Search.",
      },
      {
        kind: "match",
        id: "x-step-tools",
        prompt: "Match each platform to the first-party place Larkfield can check its visibility.",
        pairs: [
          { term: "Google AI Overviews and AI Mode", definition: "Search Console's Generative AI performance report" },
          { term: "Microsoft Copilot", definition: "AI Performance in Bing Webmaster Tools" },
          { term: "Perplexity", definition: "The numbered citations on each answer" },
        ],
        explanation:
          "Google and Microsoft both offer reports on AI visibility; Perplexity shows its numbered sources on every answer.",
      },
      {
        kind: "order",
        id: "x-step-plan",
        prompt: "Put Larkfield's next steps in order.",
        items: [
          "Fix the robots.txt line and confirm indexing in Google and Bing",
          "Wait about a day for the platforms to pick up the change",
          "Run the fixed question set in fresh sessions on every platform",
          "Repeat the run on several days and compare",
        ],
        explanation:
          "Fix access first, give the platforms time (OpenAI says ~24 hours for robots.txt changes), then test the same way, more than once.",
      },
    ],
    debrief:
      "Larkfield's content was never the problem: one stacked user-agent line kept it out of ChatGPT search. That is the usual shape of a platform gap. Each embassy has its own door, and the cheapest wins come from checking every door is open before you change a word on the page.",
  },

  example: {
    title: "OpenAI's crawler page",
    context:
      "The \"Overview of OpenAI Crawlers\" page, fetched on 30 October 2026. The excerpt is its description of the agent that decides search inclusion and of the agent that acts for users.",
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
        text: "Every platform in this district publishes a page like this. They change, so date your checks and reread them when a result surprises you.",
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
        "None beyond being indexed and eligible to show with a snippet",
        "An llms.txt file",
        "Speakable markup on every page",
        "A Google-Extended Allow rule",
      ],
      answer: 0,
      explanation: "Google says there are no additional requirements or special optimizations for AI Overviews or AI Mode.",
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
        "Check robots.txt and your firewall let that platform's bot in",
        "Check the page is in that platform's index",
        "Rerun the fixed test on several days",
        "Only then review the content itself",
      ],
      explanation:
        "Work from the door inwards: access, then the index, then confirm with repeated tests, and only then change the content.",
    },
    {
      kind: "choice",
      id: "a-google-controls",
      prompt: "Which control limits what Google shows from a page in AI Overviews?",
      options: ["Disallowing Google-Extended", "nosnippet or max-snippet", "Blocking OAI-SearchBot", "Removing the sitemap"],
      answer: 1,
      explanation:
        "Google points to nosnippet, data-nosnippet, max-snippet and noindex for limiting what is shown in Search, AI features included. Google-Extended covers some of Google's other AI systems.",
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
  ],
};

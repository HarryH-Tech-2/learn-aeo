// Lesson 7, The Observatory: measuring AI visibility.
// Claims about Google Analytics, Search Console, Bing Webmaster Tools, HTTP and
// crawler verification are tied to sources checked on the `accessed` date.
// Mention rate, citation rate and share of voice are this course's own
// definitions, given as formulas, not industry benchmarks. The regexes are
// checked as GA4 applies them, as full matches (lesson-7-ga4-regex.test.ts). Larkfield Tea is the made-up shop from Lesson 4; its prompts,
// results and log lines are invented, and its IP addresses come from the
// documentation ranges (RFC 5737).

import type { LessonContent, Source } from "../lesson-types";

const ACCESSED = "2026-10-30";

const GSC_PERFORMANCE: Source = {
  title: "Performance report (Search results): Overview and basic setup",
  publisher: "Search Console Help",
  url: "https://support.google.com/webmasters/answer/7576553",
  accessed: ACCESSED,
};

const GSC_COUNTING: Source = {
  title: "What are impressions, position, and clicks?",
  publisher: "Search Console Help",
  url: "https://support.google.com/webmasters/answer/7042828",
  accessed: ACCESSED,
};

const GOOGLE_GENAI_REPORT: Source = {
  title: "Generative AI performance report (Search)",
  publisher: "Search Console Help",
  url: "https://support.google.com/webmasters/answer/16984139",
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

const BING_AI_PERFORMANCE: Source = {
  title: "Introducing AI Performance in Bing Webmaster Tools Public Preview",
  publisher: "Bing Webmaster Blog",
  url: "https://blogs.bing.com/webmaster/2026/2/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview/",
  date: "2026-02-10",
  dateKind: "published",
  accessed: ACCESSED,
};

const BING_AI_INSIGHTS: Source = {
  title: "New AI Visibility Insights in Bing Webmaster Tools: Intents, Topics, Citation Share, Compare",
  publisher: "Microsoft Bing Blog",
  url: "https://blogs.bing.com/search/2026/6/New-AI-Visibility-Insights-in-Bing-Webmaster-Tools-Intents-Topics-Citation-Share-Compare/",
  date: "2026-06-16",
  dateKind: "published",
  accessed: ACCESSED,
};

const GA4_DEFAULT_CHANNELS: Source = {
  title: "Default channel group",
  publisher: "Google Analytics Help",
  url: "https://support.google.com/analytics/answer/9756891",
  accessed: ACCESSED,
};

const GA4_CUSTOM_CHANNELS: Source = {
  title: "Custom channel groups",
  publisher: "Google Analytics Help",
  url: "https://support.google.com/analytics/answer/13051316",
  accessed: ACCESSED,
};

const GA4_REGEX: Source = {
  title: "About regular expressions (regex)",
  publisher: "Google Analytics Help",
  url: "https://support.google.com/analytics/answer/1034324",
  accessed: ACCESSED,
};

const MDN_REFERRER_POLICY: Source = {
  title: "Referrer-Policy header",
  publisher: "MDN Web Docs",
  url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Referrer-Policy",
  date: "2026-09-04",
  dateKind: "updated",
  accessed: ACCESSED,
};

const OPENAI_SEARCH_HELP: Source = {
  title: "Searching the web with ChatGPT",
  publisher: "OpenAI Help Center",
  url: "https://help.openai.com/en/articles/9237897-searching-the-web-with-chatgpt",
  accessed: ACCESSED,
};

const OPENAI_CRAWLERS: Source = {
  title: "Overview of OpenAI Crawlers",
  publisher: "OpenAI",
  url: "https://developers.openai.com/api/docs/bots",
  accessed: ACCESSED,
};

const PERPLEXITY_CRAWLERS: Source = {
  title: "Perplexity Crawlers",
  publisher: "Perplexity",
  url: "https://docs.perplexity.ai/docs/resources/perplexity-crawlers",
  accessed: ACCESSED,
};

const GOOGLE_VERIFY: Source = {
  title: "Verify requests from Google crawlers and fetchers",
  publisher: "Google Crawling Infrastructure",
  url: "https://developers.google.com/crawling/docs/crawlers-fetchers/verify-google-requests",
  date: "2026-03-20",
  dateKind: "updated",
  accessed: ACCESSED,
};

export const LESSON_7: LessonContent = {
  intro:
    "You have reached The Observatory, the seventh district of the City of Answers. From up here you can watch the whole city: which questions get asked, whose names come up in the answers, and who walks through your door afterwards. In this district you build the instruments: a prompt set, a few honest metrics, the right reports in Analytics, Search Console and Bing, and a look at your own server logs.",

  outro:
    "You leave The Observatory with a prompt set you can rerun, metrics you can define in one line, AI traffic separated out in Google Analytics, first-party reports from Google and Bing, and a way to check which bots really visit. Next stop is The Citadel, the last district, where you turn everything into a program the business will back.",

  groups: [
    {
      id: "g-prompt-sets",
      title: "Prompt sets",
      concepts: [
        {
          id: "c-prompt-set",
          term: "Prompt set",
          summary: "A prompt set is a fixed list of real customer questions you ask AI tools on a schedule, so results can be compared over time.",
          explanation:
            "You can't measure \"AI visibility\" in general, only your visibility for particular questions. A prompt set fixes those questions. Good sources for them:\n\n- **Search Console**: its Performance report shows \"what search queries are most likely to show your site\".\n- **Bing Webmaster Tools**: its AI Performance report shows grounding queries, \"the key phrases the AI used when retrieving content that was referenced in AI-generated answers.\"\n- **Your own customers**: questions from sales calls, support tickets and reviews, in their words.\n\nWrite each prompt down exactly, and keep the set stable. Change it deliberately and note the date, or month-to-month comparisons stop meaning anything.",
          whyItMatters:
            "The prompt set is the ruler for everything else in this lesson. If the ruler changes every month, the measurements can't be compared.",
          pitfall:
            "Filling the set with questions that contain your brand name. Of course you appear in \"Is Larkfield Tea good?\"; the questions that matter are the ones where a buyer hasn't chosen yet.",
          sources: [GSC_PERFORMANCE, BING_AI_PERFORMANCE],
        },
        {
          id: "c-prompt-variants",
          term: "Coverage and variants",
          summary: "Cover the whole buying journey, branded and unbranded, with a few phrasings of each question.",
          explanation:
            "AI tools don't answer only the exact words typed. Google describes query fan-out as \"A set of concurrent, related queries generated by the model to request more information and fetch additional relevant search results to address the user's query.\" So a useful set includes:\n\n- **Unbranded questions** at each stage: learning (*how do you brew loose-leaf tea*), comparing (*best loose-leaf tea shops UK*), deciding (*loose-leaf tea subscription with free delivery*).\n- **Branded questions**: what people ask once they know your name (*Larkfield Tea delivery times*), to check the answers are accurate.\n- **Competitor comparisons**: *Larkfield Tea vs* the shops you lose to.\n- **Two or three phrasings** of your most important questions, the way different customers would ask them.",
          whyItMatters:
            "A set built only from one stage, or one phrasing, can miss where you are absent. Spread is what turns a handful of checks into a picture.",
          pitfall:
            "Making the set so large nobody reruns it. Start with a set you can actually run every month, then grow it.",
          sources: [GOOGLE_AI_GUIDE],
        },
      ],
      check: [
        {
          kind: "choice",
          id: "q-prompts-best",
          prompt: "Which prompt is most useful in Larkfield Tea's set for tracking new customers?",
          options: [
            "Is Larkfield Tea any good?",
            "Where can I buy good loose-leaf green tea online in the UK?",
            "Larkfield Tea login",
            "Tell me a joke about tea",
          ],
          answer: 1,
          explanation:
            "An unbranded buying question shows whether Larkfield is recommended to people who haven't chosen yet. Branded questions check accuracy, and navigational or off-topic prompts say little about visibility.",
        },
        {
          kind: "order",
          id: "q-prompts-journey",
          prompt: "Order these prompts from earliest to latest in a buyer's journey.",
          items: [
            "What's the difference between green and black tea?",
            "Best loose-leaf tea shops in the UK",
            "Larkfield Tea vs Harbourside Teas",
          ],
          explanation:
            "Learning about the category, then looking for shops, then comparing two named shops. (Harbourside Teas is made up too.)",
        },
      ],
    },
    {
      id: "g-share-of-voice",
      title: "Share of voice and citations",
      concepts: [
        {
          id: "c-visibility-metrics",
          term: "Mention rate, citation rate and share of voice",
          summary: "Three simple ratios, calculated over your prompt set, track how often you're named, how often you're cited, and your share of all brand mentions.",
          explanation:
            "This course uses three definitions. Run the whole prompt set, then:\n\n- **Mention rate** = answers that name your brand ÷ answers checked.\n- **Citation rate** = answers that link to your site as a source ÷ answers checked.\n- **Share of voice** = your brand mentions ÷ mentions of all the brands you track, across the same answers.\n\nRecord which URL is cited each time, too. Bing defines a related metric for its own data: Citation Share \"is calculated as the percentage of citations attributed to your site out of all citations shown across all sites for that same grounding query.\"",
          whyItMatters:
            "Simple ratios are easy to explain and hard to argue with. Anyone can check them against the logged answers.",
          example: {
            kind: "before-after",
            before: "\"We're doing great in AI. ChatGPT mentioned us loads this month.\"",
            after: "\"Across 30 fixed prompts on 4 dates (120 answers), we were named in 42 (mention rate 35%) and cited in 18 (citation rate 15%). Our share of voice against three tracked rivals was 28%.\"",
            note: "The figures are made up. The second version can be checked against the logged answers, and repeated next month.",
          },
          pitfall:
            "Comparing numbers from different prompt sets, platforms or session setups as if they were the same measurement. Keep the method fixed.",
          sources: [BING_AI_INSIGHTS],
        },
        {
          id: "c-first-party-reports",
          term: "First-party AI reports",
          summary: "Google and Bing now report your visibility in their own AI features: impressions from Google, citations from Bing.",
          explanation:
            "Two platforms report directly:\n\n- **Google Search Console** includes AI Overviews and AI Mode in the Performance report, and has a Generative AI performance report that \"shows data about how your site performs in generative AI features on Google Search\". For AI Overviews, \"Clicking a link to an external page in the AI Overview counts as a click\", and \"An AI Overview occupies a single position in search results, and all links in the AI Overview are assigned that same position.\"\n- **Bing Webmaster Tools** AI Performance shows total citations, cited pages and grounding queries across Copilot and Bing's AI summaries. Bing adds that Citation Share \"is designed as an observational metric\" and \"does not expose competitor domains, represent traffic share, or assign quality scores to content.\"",
          whyItMatters:
            "These are the only numbers that come from inside the platforms. Use them to check your own prompt-set results, and report them alongside.",
          pitfall:
            "Treating Bing's Citation Share as a ranking. Bing says it is \"not a ranking system or a competitive scoreboard.\"",
          sources: [GOOGLE_GENAI_REPORT, GSC_COUNTING, BING_AI_PERFORMANCE, BING_AI_INSIGHTS],
        },
      ],
      check: [
        {
          kind: "blank",
          id: "q-sov-formula",
          prompt: "Complete the course's definition.",
          text: "Citation rate = answers that ___ to your site as a source ÷ answers ___.",
          answers: ["link", "checked"],
          distractors: ["mention", "clicked", "ranked"],
          explanation:
            "A citation is a link to your page as a source; a mention only names you. The denominator is every answer you checked in the prompt set.",
        },
        {
          kind: "choice",
          id: "q-sov-aio-position",
          prompt: "Your page is the third link inside an AI Overview that sits at the top of the results. What position does Search Console record?",
          options: [
            "Position 3, its place in the list of links",
            "The single position the AI Overview occupies, shared by all its links",
            "No position: AI Overviews aren't counted",
            "Position 0",
          ],
          answer: 1,
          explanation:
            "Google says an AI Overview occupies a single position in search results and all its links are assigned that same position.",
        },
      ],
    },
    {
      id: "g-ga4",
      title: "AI referral traffic in Google Analytics",
      concepts: [
        {
          id: "c-ai-assistant-channel",
          term: "The AI Assistant channel",
          summary: "Google Analytics' default channel group has an AI Assistant channel for visits from tools like ChatGPT, Gemini and Copilot; AI Overviews and AI Mode count as Organic Search.",
          explanation:
            "Google Analytics now separates AI assistant traffic by default. Its help page says: \"AI Assistant is the channel by which users arrive at your site from sources like ChatGPT, Gemini, Deepseek, Copilot, or Grok. It excludes Google's AI Overviews and AI Mode.\"\n\nThose two are counted elsewhere: Organic Search includes visits \"via non-ad links in organic-search results, including Google's AI Overviews and AI Mode.\" The rule behind the channel: \"The medium is set to \"ai-assistant\" and the campaign is set to \"(ai-assistant)\" if the referrer matches a list of AI Assistants.\"\n\nFind it in the Traffic acquisition report with the default channel group.",
          whyItMatters:
            "This is the quickest honest answer to \"how many visits does AI send us?\" for the assistants Google recognizes, with no setup.",
          pitfall:
            "Adding AI Assistant traffic and Google's AI Overviews traffic together from GA4. GA4 can't separate AI Overviews clicks from other organic clicks; use Search Console for those.",
          sources: [GA4_DEFAULT_CHANNELS],
        },
        {
          id: "c-custom-channel",
          term: "A custom AI channel",
          summary: "A custom channel group with a tight regex lets you choose exactly which assistants count, but the regex has to be precise.",
          explanation:
            "If you want your own definition, Google Analytics lets you build a custom channel group: add a channel, choose \"matches regex\", list the assistants, and then \"reorder your channel list so that\" the AI channel appears above Referrals.\n\nBe careful with broad patterns. Google Analytics applies a regex to the whole value: \"By default, Google Analytics Regex is full regex and case sensitive.\" Google's own example starts with `^.*ai|`, so it accepts any source that ends in \"ai\": every .ai domain, whether or not it is an AI assistant. Its `.*gpt.*` alternative accepts any source containing \"gpt\". A tighter pattern names the domains:\n\n`^(.*\\.)?(chatgpt\\.com|perplexity\\.ai|copilot\\.microsoft\\.com|gemini\\.google\\.com|claude\\.ai)$`\n\nCheck the exact source values in your own Traffic acquisition report before you finalize the list, and update it when assistants change. Google notes: \"You should update your regex expression if URLs or the list of assistants you wish to measure change.\"",
          whyItMatters:
            "A loose regex quietly pulls other referrals into your AI numbers, such as any software company on a .ai domain that links to you, and those inflated numbers then go into reports.",
          pitfall:
            "Leaving the new channel below Referrals. Google says to reorder it above, or the visits are claimed by Referrals first.",
          sources: [GA4_CUSTOM_CHANNELS, GA4_REGEX, OPENAI_SEARCH_HELP],
        },
        {
          id: "c-missing-referrer",
          term: "Visits without a referrer",
          summary: "Analytics can only credit an AI tool when the visit carries a referrer; when it doesn't, the visit lands in Direct.",
          explanation:
            "Channel rules work from the referrer the browser sends. MDN explains that a page can set `Referrer-Policy: no-referrer`, in which case \"The Referer header will be omitted: sent requests do not include any referrer information.\" A visit like that has no source for Analytics to match, so it is counted as Direct.\n\nAnd someone who reads your name in an answer and comes back days later through a search or a bookmark arrives through that route, not through the assistant.",
          whyItMatters:
            "Your AI Assistant numbers are a floor, not a total. Say so in reports, and look at branded search and direct visits alongside them.",
          pitfall:
            "Presenting AI referral visits as everything AI did for the business. Some influence never shows up as a referred visit at all.",
          sources: [MDN_REFERRER_POLICY],
        },
      ],
      check: [
        {
          kind: "choice",
          id: "q-ga4-aio",
          prompt: "In Google Analytics' default channel group, where does a click from a Google AI Overview land?",
          options: ["AI Assistant", "Organic Search", "Referral", "Direct"],
          answer: 1,
          explanation:
            "Google's help page says the AI Assistant channel excludes AI Overviews and AI Mode, and Organic Search includes them.",
        },
        {
          kind: "spot",
          id: "q-ga4-regex",
          prompt: "GA4 applies this regex as a full match. Which alternative would also count acme.ai, a software company's site, as an AI assistant?",
          language: "text",
          lines: ["^.*ai", "|.*chatgpt.*", "|.*perplexity.*", "|.*copilot.*"],
          answer: 0,
          explanation:
            "GA4 matches the whole value, so .*ai accepts any source that ends in \"ai\": every .ai domain, AI assistant or not. The other alternatives each need a product name in the value.",
        },
      ],
    },
    {
      id: "g-logs-report",
      title: "Server logs and reporting",
      concepts: [
        {
          id: "c-bot-logs",
          term: "AI bots in your server logs",
          summary: "Server logs show which AI bots really fetch your pages; verify them by IP or reverse DNS, because anyone can copy a user agent.",
          explanation:
            "Analytics tags don't run for bots, so your server or CDN logs are where crawler visits show up. Filter the user-agent field for the names from The Crawl Docks: GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-SearchBot, Claude-User, PerplexityBot, Perplexity-User, Googlebot and Bingbot.\n\nA user agent is only a claim. Vendors publish ways to check it. OpenAI lists published IP addresses for each agent, for example \"Published IP addresses: https://openai.com/searchbot.json\". Perplexity tells sites to use \"the most current IP ranges from the official JSON endpoints\". Google describes a reverse DNS check: run a lookup on the IP and \"Verify that the domain name is either googlebot.com, google.com, or googleusercontent.com\", then a forward lookup to confirm.",
          whyItMatters:
            "Logs answer questions no other report can: is OAI-SearchBot actually reaching the pages you care about, and did that firewall change really let PerplexityBot back in?",
          pitfall:
            "Counting every request that says \"GPTBot\" as OpenAI. Scrapers copy well-known user agents; only requests from the published ranges, or that pass DNS checks, are the real thing.",
          sources: [OPENAI_CRAWLERS, PERPLEXITY_CRAWLERS, GOOGLE_VERIFY],
        },
        {
          id: "c-report",
          term: "The monthly AI visibility report",
          summary: "One page each month: prompt-set results, first-party reports, AI referral visits, bot activity and what you changed.",
          explanation:
            "Keep the report short and the same shape every month:\n\n1. **Prompt set**: mention rate, citation rate and share of voice, with the method stated (prompts, platforms, dates, session setup).\n2. **First-party reports**: Search Console's Generative AI impressions and Bing's AI Performance citations.\n3. **Traffic**: AI Assistant sessions from Google Analytics, with the note that they're a floor.\n4. **Access**: verified bot fetches from the logs, and any blocks found.\n5. **Changes**: what you shipped this month, so next month's movement can be read against it.",
          whyItMatters:
            "People outside your team need to see the method next to the numbers. A consistent report turns a noisy subject into a trend they can follow.",
          pitfall:
            "Reporting only the metrics that went up. Show the same rows every month, good or bad, or the report stops being trusted.",
          sources: [GOOGLE_GENAI_REPORT, BING_AI_PERFORMANCE, GA4_DEFAULT_CHANNELS],
        },
      ],
      check: [
        {
          kind: "choice",
          id: "q-logs-verify",
          prompt: "A log line says \"GPTBot\" but comes from an IP address not in OpenAI's published list. What do you conclude?",
          options: [
            "It is GPTBot using a new address; count it",
            "The user agent can't be trusted on its own; treat the request as unverified",
            "OpenAI is crawling for search, not training",
            "The robots.txt file is broken",
          ],
          answer: 1,
          explanation:
            "OpenAI publishes the IP addresses for each agent. A user-agent string is easy to copy, so a request outside the published ranges isn't verified as OpenAI's.",
        },
        {
          kind: "order",
          id: "q-logs-google",
          prompt: "Put Google's manual check for a claimed Googlebot request in order.",
          items: [
            "Take the requesting IP address from your logs",
            "Run a reverse DNS lookup on it",
            "Check the domain is googlebot.com, google.com or googleusercontent.com",
            "Run a forward DNS lookup on that name and confirm it returns the same IP",
          ],
          explanation:
            "Google's verification page describes a reverse lookup, a domain check, then a forward lookup on the retrieved name to confirm it matches the original IP.",
        },
      ],
    },
  ],

  exercise: {
    id: "x-build-prompt-set",
    title: "Build a prompt set",
    brief:
      "Larkfield Tea (made up) wants its first monthly AI visibility report. You'll choose its prompts, set up the Analytics channel, and check its logs.",
    steps: [
      {
        kind: "choice",
        id: "x-step-source",
        prompt: "Where should Larkfield start collecting prompts?",
        options: [
          "Its own brainstorm of questions that mention Larkfield",
          "Search Console queries, Bing grounding queries, and questions customers ask in support emails and reviews",
          "A list of trending topics on social media",
          "Whatever ChatGPT suggests when asked for SEO keywords",
        ],
        answer: 1,
        explanation:
          "Search Console shows the queries people use to find the site, Bing's AI Performance shows the phrases AI used when citing it, and customer questions are in buyers' own words.",
      },
      {
        kind: "match",
        id: "x-step-kinds",
        prompt: "Match each prompt to its job in the set.",
        pairs: [
          { term: "Best loose-leaf tea shops in the UK", definition: "Unbranded: is Larkfield recommended?" },
          { term: "Larkfield Tea delivery times", definition: "Branded: is the answer accurate?" },
          { term: "Larkfield Tea vs Harbourside Teas", definition: "Comparison: how is Larkfield described against a rival?" },
        ],
        explanation:
          "A useful set mixes unbranded, branded and comparison prompts. Each tells you something different: whether you're recommended, whether facts about you are right, and how you're described against rivals.",
      },
      {
        kind: "blank",
        id: "x-step-regex",
        prompt: "Complete the custom channel regex so it matches Perplexity and Copilot, and no other site on a .ai domain.",
        text: "^(.*\\.)?(chatgpt\\.com|___|copilot\\.___\\.com|gemini\\.google\\.com|claude\\.ai)$",
        mono: true,
        answers: ["perplexity\\.ai", "microsoft"],
        distractors: [".*ai", "bing", "perplexity"],
        explanation:
          "Naming each domain, with the dots escaped, keeps the pattern tight. .*ai would accept any source ending in \"ai\", such as another company's .ai site, and perplexity alone wouldn't match perplexity.ai, because GA4 matches the whole value. Copilot's address is copilot.microsoft.com.",
      },
      {
        kind: "spot",
        id: "x-step-logs",
        prompt: "Larkfield's log shows reverse DNS for each request. Which \"Googlebot\" request fails Google's check?",
        language: "text",
        lines: [
          "203.0.113.24  rdns=crawl-203-0-113-24.googlebot.com  \"Googlebot/2.1\"  GET /blog/brewing-green-tea",
          "198.51.100.7  rdns=host-7.cheap-vps.example  \"Googlebot/2.1\"  GET /shop/",
          "203.0.113.90  rdns=crawl-203-0-113-90.googlebot.com  \"Googlebot/2.1\"  GET /shop/breakfast-blend",
        ],
        answer: 1,
        explanation:
          "Google says a genuine request reverse-resolves to googlebot.com, google.com or googleusercontent.com (then confirm with a forward lookup). A VPS hostname means the user agent is borrowed. (All addresses are from the documentation ranges and made up.)",
      },
    ],
    debrief:
      "Larkfield now has a ruler (a fixed prompt set covering the journey), a clean traffic channel that counts only the assistants it names, and a way to tell real crawlers from impostors. None of it is clever; all of it can be rerun next month and give comparable numbers, which is what turns visibility from an opinion into a trend.",
  },

  example: {
    title: "Google Analytics' AI Assistant channel",
    context:
      "The \"AI Assistant\" and \"Organic Search\" entries on Google Analytics' Default channel group help page, fetched on 30 October 2026.",
    excerpt: {
      kind: "quote",
      text: "AI Assistant is the channel by which users arrive at your site from sources like ChatGPT, Gemini, Deepseek, Copilot, or Grok. It excludes Google's AI Overviews and AI Mode. […] Organic Search is the channel by which users arrive at your site/app via non-ad links in organic-search results, including Google's AI Overviews and AI Mode. […] The medium is set to \"ai-assistant\" and the campaign is set to \"(ai-assistant)\" if the referrer matches a list of AI Assistants.",
    },
    points: [
      {
        label: "Two kinds of AI traffic",
        text: "Assistant visits and Google's own AI features land in different channels. Report them separately, and take AI Overviews data from Search Console.",
      },
      {
        label: "Google's list, not yours",
        text: "The channel depends on whether \"the referrer matches a list of AI Assistants\" that Google maintains. A custom channel group is how you set your own list.",
      },
      {
        label: "Referrer required",
        text: "The rule matches on the referrer. A visit that arrives without one can't be credited to an assistant and falls into Direct.",
      },
      {
        label: "Dated definitions",
        text: "Channel definitions change as products launch. Note the date you checked them in your report, as this lesson does.",
      },
    ],
    source: GA4_DEFAULT_CHANNELS,
  },

  audit: [
    {
      kind: "choice",
      id: "a-prompt-set",
      prompt: "What makes a prompt set useful for measurement?",
      options: [
        "It changes every month to follow trends",
        "It is a fixed, written list of real customer questions, rerun the same way each time",
        "It only includes questions that mention your brand",
        "It is generated fresh by an AI tool each time",
      ],
      answer: 1,
      explanation: "A fixed set run the same way is what makes month-to-month comparisons meaningful.",
    },
    {
      kind: "match",
      id: "a-match-metrics",
      prompt: "Match each metric to its formula, as this course defines them.",
      pairs: [
        { term: "Mention rate", definition: "Answers naming your brand ÷ answers checked" },
        { term: "Citation rate", definition: "Answers linking to your site ÷ answers checked" },
        { term: "Share of voice", definition: "Your mentions ÷ mentions of all tracked brands" },
      ],
      explanation: "Each is a simple ratio over the same set of answers, so anyone can recompute it from the log.",
    },
    {
      kind: "choice",
      id: "a-ga4-channel",
      prompt: "A visit arrives from chatgpt.com with a referrer. Which default Google Analytics channel is it designed for?",
      options: ["Organic Search", "Referral", "AI Assistant", "Direct"],
      answer: 2,
      explanation:
        "The AI Assistant channel covers visits from sources like ChatGPT, Gemini and Copilot when the referrer matches Google's list of AI assistants.",
    },
    {
      kind: "spot",
      id: "a-spot-log",
      prompt: "Which log line is the one to treat as unverified?",
      language: "text",
      lines: [
        "OAI-SearchBot from an IP in openai.com/searchbot.json",
        "PerplexityBot from an IP in perplexitybot.json",
        "GPTBot from an IP in no published OpenAI range",
        "Googlebot that reverse-resolves to googlebot.com and forward-confirms",
      ],
      answer: 2,
      explanation:
        "Each vendor publishes ranges or a DNS check. Only the GPTBot request fails its vendor's check, so its user agent can't be trusted.",
    },
    {
      kind: "blank",
      id: "a-blank-referrer",
      prompt: "Complete MDN's description of the no-referrer policy.",
      text: "The Referer header will be ___: sent requests do not include any referrer information.",
      answers: ["omitted"],
      distractors: ["encrypted", "shortened", "duplicated"],
      explanation: "With no referrer, Analytics has nothing to match, so the visit is counted as Direct.",
    },
    {
      kind: "passage",
      id: "a-passage-report",
      prompt: "Which report line is better?",
      passages: [
        "AI is sending us lots of traffic now and our visibility is way up.",
        "AI Assistant sessions: 1,140 (up from 960); this is a floor, since visits without a referrer count as Direct. Prompt-set citation rate: 15% (30 prompts × 4 dates).",
      ],
      answer: 1,
      explanation:
        "The second line gives numbers, the method and the main limitation. The first can't be checked. (The figures are made up.)",
    },
    {
      kind: "choice",
      id: "a-bing-share",
      prompt: "What does Bing say its Citation Share metric is not?",
      options: [
        "A percentage of citations",
        "Calculated per grounding query",
        "A ranking system or a competitive scoreboard",
        "Available in Bing Webmaster Tools",
      ],
      answer: 2,
      explanation:
        "Bing calls Citation Share an observational metric, \"not a ranking system or a competitive scoreboard\", calculated as your share of citations for a grounding query.",
    },
    {
      kind: "order",
      id: "a-order-channel",
      prompt: "Put the steps for a custom AI channel in order.",
      items: [
        "Check the exact source values in your Traffic acquisition report",
        "Create a custom channel group with an AI channel using a tight regex",
        "Move the AI channel above Referrals",
        "Review the channel's traffic and update the regex as assistants change",
      ],
      explanation:
        "Find the real values first, write the rule, put it above Referrals as Google advises, then maintain it.",
    },
    {
      kind: "choice",
      id: "a-aio-where",
      prompt: "Where do you find impressions for your pages in Google's AI Overviews and AI Mode?",
      options: [
        "Google Analytics' AI Assistant channel",
        "Search Console's Generative AI performance report",
        "Bing Webmaster Tools",
        "Your server logs",
      ],
      answer: 1,
      explanation:
        "Search Console's Generative AI performance report covers impressions in AI Overviews and AI Mode. GA4's AI Assistant channel excludes them, and Bing and server logs don't see Google's results.",
    },
    {
      kind: "choice",
      id: "a-floor",
      prompt: "Why should a report call AI Assistant sessions \"a floor\"?",
      options: [
        "Because Google Analytics rounds numbers down",
        "Because visits without a referrer, and people who type your name later, aren't counted as AI visits",
        "Because AI tools block analytics tags",
        "Because the channel only counts paid traffic",
      ],
      answer: 1,
      explanation:
        "The channel relies on the referrer. Visits that arrive without one, and later visits from people who first saw you in an answer, show up elsewhere.",
    },
  ],
};

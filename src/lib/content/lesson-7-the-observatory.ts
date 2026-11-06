// Lesson 7, The Observatory: measuring AI visibility.
// Claims about Google Analytics, Search Console, Bing Webmaster Tools, ChatGPT,
// HTTP, server logs and crawler verification are tied to sources checked on the
// `accessed` date. Mention rate, citation rate and share of voice are this
// course's own definitions, given as formulas, not industry benchmarks (the
// site's Share of Voice Tracker uses the same three). The regexes are checked
// as GA4 applies them, as full matches (lesson-7-ga4-regex.test.ts).
// Larkfield Tea is the made-up shop from Lesson 4; Harbourside Teas and
// Moorside Leaf are made-up rivals. Its prompts, run logs, method notes,
// results, report lines and log lines are invented, and its IP addresses come
// from the documentation ranges (RFC 5737).

import type { LessonContent, Source } from "../lesson-types";

const ACCESSED = "2026-11-06";

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

const GSC_ANNOTATIONS: Source = {
  title: "Adding context to your Search Console data with custom annotations",
  publisher: "Google Search Central Blog",
  url: "https://developers.google.com/search/blog/2025/11/custom-chart-annotations",
  date: "2025-11-17",
  dateKind: "published",
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

const GOOGLE_AI_FEATURES: Source = {
  title: "AI features and your website",
  publisher: "Google Search Central",
  url: "https://developers.google.com/search/docs/appearance/ai-features",
  date: "2025-12-10",
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

const GA4_URL_BUILDER: Source = {
  title: "URL builders: Collect campaign data with custom URLs",
  publisher: "Google Analytics Help",
  url: "https://support.google.com/analytics/answer/10917952",
  accessed: ACCESSED,
};

const GA4_SCOPES: Source = {
  title: "Traffic-source dimensions",
  publisher: "Google Analytics Help",
  url: "https://support.google.com/analytics/answer/11080067",
  accessed: ACCESSED,
};

const GA4_ATTRIBUTION: Source = {
  title: "Get started with attribution",
  publisher: "Google Analytics Help",
  url: "https://support.google.com/analytics/answer/10596866",
  accessed: ACCESSED,
};

const GA4_ANNOTATIONS: Source = {
  title: "About annotations",
  publisher: "Google Analytics Help",
  url: "https://support.google.com/analytics/answer/15884203",
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

const AZURE_REPRODUCIBLE: Source = {
  title: "How to generate reproducible output with Azure OpenAI in Microsoft Foundry Models (classic)",
  publisher: "Microsoft Learn",
  url: "https://learn.microsoft.com/en-us/azure/foundry-classic/openai/how-to/reproducible-output",
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

const ANTHROPIC_CRAWLERS: Source = {
  title: "Does Anthropic crawl data from the web, and how can site owners block the crawler?",
  publisher: "Claude Help Center",
  url: "https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler",
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

const APACHE_LOGS: Source = {
  title: "Log Files",
  publisher: "Apache HTTP Server Documentation",
  url: "https://httpd.apache.org/docs/current/logs.html",
  accessed: ACCESSED,
};

export const LESSON_7: LessonContent = {
  intro:
    "You have reached The Observatory, the seventh district of the City of Answers. From up here you can watch the whole city: which questions get asked, whose names come up in the answers, and who walks through your door afterwards. In this district you build the instruments: a versioned prompt set run under fixed conditions, a few honest metrics and a log to back them, the right reports in Analytics, Search Console and Bing, and a look at your own server logs.",

  outro:
    "You leave The Observatory with a prompt set you can rerun, a method that allows for answers changing from run to run, metrics you can define in one line, AI traffic separated out in Google Analytics with its limits stated, first-party reports from Google and Bing, and a way to check which bots really visit. Next stop is The Citadel, the last district, where you turn everything into a program the business will back.",

  groups: [
    {
      id: "g-prompt-sets",
      title: "Prompt sets and test conditions",
      concepts: [
        {
          id: "c-prompt-set",
          quiz: {
            kind: "choice",
            id: "cq-prompt-set",
            prompt: "Larkfield rewords three prompts in its set. What does the card say to do?",
            options: [
              "Bump the version, note the date and the reason, and compare rates on prompts that were in both versions",
              "Keep the old version number so the trend line stays unbroken",
              "Delete last month's results, since they no longer apply",
              "Nothing: small rewording never changes the answers",
            ],
            answer: 0,
            explanation:
              "A changed prompt is a changed ruler. Versioning the set and comparing like with like keeps month-to-month comparisons honest.",
          },
          term: "Prompt set",
          summary: "A prompt set is a fixed, versioned list of real customer questions you ask AI tools on a schedule, so results can be compared over time.",
          explanation:
            "You can't measure \"AI visibility\" in general, only your visibility for particular questions. A prompt set fixes those questions. Good places to find them:\n\n- **Search Console**: its Performance report shows \"what search queries are most likely to show your site\".\n- **Bing Webmaster Tools**: its AI Performance report shows grounding queries, \"the key phrases the AI used when retrieving content that was referenced in AI-generated answers.\"\n- **Your own customers**: questions from sales calls, support tickets and reviews, in their words.\n\nWrite each prompt down exactly, give it an ID, and keep the file under a version number. When you add, drop or reword a prompt, bump the version and note the date and the reason. Then compare like with like: when you report a trend across a change, use only the prompts that were in both versions. The header of the file is also the place to record the platforms and how many runs each prompt gets.",
          whyItMatters:
            "The prompt set is the ruler for everything else in this lesson. If the ruler changes silently, a rise in your numbers might only mean you added easier questions.",
          example: {
            kind: "code",
            language: "text",
            caption: "Part of Larkfield Tea's prompt set, kept as a versioned file (made up)",
            code: "# Larkfield Tea prompt set v3 (2026-10-01)\n# Change from v2: added P29-P30 (gift sets). Nothing reworded.\n# Platforms: ChatGPT, Perplexity, Copilot, Google AI Mode\n# Runs: 3 per prompt per platform, first week of each month\n\nP01 [learn]    how do you brew loose-leaf green tea\nP07 [compare]  best loose-leaf tea shops UK\nP12 [decide]   loose-leaf tea subscription with free delivery\nP20 [brand]    Larkfield Tea delivery times\nP24 [rival]    Larkfield Tea vs Harbourside Teas\nP29 [compare]  tea gift sets under £30 UK",
          },
          pitfall:
            "Filling the set with questions that contain your brand name. Of course you appear in \"Is Larkfield Tea good?\"; the questions that matter are the ones where a buyer hasn't chosen yet.",
          sources: [GSC_PERFORMANCE, BING_AI_PERFORMANCE],
        },
        {
          id: "c-prompt-variants",
          quiz: {
            kind: "match",
            id: "cq-prompt-variants",
            prompt: "Match each Larkfield prompt to the stage of the buying journey it covers.",
            pairs: [
              { term: "how do you brew loose-leaf tea", definition: "Learning" },
              { term: "best loose-leaf tea shops UK", definition: "Comparing" },
              { term: "loose-leaf tea subscription with free delivery", definition: "Deciding" },
            ],
            explanation:
              "The card uses these three as its unbranded examples: learning about the category, comparing shops, then deciding on a specific offer.",
          },
          term: "Coverage and variants",
          summary: "Cover the whole buying journey, branded and unbranded, with a few phrasings of each important question.",
          explanation:
            "AI tools don't answer only the exact words typed. Google describes query fan-out as \"A set of concurrent, related queries generated by the model to request more information and fetch additional relevant search results to address the user's query.\" One prompt can pull in pages for several related searches, so a useful set spreads out to match:\n\n- **Unbranded questions** at each stage: learning (*how do you brew loose-leaf tea*), comparing (*best loose-leaf tea shops UK*), deciding (*loose-leaf tea subscription with free delivery*).\n- **Branded questions**: what people ask once they know your name (*Larkfield Tea delivery times*), to check the answers are accurate.\n- **Competitor comparisons**: *Larkfield Tea vs* the shops you lose to.\n- **Two or three phrasings** of your most important questions, the way different customers would ask them: short and keyword-like, and long and conversational.\n\nTag each prompt with its stage, so you can see where you drop out: many brands are named in learning answers and vanish at the deciding stage, or the other way around.",
          whyItMatters:
            "A set built only from one stage, or one phrasing, can miss where you are absent. Spread is what turns a handful of checks into a picture you can act on.",
          pitfall:
            "Making the set so large nobody reruns it. Start with a set you can actually run every month, then grow it, bumping the version each time.",
          sources: [GOOGLE_AI_GUIDE],
        },
        {
          id: "c-session-setup",
          quiz: {
            kind: "choice",
            id: "cq-session-setup",
            prompt: "Why is your everyday work account a poor place to run the prompt set?",
            options: [
              "With memory on, ChatGPT may use your saved memories when it rewrites the search query",
              "ChatGPT refuses to answer questions about brands from logged-in users",
              "Answers in work accounts never include citations",
              "OpenAI blocks searches from company networks",
            ],
            answer: 0,
            explanation:
              "OpenAI says that if memory is enabled, ChatGPT may use relevant saved memories when rewriting a search query, so your account's history can shape the answer.",
          },
          term: "Fixed test conditions",
          summary: "Memory, location and account change what an assistant answers, so run the set from the same clean setup every time and write that setup down.",
          explanation:
            "Who is asking changes the answer. OpenAI's help page for ChatGPT search lists inputs beyond the prompt itself:\n\n- **Memory**: \"If memory is enabled, ChatGPT may use relevant saved memories when rewriting a search query.\"\n- **Location**: \"ChatGPT may use an approximate location based on your IP address to provide relevant local results.\" It adds that \"A VPN or network location may affect the approximate location inferred from your IP address.\"\n\nYour own account is a poor place to test from: it knows your brand, your job and your past chats. Fix a session setup for the prompt set and write it down with the results: a logged-out session where the tool allows it, or a clean test account with memory off; a private browser window; the same country and network each time; the same product tier. For local questions, put the place in the prompt instead of relying on your IP address. OpenAI's own tip for better local results is to include \"your city, neighborhood, or postal code in your question.\"",
          whyItMatters:
            "If the setup changes between runs, you can't tell whether a change in the answers came from your work or from a different account, location or tier.",
          example: {
            kind: "before-after",
            before: "Method: ran the prompts in my work ChatGPT account, from the office.",
            after:
              "Method: clean test account, memory off, private window, UK home broadband (no VPN), free tier, 3 to 4 November 2026. Same setup as October.",
            note: "Made-up method notes for Larkfield Tea. The second version can be repeated exactly next month, and anyone reading the report can see what the numbers were measured under.",
          },
          pitfall:
            "Testing from a VPN one month and an office network the next. The approximate location changes, and so can the local results.",
          sources: [OPENAI_SEARCH_HELP],
        },
        {
          id: "c-variance",
          quiz: {
            kind: "passage",
            id: "cq-variance",
            prompt: "Which way of recording a prompt fits the card's advice?",
            passages: [
              "P07, ChatGPT: ran it until Larkfield showed up, then saved that answer.",
              "P07, ChatGPT: three runs, Larkfield named in 1 of 3; all three answers saved.",
            ],
            answer: 1,
            explanation:
              "Answers vary from run to run, so each prompt is a sample. Record every run, not the best one.",
          },
          term: "Answers change from run to run",
          summary: "Ask the same question twice and you can get two different answers, so treat each prompt as a sample and report rates across many runs.",
          explanation:
            "An AI answer isn't a fixed result like a ranking checked at one moment. Microsoft's documentation for the OpenAI models it hosts says it plainly: \"By default if you ask an Azure OpenAI Chat Completion model the same question multiple times you're likely to get a different response.\" Consumer assistants add more moving parts on top: a fresh web search, a changing index and model updates. Google also says that \"AI Mode and AI Overviews may use different models and techniques, so the set of responses and links they show will vary.\"\n\nSo treat each prompt as a sample, not a reading:\n\n- **Run each prompt more than once** on each date, and record every answer, not the best one.\n- **Track AI Overviews and AI Mode separately**, and each assistant separately.\n- **Report rates across many answers**, never a single screenshot.\n- **Wait for a change to hold** across several dates before calling it a trend.\n\nFirst-party data is partial too: Bing calls its grounding-query data \"a sample of overall citation activity.\"",
          whyItMatters:
            "A single screenshot proves only that one answer happened once. Rates across repeated runs are what make a month-on-month change believable.",
          pitfall:
            "Rerunning a prompt until your brand appears and saving that answer. It turns a measurement into a search for good news.",
          sources: [AZURE_REPRODUCIBLE, GOOGLE_AI_FEATURES, BING_AI_PERFORMANCE],
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
        {
          kind: "choice",
          id: "q-prompts-variance",
          prompt: "In October, Larkfield was named in 1 of 3 runs of a prompt. In November, under the same setup, it was named in 2 of 3. What can it conclude?",
          options: [
            "It has proved its visibility doubled, and should report a win",
            "Not much yet: answers vary between runs, so it should wait for the change to hold across several dates",
            "The setup must have changed",
            "The November answers are wrong and should be discarded",
          ],
          answer: 1,
          explanation:
            "The same question can get different answers, so one extra mention in three runs is weak evidence. A change that holds across several dates, and across many prompts, is worth reporting.",
        },
      ],
    },
    {
      id: "g-share-of-voice",
      title: "Share of voice and first-party reports",
      concepts: [
        {
          id: "c-visibility-metrics",
          quiz: {
            kind: "blank",
            id: "cq-visibility-metrics",
            prompt: "Complete the course's definition of share of voice.",
            text: "Share of voice = ___ brand mentions ÷ mentions of all the brands you ___, across the same answers.",
            answers: ["your", "track"],
            distractors: ["competitors'", "rank", "cite"],
            explanation:
              "Share of voice compares your mentions with the mentions of every brand you track, so it depends on which rivals you include.",
          },
          term: "Mention rate, citation rate and share of voice",
          summary: "Three simple ratios, calculated over your prompt set, track how often you're named, how often you're cited, and your share of all brand mentions.",
          explanation:
            "This course uses three definitions. Run the whole prompt set, then:\n\n- **Mention rate** = answers that name your brand ÷ answers checked.\n- **Citation rate** = answers that link to your site as a source ÷ answers checked.\n- **Share of voice** = your brand mentions ÷ mentions of all the brands you track, across the same answers.\n\nThe first two use every answer you checked as the denominator, so they can't be gamed by dropping awkward prompts. Share of voice depends on which rivals you track: add a competitor and your share falls, even if nothing else changed. So fix the list of tracked brands along with the prompt set, and note any change to it.\n\nRecord which URL is cited each time, too: a citation rate that rests on one old blog post is fragile. Bing defines a related metric for its own data: Citation Share \"is calculated as the percentage of citations attributed to your site out of all citations shown across all sites for that same grounding query.\"",
          whyItMatters:
            "Simple ratios are easy to explain and hard to argue with. Anyone can check them against the logged answers.",
          example: {
            kind: "before-after",
            before: "\"We're doing great in AI. ChatGPT mentioned us loads this month.\"",
            after: "\"Across 30 fixed prompts on 4 dates (120 answers), we were named in 42 (mention rate 35%) and cited in 18 (citation rate 15%). Our share of voice against three tracked rivals was 28%.\"",
            note: "The figures are made up. The second version can be checked against the logged answers, and repeated next month.",
          },
          pitfall:
            "Comparing numbers from different prompt sets, platforms, tracked-brand lists or session setups as if they were the same measurement. Keep the method fixed.",
          sources: [BING_AI_INSIGHTS],
        },
        {
          id: "c-run-log",
          quiz: {
            kind: "choice",
            id: "cq-run-log",
            prompt: "According to the card, what should someone else be able to do with your run log?",
            options: [
              "Recompute your mention rate, citation rate and share of voice",
              "See your rankings in Google",
              "Find out which prompts your competitors track",
              "Replace Search Console's Generative AI report",
            ],
            answer: 0,
            explanation:
              "The log is the evidence behind the rates: one row per answer, with brands named and URLs cited, so anyone can recount them.",
          },
          term: "Recording each run",
          summary: "Keep one row per answer, with the brands named and the URLs cited, so every rate in your report can be recounted.",
          explanation:
            "Every run produces raw material: the answer text and the sources attached to it. Keep both, in a log with one row per answer:\n\n- **Date, platform and mode**, plus a pointer to the session setup you used.\n- **Prompt ID and run number**, so reruns of the same prompt line up.\n- **Brands named**, in order, and whether yours was one of them.\n- **Cited URLs**, including which of your pages, if any. In ChatGPT, \"Select Sources, when available, to view cited sources and other relevant links.\"\n- **Accuracy notes**: anything the answer got wrong about you, such as an old price or a delivery time.\n\nYou can keep this in a spreadsheet, or use this site's free [Share of Voice Tracker](/tools/share-of-voice-tracker): paste in the answers and it counts mentions and citations, works out the three rates above, saves each run in your browser and exports a CSV. Either way, save the full answer text too, because you can't rerun last month.",
          whyItMatters:
            "The rates are only as trustworthy as the log behind them. When someone asks \"which answers?\", you can show them.",
          example: {
            kind: "code",
            language: "text",
            caption: "Three rows from Larkfield Tea's run log (made up; the domains are placeholders)",
            code: "date,platform,prompt,run,brands_named,larkfield_named,cited_urls,larkfield_cited,notes\n2026-11-03,ChatGPT,P07,1,\"Harbourside Teas; Larkfield Tea\",yes,\"harbourside.example/shop; larkfieldtea.example/guides/green-tea\",yes,\n2026-11-03,ChatGPT,P07,2,\"Harbourside Teas\",no,\"harbourside.example/shop\",no,\n2026-11-03,Perplexity,P07,1,\"Larkfield Tea; Moorside Leaf\",yes,\"reviews.example/best-tea-shops\",no,\"says delivery takes 5 days (it's 2 to 4)\"",
          },
          pitfall:
            "Logging only the rates. Without the answers and cited URLs, nobody can check them, and you can't see which page earned the citations.",
          sources: [OPENAI_SEARCH_HELP],
        },
        {
          id: "c-first-party-reports",
          quiz: {
            kind: "choice",
            id: "cq-first-party-reports",
            prompt: "What does Search Console's Generative AI performance report count?",
            options: [
              "Impressions: how many times links to your site were shown in a generative AI feature on Google Search",
              "Visits from ChatGPT and Gemini",
              "Mentions of your brand without a link",
              "Bot requests from Google's AI crawlers",
            ],
            answer: 0,
            explanation:
              "The help page defines its impressions as how many times links to your site were shown to a user in a generative AI feature on Google Search.",
          },
          term: "Search Console's AI data",
          summary: "Google counts AI Overviews and AI Mode inside the Performance report's Web data, and shows their impressions separately in a Generative AI performance report.",
          explanation:
            "Google reports its own AI features in two places in Search Console.\n\n- **The Performance report.** Google says AI features traffic is \"reported on in the Performance report\", within the Web search type, so it's mixed in with ordinary results rather than broken out. The usual counting rules apply, with AI-specific notes: \"Clicking a link to an external page in the AI Overview counts as a click\", and \"An AI Overview occupies a single position in search results, and all links in the AI Overview are assigned that same position.\" In AI Mode, \"Clicking a link to an external page in AI Mode counts as a click.\"\n- **The Generative AI performance report.** It \"shows data about how your site performs in generative AI features on Google Search\", covering AI Overviews and AI Mode. It counts impressions, \"how many times links to your site were shown to a user in a generative AI feature on Google Search.\" You can group them by page, country, device and date.\n\nThe newest days can be preliminary and change, so pull the numbers on the same day each month.",
          whyItMatters:
            "These are Google's own numbers for its AI features. Use them to check your prompt-set results for Google, and report them alongside, with the date range.",
          pitfall:
            "Adding the Generative AI report's impressions to the Performance report's totals. The AI feature data is already counted inside the Web search type.",
          sources: [GOOGLE_GENAI_REPORT, GSC_COUNTING, GOOGLE_AI_FEATURES],
        },
        {
          id: "c-bing-ai-performance",
          quiz: {
            kind: "match",
            id: "cq-bing-ai-performance",
            prompt: "Match each Bing AI Performance view to what it shows.",
            pairs: [
              { term: "Total citations", definition: "How many citations to your site were shown as sources in AI answers" },
              { term: "Grounding queries", definition: "The key phrases the AI used when retrieving content it then referenced" },
              { term: "Citation Share", definition: "Your share of all citations shown for the same grounding query" },
            ],
            explanation:
              "Bing counts citations, shows the phrases used to retrieve the cited content, and calculates your share of citations per grounding query.",
          },
          term: "Bing's AI Performance report",
          summary: "Bing Webmaster Tools counts how often Copilot and Bing's AI summaries cite your pages, and for which grounding queries.",
          explanation:
            "Bing Webmaster Tools' AI Performance report, in public preview since February 2026, shows how content appears \"across Microsoft Copilot, AI-generated summaries in Bing, and select partner integrations.\" Its main views:\n\n- **Total citations**: \"the total number of citations that are displayed as sources in AI-generated answers during the selected time frame.\"\n- **Average cited pages**, citation counts for each page, and trends over time.\n- **Grounding queries**: \"the key phrases the AI used when retrieving content that was referenced in AI-generated answers.\"\n\nA June 2026 update added Intents, Topics (\"which group related grounding queries into broader thematic clusters\"), Compare, which lets you \"overlay a previous time period directly onto the current reporting view\", and Citation Share, your percentage of all the citations shown for a grounding query.\n\nRead the counts the way Bing describes them: \"This reflects how often pages are cited, not page importance, ranking, or placement.\" And Citation Share \"does not expose competitor domains, represent traffic share, or assign quality scores to content.\"",
          whyItMatters:
            "It is the only first-party citation count from a major AI answer engine, and its grounding queries are a ready-made source of prompts for your set.",
          pitfall:
            "Treating Citation Share as a ranking. Bing says it is \"not a ranking system or a competitive scoreboard.\"",
          sources: [BING_AI_PERFORMANCE, BING_AI_INSIGHTS],
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
        {
          kind: "match",
          id: "q-sov-sources",
          prompt: "Match each instrument to what it tells you.",
          pairs: [
            { term: "Search Console's Generative AI report", definition: "Impressions in Google's AI Overviews and AI Mode" },
            { term: "Bing's AI Performance report", definition: "Citations in Copilot and Bing's AI summaries, with grounding queries" },
            { term: "Your own run log", definition: "Mentions and citations for your prompts, including your rivals'" },
          ],
          explanation:
            "Each covers a different slice. Only your own log shows competitors' brands, because Bing's Citation Share doesn't expose competitor domains and Google's report covers only your site.",
        },
      ],
    },
    {
      id: "g-ga4",
      title: "AI traffic in Google Analytics",
      concepts: [
        {
          id: "c-ai-assistant-channel",
          quiz: {
            kind: "blank",
            id: "cq-ai-assistant-channel",
            prompt: "Complete Google's rule for the AI Assistant channel.",
            text: "The medium is set to \"___\" and the campaign is set to \"(ai-assistant)\" if the ___ matches a list of AI Assistants.",
            answers: ["ai-assistant", "referrer"],
            distractors: ["referral", "organic", "user agent"],
            explanation:
              "Google Analytics sets the medium to ai-assistant when the referrer matches its list of AI assistants. That medium is what puts the visit in the AI Assistant channel.",
          },
          term: "The AI Assistant channel",
          summary: "Google Analytics' default channel group has an AI Assistant channel for visits from tools like ChatGPT, Gemini and Copilot; AI Overviews and AI Mode count as Organic Search.",
          explanation:
            "Google Analytics now separates AI assistant traffic by default, with no setup. Its help page says: \"AI Assistant is the channel by which users arrive at your site from sources like ChatGPT, Gemini, Deepseek, Copilot, or Grok. It excludes Google's AI Overviews and AI Mode.\"\n\nThose two are counted elsewhere: Organic Search covers visits \"via non-ad links in organic-search results, including Google's AI Overviews and AI Mode.\" The rule behind the channel: \"The medium is set to \"ai-assistant\" and the campaign is set to \"(ai-assistant)\" if the referrer matches a list of AI Assistants.\"\n\nFind it in the Traffic acquisition report with the session default channel group, and add session source as a second dimension to see which assistant sent each visit. Two limits to remember. The list is Google's: the help page names examples but doesn't publish the full list, so check whether an assistant you care about is still landing in Referral. And it's a rule about the referrer, so it can't see visits that arrive without one.",
          whyItMatters:
            "This is the quickest honest answer to \"how many visits does AI send us?\" for the assistants Google recognizes, with no setup.",
          pitfall:
            "Adding AI Assistant traffic and Google's AI Overviews traffic together from GA4. GA4 can't separate AI Overviews clicks from other organic clicks; use Search Console for those.",
          sources: [GA4_DEFAULT_CHANNELS],
        },
        {
          id: "c-custom-channel",
          quiz: {
            kind: "choice",
            id: "cq-custom-channel",
            prompt: "Where does Google say a custom AI channel must sit in your channel list?",
            options: ["Above Referrals", "Below Referrals", "At the very bottom", "Anywhere: order doesn't matter"],
            answer: 0,
            explanation:
              "Google says to reorder the list so the AI channel appears above Referrals. Otherwise Referrals claims the visits first.",
          },
          term: "A custom AI channel",
          summary: "A custom channel group with a tight regex lets you choose exactly which assistants count, but the regex has to be precise.",
          explanation:
            "The default channel is enough for most reports. Build a custom channel group when you need your own definition, such as an assistant that Google's list doesn't catch. Add a channel, choose \"matches regex\", list the assistants, and then \"reorder your channel list so that\" the AI channel appears above Referrals.\n\nBe careful with broad patterns. Google Analytics applies a regex to the whole value: \"By default, Google Analytics Regex is full regex and case sensitive.\" Google's own example starts with `^.*ai|`, so it accepts any source that ends in \"ai\": every .ai domain, whether or not it is an AI assistant. Its `.*gpt.*` alternative accepts any source containing \"gpt\". A tighter pattern names the domains:\n\n`^(.*\\.)?(chatgpt\\.com|perplexity\\.ai|copilot\\.microsoft\\.com|gemini\\.google\\.com|claude\\.ai)$`\n\nCheck the exact source values in your own Traffic acquisition report before you finalize the list, and update it when assistants change. Google notes: \"You should update your regex expression if URLs or the list of assistants you wish to measure change.\"",
          whyItMatters:
            "A loose regex quietly pulls other referrals into your AI numbers, such as any software company on a .ai domain that links to you, and those inflated numbers then go into reports.",
          pitfall:
            "Leaving the new channel below Referrals. Google says to reorder it above, or the visits are claimed by Referrals first.",
          sources: [GA4_CUSTOM_CHANNELS, GA4_REGEX, OPENAI_SEARCH_HELP],
        },
        {
          id: "c-missing-referrer",
          quiz: {
            kind: "choice",
            id: "cq-missing-referrer",
            prompt: "A visitor clicks a link in an assistant, but the browser sends no referrer and the URL has no campaign tags. Where does Google Analytics count the visit?",
            options: ["Direct", "AI Assistant", "Referral", "Organic Search"],
            answer: 0,
            explanation:
              "With no referrer and no campaign parameters there is no source to match, so the visit is counted as Direct.",
          },
          term: "Visits without a referrer",
          summary: "Analytics can only credit an AI tool when the visit carries a referrer or a campaign tag; when it carries neither, the visit lands in Direct.",
          explanation:
            "Channel rules work from what arrives with the visit. Usually that's the referrer the browser sends. MDN explains that a page can set `Referrer-Policy: no-referrer`, in which case \"The Referer header will be omitted: sent requests do not include any referrer information.\" A visit like that has no source for Analytics to match, so it is counted as Direct, which Google defines as arriving \"via a saved link or by entering your URL.\"\n\nThe other route is campaign parameters in the link. Google Analytics defines utm_source as \"Referrer, for example: google, newsletter4, billboard\", and warns that \"Parameter values are case sensitive, e.g. utm_source=google is different from utm_source=Google.\" Don't build your reporting on an assistant tagging its links: none of the OpenAI or Perplexity pages cited in this lesson documents a tracking parameter, so any tag you see in your landing-page reports is an observation that can change.\n\nAnd someone who reads your name in an answer and comes back days later through a search or a bookmark arrives through that route, not through the assistant.",
          whyItMatters:
            "Your AI Assistant numbers are a floor, not a total. Say so in reports, and look at branded search and direct visits alongside them.",
          pitfall:
            "Presenting AI referral visits as everything AI did for the business. Some influence never shows up as a referred visit at all.",
          sources: [MDN_REFERRER_POLICY, GA4_DEFAULT_CHANNELS, GA4_URL_BUILDER],
        },
        {
          id: "c-attribution",
          quiz: {
            kind: "choice",
            id: "cq-attribution",
            prompt: "Which visits does Google Analytics say never get attribution credit, unless the whole path to the key event is made of them?",
            options: ["Direct visits", "Organic Search visits", "AI Assistant visits", "Referral visits"],
            answer: 0,
            explanation:
              "All attribution models exclude direct visits from credit, unless the path to the key event consists entirely of direct visits.",
          },
          term: "What a sale gets credited to",
          summary: "AI often starts a purchase without finishing it, and Google Analytics' attribution rules credit the visit that finishes it.",
          explanation:
            "Sessions are the easy part. Sales and sign-ups are harder, because Analytics has to decide which visit gets the credit, and an AI answer is often not the last step.\n\n- **The report you read changes the answer.** \"Session-scoped dimensions show you where both new and returning users are coming from when they start new sessions\", in the Traffic acquisition report. \"User-scoped dimensions show you where your new users are coming from\", in User acquisition. For both, \"Analytics uses the paid and organic channels last click attribution model.\"\n- **Key events can be shared out by a model.** In the Model comparison and Key event paths reports, credit follows the model you select. Data-driven attribution \"distributes credit for the key event based on data for each key event.\"\n- **Direct gets no credit** unless there's nothing else: \"All attribution models exclude direct visits from receiving attribution credit\", \"unless the path to key event consists entirely of direct visits.\"\n\nSo a buyer who first met you in a ChatGPT answer, came back a week later through a Google search and bought, is credited to Organic Search under last click.",
          whyItMatters:
            "If you judge AI only by the sales in AI Assistant sessions, you'll undercount it. Report those sales as a floor, and use the Key event paths report to see where AI visits sit in longer paths.",
          example: {
            kind: "before-after",
            before: "\"AI Assistant drove 9 sales this month, so AI is worth 9 sales to us.\"",
            after:
              "\"9 sales came in sessions that started from an AI assistant (Traffic acquisition, last click). Buyers who met us in an answer and bought on a later visit are credited elsewhere, so 9 is a floor.\"",
            note: "Made-up figures for Larkfield Tea. The second version says which report and model the number comes from, and what it leaves out.",
          },
          pitfall:
            "Comparing AI Assistant sales from the Traffic acquisition report with figures from the Model comparison report as if they used the same rules. Check the scope and the model before you compare.",
          sources: [GA4_SCOPES, GA4_ATTRIBUTION],
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
        {
          kind: "choice",
          id: "q-ga4-attribution",
          prompt: "A buyer finds Larkfield in a Perplexity answer, visits, leaves, then returns a week later by searching Larkfield Tea on Google and buys. In the Traffic acquisition report, which channel's session holds the sale?",
          options: ["AI Assistant", "Organic Search", "Direct", "Both equally"],
          answer: 1,
          explanation:
            "Session-scoped reports use last click: the sale happened in the session that started from Google search. The Perplexity visit gets no credit there, which is why AI Assistant sales are a floor.",
        },
      ],
    },
    {
      id: "g-logs-report",
      title: "Server logs and reporting",
      concepts: [
        {
          id: "c-bot-logs",
          quiz: {
            kind: "spot",
            id: "cq-bot-logs",
            prompt: "Which of these user agents is a fetcher that visits while answering a user, for which OpenAI says robots.txt rules may not apply?",
            language: "text",
            lines: ["OAI-SearchBot", "GPTBot", "ChatGPT-User", "ClaudeBot"],
            answer: 2,
            explanation:
              "ChatGPT-User acts for a person asking ChatGPT something. OpenAI says that because these actions are initiated by a user, robots.txt rules may not apply.",
          },
          term: "AI bots in your server logs",
          summary: "Server logs show which AI bots really fetch your pages, what they asked for and what your server answered.",
          explanation:
            "Analytics tags don't run for bots, so your server or CDN logs are where crawler visits show up. In Apache's Combined Log Format, each line ends with two quoted headers: the Referer, which \"gives the site that the client reports having been referred from\", and the User-Agent: \"This is the identifying information that the client browser reports about itself.\"\n\nFilter the user-agent field for the names from The Crawl Docks, and read them by job:\n\n- **Search crawlers** that gather pages for AI search results: OAI-SearchBot, Claude-SearchBot, PerplexityBot.\n- **User-triggered fetchers** that visit while answering someone: ChatGPT-User, Claude-User, Perplexity-User. OpenAI notes that \"Because these actions are initiated by a user, robots.txt rules may not apply.\"\n- **Training crawlers**: GPTBot, ClaudeBot.\n\nFor each, track which URLs it requested, the status codes it got and how often it came back. A run of 403s or 5xx errors on your key pages is something no other report will show you.",
          whyItMatters:
            "Logs answer questions no other report can: is OAI-SearchBot actually reaching the pages you care about, and did that firewall change really let PerplexityBot back in?",
          example: {
            kind: "code",
            language: "text",
            caption: "Made-up log lines from Larkfield Tea's server, in Combined Log Format (documentation IP addresses)",
            code: "203.0.113.10 - - [03/Nov/2026:09:14:02 +0000] \"GET /guides/green-tea-brewing HTTP/1.1\" 200 18432 \"-\" \"Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; ChatGPT-User/1.0; +https://openai.com/bot\"\n198.51.100.23 - - [03/Nov/2026:09:20:45 +0000] \"GET /shop/breakfast-blend HTTP/1.1\" 403 512 \"-\" \"Mozilla/5.0 (compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)\"\n203.0.113.57 - - [03/Nov/2026:10:02:11 +0000] \"GET /delivery HTTP/1.1\" 200 9120 \"-\" \"Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; GPTBot/1.4; +https://openai.com/gptbot\"",
          },
          pitfall:
            "Checking logs only after traffic drops. A blocked search crawler shows up in the logs weeks before it shows up anywhere else, so look every week.",
          sources: [APACHE_LOGS, OPENAI_CRAWLERS],
        },
        {
          id: "c-bot-verify",
          quiz: {
            kind: "choice",
            id: "cq-bot-verify",
            prompt: "What does Perplexity recommend for recognizing its crawlers?",
            options: [
              "Combine User-Agent string matching with IP address verification, using the current official IP ranges",
              "Trust any request whose user agent contains PerplexityBot",
              "Check that the request has a referrer from perplexity.ai",
              "Copy the IP list once and keep it forever",
            ],
            answer: 0,
            explanation:
              "Perplexity says to combine user-agent matching and IP verification, and always to use the most current IP ranges from its official JSON endpoints.",
          },
          term: "Verifying AI bots",
          summary: "Anyone can copy a user agent, so verify bots against the vendor's published IP ranges or Google's DNS check before you count them.",
          explanation:
            "A user agent is only a claim, and scrapers copy the well-known ones. Verify before you count:\n\n- **OpenAI** publishes a JSON file of IP addresses for each agent, for example \"Published IP addresses: https://openai.com/searchbot.json\", with separate files for GPTBot and ChatGPT-User.\n- **Perplexity** says \"Always use the most current IP ranges from the official JSON endpoints\" and recommends you \"combine both User-Agent string matching and IP address verification for enhanced security.\"\n- **Anthropic** links a list of its addresses: \"If a crawler has a source IP address on this list, it indicates that the crawler is coming from Anthropic.\"\n- **Google** publishes IP range lists, and also describes a DNS check: run a reverse lookup on the IP, \"Verify that the domain name is either googlebot.com, google.com, or googleusercontent.com\", then run a forward lookup on that name and confirm it returns the same IP.\n\nFetch the JSON files on a schedule instead of copying them once, and label each bot request in your log report as verified or unverified.",
          whyItMatters:
            "Unverified requests inflate your counts and can hide the real picture: thousands of fake GPTBot hits can mask the fact that the real one stopped coming.",
          pitfall:
            "Counting every request that says \"GPTBot\" as OpenAI. Scrapers copy well-known user agents; only requests from the published ranges, or that pass DNS checks, are the real thing.",
          sources: [OPENAI_CRAWLERS, PERPLEXITY_CRAWLERS, ANTHROPIC_CRAWLERS, GOOGLE_VERIFY],
        },
        {
          id: "c-annotations",
          quiz: {
            kind: "choice",
            id: "cq-annotations",
            prompt: "Who can see a custom annotation you add in Search Console?",
            options: [
              "Everyone with access to the Search Console property",
              "Only you",
              "Only owners of the property",
              "Anyone on the web",
            ],
            answer: 0,
            explanation:
              "Google says everyone with access to the property can see custom annotations, which is why the card says to keep personal details out.",
          },
          term: "Annotating changes",
          summary: "Mark launches, fixes and method changes on the charts themselves, so a jump in the numbers can be read against what caused it.",
          explanation:
            "Numbers move for reasons that have nothing to do with AI: a site migration, a sale, a holiday, a change to the prompt set. Record those changes where the charts are, so whoever reads the trend can see them.\n\n- **Google Analytics**: \"Annotations allow users to add notes directly to Google Analytics 4 reports.\" Right-click a data point on a line graph and choose Add annotation. Titles can be up to 60 characters and descriptions up to 150, and you need Analyst access or above to create one.\n- **Search Console**: since November 2025 you can right-click the Performance chart and add a note of up to 120 characters on a date. Google's suggestions include \"Infrastructure changes like updating a template or a site migration\" and \"Changing content to focus on different user intents\". Everyone with access to the property can see them, so keep personal details out.\n\nKeep the same changelog in your run log too: prompt-set versions, setup changes, tracked-brand changes and content you shipped, each with a date.",
          whyItMatters:
            "Without a record of what changed, a rise gets credited to whatever the reader hopes caused it. With one, you can line movements up against real events.",
          pitfall:
            "Annotating only your wins. A note for the week the firewall blocked PerplexityBot is as useful as one for a launch.",
          sources: [GA4_ANNOTATIONS, GSC_ANNOTATIONS],
        },
        {
          id: "c-report",
          quiz: {
            kind: "order",
            id: "cq-report",
            prompt: "Put the first four sections of the monthly report in the card's order.",
            items: ["Method", "Prompt set", "First-party reports", "Traffic"],
            explanation:
              "The report opens with how the numbers were measured, then the prompt-set rates, then Google's and Bing's own data, then Analytics traffic.",
          },
          term: "The monthly AI visibility report",
          summary: "One page each month, the same shape every time: method, prompt-set results, first-party reports, traffic, bot access, changes and next steps.",
          explanation:
            "Keep the report short and the same shape every month, so readers learn where to look:\n\n1. **Method**: prompt-set version, platforms, dates, runs per prompt, session setup and tracked brands.\n2. **Prompt set**: mention rate, citation rate and share of voice, overall and by journey stage, against last month.\n3. **First-party reports**: Search Console's Generative AI impressions and Bing's AI Performance citations.\n4. **Traffic**: AI Assistant sessions and the sales in them, with the note that both are floors.\n5. **Access**: verified bot fetches from the logs, and any blocks found.\n6. **Changes**: what you shipped this month, matching your annotations.\n7. **Next**: the two or three things you'll do about what the numbers show.\n\nLead with a one-line summary for readers who stop there, and keep the caveats next to the numbers they qualify, not in a footnote.",
          whyItMatters:
            "People outside your team need to see the method next to the numbers. A consistent report turns a noisy subject into a trend they can follow, and the next steps turn it into decisions.",
          example: {
            kind: "before-after",
            before: "\"AI visibility is up! See attached screenshots of ChatGPT recommending us.\"",
            after:
              "\"November (prompt set v3, 30 prompts × 4 platforms × 3 runs): citation rate 15%, up from 12%, mostly on comparing-stage prompts. Bing citations steady. AI Assistant sessions 1,140 (a floor). PerplexityBot was blocked 3 to 10 November; fixed. Next: refresh the delivery page that two answers got wrong.\"",
            note: "Made-up figures for Larkfield Tea. The second version states the method, the numbers, the problems and what happens next.",
          },
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
        {
          kind: "choice",
          id: "q-logs-changelog",
          prompt: "Larkfield's citation rate rose in October, the month it added two gift-set prompts (v2 to v3). What should the report do?",
          options: [
            "Report the rise as a win for October's content",
            "Note the prompt-set change, and compare rates on the prompts that were in both versions",
            "Leave the change out so the trend looks clean",
            "Drop September's numbers and start again",
          ],
          answer: 1,
          explanation:
            "New prompts change the ruler. Recording the version change, in the report and as an annotation, and comparing like with like shows whether the rise is real.",
        },
      ],
    },
  ],

  exercise: {
    id: "x-build-prompt-set",
    title: "Build a prompt set",
    brief:
      "Larkfield Tea (made up) wants its first monthly AI visibility report. You'll choose its prompts, work out its numbers, set up the Analytics channel, and check its logs.",
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
        kind: "choice",
        id: "x-step-metrics",
        prompt:
          "Larkfield's run log for November has 90 answers. Larkfield is named in 27 and cited in 9. Counting mentions of all tracked brands across those answers: Larkfield 27, Harbourside Teas 48, Moorside Leaf 33. What is Larkfield's share of voice?",
        options: ["25%", "30%", "10%", "36%"],
        answer: 0,
        explanation:
          "Share of voice is Larkfield's mentions over all tracked brands' mentions: 27 ÷ (27 + 48 + 33) = 27 ÷ 108 = 25%. 30% is the mention rate (27 ÷ 90) and 10% the citation rate (9 ÷ 90). (All figures made up.)",
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
      "Larkfield now has a ruler (a fixed, versioned prompt set covering the journey), numbers it can recompute from its log, a clean traffic channel that counts only the assistants it names, and a way to tell real crawlers from impostors. None of it is clever; all of it can be rerun next month under the same conditions and give comparable numbers, which is what turns visibility from an opinion into a trend.",
  },

  example: {
    title: "Google Analytics' AI Assistant channel",
    context:
      "The \"AI Assistant\" and \"Organic Search\" entries on Google Analytics' Default channel group help page, fetched on 6 November 2026.",
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
        "It is a fixed, written, versioned list of real customer questions, rerun the same way each time",
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
    {
      kind: "choice",
      id: "a-variance",
      prompt: "Why run each prompt more than once on each date?",
      options: [
        "The same question can get a different answer each time, so one run is a sample of one",
        "Assistants only cite sources on the second run",
        "Running it twice clears the assistant's memory",
        "Search Console counts each run as an impression",
      ],
      answer: 0,
      explanation:
        "Answers vary from run to run. Several runs per prompt, all recorded, give a rate you can compare month to month.",
    },
    {
      kind: "choice",
      id: "a-session-setup",
      prompt: "Which test setup gives the most comparable results month to month?",
      options: [
        "Whoever is free runs the prompts in their own account",
        "A clean account with memory off, a private window, the same country and network, written down with the results",
        "A different VPN location each month, to see more of the world",
        "Your work account, because it knows your brand best",
      ],
      answer: 1,
      explanation:
        "Memory and location can change ChatGPT's answers, so a fixed, recorded setup is what makes one month comparable with the next.",
    },
  ],
};

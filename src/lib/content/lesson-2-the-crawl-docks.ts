// Lesson 2, The Crawl Docks: make your site reachable by AI.
// Every claim about a crawler, robots.txt, rendering, sitemaps, IndexNow,
// llms.txt, training-preference signals, bot verification or CDN blocking is
// tied to a source checked on the `accessed` date.
// Fernhill Garden Supply is a made-up shop. Log lines use documentation-only
// IP addresses (RFC 5737) with user-agent strings as the vendors publish them.

import type { LessonContent, Source } from "../lesson-types";

const ACCESSED = "2026-11-06";

const OPENAI_CRAWLERS: Source = {
  title: "Overview of OpenAI Crawlers",
  publisher: "OpenAI",
  url: "https://developers.openai.com/api/docs/bots",
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

const CLAUDE_AGENT: Source = {
  title: "How do Anthropic-hosted browsers identify themselves when they browse the web on a user's behalf?",
  publisher: "Claude Help Center",
  url: "https://support.claude.com/en/articles/18234133",
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

const GOOGLE_COMMON_CRAWLERS: Source = {
  title: "Google's common crawlers",
  publisher: "Google Crawling Infrastructure",
  url: "https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers",
  date: "2026-10-30",
  dateKind: "updated",
  accessed: ACCESSED,
};

const GOOGLE_USER_FETCHERS: Source = {
  title: "Google user-triggered fetchers",
  publisher: "Google Crawling Infrastructure",
  url: "https://developers.google.com/crawling/docs/crawlers-fetchers/google-user-triggered-fetchers",
  date: "2026-08-19",
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

const GOOGLE_AI_GUIDE: Source = {
  title: "Google's guide to optimizing for generative AI features on Google Search",
  publisher: "Google Search Central",
  url: "https://developers.google.com/search/docs/fundamentals/ai-optimization-guide",
  date: "2026-07-10",
  dateKind: "updated",
  accessed: ACCESSED,
};

const APPLEBOT: Source = {
  title: "About Applebot",
  publisher: "Apple Support",
  url: "https://support.apple.com/en-us/119829",
  accessed: ACCESSED,
};

const CCBOT: Source = {
  title: "CCBot",
  publisher: "Common Crawl",
  url: "https://commoncrawl.org/ccbot",
  accessed: ACCESSED,
};

const CCBOT_FAQ: Source = {
  title: "Frequently asked questions",
  publisher: "Common Crawl",
  url: "https://commoncrawl.org/faq",
  accessed: ACCESSED,
};

const RFC_9309: Source = {
  title: "RFC 9309: Robots Exclusion Protocol",
  publisher: "IETF (RFC Editor)",
  url: "https://www.rfc-editor.org/rfc/rfc9309.html",
  date: "2022-09",
  dateKind: "published",
  accessed: ACCESSED,
};

const AIPREF_DRAFT: Source = {
  title: "Machine-Readable Training Preference Signal (draft-kelley-aipref-training-preference-signal-00)",
  publisher: "IETF Datatracker (individual Internet-Draft)",
  url: "https://datatracker.ietf.org/doc/draft-kelley-aipref-training-preference-signal",
  date: "2026-10-30",
  dateKind: "published",
  accessed: ACCESSED,
};

const GOOGLE_ROBOTS_SPEC: Source = {
  title: "How Google interprets the robots.txt specification",
  publisher: "Google Crawling Infrastructure",
  url: "https://developers.google.com/crawling/docs/robots-txt/robots-txt-spec",
  date: "2026-10-23",
  dateKind: "updated",
  accessed: ACCESSED,
};

const GOOGLE_ROBOTS_INTRO: Source = {
  title: "Introduction to robots.txt",
  publisher: "Google Search Central",
  url: "https://developers.google.com/search/docs/crawling-indexing/robots/intro",
  date: "2025-12-10",
  dateKind: "updated",
  accessed: ACCESSED,
};

const GOOGLE_JS_SEO: Source = {
  title: "Understand JavaScript SEO basics",
  publisher: "Google Search Central",
  url: "https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics",
  date: "2026-03-04",
  dateKind: "updated",
  accessed: ACCESSED,
};

const VERCEL_AI_CRAWLERS: Source = {
  title: "The rise of the AI crawler (with MERJ)",
  publisher: "Vercel",
  url: "https://vercel.com/blog/the-rise-of-the-ai-crawler",
  date: "2024-12-17",
  dateKind: "published",
  accessed: ACCESSED,
};

const SITEMAPS_HOME: Source = {
  title: "What are Sitemaps?",
  publisher: "sitemaps.org",
  url: "https://www.sitemaps.org/",
  date: "2020-04-17",
  dateKind: "updated",
  accessed: ACCESSED,
};

const SITEMAPS_PROTOCOL: Source = {
  title: "Sitemaps XML format",
  publisher: "sitemaps.org",
  url: "https://www.sitemaps.org/protocol.html",
  date: "2016-11-21",
  dateKind: "updated",
  accessed: ACCESSED,
};

const INDEXNOW_DOCS: Source = {
  title: "IndexNow documentation",
  publisher: "IndexNow.org",
  url: "https://www.indexnow.org/documentation",
  accessed: ACCESSED,
};

const INDEXNOW_FAQ: Source = {
  title: "IndexNow FAQ",
  publisher: "IndexNow.org",
  url: "https://www.indexnow.org/faq",
  accessed: ACCESSED,
};

const INDEXNOW_ENGINES: Source = {
  title: "Participating search engines (searchengines.json)",
  publisher: "IndexNow.org",
  url: "https://www.indexnow.org/searchengines.json",
  accessed: ACCESSED,
};

const LLMS_TXT: Source = {
  title: "The /llms.txt file, v2",
  publisher: "llmstxt.org (Jeremy Howard)",
  url: "https://llmstxt.org/",
  date: "2026-08-10",
  dateKind: "updated",
  accessed: ACCESSED,
};

const CLOUDFLARE_ONE_CLICK: Source = {
  title: "Declare your AIndependence: block AI bots, scrapers and crawlers with a single click",
  publisher: "Cloudflare Blog",
  url: "https://blog.cloudflare.com/declaring-your-aindependence-block-ai-bots-scrapers-and-crawlers-with-a-single-click/",
  date: "2024-07-03",
  dateKind: "published",
  accessed: ACCESSED,
};

const CLOUDFLARE_DEFAULT_BLOCK: Source = {
  title: "Content Independence Day: no AI crawl without compensation!",
  publisher: "Cloudflare Blog",
  url: "https://blog.cloudflare.com/content-independence-day-no-ai-crawl-without-compensation/",
  date: "2025-07-01",
  dateKind: "published",
  accessed: ACCESSED,
};

const CLOUDFLARE_AI_BOTS_DOCS: Source = {
  title: "AI Crawler and Agent access policies",
  publisher: "Cloudflare Docs",
  url: "https://developers.cloudflare.com/bots/additional-configurations/block-ai-bots/",
  date: "2026-11-02",
  dateKind: "updated",
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

const GUARDIAN_ROBOTS: Source = {
  title: "robots.txt for theguardian.com",
  publisher: "The Guardian",
  url: "https://www.theguardian.com/robots.txt",
  accessed: ACCESSED,
};

export const LESSON_2: LessonContent = {
  intro:
    "You have reached The Crawl Docks, the second district of the City of Answers. Bots arrive here all day to collect pages for the city's indexes and answers, and the well-behaved ones read your robots.txt before they take anything. Your job in this district is to make sure the right ones get in, and that nothing on your side turns them away by accident.",

  outro:
    "You leave The Crawl Docks knowing who is knocking, what your robots.txt actually says to each of them, how to tell a real bot from an impostor, and where a CDN setting can overrule all of it. Next stop is The Answer Quarter, where you work on the passages those bots carry away.",

  groups: [
    {
      id: "g-who-knocks",
      title: "Who is knocking",
      concepts: [
        {
          id: "c-three-jobs",
          quiz: {"kind": "match", "id": "cq-three-jobs", "prompt": "Match each token to the job its vendor describes.", "pairs": [{"term": "GPTBot", "definition": "Crawls content that may be used to train OpenAI's models"}, {"term": "Claude-SearchBot", "definition": "Analyzes content to improve Claude's search responses"}, {"term": "Perplexity-User", "definition": "Visits a page because someone asked Perplexity a question"}, {"term": "OAI-AdsBot", "definition": "Only visits pages submitted as ads on ChatGPT"}], "explanation": "Training, search, user-triggered and ads: each job has its own token, and each token is a separate switch in robots.txt."},
          term: "Three jobs, three kinds of bot",
          summary: "Training crawlers, search crawlers and user-triggered fetchers each get their own user-agent token.",
          explanation:
            "The Gate introduced these bots. Here is the full set you will write rules for, grouped by the job each vendor says it does:\n\n- **Training.** OpenAI's `GPTBot` crawls content \"that may be used in training our generative AI foundation models\". Anthropic's `ClaudeBot` collects content \"that could potentially contribute to their training\".\n- **Search.** `OAI-SearchBot` surfaces sites in ChatGPT's search features. `Claude-SearchBot` analyzes content \"to enhance the relevance and accuracy of search responses\". `PerplexityBot` surfaces and links sites in Perplexity's results, and Perplexity says \"It is not used to crawl content for AI foundation models.\"\n- **User-triggered.** `ChatGPT-User`, `Claude-User` and `Perplexity-User` visit a page because someone asked a question that needs it.\n\nOpenAI also runs `OAI-AdsBot`, which \"only visits pages submitted as ads\" on ChatGPT. Google and Apple split the jobs differently: their search crawlers also gather the content, and a separate control token (`Google-Extended`, `Applebot-Extended`) carries the training choice. The next cards cover both.",
          whyItMatters:
            "Each token is a separate switch. OpenAI says \"Each setting is independent of the others\", and Perplexity says \"Each setting works independently\". You can say no to training and yes to search in the same file, but only if you name the right tokens.",
          example: {
            kind: "code",
            language: "text",
            caption: "Robots.txt tokens by job, as each vendor documents them (November 2026)",
            code: "Job               OpenAI          Anthropic          Perplexity\nTraining          GPTBot          ClaudeBot          (none listed)\nSearch            OAI-SearchBot   Claude-SearchBot   PerplexityBot\nUser-triggered    ChatGPT-User    Claude-User        Perplexity-User",
          },
          pitfall:
            "Copying a list of \"AI bots\" from a blog post. Lists go stale and often mix jobs. Check each token against the vendor's own page before you add it to a rule.",
          sources: [OPENAI_CRAWLERS, ANTHROPIC_CRAWLERS, PERPLEXITY_CRAWLERS],
        },
        {
          id: "c-user-fetchers",
          quiz: {"kind": "choice", "id": "cq-user-fetchers", "prompt": "Which of these does its vendor say honors robots.txt directives?", "options": ["Claude-User", "ChatGPT-User", "Perplexity-User", "Google's user-triggered fetchers"], "answer": 0, "explanation": "Anthropic says all of its bots, Claude-User included, honor robots.txt. OpenAI says robots.txt rules may not apply to ChatGPT-User, and Perplexity and Google say their user-triggered fetchers generally ignore them."},
          term: "User-triggered fetchers and agents play by different rules",
          summary: "Vendors do not all say the same thing about whether visits a user started obey robots.txt.",
          explanation:
            "Read each vendor's wording, because it differs:\n\n- **OpenAI** on ChatGPT-User: \"Because these actions are initiated by a user, robots.txt rules may not apply.\"\n- **Perplexity** on Perplexity-User: \"Since a user requested the fetch, this fetcher generally ignores robots.txt rules.\"\n- **Google** on its user-triggered fetchers: \"Because the fetch was requested by a user, these fetchers generally ignore robots.txt rules.\"\n- **Anthropic** covers all three of its bots, Claude-User included: \"Anthropic's Bots respect “do not crawl” signals by honoring industry standard directives in robots.txt.\"\n\nA newer kind of visitor drives a whole browser. Google lists `Google-Agent` among its user-triggered fetchers: it \"is used by agents hosted on Google infrastructure to navigate the web and perform actions upon user request\". Anthropic's hosted browsers add a `Claude-Agent` token, and Anthropic says \"Agentic browser use is different from Anthropic's robots\". Its article identifies Claude-Agent by that token and a published IP list, not by a robots.txt rule.",
          whyItMatters:
            "A Disallow for ChatGPT-User, Perplexity-User or a Google user-triggered fetcher is not a dependable way to stop those visits, and it is the wrong switch for search visibility anyway. A Disallow for Claude-User is honored, and Anthropic warns it \"may reduce your site's visibility for user-directed web search\". Browser agents are a firewall question, covered in the last group.",
          pitfall:
            "Blocking ChatGPT-User to leave ChatGPT search, or allowing it to get in. OpenAI says ChatGPT-User \"is not used to determine whether content may appear in Search\", and to use OAI-SearchBot in robots.txt \"for managing Search opt outs and automatic crawl\".",
          sources: [OPENAI_CRAWLERS, PERPLEXITY_CRAWLERS, GOOGLE_USER_FETCHERS, ANTHROPIC_CRAWLERS, CLAUDE_AGENT],
        },
        {
          id: "c-product-token",
          quiz: {"kind": "choice", "id": "cq-product-token", "prompt": "Which robots.txt token controls whether your pages can appear in Google's AI Overviews and AI Mode?", "options": ["Googlebot", "Google-Extended", "Google-Agent", "There is no robots.txt control for it"], "answer": 0, "explanation": "Google says AI is integral to how Search functions, so robots.txt rules for Googlebot are the control. Google-Extended covers Gemini training and grounding, not Search."},
          term: "A product token is not always a crawler",
          summary: "Google-Extended is a name you write rules for, but no bot visits under that name.",
          explanation:
            "RFC 9309 calls the name a crawler matches in robots.txt its **product token**. Usually the token also appears in the bot's User-Agent header. `Google-Extended` is the exception: Google says it \"doesn't have a separate HTTP request user agent string. Crawling is done with existing Google user agent strings; the robots.txt user-agent token is used in a control capacity.\"\n\nWhat it controls, in Google's words, is \"whether content Google crawls from their sites may be used for training future generations of Gemini models\" and for grounding in Gemini Apps and Grounding with Google Search on Vertex AI. Google adds that it \"does not impact a site's inclusion in Google Search nor is it used as a ranking signal in Google Search\".\n\nFor AI Overviews and AI Mode, the switch is Googlebot. Google's AI features guide says AI is \"integral to how Search functions\", which is why robots.txt rules for Googlebot are the control for Search.",
          whyItMatters:
            "Disallowing Google-Extended is a training and Gemini-grounding decision. It is not a way to leave, or to join, AI Overviews.",
          example: {
            kind: "code",
            language: "robots",
            caption: "Opting out of Gemini training and grounding while staying crawlable for Google Search",
            code: "User-agent: Google-Extended\nDisallow: /\n\nUser-agent: *\nDisallow: /checkout/",
          },
          pitfall:
            "Searching your access logs for \"Google-Extended\" to see whether Google respects the rule. It will never appear there, because the crawling is done by Google's existing user agents.",
          sources: [GOOGLE_COMMON_CRAWLERS, GOOGLE_AI_FEATURES, RFC_9309],
        },
        {
          id: "c-apple",
          quiz: {"kind": "spot", "id": "cq-apple", "prompt": "Goal: keep your content out of Apple's model training but stay in Siri, Spotlight and Safari. Which line is wrong?", "language": "robots", "lines": ["User-agent: Applebot", "Disallow: /", "User-agent: *", "Disallow: /checkout/"], "answer": 0, "explanation": "Disallowing Applebot takes you out of Apple's search features too. Apple's training opt-out is a Disallow for Applebot-Extended, which leaves Applebot free to crawl."},
          term: "Apple's two switches: Applebot-Extended and nosnippet",
          summary: "Applebot feeds Siri, Spotlight and Safari. A separate token and a meta tag control how Apple's AI uses your pages.",
          explanation:
            "Applebot is Apple's crawler. Apple says enabling it in robots.txt \"allows website content to appear in search results for Apple users around the world\" in Spotlight, Siri and Safari. Apple then gives you two separate AI controls:\n\n- **Training.** \"Web publishers can opt-out from having their content used to train generative foundation models by disallowing Applebot-Extended in the robots.txt file.\"\n- **AI answers.** Applebot data can also be used when AI models generate answers, such as broad world-knowledge questions in Siri and Search. \"Web publishers can opt out of their content being used in these broad world knowledge answers by applying the nosnippet meta tag to specific content.\"\n\nWith both in place, Apple says \"Your content will remain discoverable through Spotlight, Siri, and Safari\".\n\nTwo rules catch people out. \"If robots instructions don't mention Applebot but mention Googlebot, the Apple robot will follow Googlebot instructions.\" And \"Applebot does not follow crawl-delay.\"",
          whyItMatters:
            "A Googlebot group you wrote for Google alone can quietly govern Apple's crawler as well. If you want Applebot treated differently, give it a group of its own.",
          example: {
            kind: "code",
            language: "robots",
            caption: "Applebot-Extended is opted out of training. Applebot has no group, so it follows the Googlebot group, not the * group",
            code: "User-agent: Applebot-Extended\nDisallow: /\n\nUser-agent: Googlebot\nDisallow: /internal-search/\n\nUser-agent: *\nDisallow: /checkout/",
          },
          pitfall:
            "Disallowing Applebot to stop Apple's AI training. That also removes you from Apple's search features. Applebot-Extended is the training switch, and nosnippet is the switch for AI-generated answers.",
          sources: [APPLEBOT],
        },
        {
          id: "c-ccbot",
          quiz: {"kind": "choice", "id": "cq-ccbot", "prompt": "Why does it matter that Common Crawl's archive is open?", "options": ["Anyone who downloads it can use a page that is in it", "Only Common Crawl's own search engine can read it", "Pages in it are automatically indexed by Google", "It only stores pages that allow JavaScript"], "answer": 0, "explanation": "Common Crawl builds an open repository that anyone can access and analyze, so a page in the archive is available to anyone who downloads it. CCBot is the token to disallow to stay out of future crawls."},
          term: "Common Crawl's CCBot",
          summary: "A non-profit crawler that builds an open archive of the web anyone can download.",
          explanation:
            "Common Crawl describes itself as a non-profit producing \"an open repository of web crawl data that is universally accessible and analyzable by anyone\". Its crawler identifies as `CCBot/2.0 (https://commoncrawl.org/faq/)`, and its robots.txt token is `CCBot`.\n\nIts FAQ says CCBot checks robots.txt first and fetches a page only \"if crawling a page is allowed\". It obeys `Crawl-delay`, uses any sitemap announced in robots.txt, and states that \"Currently, JavaScript is not executed\". Common Crawl also warns it is \"aware of crawlers falsely identifying themselves as CCBot\" and publishes its IP ranges so you can check.",
          whyItMatters:
            "Because the archive is open to anyone, a page in it is available to anyone who downloads it. If you want to stay out of future crawls, `CCBot` is the token to disallow.",
          example: {
            kind: "code",
            language: "robots",
            caption: "Common Crawl's own opt-out rule",
            code: "User-agent: CCBot\nDisallow: /",
          },
          pitfall:
            "Treating every request that says CCBot as the real one. Common Crawl recommends verifying the user-agent string, and offers reverse DNS under crawl.commoncrawl.org for that.",
          sources: [CCBOT, CCBOT_FAQ],
        },
      ],
      check: [
        {
          kind: "choice",
          id: "q-g1-extended-logs",
          prompt:
            "You added a Disallow for Google-Extended a month ago. Your developer searched the access logs and found no requests from Google-Extended at all. What does that tell you?",
          options: [
            "Nothing either way: Google-Extended has no user-agent string of its own, so it never appears in logs",
            "Google is ignoring your rule",
            "Your rule worked, because Google-Extended stopped visiting",
            "Google-Extended only visits sites that have published an llms.txt file",
          ],
          answer: 0,
          explanation:
            "Google says Google-Extended \"doesn't have a separate HTTP request user agent string\". Crawling is done by Google's existing user agents, and the token only controls how the content may be used. Logs cannot confirm or deny it.",
        },
        {
          kind: "match",
          id: "q-g1-fetchers",
          prompt: "Match each token to what its vendor says about robots.txt.",
          pairs: [
            { term: "ChatGPT-User", definition: "Because a user started the action, robots.txt rules may not apply" },
            { term: "Perplexity-User", definition: "Generally ignores robots.txt rules, since a user requested the fetch" },
            { term: "Claude-User", definition: "Honors robots.txt directives, like its vendor's other bots" },
            { term: "Google-Extended", definition: "A control token only: crawling uses Google's existing user agents" },
          ],
          explanation:
            "Three vendors, three different answers for user-triggered fetchers, and one token that is not a fetcher at all. Read the vendor's page for each token rather than assuming they all behave alike.",
        },
        {
          kind: "choice",
          id: "q-g1-apple",
          prompt:
            "Your robots.txt has a Googlebot group with \"Disallow: /staging/\" and a * group with \"Disallow: /checkout/\". There is no Applebot group. According to Apple, which rules does Applebot follow?",
          options: [
            "The Googlebot group, so /staging/ is off-limits but /checkout/ is not",
            "The * group, like any crawler without a group of its own",
            "Both groups combined",
            "None: Applebot only reads rules addressed to Applebot-Extended",
          ],
          answer: 0,
          explanation:
            "Apple says that if robots instructions don't mention Applebot but mention Googlebot, Applebot follows the Googlebot instructions. To keep Applebot out of /checkout/, give it a group of its own or add the rule to the Googlebot group.",
        },
      ],
    },
    {
      id: "g-robots",
      title: "robots.txt done right",
      concepts: [
        {
          id: "c-groups",
          quiz: {"kind": "choice", "id": "cq-groups", "prompt": "Your file has a * group and a separate group that names PerplexityBot. Which rules does PerplexityBot obey?", "options": ["Only the rules in its own group", "The * rules plus its own group's rules", "Only the * rules", "Whichever group comes first in the file"], "answer": 0, "explanation": "A crawler falls back to * only if no group names it. Google says specific and global groups are not combined, and the order of groups is irrelevant."},
          term: "Groups, and how a bot finds its own",
          summary: "A bot obeys one group: the one that names it, or the * group if none does.",
          explanation:
            "RFC 9309 defines a **group** as \"One or more user-agent lines that are followed by one or more rules\". The group ends at the next user-agent line that comes after its rules, or at the end of the file. So several bots can share one set of rules by stacking their user-agent lines.\n\nTo find its group, a crawler matches its product token, and \"Crawlers MUST use case-insensitive matching\". If two groups name the same token, their rules \"MUST be combined into one group\". Only \"If no matching group exists\" does the crawler fall back to the `User-agent: *` group.\n\nGoogle spells out the consequence: \"User agent specific groups and global groups (*) are not combined.\" Once a bot has a group of its own, the rules under `*` no longer apply to it. Google also says the order of groups in the file \"is irrelevant\".",
          whyItMatters:
            "This is where most self-inflicted damage happens. Add a group for one bot, and that bot stops seeing every rule you wrote for `*`. The file also covers only its own host: Google says \"A robots.txt on a subdomain is only valid for that subdomain\", and Anthropic asks you to set rules \"for every subdomain that you wish to opt out from\".",
          example: {
            kind: "code",
            language: "robots",
            caption: "PerplexityBot has its own group, so the * rule for /checkout/ no longer applies to it",
            code: "User-agent: *\nDisallow: /checkout/\n\nUser-agent: PerplexityBot\nAllow: /",
          },
          pitfall:
            "Writing a friendly `Allow: /` group for a search crawler and assuming your `*` rules still protect checkout, account and search-results pages. Repeat any rule the bot still needs inside its own group.",
          sources: [RFC_9309, GOOGLE_ROBOTS_SPEC, ANTHROPIC_CRAWLERS],
        },
        {
          id: "c-precedence",
          quiz: {"kind": "blank", "id": "cq-precedence", "prompt": "Complete the matching rules.", "text": "Within a group, the rule with the ___ matching path wins. If an allow rule and a disallow rule are equivalent, the ___ rule should be used.", "answers": ["longest", "allow"], "distractors": ["shortest", "disallow", "first"], "explanation": "RFC 9309 says the most specific match, the one with the most octets, must be used, and an allow rule should win a tie. Google says it uses the least restrictive rule."},
          term: "Allow vs Disallow: the longest match wins",
          summary: "Within a group, the rule with the longest matching path applies; a tie goes to Allow.",
          explanation:
            "RFC 9309: \"The most specific match found MUST be used. The most specific match is the match that has the most octets.\" An octet is a byte, so in practice the longer matching path wins. On a tie: \"If an “allow” rule and a “disallow” rule are equivalent, then the “allow” rule SHOULD be used.\" Google says the same: \"In case of conflicting rules, including those with wildcards, Google uses the least restrictive rule.\"\n\nThree details trip people up:\n\n- **Paths are case-sensitive.** In Google's examples, a rule for `/fish` does not match `/Fish.asp`. The user-agent value is not case-sensitive.\n- **Wildcards.** `*` matches 0 or more characters, and `$` marks the end of the URL.\n- **An empty rule does nothing.** Google: \"Crawlers ignore the rule without a path.\"",
          whyItMatters:
            "You can open one section to a bot and close the rest without listing every URL. You can also close the whole site by accident with a rule you thought was narrow.",
          example: {
            kind: "code",
            language: "robots",
            caption: "Only /guides/ is open to Claude-SearchBot: /guides/compost is allowed, /shop/ is not",
            code: "User-agent: Claude-SearchBot\nAllow: /guides/\nDisallow: /",
          },
          pitfall:
            "Writing `Disallow: /Checkout/` when the real path is `/checkout/`. The rule is valid, matches nothing, and blocks nothing.",
          sources: [RFC_9309, GOOGLE_ROBOTS_SPEC],
        },
        {
          id: "c-crawl-not-index",
          quiz: {"kind": "choice", "id": "cq-crawl-not-index", "prompt": "You want a page kept out of Google entirely. Which approach does Google recommend?", "options": ["noindex on a page Google can crawl, or password protection", "A Disallow line for the page in robots.txt", "Removing the page from your XML sitemap", "Adding the path to llms.txt"], "answer": 0, "explanation": "Google says robots.txt is not a mechanism for keeping a page out of Google, and a disallowed URL can still be indexed if it is linked elsewhere. noindex or a password keeps it out."},
          term: "robots.txt controls crawling, not indexing",
          summary: "A Disallow stops the fetch. It does not keep the URL out of an index, and it does not lock anything.",
          explanation:
            "Google is direct about it: robots.txt \"is not a mechanism for keeping a web page out of Google. To keep a web page out of Google, block indexing with noindex or password-protect the page.\" Google may still \"index the URL and show it in search results without a snippet\" if the URL is linked from elsewhere.\n\nRFC 9309 adds two warnings. The rules \"are not a form of access authorization\", and \"Listing paths in the robots.txt file exposes them publicly and thus makes the paths discoverable.\"",
          whyItMatters:
            "Use each tool for its job. robots.txt manages which bots fetch what. noindex manages what Google indexes. Passwords keep people and bots out of private pages.",
          pitfall:
            "Adding `Disallow: /private-offers/` to hide a page. Anyone can read your robots.txt, so you have just published the path. A crawler that obeys the Disallow also never fetches the page, so it never sees a noindex tag on it.",
          sources: [GOOGLE_ROBOTS_INTRO, GOOGLE_ROBOTS_SPEC, RFC_9309],
        },
        {
          id: "c-token-scope",
          quiz: {"kind": "match", "id": "cq-token-scope", "prompt": "Match each Disallow to what its vendor says it does.", "pairs": [{"term": "GPTBot", "definition": "Content should not be used to train generative AI foundation models"}, {"term": "OAI-SearchBot", "definition": "Not shown in ChatGPT search answers, though navigational links may still appear"}, {"term": "ClaudeBot", "definition": "Future materials excluded from AI model training datasets"}, {"term": "Claude-SearchBot", "definition": "Content not indexed for search optimization"}], "explanation": "Two of these are training opt-outs and two are search opt-outs. Read the vendor's definition of each token, not just its name."},
          term: "What each token does and does not control",
          summary: "Each vendor defines what a Disallow for its token means. Read the definition, not the name.",
          explanation:
            "Here is what each vendor says a block does:\n\n- `GPTBot`: \"Disallowing GPTBot indicates a site's content should not be used in training generative AI foundation models.\"\n- `OAI-SearchBot`: opted-out sites \"will not be shown in ChatGPT search answers, though can still appear as navigational links\".\n- `ClaudeBot`: a block \"signals that the site's future materials should be excluded from our AI model training datasets\".\n- `Claude-SearchBot`: a block \"prevents our system from indexing your content for search optimization\".\n- `Google-Extended`: Gemini training and grounding only, not Google Search.\n- `Applebot-Extended`: Apple's generative model training only. Applebot keeps crawling for Apple's search features.\n\nChanges take time. OpenAI says it \"can take ~24 hours\" for search results to adjust, Perplexity says \"up to 24 hours\", and Google says it \"generally caches the contents of robots.txt file for up to 24 hours\".\n\n`Crawl-delay` is not universal either. Anthropic and Common Crawl support it. Google lists it among fields that \"aren't supported\", and Apple says \"Applebot does not follow crawl-delay.\"",
          whyItMatters:
            "A training opt-out is a statement about future use, in the vendor's own words. A search opt-out removes you from that engine's answers. Treat them as two separate decisions.",
          pitfall:
            "Expecting a change to show up the next morning in every engine, or reading Anthropic's \"future materials\" as removal of content it has already collected. Write down the date of each robots.txt change so you can compare against your logs later.",
          sources: [OPENAI_CRAWLERS, ANTHROPIC_CRAWLERS, PERPLEXITY_CRAWLERS, GOOGLE_COMMON_CRAWLERS, GOOGLE_ROBOTS_SPEC, CCBOT_FAQ, APPLEBOT],
        },
        {
          id: "c-training-signal",
          quiz: {"kind": "choice", "id": "cq-training-signal", "prompt": "Your file has a User-agent: * group with Disallow: /staging/, and no __usage_ai-training group. Under the draft, what training preference have you expressed?", "options": ["None: the * group must not be read as matching the policy token", "A preference against training on /staging/", "A preference against training on the whole site", "A preference in favor of training everywhere"], "answer": 0, "explanation": "The draft says wildcard groups must not be interpreted as matching the policy token, and if no group names it, no preference has been expressed."},
          term: "A shared \"no AI training\" signal",
          summary: "A draft robots.txt token, __usage_ai-training, states one training preference for every vendor that reads it.",
          explanation:
            "So far each vendor has needed its own training token: GPTBot, ClaudeBot, Google-Extended, Applebot-Extended. An individual Internet-Draft published on 30 October 2026, written by an Anthropic author and discussed in the IETF's AI Preferences working group, proposes one cross-vendor **policy token**, `__usage_ai-training`, written as an ordinary robots.txt group. The draft \"introduces no new directive names and no new grammar\".\n\nTwo rules matter most:\n\n- \"wildcard groups (i.e., User-Agent: *) MUST NOT be interpreted as matching the policy token\". Your `*` group says nothing about training. If no group names the token, \"then no preference has been expressed\".\n- \"This policy token is not a directive for crawling behavior.\" It states a preference about use. Crawling is still governed by each crawler's own group.\n\nWho reads it: Anthropic says that as of October 30, 2026 it \"has begun recognizing a machine-readable signal that lets website owners express a preference about whether their content may be used to train AI models\", rolling out over time. Google says it \"intends to support the AIPREF shared machine-readable training preference signal\" in early 2027. OpenAI's and Perplexity's crawler pages do not mention it.",
          whyItMatters:
            "It is one group to add, and it does not change who can crawl. Vendor-specific groups still win where you have them: Anthropic says \"If your robots.txt file names ClaudeBot, we follow that rule, even if your general setting says something different\".",
          example: {
            kind: "code",
            language: "robots",
            caption: "The draft's own example: a preference against AI training everywhere except /press-kit/",
            code: "User-Agent: __usage_ai-training\nDisallow: /\nAllow: /press-kit/",
          },
          pitfall:
            "Treating it as a finished standard, or as a block. It is a draft, and Anthropic says \"Because standards in this space are still evolving, the way we read and apply these settings may change too.\" Keep the vendor training tokens you already use.",
          sources: [AIPREF_DRAFT, ANTHROPIC_CRAWLERS, GOOGLE_COMMON_CRAWLERS],
        },
      ],
      check: [
        {
          kind: "choice",
          id: "q-g2-override",
          prompt:
            "Your file has a group \"User-agent: *\" with \"Disallow: /checkout/\", and below it a group \"User-agent: OAI-SearchBot\" with \"Allow: /\". Under RFC 9309, may OAI-SearchBot crawl /checkout/basket?",
          options: [
            "Yes. It has a group of its own, so it ignores the * group, and its own group allows everything",
            "No. The * group applies to every bot as well as any specific group",
            "No. Disallow always beats Allow",
            "Only if the OAI-SearchBot group comes first in the file",
          ],
          answer: 0,
          explanation:
            "A crawler falls back to the * group only if no group matches its token. OAI-SearchBot has its own group, and Google confirms specific and global groups are not combined. Group order does not matter.",
        },
        {
          kind: "choice",
          id: "q-g2-longest",
          prompt:
            "A group for PerplexityBot contains \"Allow: /guides/\" and \"Disallow: /\". Under RFC 9309, may PerplexityBot crawl /guides/heat-pumps?",
          options: [
            "Yes. \"/guides/\" is the longer matching path, so it is the most specific match",
            "No. \"Disallow: /\" blocks the whole site whatever else the group says",
            "No. The rule written last wins",
            "Yes, but only because PerplexityBot ignores robots.txt",
          ],
          answer: 0,
          explanation:
            "Both rules match the URL, and the one with more octets wins. \"/guides/\" is longer than \"/\", so the Allow applies. It is Perplexity-User, not PerplexityBot, that Perplexity says generally ignores robots.txt.",
        },
        {
          kind: "blank",
          id: "q-g2-blank",
          prompt: "Complete Google's guidance.",
          text: "A Disallow stops a page being ___, but Google may still ___ the URL if other pages link to it. To keep a page out of Google, use ___ or password protection.",
          answers: ["crawled", "index", "noindex"],
          distractors: ["ranked", "nofollow", "render"],
          explanation:
            "robots.txt manages crawling. Google says a disallowed URL can still be indexed, shown without a snippet, if it is linked from elsewhere. noindex (on a page the crawler can fetch) or a password keeps it out.",
        },
      ],
    },
    {
      id: "g-discovery",
      title: "Rendering and discovery",
      concepts: [
        {
          id: "c-js-rendering",
          quiz: {"kind": "passage", "id": "cq-js-rendering", "prompt": "Which raw HTML response gives a crawler that does not run JavaScript the delivery terms?", "passages": ["<div id=\"app\"></div><script src=\"/bundle.js\"></script>", "<h1>Fernhill compost bin</h1><p>Free UK delivery on orders over £50.</p><script src=\"/bundle.js\"></script>"], "answer": 1, "explanation": "The first response is empty until bundle.js runs, so a bot that does not execute JavaScript sees nothing. The second sends the text in the HTML. (Fernhill is made up.)"},
          term: "Content that needs JavaScript to appear",
          summary: "Google and Apple say they can render JavaScript. A 2024 study found that the major AI crawlers it measured did not.",
          explanation:
            "Google documents its own process: it handles JavaScript pages in \"three main phases\", crawling, rendering and indexing. It still adds that \"server-side or pre-rendering is still a great idea because it makes your website faster for users and crawlers, and not all bots can run JavaScript.\"\n\nFor other crawlers, there are three kinds of evidence:\n\n- **Vendor statements.** Common Crawl says of CCBot: \"Currently, JavaScript is not executed\". Apple says \"Applebot may render the content of your website within a browser\", but may not render the page properly if scripts, CSS and other resources are blocked in robots.txt.\n- **A published study.** In December 2024, Vercel and MERJ analyzed crawler traffic on nextjs.org and the Vercel network. They reported that \"none of the major AI crawlers currently render JavaScript\", naming OpenAI's OAI-SearchBot, ChatGPT-User and GPTBot, Anthropic's ClaudeBot and PerplexityBot among others. They found Gemini uses Googlebot's infrastructure and renders fully.\n- **Silence.** OpenAI's, Anthropic's and Perplexity's crawler pages, checked in November 2026, do not say whether their bots render JavaScript. Claude-SearchBot and Claude-User were not in the study's list.",
          whyItMatters:
            "If your prices, product details or answers only appear after JavaScript runs, some bots that are allowed in may still see an empty page. Server-rendered HTML is the safe default, because a crawler does not need to run JavaScript to read it.",
          example: {
            kind: "before-after",
            before:
              "<div id=\"app\"></div>\n<script src=\"/bundle.js\"></script>",
            after:
              "<h1>Fernhill compost bin, 330 liters</h1>\n<p>£45. Free UK delivery on orders over £50.</p>\n<script src=\"/bundle.js\"></script>",
            note: "The HTML each page sends before any JavaScript runs (Fernhill is made up). A crawler that does not execute JavaScript sees nothing in the first version, and the product, price and delivery terms in the second.",
          },
          pitfall:
            "Checking the page in your own browser and deciding it is fine. Your browser runs JavaScript. Look at the raw HTML your server returns, with View Source or curl, to see what a non-rendering bot gets. And do not block your script files in robots.txt: Google says it \"won't render JavaScript from blocked files or on blocked pages\".",
          sources: [GOOGLE_JS_SEO, CCBOT_FAQ, APPLEBOT, VERCEL_AI_CRAWLERS],
        },
        {
          id: "c-sitemaps",
          quiz: {"kind": "choice", "id": "cq-sitemaps", "prompt": "Where in robots.txt should the Sitemap line go?", "options": ["Anywhere: it is independent of the user-agent lines", "Inside the * group only", "At the very top, before any group", "In a group of its own named Sitemap"], "answer": 0, "explanation": "sitemaps.org says the Sitemap directive is independent of the user-agent line, so it doesn't matter where you place it in the file."},
          term: "XML sitemaps",
          summary: "A list of the URLs you want crawled, with hints such as the last-modified date.",
          explanation:
            "sitemaps.org describes a sitemap as \"an XML file that lists URLs for a site along with additional metadata about each URL\". The format is simple: a `<urlset>`, a `<url>` for each page, and a required `<loc>`. `<lastmod>` uses W3C Datetime, which can be just YYYY-MM-DD.\n\nEach file can hold \"no more than 50,000 URLs and must be no larger than 50MB (52,428,800 bytes)\". Bigger sites split into several files and list them in a sitemap index.\n\nYou can announce a sitemap in robots.txt with a full URL. sitemaps.org says \"This directive is independent of the user-agent line, so it doesn't matter where you place it in your file.\" Common Crawl says CCBot \"utilizes any Sitemap announced in the robots.txt file\".",
          whyItMatters:
            "sitemaps.org says crawlers \"usually discover pages from links\". A sitemap supplements that, so crawlers that support sitemaps can \"pick up all URLs in the Sitemap\", including pages your internal links reach poorly.",
          example: {
            kind: "code",
            language: "robots",
            caption: "A sitemap line can sit anywhere in robots.txt",
            code: "User-agent: *\nDisallow: /checkout/\n\nSitemap: https://www.fernhill.example/sitemap.xml",
          },
          pitfall:
            "Treating a sitemap as a request to be indexed. sitemaps.org says it \"does not guarantee that web pages are included in search engines\", and `changefreq` is \"a hint and not a command\".",
          sources: [SITEMAPS_HOME, SITEMAPS_PROTOCOL, CCBOT_FAQ],
        },
        {
          id: "c-indexnow",
          quiz: {"kind": "choice", "id": "cq-indexnow", "prompt": "Your IndexNow ping returns HTTP 200. What does that tell you?", "options": ["The engine received your URL, nothing more", "The URL is now indexed by every participating engine", "Google has recrawled the page", "The page will be cited in AI answers"], "answer": 0, "explanation": "IndexNow's docs say a 200 only indicates that the engine received the URL, and the FAQ says IndexNow doesn't guarantee indexing. Google is not on the list of participants."},
          term: "IndexNow",
          summary: "A ping that tells participating engines a URL was added, updated or deleted.",
          explanation:
            "Instead of waiting for a crawler to come back, you send the changed URL to an engine's `/indexnow` endpoint with a key. You prove you own the site by hosting \"a UTF-8 encoded text key file {your-key}.txt\" at the root. A single POST can carry \"up to 10,000 URLs\".\n\nEngines that adopt the protocol \"agree that submitted URLs will be automatically shared with all other participating search engines\", so one ping reaches all of them. IndexNow's list of participants, checked in November 2026, names Bing, Yandex, Seznam, Naver, Yep, the Internet Archive and Amazonbot. Google is not on it.",
          whyItMatters:
            "When a price, stock level or policy changes, you can tell the engines on that list straight away instead of waiting for their next visit.",
          example: {
            kind: "code",
            language: "http",
            caption: "The single-URL format from the IndexNow docs (placeholders in angle brackets)",
            code: "GET https://<searchengine>/indexnow?url=https://www.fernhill.example/compost-bin&key=<your-key>",
          },
          pitfall:
            "Reading an HTTP 200 as \"indexed\". The docs say a 200 \"only indicates that the search engine has received your URL\", and the FAQ says IndexNow \"doesn't guarantee indexing\".",
          sources: [INDEXNOW_DOCS, INDEXNOW_FAQ, INDEXNOW_ENGINES],
        },
        {
          id: "c-llms-txt",
          quiz: {"kind": "choice", "id": "cq-llms-txt", "prompt": "What does Google's guide say publishing an llms.txt file does for your Google Search visibility?", "options": ["Neither harms nor helps it, because Google Search ignores the file", "Helps your pages appear in AI Overviews", "Is required for AI Mode", "Replaces your robots.txt rules for Google"], "answer": 0, "explanation": "Google says it's fine to keep llms.txt for other services, but doing so will neither harm nor help your visibility or rankings in Google Search, as Google Search ignores it."},
          term: "llms.txt, a proposal",
          summary: "A suggested markdown file that gives AI agents a short guided tour of your site. Google Search ignores it.",
          explanation:
            "llms.txt is a proposal from Jeremy Howard, first published in September 2024 and last modified, as v2, in August 2026: \"We propose adding a /llms.txt markdown file to websites to provide LLM-friendly content.\" The file sits at `/llms.txt` or under a path such as `/docs/llms.txt`. The only required part is an H1 with the site or project name. A blockquote summary and H2 lists of links can follow.\n\nThe proposal says the file is \"used on demand, when an agent needs information about a topic while assisting a user\", and that it is used most heavily for software documentation. It notes that \"The AI labs themselves publish llms.txt files for their own developer docs\". It also says \"robots.txt and llms.txt have different purposes\": llms.txt does not grant or refuse access.\n\nGoogle's guide to generative AI features lists llms.txt among things \"you can ignore for Google Search\", because \"Google Search itself doesn't use them\". It adds: \"It's completely fine if you decide to create and maintain LLMS.txt files (or other similar files) for other services or systems that use these files.\" None of the crawler pages from OpenAI, Anthropic or Perplexity used in this lesson say their bots read llms.txt.",
          whyItMatters:
            "Google is explicit that the file will \"neither harm nor help your site's visibility or rankings in Google Search\". Publish one if agents you care about use it, such as coding agents reading your documentation. Do not expect it to change whether you are crawled, indexed or cited.",
          example: {
            kind: "code",
            language: "markdown",
            caption: "A minimal llms.txt in the proposed format (Fernhill is made up)",
            code: "# Fernhill Garden Supply\n\n> UK garden supplies shop. Prices include VAT. Delivery is free on orders over £50.\n\n## Help\n\n- [Delivery and returns](https://www.fernhill.example/help/delivery.md): times, costs and the 30-day returns policy",
          },
          pitfall:
            "Putting llms.txt ahead of the basics. A crawler that is blocked by robots.txt or your CDN, or that cannot see content rendered by JavaScript, gains nothing from a well-written llms.txt.",
          sources: [LLMS_TXT, GOOGLE_AI_GUIDE],
        },
      ],
      check: [
        {
          kind: "choice",
          id: "q-g3-raw-html",
          prompt:
            "Your product pages are built in the browser with JavaScript. They look perfect in Chrome. What is the best way to check what a non-rendering crawler such as CCBot receives?",
          options: [
            "Look at the raw HTML the server returns, with View Source or curl, before any JavaScript runs",
            "Take a screenshot of the page in Chrome",
            "Add the pages to your XML sitemap",
            "Publish an llms.txt file that lists the pages",
          ],
          answer: 0,
          explanation:
            "Chrome runs your JavaScript, so it shows what a rendering crawler sees. Common Crawl says CCBot does not execute JavaScript, so it gets only the HTML the server sends. A sitemap or llms.txt does not change what is in that HTML.",
        },
        {
          kind: "choice",
          id: "q-g3-llms",
          prompt: "Which description of llms.txt is accurate, based on the sources in this lesson?",
          options: [
            "A proposed markdown file that gives agents a curated guide to a site. It does not control crawling",
            "An IETF standard that replaces robots.txt for AI crawlers",
            "A file Google requires before a page can appear in AI Overviews",
            "Part of the sitemaps.org protocol",
          ],
          answer: 0,
          explanation:
            "llmstxt.org presents it as a proposal and says it has a different purpose from robots.txt. RFC 9309 is the robots.txt standard. Google says Google Search ignores llms.txt files.",
        },
        {
          kind: "blank",
          id: "q-g3-blank",
          prompt: "Complete the sitemap rules from sitemaps.org.",
          text: "Each sitemap file can list no more than ___ URLs. The Sitemap line in robots.txt is independent of the ___ line, so it can go anywhere in the file.",
          answers: ["50,000", "user-agent"],
          distractors: ["10,000", "disallow", "100,000"],
          explanation:
            "sitemaps.org caps each file at 50,000 URLs and 50MB, and says the Sitemap directive is independent of the user-agent line. 10,000 is a different limit: the number of URLs in one IndexNow POST.",
        },
      ],
    },
    {
      id: "g-bouncer",
      title: "The bouncer at the door",
      concepts: [
        {
          id: "c-cdn-blocking",
          quiz: {"kind": "choice", "id": "cq-cdn-blocking", "prompt": "In Cloudflare's current docs, which AI policy covers chat fetch bots and browser-use agents?", "options": ["Agent", "Search", "Training", "None: Cloudflare cannot see them"], "answer": 0, "explanation": "Cloudflare's Agent behavior is automated activity acting in real time on a person's behalf, such as chat fetch bots and browser-use agents. Search and Training are separate policies."},
          term: "CDN and firewall bot rules",
          summary: "Your CDN can turn a bot away before robots.txt ever matters.",
          explanation:
            "robots.txt is a request that well-behaved bots honor. A CDN or web application firewall (WAF) is different: it decides whether the request is served at all. If the CDN blocks a bot, an `Allow` in robots.txt does not help.\n\nCloudflare is one example, and it has changed its settings several times:\n\n- In July 2024 it added a one-click block for AI bots and said: \"It's available for all customers, including those on the free tier.\"\n- In July 2025 it said it was \"changing the default to block AI crawlers unless they pay creators for their content.\"\n- Its docs, updated 2 November 2026, call the feature **AI Crawler and Agent access policies**, with separate actions for **Search**, **Agent** (\"such as chat fetch bots and browser-use agents\") and **Training**. Training includes \"mixed-purpose crawlers that are used both for Training and for Search\". The actions are Block, Block on pages with ads, Allow, and, for Training only, a Disallow written to robots.txt. For new domains, the docs now say \"Search, Agents, and Training use Allow (do not block) by default.\"",
          whyItMatters:
            "The defaults have changed more than once, so do not guess what yours are. If someone else runs your CDN, such as IT, a developer or an agency, ask them. On Cloudflare, a Training block also catches mixed-purpose crawlers, and an Agent block catches chat fetch bots. Your robots.txt will not show either.",
          pitfall:
            "Blocking a vendor's IP addresses instead of using robots.txt. Anthropic warns this \"may not work correctly or persistently guarantee an opt-out\", because it stops its bots reading your robots.txt.",
          sources: [CLOUDFLARE_ONE_CLICK, CLOUDFLARE_DEFAULT_BLOCK, CLOUDFLARE_AI_BOTS_DOCS, ANTHROPIC_CRAWLERS],
        },
        {
          id: "c-waf-allowlist",
          quiz: {"kind": "choice", "id": "cq-waf-allowlist", "prompt": "Which firewall rule follows Perplexity's own advice for letting PerplexityBot through?", "options": ["Skip security rules when the user agent contains PerplexityBot and the IP is in PerplexityBot's published ranges", "Skip security rules for any request whose user agent contains PerplexityBot", "Skip security rules for any IP in either Perplexity file, whatever the user agent", "Add Allow: / for PerplexityBot in robots.txt; the firewall reads it"], "answer": 0, "explanation": "Perplexity's expression pairs each user agent with its own IP ranges. A user-agent check alone lets in anyone who copies the string, and robots.txt never reaches the firewall."},
          term: "Letting verified bots through your firewall",
          summary: "Allow a bot by its user agent and its published IP ranges together, never by user agent alone.",
          explanation:
            "Some vendors ask for this directly. OpenAI recommends allowing OAI-SearchBot in robots.txt \"and allowing requests from our published IP ranges below\". Perplexity says \"If you’re using a Web Application Firewall (WAF) to protect your site, you may need to explicitly allow Perplexity’s bots to ensure they can access your content.\"\n\nPerplexity's Cloudflare recipe shows the pattern: a custom rule that matches the user agent and the IP ranges together, with the action Skip. It warns: \"Each bot has its own IP ranges, so match each User-Agent against its own IP ranges.\" And: \"When the published ranges change, update them in this rule.\"\n\nAnthropic says the same for its hosted browsers: \"These addresses may change over time, so we recommend updating your rules from this file automatically rather than hardcoding them.\"",
          whyItMatters:
            "An allow rule on user agent alone lets in anyone who copies the string. An allow rule on stale IP ranges quietly blocks the real bot once the vendor adds new addresses.",
          example: {
            kind: "code",
            language: "text",
            caption: "Perplexity's Cloudflare WAF expression, with its placeholders. The rule action is Skip",
            code: "(http.user_agent contains \"PerplexityBot\" and ip.src in {<PerplexityBot IP ranges>})\nor (http.user_agent contains \"Perplexity-User\" and ip.src in {<Perplexity-User IP ranges>})",
          },
          pitfall:
            "Copying today's IP ranges into a rule and never touching it again. Pull the vendor's file on a schedule, or use a list you update, as Perplexity and Anthropic both suggest.",
          sources: [OPENAI_CRAWLERS, PERPLEXITY_CRAWLERS, CLAUDE_AGENT],
        },
        {
          id: "c-verify-bots",
          quiz: {"kind": "match", "id": "cq-verify-bots", "prompt": "Match each visitor to how its vendor lets you verify it.", "pairs": [{"term": "ClaudeBot", "definition": "IP list at claude.com/crawling/bots.json"}, {"term": "Claude-Agent", "definition": "IP list at claude.com/.well-known/sail"}, {"term": "Applebot", "definition": "Reverse DNS under applebot.apple.com, or a CIDR file"}, {"term": "GPTBot", "definition": "IP list at openai.com/gptbot.json"}], "explanation": "Each vendor publishes its own method. Anthropic's crawlers and its hosted browsers use different lists, and OpenAI publishes one file per bot."},
          term: "Who publishes what to verify their bots",
          summary: "Every vendor here offers an IP list, reverse DNS, or both. Use theirs, not a third-party list.",
          explanation:
            "A user-agent string is only a claim. Each vendor gives you a way to check it:\n\n- **OpenAI:** one IP file per bot, such as `openai.com/searchbot.json`, `openai.com/gptbot.json` and `openai.com/chatgpt-user.json`.\n- **Perplexity:** `perplexitybot.json` and `perplexity-user.json`.\n- **Anthropic:** `claude.com/crawling/bots.json` for its crawlers. \"If a crawler has a source IP address on this list, it indicates that the crawler is coming from Anthropic.\" Claude-Agent traffic is listed separately, at `claude.com/.well-known/sail`.\n- **Google:** reverse DNS, or JSON files by category, from common crawlers such as Googlebot to user-triggered agents. Google says its common crawlers \"always respect robots.txt rules for automatic crawls\".\n- **Apple:** reverse DNS under `applebot.apple.com`, or a published file of CIDR prefixes.\n- **Common Crawl:** reverse DNS, and its ranges as JSON at `index.commoncrawl.org/ccbot.json`.\n\nGoogle's manual method is the model for reverse DNS: look up the IP's hostname, check its domain, then look that hostname up again and confirm it returns the same IP.",
          whyItMatters:
            "Anthropic puts it plainly: \"Anyone can send the same User-Agent header, so be sure to check that the traffic originated from one of the listed IPs before concluding that it is genuine.\" Without this step, your bot reports count impostors and your firewall lets them in.",
          example: {
            kind: "code",
            language: "text",
            caption: "Google's own example: the reverse lookup and the forward lookup agree",
            code: "host 66.249.66.1\n1.66.249.66.in-addr.arpa domain name pointer crawl-66-249-66-1.googlebot.com.\n\nhost crawl-66-249-66-1.googlebot.com\ncrawl-66-249-66-1.googlebot.com has address 66.249.66.1",
          },
          pitfall:
            "Stopping after the reverse lookup. Whoever controls an IP address can give it any reverse DNS name. The forward lookup is what shows the vendor controls that hostname.",
          sources: [OPENAI_CRAWLERS, PERPLEXITY_CRAWLERS, ANTHROPIC_CRAWLERS, CLAUDE_AGENT, GOOGLE_VERIFY, APPLEBOT, CCBOT],
        },
        {
          id: "c-server-logs",
          quiz: {"kind": "choice", "id": "cq-server-logs", "prompt": "A log line says GPTBot, but the IP is not in OpenAI's published list for GPTBot. How should you count it?", "options": ["As unverified: the user-agent string alone proves nothing", "As OpenAI, because the user agent says GPTBot", "As Googlebot, because it fetched robots.txt", "As a sign your robots.txt is broken"], "answer": 0, "explanation": "Cloudflare notes that user agents are trivial to change. Check the IP against the vendor's list before you count a request as that bot."},
          term: "Check your server logs",
          summary: "Logs show which bots actually reached you, and what status code they got.",
          explanation:
            "Your server or CDN logs record each request's user-agent string and status code. Search them for the tokens in this lesson (`GPTBot`, `OAI-SearchBot`, `ClaudeBot`, `PerplexityBot`, `Applebot` and so on) to see who arrives, which pages they fetch and whether they get a 200. A 403 or 429 on pages you want cited usually points to a CDN or firewall rule.\n\nA user-agent string is only a claim. Cloudflare notes that \"user agents are trivial for bot operators to change\", so check the IPs of the bots that matter against the vendor lists on the previous card before you count them.\n\nOpenAI also says it may add a `robots.txt` marker to the user-agent string when fetching your robots.txt file, which helps you spot those requests.",
          whyItMatters:
            "Logs are the only place you can see whether a robots.txt change or a CDN rule actually changed bot behavior. Lesson 7 builds on this for reporting.",
          example: {
            kind: "code",
            language: "text",
            caption: "Made-up log lines (documentation-only IP addresses), with user-agent strings as OpenAI and Perplexity publish them",
            code: "203.0.113.7 - - [06/Nov/2026:09:14:02 +0000] \"GET /guides/compost HTTP/1.1\" 200 18342 \"-\" \"Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; GPTBot/1.4; +https://openai.com/gptbot\"\n198.51.100.23 - - [06/Nov/2026:09:15:40 +0000] \"GET /compost-bin HTTP/1.1\" 403 512 \"-\" \"Mozilla/5.0 (compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)\"",
          },
          pitfall:
            "Counting every request that says GPTBot as OpenAI. Check the IP against OpenAI's published list first. In the made-up lines above, neither address would pass, because both come from ranges reserved for documentation.",
          sources: [OPENAI_CRAWLERS, PERPLEXITY_CRAWLERS, CLOUDFLARE_ONE_CLICK],
        },
      ],
      check: [
        {
          kind: "choice",
          id: "q-g4-cdn",
          prompt:
            "Your robots.txt allows PerplexityBot everywhere except /checkout/. Your CDN logs show PerplexityBot requests to product pages getting a 403 from a bot rule. Where is the fix?",
          options: [
            "In the CDN or firewall settings, because the block happens there before robots.txt comes into it",
            "In robots.txt: add a second Allow: / line for PerplexityBot",
            "In your XML sitemap: list the product pages",
            "Nowhere: PerplexityBot always ignores 403 responses",
          ],
          answer: 0,
          explanation:
            "robots.txt already allows the pages. The 403 comes from a CDN rule, so the request is refused before your page is served. Ask whoever owns the CDN to review its AI bot settings.",
        },
        {
          kind: "order",
          id: "q-g4-verify",
          prompt: "A request in your logs claims to be Googlebot. Put Google's manual verification steps in order.",
          items: [
            "Run a reverse DNS lookup on the IP address from your logs",
            "Check that the hostname is on googlebot.com, google.com or googleusercontent.com",
            "Run a forward DNS lookup on that hostname",
            "Check that it returns the same IP address as in your logs",
          ],
          explanation:
            "Reverse lookup, check the domain, forward lookup, compare. The last step matters because anyone can set a reverse DNS name on their own IP. The forward lookup proves Google controls that hostname.",
        },
        {
          kind: "choice",
          id: "q-g4-waf",
          prompt:
            "Your developer added a firewall allow rule for ClaudeBot six months ago, using the IP ranges in Anthropic's file at the time. ClaudeBot now gets some 403s. What is the likeliest cause to check first?",
          options: [
            "Anthropic's published addresses have changed, and the hardcoded rule is out of date",
            "ClaudeBot has stopped reading robots.txt",
            "The XML sitemap is too large",
            "ClaudeBot only accepts pages listed in llms.txt",
          ],
          answer: 0,
          explanation:
            "Vendors change their ranges. Anthropic recommends updating rules from its file automatically rather than hardcoding addresses, and Perplexity says to update its rule when the ranges change.",
        },
      ],
    },
  ],

  exercise: {
    id: "x-fix-the-robots",
    title: "Fix the robots.txt",
    brief:
      "Fernhill Garden Supply (made up) has four goals for AI bots: keep its content out of OpenAI, Anthropic and Apple model training; stay visible in ChatGPT search, Claude search, Perplexity and Apple's Siri and Spotlight; keep /checkout/ off-limits to every bot; and make sure its CDN is not undoing any of that. A developer wrote the file below. It is valid, but it misses several goals. Fix the file, then check the CDN.",
    steps: [
      {
        kind: "spot",
        id: "x-step-spot",
        prompt: "Which line puts a search crawler Fernhill wants to keep into the wrong group?",
        language: "robots",
        lines: [
          "User-agent: *",
          "Disallow: /checkout/",
          "User-agent: GPTBot",
          "User-agent: ClaudeBot",
          "User-agent: OAI-SearchBot",
          "Disallow: /",
          "User-agent: PerplexityBot",
          "Allow: /",
        ],
        answer: 4,
        explanation:
          "Stacked user-agent lines form one group, so OAI-SearchBot shares the Disallow: / meant for the training crawlers. OpenAI says sites opted out of OAI-SearchBot will not be shown in ChatGPT search answers. The Disallow: / line itself is right for GPTBot and ClaudeBot.",
      },
      {
        kind: "choice",
        id: "x-step-group",
        prompt: "Which change to that group meets Fernhill's goals for OAI-SearchBot, GPTBot and ClaudeBot?",
        options: [
          "Delete the \"User-agent: OAI-SearchBot\" line, so OAI-SearchBot falls back to the * group",
          "Add \"Allow: /\" under \"Disallow: /\" in the same group",
          "Change \"Disallow: /\" to \"Disallow: /checkout/\"",
          "Move OAI-SearchBot into a new group of its own containing only \"Allow: /\"",
        ],
        answer: 0,
        explanation:
          "With no group of its own, OAI-SearchBot obeys the * group: everything except /checkout/. Adding Allow: / creates a tie, and RFC 9309 says the Allow should win, which lets the training crawlers in too. Changing the Disallow opens the site to GPTBot and ClaudeBot. A group with only Allow: / opens /checkout/ to OAI-SearchBot.",
      },
      {
        kind: "blank",
        id: "x-step-fill",
        prompt:
          "Another problem: PerplexityBot has its own group, so it ignores the * rule for /checkout/. Fill in the fixed file.",
        text: "User-agent: *\nDisallow: /checkout/\n\nUser-agent: GPTBot\nUser-agent: ___\nDisallow: /\n\nUser-agent: PerplexityBot\nDisallow: ___",
        mono: true,
        answers: ["ClaudeBot", "/checkout/"],
        distractors: ["Claude-SearchBot", "OAI-SearchBot", "/"],
        explanation:
          "ClaudeBot is Anthropic's training crawler. Claude-SearchBot and OAI-SearchBot are search crawlers Fernhill wants to keep. PerplexityBot's group needs its own Disallow: /checkout/, because specific groups are not combined with *. Disallow: / would remove Fernhill from Perplexity. (Deleting the PerplexityBot group would also work, since it would then fall back to *.)",
      },
      {
        kind: "choice",
        id: "x-step-apple",
        prompt:
          "The file still lets Apple train on Fernhill's content. Which line should Fernhill add to the GPTBot and ClaudeBot group, so it stays in Siri and Spotlight?",
        options: [
          "User-agent: Applebot-Extended",
          "User-agent: Applebot",
          "User-agent: Googlebot",
          "Nothing: Applebot already follows the * group, which covers training",
        ],
        answer: 0,
        explanation:
          "Apple's training opt-out is a Disallow for Applebot-Extended. Adding Applebot would block Apple's search crawler and take Fernhill out of Siri, Spotlight and Safari. Adding Googlebot would remove Fernhill from Google Search. The * group only disallows /checkout/, which says nothing about training.",
      },
      {
        kind: "choice",
        id: "x-step-cdn",
        prompt:
          "The file is fixed. Fernhill's Cloudflare zone has its Training policy set to Block. According to Cloudflare's docs, what else can that block catch?",
        options: [
          "Mixed-purpose crawlers used for both Training and Search, which can cost search visibility",
          "Nothing else: Training only covers GPTBot and ClaudeBot",
          "Googlebot and every other search engine crawler",
          "Only bots that ignore robots.txt",
        ],
        answer: 0,
        explanation:
          "Cloudflare says Training includes mixed-purpose crawlers used both for Training and for Search. robots.txt already states Fernhill's training choices, so ask whoever runs the CDN whether the block is worth that cost, and check the logs for 403s to the search crawlers Fernhill wants.",
      },
    ],
    debrief:
      "Most of the bugs came from one rule: a bot obeys only the group that names it. Stacking a search crawler into a training group blocked it. Giving another search crawler its own group quietly dropped the * rules. Apple needed its own training token, and the CDN could still overrule the whole file. When you edit a real file, check each token against the vendor's page, re-read every group from the bot's point of view, check the CDN, and note the date. OpenAI says its search results can take about 24 hours to adjust after a robots.txt update, and Perplexity says its systems may take up to 24 hours to reflect changes.",
  },

  example: {
    title: "The Guardian's robots.txt",
    context:
      "The robots.txt for theguardian.com, fetched on 6 November 2026. Its opening comments say uses of Guardian content for large language models, machine learning or other AI purposes are not permitted, and point to its licensing team. Then it sets out one long group for the bots it turns away. The excerpt below shows that group, with … marking lines left out.",
    excerpt: {
      kind: "code",
      language: "robots",
      caption: "Excerpt from https://www.theguardian.com/robots.txt, fetched 2026-11-06 (lines 65–68, 79–84, 89 and 100–102)",
      code: "User-agent: NewsNow\nUser-agent: CCBot\nUser-agent: TurnitinBot\nUser-agent: PetalBot\n…\nUser-Agent: PerplexityBot\nUser-Agent: yacy\nUser-agent: anthropic-ai\nUser-agent: ClaudeBot\nUser-agent: Claude-SearchBot\nUser-agent: Claude-User\n…\nUser-agent: Applebot-Extended\n…\nUser-agent: AhrefsBot\nUser-agent: AhrefsSiteAudit\nDisallow: /",
    },
    points: [
      {
        label: "One group, many names",
        text: "Every user-agent line from NewsNow to AhrefsSiteAudit belongs to a single group, ended by one Disallow: /. That is the RFC 9309 definition of a group. The mix of \"User-Agent\" and \"User-agent\" makes no difference, because the field name is case-insensitive.",
      },
      {
        label: "Search and user fetchers are in it too",
        text: "Claude-SearchBot, Claude-User and PerplexityBot sit alongside the training crawlers. Anthropic says disabling Claude-SearchBot may reduce a site's visibility in user search results. For a publisher with licensing terms, that is a deliberate trade, not a mistake. For a brand that wants to be cited in Claude or Perplexity answers, the same group would work against that goal.",
      },
      {
        label: "Who is not named",
        text: "GPTBot, OAI-SearchBot, ChatGPT-User, Google-Extended and Applebot do not appear anywhere in the file on the day it was fetched. Under RFC 9309, a token with no group of its own falls back to the User-agent: * group, which only disallows particular paths such as /sendarticle/ and /email/. Applebot-Extended is in the big group, so Apple's training opt-out is set while Apple's search crawler is not named.",
      },
      {
        label: "Old names linger",
        text: "anthropic-ai is not one of the three bots Anthropic's crawler article describes (ClaudeBot, Claude-User and Claude-SearchBot). Lists build up over time. Check yours against each vendor's current page instead of copying someone else's.",
      },
    ],
    source: GUARDIAN_ROBOTS,
  },

  audit: [
    {
      kind: "spot",
      id: "a-spot-extended",
      prompt:
        "Goal: keep your content out of Gemini training without affecting Google Search. Which one line do you need to change?",
      language: "robots",
      lines: [
        "User-agent: *",
        "Disallow: /admin/",
        "User-agent: Googlebot",
        "Disallow: /",
        "Sitemap: https://www.example.com/sitemap.xml",
      ],
      answer: 2,
      explanation:
        "The group blocks Googlebot, which is the crawler for Google Search, so the site drops out of Search. Change the user-agent line to Google-Extended, the token Google provides for Gemini training and grounding. Disallow: / is the right rule once it is under the right token.",
    },
    {
      kind: "choice",
      id: "a-chatgpt-user",
      prompt: "You add \"User-agent: ChatGPT-User\" with \"Disallow: /\". What does OpenAI's documentation say about this?",
      options: [
        "Because users start these actions, robots.txt rules may not apply, and ChatGPT-User does not decide whether you appear in Search",
        "ChatGPT-User always obeys it, and your site leaves ChatGPT search within 24 hours",
        "It stops GPTBot from using your content for training",
        "OpenAI will block your site from ChatGPT entirely",
      ],
      answer: 0,
      explanation:
        "OpenAI says robots.txt rules may not apply to ChatGPT-User, and that it \"is not used to determine whether content may appear in Search\". Search opt-outs go through OAI-SearchBot, and training through GPTBot.",
    },
    {
      kind: "choice",
      id: "a-tie",
      prompt:
        "A group contains both \"Allow: /shop\" and \"Disallow: /shop\". Under RFC 9309, which rule should a crawler use for /shop/boots?",
      options: [
        "The Allow rule, because when an allow and a disallow rule are equivalent, allow should be used",
        "The Disallow rule, because Disallow always takes priority",
        "Whichever rule comes first in the file",
        "Neither: the crawler must skip the whole site",
      ],
      answer: 0,
      explanation:
        "Both paths match with the same number of octets, so they are equivalent. RFC 9309 says the allow rule SHOULD be used, and Google says it uses the least restrictive rule.",
    },
    {
      kind: "blank",
      id: "a-blank-matching",
      prompt: "Complete the RFC 9309 matching rules.",
      text: "A crawler finds its group by matching its ___ without regard to case. If no group matches, it obeys the group whose user-agent line has the value ___.",
      answers: ["product token", "*"],
      distractors: ["IP address", "Googlebot", "sitemap"],
      explanation:
        "The product token is the name the crawler uses in robots.txt, such as GPTBot. Matching is case-insensitive. The * group is the fallback, and only for crawlers with no group of their own.",
    },
    {
      kind: "match",
      id: "a-match-files",
      prompt: "Match each tool to its job.",
      pairs: [
        { term: "robots.txt", definition: "Tells crawlers which URLs they may fetch" },
        { term: "XML sitemap", definition: "Lists URLs you want crawlers to know about, with hints such as lastmod" },
        { term: "IndexNow", definition: "Tells participating engines that a URL was added, updated or deleted" },
        { term: "llms.txt", definition: "A proposed markdown guide to a site for AI agents" },
        { term: "noindex", definition: "Keeps a page Google can crawl out of Google's index" },
      ],
      explanation:
        "Each one does a different job. Only robots.txt controls crawling, only noindex controls Google indexing, and llms.txt is still a proposal that Google Search ignores.",
    },
    {
      kind: "order",
      id: "a-order-indexnow",
      prompt: "Put the IndexNow set-up in order.",
      items: [
        "Generate a key of 8 to 128 characters",
        "Host a UTF-8 text file named after the key at the root of your site",
        "Send the changed URL and the key to a participating engine's /indexnow endpoint",
        "The engine fetches your key file to verify that you own the site",
      ],
      explanation:
        "The key file has to exist before you submit. IndexNow's docs say engines crawl the key file to verify ownership once you submit URLs. Participating engines also share submitted URLs with each other.",
    },
    {
      kind: "passage",
      id: "a-passage-render",
      prompt:
        "These are the raw HTML responses from two product pages, before any JavaScript runs. Which one can a crawler that does not execute JavaScript read the price from?",
      passages: [
        "<div id=\"root\"></div><script src=\"/static/app.js\"></script>",
        "<h1>Fernhill rain butt, 200 liters</h1><p>£39. In stock for next-day delivery.</p><script src=\"/static/app.js\"></script>",
      ],
      answer: 1,
      explanation:
        "The first page has no text until app.js runs. CCBot does not execute JavaScript, and Vercel and MERJ's 2024 study found the major AI crawlers it measured did not either. The second page sends the product and price in its HTML.",
    },
    {
      kind: "choice",
      id: "a-cloudflare-training",
      prompt:
        "In Cloudflare's AI Crawler and Agent access policies, as its docs describe them, what does the Training category include besides crawlers that only train models?",
      options: [
        "Mixed-purpose crawlers that are used both for Training and for Search",
        "Every search engine crawler, including Googlebot",
        "Only bots that ignore robots.txt",
        "Nothing else: Training never affects search crawlers",
      ],
      answer: 0,
      explanation:
        "Cloudflare's docs say Training includes \"mixed-purpose crawlers that are used both for Training and for Search\". Blocking training at the CDN can therefore cost you some search visibility. Check the setting with whoever owns the CDN.",
    },
    {
      kind: "choice",
      id: "a-extended-scope",
      prompt: "According to Google, what does a Disallow for Google-Extended control?",
      options: [
        "Whether Google may use content it crawls to train future Gemini models and for grounding in Gemini Apps and Vertex AI",
        "Whether your pages appear in Google Search and AI Overviews",
        "How your pages rank in Google Search",
        "Whether Googlebot crawls your site",
      ],
      answer: 0,
      explanation:
        "Google says Google-Extended does not affect inclusion in Google Search and is not a ranking signal. For AI features in Search, the control is Googlebot.",
    },
    {
      kind: "choice",
      id: "a-private-path",
      prompt:
        "A colleague adds \"Disallow: /private-offers/\" to keep a staff discount page out of Google. What is wrong with that?",
      options: [
        "Google can still index the URL if it is linked elsewhere, and the line itself publishes the path for anyone to read",
        "Nothing: a Disallow removes the page from Google's index within a day",
        "Disallow only works when it sits in the Googlebot group",
        "robots.txt paths are case-insensitive, so it blocks too much",
      ],
      answer: 0,
      explanation:
        "Google says robots.txt is not a way to keep a page out of Google, and RFC 9309 warns that listing paths makes them discoverable. Use noindex for indexing and a password for anything private.",
    },
  ],
};

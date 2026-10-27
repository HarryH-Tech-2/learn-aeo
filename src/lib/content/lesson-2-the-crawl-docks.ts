// Lesson 2, The Crawl Docks: make your site reachable by AI.
// Every claim about a crawler, robots.txt, rendering, sitemaps, IndexNow,
// llms.txt or CDN blocking is tied to a source checked on the `accessed` date.
// Fernhill Garden Supply is a made-up shop. Log lines use documentation-only
// IP addresses (RFC 5737) with user-agent strings as the vendors publish them.

import type { LessonContent, Source } from "../lesson-types";

const ACCESSED = "2026-10-26";

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
  published: "2026-04-07",
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
  published: "2026-10-15",
  accessed: ACCESSED,
};

const GOOGLE_AI_FEATURES: Source = {
  title: "AI features and your website",
  publisher: "Google Search Central",
  url: "https://developers.google.com/search/docs/appearance/ai-features",
  published: "2025-12-10",
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
  published: "2022-09",
  accessed: ACCESSED,
};

const GOOGLE_ROBOTS_SPEC: Source = {
  title: "How Google interprets the robots.txt specification",
  publisher: "Google Crawling Infrastructure",
  url: "https://developers.google.com/crawling/docs/robots-txt/robots-txt-spec",
  published: "2026-10-23",
  accessed: ACCESSED,
};

const GOOGLE_ROBOTS_INTRO: Source = {
  title: "Introduction to robots.txt",
  publisher: "Google Search Central",
  url: "https://developers.google.com/search/docs/crawling-indexing/robots/intro",
  published: "2025-12-10",
  accessed: ACCESSED,
};

const GOOGLE_JS_SEO: Source = {
  title: "Understand JavaScript SEO basics",
  publisher: "Google Search Central",
  url: "https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics",
  published: "2026-03-04",
  accessed: ACCESSED,
};

const VERCEL_AI_CRAWLERS: Source = {
  title: "The rise of the AI crawler (with MERJ)",
  publisher: "Vercel",
  url: "https://vercel.com/blog/the-rise-of-the-ai-crawler",
  published: "2024-12-17",
  accessed: ACCESSED,
};

const SITEMAPS_HOME: Source = {
  title: "What are Sitemaps?",
  publisher: "sitemaps.org",
  url: "https://www.sitemaps.org/",
  published: "2020-04-17",
  accessed: ACCESSED,
};

const SITEMAPS_PROTOCOL: Source = {
  title: "Sitemaps XML format",
  publisher: "sitemaps.org",
  url: "https://www.sitemaps.org/protocol.html",
  published: "2016-11-21",
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
  published: "2026-08-10",
  accessed: ACCESSED,
};

const CLOUDFLARE_ONE_CLICK: Source = {
  title: "Declare your AIndependence: block AI bots, scrapers and crawlers with a single click",
  publisher: "Cloudflare Blog",
  url: "https://blog.cloudflare.com/declaring-your-aindependence-block-ai-bots-scrapers-and-crawlers-with-a-single-click/",
  published: "2024-07-03",
  accessed: ACCESSED,
};

const CLOUDFLARE_DEFAULT_BLOCK: Source = {
  title: "Content Independence Day: no AI crawl without compensation!",
  publisher: "Cloudflare Blog",
  url: "https://blog.cloudflare.com/content-independence-day-no-ai-crawl-without-compensation/",
  published: "2025-07-01",
  accessed: ACCESSED,
};

const CLOUDFLARE_AI_BOTS_DOCS: Source = {
  title: "Block AI Bots",
  publisher: "Cloudflare Docs",
  url: "https://developers.cloudflare.com/bots/additional-configurations/block-ai-bots/",
  published: "2026-07-01",
  accessed: ACCESSED,
};

const GOOGLE_VERIFY: Source = {
  title: "Verify requests from Google crawlers and fetchers",
  publisher: "Google Crawling Infrastructure",
  url: "https://developers.google.com/crawling/docs/crawlers-fetchers/verify-google-requests",
  published: "2026-03-20",
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
    "You leave The Crawl Docks knowing who is knocking, what your robots.txt actually says to each of them, and where a CDN setting can overrule both. Next stop is The Answer Quarter, where you work on the passages those bots carry away.",

  groups: [
    {
      id: "g-who-knocks",
      title: "Who is knocking",
      concepts: [
        {
          id: "c-three-jobs",
          term: "Three jobs, three kinds of bot",
          summary: "Training crawlers, search crawlers and user-triggered fetchers each get their own user-agent token.",
          explanation:
            "The Gate introduced these bots. Here is the full set you will write rules for, grouped by the job each vendor says it does:\n\n- **Training.** OpenAI's `GPTBot` crawls content \"that may be used in training our generative AI foundation models\". Anthropic's `ClaudeBot` collects content \"that could potentially contribute to their training\".\n- **Search.** `OAI-SearchBot` surfaces sites in ChatGPT's search features. `Claude-SearchBot` analyses content \"to enhance the relevance and accuracy of search responses\". `PerplexityBot` surfaces and links sites in Perplexity's results, and Perplexity says \"It is not used to crawl content for AI foundation models.\"\n- **User-triggered.** `ChatGPT-User`, `Claude-User` and `Perplexity-User` visit a page because someone asked a question that needs it.\n\nOpenAI also runs `OAI-AdsBot`, which \"only visits pages submitted as ads\" on ChatGPT.",
          whyItMatters:
            "Each token is a separate switch. OpenAI says \"Each setting is independent of the others\", and Perplexity says \"Each setting works independently\". You can say no to training and yes to search in the same file, but only if you name the right tokens.",
          example: {
            kind: "code",
            language: "text",
            caption: "Robots.txt tokens by job, as each vendor documents them",
            code: "Job               OpenAI          Anthropic          Perplexity\nTraining          GPTBot          ClaudeBot          (none listed)\nSearch            OAI-SearchBot   Claude-SearchBot   PerplexityBot\nUser-triggered    ChatGPT-User    Claude-User        Perplexity-User",
          },
          pitfall:
            "Copying a list of \"AI bots\" from a blog post. Lists go stale and often mix jobs. Check each token against the vendor's own page before you add it to a rule.",
          sources: [OPENAI_CRAWLERS, ANTHROPIC_CRAWLERS, PERPLEXITY_CRAWLERS],
        },
        {
          id: "c-user-fetchers",
          term: "User-triggered fetchers play by different rules",
          summary: "Vendors do not all say the same thing about whether their user fetchers obey robots.txt.",
          explanation:
            "Read each vendor's wording, because it differs:\n\n- **OpenAI** on ChatGPT-User: \"Because these actions are initiated by a user, robots.txt rules may not apply.\"\n- **Perplexity** on Perplexity-User: \"Since a user requested the fetch, this fetcher generally ignores robots.txt rules.\"\n- **Anthropic** covers all three of its bots, Claude-User included: \"Anthropic's Bots respect “do not crawl” signals by honoring industry standard directives in robots.txt.\"\n\nOpenAI adds that ChatGPT-User \"is not used to determine whether content may appear in Search\" and points you to OAI-SearchBot for that.",
          whyItMatters:
            "A Disallow for ChatGPT-User or Perplexity-User is not a dependable way to stop those visits, and it is the wrong switch for search visibility anyway. A Disallow for Claude-User is honoured, and Anthropic warns it \"may reduce your site's visibility for user-directed web search\".",
          pitfall:
            "Blocking ChatGPT-User to leave ChatGPT search, or allowing it to get in. OpenAI says to use OAI-SearchBot in robots.txt \"for managing Search opt outs and automatic crawl\".",
          sources: [OPENAI_CRAWLERS, PERPLEXITY_CRAWLERS, ANTHROPIC_CRAWLERS],
        },
        {
          id: "c-product-token",
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
          id: "c-ccbot",
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
            { term: "Claude-User", definition: "Honours robots.txt directives, like its vendor's other bots" },
            { term: "Google-Extended", definition: "A control token only: crawling uses Google's existing user agents" },
          ],
          explanation:
            "Three vendors, three different answers for user-triggered fetchers, and one token that is not a fetcher at all. Read the vendor's page for each token rather than assuming they all behave alike.",
        },
      ],
    },
    {
      id: "g-robots",
      title: "robots.txt done right",
      concepts: [
        {
          id: "c-groups",
          term: "Groups, and how a bot finds its own",
          summary: "A bot obeys one group: the one that names it, or the * group if none does.",
          explanation:
            "RFC 9309 defines a **group** as \"One or more user-agent lines that are followed by one or more rules\". The group ends at the next user-agent line or the end of the file. So several bots can share one set of rules by stacking their user-agent lines.\n\nTo find its group, a crawler matches its product token, and \"Crawlers MUST use case-insensitive matching\". If two groups name the same token, their rules \"MUST be combined into one group\". Only \"If no matching group exists\" does the crawler fall back to the `User-agent: *` group.\n\nGoogle spells out the consequence: \"User agent specific groups and global groups (*) are not combined.\" Once a bot has a group of its own, the rules under `*` no longer apply to it. Google also says the order of groups in the file \"is irrelevant\".",
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
          term: "What each token does and does not control",
          summary: "Each vendor defines what a Disallow for its token means. Read the definition, not the name.",
          explanation:
            "Here is what each vendor says a block does:\n\n- `GPTBot`: \"Disallowing GPTBot indicates a site's content should not be used in training generative AI foundation models.\"\n- `OAI-SearchBot`: opted-out sites \"will not be shown in ChatGPT search answers, though can still appear as navigational links\".\n- `ClaudeBot`: a block \"signals that the site's future materials should be excluded from our AI model training datasets\".\n- `Claude-SearchBot`: a block \"prevents our system from indexing your content for search optimization\".\n- `Google-Extended`: Gemini training and grounding only, not Google Search.\n\nChanges take time. OpenAI says it \"can take ~24 hours\" for search results to adjust, Perplexity says \"up to 24 hours\", and Google says it \"generally caches the contents of robots.txt file for up to 24 hours\".\n\n`Crawl-delay` is not universal either. Anthropic and Common Crawl support it. Google lists it among fields that \"aren't supported\".",
          whyItMatters:
            "A training opt-out is a statement about future use, in the vendor's own words. A search opt-out removes you from that engine's answers. Treat them as two separate decisions.",
          pitfall:
            "Expecting a change to show up the next morning in every engine, or reading Anthropic's \"future materials\" as removal of content it has already collected. Write down the date of each robots.txt change so you can compare against your logs later.",
          sources: [OPENAI_CRAWLERS, ANTHROPIC_CRAWLERS, PERPLEXITY_CRAWLERS, GOOGLE_COMMON_CRAWLERS, GOOGLE_ROBOTS_SPEC, CCBOT_FAQ],
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
          term: "Content that needs JavaScript to appear",
          summary: "Google renders JavaScript. A 2024 study found that the major AI crawlers it measured did not.",
          explanation:
            "Google documents its own process: it handles JavaScript pages in \"three main phases\", crawling, rendering and indexing. It still adds that \"server-side or pre-rendering is still a great idea because it makes your website faster for users and crawlers, and not all bots can run JavaScript.\"\n\nFor AI crawlers, there are two kinds of evidence:\n\n- **A vendor statement.** Common Crawl says of CCBot: \"Currently, JavaScript is not executed\".\n- **A published study.** In December 2024, Vercel and MERJ analysed crawler traffic on nextjs.org and the Vercel network. They reported that \"none of the major AI crawlers currently render JavaScript\", naming OpenAI's OAI-SearchBot, ChatGPT-User and GPTBot, Anthropic's ClaudeBot and PerplexityBot among others. They found Gemini uses Googlebot's infrastructure and renders fully.\n\nOpenAI, Anthropic and Perplexity's crawler pages do not say whether their bots render JavaScript. Claude-SearchBot and Claude-User were not in the study's list.",
          whyItMatters:
            "If your prices, product details or answers only appear after JavaScript runs, some bots that are allowed in may still see an empty page. Server-rendered HTML is the safe default, because every crawler can read it.",
          example: {
            kind: "before-after",
            before:
              "<div id=\"app\"></div>\n<script src=\"/bundle.js\"></script>",
            after:
              "<h1>Fernhill compost bin, 330 litres</h1>\n<p>£45. Free UK delivery on orders over £50.</p>\n<script src=\"/bundle.js\"></script>",
            note: "The HTML each page sends before any JavaScript runs (Fernhill is made up). A crawler that does not execute JavaScript sees nothing in the first version, and the product, price and delivery terms in the second.",
          },
          pitfall:
            "Checking the page in your own browser and deciding it is fine. Your browser runs JavaScript. Look at the raw HTML your server returns, with View Source or curl, to see what a non-rendering bot gets. And do not block your script files in robots.txt: Google says it \"won't render JavaScript from blocked files or on blocked pages\".",
          sources: [GOOGLE_JS_SEO, CCBOT_FAQ, VERCEL_AI_CRAWLERS],
        },
        {
          id: "c-sitemaps",
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
          term: "IndexNow",
          summary: "A ping that tells participating engines a URL was added, updated or deleted.",
          explanation:
            "Instead of waiting for a crawler to come back, you send the changed URL to an engine's `/indexnow` endpoint with a key. You prove you own the site by hosting \"a UTF-8 encoded text key file {your-key}.txt\" at the root. A single POST can carry \"up to 10,000 URLs\".\n\nEngines that adopt the protocol \"agree that submitted URLs will be automatically shared with all other participating search engines\", so one ping reaches all of them. IndexNow's list of participants names Bing, Yandex, Seznam, Naver, Yep, the Internet Archive and Amazonbot. Google is not on it.",
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
          term: "llms.txt, a proposal",
          summary: "A suggested markdown file that gives AI agents a short guided tour of your site.",
          explanation:
            "llms.txt is a proposal from Jeremy Howard, first published in September 2024 and last modified, as v2, in August 2026: \"We propose adding a /llms.txt markdown file to websites to provide LLM-friendly content.\" The file sits at `/llms.txt` or under a path such as `/docs/llms.txt`. The only required part is an H1 with the site or project name. A blockquote summary and H2 lists of links can follow.\n\nThe proposal says the file is \"used on demand, when an agent needs information about a topic while assisting a user\", and that it is used most heavily for software documentation. It also says \"robots.txt and llms.txt have different purposes\": llms.txt does not grant or refuse access.\n\nNone of the crawler pages from OpenAI, Anthropic or Perplexity used in this lesson say their bots read llms.txt. Google's AI features guide says \"You don't need to create new machine readable files, AI text files, or markup to appear in these features.\"",
          whyItMatters:
            "It is cheap to publish and may help agents that do look for it, especially on documentation sites. Do not expect it to change whether you are crawled, indexed or cited. No source here documents that.",
          example: {
            kind: "code",
            language: "markdown",
            caption: "A minimal llms.txt in the proposed format (Fernhill is made up)",
            code: "# Fernhill Garden Supply\n\n> UK garden supplies shop. Prices include VAT. Delivery is free on orders over £50.\n\n## Help\n\n- [Delivery and returns](https://www.fernhill.example/help/delivery.md): times, costs and the 30-day returns policy",
          },
          pitfall:
            "Putting llms.txt ahead of the basics. A crawler that is blocked by robots.txt or your CDN, or that cannot see content rendered by JavaScript, gains nothing from a well-written llms.txt.",
          sources: [LLMS_TXT, GOOGLE_AI_FEATURES],
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
            "llmstxt.org presents it as a proposal and says it has a different purpose from robots.txt. RFC 9309 is the robots.txt standard. Google says you do not need new AI text files to appear in its AI features.",
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
          term: "CDN and firewall bot rules",
          summary: "Your CDN can turn a bot away before robots.txt ever matters.",
          explanation:
            "robots.txt is a request that well-behaved bots honour. A CDN or web application firewall (WAF) is different: it decides whether the request is served at all. If the CDN blocks a bot, an `Allow` in robots.txt does not help.\n\nCloudflare is one example, and it has changed its settings several times:\n\n- In July 2024 it added a one-click block for AI bots and said: \"It's available for all customers, including those on the free tier.\"\n- In July 2025 it said it was \"changing the default to block AI crawlers unless they pay creators for their content.\"\n- Its docs (updated July 2026) describe separate policies for **Search**, **Agent** (\"such as chat fetch bots and browser-use agents\") and **Training**. Training includes \"mixed-purpose crawlers that are used both for Training and for Search\". From 15 September 2026, Cloudflare said new domains would block Training and Agent bots on pages that display ads, with Search left allowed.",
          whyItMatters:
            "If someone else runs your CDN, such as IT, a developer or an agency, ask them what its AI bot settings are. On Cloudflare, a Training block also catches mixed-purpose crawlers, and an Agent block catches chat fetch bots. Your robots.txt will not show either.",
          pitfall:
            "Blocking a vendor's IP addresses instead of using robots.txt. Anthropic warns this \"may not work correctly or persistently guarantee an opt-out\", because it stops its bots reading your robots.txt.",
          sources: [CLOUDFLARE_ONE_CLICK, CLOUDFLARE_DEFAULT_BLOCK, CLOUDFLARE_AI_BOTS_DOCS, ANTHROPIC_CRAWLERS],
        },
        {
          id: "c-server-logs",
          term: "Check your server logs",
          summary: "Logs show which bots actually reached you, and what status code they got.",
          explanation:
            "Your server or CDN logs record each request's user-agent string and status code. Search them for the tokens in this lesson (`GPTBot`, `OAI-SearchBot`, `ClaudeBot`, `PerplexityBot` and so on) to see who arrives, which pages they fetch and whether they get a 200.\n\nA user-agent string is only a claim. Cloudflare notes that \"user agents are trivial for bot operators to change\". So verify the important ones:\n\n- **Published IP lists.** OpenAI publishes one per bot (for example `openai.com/gptbot.json`), Perplexity does the same, and Anthropic publishes `claude.com/crawling/bots.json`.\n- **Reverse DNS.** Google's method: look up the IP's hostname, check it is on googlebot.com, google.com or googleusercontent.com, then look that hostname up again and confirm it returns the same IP.\n\nOpenAI also says it may add a `robots.txt` marker to the user-agent string when fetching your robots.txt file, which helps you spot those requests.",
          whyItMatters:
            "Logs are the only place you can see whether a robots.txt change or a CDN rule actually changed bot behaviour. Lesson 7 builds on this for reporting.",
          example: {
            kind: "code",
            language: "text",
            caption: "Made-up log lines (documentation-only IP addresses), with user-agent strings as OpenAI and Perplexity publish them",
            code: "203.0.113.7 - - [26/Oct/2026:09:14:02 +0000] \"GET /guides/compost HTTP/1.1\" 200 18342 \"-\" \"Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; GPTBot/1.4; +https://openai.com/gptbot\"\n198.51.100.23 - - [26/Oct/2026:09:15:40 +0000] \"GET /compost-bin HTTP/1.1\" 403 512 \"-\" \"Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)\"",
          },
          pitfall:
            "Counting every request that says GPTBot as OpenAI. Check the IP against OpenAI's published list first. In the made-up lines above, neither address would pass, because both come from ranges reserved for documentation.",
          sources: [OPENAI_CRAWLERS, PERPLEXITY_CRAWLERS, ANTHROPIC_CRAWLERS, GOOGLE_VERIFY, CLOUDFLARE_ONE_CLICK],
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
      ],
    },
  ],

  exercise: {
    id: "x-fix-the-robots",
    title: "Fix the robots.txt",
    brief:
      "Fernhill Garden Supply (made up) has three goals for AI bots: keep its content out of OpenAI and Anthropic model training, stay visible in ChatGPT search, Claude search and Perplexity, and keep /checkout/ off-limits to every bot. A developer wrote the file below. It is valid, but it misses two of the goals. Find the problems and fix them.",
    steps: [
      {
        kind: "spot",
        id: "x-step-spot",
        prompt: "Which line blocks a search crawler that Fernhill wants to keep?",
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
        prompt: "Which change to that group meets all three goals for OAI-SearchBot, GPTBot and ClaudeBot?",
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
          "One problem is left: PerplexityBot has its own group, so it ignores the * rule for /checkout/. Fill in the fixed file.",
        text: "User-agent: * · Disallow: /checkout/ · User-agent: GPTBot · User-agent: ___ · Disallow: / · User-agent: PerplexityBot · Disallow: ___",
        answers: ["ClaudeBot", "/checkout/"],
        distractors: ["Claude-SearchBot", "OAI-SearchBot", "/"],
        explanation:
          "ClaudeBot is Anthropic's training crawler. Claude-SearchBot and OAI-SearchBot are search crawlers Fernhill wants to keep. PerplexityBot's group needs its own Disallow: /checkout/, because specific groups are not combined with *. Disallow: / would remove Fernhill from Perplexity. (Deleting the PerplexityBot group would also work, since it would then fall back to *.)",
      },
    ],
    debrief:
      "The two bugs came from one rule: a bot obeys only the group that names it. Stacking a search crawler into a training group blocked it. Giving another search crawler its own group quietly dropped the * rules. When you edit a real file, check each token against the vendor's page, re-read every group from the bot's point of view, and note the date. OpenAI and Perplexity both say changes can take up to about 24 hours to show.",
  },

  example: {
    title: "The Guardian's robots.txt",
    context:
      "The robots.txt for theguardian.com, fetched on 26 October 2026. Its opening comments say uses of Guardian content for large language models, machine learning or other AI purposes are not permitted, and point to its licensing team. Then it sets out one long group for the bots it turns away. The excerpt below shows that group, with … marking lines left out.",
    excerpt: {
      kind: "code",
      language: "robots",
      caption: "Excerpt from https://www.theguardian.com/robots.txt, fetched 2026-10-26 (lines 65–68, 79–84 and 100–102)",
      code: "User-agent: NewsNow\nUser-agent: CCBot\nUser-agent: TurnitinBot\nUser-agent: PetalBot\n…\nUser-Agent: PerplexityBot\nUser-Agent: yacy\nUser-agent: anthropic-ai\nUser-agent: ClaudeBot\nUser-agent: Claude-SearchBot\nUser-agent: Claude-User\n…\nUser-agent: AhrefsBot\nUser-agent: AhrefsSiteAudit\nDisallow: /",
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
        text: "GPTBot, OAI-SearchBot, ChatGPT-User and Google-Extended do not appear anywhere in the file on the day it was fetched. Under RFC 9309, those tokens fall back to the User-agent: * group, which only disallows particular paths such as /sendarticle/ and /email/.",
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
        "Each one does a different job. Only robots.txt controls crawling, only noindex controls Google indexing, and llms.txt is still a proposal.",
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
        "<h1>Fernhill rain butt, 200 litres</h1><p>£39. In stock for next-day delivery.</p><script src=\"/static/app.js\"></script>",
      ],
      answer: 1,
      explanation:
        "The first page has no text until app.js runs. CCBot does not execute JavaScript, and Vercel and MERJ's 2024 study found the major AI crawlers it measured did not either. The second page sends the product and price in its HTML.",
    },
    {
      kind: "choice",
      id: "a-cloudflare-training",
      prompt:
        "In Cloudflare's AI bot policies, as its docs describe them, what does the Training category include besides crawlers that only train models?",
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

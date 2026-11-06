// Lesson 8, The Citadel: running an AEO program.
// Claims about what Google, OpenAI and Microsoft document (crawlers, indexing,
// Search Console and Bing Webmaster Tools reports, GA4's AI Assistant channel,
// fix validation, user permissions, spam policies), Google's advice on audits,
// guarantees and third-party SEO services, the FTC's endorsement guidance and
// Intercom's RICE scoring method are tied to sources checked on the `accessed`
// date. The audit checklist, the finding and ticket formats, the confidence
// levels for AEO work, the reporting cadence and the 90-day plan are this
// course's own framework, built from Lessons 1–7. Larkfield Tea is the made-up
// shop from Lesson 4; its audit findings, tickets, scores, baseline figures,
// names and reports are invented for the examples and exercises. Nothing here is
// legal advice.

import type { LessonContent, Source } from "../lesson-types";

const ACCESSED = "2026-11-06";

const GOOGLE_NEED_SEO: Source = {
  title: "Do you need an SEO?",
  publisher: "Google Search Central",
  url: "https://developers.google.com/search/docs/fundamentals/do-i-need-seo",
  date: "2026-06-05",
  dateKind: "updated",
  accessed: ACCESSED,
};

const GOOGLE_THIRD_PARTY: Source = {
  title: "Google Search's guidance on using third-party SEO tools, services, and advice",
  publisher: "Google Search Central",
  url: "https://developers.google.com/search/docs/fundamentals/third-party-seo",
  date: "2026-06-05",
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

const GOOGLE_AI_FEATURES: Source = {
  title: "AI features and your website",
  publisher: "Google Search Central",
  url: "https://developers.google.com/search/docs/appearance/ai-features",
  date: "2025-12-10",
  dateKind: "updated",
  accessed: ACCESSED,
};

const GOOGLE_UPDATES: Source = {
  title: "Latest Google Search documentation updates",
  publisher: "Google Search Central",
  url: "https://developers.google.com/search/updates",
  date: "2026-10-26",
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

const GOOGLE_STARTER: Source = {
  title: "SEO Starter Guide: The Basics",
  publisher: "Google Search Central",
  url: "https://developers.google.com/search/docs/fundamentals/seo-starter-guide",
  date: "2025-12-10",
  dateKind: "updated",
  accessed: ACCESSED,
};

const GOOGLE_HOW_SEARCH: Source = {
  title: "In-depth guide to how Google Search works",
  publisher: "Google Search Central",
  url: "https://developers.google.com/search/docs/fundamentals/how-search-works",
  date: "2025-12-18",
  dateKind: "updated",
  accessed: ACCESSED,
};

const GOOGLE_HELPFUL: Source = {
  title: "Creating helpful, reliable, people-first content",
  publisher: "Google Search Central",
  url: "https://developers.google.com/search/docs/fundamentals/creating-helpful-content",
  date: "2026-10-05",
  dateKind: "updated",
  accessed: ACCESSED,
};

const GOOGLE_DROPS: Source = {
  title: "Debug Google Search traffic drops",
  publisher: "Google Search Central",
  url: "https://developers.google.com/search/docs/monitor-debug/debugging-search-traffic-drops",
  date: "2025-12-10",
  dateKind: "updated",
  accessed: ACCESSED,
};

const GOOGLE_SPAM: Source = {
  title: "Spam policies for Google web search",
  publisher: "Google Search Central",
  url: "https://developers.google.com/search/docs/essentials/spam-policies",
  date: "2026-08-28",
  dateKind: "updated",
  accessed: ACCESSED,
};

const GSC_URL_INSPECTION: Source = {
  title: "URL Inspection tool",
  publisher: "Search Console Help",
  url: "https://support.google.com/webmasters/answer/9012289",
  accessed: ACCESSED,
};

const GSC_PAGE_INDEXING: Source = {
  title: "Page indexing report",
  publisher: "Search Console Help",
  url: "https://support.google.com/webmasters/answer/7440203",
  accessed: ACCESSED,
};

const GSC_PERFORMANCE: Source = {
  title: "Performance report (Search results): Overview and basic setup",
  publisher: "Search Console Help",
  url: "https://support.google.com/webmasters/answer/7576553",
  accessed: ACCESSED,
};

const GSC_USERS: Source = {
  title: "Managing owners, users, and permissions",
  publisher: "Search Console Help",
  url: "https://support.google.com/webmasters/answer/7687615",
  accessed: ACCESSED,
};

const GA4_CHANNELS: Source = {
  title: "Default channel group",
  publisher: "Analytics Help",
  url: "https://support.google.com/analytics/answer/9756891",
  accessed: ACCESSED,
};

const INTERCOM_RICE: Source = {
  title: "RICE: Simple prioritization for product managers",
  publisher: "Intercom (Sean McBride)",
  url: "https://www.intercom.com/blog/rice-simple-prioritization-for-product-managers/",
  date: "2018-01-05",
  dateKind: "published",
  accessed: ACCESSED,
};

const FTC_ENDORSEMENTS: Source = {
  title: "FTC's Endorsement Guides: What People Are Asking",
  publisher: "Federal Trade Commission",
  url: "https://www.ftc.gov/business-guidance/resources/ftcs-endorsement-guides-what-people-are-asking",
  accessed: ACCESSED,
};

export const LESSON_8: LessonContent = {
  intro:
    "You have reached The Citadel, the eighth district of the City of Answers and the last stop of the core program. Everything you have learned so far is a set of tools; here you learn to run them as a program. You will audit a site from the gate to the observatory, write each finding so someone can act on it, decide what to fix first, report it honestly, keep the program safe and current, and leave with a 90-day plan you can start on Monday.",

  outro:
    "You have walked the heart of the City of Answers: how answers are built, how bots get in, how passages get lifted, how markup and other sites describe you, how each platform works, how to measure it, and now how to run it all as a program. That completes the core program. The advanced playbooks come next, starting with Lesson 9, The Market, on products and shopping; then local businesses and reviews, video and images, and what to do when AI gets your brand wrong. Complete every lesson, the advanced playbooks included, and your certificate is ready on the Certificate tab of your dashboard.",

  groups: [
    {
      id: "g-audit",
      title: "The AEO audit",
      concepts: [
        {
          id: "c-audit",
          quiz: {
            kind: "choice",
            id: "cq-audit",
            prompt: "Which pages does the course suggest you sample in an audit?",
            options: [
              "Every page on the site, checked by hand",
              "The pages that earn money, one page per template, and the pages your prompt set should surface",
              "Only the home page",
              "Whatever pages an audit tool flags first",
            ],
            answer: 1,
            explanation:
              "The card says to sample rather than check every page: money pages, one page per template, and the pages your prompts should bring up.",
          },
          term: "An AEO audit",
          summary: "An AEO audit checks six areas in order, from whether bots can reach you to whether you can measure the result, on a sample of pages, and estimates the work to fix each gap.",
          explanation:
            "Use the course as your checklist, in this order:\n\n1. **Access** (The Crawl Docks): the right bots allowed in robots.txt and through the CDN or firewall; pages indexed in Google and Bing.\n2. **Content** (The Answer Quarter): answer-first passages, question headings, honest dates, and something only you can say.\n3. **Structured data** (The Schema Works): Organization, Article and Product markup that matches the page; one @id; sameAs.\n4. **Authority** (The Agora): reviews, forum presence, coverage, Wikipedia and Wikidata.\n5. **Platforms** (The Embassies): each platform's bot and index checked.\n6. **Measurement** (The Observatory): a prompt set, the right reports, verified bot logs.\n\nYou won't check every page. Sample the pages that earn money, one page per template, and the pages your prompt set should surface. For the content area, Google publishes self-assessment questions and says \"Evaluating your own content against these questions can help you gauge if the content you're making is helpful and reliable.\"\n\nGoogle's advice on hiring an SEO sets the standard for the result: \"An SEO audit should be about giving you realistic estimates of improvement, and an estimate of the work involved.\"",
          whyItMatters:
            "A fixed checklist means nothing is skipped because it is unfamiliar, and two audits of the same site, months apart, can be compared line by line.",
          example: {
            kind: "code",
            language: "text",
            caption: "A made-up audit scope for Larkfield Tea",
            code: "AUDIT SCOPE: Larkfield Tea (made up), November\nSample: home, 3 category pages, 10 best-selling products,\n        1 page per template (product, article, guide), 30 prompts\n\nArea           Evidence to collect\n1 Access       robots.txt, CDN/firewall rules, Page indexing report,\n               URL Inspection on each sampled URL\n2 Content      the opening 100 words of each sampled page\n3 Structured   markup on 1 page per template vs. what the page shows\n4 Authority    review profiles, forum threads, press, Wikidata item\n5 Platforms    each platform's bot docs vs. robots.txt and logs\n6 Measurement  prompt set, Search Console, Bing AI Performance, GA4",
          },
          pitfall:
            "Running an audit tool and forwarding its output. Google advises checking a tool's recommendations \"against official guidance from Google Search\" before making significant changes.",
          sources: [GOOGLE_NEED_SEO, GOOGLE_HELPFUL],
        },
        {
          id: "c-audit-evidence",
          quiz: {
            kind: "choice",
            id: "cq-audit-evidence",
            prompt: "URL Inspection says a product page is on Google. What can your finding say?",
            options: [
              "The page is eligible to appear in Search results, but isn't guaranteed to be there",
              "The page is guaranteed to appear in AI Overviews",
              "The page ranks on the first results page",
              "Nothing: URL Inspection doesn't report index status",
            ],
            answer: 0,
            explanation:
              "Google's help page says the status means the URL is eligible to appear in Search results but is not guaranteed to be there.",
          },
          term: "A finding with evidence",
          summary: "Write each finding so someone else can check it: what you saw, where, with which tool, on which date, and why it matters.",
          explanation:
            "A finding nobody can reproduce becomes an argument. Record five things for each one: the URL or rule, what you saw, the tool and date, the stage it affects, and the audit area it belongs to.\n\nName the stage. Google says Search \"works in three stages, and not all pages make it through each stage\": crawling, indexing and serving. A page blocked from crawling, a page left out of the index and a page that is indexed but never shown are three different problems for three different people.\n\nUse first-party tools for access findings, and read their labels exactly. In Search Console's URL Inspection tool, \"URL is on Google means that the URL is eligible to appear in Search results, but is not guaranteed to be there.\" The Page indexing report groups pages by the reason they aren't indexed, and its help page says which issues to fix first: those whose validation failed or hasn't started, where the source is your website rather than Google.",
          whyItMatters:
            "Evidence turns an opinion into a task. A developer can open the same report on the same URL, see what you saw, and confirm the fix later without asking you.",
          example: {
            kind: "code",
            language: "text",
            caption: "A made-up finding, written so it can be checked",
            code: "FINDING A-03 (Access, indexing stage)\nURL:     larkfieldtea.example/tea/assam-breakfast\n         (and 399 other product pages on the same template)\nSaw:     Page indexing report lists the URL as not indexed\n         because of a noindex tag; URL Inspection live test\n         shows the same meta robots noindex in the HTML\nChecked: Search Console, 2026-11-03\nWhy:     a page outside Google's index can't be a supporting\n         link in AI Overviews or AI Mode\nArea:    1 Access (The Crawl Docks)",
          },
          pitfall:
            "Writing findings as conclusions (*product pages have SEO problems*) with no URL, tool or date. Nobody can check them, and nobody can tell later whether they were fixed.",
          sources: [GOOGLE_HOW_SEARCH, GSC_URL_INSPECTION, GSC_PAGE_INDEXING],
        },
        {
          id: "c-baseline",
          quiz: {
            kind: "blank",
            id: "cq-baseline",
            prompt: "Complete the rule from the card.",
            text: "Record the baseline ___ you fix anything, even the obvious blocker, and write down the ___ of each number.",
            answers: ["before", "date"],
            distractors: ["after", "owner"],
            explanation:
              "Without a dated before, no later number can show that a fix worked. The card says to take the baseline first, even if it takes only an hour.",
          },
          term: "The baseline",
          summary: "Before changing anything, record where you stand: prompt-set results, first-party AI reports, AI referral visits and bot activity.",
          explanation:
            "You can only show progress against a starting point. Record each of these with its date and date range:\n\n- **Your prompt-set results**: mention rate, citation rate and share of voice, with the platforms and settings you used.\n- **Search Console's Generative AI performance report**, which \"shows data about how your site performs in generative AI features on Google Search\".\n- **Bing Webmaster Tools AI Performance**, which shows \"how often your content is cited in generative answers\". Its Citation Share view \"shows how much of the citation space your site receives for a specific grounding query\".\n- **AI Assistant sessions in Google Analytics.** Google defines that default channel as the one \"by which users arrive at your site from sources like ChatGPT, Gemini, Deepseek, Copilot, or Grok.\"\n- **Verified bot fetches** from your server logs.\n\nKeep the raw exports, not just the totals, so a later report can be checked against them.",
          whyItMatters:
            "Without a baseline, every later number is an anecdote. With one, a 90-day plan has a before and an after.",
          example: {
            kind: "code",
            language: "text",
            caption: "A made-up baseline sheet; every figure is invented",
            code: "BASELINE: Larkfield Tea (made up), recorded 2026-11-03\n\nPrompt set: 30 prompts, logged out, 4 platforms\n  mention rate 23%   citation rate 4%   share of voice 9%\nSearch Console, Generative AI performance (last 3 months)\n  impressions 1,240\nBing Webmaster Tools, AI Performance (last 30 days)\n  total citations 38\nGA4, AI Assistant channel (last 30 days)\n  sessions 112\nVerified bot fetches, server logs (last 30 days)\n  OAI-SearchBot 0 (blocked)   Googlebot 4,310   Bingbot 2,050",
          },
          pitfall:
            "Fixing the obvious blocker on day one and measuring afterwards. You lose the \"before\" that shows the fix worked; take the baseline first, even if it takes only an hour.",
          sources: [GOOGLE_GENAI_REPORT, BING_AI_PERFORMANCE, BING_AI_INSIGHTS, GA4_CHANNELS],
        },
      ],
      check: [
        {
          kind: "choice",
          id: "q-audit-order",
          prompt: "Which audit area does the course check first, and why?",
          options: [
            "Content, because it is what engines quote",
            "Access, because nothing else matters until bots can reach and index the pages",
            "Authority, because AI answers lean on other sites",
            "Measurement, because you need numbers before anything",
          ],
          answer: 1,
          explanation:
            "If a platform's bot can't reach a page, or the page isn't indexed, content, markup and authority can't show up on that platform. (The baseline is recorded before fixes, but the audit checks access first.)",
        },
        {
          kind: "choice",
          id: "q-audit-standard",
          prompt: "According to Google's advice on hiring an SEO, what should an audit give you?",
          options: [
            "A guaranteed first place in search results",
            "Realistic estimates of improvement and an estimate of the work involved",
            "A list of every possible issue, unranked",
            "Write access to Search Console for the auditor",
          ],
          answer: 1,
          explanation:
            "Google says an audit should give realistic estimates of improvement and of the work involved, warns against anyone who guarantees first place, and advises giving auditors read access only.",
        },
        {
          kind: "passage",
          id: "q-audit-evidence",
          prompt: "Which finding is written so someone else can check it?",
          passages: [
            "Product pages have indexing problems and should be looked at soon.",
            "larkfieldtea.example/tea/assam-breakfast and 399 other product pages: not indexed because of a noindex tag (Page indexing report and URL Inspection live test, 2026-11-03). Area: Access.",
          ],
          answer: 1,
          explanation:
            "The second names the URLs, what was seen, the tools, the date and the area, so a developer can reproduce it and confirm the fix. (Larkfield Tea is made up.)",
        },
      ],
    },
    {
      id: "g-prioritize",
      title: "Prioritizing",
      concepts: [
        {
          id: "c-blockers-first",
          quiz: {
            kind: "choice",
            id: "cq-blockers-first",
            prompt: "Besides robots.txt and indexing, what else does Google say a site needs to be eligible for its generative AI features?",
            options: [
              "To be included in Search generative AI features in Search Console",
              "An llms.txt file",
              "A paid Search Console plan",
              "Special AI markup on every page",
            ],
            answer: 0,
            explanation:
              "Google's guide says a site must be included in Search generative AI features in Search Console, in addition to the technical requirements, so the setting belongs in the blocker tier.",
          },
          term: "Blockers first",
          summary: "Fix anything that stops a platform reaching or showing your pages before anything else, because it cancels out all other work.",
          explanation:
            "Some findings switch a platform off entirely. OpenAI: \"Sites that are opted out of OAI-SearchBot will not be shown in ChatGPT search answers\". Google: a page must be \"indexed and eligible to be shown in Google Search with a snippet\" to be a supporting link in AI Overviews or AI Mode. Google's AI guide adds a setting that is easy to miss: \"In addition to the technical requirements for Search, a site must be included in Search generative AI features in Search Console to be eligible for display in generative AI features on Google Search.\"\n\nWhile a blocker stands, better content, markup or coverage can't show up on that platform at all. So the first tier of any plan is: robots.txt groups, firewall and CDN rules, noindex and nosnippet mistakes, the Search Console setting above, and important pages missing from Google's or Bing's index.",
          whyItMatters:
            "Blockers are usually the cheapest fixes with the biggest effect, often a single line of robots.txt, one firewall rule or one setting.",
          pitfall:
            "Starting with the most interesting project (a research report, a schema overhaul) while a bot is still blocked. Clear the door first.",
          sources: [OPENAI_CRAWLERS, GOOGLE_AI_FEATURES, GOOGLE_AI_GUIDE],
        },
        {
          id: "c-impact-effort",
          quiz: {
            kind: "choice",
            id: "cq-impact-effort",
            prompt: "An item is low impact and high effort. Which box does it go in?",
            options: ["Quick win", "Project", "Fill-in", "Drop"],
            answer: 3,
            explanation: "Low impact and high effort is the Drop box: stop doing it, and say so in the plan.",
          },
          term: "Impact and effort",
          summary: "After blockers, rank the remaining work by likely impact and effort, and drop the tactics the platforms say don't matter.",
          explanation:
            "Put each finding in one of four boxes:\n\n- **Quick wins** (high impact, low effort): an answer-first opening for your three most important pages, fixing markup that contradicts the page.\n- **Projects** (high impact, high effort): original research for digital PR, a review program, rewriting a whole product range.\n- **Fill-ins** (low impact, low effort): do them when there is time.\n- **Drop** (low impact, high effort): stop.\n\nThe platforms help you fill the last box. Google's guide says: \"For Google Search, you can ignore tactics like \"chunking\" content, creating unnecessary AI text files (like llms.txt), or pursuing inauthentic mentions.\" It also warns against overfocusing on structured data: \"Structured data isn't required for generative AI search, and there's no special schema.org markup you need to add.\" And it reminds you that \"you don't need to accomplish everything in this guide in order to succeed on Google Search.\"",
          whyItMatters:
            "Every program has more ideas than time. A visible ranking makes the trade-offs explicit, so the team agrees on what isn't being done as well as what is.",
          pitfall:
            "Treating every audit finding as equally urgent. A list of 60 unranked issues is a to-do list, not a plan.",
          sources: [GOOGLE_AI_GUIDE],
        },
        {
          id: "c-confidence",
          quiz: {
            kind: "match",
            id: "cq-confidence",
            prompt: "Match each piece of support to the confidence the card gives it.",
            pairs: [
              { term: "The platform's own documentation says so", definition: "High (100%)" },
              { term: "Your own prompt-set data or a past test", definition: "Medium (80%)" },
              { term: "A vendor's blog post or a social media thread", definition: "Low (50%)" },
            ],
            explanation:
              "Intercom's scale is 100% high, 80% medium and 50% low. The card maps platform docs to high, your own data to medium, and unsupported claims to low.",
          },
          term: "Confidence: how sure are you?",
          summary: "Score each item for how sure you are of its impact, so exciting but unproven ideas don't jump the queue.",
          explanation:
            "Impact and effort leave out one thing: how sure you are. Intercom's RICE method, published by Sean McBride, scores each idea on reach, impact, confidence and effort, and multiplies reach, impact and confidence before dividing by effort. Its reason for confidence fits AEO well: \"To curb enthusiasm for exciting but ill-defined ideas, factor in your level of confidence about your estimates.\" The article's scale is 100% for high, 80% for medium and 50% for low.\n\nIn AEO, tie confidence to evidence. **High**: the platform documents it (unblocking OAI-SearchBot, removing a stray noindex). **Medium**: your own data points to it (pages that answer first already get cited more in your prompt set). **Low**: someone's blog or a social thread says so.\n\nThe score is a guide, not a rule. McBride notes that \"One project may be a dependency for another project, so it needs to happen first\", which is exactly why blockers sit above any score.",
          whyItMatters:
            "Confidence is the honest column. It lets you fund a promising experiment while showing everyone it is a bet, not a sure thing.",
          example: {
            kind: "code",
            language: "text",
            caption: "Made-up RICE scores for Larkfield Tea (reach = prompts in the set it could affect)",
            code: "Item                                 Reach Impact Conf. Effort Score\nAnswer-first openings, 10 products     12    2    80%    1    19.2\nOrganization markup with sameAs        10   0.5   80%   0.5    8.0\nAnswer-first rewrite, all 400 pages    30    2    80%    8     6.0\nOriginal tea-buyer survey for PR        8    3    50%    3     4.0\n\nScore = Reach x Impact x Confidence / Effort (effort in person-months)",
          },
          pitfall:
            "Giving every idea 100% confidence because the person proposing it is enthusiastic. As McBride puts it: \"Be honest with yourself: how much support do you really have for your estimates?\"",
          sources: [INTERCOM_RICE],
        },
        {
          id: "c-tickets",
          quiz: {
            kind: "spot",
            id: "cq-tickets",
            prompt: "Which line of this ticket can't be checked when the work is done?",
            language: "text",
            lines: [
              "Title: Remove noindex from the product page template",
              "Owner: Priya (web developer)",
              "Why: finding A-03, 400 product pages not indexed",
              "Done when: we get more AI citations",
            ],
            answer: 3,
            explanation:
              "Done-when should be a test the owner can run, such as a passing URL Inspection live test and a started validation. Citations depend on things the ticket doesn't control. (The ticket is made up.)",
          },
          term: "From finding to ticket",
          summary: "A finding says what is wrong; a ticket says who fixes it, what done looks like, and how you will check.",
          explanation:
            "Findings sit in an audit; tickets get done. Rewrite each finding you keep as a ticket with:\n\n- **A title that is an action**, starting with a verb.\n- **One owner**, a named person, not a team.\n- **Why**: the finding ID and the source behind it.\n- **Done when**: a check the owner can run, about the work itself.\n- **How to verify**, and when.\n\nFor indexing fixes, Search Console builds the check in: \"If you do fix all instances of an issue, we recommend testing your fix by running the live test on a few pages (if your fix is something that can be tested), and then clicking Validate fix to tell Google.\" Set expectations in the ticket too: \"Validation typically takes up to about two weeks, but in some cases can take much longer, so please be patient.\" And fix every instance first, because \"If you missed a fix, validation will stop when Google finds a single remaining instance of that issue.\"",
          whyItMatters:
            "Most audits fail between the report and the backlog. A ticket with an owner and a testable done-when is what moves a finding into a sprint.",
          example: {
            kind: "before-after",
            before: "SEO: fix indexing issues on product pages (high priority)",
            after:
              "Remove the noindex tag from the product page template. Owner: Priya (web developer). Why: finding A-03; 400 product pages not indexed. Done when: URL Inspection live test on 5 product URLs shows the page can be indexed, and Validate fix is started in the Page indexing report. Recheck: in two weeks.",
            note: "A made-up Larkfield Tea ticket and a made-up owner. The second version can be picked up, finished and checked without a meeting.",
          },
          pitfall:
            "Assigning a ticket to a whole team, or writing done-when as an outcome nobody controls (more citations). Outcomes belong in the report; tickets need a check the owner can run.",
          sources: [GSC_URL_INSPECTION, GSC_PAGE_INDEXING],
        },
      ],
      check: [
        {
          kind: "choice",
          id: "q-prior-first",
          prompt: "An audit finds: no Organization markup, thin product descriptions, OAI-SearchBot disallowed, and no Wikipedia article. What goes first?",
          options: [
            "Writing a Wikipedia article",
            "Allowing OAI-SearchBot",
            "Rewriting product descriptions",
            "Adding Organization markup",
          ],
          answer: 1,
          explanation:
            "The robots.txt block keeps the site out of ChatGPT search answers entirely, and fixing it is one line. The others matter, but none can show up in ChatGPT search while the block stands.",
        },
        {
          kind: "match",
          id: "q-prior-boxes",
          prompt: "Match each piece of work to its box.",
          pairs: [
            { term: "Fix Product markup that shows last year's price", definition: "Quick win" },
            { term: "Run and publish an original customer survey", definition: "Project" },
            { term: "Add alt text to a few old blog images", definition: "Fill-in" },
            { term: "Split every page into tiny chunks for Google's AI", definition: "Drop" },
          ],
          explanation:
            "A price mismatch is fast to fix and breaks Google's guidelines. Original research takes effort and earns coverage. Old alt text is minor. Google says chunking content can be ignored for Google Search.",
        },
        {
          kind: "choice",
          id: "q-prior-ticket",
          prompt: "Which done-when line belongs on a ticket to correct prices in Product markup?",
          options: [
            "Done when: Larkfield appears in more AI shopping answers",
            "Done when: the markup price matches the visible price on the 10 sampled product pages",
            "Done when: the team feels the markup is better",
            "Done when: Google confirms Larkfield is approved",
          ],
          answer: 1,
          explanation:
            "A done-when line is a check the owner can run on the work itself. Appearing in answers is an outcome for the report, and Google doesn't approve sites. (Larkfield Tea is made up.)",
        },
      ],
    },
    {
      id: "g-reporting",
      title: "Roadmaps and reporting",
      concepts: [
        {
          id: "c-roadmap",
          quiz: {
            kind: "passage",
            id: "cq-roadmap",
            prompt: "Which roadmap item follows the card's advice?",
            passages: [
              "Q1: Optimize content for AI search.",
              "By Jan 31: rewrite the opening of the 10 best-selling product pages answer-first (owner: Sam). Review on Feb 28 against the baseline.",
            ],
            answer: 1,
            explanation:
              "The second has an outcome, a scope, an owner, a ship date and a separate review date. The first can't be finished or checked. (The item is made up.)",
          },
          term: "A roadmap people can act on",
          summary: "A roadmap groups tickets into dated outcomes, each with an owner, and a review date set after the work ships.",
          explanation:
            "A roadmap is the plan you show outside your team: the tickets grouped into a few outcomes, in order, with dates. Each item needs an outcome in plain words, a scope (which pages, which platforms), one owner, a ship date, the measure you will check, and any dependency (the robots.txt fix comes before the content work it unlocks).\n\nGive each item two dates, because shipping and seeing an effect are different moments. Google's starter guide says: \"Some changes might take effect in a few hours, others could take several months.\" It also says: \"In general, you likely want to wait a few weeks to assess whether your work had beneficial effects in Google Search results.\" Put the review date a few weeks after the ship date, and say which baseline number you will compare.\n\nKeep the roadmap short enough to read in a minute. The tickets hold the detail.",
          whyItMatters:
            "Leaders fund outcomes, not task lists. A dated roadmap with owners lets them see what they are getting and when to expect to know whether it worked.",
          example: {
            kind: "before-after",
            before: "Q1: Optimize content for AI. Improve schema. Do PR.",
            after:
              "By Jan 31: answer-first openings on the 10 best-selling product pages (owner: Sam, content). Ships after the noindex fix. Review Feb 28: citation rate on the 12 product prompts and Search Console's Generative AI impressions for those pages, against the November baseline.",
            note: "A made-up Larkfield Tea roadmap item with a made-up owner. The second version says what, which pages, who, when it ships, what it depends on, and when and how it will be judged.",
          },
          pitfall:
            "Reviewing a change the week it ships and calling it a failure. Set the review date when you set the ship date, so nobody judges too early.",
          sources: [GOOGLE_STARTER],
        },
        {
          id: "c-honest-claims",
          quiz: {
            kind: "choice",
            id: "cq-honest-claims",
            prompt: "What should you promise a client, according to the card?",
            options: [
              "A citation in AI Overviews by a set date",
              "The work (fixes, content, outreach) and the measurement",
              "A #1 ranking on Google",
              "That Google has approved your method",
            ],
            answer: 1,
            explanation:
              "Google says no one can guarantee a #1 ranking, and it doesn't even guarantee crawling, indexing or serving. Promise what you control: the work and the measurement.",
          },
          term: "Honest claims",
          summary: "Promise work and measurement, never rankings or citations, and back every claim with evidence or label it as opinion.",
          explanation:
            "Google is plain about promises: \"No one can guarantee a #1 ranking on Google.\" It doesn't promise itself anything either: \"Google doesn't guarantee that it will crawl, index, or serve your page, even if your page follows the Google Search Essentials.\" Nobody can guarantee a citation in an AI answer. Its guidance on third-party tools adds: \"Third-party tools don't have access to our internal ranking data. They can't guarantee performance.\"\n\nThe same guidance sets the bar for any advice, including yours: \"good advice either qualifies their claims as opinion based on data or experience, or backs up their claims by citing official Google Search guidance.\" That is how this course is built, and how your reports should be too. In practice, every claim in a report is one of three kinds: a measured number with its source and date, a platform's documented rule with a link, or your opinion, labeled as such.",
          whyItMatters:
            "AEO attracts hype. Being the person in the room whose claims hold up is what keeps a program funded after the first quarter.",
          pitfall:
            "Promising a client a place in AI Overviews by a set date. Promise the work (fixes, content, outreach) and the measurement; report what happened.",
          sources: [GOOGLE_NEED_SEO, GOOGLE_THIRD_PARTY, GOOGLE_HOW_SEARCH],
        },
        {
          id: "c-stakeholders",
          quiz: {
            kind: "choice",
            id: "cq-stakeholders",
            prompt: "What does the working team need from you, according to the card?",
            options: [
              "Only the headline trend",
              "The full prompt-set log, every change shipped, and the findings still open",
              "A promise of next month's numbers",
              "Nothing until the quarter ends",
            ],
            answer: 1,
            explanation:
              "Leaders get the trend, what was done, what's next and the decisions needed. The working team gets the detail it can act on.",
          },
          term: "Reporting to clients and stakeholders",
          summary: "Give each audience the same facts at the depth it needs: decisions and trends for leaders, detail and changes for the people doing the work.",
          explanation:
            "Google's list of questions to ask an SEO doubles as a list of what a client will ask you. Among them: \"What kind of results do you expect to see, and in what timeframe?\" \"How do you measure your success?\" and whether you will \"share with me all the changes you make to my site, and provide detailed information about your recommendations and the reasoning behind them\".\n\nSo, for each audience:\n\n- **Leaders and clients**: the trend in a few numbers from your monthly report, what was done, what is next, and the decisions you need from them.\n- **The working team**: the full prompt-set log, every change shipped, and the findings still open.\n\nA leader's update fits in five lines: the numbers against the baseline, what shipped, what is next, any risk, and the decision you need. Use the same order every month so readers know where to look.",
          whyItMatters:
            "The same report pitched at the wrong depth fails twice: leaders skip a wall of detail, and practitioners can't act on a headline.",
          example: {
            kind: "before-after",
            before:
              "Lots of progress this month! We did a big push on AI optimization and things are looking really positive. More to come next month.",
            after:
              "Citation rate 6% (baseline 4%, 30 prompts). Shipped: OAI-SearchBot unblocked, prices fixed in markup. Next: answer-first rewrites of 10 product pages. Risk: product template change waits on the dev sprint. Decision needed: approve the customer survey budget by Dec 15.",
            note: "A made-up Larkfield Tea update; the figures are invented. The second version gives the number against the baseline, what shipped, what's next, the risk and the one decision needed.",
          },
          pitfall:
            "Hiding a bad month. Show the same rows every time; a dip explained honestly builds more trust than a report that only ever goes up.",
          sources: [GOOGLE_NEED_SEO],
        },
        {
          id: "c-reading-change",
          quiz: {
            kind: "choice",
            id: "cq-reading-change",
            prompt: "AI Assistant visits dropped in December. What does the card say to check first?",
            options: [
              "Whether the same period last year dropped too, using a like-for-like comparison",
              "Nothing: report it as a failure",
              "Whether to switch every page to a new tactic",
              "Only the last two days of data",
            ],
            answer: 0,
            explanation:
              "Google's traffic-drop guide says to compare with a similar period and look over 16 months, so a seasonal dip isn't mistaken for a problem.",
          },
          term: "Reading a change honestly",
          summary: "Before you claim credit or blame, compare like with like, check for seasonality and preliminary data, and line the change up with what shipped.",
          explanation:
            "Numbers move for reasons that have nothing to do with your work. Google's guide to traffic drops suggests viewing the last 16 months, because \"This will help you analyze the traffic drop in context and make sure it's not a drop that happens every year due to a festivity or a trend.\" It also suggests comparing the drop period to a similar period, and reminds you that \"some changes can take effect in a few days, while others could take several months.\"\n\nRun the same checks before you report any change:\n\n- **Like for like**: same prompts, same platforms, same length of period. Bing's Compare view lets you \"compare the current 30-day period against the prior 30 days\".\n- **Smooth the noise**: in Search Console, weekly and monthly views are \"used to analyze longer-term trends by smoothing out daily fluctuations\".\n- **Skip preliminary data**: \"The newest data can be preliminary, meaning it's still being collected and might change in the next few hours.\"\n- **Line it up** with your changelog and the platforms' own updates.",
          whyItMatters:
            "Claiming credit for a seasonal rise is as damaging as panicking over a seasonal dip. Both cost you trust when the pattern repeats next year.",
          pitfall:
            "Reporting a week-on-week swing in a 30-prompt set as a trend. AI answers vary from run to run; wait for the monthly comparison.",
          sources: [GOOGLE_DROPS, GSC_PERFORMANCE, BING_AI_INSIGHTS],
        },
      ],
      check: [
        {
          kind: "passage",
          id: "q-report-promise",
          prompt: "Which line belongs in a proposal to a new client?",
          passages: [
            "We guarantee your brand will be cited in ChatGPT and AI Overviews within 60 days.",
            "In 90 days we'll fix access issues, rewrite your top 20 pages answer-first, add accurate markup, and report your prompt-set results and Google and Bing AI data each month.",
          ],
          answer: 1,
          explanation:
            "Google says no one can guarantee a #1 ranking, and no platform promises citations. The second line promises the work and the measurement, which you control.",
        },
        {
          kind: "blank",
          id: "q-report-google",
          prompt: "Complete Google's sentence on judging advice.",
          text: "Good advice either qualifies their claims as ___ based on data or experience, or backs up their claims by citing official Google Search ___.",
          answers: ["opinion", "guidance"],
          distractors: ["fact", "rankings", "rumors"],
          explanation:
            "Google's third-party guidance asks advice to be labeled as opinion or backed by its official guidance. Hold your own reports to the same standard.",
        },
        {
          kind: "choice",
          id: "q-report-change",
          prompt: "Citation rate on the 30-prompt set rose from 4% to 6% the week after a fix shipped. What should the report say?",
          options: [
            "The fix worked: citations are up by half",
            "Early movement noted; the monthly rerun on the same prompts and platforms will show whether it holds",
            "Nothing, because AI visibility can't be measured",
            "The fix failed, because the rise is small",
          ],
          answer: 1,
          explanation:
            "AI answers vary from run to run, and changes can take weeks to show. Report the movement honestly and wait for the like-for-like monthly comparison before calling it a trend. (The figures are made up.)",
        },
      ],
    },
    {
      id: "g-90-days",
      title: "Your 90-day plan and beyond",
      concepts: [
        {
          id: "c-90-day-plan",
          quiz: {
            kind: "choice",
            id: "cq-90-day-plan",
            prompt: "What happens in days 1–30 of the plan?",
            options: [
              "Build the prompt set, take the baseline, set up the reports and fix every access blocker",
              "Pitch original research to journalists",
              "Rewrite every page on the site",
              "Send the first full monthly report",
            ],
            answer: 0,
            explanation:
              "The first month is see and unblock. Content comes in month two and work beyond the site, plus the first full report, in month three.",
          },
          term: "The 90-day plan",
          summary: "Days 1–30: baseline and access. Days 31–60: content and structured data. Days 61–90: authority work and the first full report.",
          explanation:
            "A first quarter that follows the course:\n\n- **Days 1–30: see and unblock.** Build the prompt set and take the baseline. Open the Search Console and Bing reports and check the AI Assistant channel in Analytics. Fix every access blocker, confirm indexing, and turn the audit into tickets with owners.\n- **Days 31–60: make the pages worth citing.** Rewrite your most important pages answer-first. Add or correct Organization, Article and Product markup, with one @id and sameAs.\n- **Days 61–90: work beyond the site.** Start a genuine review program, take part openly where your customers talk, and pitch one piece of original research. Rerun the prompt set and send the first full monthly report.\n\nGoogle's recap points the same way: apply SEO best practices, create content that is \"helpful, reliable, and people-first\", and \"Use the Generative AI performance report to see how your content is performing\".",
          whyItMatters:
            "Ninety days is long enough to fix the foundations and show a first measured change, and short enough to keep the business's attention.",
          example: {
            kind: "code",
            language: "text",
            caption: "Larkfield Tea's made-up 90-day plan on one page",
            code: "90-DAY PLAN: Larkfield Tea (made up)\n\nDays 1-30   Baseline (30 prompts, 4 platforms, reports)\n            Unblock OAI-SearchBot; remove product noindex\n            Fix markup prices; tickets for every kept finding\nDays 31-60  Answer-first openings: 10 best sellers, then the rest\n            Organization markup with one @id and sameAs\nDays 61-90  Review requests to every buyer, not just happy ones\n            Customer survey pitched to 5 trade titles\n            Rerun prompt set; first full monthly report",
          },
          pitfall:
            "Packing all six areas into month one. Access and measurement come first because every later month depends on them.",
          sources: [GOOGLE_AI_GUIDE],
        },
        {
          id: "c-cadence",
          quiz: {
            kind: "choice",
            id: "cq-cadence",
            prompt: "Why keep your own prompt set when Bing already shows Citation Share?",
            options: [
              "Bing's Citation Share doesn't expose competitor domains",
              "Bing's Citation Share is a ranking of the best sites",
              "Bing requires a prompt set before showing data",
              "Citation Share only works for local businesses",
            ],
            answer: 0,
            explanation:
              "Bing says Citation Share doesn't expose competitor domains. Your own prompt set, rerun on the same schedule, is how you compare yourself with rivals across platforms.",
          },
          term: "A cadence for measurement",
          summary: "Rerun the same prompt set monthly, pull the first-party reports on the same days, and re-audit each quarter.",
          explanation:
            "A program needs a rhythm, so each number is collected the same way every time:\n\n- **Weekly**: check the blocker tier (robots.txt, firewall, noindex) and your bot logs, so a release can't quietly switch a platform off.\n- **Monthly**: rerun the same prompt set on the same platforms, logged out, and log it in the [Share of Voice Tracker](/tools/share-of-voice-tracker). On the same day, pull Search Console's Generative AI performance report, Bing's AI Performance and the AI Assistant channel.\n- **Quarterly**: re-audit the sample, review the prompt set, and reread the platform documentation.\n\nKnow what each first-party report can't tell you. Bing says Citation Share \"is designed as an observational metric\" and \"It does not expose competitor domains, represent traffic share, or assign quality scores to content.\" Your own prompt set is where competitors show up. Search Console's report covers only Google's own generative AI features, AI Overviews and AI Mode, so it can't speak for ChatGPT or Perplexity either.",
          whyItMatters:
            "A fixed cadence turns scattered checks into a trend line. Rerunning the same prompts on the same schedule is the only way month-to-month changes mean something.",
          pitfall:
            "Changing the prompt set every month to chase new questions. Add new prompts at the quarterly review, and keep the old ones so the trend survives.",
          sources: [BING_AI_INSIGHTS, GOOGLE_GENAI_REPORT],
        },
        {
          id: "c-governance",
          quiz: {
            kind: "choice",
            id: "cq-governance",
            prompt: "Which of these goes on the program's do-not-do list, according to the card?",
            options: [
              "Rewriting pages answer-first",
              "Asking employees to post reviews without saying they work for you",
              "Fixing markup that contradicts the page",
              "Rerunning the prompt set monthly",
            ],
            answer: 1,
            explanation:
              "The FTC says employees endorsing a company's products should disclose the relationship. Undisclosed employee reviews are a red line.",
          },
          term: "Review, risk and red lines",
          summary: "Write down what the program will never do, and route claims, reviews and outreach through the right review before they ship.",
          explanation:
            "AEO tempts people to cut corners, so put the limits in writing before anyone is under pressure. Start the do-not-do list with the platforms' own rules:\n\n- **Scaled content**: Google's spam policies give as an example \"Using generative AI tools or other similar tools to generate many pages without adding value for users\".\n- **Hidden text**: \"the practice of placing content on a page in a way solely to manipulate search engines and not to be easily viewable by human visitors.\"\n- **Fake mentions**: Google's AI guide lists \"pursuing inauthentic mentions\" among tactics to ignore.\n- **Undisclosed endorsements**: the FTC says that when an endorser has a connection to the marketer that readers wouldn't expect, \"that connection should be disclosed clearly and conspicuously.\" For staff, \"employees endorsing the post should disclose their relationship to the company.\"\n\nThen decide who reviews what: legal for claims about prices, health, safety or competitors; brand for tone; a named owner for robots.txt and firewall changes.",
          whyItMatters:
            "One fake-review program or AI content farm can cost more than the whole program earns, in penalties, in manual actions and in trust. A written list makes saying no easy.",
          pitfall:
            "Treating governance as paperwork for later. The pressure to cut corners peaks in a bad month, which is exactly when an unwritten rule gets broken. (This lesson isn't legal advice; take claims questions to your own counsel.)",
          sources: [GOOGLE_SPAM, GOOGLE_AI_GUIDE, FTC_ENDORSEMENTS],
        },
        {
          id: "c-agencies",
          quiz: {
            kind: "choice",
            id: "cq-agencies",
            prompt: "An agency is starting an audit. What Search Console access does Google advise giving it at this stage?",
            options: [
              "Read access only, not write access",
              "Verified owner, so it can add users",
              "The client's own Google account password",
              "No access until the contract ends",
            ],
            answer: 0,
            explanation:
              "Google's page on hiring an SEO says to grant only read access to Search Console during an audit and not write access.",
          },
          term: "Working with agencies and clients",
          summary: "Keep ownership with the business, give the least access that does the job, and ask every adviser to show their sources.",
          explanation:
            "Whichever side you are on, set up access the same way. Google's advice for an audit: \"only grant read access to Search Console (at this stage, don't grant them write access).\" Search Console's permission levels map onto that. A **restricted user** \"Has simple view rights on most data.\" A **full user** \"Has view rights to all data and can take some actions.\" Owners \"can add and remove other users, configure settings, view all data, and use all tools.\"\n\nThe business should always hold verified ownership itself. Google warns that \"If the only verified owner of your site leaves your team, you should verify ownership to maintain (or regain) access to the property.\" The same goes for Analytics, Bing Webmaster Tools and the CDN.\n\nAgree on transparency at the start: \"If an SEO has FTP access to your server, they should be willing to explain all the changes they are making to your site.\" And remember that \"using a service or tool doesn't guarantee ranking success.\"",
          whyItMatters:
            "When an agency relationship ends, the business keeps its data, its history and its access. Least access also limits the damage one mistake can do.",
          pitfall:
            "Letting an agency verify the client's site under the agency's own account as the only owner. When the contract ends, the client can lose access to its own history.",
          sources: [GOOGLE_NEED_SEO, GSC_USERS, GOOGLE_THIRD_PARTY],
        },
        {
          id: "c-keep-current",
          quiz: {
            kind: "choice",
            id: "cq-keep-current",
            prompt: "Where should you confirm that a platform changed something?",
            options: [
              "The vendor's own changelog or documentation page",
              "A blog post summarizing the change",
              "A competitor's report",
              "A social media thread",
            ],
            answer: 0,
            explanation:
              "The card says to go to the vendor's own changelog or page, as every lesson in the course has, rather than relying on someone's summary.",
          },
          term: "Keeping the program current",
          summary: "After the first quarter, keep the monthly report going and recheck each platform's documentation, because the rules change.",
          explanation:
            "AI search changes faster than most of SEO. Two examples from this course: Google's documentation changelog records that the FAQ rich result \"will no longer appear in Google Search starting May 7, 2026\", years after FAQ markup became standard advice. And in June 2026 Bing added four new views to its AI reporting: \"Intents, Topics, Citation Share, and Compare.\" One change removed something you may have relied on; the other gave you new data to use.\n\nBuild the check into the program: each quarter, reread the vendor pages you rely on (the crawler pages from The Crawl Docks, Google's AI features and AI guide pages, the reporting help pages), note the date, and update your robots.txt, markup, reports and do-not-do list if anything moved. Keep a short log of what you checked and when, so the next person can carry on.",
          whyItMatters:
            "A program built on last year's documentation slowly drifts into doing things that no longer work, or missing new reports and controls.",
          pitfall:
            "Relying on a blog post's summary of a change. Go to the vendor's own changelog or page, as every lesson in this course has.",
          sources: [GOOGLE_UPDATES, BING_AI_INSIGHTS],
        },
      ],
      check: [
        {
          kind: "order",
          id: "q-90-order",
          prompt: "Put these in the order of the 90-day plan.",
          items: [
            "Take the baseline and fix access blockers",
            "Rewrite key pages answer-first and correct the markup",
            "Start reviews, community work and a research pitch",
            "Rerun the prompt set and send the first full report",
          ],
          explanation:
            "See and unblock, then make the pages worth citing, then work beyond the site, then measure the change against the baseline.",
        },
        {
          kind: "choice",
          id: "q-90-current",
          prompt: "How should a program keep up with platform changes?",
          options: [
            "Follow whichever tactic is trending on social media",
            "Reread the vendors' own documentation and changelogs on a schedule, and update the program when something changes",
            "Never change anything once the first quarter is done",
            "Rely on a third-party tool's claims about what Google wants",
          ],
          answer: 1,
          explanation:
            "Vendor pages and changelogs are the primary sources. Google warns that third-party tools don't have access to its internal ranking data.",
        },
        {
          kind: "match",
          id: "q-90-cadence",
          prompt: "Match each task to how often the course suggests doing it.",
          pairs: [
            { term: "Check robots.txt, firewall rules and bot logs", definition: "Weekly" },
            { term: "Rerun the same prompt set and pull the AI reports", definition: "Monthly" },
            { term: "Re-audit the sample and reread platform documentation", definition: "Quarterly" },
          ],
          explanation:
            "Blockers can appear with any release, so check them often. Prompt-set results need a steady monthly rhythm. Audits and documentation reviews fit a quarterly cycle.",
        },
        {
          kind: "choice",
          id: "q-90-access",
          prompt: "A client's only verified Search Console owner is the agency's account. What should change?",
          options: [
            "Nothing: the agency does the work, so it should own the property",
            "The client verifies ownership itself and gives the agency only the access it needs",
            "The client shares its password with the agency instead",
            "The property is deleted and recreated each year",
          ],
          answer: 1,
          explanation:
            "Ownership stays with the business, and the agency gets the least access that does the job. Google warns that losing the only verified owner means re-verifying to regain access.",
        },
      ],
    },
  ],

  exercise: {
    id: "x-prioritize-audit",
    title: "Prioritize the audit",
    brief:
      "You've audited Larkfield Tea (made up). The findings: OAI-SearchBot is disallowed in robots.txt; Product markup shows last year's prices; all 400 product pages open with three paragraphs of brand story before any facts; there is no Organization markup; there is no prompt set or baseline; and the agency wants to add an llms.txt file and \"chunk\" every page for AI. Turn this into a plan, a ticket and a first update.",
    steps: [
      {
        kind: "choice",
        id: "x-step-day-one",
        prompt: "What does Larkfield do first, this week?",
        options: [
          "Rewrite all product pages",
          "Record the baseline, then remove OAI-SearchBot from the blocking group",
          "Add llms.txt and chunk the pages",
          "Pitch a story to journalists",
        ],
        answer: 1,
        explanation:
          "Take the baseline so the effect of the fix can be seen, then clear the blocker: while OAI-SearchBot is disallowed, Larkfield can't appear in ChatGPT search answers at all.",
      },
      {
        kind: "match",
        id: "x-step-boxes",
        prompt: "Put each finding in its box.",
        pairs: [
          { term: "Product markup shows last year's prices", definition: "Quick win" },
          { term: "All 400 product pages bury the facts under brand story", definition: "Project" },
          { term: "Chunk every page for Google's AI", definition: "Drop" },
        ],
        explanation:
          "Correcting prices in markup is fast and fixes a guideline breach. Rewriting every product page answer-first is the big content project. Google says chunking can be ignored for Google Search. (Organization markup goes into month two, with the rest of the structured data.)",
      },
      {
        kind: "choice",
        id: "x-step-llms",
        prompt: "How do you answer the agency's llms.txt idea?",
        options: [
          "Do it first: it is required for AI Overviews",
          "Google says it ignores llms.txt for Search, so it doesn't belong in the first 90 days; revisit it only if another platform documents using it",
          "Do it instead of fixing robots.txt",
          "Ban it permanently",
        ],
        answer: 1,
        explanation:
          "Google's guide says Google Search ignores llms.txt files and that creating one neither harms nor helps visibility there. It isn't harmful, just low priority until a platform you care about documents using it.",
      },
      {
        kind: "spot",
        id: "x-step-ticket",
        prompt: "You write the ticket for the price fix. Which line needs rewriting?",
        language: "text",
        lines: [
          "Title: Correct the price in Product markup on all product pages",
          "Owner: the web team",
          "Why: audit finding B-02; markup shows last year's prices",
          "Done when: markup price matches the visible price on 10 sampled pages",
        ],
        answer: 1,
        explanation:
          "A ticket needs one named owner, not a whole team. The other lines give an action, a reason tied to a finding, and a check the owner can run. (The ticket is made up.)",
      },
      {
        kind: "passage",
        id: "x-step-update",
        prompt: "Which first-month update would you send Larkfield's owner?",
        passages: [
          "Baseline recorded (citation rate 4% across 30 prompts). We unblocked OAI-SearchBot on day 3 and corrected prices in the markup. Next month: answer-first rewrites of the 10 best-selling product pages. No change in citations yet; we'll rerun the prompt set at day 60.",
          "Great first month! We've optimized the site for AI and expect strong results soon. AI search is the future and you're ahead of competitors.",
        ],
        answer: 0,
        explanation:
          "The first update gives the baseline, what was done, what's next and an honest \"no change yet\". The second makes claims nobody can check. (The figures are made up.)",
      },
    ],
    debrief:
      "Larkfield's plan starts small and sharp: a baseline, one robots.txt line, correct prices, each written as a ticket with one owner and a check. Then the work that takes time: pages worth citing and a reputation worth repeating. Some ideas were dropped on the platforms' own word. That is what running AEO as a program means: choices you can defend, measured against where you started.",
  },

  example: {
    title: "Google's \"Do you need an SEO?\"",
    context:
      "Google Search Central's page on hiring an SEO, last updated in June 2026 and now covering AEO and GEO services, fetched on 6 November 2026. The excerpt is from its advice on choosing and judging help.",
    excerpt: {
      kind: "quote",
      text: "An SEO audit should be about giving you realistic estimates of improvement, and an estimate of the work involved. If they guarantee you that their changes will give you first place in search results, find someone else. […] Do they cite official Google documentation as supporting evidence for their recommendations? If they have advice on optimizing for AI experiences (also known as \"AEO\" \"GEO\" services), is their advice aligned with Google Search's official guidance on optimizing for generative AI features? […] No one can guarantee a #1 ranking on Google.",
    },
    points: [
      {
        label: "Estimates, not guarantees",
        text: "An audit gives \"realistic estimates of improvement\" and the work involved. That is the shape of the audit and 90-day plan in this lesson.",
      },
      {
        label: "AEO is named",
        text: "Google now asks whether \"AEO\" or \"GEO\" advice is aligned with its official guidance on generative AI features. Expect clients to ask you the same.",
      },
      {
        label: "Cite the source",
        text: "\"Do they cite official Google documentation as supporting evidence for their recommendations?\" Every claim in your reports should pass that test, as every claim in this course has tried to.",
      },
      {
        label: "Read access only",
        text: "The page also advises giving an auditor read access to Search Console and not write access. If you're the auditor, ask for read access and explain why.",
      },
    ],
    source: GOOGLE_NEED_SEO,
  },

  audit: [
    {
      kind: "choice",
      id: "a-first-step",
      prompt: "What is the very first step of an AEO program for an existing site?",
      options: [
        "Rewrite the home page",
        "Record a baseline of where the site stands",
        "Add every schema.org type",
        "Hire a Wikipedia editor",
      ],
      answer: 1,
      explanation: "Without a baseline you can't show what changed. It comes before any fix, even a quick one.",
    },
    {
      kind: "choice",
      id: "a-blocker",
      prompt: "Why do access blockers go before other improvements?",
      options: [
        "They are the most expensive fixes",
        "While a platform can't reach or show your pages, no other improvement can appear on it",
        "Google requires them to be fixed within 30 days",
        "They only affect training, not search",
      ],
      answer: 1,
      explanation:
        "A disallowed search bot or a page that isn't indexed with a snippet keeps you off that platform whatever the content says.",
    },
    {
      kind: "match",
      id: "a-match-areas",
      prompt: "Match each audit finding to the lesson that fixes it.",
      pairs: [
        { term: "PerplexityBot blocked by the firewall", definition: "The Crawl Docks" },
        { term: "Pages open with a long warm-up before the answer", definition: "The Answer Quarter" },
        { term: "sameAs points to a news article", definition: "The Schema Works" },
        { term: "Reviews requested only from happy customers", definition: "The Agora" },
        { term: "No prompt set or baseline", definition: "The Observatory" },
      ],
      explanation: "The audit follows the course, so each finding points back to the district that covers it.",
    },
    {
      kind: "passage",
      id: "a-passage-claim",
      prompt: "Which statement can an honest consultant make?",
      passages: [
        "Our proprietary method is approved by Google and guarantees AI citations.",
        "We follow the platforms' published guidance, and we'll measure your visibility monthly against a fixed baseline.",
      ],
      answer: 1,
      explanation:
        "Google says it doesn't evaluate or endorse third-party tools and warns against claims of being \"approved\" or of guaranteed rankings. The second statement promises only what the consultant controls.",
    },
    {
      kind: "blank",
      id: "a-blank-guarantee",
      prompt: "Complete Google's sentence.",
      text: "No one can ___ a #1 ranking on Google.",
      answers: ["guarantee"],
      distractors: ["achieve", "measure", "buy"],
      explanation: "Google's page on hiring an SEO says no one can guarantee a #1 ranking, and to beware of anyone who claims to.",
    },
    {
      kind: "order",
      id: "a-order-quarter",
      prompt: "Put the months of the 90-day plan in order.",
      items: [
        "Baseline, reports and access fixes",
        "Answer-first rewrites and correct markup",
        "Reviews, community work, digital PR and the first full report",
      ],
      explanation: "See and unblock, then improve the pages, then work beyond the site and measure.",
    },
    {
      kind: "choice",
      id: "a-drop",
      prompt: "Which tactic does Google say you can ignore for Google Search?",
      options: [
        "Making sure pages are indexed",
        "Writing helpful, people-first content",
        "Chunking content into tiny pieces for AI",
        "Using Search Console's Generative AI performance report",
      ],
      answer: 2,
      explanation:
        "Google's guide says you can ignore chunking, unnecessary AI text files such as llms.txt, and inauthentic mentions, and recommends the other three.",
    },
    {
      kind: "spot",
      id: "a-spot-report",
      prompt: "Which line of this monthly report should be rewritten?",
      language: "text",
      lines: [
        "Prompt set: 30 prompts, 4 dates, logged-out sessions",
        "Citation rate: 9% (baseline 4%)",
        "AI Assistant sessions: 310 (a floor; visits without a referrer count as Direct)",
        "Next month we will be guaranteed a place in AI Overviews",
      ],
      answer: 3,
      explanation:
        "Nobody can guarantee a place in AI Overviews. Replace it with the work planned for next month. (The figures are made up.)",
    },
    {
      kind: "choice",
      id: "a-audience",
      prompt: "What does a client's leadership most need from the monthly report?",
      options: [
        "The full log of every prompt and answer",
        "A few trend numbers, what was done, what's next, and the decisions needed from them",
        "Raw server logs",
        "A list of every tool used",
      ],
      answer: 1,
      explanation: "Leaders need the trend and the decisions; the working team needs the detailed logs.",
    },
    {
      kind: "choice",
      id: "a-current",
      prompt: "Google's FAQ rich result stopped appearing in May 2026. What lesson does that teach a program manager?",
      options: [
        "Structured data is useless",
        "Recheck vendor documentation regularly and adjust the program when it changes",
        "Never use Google's features",
        "Wait for a blog post before changing anything",
      ],
      answer: 1,
      explanation:
        "Platforms change what they show. Rereading their own changelogs on a schedule keeps the program aligned with what still works.",
    },
    {
      kind: "choice",
      id: "a-ticket",
      prompt: "What turns an audit finding into a ticket someone can finish?",
      options: [
        "A longer description of the problem",
        "An action title, one named owner, the finding it comes from, and a done-when check the owner can run",
        "A high-priority label",
        "A target number of AI citations",
      ],
      answer: 1,
      explanation:
        "Owners and testable done-when lines move findings into the backlog. Citation targets are outcomes for the report, not checks for a ticket.",
    },
    {
      kind: "choice",
      id: "a-red-line",
      prompt: "Which tactic belongs on a program's do-not-do list?",
      options: [
        "Asking every buyer for an honest review",
        "Using AI tools to generate hundreds of pages without adding value for users",
        "Rewriting product pages answer-first",
        "Disclosing staff when they post about the company",
      ],
      answer: 1,
      explanation:
        "Google's spam policies name generating many pages with AI tools without adding value for users as scaled content abuse. The other three are legitimate practice.",
    },
  ],
};

// Lesson 8, The Citadel: running an AEO program.
// Claims about what Google, OpenAI and Microsoft document, and Google's advice
// on audits, guarantees and third-party SEO services, are tied to sources
// checked on the `accessed` date. The audit checklist, the prioritizing method
// and the 90-day plan are this course's own framework, built from Lessons 1–7.
// Larkfield Tea is the made-up shop from Lesson 4; its audit findings and
// numbers are invented for the exercises.

import type { LessonContent, Source } from "../lesson-types";

const ACCESSED = "2026-10-30";

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

export const LESSON_8: LessonContent = {
  intro:
    "You have reached The Citadel, the last district of the City of Answers. Everything you have learned so far is a set of tools; here you learn to run them as a program. You will audit a site from the gate to the observatory, decide what to fix first, report it honestly, and leave with a 90-day plan you can start on Monday.",

  outro:
    "You have walked the whole City of Answers: how answers are built, how bots get in, how passages get lifted, how markup and other sites describe you, how each platform works, how to measure it, and now how to run it as a program. That is the course. Once you have passed the audit in all eight lessons, your certificate is ready on the Certificate tab of your dashboard.",

  groups: [
    {
      id: "g-audit",
      title: "The AEO audit",
      concepts: [
        {
          id: "c-audit",
          term: "An AEO audit",
          summary: "An AEO audit checks six areas in order, from whether bots can reach you to whether you can measure the result, and estimates the work to fix each gap.",
          explanation:
            "Use the course as your checklist, in this order:\n\n1. **Access** (The Crawl Docks): the right bots allowed in robots.txt and through the CDN or firewall; pages indexed in Google and Bing.\n2. **Content** (The Answer Quarter): answer-first passages, question headings, honest dates.\n3. **Structured data** (The Schema Works): Organization, Article and Product markup that matches the page; one @id; sameAs.\n4. **Authority** (The Agora): reviews, forum presence, coverage, Wikipedia and Wikidata.\n5. **Platforms** (The Embassies): each platform's bot and index checked.\n6. **Measurement** (The Observatory): a prompt set, the right reports, verified bot logs.\n\nGoogle's advice on hiring an SEO sets the standard for any audit: \"An SEO audit should be about giving you realistic estimates of improvement, and an estimate of the work involved.\"",
          whyItMatters:
            "A fixed checklist means nothing is skipped because it is unfamiliar, and two audits of the same site, months apart, can be compared line by line.",
          pitfall:
            "Running an audit tool and forwarding its output. Google advises checking a tool's recommendations \"against official guidance from Google Search\" before making significant changes.",
          sources: [GOOGLE_NEED_SEO],
        },
        {
          id: "c-baseline",
          term: "The baseline",
          summary: "Before changing anything, record where you stand: prompt-set results, first-party AI reports, AI referral visits and bot activity.",
          explanation:
            "You can only show progress against a starting point. Record, with the date:\n\n- Your prompt-set results: mention rate, citation rate, share of voice.\n- Search Console's Generative AI performance report, which \"shows data about how your site performs in generative AI features on Google Search\".\n- Bing Webmaster Tools AI Performance, which shows \"how often your content is cited in generative answers\".\n- AI Assistant sessions in Google Analytics, and verified bot fetches from your logs.",
          whyItMatters:
            "Without a baseline, every later number is an anecdote. With one, a 90-day plan has a before and an after.",
          pitfall:
            "Fixing the obvious blocker on day one and measuring afterwards. You lose the \"before\" that shows the fix worked; take the baseline first, even if it takes only an hour.",
          sources: [GOOGLE_GENAI_REPORT, BING_AI_PERFORMANCE],
        },
      ],
      check: [
        {
          kind: "order",
          id: "q-audit-order",
          prompt: "Put the six audit areas in the order the course checks them.",
          items: ["Access", "Content", "Structured data", "Authority", "Platforms", "Measurement"],
          explanation:
            "From the door inwards: bots must reach the page, the page must be worth lifting, markup and other sites describe it, each platform is checked, and measurement shows what changed.",
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
      ],
    },
    {
      id: "g-prioritize",
      title: "Prioritizing",
      concepts: [
        {
          id: "c-blockers-first",
          term: "Blockers first",
          summary: "Fix anything that stops a platform reaching or showing your pages before anything else, because it cancels out all other work.",
          explanation:
            "Some findings switch a platform off entirely. OpenAI: \"Sites that are opted out of OAI-SearchBot will not be shown in ChatGPT search answers\". Google: a page must be \"indexed and eligible to be shown in Google Search with a snippet\" to be a supporting link in AI Overviews or AI Mode.\n\nWhile a blocker stands, better content, markup or coverage can't show up on that platform at all. So the first tier of any plan is: robots.txt groups, firewall rules, noindex and nosnippet mistakes, and pages missing from Google's or Bing's index.",
          whyItMatters:
            "Blockers are usually the cheapest fixes with the biggest effect, often a single line of robots.txt or one firewall rule.",
          pitfall:
            "Starting with the most interesting project (a research report, a schema overhaul) while a bot is still blocked. Clear the door first.",
          sources: [OPENAI_CRAWLERS, GOOGLE_AI_FEATURES],
        },
        {
          id: "c-impact-effort",
          term: "Impact and effort",
          summary: "After blockers, rank the remaining work by likely impact and effort, and drop the tactics the platforms say don't matter.",
          explanation:
            "Put each finding in one of four boxes:\n\n- **Quick wins** (high impact, low effort): an answer-first rewrite of your top pages, fixing markup that contradicts the page.\n- **Projects** (high impact, high effort): original research for digital PR, a review program.\n- **Fill-ins** (low impact, low effort): do them when there is time.\n- **Drop** (low impact, high effort): stop.\n\nThe platforms help you fill the last box. Google's guide says: \"For Google Search, you can ignore tactics like \"chunking\" content, creating unnecessary AI text files (like llms.txt), or pursuing inauthentic mentions.\" It also reminds you that \"you don't need to accomplish everything in this guide in order to succeed on Google Search.\"",
          whyItMatters:
            "Every program has more ideas than time. A visible ranking makes the trade-offs explicit, so the team agrees on what isn't being done as well as what is.",
          pitfall:
            "Treating every audit finding as equally urgent. A list of 60 unranked issues is a to-do list, not a plan.",
          sources: [GOOGLE_AI_GUIDE],
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
      ],
    },
    {
      id: "g-reporting",
      title: "Roadmaps and reporting",
      concepts: [
        {
          id: "c-honest-claims",
          term: "Honest claims",
          summary: "Promise work and measurement, never rankings or citations, and back every claim with evidence or label it as opinion.",
          explanation:
            "Google is plain about promises: \"No one can guarantee a #1 ranking on Google.\" Nobody can guarantee a citation in an AI answer either. Its guidance on third-party tools adds: \"Third-party tools don't have access to our internal ranking data. They can't guarantee performance.\"\n\nThe same guidance sets the bar for any advice, including yours: \"good advice either qualifies their claims as opinion based on data or experience, or backs up their claims by citing official Google Search guidance.\" That is how this course is built, and how your reports should be too.",
          whyItMatters:
            "AEO attracts hype. Being the person in the room whose claims hold up is what keeps a program funded after the first quarter.",
          pitfall:
            "Promising a client a place in AI Overviews by a set date. Promise the work (fixes, content, outreach) and the measurement; report what happened.",
          sources: [GOOGLE_NEED_SEO, GOOGLE_THIRD_PARTY],
        },
        {
          id: "c-stakeholders",
          term: "Reporting to clients and stakeholders",
          summary: "Give each audience the same facts at the depth it needs: decisions and trends for leaders, detail and changes for the people doing the work.",
          explanation:
            "Google's list of questions to ask an SEO doubles as a list of what a client will ask you. Among them: \"What kind of results do you expect to see, and in what timeframe?\" \"How do you measure your success?\" and whether you will \"share with me all the changes you make to my site, and provide detailed information about your recommendations and the reasoning behind them\".\n\nSo, for each audience:\n\n- **Leaders and clients**: the trend in a few numbers from your monthly report, what was done, what is next, and the decisions you need from them.\n- **The working team**: the full prompt-set log, every change shipped, and the findings still open.",
          whyItMatters:
            "The same report pitched at the wrong depth fails twice: leaders skip a wall of detail, and practitioners can't act on a headline.",
          pitfall:
            "Hiding a bad month. Show the same rows every time; a dip explained honestly builds more trust than a report that only ever goes up.",
          sources: [GOOGLE_NEED_SEO],
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
      ],
    },
    {
      id: "g-90-days",
      title: "Your 90-day plan",
      concepts: [
        {
          id: "c-90-day-plan",
          term: "The 90-day plan",
          summary: "Days 1–30: baseline and access. Days 31–60: content and structured data. Days 61–90: authority work and the first full report.",
          explanation:
            "A first quarter that follows the course:\n\n- **Days 1–30: see and unblock.** Build the prompt set and take the baseline. Set up the Search Console and Bing reports and the AI Assistant channel. Fix every access blocker and confirm indexing.\n- **Days 31–60: make the pages worth citing.** Rewrite your most important pages answer-first. Add or correct Organization, Article and Product markup, with one @id and sameAs.\n- **Days 61–90: work beyond the site.** Start a genuine review program, take part openly where your customers talk, and pitch one piece of original research. Rerun the prompt set and send the first full monthly report.\n\nGoogle's recap points the same way: apply SEO best practices, create content that is \"helpful, reliable, and people-first\", and \"Use the Generative AI performance report to see how your content is performing\".",
          whyItMatters:
            "Ninety days is long enough to fix the foundations and show a first measured change, and short enough to keep the business's attention.",
          pitfall:
            "Packing all six areas into month one. Access and measurement come first because every later month depends on them.",
          sources: [GOOGLE_AI_GUIDE],
        },
        {
          id: "c-keep-current",
          term: "Keeping the program current",
          summary: "After the first quarter, keep the monthly report going and recheck each platform's documentation, because the rules change.",
          explanation:
            "AI search changes faster than most of SEO. One example from this course: Google's documentation changelog records that the FAQ rich result \"will no longer appear in Google Search starting May 7, 2026\", years after FAQ markup became standard advice.\n\nBuild the check into the program: each quarter, reread the vendor pages you rely on (the crawler pages from The Crawl Docks, Google's AI features and AI guide pages, the reporting help pages), note the date, and update your robots.txt, markup and reports if anything moved.",
          whyItMatters:
            "A program built on last year's documentation slowly drifts into doing things that no longer work, or missing new reports and controls.",
          pitfall:
            "Relying on a blog post's summary of a change. Go to the vendor's own changelog or page, as every lesson in this course has.",
          sources: [GOOGLE_UPDATES],
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
      ],
    },
  ],

  exercise: {
    id: "x-prioritize-audit",
    title: "Prioritize the audit",
    brief:
      "You've audited Larkfield Tea (made up). The findings: OAI-SearchBot is disallowed in robots.txt; Product markup shows last year's prices; product pages open with three paragraphs of brand story before any facts; there is no Organization markup; there is no prompt set or baseline; and the agency wants to add an llms.txt file and \"chunk\" every page for AI. Turn this into a plan.",
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
          { term: "Product pages bury the facts under brand story", definition: "Project" },
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
      "Larkfield's plan starts small and sharp: a baseline, one robots.txt line, correct prices. Then the work that takes time: pages worth citing and a reputation worth repeating. Some ideas were dropped on the platforms' own word. That is what running AEO as a program means: choices you can defend, measured against where you started.",
  },

  example: {
    title: "Google's \"Do you need an SEO?\"",
    context:
      "Google Search Central's page on hiring an SEO, last updated in June 2026 and now covering AEO and GEO services, fetched on 30 October 2026. The excerpt is from its advice on choosing and judging help.",
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
      prompt: "Why do access blockers go before everything else?",
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
  ],
};

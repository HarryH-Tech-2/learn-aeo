// Lesson 5, The Agora: authority beyond your site.
// Every claim about a platform, a regulator or a policy is tied to a source
// checked on the `accessed` date. The lesson teaches each platform's own rules;
// it recommends no tactic those rules forbid. Larkfield Tea is the made-up shop
// from Lesson 4, and its plans, survey and Wikipedia article are invented for
// the exercises.

import type { LessonContent, Source } from "../lesson-types";

const ACCESSED = "2026-10-30";

const GOOGLE_AI_GUIDE: Source = {
  title: "Optimizing your website for generative AI features on Google Search",
  publisher: "Google Search Central",
  url: "https://developers.google.com/search/docs/fundamentals/ai-optimization-guide",
  date: "2026-07-10",
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

const GOOGLE_HELPFUL: Source = {
  title: "Creating helpful, reliable, people-first content",
  publisher: "Google Search Central",
  url: "https://developers.google.com/search/docs/fundamentals/creating-helpful-content",
  date: "2026-10-05",
  dateKind: "updated",
  accessed: ACCESSED,
};

const FTC_FAKE_REVIEWS: Source = {
  title: "Federal Trade Commission Announces Final Rule Banning Fake Reviews and Testimonials",
  publisher: "Federal Trade Commission",
  url: "https://www.ftc.gov/news-events/news/press-releases/2024/08/federal-trade-commission-announces-final-rule-banning-fake-reviews-testimonials",
  date: "2024-08-14",
  dateKind: "published",
  accessed: ACCESSED,
};

const GOOGLE_MAPS_POLICY: Source = {
  title: "Prohibited & restricted content (Maps user generated content policy)",
  publisher: "Google Maps Help",
  url: "https://support.google.com/contributionpolicy/answer/7400114",
  accessed: ACCESSED,
};

const GOOGLE_REDDIT: Source = {
  title: "An expanded partnership with Reddit",
  publisher: "Google (The Keyword)",
  url: "https://blog.google/company-news/inside-google/company-announcements/expanded-reddit-partnership/",
  date: "2024-02-22",
  dateKind: "published",
  accessed: ACCESSED,
};

const OPENAI_REDDIT: Source = {
  title: "OpenAI and Reddit Partnership",
  publisher: "OpenAI",
  url: "https://openai.com/index/openai-and-reddit-partnership/",
  date: "2024-05-16",
  dateKind: "published",
  accessed: ACCESSED,
};

const REDDIT_RULES: Source = {
  title: "Reddit Rules",
  publisher: "Reddit",
  url: "https://redditinc.com/policies/reddit-rules",
  accessed: ACCESSED,
};

const GOOGLE_SPAM_POLICIES: Source = {
  title: "Spam policies for Google web search",
  publisher: "Google Search Central",
  url: "https://developers.google.com/search/docs/essentials/spam-policies",
  date: "2026-08-28",
  dateKind: "updated",
  accessed: ACCESSED,
};

const FTC_ENDORSEMENTS: Source = {
  title: "FTC's Endorsement Guides: What People Are Asking",
  publisher: "Federal Trade Commission",
  url: "https://www.ftc.gov/business-guidance/resources/ftcs-endorsement-guides-what-people-are-asking",
  accessed: ACCESSED,
};

const WIKIPEDIA_COI: Source = {
  title: "Wikipedia:Conflict of interest",
  publisher: "Wikipedia",
  url: "https://en.wikipedia.org/wiki/Wikipedia:Conflict_of_interest",
  accessed: ACCESSED,
};

const WIKIPEDIA_NOTABILITY: Source = {
  title: "Wikipedia:Notability",
  publisher: "Wikipedia",
  url: "https://en.wikipedia.org/wiki/Wikipedia:Notability",
  accessed: ACCESSED,
};

const WIKIDATA_INTRO: Source = {
  title: "Wikidata:Introduction",
  publisher: "Wikidata",
  url: "https://www.wikidata.org/wiki/Wikidata:Introduction",
  accessed: ACCESSED,
};

const WIKIDATA_NOTABILITY: Source = {
  title: "Wikidata:Notability",
  publisher: "Wikidata",
  url: "https://www.wikidata.org/wiki/Wikidata:Notability",
  accessed: ACCESSED,
};

export const LESSON_5: LessonContent = {
  intro:
    "You have reached The Agora, the fifth district of the City of Answers: the square where everyone else talks about you. At The Schema Works you described your brand in your own words. Here you work on what reviewers, forums, journalists, list-makers and Wikipedia editors say, because AI answers draw on them too, and each of those places has rules you need to know before you take part.",

  outro:
    "You leave The Agora knowing why third-party pages shape AI answers, how to earn reviews, forum trust and press coverage without breaking anyone's rules, and how Wikipedia and Wikidata treat brands. Next stop is The Embassies, where you visit each AI platform in turn and learn what it documents about how it finds sources.",

  groups: [
    {
      id: "g-mentions",
      title: "What others say about you",
      concepts: [
        {
          id: "c-third-party",
          term: "Third-party sources in AI answers",
          summary: "AI answers draw on what other sites say about a brand, not just on the brand's own pages.",
          explanation:
            "In The Gate you separated a citation (a link to a page as evidence) from a mention (your name in the answer). Many mentions come from pages you don't control.\n\nGoogle says it plainly in its guide to its generative AI features: \"our generative AI features can show what's being said about products and services across the web, including in blogs, videos, and forum discussions.\"\n\nMicrosoft Bing describes how answers are put together: pieces of content \"are then assembled into answers, often drawing from multiple sources to create a single, coherent response.\" When someone asks which tea shop to order from, the sources can be review sites, forum threads and press articles as well as the shops' own pages.",
          whyItMatters:
            "Your own site is one voice in the answer. If reviewers, forums and the press describe you inaccurately, or not at all, a well-built site alone can't fix that.",
          pitfall:
            "Manufacturing mentions. Google's guide says \"seeking inauthentic \"mentions\" across the web isn't as helpful as it might seem\", and adds that its generative AI features depend on its core ranking systems and on the systems that block spam.",
          sources: [GOOGLE_AI_GUIDE, BING_AI_ANSWERS],
        },
        {
          id: "c-worth-mentioning",
          term: "Being worth mentioning",
          summary: "Third parties write about brands that give them something to say: original data, expertise, a product that stands out.",
          explanation:
            "Coverage can't be faked into existence, but it can be earned. Google's questions for judging content point the same way. Among them: \"Does the content provide original information, reporting, research, or analysis?\" and \"Does the content provide substantial value when compared to other pages in search results?\"\n\nThe same qualities make a brand worth citing in someone else's article: numbers nobody else has, a clear expert view, a product detail that settles a question.",
          whyItMatters:
            "Every tactic in the rest of this lesson, from reviews to press coverage, works better when there is something genuine to point at.",
          pitfall:
            "Asking for coverage with nothing new to say. A pitch that only says \"we exist\" gives a journalist nothing to write about.",
          sources: [GOOGLE_HELPFUL],
        },
      ],
      check: [
        {
          kind: "choice",
          id: "q-mentions-google",
          prompt: "What does Google's guide to its generative AI features say those features can show?",
          options: [
            "Only content from the brand's own website",
            "What's being said about products and services across the web, including blogs, videos and forums",
            "Only content marked up with schema.org",
            "Only pages from news publishers",
          ],
          answer: 1,
          explanation:
            "Google's guide says its generative AI features can show what's being said about products and services across the web, including in blogs, videos and forum discussions.",
        },
        {
          kind: "passage",
          id: "q-mentions-pitch",
          prompt: "Which opening line for a press pitch gives a journalist something to write about?",
          passages: [
            "Larkfield Tea is a passionate, customer-focused tea company that would love to be featured in your next roundup.",
            "We surveyed 1,200 of our customers about how they brew tea: 41% steep green tea in boiling water, and most have never changed how they brew it. The full data and method are on our site.",
          ],
          answer: 1,
          explanation:
            "The second line offers original data, a finding and a method. The first only describes the brand in vague terms. (Larkfield Tea and its survey are made up.)",
        },
      ],
    },
    {
      id: "g-reviews-forums",
      title: "Reviews and forums",
      concepts: [
        {
          id: "c-reviews",
          term: "Genuine reviews",
          summary: "Ask every customer for an honest review; never pay for, filter or fake one.",
          explanation:
            "In the US, the FTC's 2024 rule covers fake reviews. The FTC says the rule prohibits \"providing compensation or other incentives conditioned on the writing of consumer reviews expressing a particular sentiment, either positive or negative.\" It also covers reviews \"that misrepresent that they are by someone who does not exist, such as AI-generated fake reviews\", and reviews by company insiders that don't disclose the connection.\n\nPlatforms have their own rules. Google Maps doesn't allow merchants to \"Offer incentives – such as payment, discounts, free goods and/or services - in exchange for posting any review\", or to \"Discourage or prohibit negative reviews, or selectively solicit positive reviews from customers\". What it does allow: merchants may \"Solicit or encourage the posting of content that does represent a genuine experience, without offering incentives to do so\".",
          whyItMatters:
            "Reviews are among the third-party pages that describe your brand. A steady stream of honest ones is durable; bought or filtered ones can be removed by platforms and expose the business to regulators.",
          pitfall:
            "Review gating: asking only happy customers for reviews. Google Maps names \"selectively solicit positive reviews from customers\" as not allowed. Ask everyone.",
          sources: [FTC_FAKE_REVIEWS, GOOGLE_MAPS_POLICY],
        },
        {
          id: "c-forums",
          term: "Reddit and forums",
          summary: "Forum threads are content AI products license and show; take part openly, under each community's rules.",
          explanation:
            "Forums aren't a side channel. In February 2024 Google said it \"now has access to Reddit's Data API, which delivers real-time, structured, unique content\" from Reddit. In May 2024 OpenAI announced that it \"will bring enhanced Reddit content to ChatGPT and new products\".\n\nReddit's own rules set the terms for brands. Rule 2: \"Participate authentically in communities where you have a personal interest, and do not spam or engage in disruptive behaviors (including content manipulation) that interfere with Reddit communities.\" Rule 5 adds: \"do not intentionally mislead others or impersonate an individual or entity in a deceptive manner.\"\n\nIn practice: answer questions in your field from a clearly identified account, follow each subreddit's own rules on self-promotion, and fix problems customers raise in public.",
          whyItMatters:
            "When an AI tool summarizes \"what people say\" about a product, forum threads are part of what it can draw on. Being genuinely helpful where your customers talk is the only version of this that lasts.",
          pitfall:
            "Posting as a \"happy customer\" from staff or agency accounts. It breaks Reddit's rule against misleading others about who is speaking. Say who you work for.",
          sources: [GOOGLE_REDDIT, OPENAI_REDDIT, REDDIT_RULES],
        },
      ],
      check: [
        {
          kind: "choice",
          id: "q-reviews-allowed",
          prompt: "Which review request is allowed under Google Maps' policy?",
          options: [
            "An email to every customer asking for an honest review, with no reward",
            "10% off the next order for anyone who leaves a review",
            "A review request sent only to customers who gave 5 stars in a survey",
            "A request that staff each collect ten reviews mentioning them by name",
          ],
          answer: 0,
          explanation:
            "Google Maps allows soliciting genuine reviews without incentives. Discounts are an incentive, surveying first and asking only happy customers is selective solicitation, and the policy names staff quotas and requests for specific content as not allowed.",
        },
        {
          kind: "match",
          id: "q-reviews-match",
          prompt: "Match each source to what it says.",
          pairs: [
            { term: "FTC final rule (2024)", definition: "Bans buying reviews that express a particular sentiment" },
            { term: "Google Maps policy", definition: "Bans selectively soliciting positive reviews" },
            { term: "Reddit Rules", definition: "Asks you to participate authentically where you have a personal interest" },
            { term: "Google–Reddit partnership", definition: "Gave Google access to Reddit's Data API" },
          ],
          explanation:
            "The FTC rule and the Maps policy cover reviews, Reddit's rules cover how you take part, and Google's 2024 announcement covers how Reddit content reaches Google products.",
        },
      ],
    },
    {
      id: "g-pr-lists",
      title: "Digital PR and \"best X\" lists",
      concepts: [
        {
          id: "c-digital-pr",
          term: "Digital PR",
          summary: "Digital PR earns coverage on other sites with something newsworthy, and keeps any paid relationship disclosed.",
          explanation:
            "Digital PR is press work aimed at online publications: original research, expert comment, a useful tool or a story a journalist's readers care about. The coverage it earns is exactly the kind of third-party description AI answers can draw on.\n\nTwo lines not to cross:\n\n- **Paying for links.** Google's spam policies list \"Exchanging money for links, or posts that contain links\" and \"Sending someone a product in exchange for them writing about it and including a link\" as link spam, along with advertorials whose links pass ranking credit.\n- **Hiding a paid relationship.** The FTC's guidance for endorsements says the best disclosures are simple, such as \"BRAND paid me to tell you about it.\" Tagging a brand isn't enough: \"Tagging a brand is an endorsement, but it's not a disclosure\".",
          whyItMatters:
            "Earned coverage is the most durable kind of authority, because a publication chose to write about you. Paid placements that pass as editorial put both the brand and the publisher at risk.",
          pitfall:
            "Sending free products to bloggers on the condition that they link to you. Google names that as link spam; send the product with no strings, and expect any coverage to disclose it.",
          sources: [GOOGLE_SPAM_POLICIES, FTC_ENDORSEMENTS],
        },
        {
          id: "c-best-lists",
          term: "\"Best X\" lists",
          summary: "Comparison and \"best X\" lists shape AI recommendations; earn a place on independent ones, and be honest on your own.",
          explanation:
            "When someone asks an AI tool for the best product in a category, comparison and \"best X\" pages are natural sources. There are three ways brands try to appear on them, with different rules:\n\n- **Earning a place** on an independent list, by having a product that fits and making the facts easy to check. No rule against this.\n- **Publishing your own list** that includes your product. The FTC's rule prohibits a business \"from misrepresenting that a website or entity it controls provides independent reviews or opinions about a category of products or services that includes its own products or services.\" Your own comparison page is fine if it is clearly yours.\n- **Paying another site to host a list.** Google's site reputation abuse policy covers third-party content \"published on a host site mainly because of that host's already-established ranking signals\", and gives a \"best casinos\" page on a medical site as an example.",
          whyItMatters:
            "These pages answer the exact question your customers ask before they buy. Knowing which route is legitimate keeps a list strategy from turning into a liability.",
          pitfall:
            "Calling your own comparison page an \"independent review\". Name the publisher, say you make one of the products, and show the criteria.",
          sources: [FTC_FAKE_REVIEWS, GOOGLE_SPAM_POLICIES],
        },
      ],
      check: [
        {
          kind: "choice",
          id: "q-pr-lists",
          prompt: "Larkfield Tea wants to appear in \"best loose-leaf tea shops\" answers. Which plan stays within the FTC's and Google's rules?",
          options: [
            "Pay a popular health site to publish a \"best tea shops\" list written by Larkfield's agency",
            "Launch \"The Independent Tea Review\", a site run by Larkfield that ranks Larkfield first",
            "Publish a comparison page on larkfieldtea.example that says Larkfield made it and shows its criteria, and send samples to independent reviewers with no conditions",
            "Send free tins to bloggers on the condition that they link to Larkfield",
          ],
          answer: 2,
          explanation:
            "A clearly labeled comparison and unconditional samples break no rule. A paid list on a health site matches Google's site reputation abuse example, a brand-run \"independent\" site is what the FTC rule prohibits, and conditional free products for links are named link spam.",
        },
        {
          kind: "blank",
          id: "q-pr-disclose",
          prompt: "Complete the FTC's example of a simple disclosure.",
          text: "\"BRAND ___ me to tell you about it.\"",
          answers: ["paid"],
          distractors: ["asked", "allowed", "invited"],
          explanation:
            "The FTC's examples of good disclosures are plain: \"This is an ad for BRAND\", \"This video is paid for by BRAND\" or \"BRAND paid me to tell you about it.\"",
        },
      ],
    },
    {
      id: "g-wiki",
      title: "Wikipedia and Wikidata",
      concepts: [
        {
          id: "c-wikipedia",
          term: "Wikipedia and conflicts of interest",
          summary: "Wikipedia covers brands that independent sources have written about, and asks people with a conflict of interest not to edit those articles directly.",
          explanation:
            "Wikipedia's notability guideline sets the bar: a topic \"is presumed to be suitable for a stand-alone article or list when it has received significant coverage in reliable sources that are independent of the subject.\" Coverage comes first; the article follows.\n\nIf you work for the brand, Wikipedia's conflict-of-interest guideline applies. In a nutshell: \"Do not edit Wikipedia in your own interests, or in the interests of your external relationships. Paid editing must be disclosed.\" Editors with a conflict \"are strongly discouraged from editing affected articles directly, and can propose changes on article talk pages instead.\" Anyone paid to edit \"must disclose who is paying them\".",
          whyItMatters:
            "A Wikipedia article is one of the reference pages schema.org names for sameAs (The Schema Works), so it is part of the shared record of your brand. An accurate article matters, and the only durable way to influence it is the open, disclosed route.",
          pitfall:
            "Having an agency quietly write or edit the brand's article. It breaks the disclosure requirement, and Wikipedia says COI editing \"undermines public confidence and risks causing public embarrassment to the individuals and companies being promoted.\"",
          sources: [WIKIPEDIA_NOTABILITY, WIKIPEDIA_COI],
        },
        {
          id: "c-wikidata",
          term: "Wikidata",
          summary: "Wikidata is a free, structured knowledge base where each entity is an item with a Q-number, labels, a description and statements.",
          explanation:
            "Wikidata describes itself as \"a free, collaborative, multilingual, secondary knowledge base, collecting structured data\". Each entity is an item: \"Items are uniquely identified by a Q followed by a number, such as Douglas Adams (Q42).\"\n\nIt has its own notability policy. An item is acceptable if it has a valid link to a Wikimedia page such as a Wikipedia article, or if \"It refers to an instance of a clearly identifiable conceptual or material entity that can be described using serious and publicly available references\", or if it fills a structural need.\n\nA Wikidata item is what you put in `sameAs` (The Schema Works) to tie your markup to the shared record of your brand.",
          whyItMatters:
            "Wikidata is structured data about entities, maintained in the open and reused widely. Wikidata says this structure \"enables computers to process and \"understand\" it.\"",
          pitfall:
            "Creating an item for a brand with nothing public to cite. The policy asks for serious, publicly available references, and items that don't meet it can be deleted. Get covered first.",
          sources: [WIKIDATA_INTRO, WIKIDATA_NOTABILITY],
        },
      ],
      check: [
        {
          kind: "choice",
          id: "q-wiki-edit",
          prompt: "Larkfield Tea's Wikipedia article says it was founded in 2009; it was 2014. What should Larkfield's marketing manager do?",
          options: [
            "Edit the article directly and fix the year",
            "Ask a friend without a declared connection to make the edit",
            "Disclose the connection and propose the correction on the article's talk page, with a reliable source",
            "Create a new article with the right details",
          ],
          answer: 2,
          explanation:
            "Wikipedia's guideline strongly discourages direct edits by people with a conflict of interest and asks them to disclose it and propose changes on the talk page. Asking a friend hides the conflict, and a duplicate article would be removed.",
        },
        {
          kind: "order",
          id: "q-wiki-order",
          prompt: "Put these in the order a growing brand would normally reach them.",
          items: [
            "Independent publications write about the brand in depth",
            "The brand meets Wikipedia's notability bar",
            "An editor without a conflict of interest writes the article",
            "The Wikidata item links to the article, and the brand's sameAs links to the item",
          ],
          explanation:
            "Notability rests on significant independent coverage, so coverage comes first. The article is best written by someone without a conflict of interest, and once it exists the Wikidata item and your markup can connect to it.",
        },
      ],
    },
  ],

  exercise: {
    id: "x-plan-the-outreach",
    title: "Plan the outreach",
    brief:
      "Larkfield Tea (made up) wants AI tools to describe it accurately and recommend it more often. Its agency has sent a list of ideas. Sort the legitimate ones from the ones that break a platform's or regulator's rules, then plan the work.",
    steps: [
      {
        kind: "match",
        id: "x-step-sort",
        prompt: "Match each idea to the verdict that fits it.",
        pairs: [
          { term: "Email every customer after delivery asking for an honest review", definition: "Allowed: genuine reviews, no incentive" },
          { term: "Offer a free tin for every 5-star review", definition: "Banned: an incentive for a particular sentiment" },
          { term: "Have staff recommend Larkfield on Reddit as \"a customer\"", definition: "Breaks Reddit's rule against misleading others" },
          { term: "Pay a high-authority site to host a \"best tea shops\" list", definition: "Matches Google's site reputation abuse examples" },
        ],
        explanation:
          "Only the first idea survives. The FTC rule bans incentives conditioned on a particular sentiment, Reddit's rules forbid misleading others, and Google's site reputation abuse policy covers lists hosted on another site for its ranking signals.",
      },
      {
        kind: "order",
        id: "x-step-pr",
        prompt: "Larkfield has run a brewing survey. Put the digital PR steps in order.",
        items: [
          "Check the data and write up the method",
          "Publish the findings and method on Larkfield's site",
          "Pitch the key finding to journalists who cover food and drink",
          "Track the coverage and ask for corrections where it is wrong",
        ],
        explanation:
          "Journalists need something checkable, so the data and method come first and are published where anyone can see them. Then pitch, then follow the coverage so mistakes don't spread.",
      },
      {
        kind: "choice",
        id: "x-step-wikipedia",
        prompt: "The agency offers to \"write Larkfield a Wikipedia page\". What do you tell them?",
        options: [
          "Go ahead, as long as it is factual",
          "No: earn independent coverage first; if an article is warranted, any paid involvement must be disclosed, and changes go through talk pages or Articles for Creation",
          "Go ahead, but post it from a personal account",
          "Write it on Larkfield's own site and link it from Wikidata instead",
        ],
        answer: 1,
        explanation:
          "Wikipedia asks for significant independent coverage, requires paid editing to be disclosed, and asks COI editors to propose changes rather than make them, with new articles going through Articles for Creation.",
      },
      {
        kind: "choice",
        id: "x-step-list",
        prompt: "Larkfield wants its own \"best teas for beginners\" page that includes its blends. Which version is legitimate?",
        options: [
          "Titled \"Independent tea reviews\", with no mention of who wrote it",
          "Clearly published by Larkfield, saying it sells some of the teas listed, with the criteria shown",
          "Hosted on a separate domain that hides the link to Larkfield",
          "Ranking only Larkfield's teas, labeled as a neutral comparison",
        ],
        answer: 1,
        explanation:
          "The FTC rule targets businesses that present a site they control as independent reviews of a category including their own products. A page that says who made it, and how, isn't misrepresenting anything.",
      },
    ],
    debrief:
      "What's left is slower than the agency's list and more durable: honest reviews from every customer, real answers in forums from a named account, research journalists can check, clearly labeled comparisons, and a Wikipedia presence that follows coverage instead of preceding it. Each item is something a platform's rules protect rather than remove.",
  },

  example: {
    title: "Wikipedia's conflict-of-interest guideline",
    context:
      "The guideline at Wikipedia:Conflict of interest, fetched on 30 October 2026. The excerpt is its summary line and the list of what editors with a conflict of interest should do.",
    excerpt: {
      kind: "quote",
      text: "This page in a nutshell: Do not edit Wikipedia in your own interests, or in the interests of your external relationships. Paid editing must be disclosed. […] Editors with a COI should follow Wikipedia policies and best practices scrupulously: you should disclose your COI when involved with affected articles; you are strongly discouraged from editing affected articles directly; you may propose changes on talk pages (by using the {{edit COI}} template), so that they can be peer-reviewed; you should put new articles through the Articles for Creation (AfC) process instead of creating them directly; […]",
    },
    points: [
      {
        label: "Disclosure first",
        text: "Every route starts with saying who you are. Paid editing \"must be disclosed\", and the guideline asks paid editors to say who is paying them and on whose behalf they edit.",
      },
      {
        label: "Propose, don't edit",
        text: "The {{edit COI}} template turns a change into a request that other editors review. For a brand, that is the legitimate way to fix a wrong founding date or an outdated product name.",
      },
      {
        label: "New articles go through review",
        text: "Instead of creating an article directly, a connected editor submits it through Articles for Creation, where it is checked against the notability guideline.",
      },
      {
        label: "Requests can be declined",
        text: "Wikipedia says requested edits \"are subject to the same standards as any other, and editors may decline to act on them.\" A reliable, independent source for the change is what gets it accepted.",
      },
    ],
    source: WIKIPEDIA_COI,
  },

  audit: [
    {
      kind: "choice",
      id: "a-why-third-party",
      prompt: "Why does a brand's AEO work need to go beyond its own website?",
      options: [
        "AI answers only cite third-party sites",
        "AI answers can draw on what blogs, videos, forums and other sites say about a brand",
        "Search engines ignore brand websites",
        "Third-party mentions replace the need for structured data",
      ],
      answer: 1,
      explanation:
        "Google says its generative AI features can show what's being said across the web, including blogs, videos and forums, and Bing says answers often draw from multiple sources. Brand sites are still sources too.",
    },
    {
      kind: "choice",
      id: "a-ftc-rule",
      prompt: "Which practice does the FTC's 2024 rule prohibit?",
      options: [
        "Asking every customer for an honest review",
        "Replying publicly to a negative review",
        "Offering an incentive for reviews that express a positive sentiment",
        "Showing all reviews, good and bad, on your site",
      ],
      answer: 2,
      explanation:
        "The rule prohibits compensation or incentives conditioned on reviews expressing a particular sentiment. It also bars hiding reviews based on their rating while implying you show them all.",
    },
    {
      kind: "spot",
      id: "a-spot-email",
      prompt: "Which line of this review-request email breaks Google Maps' policy?",
      language: "text",
      lines: [
        "Thanks for your order from Larkfield Tea!",
        "We'd love to hear how you found your tea.",
        "Leave a 5-star review and get 15% off your next order.",
        "Here's the link to our Google Business Profile.",
      ],
      answer: 2,
      explanation:
        "Google Maps doesn't allow incentives such as discounts in exchange for reviews, and asking for a specific rating is an attempt to influence it. Asking for honest feedback with a link is fine.",
    },
    {
      kind: "match",
      id: "a-match-platforms",
      prompt: "Match each place to its rule for brands.",
      pairs: [
        { term: "Wikipedia", definition: "Disclose a conflict of interest and propose changes on talk pages" },
        { term: "Reddit", definition: "Participate authentically where you have a personal interest" },
        { term: "Google Maps", definition: "Ask for genuine reviews without incentives" },
        { term: "Wikidata", definition: "Items need an entity describable with serious, public references" },
      ],
      explanation: "Each platform publishes its own rules; these are the ones that matter most for a brand.",
    },
    {
      kind: "choice",
      id: "a-reputation-abuse",
      prompt: "Which arrangement matches an example in Google's site reputation abuse policy?",
      options: [
        "A news site syndicating another publication's news story",
        "A forum where users discuss tea brands",
        "A medical site hosting a third-party \"best casinos\" page to borrow its ranking signals",
        "An opinion column by a guest writer on a newspaper site",
      ],
      answer: 2,
      explanation:
        "Google lists a medical site hosting a third-party \"best casinos\" page as inconsistent with the policy. It lists syndicated news, forums and editorial columns as not inconsistent.",
    },
    {
      kind: "blank",
      id: "a-blank-notability",
      prompt: "Complete Wikipedia's notability test.",
      text: "A topic is presumed to be suitable for a stand-alone article or list when it has received significant coverage in reliable sources that are ___ of the subject.",
      answers: ["independent"],
      distractors: ["supportive", "critical", "owned"],
      explanation:
        "The guideline asks for significant coverage in reliable sources that are independent of the subject. A brand's own press releases don't count.",
    },
    {
      kind: "passage",
      id: "a-passage-reddit",
      prompt: "Which Reddit reply follows Reddit's rules and holds up best?",
      passages: [
        "Honestly Larkfield Tea is the best I've ever had, just ordered again lol",
        "I work at Larkfield Tea, so I'm biased. If you're new to loose-leaf, a sampler from any shop is a cheap way to try a few styles before you buy a big tin.",
      ],
      answer: 1,
      explanation:
        "The second reply discloses the connection and is useful whatever the reader buys. The first, if posted by staff, would mislead others about who is speaking, which Reddit's rules forbid. (The posts are made up.)",
    },
    {
      kind: "choice",
      id: "a-disclosure",
      prompt: "A blogger tags Larkfield Tea in a post about free tins they received. Is the tag enough disclosure under the FTC's guidance?",
      options: [
        "Yes, tagging shows the connection",
        "No: a tag is an endorsement, not a disclosure; they should say they got the tins free",
        "Yes, if the post also uses the brand's hashtag",
        "Only if the blogger has more than 10,000 followers",
      ],
      answer: 1,
      explanation:
        "The FTC says tagging a brand is an endorsement but not a disclosure that you have a connection. A plain statement of what they received is needed.",
    },
    {
      kind: "order",
      id: "a-order-coverage",
      prompt: "Put these in the order that builds lasting third-party authority.",
      items: [
        "Have something original: data, expertise or a standout product",
        "Earn independent coverage of it",
        "Get described accurately on reference sites such as Wikipedia",
        "Link those reference entries from your markup with sameAs",
      ],
      explanation:
        "Coverage needs something to cover, reference sites need independent coverage, and sameAs can only point to entries that exist.",
    },
    {
      kind: "choice",
      id: "a-reddit-deals",
      prompt: "What did Google (February 2024) and OpenAI (May 2024) each announce about Reddit?",
      options: [
        "That they would stop showing Reddit content",
        "Access to Reddit's Data API to bring Reddit content into their products",
        "That Reddit posts would no longer be crawled",
        "That brands could pay to appear in Reddit answers",
      ],
      answer: 1,
      explanation:
        "Both announced access to Reddit's Data API, which delivers real-time, structured content, to bring Reddit content into their products.",
    },
  ],
};

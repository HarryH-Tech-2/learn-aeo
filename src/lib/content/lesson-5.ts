// Lesson 5: authority beyond your site.
// Every claim about a platform, a regulator or a policy is tied to a source
// checked on the `accessed` date. The lesson teaches each platform's own rules;
// it recommends no tactic those rules forbid. Larkfield Tea is the made-up shop
// from Lesson 4. Its plans, survey, pitches, posts, coverage, comparison pages,
// markup, AI answer and Wikipedia article are invented for the examples and
// exercises, as are Fernway Teas, Teashop and every .example site.

import type { LessonContent, Source } from "../lesson-types";

const ACCESSED = "2026-11-06";

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

const OPENAI_SEARCH_HELP: Source = {
  title: "Searching the web with ChatGPT",
  publisher: "OpenAI Help Center",
  url: "https://help.openai.com/en/articles/9237897-searching-the-web-with-chatgpt",
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

const FTC_RULE_QA: Source = {
  title: "The Consumer Reviews and Testimonials Rule: Questions and Answers",
  publisher: "Federal Trade Commission",
  url: "https://www.ftc.gov/business-guidance/resources/consumer-reviews-testimonials-rule-questions-answers",
  accessed: ACCESSED,
};

const GOOGLE_MAPS_POLICY: Source = {
  title: "Prohibited & restricted content (Maps user generated content policy)",
  publisher: "Google Maps Help",
  url: "https://support.google.com/contributionpolicy/answer/7400114",
  accessed: ACCESSED,
};

const TRUSTPILOT_BUSINESSES: Source = {
  title: "Guidelines for businesses",
  publisher: "Trustpilot",
  url: "https://legal.trustpilot.com/for-businesses/guidelines-for-businesses",
  date: "2026-09",
  dateKind: "updated",
  accessed: ACCESSED,
};

const G2_GUIDELINES: Source = {
  title: "Community Guidelines",
  publisher: "G2",
  url: "https://legal.g2.com/community-guidelines",
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

const GOOGLE_QUALIFY_LINKS: Source = {
  title: "Qualify your outbound links to Google",
  publisher: "Google Search Central",
  url: "https://developers.google.com/search/docs/crawling-indexing/qualify-outbound-links",
  date: "2025-12-10",
  dateKind: "updated",
  accessed: ACCESSED,
};

const FTC_ENDORSEMENTS: Source = {
  title: "FTC's Endorsement Guides: What People Are Asking",
  publisher: "Federal Trade Commission",
  url: "https://www.ftc.gov/business-guidance/resources/ftcs-endorsement-guides-what-people-are-asking",
  accessed: ACCESSED,
};

const FTC_INFLUENCERS: Source = {
  title: "Disclosures 101 for Social Media Influencers",
  publisher: "Federal Trade Commission",
  url: "https://www.ftc.gov/business-guidance/resources/disclosures-101-social-media-influencers",
  accessed: ACCESSED,
};

const MUCK_RACK_2026: Source = {
  title: "Muck Rack's 2026 State of Journalism Report Finds 82% of Journalists Use AI",
  publisher: "Muck Rack (via GlobeNewswire)",
  url: "https://www.globenewswire.com/news-release/2026/3/19/3259178/0/en/Muck-Rack-s-2026-State-of-Journalism-Report-Finds-82-of-Journalists-Use-AI.html",
  date: "2026-03-19",
  dateKind: "published",
  accessed: ACCESSED,
};

const YOUTUBE_PAID_PROMOTION: Source = {
  title: "Add branded content restrictions & disclosure labels",
  publisher: "YouTube Help",
  url: "https://support.google.com/youtube/answer/154235",
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

const WIKIPEDIA_NOTABILITY_ORGS: Source = {
  title: "Wikipedia:Notability (organizations and companies)",
  publisher: "Wikipedia",
  url: "https://en.wikipedia.org/wiki/Wikipedia:Notability_(organizations_and_companies)",
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

const WIKIDATA_SELF_PROMOTION: Source = {
  title: "Wikidata:Self-promotion",
  publisher: "Wikidata",
  url: "https://www.wikidata.org/wiki/Wikidata:Self-promotion",
  date: "2026-11-05",
  dateKind: "updated",
  accessed: ACCESSED,
};

const KP_ABOUT: Source = {
  title: "About knowledge panels",
  publisher: "Knowledge Panel Help",
  url: "https://support.google.com/knowledgepanel/answer/9163198",
  accessed: ACCESSED,
};

const GOOGLE_ORGANIZATION: Source = {
  title: "Organization (Organization) structured data",
  publisher: "Google Search Central",
  url: "https://developers.google.com/search/docs/appearance/structured-data/organization",
  date: "2026-09-08",
  dateKind: "updated",
  accessed: ACCESSED,
};

export const LESSON_5: LessonContent = {
  intro:
    "This lesson is about what everyone else says about you. In Lesson 4 you described your brand in your own words. Here you work on what reviewers, forums, journalists, creators, list-makers and Wikipedia editors say, because AI answers draw on them too, and each of those places has rules you need to know before you take part.",

  outro:
    "You now know how third-party pages reach AI answers, how to earn reviews, forum trust, press coverage and appearances without breaking anyone's rules, how to disclose and label paid relationships, and how Wikipedia and Wikidata treat brands. Lesson 6 is next, where you take each AI platform in turn and learn what it documents about how it finds sources.",

  groups: [
    {
      id: "g-mentions",
      title: "What others say about you",
      concepts: [
        {
          id: "c-third-party",
          quiz: {
            kind: "choice",
            id: "cq-third-party",
            prompt: "In the made-up answer on this card, which sources support the claims about Larkfield Tea?",
            options: [
              "A forum thread and a magazine's list",
              "Larkfield's own pricing page",
              "Fernway Teas' pricing page",
              "None: the answer has no sources",
            ],
            answer: 0,
            explanation:
              "Larkfield is recommended on the strength of sources [1] and [2], a forum thread and a magazine's list. Neither is Larkfield's own site.",
          },
          term: "Third-party sources in AI answers",
          summary: "AI answers draw on what other sites say about a brand, not just on the brand's own pages.",
          explanation:
            "In Lesson 1 you separated a citation (a link to a page as evidence) from a mention (your name in the answer). Many mentions, and many citations, come from pages you don't control.\n\nGoogle says it plainly in its guide to its generative AI features: \"our generative AI features can show what's being said about products and services across the web, including in blogs, videos, and forum discussions.\"\n\nMicrosoft describes the same mechanics from Bing's side. Assistants break pages into smaller pieces, and those pieces \"are then assembled into answers, often drawing from multiple sources to create a single, coherent response.\"\n\nSo when someone asks where to buy loose-leaf tea, the answer can be stitched together from a review site, a forum thread, a magazine's gift guide and two or three shops' own pages. Your page might supply the price while someone else's supplies the verdict. The example below shows what that looks like, and why the brand that is named isn't always the brand that is cited.",
          whyItMatters:
            "Your own site is one voice in the answer. In the example, Larkfield is recommended, and neither citation behind that recommendation is Larkfield's site. If reviewers, forums and the press describe you inaccurately, or not at all, a well-built site alone can't fix that.",
          example: {
            kind: "code",
            language: "text",
            caption: "A made-up answer, for illustration (Larkfield Tea, Fernway Teas and every source are invented)",
            code: "Q: Where should I buy loose-leaf green tea online?\n\nA: Larkfield Tea is a frequent pick for beginners: reviewers\n   praise its sampler tins and clear brewing guides [1][2].\n   Fernway Teas is cheaper per gram for bulk orders [3].\n\nSources:\n[1] teaforum.example/threads/first-order\n[2] foodmagazine.example/best-tea-shops\n[3] fernwayteas.example/pricing",
          },
          pitfall:
            "Manufacturing mentions. Google's guide says \"seeking inauthentic \"mentions\" across the web isn't as helpful as it might seem\", and adds that its generative AI features depend on its core ranking systems and on the systems that block spam.",
          sources: [GOOGLE_AI_GUIDE, BING_AI_ANSWERS],
        },
        {
          id: "c-engine-sources",
          quiz: {
            kind: "match",
            id: "cq-engine-sources",
            prompt: "Match each engine to what it documents about finding sources.",
            pairs: [
              { term: "Google AI features", definition: "Retrieve pages from its Search index with its core ranking systems" },
              { term: "ChatGPT search", definition: "Sometimes sends rewritten queries to partner search providers" },
              { term: "Perplexity", definition: "Gathers articles, websites and journals and adds numbered citations" },
            ],
            explanation:
              "All three search first and answer from what they find, so any page that ranks, yours or someone else's, can be read and cited.",
          },
          term: "How engines reach third-party pages",
          summary: "Engines search an index, and sometimes partner data, so a third-party page reaches an answer the same way yours does.",
          explanation:
            "The engines that document their process describe the same shape: search first, then answer from what was found, whoever published it.\n\n- **Google** describes its AI features as retrieval-augmented generation, \"relying on our core Search ranking systems to retrieve relevant, up-to-date web pages from our Search index.\" A review site or a forum thread that ranks is as available as your product page.\n- **ChatGPT search** says it \"sometimes partners with other search providers\", rewriting your question into targeted queries it sends them, and answers with citations you can open.\n- **Perplexity** says it searches the internet, \"gathering information from authoritative sources like articles, websites, and journals\", and that each answer \"includes numbered citations linking to the original sources\".\n\nSome content also arrives through deals rather than crawling. Reddit's data agreements with Google and OpenAI, covered later in this lesson, are the best-known examples.\n\nOpenAI's help page adds a warning worth remembering: \"Search results and citations can be incomplete, outdated, or incorrect.\"",
          whyItMatters:
            "Third-party pages compete for the same retrieval slots as yours. A forum thread that ranks for the question your customers ask can be read and cited even if your own page answers it better, so the pages that rank for those questions are worth knowing by name.",
          pitfall:
            "Treating an AI answer about your brand as a verdict on your website alone. Open the citations first: if a wrong fact comes from a directory or an old article, that page is what needs fixing, and Lesson 12 covers how.",
          sources: [GOOGLE_AI_GUIDE, OPENAI_SEARCH_HELP, PERPLEXITY_HOW],
        },
        {
          id: "c-worth-mentioning",
          quiz: {
            kind: "choice",
            id: "cq-worth-mentioning",
            prompt: "Which of these gives a writer something to cite?",
            options: [
              "A brewing test with numbers nobody else has, and the method published",
              "A statement that the brand is passionate about quality",
              "A list of the brand's social media accounts",
              "A new logo",
            ],
            answer: 0,
            explanation:
              "The card's four things worth mentioning are original numbers, a specific expert view, a product detail that settles a question, or a story that affects a community. Only the brewing test is one of them.",
          },
          term: "Being worth mentioning",
          summary: "Third parties write about brands that give them something to say: original data, expertise, a product that stands out.",
          explanation:
            "Coverage can't be faked into existence, but it can be earned. Google's questions for judging content point the same way. Among them: \"Does the content provide original information, reporting, research, or analysis?\" and \"Does the content provide substantial value when compared to other pages in search results?\"\n\nGoogle's guide to its AI features makes the same point about viewpoint: \"a first-hand review provides a unique perspective based on personal experience, whereas a summary of existing content simply restates information already available elsewhere.\"\n\nThe same qualities make a brand worth citing in someone else's article. In practice that means one of four things: numbers nobody else has (a survey, a test, your own sales data), an expert who will say something specific on the record, a product detail that settles a common question, or a story that affects a particular community. Before any outreach, write down which of the four you have. If the answer is none, the work starts there, not with a press list.",
          whyItMatters:
            "Every tactic in the rest of this lesson, from reviews to press coverage, works better when there is something genuine to point at.",
          example: {
            kind: "before-after",
            before:
              "Larkfield Tea is passionate about quality. We source the finest teas from around the world, and our customers love us.",
            after:
              "We brewed the same sencha 400 times: at boiling point, 7 in 10 tasters called it bitter; at 175°F, 2 in 10 did. Method and raw data: larkfieldtea.example/brew-test",
            note: "Both made up (Larkfield Tea and its test are invented). Nobody can cite the first, because it has no fact in it. The second gives a writer a finding, a number and a method to check.",
          },
          pitfall:
            "Asking for coverage with nothing new to say. A pitch that only says the brand exists gives a journalist nothing to write about.",
          sources: [GOOGLE_HELPFUL, GOOGLE_AI_GUIDE],
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
        {
          kind: "choice",
          id: "q-mentions-ranking-thread",
          prompt:
            "A forum thread ranks above Larkfield's own product page for a beginner's tea question. Can the thread be cited in an AI answer about Larkfield?",
          options: [
            "Yes: engines retrieve from what ranks, whoever published it",
            "No: engines only cite a brand's own pages for questions about that brand",
            "No: forum threads are excluded from AI answers",
            "Only if the thread links to Larkfield's site",
          ],
          answer: 0,
          explanation:
            "Google retrieves pages from its Search index with its core ranking systems, and ChatGPT search and Perplexity also answer from what their searches find. A thread that ranks is a candidate source like any other page.",
        },
      ],
    },
    {
      id: "g-reviews-forums",
      title: "Reviews and forums",
      concepts: [
        {
          id: "c-reviews",
          quiz: {
            kind: "choice",
            id: "cq-reviews",
            prompt: "Which offer does the FTC's rule prohibit?",
            options: [
              "A $5 credit for reviews that say how much the customer loved the tea",
              "An email to every customer asking for an honest review, with no reward",
              "A public reply to a negative review",
              "Showing every review, good and bad, on your site",
            ],
            answer: 0,
            explanation:
              "The rule bans incentives conditioned on a review expressing a particular sentiment. A credit for reviews that praise the tea is exactly that.",
          },
          term: "Genuine reviews",
          summary: "Ask every customer for an honest review; never pay for, filter or fake one.",
          explanation:
            "In the US, the FTC's rule on reviews and testimonials covers fake reviews. The FTC says the rule prohibits \"providing compensation or other incentives conditioned on the writing of consumer reviews expressing a particular sentiment, either positive or negative.\" It also covers reviews \"that misrepresent that they are by someone who does not exist, such as AI-generated fake reviews\", and reviews by company insiders that don't disclose the connection.\n\nThe FTC's questions and answers draw the line precisely: \"The rule does not prohibit giving incentives for reviews, as long as there isn't an express or implied requirement that the reviews have to express a particular sentiment.\" They add that \"failing to disclose incentives could be a violation of the FTC Act.\"\n\nGoogle is stricter. Google Maps doesn't allow merchants to \"Offer incentives – such as payment, discounts, free goods and/or services - in exchange for posting any review\", or to \"Discourage or prohibit negative reviews, or selectively solicit positive reviews from customers\". What it does allow: merchants may \"Solicit or encourage the posting of content that does represent a genuine experience, without offering incentives to do so\".\n\nWhere the rules differ, follow the stricter one. Lesson 10 covers asking for and replying to local reviews in depth.",
          whyItMatters:
            "Reviews are among the third-party pages that describe your brand. A steady stream of honest ones is durable; bought or filtered ones can be removed by platforms and expose the business to regulators.",
          pitfall:
            "Review gating: asking only happy customers for reviews. Google Maps names \"selectively solicit positive reviews from customers\" as not allowed. Ask everyone.",
          sources: [FTC_FAKE_REVIEWS, FTC_RULE_QA, GOOGLE_MAPS_POLICY],
        },
        {
          id: "c-review-platforms",
          quiz: {
            kind: "match",
            id: "cq-review-platforms",
            prompt: "Match each platform to its rule for businesses, as this card describes it.",
            pairs: [
              { term: "Trustpilot", definition: "No incentives, and invite everyone the same way" },
              { term: "G2", definition: "Labels incentivized reviews and bars reviews from the vendor's employees" },
              { term: "Google Maps", definition: "Bans an incentive for any review" },
            ],
            explanation:
              "The three platforms disagree on incentives: Trustpilot and Google allow none, while G2 runs its own labeled, capped incentives.",
          },
          term: "Review platforms' own rules",
          summary: "Trustpilot, G2 and Google each set their own rules on invitations, incentives and employees; read the ones your category uses.",
          explanation:
            "The review sites that cover your category are third-party pages too, and each sets its own terms for businesses. They don't all agree.\n\n- **Trustpilot** says invitations \"must be fair, neutral, and unbiased with no incentives offered\", and asks businesses to invite \"everyone in the same way, and at the same point in the customer journey\". Its list of what not to do includes \"Pre-screening people who leave a review\" by sending happy customers to Trustpilot and unhappy ones to your inbox.\n- **G2** runs incentives itself: it \"will occasionally offer incentives (such as gift cards or a donation) for honest reviews\", caps their value at $100, and says \"If a review is incentivized, G2 will clearly label the review as incentivized.\" Vendors may not condition incentives on positive reviews or reward reviewers \"without disclosing those incentives to G2\", and \"Employees working for the product's company and employees of a direct competitor may not leave reviews\".\n- **Google** bans any incentive for a review, as the previous card showed.\n\nBefore you send a single invitation, find the platform's business guidelines and match your process to them.",
          whyItMatters:
            "Review sites are pages engines can retrieve like any other, and breaking their rules can cost more than the reviews. Trustpilot says misuse can lead to \"placing a Consumer Warning on your profile and hiding your TrustScore\", and G2's enforcement goes as far as banning the vendor.",
          pitfall:
            "Copying one platform's process onto another. A gift card for every honest review can be allowed on G2 when it is disclosed to G2 and labeled, but the same offer breaks Trustpilot's and Google's rules.",
          sources: [TRUSTPILOT_BUSINESSES, G2_GUIDELINES],
        },
        {
          id: "c-forums",
          quiz: {
            kind: "blank",
            id: "cq-forums",
            prompt: "Complete what Google said its 2024 partnership gave it.",
            text: "Google now has access to Reddit's ___ API.",
            answers: ["Data"],
            distractors: ["Ads", "Search", "Chat"],
            explanation:
              "Google said it now has access to Reddit's Data API, which delivers real-time, structured content. OpenAI announced access to the same API three months later.",
          },
          term: "Reddit and forums",
          summary: "Forum threads are content AI products license and show; take part openly, under each community's rules.",
          explanation:
            "Forums aren't a side channel. In February 2024 Google said it \"now has access to Reddit's Data API, which delivers real-time, structured, unique content\" from Reddit. It added that the deal \"does not change Google's use of publicly available, crawlable content for indexing, training, or display in Google products.\" In May 2024 OpenAI announced that it \"will bring enhanced Reddit content to ChatGPT and new products\", through the same Data API.\n\nReddit's own rules set the terms for brands. Rule 2: \"Participate authentically in communities where you have a personal interest, and do not spam or engage in disruptive behaviors (including content manipulation) that interfere with Reddit communities.\" Rule 5 adds: \"do not intentionally mislead others or impersonate an individual or entity in a deceptive manner.\"\n\nOn top of those platform-wide rules, each community sets its own, enforced by its moderators. The next card turns this into a way of replying.",
          whyItMatters:
            "When an AI tool summarizes what people say about a product, forum threads are part of what it can draw on. Being genuinely helpful where your customers talk is the only version of this that lasts.",
          pitfall:
            "Treating threads as a place to drop links. Google's spam policies list \"Forum comments with optimized links in the post or signature\" as link spam, and Reddit's Rule 2 forbids spam.",
          sources: [GOOGLE_REDDIT, OPENAI_REDDIT, REDDIT_RULES, GOOGLE_SPAM_POLICIES],
        },
        {
          id: "c-forum-replies",
          quiz: {
            kind: "choice",
            id: "cq-forum-replies",
            prompt: "Which disclosure does the FTC's staff suggest an employee use?",
            options: [
              "\"I work for XYZ\" in the post",
              "#employee at the end of the post",
              "A username that includes the brand name",
              "No disclosure, as long as the praise is honest",
            ],
            answer: 0,
            explanation:
              "The FTC says consumers will likely not understand #employee, and suggests plain words such as \"I work for XYZ\" instead.",
          },
          term: "Replying as a brand in forums",
          summary: "Say who you work for in the post itself, answer the question asked, and follow each community's rules on promotion.",
          explanation:
            "Forum threads reward the same thing journalists do: a useful, specific answer. The rules decide how you give it.\n\nReddit's platform rules ask you to take part where you have a personal interest, and put each community's rules first: \"Please abide by the rules of communities in which you participate\". Communities set their own rules on self-promotion, so read the sidebar and pinned posts before you reply.\n\nIn the US, the FTC treats an employee praising the company's product as an endorsement that needs a disclosure. Its staff suggest something as plain as \"Check out my company's great new product.\" Employees of an agency \"have a connection to the advertiser, which should be disclosed in all social media posts\". Short tags don't do the job: the FTC says consumers \"will likely not understand\" #employee to mean that, and suggests \"I work for XYZ\" instead.\n\nA good brand reply discloses first, answers the question even when the answer isn't your product, and links only when the link helps the reader.",
          whyItMatters:
            "A disclosed, useful reply holds up when someone checks who wrote it. An undisclosed one breaks Reddit's rule against misleading others and, in the US, the FTC's guidance on endorsements.",
          example: {
            kind: "before-after",
            before: "Honestly just try Larkfield Tea, best I've ever had!! larkfieldtea.example/shop",
            after:
              "I work for Larkfield Tea, so weigh this accordingly. For a first green tea, brew at around 175°F rather than boiling, and start with a sampler from any shop so you can compare styles. Happy to answer brewing questions here.",
            note: "Both replies are made up. Posted from a staff account, the first hides who is speaking and drops a shop link. The second discloses, answers the question and would help a reader who never buys from Larkfield.",
          },
          pitfall:
            "Posting as a happy customer from staff or agency accounts. It breaks Reddit's Rule 5 against misleading others about who is speaking, and the FTC expects the connection to be disclosed. Say who you work for.",
          sources: [REDDIT_RULES, FTC_ENDORSEMENTS],
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
        {
          kind: "choice",
          id: "q-reviews-selective",
          prompt:
            "Larkfield invites customers to review it on Trustpilot and Google, but only those who rated their order 4 or 5 stars in its own survey. Is that allowed?",
          options: [
            "No: both Trustpilot and Google ban selective invitations",
            "Yes, because no incentive is offered",
            "Yes on Trustpilot, but not on Google",
            "Yes on Google, but not on Trustpilot",
          ],
          answer: 0,
          explanation:
            "Trustpilot bans pre-screening and asks businesses to invite everyone the same way, and Google Maps bans selectively soliciting positive reviews. No incentive is needed to break either rule.",
        },
      ],
    },
    {
      id: "g-pr-lists",
      title: "Digital PR, disclosure and \"best X\" lists",
      concepts: [
        {
          id: "c-digital-pr",
          quiz: {
            kind: "choice",
            id: "cq-digital-pr",
            prompt: "In Muck Rack's 2026 survey, what share of journalists immediately disregard pitches that miss their beat?",
            options: ["88%", "41%", "12%", "50%"],
            answer: 0,
            explanation:
              "Muck Rack reports that 88% immediately disregard pitches that miss their beat, even though 86% say at least some stories start from PR pitches.",
          },
          term: "Digital PR",
          summary: "Digital PR earns coverage on other sites with something newsworthy, pitched to the right journalist, with no paid links.",
          explanation:
            "Digital PR is press work aimed at online publications: original research, expert comment, a useful tool or a story a journalist's readers care about. The coverage it earns is exactly the kind of third-party description AI answers can draw on.\n\nWhat journalists say they want is consistent. Muck Rack, which sells PR software, surveyed 897 journalists (mostly in the US) for its 2026 report: \"86% of journalists say at least some of their stories originate from PR pitches\", yet \"88% immediately disregard pitches that miss their beat\". And \"78% say a pitch feels genuinely relevant when it directly affects the community their audience belongs to.\"\n\nSo a pitch is a match, not a broadcast: one finding, for one journalist's beat, with what it means for their readers and where the data lives.\n\nOne line not to cross: Google's spam policies list \"Exchanging money for links, or posts that contain links\" and \"Sending someone a product in exchange for them writing about it and including a link\" as link spam, along with advertorials whose links pass ranking credit.",
          whyItMatters:
            "Earned coverage is the most durable kind of authority, because a publication chose to write about you. Paid placements that pass as editorial put both the brand and the publisher at risk.",
          example: {
            kind: "before-after",
            before:
              "Subject: Story idea. Hi there, Larkfield Tea is a passionate, customer-focused tea company. We'd love to be featured in your next roundup!",
            after:
              "Subject: Most tea drinkers brew green tea too hot, survey finds. Hi Dana, you covered cold-brew trends last month, so this may fit your beat: 41% of the 1,200 tea drinkers we surveyed steep green tea in boiling water. Full data, method and a brewing chart are at larkfieldtea.example/brew-survey, and our head blender can talk on the record this week.",
            note: "Both pitches are made up, as are Larkfield Tea, Dana and the survey. The second is written for one journalist's beat, leads with a finding and shows where to check it.",
          },
          pitfall:
            "Sending free products to bloggers on the condition that they link to you. Google names that as link spam; send the product with no strings, and expect any coverage to disclose it.",
          sources: [MUCK_RACK_2026, GOOGLE_SPAM_POLICIES],
        },
        {
          id: "c-disclosure",
          quiz: {
            kind: "spot",
            id: "cq-disclosure",
            prompt: "Larkfield sent this blogger the sampler for free. Which line of the made-up post is a disclosure that falls short of the FTC's guidance?",
            language: "text",
            lines: [
              "Morning brew with the Larkfield sampler tin.",
              "The sencha is grassy and sweet at 175°F.",
              "#tea #morning #spon #larkfieldtea #selfcare",
              "Full brewing notes on my blog.",
            ],
            answer: 2,
            explanation:
              "The FTC says not to use vague terms like \"spon\" and not to mix a disclosure into a group of hashtags. A gifted sampler needs a plain statement next to the endorsement.",
          },
          term: "Disclosing paid relationships",
          summary: "Anyone you pay, gift or employ who talks about you should say so, plainly and next to the endorsement.",
          explanation:
            "Gifted products, paid posts, affiliate deals and staff posts all create what the FTC calls a material connection, and US guidance expects it to be disclosed. The FTC's guide for influencers is clear that this isn't only about cash: \"Financial relationships aren't limited to money.\" If a brand sends free products, the influencer should disclose \"even if you weren't asked to mention that product.\"\n\nHow it's said matters as much as whether:\n\n- **Plain words.** The best disclosures are simple, such as \"BRAND paid me to tell you about it.\" Terms like \"ad\" and \"sponsored\" work; \"sp\", \"spon\" and \"collab\" don't.\n- **Next to the endorsement.** Disclosures \"are likely to be missed if they appear only on an ABOUT ME or profile page, at the end of posts or videos, or anywhere that requires a person to click MORE.\"\n- **Not buried.** \"Don't mix your disclosure into a group of hashtags or links.\"\n\nA tag doesn't count either: \"Tagging a brand is an endorsement, but it's not a disclosure\".",
          whyItMatters:
            "Undisclosed endorsements mislead the readers whose trust gives coverage its value, and the responsibility isn't only the creator's. The FTC's staff say that if a company has \"actively encouraged your employees to write reviews of your products, you would be responsible for monitoring them\".",
          example: {
            kind: "before-after",
            before: "Obsessed with my new morning ritual @larkfieldtea #tea #morning #spon #selfcare",
            after:
              "Larkfield Tea sent me this sampler for free. Honest take: the sencha is lovely, the chai too sweet for me. #tea",
            note: "Both posts are made up. The first hides \"spon\" in a pile of hashtags and relies on a tag; the second says what was received, in plain words, before the opinion.",
          },
          pitfall:
            "Relying on a platform's built-in label alone. The FTC's guide says \"Don't assume that a platform's disclosure tool is good enough\", and suggests using it alongside your own clear disclosure.",
          sources: [FTC_INFLUENCERS, FTC_ENDORSEMENTS],
        },
        {
          id: "c-link-attributes",
          quiz: {
            kind: "blank",
            id: "cq-link-attributes",
            prompt: "Fill in the rel value Google prefers for a paid placement.",
            text: "<a href=\"https://larkfieldtea.example/sampler\" rel=\"___\">Larkfield sampler</a>",
            answers: ["sponsored"],
            distractors: ["ugc", "follow", "author"],
            explanation:
              "Google asks for paid links and advertisements to carry rel=\"sponsored\". The ugc value is for user-generated content such as comments and forum posts.",
            mono: true,
          },
          term: "Paid links and rel attributes",
          summary: "Mark paid, affiliate and sponsored links with rel=\"sponsored\" so they pass no ranking credit, and tell readers in words too.",
          explanation:
            "Paid placements aren't against Google's rules; unlabeled ones are. Google's spam policies call buying and selling links \"a normal part of the economy of the web for advertising and sponsorship purposes\", and say it's not a violation \"to have such links as long as they are qualified\" with `rel=\"nofollow\"` or `rel=\"sponsored\"`.\n\nGoogle's link documentation gives three values:\n\n- `sponsored`: \"Mark links that are advertisements or paid placements (commonly called paid links) with the sponsored value.\"\n- `ugc`: for user-generated content \"such as comments and forum posts\".\n- `nofollow`: for when the others don't apply and you'd rather Google not associate your site with the linked page.\n\nThis matters on both sides of a deal. If you sponsor a newsletter, a podcast page or a gift guide, ask for the link to be qualified. If you run an affiliate program, your publishers' links to you should carry it.\n\nThe attribute is read by search engines, not people. Readers need words: the FTC suggests a line such as \"I get commissions for purchases made through links in this post.\"",
          whyItMatters:
            "A qualified link still sends readers and still names you on a relevant page. It just doesn't pass ranking credit, which keeps both you and the publisher clear of Google's link spam rules.",
          example: {
            kind: "code",
            language: "html",
            caption: "Made-up links on a made-up gift guide, labeled the way Google's documentation describes",
            code: "<!-- A paid placement in a sponsored gift guide -->\n<a href=\"https://larkfieldtea.example/sampler\" rel=\"sponsored\">Larkfield sampler tin</a>\n\n<!-- An affiliate link, disclosed in words next to it -->\n<p>I get commissions for purchases made through links in this post.</p>\n<a href=\"https://larkfieldtea.example/sencha?ref=guide\" rel=\"sponsored\">Larkfield sencha</a>\n\n<!-- A link a reader posted in the comments -->\n<a href=\"https://teaforum.example/brewing\" rel=\"ugc\">brewing tips</a>",
          },
          pitfall:
            "Making unqualified links a condition of a deal. Google lists \"Requiring a link as part of a Terms of Service, contract, or similar arrangement without allowing a third-party content owner the choice of qualifying the outbound link\" as link spam.",
          sources: [GOOGLE_QUALIFY_LINKS, GOOGLE_SPAM_POLICIES, FTC_ENDORSEMENTS],
        },
        {
          id: "c-best-lists",
          quiz: {
            kind: "choice",
            id: "cq-best-lists",
            prompt:
              "A brand's ranking site says \"independent reviews\" at the top and discloses the brand's ownership at the bottom. Does the disclosure fix it?",
            options: [
              "No: the FTC says an express claim of independence can't be cured by a disclosure",
              "Yes: any disclosure fixes it",
              "Yes, as long as the disclosure is in bold",
              "Only if the brand ranks itself last",
            ],
            answer: 0,
            explanation:
              "The FTC's questions and answers say a site with an express claim of independence violates the rule, whatever the disclosure says.",
          },
          term: "\"Best X\" lists",
          summary: "Comparison and \"best X\" lists shape AI recommendations; earn a place on independent ones, and be honest on your own.",
          explanation:
            "When someone asks an AI tool for the best product in a category, comparison and \"best X\" pages are natural sources. There are three ways brands try to appear on them, with different rules:\n\n- **Earning a place** on an independent list: make your product's facts (price, sizes, shipping, test results) easy to verify on your site, send samples without conditions, and let editors decide. No rule against this.\n- **Publishing your own list** that includes your product. The FTC's rule prohibits a business \"from misrepresenting that a website or entity it controls provides independent reviews or opinions about a category of products or services that includes its own products or services.\" Its questions and answers add that a disclosure can't rescue a site \"if the website has an express claim of independence\". Your own comparison page is fine if it is clearly yours.\n- **Paying another site to host a list.** Google's site reputation abuse policy covers third-party content \"published on a host site mainly because of that host's already-established ranking signals\", and gives a \"best casinos\" page on a medical site as an example.",
          whyItMatters:
            "These pages answer the exact question your customers ask before they buy. Knowing which route is legitimate keeps a list strategy from turning into a liability.",
          example: {
            kind: "before-after",
            before:
              "The Independent Tea Review: our unbiased ranking of the best tea shops. 1. Larkfield Tea. 2. Fernway Teas. 3. Teashop.",
            after:
              "Best teas for beginners, by Larkfield Tea. We sell three of the ten teas below. How we chose: under $15, ships across the US, and tasted by our six-person staff panel.",
            note: "Both pages are made up. The first claims independence for a page Larkfield controls, which the FTC rule prohibits. The second says who made it, that Larkfield sells some of the teas, and how they were chosen.",
          },
          pitfall:
            "Calling your own comparison page an \"independent review\". Name the publisher, say you make one of the products, and show the criteria.",
          sources: [FTC_FAKE_REVIEWS, FTC_RULE_QA, GOOGLE_SPAM_POLICIES],
        },
        {
          id: "c-appearances",
          quiz: {
            kind: "choice",
            id: "cq-appearances",
            prompt: "Where does the FTC say the disclosure for a paid video endorsement should be?",
            options: [
              "In the video itself, not just in the description",
              "Only in the video description",
              "Only on the channel's About page",
              "In a pinned comment",
            ],
            answer: 0,
            explanation:
              "The FTC says the disclosure should be in the video and not just in the description uploaded with it.",
          },
          term: "Podcasts, videos and expert appearances",
          summary: "Interviews, guest spots and creator videos are third-party coverage too, with disclosure rules when money or products change hands.",
          explanation:
            "Google's guide names videos alongside blogs and forums as places its AI features can find \"what's being said about products and services across the web\". A founder interviewed on a podcast, an expert quoted in a video, a product reviewed by a creator: each produces a page, a transcript or a video that describes you in someone else's words.\n\nTwo kinds of appearance follow different rules:\n\n- **Earned.** You are invited because you have something to say, and you appear under your own name and title.\n- **Paid or gifted.** You pay for the slot or send product. On YouTube, creators with \"branded content, sponsorships, endorsements, or other commercial relationships\" in a video \"have to let YouTube know by selecting the paid promotion button\", which adds a disclosure label at the start. The FTC adds that the disclosure \"should be in the video and not just in the description uploaded with the video.\"\n\nPitch appearances the way you pitch stories: to hosts whose audience your expertise actually helps. Lesson 11 covers making your own videos easy to find; this card is about appearing in other people's.",
          whyItMatters:
            "An interview lets a host's audience, and any engine that indexes the page or video, hear your expertise in detail, attributed to you but published by someone else.",
          pitfall:
            "Asking a creator to keep a sponsorship quiet, or to mention it only in the description. Both leave viewers without the disclosure the FTC expects, in the place they would see it.",
          sources: [GOOGLE_AI_GUIDE, YOUTUBE_PAID_PROMOTION, FTC_INFLUENCERS],
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
        {
          kind: "spot",
          id: "q-pr-rel",
          prompt: "This made-up gift guide is paid to feature Larkfield. Which line needs fixing under Google's guidance?",
          language: "html",
          lines: [
            "<p>Our favorite tins this winter (some placements are paid):</p>",
            "<a href=\"https://teashop.example/gift\" rel=\"sponsored\">Sponsored: Teashop gift box</a>",
            "<a href=\"https://larkfieldtea.example/sampler\">Sponsored: Larkfield sampler</a>",
            "<a href=\"https://library.example/tea-history\">A short history of tea</a>",
          ],
          answer: 2,
          explanation:
            "The Larkfield link is a paid placement, so it needs rel=\"sponsored\". Telling readers it's sponsored is right but doesn't qualify the link for Google. The history link is editorial and needs no attribute.",
        },
      ],
    },
    {
      id: "g-wiki",
      title: "Wikipedia, Wikidata and consistent facts",
      concepts: [
        {
          id: "c-wikipedia",
          quiz: {
            kind: "choice",
            id: "cq-wikipedia",
            prompt: "What does Wikipedia ask an editor with a conflict of interest to do instead of editing the article directly?",
            options: [
              "Disclose the connection and propose changes on the article's talk page",
              "Edit from a personal account instead of a company one",
              "Ask a friend to make the edit",
              "Create a second article with the correct details",
            ],
            answer: 0,
            explanation:
              "The guideline strongly discourages direct edits by editors with a conflict of interest and asks them to disclose it and propose changes on talk pages.",
          },
          term: "Wikipedia and conflicts of interest",
          summary: "Wikipedia covers brands that independent sources have written about, and asks people with a conflict of interest not to edit those articles directly.",
          explanation:
            "Wikipedia's notability guideline sets the bar: a topic \"is presumed to be suitable for a stand-alone article or list when it has received significant coverage in reliable sources that are independent of the subject.\" Coverage comes first; the article follows.\n\nIf you work for the brand, or an agency it pays, Wikipedia's conflict-of-interest guideline applies. In a nutshell: \"Do not edit Wikipedia in your own interests, or in the interests of your external relationships. Paid editing must be disclosed.\" Editors with a conflict \"are strongly discouraged from editing affected articles directly, and can propose changes on article talk pages instead.\" Anyone paid to edit \"must disclose who is paying them\".\n\nThe guideline also gives the routes. You \"should put new articles through the Articles for Creation (AfC) process instead of creating them directly\", and propose changes to existing articles on the talk page, where other editors review them. Those requests \"are subject to the same standards as any other, and editors may decline to act on them\", so bring a reliable, independent source for each change.",
          whyItMatters:
            "A Wikipedia article is one of the reference pages schema.org names for sameAs (Lesson 4), so it is part of the shared record of your brand. An accurate article matters, and the only durable way to influence it is the open, disclosed route.",
          pitfall:
            "Having an agency quietly write or edit the brand's article. It breaks the disclosure requirement, and Wikipedia says COI editing \"undermines public confidence and risks causing public embarrassment to the individuals and companies being promoted.\"",
          sources: [WIKIPEDIA_NOTABILITY, WIKIPEDIA_COI],
        },
        {
          id: "c-wiki-coverage",
          quiz: {
            kind: "choice",
            id: "cq-wiki-coverage",
            prompt: "Which of these counts toward notability under Wikipedia's guideline for companies?",
            options: [
              "An in-depth review by an independent critic in a national magazine",
              "The brand's press release, republished word for word by 40 sites",
              "A one-line mention in a national newspaper",
              "12,000 likes on the brand's social posts",
            ],
            answer: 0,
            explanation:
              "Only the review is significant, independent, reliable and secondary. Press-release copies are dependent coverage, a one-line mention is trivial, and likes have no bearing.",
          },
          term: "What counts as coverage on Wikipedia",
          summary: "Wikipedia's guideline for companies counts only significant, independent, reliable, secondary coverage, and sets aside press releases and passing mentions.",
          explanation:
            "Wikipedia has a stricter guideline for companies and products. In a nutshell: \"An organization is generally considered notable if it has been the subject of significant coverage in reliable, independent secondary sources.\" Each source must pass all four tests, since \"each source needs to be significant, independent, reliable, and secondary\", and there must be multiple such sources.\n\nWhat doesn't count is spelled out. Under dependent coverage the guideline lists \"press releases, press kits, or similar public relations materials\" and \"any material that is substantially based on such press releases even if published by independent sources\". It warns that \"A collection of multiple trivial sources does not become significant\", and that views, likes and shares have no bearing. It judges depth over prestige: \"a 400-word article in The Village Voice is a lot more significant than a single-sentence mention in The New York Times.\" And one wire story reprinted in many papers still counts as one source.\n\nThat makes it useful beyond Wikipedia: a demanding, public definition of coverage that actually describes you.",
          whyItMatters:
            "Pushing for an article before this kind of coverage exists wastes effort and invites deletion. Earning the coverage itself pays off whether or not an article ever follows, because it is exactly the independent description engines can find.",
          example: {
            kind: "before-after",
            before:
              "Coverage so far: our launch press release, picked up word for word by 40 news sites; a one-line mention in a national paper's gift list; 12,000 likes on our launch post.",
            after:
              "Coverage so far: an 800-word review by a critic who tested our teas, in a national food magazine; a regional newspaper's feature on how the business started; a trade journal's analysis of our sourcing.",
            note: "Both lists are made up. By the guideline's tests the first adds up to nothing: press-release copies are dependent, a one-line mention is trivial, and likes have no bearing. The second has three unrelated sources with significant coverage.",
          },
          pitfall:
            "Counting syndicated press-release pickups as coverage. The guideline treats them as dependent coverage, however many sites ran them.",
          sources: [WIKIPEDIA_NOTABILITY_ORGS],
        },
        {
          id: "c-wikidata",
          quiz: {
            kind: "blank",
            id: "cq-wikidata",
            prompt: "Complete how Wikidata identifies items.",
            text: "Items are uniquely identified by a ___ followed by a number, such as Douglas Adams (Q42).",
            answers: ["Q"],
            distractors: ["W", "ID", "#"],
            explanation: "Every Wikidata item has a Q-number; Douglas Adams is Q42.",
          },
          term: "Wikidata",
          summary: "Wikidata is a free, structured knowledge base where each entity is an item with a Q-number, labels, a description and statements.",
          explanation:
            "Wikidata describes itself as \"a free, collaborative, multilingual, secondary knowledge base, collecting structured data\". Each entity is an item: \"Items are uniquely identified by a Q followed by a number, such as Douglas Adams (Q42).\" Statements attach facts to items, and Wikidata \"records not just statements, but also their sources\".\n\nIt has its own notability policy. An item is acceptable if it has a valid link to a Wikimedia page such as a Wikipedia article, or if \"It refers to an instance of a clearly identifiable conceptual or material entity that can be described using serious and publicly available references\", or if it fills a structural need.\n\nOn brands creating their own items, Wikidata's self-promotion page (an essay, not a policy) is blunt: doing so is strongly discouraged, and \"Wikidata does not control Google's Knowledge Panels, and they are not a valid reason to create an item.\"\n\nIf an item about your brand already exists, it is what you can point to with `sameAs` (Lesson 4) to tie your markup to the shared record.",
          whyItMatters:
            "Wikidata is structured data about entities, maintained in the open and reused widely. Wikidata says this structure \"enables computers to process and \"understand\" it.\"",
          pitfall:
            "Creating an item for your own brand to get a knowledge panel. Items need serious, publicly available references, and Wikidata's self-promotion essay warns that items failing the notability criteria \"are likely to be deleted\". Get covered first.",
          sources: [WIKIDATA_INTRO, WIKIDATA_NOTABILITY, WIKIDATA_SELF_PROMOTION],
        },
        {
          id: "c-consistent-facts",
          quiz: {
            kind: "order",
            id: "cq-consistent-facts",
            prompt: "Put the consistency work in the order this card describes.",
            items: [
              "Write one fact sheet with the brand's key facts",
              "Update every profile you control from it",
              "Link those profiles from your Organization markup with sameAs",
              "Ask the owners of other pages to correct what's still wrong",
            ],
            explanation:
              "Start from one source of truth, fix what you control, connect it with sameAs, and only then chase pages you don't control (Lesson 12).",
          },
          term: "Consistent facts across profiles",
          summary: "Knowledge panels and AI answers assemble your facts from many pages, so every profile you control should say the same thing.",
          explanation:
            "Google says knowledge panels are generated automatically and that \"information that appears in a knowledge panel comes from various sources across the web.\" AI answers work the same way: as this lesson showed, the engines retrieve and combine pages from many publishers. If your About page says 2014, a social profile says 2013 and a directory says 2009, all three are candidate sources.\n\nThe fix starts with the profiles you control: your site, social profiles, marketplace listings, review-site business pages and directory entries. Keep one fact sheet (legal name, trading name, founding year, founders, headquarters, what you sell) and copy from it, never from memory.\n\nThen connect them. Google's Organization markup takes a `sameAs` property for \"a URL to your organization's profile page on a social media or review site\", and \"You can provide multiple sameAs URLs.\" Google says Organization markup on your home page can help it \"disambiguate your organization in search results\".\n\nWhen a page you don't control has a fact wrong, Lesson 12 covers how to get it corrected.",
          whyItMatters:
            "Conflicting facts give an engine several versions to choose from, and it may pick the wrong one. Consistent profiles leave fewer wrong versions to find.",
          example: {
            kind: "code",
            language: "json",
            caption: "Organization markup for the made-up Larkfield Tea. Every URL is invented, and the Wikidata Q-number is a placeholder",
            code: "{\n  \"@context\": \"https://schema.org\",\n  \"@type\": \"Organization\",\n  \"name\": \"Larkfield Tea\",\n  \"url\": \"https://larkfieldtea.example\",\n  \"foundingDate\": \"2014\",\n  \"sameAs\": [\n    \"https://www.wikidata.org/wiki/Q00000000\",\n    \"https://social.example/larkfieldtea\",\n    \"https://reviews.example/larkfieldtea\"\n  ]\n}",
          },
          pitfall:
            "Updating your website and forgetting the profiles. An old founding year on a social profile or a directory page is still a page an engine can find and cite.",
          sources: [KP_ABOUT, GOOGLE_ORGANIZATION],
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
        {
          kind: "match",
          id: "q-wiki-coverage",
          prompt: "Match each piece of coverage to how Wikipedia's guideline for companies treats it.",
          pairs: [
            { term: "A press release republished by 40 sites", definition: "Dependent coverage" },
            { term: "A one-line mention in a national paper", definition: "Trivial coverage" },
            { term: "An in-depth review by an independent critic", definition: "Significant, independent coverage" },
            { term: "One wire story reprinted in three newspapers", definition: "One source" },
          ],
          explanation:
            "Press-release copies are dependent, passing mentions are trivial, an in-depth independent review counts, and a reprinted story is still a single source.",
        },
      ],
    },
  ],

  exercise: {
    id: "x-plan-the-outreach",
    title: "Plan the outreach",
    brief:
      "Larkfield Tea (made up) wants AI tools to describe it accurately and recommend it more often. Its agency has sent a list of ideas. Sort the legitimate ones from the ones that break a platform's or regulator's rules, plan the work, and set the disclosure rules for everyone who will talk about Larkfield.",
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
          "Pitch the key finding to journalists whose beat it fits",
          "Track the coverage and ask for corrections where it is wrong",
        ],
        explanation:
          "Journalists need something checkable, so the data and method come first and are published where anyone can see them. Then pitch to the right beats, then follow the coverage so mistakes don't spread.",
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
      {
        kind: "match",
        id: "x-step-disclose",
        prompt: "Larkfield's plan includes four kinds of paid or connected mentions. Match each to what it needs.",
        pairs: [
          { term: "A blogger mentions a sampler Larkfield sent free", definition: "A plain disclosure next to the mention" },
          { term: "A paid link to Larkfield in a newsletter's web archive", definition: "rel=\"sponsored\" on the link, plus a label readers can see" },
          { term: "A Larkfield employee answers a brewing question on a forum", definition: "\"I work for Larkfield Tea\" in the reply itself" },
          { term: "A creator's sponsored YouTube review", definition: "YouTube's paid promotion setting and a disclosure in the video" },
        ],
        explanation:
          "Gifts and payments are material connections the FTC expects disclosed next to the endorsement; Google wants paid links qualified; employees should say who they work for; and YouTube asks creators to tick paid promotion, while the FTC wants the disclosure in the video itself.",
      },
    ],
    debrief:
      "What's left is slower than the agency's list and more durable: honest reviews from every customer, real answers in forums from a named account, research journalists can check, clearly labeled comparisons and paid links, disclosed partnerships, and a Wikipedia presence that follows coverage instead of preceding it. Each item is something a platform's rules protect rather than remove.",
  },

  example: {
    title: "Wikipedia's conflict-of-interest guideline",
    context:
      "The guideline at Wikipedia:Conflict of interest, fetched on 6 November 2026. The excerpt is its summary line and the list of what editors with a conflict of interest should do.",
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
    {
      kind: "blank",
      id: "a-blank-sponsored",
      prompt: "Complete Google's guidance on paid links.",
      text: "Mark links that are advertisements or paid placements (commonly called paid links) with the ___ value.",
      answers: ["sponsored"],
      distractors: ["ugc", "external", "partner"],
      explanation:
        "Google asks for rel=\"sponsored\" on paid links. Its spam policies say paid links aren't a violation as long as they are qualified this way (nofollow is also accepted).",
    },
    {
      kind: "choice",
      id: "a-review-platforms",
      prompt: "Which review platform runs its own labeled incentive program for honest reviews?",
      options: ["G2", "Trustpilot", "Google Maps", "None of them allows any incentive"],
      answer: 0,
      explanation:
        "G2 occasionally offers incentives such as gift cards for honest reviews and labels those reviews as incentivized. Trustpilot and Google Maps don't allow incentives for reviews.",
    },
  ],
};

// Lesson 3: writing citable content.
// Every claim about an engine, a style guide or an HTML element is tied to a
// source checked on the `accessed` date. Fernhill Garden Supply is a made-up
// shop, and its product facts (sizes, prices, timings, survey figures) and its
// staff (Priya Shah) are invented for the examples and exercises.

import type { LessonContent, Source } from "../lesson-types";

const ACCESSED = "2026-11-06";

const NNG_INVERTED_PYRAMID: Source = {
  title: "Inverted Pyramid: Writing for Comprehension",
  publisher: "Nielsen Norman Group",
  url: "https://www.nngroup.com/articles/inverted-pyramid/",
  date: "2018-02-11",
  dateKind: "published",
  accessed: ACCESSED,
};

const GOVUK_STRUCTURE: Source = {
  title: "Create a clear structure for your content",
  publisher: "GOV.UK content and publishing guidance",
  url: "https://guidance.publishing.service.gov.uk/writing-to-gov-uk-standards/writing-guidelines/clear-structure/",
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

const BING_AI_PERFORMANCE: Source = {
  title: "Introducing AI Performance in Bing Webmaster Tools Public Preview",
  publisher: "Bing Webmaster Blog",
  url: "https://blogs.bing.com/webmaster/2026/2/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview/",
  date: "2026-02-10",
  dateKind: "published",
  accessed: ACCESSED,
};

const GOOGLE_PASSAGES: Source = {
  title: "How AI is powering a more helpful Google",
  publisher: "Google",
  url: "https://blog.google/products-and-platforms/products/search/search-on/",
  date: "2020-10-15",
  dateKind: "published",
  accessed: ACCESSED,
};

const GOOGLE_RANKING_SYSTEMS: Source = {
  title: "A guide to Google Search ranking systems",
  publisher: "Google Search Central",
  url: "https://developers.google.com/search/docs/appearance/ranking-systems-guide",
  date: "2025-12-10",
  dateKind: "updated",
  accessed: ACCESSED,
};

const GOOGLE_AI_OPTIMIZATION: Source = {
  title: "Optimizing your website for generative AI features on Google Search",
  publisher: "Google Search Central",
  url: "https://developers.google.com/search/docs/fundamentals/ai-optimization-guide",
  date: "2026-07-10",
  dateKind: "updated",
  accessed: ACCESSED,
};

const GOOGLE_DOC_UPDATES: Source = {
  title: "Latest Google Search documentation updates",
  publisher: "Google Search Central",
  url: "https://developers.google.com/search/updates",
  date: "2026-10-26",
  dateKind: "updated",
  accessed: ACCESSED,
};

const OPENAI_WEB_SEARCH: Source = {
  title: "Web search (API guide)",
  publisher: "OpenAI",
  url: "https://developers.openai.com/api/docs/guides/tools-web-search",
  accessed: ACCESSED,
};

const CLAUDE_WEB_SEARCH: Source = {
  title: "Web search tool",
  publisher: "Anthropic (Claude Platform Docs)",
  url: "https://platform.claude.com/docs/en/agents-and-tools/tool-use/web-search-tool",
  accessed: ACCESSED,
};

const MS_STYLE_NUMBERS: Source = {
  title: "Numbers",
  publisher: "Microsoft Writing Style Guide",
  url: "https://learn.microsoft.com/en-us/style-guide/numbers",
  date: "2022-06-24",
  dateKind: "updated",
  accessed: ACCESSED,
};

const MDN_HEADINGS: Source = {
  title: "<h1>–<h6>: The HTML Section Heading elements",
  publisher: "MDN Web Docs",
  url: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/Heading_Elements",
  date: "2026-08-26",
  dateKind: "updated",
  accessed: ACCESSED,
};

const MDN_OL: Source = {
  title: "<ol>: The Ordered List element",
  publisher: "MDN Web Docs",
  url: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/ol",
  date: "2026-10-06",
  dateKind: "updated",
  accessed: ACCESSED,
};

const MDN_TABLE: Source = {
  title: "<table>: The Table element",
  publisher: "MDN Web Docs",
  url: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/table",
  date: "2026-04-24",
  dateKind: "updated",
  accessed: ACCESSED,
};

const MDN_TH: Source = {
  title: "<th>: The Table Header element",
  publisher: "MDN Web Docs",
  url: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/th",
  date: "2026-07-14",
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

const GOOGLE_BYLINE_DATES: Source = {
  title: "Influence your byline dates in Google Search",
  publisher: "Google Search Central",
  url: "https://developers.google.com/search/docs/appearance/publication-dates",
  date: "2025-12-10",
  dateKind: "updated",
  accessed: ACCESSED,
};

const GOOGLE_SITEMAPS: Source = {
  title: "Build and submit a sitemap",
  publisher: "Google Search Central",
  url: "https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap",
  date: "2026-07-08",
  dateKind: "updated",
  accessed: ACCESSED,
};

const GOOGLE_REDIRECTS: Source = {
  title: "Redirects and Google Search",
  publisher: "Google Search Central",
  url: "https://developers.google.com/search/docs/crawling-indexing/301-redirects",
  date: "2026-04-14",
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

const GOOGLE_REVIEWS: Source = {
  title: "Write high quality reviews",
  publisher: "Google Search Central",
  url: "https://developers.google.com/search/docs/specialty/ecommerce/write-high-quality-reviews",
  date: "2025-12-10",
  dateKind: "updated",
  accessed: ACCESSED,
};

const GEO_PAPER: Source = {
  title: "GEO: Generative Engine Optimization (Aggarwal et al., KDD 2024), full text (v3)",
  publisher: "arXiv",
  url: "https://arxiv.org/html/2311.09735v3",
  date: "2024-06-28",
  dateKind: "published",
  accessed: ACCESSED,
};

const GOVUK_HOLIDAY: Source = {
  title: "Holiday entitlement",
  publisher: "GOV.UK",
  url: "https://www.gov.uk/holiday-entitlement-rights",
  accessed: ACCESSED,
};

export const LESSON_3: LessonContent = {
  intro:
    "The bots you let in during Lesson 2 collect your pages, and AI answers are written from the passages they find there. In this lesson you learn to write passages that are easy to lift, easy to check and safe to quote, and to tell the advice the engines actually give from the advice they don't.",

  outro:
    "You can now lead with the answer, write passages and numbers that stand on their own, lay them out in headings, lists and tables that keep their meaning, and back them with honest dates, named authors and real sources. Lesson 4 is next, where you describe those pages to machines with structured data.",

  groups: [
    {
      id: "g-answer-first",
      title: "Answer first",
      concepts: [
        {
          id: "c-lead-with-answer",
          quiz: {
            kind: "passage",
            id: "cq-lead-with-answer",
            prompt: "A Fernhill page (made up) is headed \"How long does delivery take?\" Which opening leads with the answer?",
            passages: [
              "Fernhill delivers to all UK addresses in 2 to 4 working days. Delivery is free on orders over £50.",
              "Delivery is something we think about a lot at Fernhill, and there are a few things worth knowing before you order.",
            ],
            answer: 0,
            explanation:
              "The first opening answers the question in its first sentence and adds the main condition in the second. The second warms up and never answers.",
          },
          term: "Lead with the answer",
          summary: "Put a one- or two-sentence direct answer straight under the question, then add the detail.",
          explanation:
            "Journalists call this the **inverted pyramid**. Nielsen Norman Group describes it as a structure where \"the most important information (or what might even be considered the conclusion) is presented first\", and says the style is \"perfectly suited to writing for the web\".\n\nGOV.UK's content guidance gives the same instruction: \"Put the most important information first.\" Then \"taper down to smaller and smaller details as your content goes on.\"\n\nMicrosoft Bing's guidance on AI search answers points the same way. Among the things that make content eligible for snippets, it lists \"Concise answers: One- to two-sentence responses that directly address a question.\" It also says AI systems extract \"snippable\" pieces and that \"AI can lift a single line or combine multiple snippets from across sites into one answer.\"\n\nIn practice: write the answer as if it were the only sentence anyone will read. Then add, in order, the conditions that change the answer, the exceptions, and finally the background.",
          whyItMatters:
            "A reader who stops after one sentence still gets the answer, and so does an engine that lifts one sentence. Nielsen Norman Group notes that readers \"can stop reading at any point on the page and still come away with the main point\".",
          example: {
            kind: "before-after",
            before:
              "Here at Fernhill we have been helping gardeners for years, and one of the questions we hear most often is about delivery. There are a few things to think about, which we cover below.",
            after:
              "Fernhill delivers to all UK addresses in 2 to 4 working days. Delivery is free on orders over £50.",
            note: "Fernhill is made up. The first version spends two sentences warming up and answers nothing. The second answers \"how long does delivery take?\" in its first sentence and adds the main condition in the second.",
          },
          pitfall:
            "Writing a summary at the top and then repeating it in the first paragraph. GOV.UK says \"Do not repeat the summary in the first paragraph.\" Use the space after the answer for conditions, exceptions and detail.",
          sources: [NNG_INVERTED_PYRAMID, GOVUK_STRUCTURE, BING_AI_ANSWERS],
        },
        {
          id: "c-standalone-definitions",
          quiz: {
            kind: "choice",
            id: "cq-standalone-definitions",
            prompt: "Which definition of a made-up Fernhill service follows the advice on this card?",
            options: [
              "Fernhill Plant Insurance is a £3 add-on that replaces any plant that dies within 90 days of delivery.",
              "Basically, it's peace of mind for your plants.",
              "It's our cutting-edge, next-gen way to protect your garden.",
              "As explained above, this covers you if things go wrong.",
            ],
            answer: 0,
            explanation:
              "It starts with the term, says what it is, and gives the price and the condition. The others open with \"Basically\" or \"It\", lean on earlier text, or use the unanchored praise Microsoft warns about.",
          },
          term: "Definitions that stand alone",
          summary: "Define a term in one sentence that names it, says what it is, and gives a concrete fact, with nothing borrowed from nearby text.",
          explanation:
            "A good definition reads like a reference entry. MDN's pages on HTML elements are a model. The page for `<ol>` opens: \"The `<ol>` HTML element represents an ordered list of items — typically rendered as a numbered list.\" The term comes first, then what kind of thing it is, then what tells it apart. You can quote that sentence anywhere and it still makes sense.\n\nMicrosoft Bing asks for the same quality in AI answers: \"Sentences that make sense even when pulled out of context.\" It warns about \"Unanchored claims\", such as calling something \"next-gen\" or \"cutting-edge\" without context, and advises: \"anchor claims in measurable facts.\" Its example of context is a product page that says \"42 dB dishwasher designed for open-concept kitchens\" instead of just \"quiet dishwasher\".\n\nBing also suggests you \"Use synonyms and related terms\", because this \"helps AI connect concepts\". In a definition, that means giving the everyday phrase and the formal term together, once, near the start.",
          whyItMatters:
            "Questions such as \"what is…\" are answered with a definition. If yours names the term and gives a concrete fact, it can be lifted whole. If it relies on the previous paragraph or on vague praise, it cannot.",
          example: {
            kind: "before-after",
            before: "Basically, it's our way of making things easier for busy gardeners.",
            after:
              "Fernhill Click & Collect is a free service that lets you order online and collect your order from any Fernhill shop the next working day.",
            note: "Fernhill and its service are made up. The second version names the term, says what it is, and gives the price and the timing in one sentence.",
          },
          pitfall:
            "Opening a definition with \"It\" or \"Basically\", or defining a term only by what it is not. Start with the term itself, and swap praise for a fact you can measure.",
          sources: [MDN_OL, BING_AI_ANSWERS],
        },
        {
          id: "c-numbers-units",
          quiz: {
            kind: "spot",
            id: "cq-numbers-units",
            prompt: "Which line could a reader in another country misread?",
            language: "text",
            lines: [
              "The Fernhill compost bin holds 330 liters.",
              "Spring bulb orders ship from 6/12.",
              "The Fernhill Compact costs £35, including VAT.",
              "Delivery takes 2 to 4 working days.",
            ],
            answer: 1,
            explanation:
              "\"6/12\" could be June 12 or December 6. Microsoft's style guide says to spell out the name of the month to avoid exactly this confusion. (Fernhill is made up.)",
          },
          term: "Numbers, units and dates",
          summary: "Give every number its unit and its condition, write dates with the month spelled out, and keep the same format everywhere.",
          explanation:
            "Answers that people ask engines for are often numbers: prices, sizes, times, dates. A number lifted without its unit or its condition is worse than no answer, because it looks precise and may be wrong.\n\nThe Microsoft Writing Style Guide gives rules that travel well:\n\n- **Be consistent.** It opens: \"Be consistent in your use of numbers.\"\n- **Numerals for measurements.** Use numerals for \"Measurements of distance, temperature, volume, size, weight\", even below 10.\n- **Spell out the month.** \"To avoid confusion, always spell out the name of the month.\" Its example: \"6/12/2017 might be June 12, 2017 or December 6, 2017.\"\n- **Commas in big numbers.** \"Use commas in numbers that have four or more digits.\"\n\nAdd to that the condition that makes the number true. *£45* is a price; *£45 including VAT, delivery free over £50* is an answer. Microsoft Bing's advice to \"anchor claims in measurable facts\" only works if the facts arrive with their units.",
          whyItMatters:
            "An engine may lift the sentence with the number and drop the one with the unit or the condition. Keep them in the same sentence so the lifted version is still true.",
          example: {
            kind: "before-after",
            before: "Capacity: 330. Price: 45. Ships 6/12.",
            after:
              "The Fernhill compost bin holds 330 liters and costs £45, including VAT. Orders placed now ship from December 6, 2026.",
            note: "Fernhill and its product are made up. The first line has no units, no currency and a date that reads differently in the US and the UK.",
          },
          pitfall:
            "Using different formats for the same fact on one site, such as \"330L\" in a table, \"330 liters\" in the copy and \"330 l\" in a PDF. Pick one form and use it everywhere, so every copy of the fact agrees.",
          sources: [MS_STYLE_NUMBERS, BING_AI_ANSWERS],
        },
      ],
      check: [
        {
          kind: "passage",
          id: "q-g1-opening",
          prompt:
            "A Fernhill help page (made up) is headed \"Can I return a plant?\" Which opening follows the answer-first advice in this lesson?",
          passages: [
            "Plants are living things, and we take great care choosing growers, so returns are a topic we think about a lot. Read on to find out more about our approach.",
            "Yes. You can return a healthy plant within 14 days of delivery for a full refund. Plants damaged in transit can be returned within 30 days.",
          ],
          answer: 1,
          explanation:
            "The second opening answers the question in its first word and gives the conditions in the next two sentences. The first could sit on any shop's page and never answers the question.",
        },
        {
          kind: "choice",
          id: "q-g1-inverted-pyramid",
          prompt: "According to Nielsen Norman Group, what goes first in an inverted-pyramid piece of writing?",
          options: [
            "The most important information, which might even be the conclusion",
            "Background and context, so the reader understands the conclusion",
            "A list of every topic the page will cover",
            "The details, building up to the conclusion at the end",
          ],
          answer: 0,
          explanation:
            "The inverted pyramid puts the most important information first, followed by smaller and smaller details. Nielsen Norman Group contrasts it with academic writing, where the content typically leads up to a conclusion at the end.",
        },
        {
          kind: "choice",
          id: "q-g1-numbers",
          prompt: "Which sentence about a made-up Fernhill product is safest for an engine to lift on its own?",
          options: [
            "The Fernhill water butt holds 200 liters and costs £60, including VAT.",
            "It holds 200 and costs 60.",
            "Our water butt is the most spacious on the market.",
            "Capacity and price are in the table above.",
          ],
          answer: 0,
          explanation:
            "It names the product and gives each number with its unit and its condition. The others drop units, make an unanchored claim, or point somewhere else.",
        },
      ],
    },
    {
      id: "g-standalone",
      title: "Passages that stand alone",
      concepts: [
        {
          id: "c-passage-ranking",
          quiz: {
            kind: "choice",
            id: "cq-passage-ranking",
            prompt: "With passage ranking, what does Google still rank in its results?",
            options: [
              "The page, judged partly by how relevant its individual passages are",
              "Each paragraph as a separate result",
              "Only the first passage on each page",
              "Pages under a set word count",
            ],
            answer: 0,
            explanation:
              "Google says the improvement applies to how it ranks web pages overall, and that passages help it judge how relevant a page is. What gets ranked is still the page.",
          },
          term: "Google's passage ranking",
          summary: "Google identifies individual passages on a page to judge how relevant the page is to a search.",
          explanation:
            "Google announced the change in October 2020. It said it had \"made a breakthrough in ranking\" and could now \"better understand the relevancy of specific passages\", so that it could \"find that needle-in-a-haystack information you're looking for\". It expected the change to \"improve 7 percent of search queries across all languages\" as it rolled out.\n\nGoogle's guide to its ranking systems now lists it by name: \"Passage ranking is an AI system we use to identify individual sections or \"passages\" of a web page to better understand how relevant a page is to a search.\"\n\nNote what is being ranked. The announcement says the improvement \"applies to how we rank web pages overall\", and the guide says passages help Google judge \"how relevant a page is\". What gets ranked is still the page. A long guide with one clear section on a narrow question can be relevant to that question without being split up.",
          whyItMatters:
            "A single clear section can make a long page relevant to a narrow question. Lesson 1 covered why answer engines cite passages. Passage ranking is Google's own evidence that classic Search also judges pages section by section.",
          pitfall:
            "Splitting one good guide into dozens of thin pages, one per question, on the theory that engines only want short pages. Google's description is about finding the right section within a page, not about page length.",
          sources: [GOOGLE_PASSAGES, GOOGLE_RANKING_SYSTEMS],
        },
        {
          id: "c-engines-on-passages",
          quiz: {
            kind: "match",
            id: "cq-engines-on-passages",
            prompt: "Match each company to what its own documentation says.",
            pairs: [
              { term: "Google", definition: "There's no requirement to break content into tiny pieces for AI" },
              { term: "Microsoft Bing", definition: "Assistants break content into smaller pieces, a process called parsing" },
              { term: "OpenAI", definition: "The model can search within a page, and citations record the location of the source" },
              { term: "Anthropic", definition: "Each citation carries up to 150 characters of the cited content" },
            ],
            explanation:
              "All four describe engines that find and use pieces of a page. Only Google addresses chunking directly, and it says you don't need to do it for Google Search.",
          },
          term: "What engines say about passages",
          summary: "Engines pick out pieces of your page themselves. None asks you to cut pages up for them, and Google says you don't need to.",
          explanation:
            "Advice to \"chunk\" content for AI is everywhere, so check what each company actually documents.\n\n- **Google.** Its guide to optimizing for generative AI features, added to Search Central in May 2026, lists chunking among the things you can ignore: \"There's no requirement to break your content into tiny pieces for AI to better understand it.\" It adds that \"Google systems are able to understand the nuance of multiple topics on a page and show the relevant piece to users\", and \"There's no ideal page length\".\n- **Microsoft Bing.** \"AI assistants don't read a page top to bottom like a person would.\" They break content into pieces, and \"These modular pieces are what get ranked and assembled into answers.\"\n- **OpenAI.** Its web search tool can take an action called `find_in_page`, \"which represents searching within a page\", and each citation carries \"the URL, title and location of the cited source\".\n- **Anthropic.** Each Claude web search citation includes \"Up to 150 characters of the cited content\".\n\nThe common thread: the engine finds the piece. Your job is to make each piece worth finding, which is what the rest of this lesson covers.",
          whyItMatters:
            "You can stop worrying about engineering \"AI-ready chunks\" and spend the effort on clear writing. Google says \"You don't need to write in a specific way just for generative AI search.\" Clear, self-contained paragraphs help readers first, and every engine above can use them.",
          pitfall:
            "Rebuilding pages into fixed-length blocks or one-question fragments because a tool or agency says AI needs \"chunks\". Google says it ignores that for Search, and Bing's advice is about clear structure, not page surgery.",
          sources: [GOOGLE_AI_OPTIMIZATION, GOOGLE_DOC_UPDATES, BING_AI_ANSWERS, OPENAI_WEB_SEARCH, CLAUDE_WEB_SEARCH],
        },
        {
          id: "c-name-the-subject",
          quiz: {
            kind: "blank",
            id: "cq-name-the-subject",
            prompt: "Complete Microsoft's advice from this card.",
            text: "Microsoft lists ___ phrasing among the things that make content snippable: sentences that make sense even when pulled out of ___.",
            answers: ["Self-contained", "context"],
            distractors: ["Keyword-rich", "order", "Persuasive"],
            explanation:
              "Microsoft asks for self-contained phrasing: sentences that still make sense when pulled out of context. Naming the subject instead of writing \"it\" is the simplest way to get there.",
          },
          term: "Name the subject",
          summary: "Each paragraph should make sense when lifted out: say what it is about instead of leaning on \"this\" or \"it\".",
          explanation:
            "Microsoft Bing says AI assistants \"break content down, a process called parsing, into smaller, structured pieces\" and then assemble those pieces into answers, \"often drawing from multiple sources\". A paragraph that arrives in an answer on its own has lost everything around it, including the heading above it and the sentence before it.\n\nSo check each paragraph's first sentence. If it starts with \"This\", \"It\", \"They\" or \"As mentioned above\", the reader of the lifted passage does not know what you mean. Repeat the noun instead. It can feel repetitive on the page, but it is what makes the passage safe to quote.\n\nThe same goes for references to the page itself. Phrases such as *see the table below* and *as shown earlier* point nowhere once the passage has left the page. Say what the table shows, or give the fact directly.",
          whyItMatters:
            "Microsoft lists \"Self-contained phrasing\" among the things that make content snippable. A passage that names its subject can be quoted without the paragraph above it.",
          example: {
            kind: "before-after",
            before: "This makes it ideal for smaller gardens, and it's easy to move once it's empty.",
            after:
              "The Fernhill 200-liter rain butt is 60 cm wide, so it fits smaller gardens. The rain butt is light enough to move once it is empty.",
            note: "Fernhill and its product are made up. The first sentence depends on whatever came before it. The second version names the product twice, and each sentence still works alone.",
          },
          pitfall:
            "Fixing only the first sentence. A paragraph that names the product once and then says \"it\" five times can still be cut mid-way. Name the subject again wherever a sentence might be quoted alone.",
          sources: [BING_AI_ANSWERS],
        },
        {
          id: "c-one-idea",
          quiz: {
            kind: "choice",
            id: "cq-one-idea",
            prompt: "Why give each paragraph one job, according to this card?",
            options: [
              "Its first sentence can then summarize it, and the paragraph can answer one question cleanly",
              "Google requires content to be split into tiny pieces for AI",
              "Paragraphs must be one sentence long",
              "Engines ignore paragraphs with more than one claim",
            ],
            answer: 0,
            explanation:
              "One job per paragraph makes the first sentence a summary and the paragraph a clean answer. Google says it doesn't require tiny pieces, and the card warns against cutting every paragraph to one line.",
          },
          term: "One idea per passage",
          summary: "Give each paragraph one job, and open it with its most important sentence.",
          explanation:
            "Nielsen Norman Group: \"The first sentence of every paragraph should be the most important.\" That only works if the paragraph has one main point.\n\nMicrosoft Bing gives its reasons from the engine's side. It warns against \"long walls of text\", which \"blur ideas together and make it harder for AI to separate content into usable chunks\". It also flags \"Overloaded sentences\": \"Packing multiple claims into one line makes it harder for AI (and readers) to parse meaning.\"\n\nGoogle frames it around readers rather than machines. Its guide to generative AI features says \"People generally appreciate it when web pages are organized by paragraphs and sections, along with headings that provide a clear structure to navigate content.\" It also says there's no need to break content into tiny pieces for AI. So this is a writing habit, not a format rule: a paragraph can be several sentences long, as long as they all serve the same point.",
          whyItMatters:
            "When a paragraph does one job, its first sentence works as a summary, and the whole paragraph can be lifted to answer one question. A paragraph that mixes delivery, returns and warranty answers none of them cleanly.",
          example: {
            kind: "before-after",
            before:
              "The bin holds 330 liters and comes with a ten-year guarantee, and delivery is free over £50, though returns must be sent back in the original packaging within 30 days.",
            after:
              "The Fernhill compost bin holds 330 liters and comes with a ten-year guarantee.\n\nYou can return the Fernhill compost bin within 30 days, in its original packaging.",
            note: "Made-up product facts. The first version packs four claims into one sentence. The second gives the product facts and the returns policy a paragraph each. Delivery belongs in a section of its own.",
          },
          pitfall:
            "Cutting every paragraph down to one line. One idea per passage does not mean one sentence per passage: keep the conditions and evidence that belong to the idea.",
          sources: [NNG_INVERTED_PYRAMID, BING_AI_ANSWERS, GOOGLE_AI_OPTIMIZATION],
        },
      ],
      check: [
        {
          kind: "spot",
          id: "q-g2-dangling",
          prompt: "Which sentence cannot be understood if an engine lifts it out on its own?",
          language: "text",
          lines: [
            "The Fernhill rain butt holds 200 liters of water.",
            "The rain butt comes with a brass tap and a childproof lid.",
            "This makes it a good choice for families.",
            "Delivery for the Fernhill rain butt is free on orders over £50.",
          ],
          answer: 2,
          explanation:
            "\"This\" and \"it\" point back to earlier sentences. Lifted alone, the reader cannot tell what is a good choice, or why. Every other line names the product.",
        },
        {
          kind: "choice",
          id: "q-g2-ranking",
          prompt: "How does Google's guide to its ranking systems describe passage ranking?",
          options: [
            "An AI system that identifies individual sections of a page to better understand how relevant the page is to a search",
            "A system that indexes every paragraph as a separate page",
            "A system that only works on pages with fewer than 500 words",
            "A manual review of the best passage on each page",
          ],
          answer: 0,
          explanation:
            "Google says passage ranking identifies individual sections or \"passages\" of a page \"to better understand how relevant a page is to a search\". It is still a way of ranking pages. Google gives no word limit.",
        },
        {
          kind: "match",
          id: "q-g2-match",
          prompt: "Match each point to the source that makes it.",
          pairs: [
            { term: "Sentences that only make sense in context", definition: "Microsoft Bing asks for self-contained phrasing instead" },
            { term: "Long walls of text", definition: "Microsoft Bing says they blur ideas together" },
            { term: "A paragraph whose key point comes last", definition: "Nielsen Norman Group says the first sentence should be the most important" },
            { term: "Breaking pages into tiny pieces for AI", definition: "Google says there's no requirement to do it" },
          ],
          explanation:
            "Each warning comes from a different angle: an engine assembling answers, a usability researcher, and Google's own guide to generative AI features. They all point to clear, self-contained, front-loaded passages, not to special chunking.",
        },
      ],
    },
    {
      id: "g-structure",
      title: "Structure engines can lift",
      concepts: [
        {
          id: "c-question-headings",
          quiz: {
            kind: "choice",
            id: "cq-question-headings",
            prompt: "In November 2026 you add a questions-and-answers section with FAQPage markup to a Fernhill help page (made up). What should you expect from Google?",
            options: [
              "No FAQ rich result, because Google stopped showing them in May 2026. The section can still help readers if each answer comes first.",
              "An expandable FAQ result under the page in Google",
              "A guaranteed place in AI Overviews",
              "A penalty for using question headings",
            ],
            answer: 0,
            explanation:
              "Google's changelog says the FAQ rich result stopped appearing from May 7, 2026. Question headings with direct answers still help readers, and Bing still names FAQ sections among the things that help AI systems reference content.",
          },
          term: "Question-shaped headings",
          summary: "A heading that matches the question people ask, with the answer straight under it. No rich result promised.",
          explanation:
            "Microsoft Bing says headings \"mark where one idea ends and another begins\", and that for AI \"they act like chapter titles that define clear content slices\". Instead of a vague heading such as \"Learn More\", it suggests a question: \"What Makes This Dishwasher Quieter Than Most Models?\" It adds that \"Direct questions with clear answers mirror the way people search.\"\n\nNot every style guide agrees. GOV.UK says headings should not \"be questions – they're hard to frontload and users want answers, not questions\", and prefers descriptive, active headings. Both rule out generic headings (GOV.UK names \"Introduction\"), and both want the answer straight away.\n\n**FAQ sections no longer earn a Google rich result.** Google's changelog says the FAQ rich result \"will no longer appear in Google Search starting May 7, 2026\", and Google has since removed its documentation because \"The FAQ rich result feature is no longer shown in Google Search results\". A short questions-and-answers block can still help readers: Bing's AI Performance guidance says \"Clear headings, tables, and FAQ sections help surface key information and make content easier for AI systems to reference accurately.\"",
          whyItMatters:
            "A heading tells a reader and an engine what the next passage answers. A heading such as \"Learn more\" tells neither. Google's own content questions ask whether \"the main heading or page title provide[s] a descriptive, helpful summary of the content\".",
          example: {
            kind: "code",
            language: "html",
            caption: "A question heading with the answer as the first sentence under it (Fernhill is made up)",
            code: "<h2>How long does delivery take?</h2>\n<p>Fernhill delivers to all UK addresses in 2 to 4 working days.</p>",
          },
          pitfall:
            "Bolting an FAQ block onto every page to win an expandable result in Google. That result is gone. Use a question heading where it matches a real query, a descriptive heading elsewhere, and put the direct answer first either way.",
          sources: [BING_AI_ANSWERS, GOVUK_STRUCTURE, GOOGLE_HELPFUL, GOOGLE_DOC_UPDATES, BING_AI_PERFORMANCE],
        },
        {
          id: "c-lists-tables",
          quiz: {
            kind: "choice",
            id: "cq-lists-tables",
            prompt: "What is MDN's test for choosing a numbered list (<ol>)?",
            options: [
              "Change the order of the items: if the meaning changes, use <ol>",
              "Use <ol> whenever there are more than five items",
              "Use <ol> for anything you want engines to quote",
              "Use <ol> when items have two or more values each",
            ],
            answer: 0,
            explanation:
              "MDN says to try changing the order of the items, and to use <ol> if the meaning changes. Items with several values each are tabular data, which belongs in a table.",
          },
          term: "Lists for steps, tables for comparisons",
          summary: "Numbered lists when order matters, bullets when it does not, and tables for data with rows and columns.",
          explanation:
            "Microsoft Bing: \"Bulleted lists, numbered steps, and comparison tables break complex details into clean, reusable segments.\" It says they are \"especially effective for how-to queries and feature comparisons\", but also warns: \"avoid overusing them\".\n\nTo choose the right one, use the definitions in the HTML reference on MDN:\n\n- **Numbered list (`<ol>`).** MDN's test: \"try changing the order of the list items; if the meaning changes, use the `<ol>` element\". Assembly steps pass that test.\n- **Bulleted list (`<ul>`).** For items whose order does not matter, such as features.\n- **Table (`<table>`).** It \"represents tabular data\", meaning \"information presented in a two-dimensional table comprised of rows and columns\". Three products compared on price, size and capacity is tabular data.\n\nAnd a plain paragraph for everything else. An explanation with reasons, conditions and trade-offs is prose, and chopping it into bullets loses the words that connect the ideas.",
          whyItMatters:
            "The format tells the engine how the parts relate. Steps in a numbered list keep their order when lifted. A comparison in a table keeps each value next to its product.",
          example: {
            kind: "code",
            language: "html",
            caption: "Assembly steps as a real numbered list (made-up product)",
            code: "<ol>\n  <li>Place the base of the Fernhill compost bin on level soil.</li>\n  <li>Click the four side panels into the base.</li>\n  <li>Fit the lid.</li>\n  <li>Slide the access hatch into the front slot until it clicks.</li>\n</ol>",
          },
          pitfall:
            "Bullet points for everything. Microsoft says bullets work best \"for key steps, comparisons, or highlights. Not for every line of content.\" An explanation with reasons and conditions usually reads better as a paragraph.",
          sources: [BING_AI_ANSWERS, MDN_OL, MDN_TABLE],
        },
        {
          id: "c-comparison-tables",
          quiz: {
            kind: "spot",
            id: "cq-comparison-tables",
            prompt: "Which line of this made-up comparison table should use header cells (<th>) instead?",
            language: "html",
            lines: [
              "<caption>Fernhill compost bins compared</caption>",
              "<tr><td>Bin</td><td>Capacity (liters)</td><td>Price (£, incl. VAT)</td></tr>",
              "<tr><th scope=\"row\">Fernhill Compact</th><td>220</td><td>35</td></tr>",
              "<tr><th scope=\"row\">Fernhill Standard</th><td>330</td><td>45</td></tr>",
            ],
            answer: 1,
            explanation:
              "The header row is built from <td> cells, so nothing in the markup says these are the column headers. MDN says <th> defines a cell as the header of a group of cells. The caption and the row headers are already right.",
          },
          term: "Comparison tables that hold up",
          summary: "Give a comparison a caption, real header cells, one unit per column, and a sentence on which option suits whom.",
          explanation:
            "A comparison is only as good as its table. MDN gives the markup:\n\n- **Header cells.** `<th>` \"defines a cell as the header of a group of table cells\". Use it for column headings and for the first cell of each row.\n- **A caption.** \"By supplying a <caption> element whose value clearly and concisely describes the table's purpose, it helps the people decide if they need to check the rest of the table content or skip over it.\"\n- **Scope.** The `scope` attribute is often inferred, but \"specifying header scope may improve user experiences\".\n\nThe content matters as much as the markup. Google's guidance on reviews asks you to \"Share quantitative measurements about how something measures up in various categories of performance\" and to \"Cover comparable things to consider, or explain which might be best for certain uses or circumstances.\" In a table, that means the same measure for every product, the unit in the column header, and a sentence under the table that says which option suits which buyer.",
          whyItMatters:
            "Bing's AI Performance guidance names tables, with headings and FAQ sections, as things that \"help surface key information\". A lifted cell keeps its meaning only if its header is a real header and its unit is in the header or the cell.",
          example: {
            kind: "code",
            language: "html",
            caption: "A comparison table with a caption, header cells and units (made-up products)",
            code: "<table>\n  <caption>Fernhill compost bins compared</caption>\n  <thead>\n    <tr><th scope=\"col\">Bin</th><th scope=\"col\">Capacity (liters)</th><th scope=\"col\">Price (£, incl. VAT)</th></tr>\n  </thead>\n  <tbody>\n    <tr><th scope=\"row\">Fernhill Compact</th><td>220</td><td>35</td></tr>\n    <tr><th scope=\"row\">Fernhill Standard</th><td>330</td><td>45</td></tr>\n  </tbody>\n</table>\n<p>The Compact suits small gardens; the Standard suits households that compost all their garden waste.</p>",
          },
          pitfall:
            "Publishing the comparison as an image, or as a screenshot from a spreadsheet. Microsoft Bing warns against \"putting key information only in images\". Keep the table as HTML text.",
          sources: [MDN_TH, MDN_TABLE, GOOGLE_REVIEWS, BING_AI_PERFORMANCE, BING_AI_ANSWERS],
        },
        {
          id: "c-semantic-html",
          quiz: {
            kind: "choice",
            id: "cq-semantic-html",
            prompt: "What does Google's 2026 guide to generative AI features say about semantic HTML?",
            options: [
              "It isn't required to be perfect, but it's a good idea because it helps users such as screen reader users",
              "Pages without perfect semantic HTML are left out of AI features",
              "It replaces the need for text content",
              "Google ignores heading elements entirely",
            ],
            answer: 0,
            explanation:
              "Google says perfectly semantic HTML isn't required, but that semantic HTML is generally a good idea because it helps people using screen readers parse and navigate the page.",
          },
          term: "Semantic HTML",
          summary: "Use real heading, list and table elements, and keep important content as text in the HTML.",
          explanation:
            "A heading should be an `<h2>` or `<h3>`, not a `<div>` styled to look big. MDN says the heading elements \"represent six levels of section headings\" and gives two rules: \"Do not use heading elements to resize text\", and \"Do not skip heading levels\". It adds that screen reader users often \"jump from heading to heading\" to work out what a page contains.\n\nGoogle is relaxed about perfection here. Its guide to generative AI features says \"While it's not required to have perfectly semantic HTML\", \"it's generally a good idea to try to use semantic HTML when possible, as it helps other types of users, such as screen readers, parse and navigate your web page more easily.\"\n\nThe same goes for content. Google lists \"Making sure that important content is available in textual form\" among its SEO basics for AI features. Microsoft Bing advises against \"relying on PDFs for core information\" and warns: \"Don't hide important answers in tabs or expandable menus: AI systems may not render hidden content\". That last point is Microsoft's: Google counts tabbed and expanded sections as part of a page's main content.",
          whyItMatters:
            "Real elements carry meaning that a styled `<div>` does not, and they help people who use screen readers. That makes semantic HTML a good habit even though Google says it doesn't need to be perfect.",
          example: {
            kind: "before-after",
            before: "<div class=\"text-xl font-bold\">How do you assemble the bin?</div>",
            after: "<h2>How do you assemble the bin?</h2>",
            note: "Both look the same in the browser once styled. Only the second is a heading in the HTML.",
          },
          pitfall:
            "Choosing a heading level for its size. Pick the level that fits the outline (`<h2>` for a section, `<h3>` inside it), and set the size with CSS.",
          sources: [MDN_HEADINGS, GOOGLE_AI_OPTIMIZATION, GOOGLE_AI_FEATURES, BING_AI_ANSWERS, GOOGLE_HELPFUL],
        },
      ],
      check: [
        {
          kind: "choice",
          id: "q-g3-steps",
          prompt: "A page explains how to set up a rain butt in five steps that must be done in order. Which HTML element fits best, according to MDN?",
          options: [
            "<ol>, because changing the order of the items would change the meaning",
            "<ul>, because bullets are easier to read",
            "<table>, because each step is a row",
            "A single <p>, so the steps stay together",
          ],
          answer: 0,
          explanation:
            "MDN's test is to change the order of the items: if the meaning changes, use <ol>. Steps that must be done in order pass that test.",
        },
        {
          kind: "blank",
          id: "q-g3-blank",
          prompt: "Complete MDN's guidance on headings.",
          text: "Do not use heading elements to resize ___: use CSS instead. Do not ___ heading levels, because screen reader users often jump from heading to heading.",
          answers: ["text", "skip"],
          distractors: ["images", "repeat", "nest"],
          explanation:
            "MDN says to set the size with the CSS font-size property and never to skip levels. Nesting headings is fine: MDN says they may be nested as subsections.",
        },
        {
          kind: "choice",
          id: "q-g3-heading",
          prompt: "Which heading gives a reader and an engine the clearest idea of what the next passage answers?",
          options: ["Learn more", "How much does delivery to Northern Ireland cost?", "Introduction", "Other information"],
          answer: 1,
          explanation:
            "Microsoft Bing calls headings such as \"Learn More\" vague, and GOV.UK rules out generic headings such as \"Introduction\". The delivery heading names the question the passage answers.",
        },
      ],
    },
    {
      id: "g-freshness-proof",
      title: "Freshness and proof",
      concepts: [
        {
          id: "c-visible-dates",
          quiz: {
            kind: "choice",
            id: "cq-visible-dates",
            prompt: "A page shows \"Last updated: 12 October 2026\", but its structured data says dateModified is 3 September 2026. What does Google's guidance say?",
            options: [
              "Make them consistent: the visible date and the structured data should match",
              "Nothing: Google only reads the visible date",
              "Remove the visible date and keep the markup",
              "Set both to a future date so the page stays fresh",
            ],
            answer: 0,
            explanation:
              "Google asks for the user-visible date and the structured data to match, and says not to use future dates.",
          },
          term: "Visible published and updated dates",
          summary: "Show a clearly labeled date on the page, keep it consistent with your markup, and change it only when the content changes.",
          explanation:
            "Google's steps for byline dates are to \"Add a user-visible date to the page and feature it prominently\", label it with text like \"Publish\" or \"Last updated\", and also give the date in structured data (`datePublished` and `dateModified`).\n\nIts best practices:\n\n- **Be consistent.** The visible date and the structured data should match.\n- **No future dates.** \"Don't specify future dates, or the date of the action described on the page.\"\n- **Keep other dates down.** If Google picks the wrong one, consider \"removing some or all other dates that appear on the page\".\n\nGoogle also explains why it needs your help: \"Google doesn't depend on a single date factor because all factors can be prone to issues.\" It looks at several, and it \"doesn't guarantee that a byline date, whether visible or in structured data, will be shown in search results\". Microsoft Bing lists \"fresh\" content first among the qualities that help in AI search.",
          whyItMatters:
            "Google runs \"query deserves freshness\" systems that show fresher content \"for queries where it would be expected\". An honest date helps readers judge whether an answer is current, and it is one of the things Google uses to estimate when the page was published or updated.",
          example: {
            kind: "code",
            language: "html",
            caption: "A labeled, visible update date (made-up page)",
            code: "<h1>Fernhill delivery and returns</h1>\n<p>Last updated: 12 October 2026</p>",
          },
          pitfall:
            "Bumping the date without changing the page. Google lists \"changing the date of pages to make them seem fresh when the content has not substantially changed\" as a warning sign of search engine-first content.",
          sources: [GOOGLE_BYLINE_DATES, GOOGLE_RANKING_SYSTEMS, GOOGLE_HELPFUL, BING_AI_ANSWERS],
        },
        {
          id: "c-update-in-place",
          quiz: {
            kind: "choice",
            id: "cq-update-in-place",
            prompt: "The only change to a Fernhill guide (made up) is the copyright year in its footer. Should its sitemap <lastmod> change?",
            options: [
              "No. Google says a copyright date update is not a significant update",
              "Yes. Any change at all should update lastmod",
              "Yes, and the page should move to a new URL",
              "No, because Google ignores lastmod completely",
            ],
            answer: 0,
            explanation:
              "Google says lastmod should reflect the last significant update, such as the main content, structured data or links, and that a copyright date update is not one. Google uses lastmod when it is consistently accurate, so it doesn't ignore it.",
          },
          term: "Update in place, don't republish",
          summary: "When facts change, improve the page at the URL it already has, and record real changes honestly in the page and the sitemap.",
          explanation:
            "When a price, a policy or a product changes, edit the page that already answers the question. Publishing a near-copy at a new URL leaves two versions of the answer online, and an engine may lift the old one.\n\nRecord the change where engines look for it:\n\n- **Sitemap.** Google: \"The <lastmod> value should reflect the date and time of the last significant update to the page.\" It counts changes to \"the main content, the structured data, or links on the page\", \"however an update to the copyright date is not\". Google only uses lastmod if it is consistently and verifiably accurate.\n- **The page.** Change the visible \"Last updated\" date and `dateModified` together, as in the previous card.\n- **Notifications.** Bing's AI Performance guidance says \"Regular updates help ensure AI systems reference the most current version of your content\", and that \"IndexNow helps keep information fresh across search and AI experiences by notifying participating search engines whenever content is added, updated, or removed.\"\n\nIf the URL really must change, Google says: \"we recommend that you use a permanent server-side redirect whenever possible.\"",
          whyItMatters:
            "One URL that stays current keeps its links and its history, and gives every engine one version of the answer. Google says its systems estimate \"when a page was published or significantly updated\", so a real update is something it can see.",
          example: {
            kind: "before-after",
            before:
              "The hatch design changes. Fernhill publishes a new page, /compost-bin-assembly-new, and leaves the old assembly page live with the old instructions.",
            after:
              "Fernhill rewrites the hatch step on the existing assembly page, changes \"Last updated\" and dateModified to 2 November 2026, and updates the page's lastmod in the sitemap.",
            note: "Fernhill and its pages are made up. In the first version, two pages give different instructions for the same bin. In the second, there is one current answer at the URL that already has the links.",
          },
          pitfall:
            "Treating updates as a ranking trick. Google lists \"adding a lot of new content or removing a lot of older content primarily because you believe it will help your search rankings overall\" as a warning sign, and answers its own question: \"(No, it won't)\".",
          sources: [GOOGLE_SITEMAPS, GOOGLE_BYLINE_DATES, BING_AI_PERFORMANCE, GOOGLE_REDIRECTS, GOOGLE_HELPFUL],
        },
        {
          id: "c-authorship",
          quiz: {
            kind: "choice",
            id: "cq-authorship",
            prompt: "Fernhill's guides have no named authors. Which fix matches Google's guidance on this card?",
            options: [
              "Add accurate bylines that link to a page about each real author, and say how products were tested",
              "Create expert profiles with AI-generated headshots and invented credentials",
              "Add the same famous gardener's name to every page",
              "Leave authors off, because Google never looks at who wrote a page",
            ],
            answer: 0,
            explanation:
              "Google strongly encourages accurate authorship information such as bylines, and says fabricated creator profiles are a form of deception that makes a page untrustworthy.",
          },
          term: "Say who wrote it and how",
          summary: "Accurate bylines, an author page and a short note on how you tested give readers a reason to trust the answer.",
          explanation:
            "Google suggests asking \"Who, How, and Why\" about your content.\n\n**Who.** Google's questions include \"Is it self-evident to your visitors who authored your content?\" and \"Do pages carry a byline, where one might be expected?\" It says: \"We strongly encourage adding accurate authorship information, such as bylines to content where readers might expect it.\" Bylines should lead somewhere: Google asks whether they lead \"to further information about the author or authors involved\".\n\n**How.** Google says that with product reviews, \"it can build trust with readers when they understand the number of products that were tested, what the test results were, and how the tests were conducted\". Its review guidance adds: \"Provide evidence such as visuals, audio, or other links of your own experience with what you are reviewing\".\n\nFor a shop like Fernhill, that means a byline from the person who actually wrote or checked the guide, a page about them, and a line on how the advice was tested.",
          whyItMatters:
            "A named author and a visible method let a reader check the answer before relying on it. Google ties these \"Who\" signals to how people understand the E-E-A-T of content.",
          example: {
            kind: "code",
            language: "html",
            caption: "A byline with an author page and a testing note (Fernhill and Priya Shah are made up)",
            code: "<p>By <a href=\"/about/priya-shah\">Priya Shah</a>, head of horticulture at Fernhill. Last updated: 2 November 2026.</p>\n<p>How we tested: we filled each bin in our trial garden for six months and weighed the finished compost.</p>",
          },
          pitfall:
            "Inventing experts. Google says fabricating creator profiles, with AI-generated headshots, made-up names or false credentials, \"is a form of deception\", and \"Any form of deception makes a page untrustworthy to both users and our automated quality systems\".",
          sources: [GOOGLE_HELPFUL, GOOGLE_REVIEWS],
        },
        {
          id: "c-sources-original-data",
          quiz: {
            kind: "passage",
            id: "cq-sources-original-data",
            prompt: "Which claim on a made-up Fernhill page shows the clear sourcing this card describes?",
            passages: [
              "In our 2026 customer survey, 412 of 500 Fernhill compost bin owners said assembly took under 30 minutes. The full results and questions are on our research page.",
              "Most gardeners find our compost bins really easy to use.",
            ],
            answer: 0,
            explanation:
              "The first gives the figure, the sample and where to check it. The second is a vague claim nobody can verify.",
          },
          term: "Cite sources and publish original data",
          summary: "Show where your facts come from, link to the evidence, and add something other pages do not have.",
          explanation:
            "Google's self-assessment questions ask whether content provides \"original information, reporting, research, or analysis\", and whether it presents information \"in a way that makes you want to trust it, such as clear sourcing\". Bing's AI Performance guidance agrees: \"Examples, data, and cited sources help build trust when content is reused in AI-generated answers.\"\n\nOn the page, that means putting the source next to the claim: a link to the standard, the study or your own results page, not a list of links at the bottom. Google's review guidance suggests you \"Include links to other useful resources (your own or from other sites) to help a reader make a decision.\"\n\nCiting is not a substitute for adding something. Google says \"Attribution or giving credit to other sources doesn't replace the need for original effort\", and its original content systems show original reporting \"ahead of those who merely cite it\".\n\nOne research study points the same way. In the GEO paper (Aggarwal et al., KDD 2024), the authors rewrote web pages and measured their visibility in answers generated by GPT-3.5 Turbo on their GEO-bench benchmark, with a smaller follow-up on Perplexity.ai. Their top methods were adding citations, quotations and statistics. Keyword stuffing gave \"little to no improvement\".",
          whyItMatters:
            "A claim with a named source is easier for readers to check, and Google says its original content systems aim to show original reporting ahead of pages that merely cite it. Treat the GEO study as one research result, not a rule for any particular engine.",
          example: {
            kind: "before-after",
            before: "Most gardeners find our compost bins really easy to use.",
            after:
              "In our 2026 customer survey, 412 of 500 Fernhill compost bin owners said assembly took under 30 minutes. Full results and the survey questions are on our research page.",
            note: "Fernhill and its survey are made up. The second version gives the figure, the sample and where to check it. Only publish figures you can back up.",
          },
          pitfall:
            "Adding statistics or quotes you cannot stand behind because a study said they help. Google's questions include whether the content has \"any easily-verified factual errors\". Invented proof breaks trust with readers and engines alike.",
          sources: [GOOGLE_HELPFUL, BING_AI_PERFORMANCE, GOOGLE_REVIEWS, GOOGLE_RANKING_SYSTEMS, GEO_PAPER],
        },
        {
          id: "c-people-first",
          quiz: {
            kind: "choice",
            id: "cq-people-first",
            prompt: "Which planned Fernhill article (made up) is non-commodity content in Google's sense?",
            options: [
              "What happened when we ran three compost bins side by side in our trial garden for a year",
              "10 composting tips every gardener should know",
              "A summary of the top five composting guides in search results",
              "One page for every way people might phrase \"how to compost\"",
            ],
            answer: 0,
            explanation:
              "Google contrasts first-hand experience with summaries that restate what is already available, and warns that pages made for every query variation can break its scaled content abuse policy.",
          },
          term: "People-first, non-commodity content",
          summary: "Google's test for content: is it made to help people, and does it add first-hand knowledge others don't have?",
          explanation:
            "Google's guidance opens: \"Google's automated ranking systems are designed to prioritize helpful, reliable information that's created to benefit people, and not content that's created to manipulate search engine rankings.\" Its 2026 guide to generative AI features says the same holds there: \"From Google Search's perspective, optimizing for generative AI search is optimizing for the search experience, and thus still SEO.\"\n\nThat guide's main advice is non-commodity content. It says \"a first-hand review provides a unique perspective based on personal experience, whereas a summary of existing content simply restates information already available elsewhere.\" Commodity content \"is often based on common knowledge, which could originate from anyone, and typically adds little unique insight for readers.\"\n\nIt also warns against making a page for every phrasing of a question: doing so \"primarily to manipulate rankings or generative AI responses in Google Search violates Google's scaled content abuse spam policy.\" And the older warning signs still apply, such as \"Are you mainly summarizing what others have to say without adding much value?\"",
          whyItMatters:
            "Everything in this lesson serves readers first. Answer-first passages, clear structure and first-hand proof help people who visit directly. Google calls \"Why\" \"perhaps the most important question to answer about your content\".",
          pitfall:
            "Writing \"for AI\": thin pages of rephrased answers that add nothing new. That is exactly the summarizing-without-value pattern Google warns about, and its 2026 guide says \"You don't need to write in a specific way just for generative AI search.\"",
          sources: [GOOGLE_HELPFUL, GOOGLE_AI_OPTIMIZATION, GOOGLE_AI_FEATURES],
        },
      ],
      check: [
        {
          kind: "choice",
          id: "q-g4-date-bump",
          prompt:
            "A colleague suggests changing the \"Last updated\" date on your top guides every month, without editing them, so they look fresh. What does Google's guidance say?",
          options: [
            "It lists changing dates to make pages seem fresh, when the content has not substantially changed, as a warning sign",
            "It recommends updating the date monthly so freshness systems pick the page",
            "It says dates have no effect on anything, so it does not matter",
            "It says to remove all dates from the page instead",
          ],
          answer: 0,
          explanation:
            "Google's people-first guidance names this exact practice as a sign of search engine-first content. Change the date when the content changes, and keep the visible date consistent with your structured data.",
        },
        {
          kind: "blank",
          id: "q-g4-blank",
          prompt: "Complete Google's byline date guidance.",
          text: "Add a user-visible date and label it with text like \"Last ___\". Don't specify ___ dates.",
          answers: ["updated", "future"],
          distractors: ["viewed", "past", "estimated"],
          explanation:
            "Google's label examples include \"Last updated\", \"Published\" and \"Posted\". It also says not to give future dates, or the date of an event the page describes.",
        },
        {
          kind: "choice",
          id: "q-g4-geo",
          prompt: "What did the GEO study (Aggarwal et al., KDD 2024) find on its own benchmark?",
          options: [
            "Adding citations, quotations and statistics were among the best methods, and keyword stuffing gave little to no improvement",
            "Keyword stuffing was the most effective method",
            "Google AI Overviews cite pages with statistics first",
            "No change to a page's content made any difference",
          ],
          answer: 0,
          explanation:
            "The study tested rewrites against answers generated by GPT-3.5 Turbo on its GEO-bench benchmark. A smaller follow-up ran on Perplexity.ai, but the study did not measure AI Overviews. Read it as supporting evidence, not as a rule for any particular engine.",
        },
      ],
    },
  ],

  exercise: {
    id: "x-rewrite-answer-first",
    title: "Rewrite it answer-first",
    brief:
      "Fernhill Garden Supply (made up) has this passage on its compost bin page, under the heading \"Getting started\": \"Thanks for choosing Fernhill! We know you're excited to get composting, and we've designed this bin with you in mind. It's really easy. First you find a level spot, then it's a case of clicking the side panels together, after which the lid goes on, and then there is the access hatch: you slide it in at the front until it clicks. It shouldn't take long and you won't need anything.\" The facts behind it: assembly takes about 20 minutes and needs no tools. Improve it one decision at a time.",
    steps: [
      {
        kind: "passage",
        id: "x-step-opening",
        prompt: "Which opening should replace the first three sentences?",
        passages: [
          "Thanks for choosing Fernhill! We hope you enjoy your new bin as much as we enjoyed designing it.",
          "The Fernhill 330-liter compost bin takes about 20 minutes to assemble and needs no tools.",
        ],
        answer: 1,
        explanation:
          "The second opening answers the questions a customer is most likely to have, how long and what do I need, in one sentence that names the product and gives the numbers with their units. The first is a welcome, not an answer.",
      },
      {
        kind: "choice",
        id: "x-step-heading",
        prompt: "Which heading should replace \"Getting started\"?",
        options: [
          "How do you assemble the Fernhill compost bin?",
          "Everything you need to know",
          "Read this first",
          "Step 1",
        ],
        answer: 0,
        explanation:
          "It says exactly what the passage answers, in the words a customer would use. The others are as generic as \"Getting started\". A descriptive heading such as \"Assemble the compost bin\", as GOV.UK prefers, would also work.",
      },
      {
        kind: "passage",
        id: "x-step-sentence",
        prompt: "Which version of the step about the front of the bin still makes sense if it is lifted out on its own?",
        passages: [
          "Slide the access hatch into the slot at the front of the Fernhill compost bin until it clicks.",
          "You slide it in at the front until it clicks.",
        ],
        answer: 0,
        explanation:
          "\"It\" could be the lid, a panel or the hatch. The first version names the part, the place and the product, so it works as an answer to \"how does the hatch go on?\" without any context.",
      },
      {
        kind: "choice",
        id: "x-step-list",
        prompt: "How should the assembly steps be laid out?",
        options: [
          "As a numbered list (<ol>), one step per item, because the order matters",
          "As a bulleted list (<ul>), because bullets are easier to scan",
          "As a table with one column",
          "As one paragraph, so the steps stay together",
        ],
        answer: 0,
        explanation:
          "Swap any two steps and the instructions stop working, so MDN's test points to <ol>. A one-column table is not tabular data, and one long paragraph is the overloaded sentence Microsoft warns about.",
      },
      {
        kind: "choice",
        id: "x-step-update",
        prompt:
          "Next spring Fernhill changes the hatch so it screws on instead of clicking in. What should happen to the assembly section?",
        options: [
          "Rewrite the hatch step on the same page, and change the visible \"Last updated\" date, dateModified and the sitemap lastmod together",
          "Publish a new assembly page at a new URL and leave the old one live",
          "Leave the page as it is, but change its date every month so it looks current",
          "Split each step onto its own page so engines can find the change",
        ],
        answer: 0,
        explanation:
          "Updating in place keeps one current answer at the URL that already has the links, and an honest date tells readers and engines that something really changed. Two live versions give conflicting answers, a date bump without changes is a warning sign in Google's guidance, and Google says there's no need to break content into tiny pieces.",
      },
    ],
    debrief:
      "The rewrite says the same things as the original, in a different order: a heading that names the question, a first sentence that answers it with its numbers and units, then numbered steps that each name the part they describe. When the product changes, the same page changes with it, with an honest date. Nothing was hidden or added for machines, and nothing was chopped up for them. Each change also helps a customer standing over a box of panels. Run the same five checks on your own pages: opening, heading, self-contained sentences, format, and freshness.",
  },

  example: {
    title: "GOV.UK: Holiday entitlement",
    context:
      "The \"Entitlement\" section of GOV.UK's Holiday entitlement guide, fetched on 6 November 2026. The section answers its question in its first sentence.",
    excerpt: {
      kind: "quote",
      text: "Almost all people classed as workers are legally entitled to 5.6 weeks’ paid holiday a year (known as statutory leave entitlement or annual leave). […] Most workers who work a 5-day week must receive at least 28 days’ paid annual leave a year. This is the equivalent of 5.6 weeks of holiday.",
    },
    points: [
      {
        label: "The answer is the first sentence",
        text: "The page does not open with background on employment law. It gives the number, 5.6 weeks, and who it applies to, then lists the groups it includes. That is the inverted pyramid GOV.UK's content guidance asks for.",
      },
      {
        label: "Self-contained, with the number and its condition",
        text: "\"Most workers who work a 5-day week must receive at least 28 days’ paid annual leave a year\" names who, what, the unit and the condition in one sentence. Lifted alone, it is still accurate. The next sentence ties it back to the 5.6-week figure.",
      },
      {
        label: "Both terms people use",
        text: "The first sentence gives the plain phrase \"paid holiday\" and the terms \"statutory leave entitlement\" and \"annual leave\" in brackets. Microsoft Bing recommends the same habit, using synonyms and related terms, because it \"helps AI connect concepts\".",
      },
      {
        label: "What it does not show",
        text: "On the day it was fetched, the page showed no published or last updated date. Its dates sat only in the code, and they disagreed: the JSON-LD gave a dateModified of 17 November 2014, matching the govuk:public-updated-at meta tag, while the govuk:updated-at tag said 5 November 2026. Facts like these can change, so for your own pages, follow Google's advice: show a labeled date that changes when the content does, and keep the dates in your markup in step with it.",
      },
    ],
    source: GOVUK_HOLIDAY,
  },

  audit: [
    {
      kind: "passage",
      id: "a-passage-opening",
      prompt: "A page is headed \"Do you deliver to Northern Ireland?\" Which opening is answer-first?",
      passages: [
        "We know how important it is to get your garden supplies quickly, wherever you live, and we're always looking at ways to improve our service.",
        "Yes. Fernhill delivers to Northern Ireland in 3 to 5 working days, and delivery is free on orders over £50.",
      ],
      answer: 1,
      explanation:
        "The second answers yes in its first word, then gives the time and the condition in one sentence. The first never answers the question. (Fernhill is made up.)",
    },
    {
      kind: "passage",
      id: "a-passage-standalone",
      prompt: "Which sentence can an engine safely quote on its own?",
      passages: [
        "As we said above, they're cheaper on the bigger size.",
        "The Fernhill Standard compost bin costs £45, and the Fernhill Compact costs £35.",
      ],
      answer: 1,
      explanation:
        "The first relies on \"above\" and \"they\", so it means nothing alone. The second names both products and both prices. (Made-up products.)",
    },
    {
      kind: "spot",
      id: "a-spot-heading",
      prompt: "Which line should be a real heading element instead?",
      language: "html",
      lines: [
        "<h1>Fernhill compost bin, 330 liters</h1>",
        "<p>The Fernhill compost bin holds 330 liters and costs £45.</p>",
        "<div class=\"text-xl font-bold\">How do you assemble the bin?</div>",
        "<p>Assembling the Fernhill compost bin takes about 20 minutes and needs no tools.</p>",
      ],
      answer: 2,
      explanation:
        "The div is styled to look like a heading but is not one. MDN says heading elements represent section headings, so this should be an <h2>. The paragraphs and the <h1> are already correct.",
    },
    {
      kind: "order",
      id: "a-order-inverted-pyramid",
      prompt: "Put the parts of an answer-first section in inverted-pyramid order, most important first.",
      items: [
        "A one- or two-sentence direct answer to the question",
        "The conditions, exceptions, supporting details and examples",
        "Background on the topic",
      ],
      explanation:
        "The answer comes first, then the detail, then background. Nielsen Norman Group puts the most important information first, \"followed by supporting details and background information\".",
    },
    {
      kind: "match",
      id: "a-match-format",
      prompt: "Match each kind of content to the format that fits it.",
      pairs: [
        { term: "Assembly steps that must be done in order", definition: "A numbered list (<ol>)" },
        { term: "Three bins compared on capacity, size and price", definition: "A table (<table>) with header cells" },
        { term: "Product features that can go in any order", definition: "A bulleted list (<ul>)" },
        { term: "A direct answer to one question", definition: "One or two sentences under a heading" },
      ],
      explanation:
        "MDN's order test separates <ol> from <ul>, and tables are for data in rows and columns. A direct answer needs no list at all: Microsoft Bing describes concise answers as one or two sentences.",
    },
    {
      kind: "blank",
      id: "a-blank-dates",
      prompt: "Fill in what Google asks for when you show a date on a page that also has structured data.",
      text: "Add a ___ date to the page and feature it prominently. Make sure it matches the date in your ___ data.",
      answers: ["user-visible", "structured"],
      distractors: ["future", "hidden", "estimated"],
      explanation:
        "Google asks for a prominent, labeled date that matches datePublished or dateModified in structured data. It says not to use future dates.",
    },
    {
      kind: "choice",
      id: "a-passage-ranking",
      prompt: "What did Google say passage ranking, announced in October 2020, would let it do?",
      options: [
        "Better understand the relevance of specific passages, as well as of the page as a whole",
        "Show every paragraph of a page as a separate result",
        "Rank pages only by their first paragraph",
        "Ignore pages longer than a set number of words",
      ],
      answer: 0,
      explanation:
        "Google said it could now understand the relevance of specific passages in addition to the overall page, and that the improvement applies to how it ranks web pages overall.",
    },
    {
      kind: "choice",
      id: "a-chunking",
      prompt: "An agency offers to rebuild your guides into short \"AI-ready chunks\" for Google's AI Overviews. What does Google's 2026 guide to generative AI features say?",
      options: [
        "There's no requirement to break content into tiny pieces, and Google can show the relevant piece of a page itself",
        "Chunking is required to appear in AI Overviews",
        "Pages must be under 300 words to be used in AI features",
        "Chunks must be marked up with special schema.org types",
      ],
      answer: 0,
      explanation:
        "Google lists chunking among the things you can ignore for Google Search, says its systems understand multiple topics on a page and can show the relevant piece, and says there's no ideal page length.",
    },
    {
      kind: "choice",
      id: "a-word-count",
      prompt: "Does Google have a preferred word count for content?",
      options: [
        "No. Google's people-first guidance says so directly, and lists writing to a word count as a warning sign",
        "Yes, at least 1,500 words for guides",
        "Yes, under 300 words, so passages are easy to lift",
        "Only for pages that appear in AI Overviews",
      ],
      answer: 0,
      explanation:
        "Google asks whether you are writing to a particular word count because you heard it has a preferred one, and answers: \"(No, we don't.)\"",
    },
    {
      kind: "choice",
      id: "a-hidden-tabs",
      prompt:
        "Your key delivery answer sits inside a collapsed tab. Which source in this lesson warns that AI systems may not render hidden content?",
      options: [
        "Microsoft Bing's guidance on AI search answers",
        "Google's guidance on creating helpful content",
        "MDN's page on the table element",
        "Nielsen Norman Group's article on the inverted pyramid",
      ],
      answer: 0,
      explanation:
        "Microsoft Bing says not to hide important answers in tabs or expandable menus. Google's guidance treats tabbed and expanded sections as part of a page's main content, so the warning is Microsoft's. Keeping the key answer visible is the safe choice for both.",
    },
    {
      kind: "choice",
      id: "a-original",
      prompt: "Which addition to a buying guide best matches Google's question about original information?",
      options: [
        "Results from your own test of the products, with how you ran it",
        "A rewritten summary of three competitors' guides",
        "A longer introduction",
        "A new publication date with no other changes",
      ],
      answer: 0,
      explanation:
        "Google asks whether content provides \"original information, reporting, research, or analysis\". Rewriting others adds no value, length is not a goal, and a new date without changes is a warning sign.",
    },
  ],
};

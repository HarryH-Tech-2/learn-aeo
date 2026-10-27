// Lesson 3, The Answer Quarter: writing citable content.
// Every claim about an engine, a style guide or an HTML element is tied to a
// source checked on the `accessed` date. Fernhill Garden Supply is a made-up
// shop, and its product facts (sizes, prices, timings) are invented for the
// exercises.

import type { LessonContent, Source } from "../lesson-types";

const ACCESSED = "2026-10-27";

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

const GOOGLE_HELPFUL: Source = {
  title: "Creating helpful, reliable, people-first content",
  publisher: "Google Search Central",
  url: "https://developers.google.com/search/docs/fundamentals/creating-helpful-content",
  date: "2026-10-05",
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
    "You have reached The Answer Quarter, the third district of the City of Answers. The bots you let in at The Crawl Docks bring pages here, and the city's answers are written from the passages they carry. In this district you learn to write passages that are easy to lift, easy to check and safe to quote.",

  outro:
    "You leave The Answer Quarter able to lead with the answer, write passages that stand on their own, lay them out in structures engines can lift, and back them with honest dates and real sources. Next stop is The Schema Works, where you describe those pages to machines with structured data.",

  groups: [
    {
      id: "g-answer-first",
      title: "Answer first",
      concepts: [
        {
          id: "c-lead-with-answer",
          term: "Lead with the answer",
          summary: "Put a one- or two-sentence direct answer straight under the question, then add the detail.",
          explanation:
            "Journalists call this the **inverted pyramid**. Nielsen Norman Group describes it as a structure where \"the most important information (or what might even be considered the conclusion) is presented first\", and says the style is \"perfectly suited to writing for the web\".\n\nGOV.UK's content guidance gives the same instruction: \"Put the most important information first.\" Then \"taper down to smaller and smaller details as your content goes on.\"\n\nMicrosoft Bing's guidance on AI search answers points the same way. Among the things that make content eligible for snippets, it lists \"Concise answers: One- to two-sentence responses that directly address a question.\"",
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
          term: "Definitions that stand alone",
          summary: "Define a term in one sentence that names it and says what it is, with nothing borrowed from nearby text.",
          explanation:
            "A good definition reads like a reference entry. MDN's pages on HTML elements are a model. The page for `<ol>` opens: \"The `<ol>` HTML element represents an ordered list of items — typically rendered as a numbered list.\" The term comes first, then what it is, then what it looks like. You can quote that sentence anywhere and it still makes sense.\n\nMicrosoft Bing asks for the same quality in AI answers: \"Sentences that make sense even when pulled out of context.\" It also warns about \"Unanchored claims\", such as calling something \"next-gen\" or \"cutting-edge\" without context, and advises: \"anchor claims in measurable facts.\"",
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
            "Opening a definition with \"It\" or \"Basically\", or defining a term only by what it is not. Start with the term itself.",
          sources: [MDN_OL, BING_AI_ANSWERS],
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
      ],
    },
    {
      id: "g-standalone",
      title: "Passages that stand alone",
      concepts: [
        {
          id: "c-passage-ranking",
          term: "Google's passage ranking",
          summary: "Google identifies individual passages on a page to judge how relevant the page is to a search.",
          explanation:
            "Google announced the change in October 2020. It said it had \"made a breakthrough in ranking\" and could now \"better understand the relevancy of specific passages\", so that it could \"find that needle-in-a-haystack information you're looking for\". It expected the change to \"improve 7 percent of search queries across all languages\" as it rolled out.\n\nGoogle's guide to its ranking systems now lists it by name: \"Passage ranking is an AI system we use to identify individual sections or \"passages\" of a web page to better understand how relevant a page is to a search.\"\n\nNote what is being ranked. The announcement says the improvement \"applies to how we rank web pages overall\", and the guide says passages help Google judge \"how relevant a page is\". What gets ranked is still the page.",
          whyItMatters:
            "A single clear section can make a long page relevant to a narrow question. The Gate covered why answer engines cite passages. Passage ranking is Google's own evidence that classic Search also judges pages section by section.",
          pitfall:
            "Splitting one good guide into dozens of thin pages, one per question, on the theory that engines only want short pages. Google's description is about finding the right section within a page, not about page length.",
          sources: [GOOGLE_PASSAGES, GOOGLE_RANKING_SYSTEMS],
        },
        {
          id: "c-name-the-subject",
          term: "Name the subject",
          summary: "Each paragraph should make sense when lifted out: say what it is about instead of leaning on \"this\" or \"it\".",
          explanation:
            "Microsoft Bing says AI assistants \"break content down, a process called parsing, into smaller, structured pieces\" and then assemble those pieces into answers, \"often drawing from multiple sources\". A paragraph that arrives in an answer on its own has lost everything around it.\n\nSo check each paragraph's first sentence. If it starts with \"This\", \"It\", \"They\" or \"As mentioned above\", the reader of the lifted passage does not know what you mean. Repeat the noun instead. It can feel repetitive on the page, but it is what makes the passage safe to quote.",
          whyItMatters:
            "Microsoft lists \"Self-contained phrasing\" among the things that make content snippable. A passage that names its subject can be quoted without the paragraph above it.",
          example: {
            kind: "before-after",
            before: "This makes it ideal for smaller gardens, and it's easy to move once it's empty.",
            after:
              "The Fernhill 200-litre rain butt is 60 cm wide, so it fits smaller gardens. The rain butt is light enough to move once it is empty.",
            note: "Fernhill and its product are made up. The first sentence depends on whatever came before it. The second version names the product twice, and each sentence still works alone.",
          },
          pitfall:
            "Fixing only the first sentence. A paragraph that names the product once and then says \"it\" five times can still be cut mid-way. Name the subject again wherever a sentence might be quoted alone.",
          sources: [BING_AI_ANSWERS],
        },
        {
          id: "c-one-idea",
          term: "One idea per passage",
          summary: "Give each paragraph one job, and open it with its most important sentence.",
          explanation:
            "Nielsen Norman Group: \"The first sentence of every paragraph should be the most important.\" That only works if the paragraph has one main point.\n\nMicrosoft Bing gives the reasons from the engine's side. It warns against \"long walls of text\", which \"blur ideas together and make it harder for AI to separate content into usable chunks\". It also flags \"Overloaded sentences\": \"Packing multiple claims into one line makes it harder for AI (and readers) to parse meaning.\"",
          whyItMatters:
            "When a paragraph does one job, its first sentence works as a summary, and the whole paragraph can be lifted to answer one question. A paragraph that mixes delivery, returns and warranty answers none of them cleanly.",
          example: {
            kind: "before-after",
            before:
              "The bin holds 330 litres and comes with a ten-year guarantee, and delivery is free over £50, though returns must be sent back in the original packaging within 30 days.",
            after:
              "The Fernhill compost bin holds 330 litres and comes with a ten-year guarantee.\n\nYou can return the Fernhill compost bin within 30 days, in its original packaging.",
            note: "Made-up product facts. The first version packs four claims into one sentence. The second gives the product facts and the returns policy a paragraph each. Delivery belongs in a section of its own.",
          },
          pitfall:
            "Cutting every paragraph down to one line. One idea per passage does not mean one sentence per passage: keep the conditions and evidence that belong to the idea.",
          sources: [NNG_INVERTED_PYRAMID, BING_AI_ANSWERS],
        },
      ],
      check: [
        {
          kind: "spot",
          id: "q-g2-dangling",
          prompt: "Which sentence cannot be understood if an engine lifts it out on its own?",
          language: "text",
          lines: [
            "The Fernhill rain butt holds 200 litres of water.",
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
          prompt: "Match each problem to the source that warns about it.",
          pairs: [
            { term: "Sentences that only make sense in context", definition: "Microsoft Bing asks for self-contained phrasing instead" },
            { term: "Long walls of text", definition: "Microsoft Bing says they blur ideas together" },
            { term: "A paragraph whose key point comes last", definition: "Nielsen Norman Group says the first sentence should be the most important" },
            { term: "An answer buried deep in a page", definition: "Google's passage ranking was built to find it" },
          ],
          explanation:
            "Each warning comes from a different angle: an engine assembling answers, a usability researcher, and Google's own ranking announcement. They all point to short, self-contained, front-loaded passages.",
        },
      ],
    },
    {
      id: "g-structure",
      title: "Structure engines can lift",
      concepts: [
        {
          id: "c-question-headings",
          term: "Question-shaped headings",
          summary: "A heading that matches the question people ask, with the answer straight under it.",
          explanation:
            "Microsoft Bing says headings \"mark where one idea ends and another begins\", and that for AI \"they act like chapter titles that define clear content slices\". Instead of a vague heading such as \"Learn More\", it suggests a question: \"What Makes This Dishwasher Quieter Than Most Models?\" In its section on Q&A formats, it adds that \"Direct questions with clear answers mirror the way people search.\"\n\nNot every style guide agrees. GOV.UK says headings should not \"be questions – they're hard to frontload and users want answers, not questions\", and prefers descriptive, active headings such as \"Apply for a driving licence\".\n\nThe two agree on the part that matters: no generic headings (GOV.UK also rules out \"Introduction\"), and the answer must come straight away. If you use a question heading, put the direct answer in the first sentence under it.",
          whyItMatters:
            "A heading tells a reader and an engine what the next passage answers. A heading such as \"Learn more\" tells neither. Google's own content questions ask whether \"the main heading or page title provide[s] a descriptive, helpful summary of the content\".",
          example: {
            kind: "code",
            language: "html",
            caption: "A question heading with the answer as the first sentence under it (Fernhill is made up)",
            code: "<h2>How long does delivery take?</h2>\n<p>Fernhill delivers to all UK addresses in 2 to 4 working days.</p>",
          },
          pitfall:
            "Turning every heading into a question, including ones nobody asks. Use a question where it matches a real query, and a descriptive heading elsewhere.",
          sources: [BING_AI_ANSWERS, GOVUK_STRUCTURE, GOOGLE_HELPFUL],
        },
        {
          id: "c-lists-tables",
          term: "Lists for steps, tables for comparisons",
          summary: "Numbered lists when order matters, bullets when it does not, and tables for data with rows and columns.",
          explanation:
            "Microsoft Bing: \"Bulleted lists, numbered steps, and comparison tables break complex details into clean, reusable segments.\" It says they are \"especially effective for how-to queries and feature comparisons\", but also warns: \"avoid overusing them\".\n\nTo choose the right one, use the definitions in the HTML reference on MDN:\n\n- **Numbered list (`<ol>`).** MDN's test: \"try changing the order of the list items; if the meaning changes, use the `<ol>` element\". Assembly steps pass that test.\n- **Bulleted list (`<ul>`).** For items whose order does not matter, such as features.\n- **Table (`<table>`).** It \"represents tabular data\", meaning \"information presented in a two-dimensional table comprised of rows and columns\". Three products compared on price, size and capacity is tabular data.",
          whyItMatters:
            "The format tells the engine how the parts relate. Steps in a numbered list keep their order when lifted. A comparison in a table keeps each value next to its product.",
          example: {
            kind: "code",
            language: "html",
            caption: "A comparison as a real table (made-up products)",
            code: "<table>\n  <tr><th>Bin</th><th>Capacity</th><th>Price</th></tr>\n  <tr><td>Fernhill Compact</td><td>220 litres</td><td>£35</td></tr>\n  <tr><td>Fernhill Standard</td><td>330 litres</td><td>£45</td></tr>\n</table>",
          },
          pitfall:
            "Bullet points for everything. Microsoft says bullets work best \"for key steps, comparisons, or highlights. Not for every line of content.\" An explanation with reasons and conditions usually reads better as a paragraph.",
          sources: [BING_AI_ANSWERS, MDN_OL, MDN_TABLE],
        },
        {
          id: "c-semantic-html",
          term: "Semantic HTML",
          summary: "Use real heading, list and table elements, and keep important content as text in the HTML.",
          explanation:
            "A heading should be an `<h2>` or `<h3>`, not a `<div>` styled to look big. MDN says the heading elements \"represent six levels of section headings\" and gives two rules: \"Do not use heading elements to resize text\", and \"Do not skip heading levels\". It adds that screen reader users often \"jump from heading to heading\" to work out what a page contains.\n\nThe same goes for content. Google lists \"Making sure that important content is available in textual form\" among its SEO basics for AI features. Microsoft Bing advises against \"relying on PDFs for core information\" and against \"putting key information only in images\". It also warns: \"Don't hide important answers in tabs or expandable menus: AI systems may not render hidden content\". That last point is Microsoft's: Google counts tabbed and expanded sections as part of a page's main content.",
          whyItMatters:
            "Real elements carry meaning that a styled `<div>` does not. They also help people who use screen readers, which makes semantic HTML a good habit whatever engines do with it.",
          example: {
            kind: "before-after",
            before: "<div class=\"text-xl font-bold\">How do you assemble the bin?</div>",
            after: "<h2>How do you assemble the bin?</h2>",
            note: "Both look the same in the browser once styled. Only the second is a heading in the HTML.",
          },
          pitfall:
            "Choosing a heading level for its size. Pick the level that fits the outline (`<h2>` for a section, `<h3>` inside it), and set the size with CSS.",
          sources: [MDN_HEADINGS, GOOGLE_AI_FEATURES, BING_AI_ANSWERS, GOOGLE_HELPFUL],
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
          term: "Visible published and updated dates",
          summary: "Show a clearly labelled date on the page, keep it consistent with your markup, and change it only when the content changes.",
          explanation:
            "Google's steps for byline dates are to \"Add a user-visible date to the page and feature it prominently\", label it with text like \"Publish\" or \"Last updated\", and also give the date in structured data (`datePublished` and `dateModified`).\n\nIts best practices:\n\n- **Be consistent.** The visible date and the structured data should match.\n- **No future dates.** \"Don't specify future dates, or the date of the action described on the page.\"\n- **Keep other dates down.** If Google picks the wrong one, consider \"removing some or all other dates that appear on the page\".\n\nGoogle also says it \"doesn't guarantee that a byline date, whether visible or in structured data, will be shown in search results\". Microsoft Bing lists \"fresh\" content first among the qualities that help in AI search.",
          whyItMatters:
            "Google runs \"query deserves freshness\" systems that show fresher content \"for queries where it would be expected\". An honest date helps readers judge whether an answer is current, and it is one of the things Google uses to estimate when the page was published or updated.",
          example: {
            kind: "code",
            language: "html",
            caption: "A labelled, visible update date (made-up page)",
            code: "<h1>Fernhill delivery and returns</h1>\n<p>Last updated: 12 October 2026</p>",
          },
          pitfall:
            "Bumping the date without changing the page. Google lists \"changing the date of pages to make them seem fresh when the content has not substantially changed\" as a warning sign of search engine-first content.",
          sources: [GOOGLE_BYLINE_DATES, GOOGLE_RANKING_SYSTEMS, GOOGLE_HELPFUL, BING_AI_ANSWERS],
        },
        {
          id: "c-sources-original-data",
          term: "Cite sources and publish original data",
          summary: "Show where your facts come from, and add something other pages do not have.",
          explanation:
            "Google's self-assessment questions ask whether content provides \"original information, reporting, research, or analysis\", and whether it presents information \"in a way that makes you want to trust it, such as clear sourcing\". Google also says \"Attribution or giving credit to other sources doesn't replace the need for original effort.\" Its ranking systems guide describes original content systems that show original reporting \"ahead of those who merely cite it\".\n\nOne research study points the same way. In the GEO paper (Aggarwal et al., KDD 2024), the authors rewrote web pages and measured how visible they were in answers generated by GPT-3.5 Turbo on their GEO-bench benchmark. Their top methods were adding citations (Cite Sources), quotations (Quotation Addition) and statistics (Statistics Addition). Keyword stuffing gave \"little to no improvement\".\n\nThe authors also ran a smaller follow-up on Perplexity.ai, \"a commercially deployed generative engine\", using 200 test queries. Because Perplexity does not let users specify source URLs, they uploaded the source text as files instead. They report that the methods which worked on their test engine also improved visibility there, and that keyword stuffing did worse than the unoptimised pages on one of their two visibility measures (a word count weighted by position in the answer), though it scored higher on the other (a subjective impression score).",
          whyItMatters:
            "A claim with a named source is easier for readers to check, and Google says its original content systems aim to show original reporting ahead of pages that merely cite it. The GEO study's main results come from a test engine built on GPT-3.5 Turbo, with a smaller follow-up on Perplexity.ai. Treat it as one research study, not a rule for any particular engine.",
          example: {
            kind: "before-after",
            before: "Most gardeners find our compost bins really easy to use.",
            after:
              "In our 2026 customer survey, 412 of 500 Fernhill compost bin owners said assembly took under 30 minutes. Full results and the survey questions are on our research page.",
            note: "Fernhill and its survey are made up. The second version gives the figure, the sample and where to check it. Only publish figures you can back up.",
          },
          pitfall:
            "Adding statistics or quotes you cannot stand behind because a study said they help. Google's questions include whether the content has \"any easily-verified factual errors\". Invented proof breaks trust with readers and engines alike.",
          sources: [GOOGLE_HELPFUL, GOOGLE_RANKING_SYSTEMS, GEO_PAPER],
        },
        {
          id: "c-people-first",
          term: "Helpful, reliable, people-first content",
          summary: "Google's test for content: is it made to help people, or made to rank?",
          explanation:
            "Google's guidance opens: \"Google's automated ranking systems are designed to prioritize helpful, reliable information that's created to benefit people, and not content that's created to manipulate search engine rankings.\" Its guide to AI features names the same practice. Among the foundations for appearing in AI Overviews and AI Mode, it lists \"creating helpful, reliable, people-first content\".\n\nThe guidance gives warning signs of search engine-first content, including:\n\n- \"Are you mainly summarizing what others have to say without adding much value?\"\n- \"Does your content leave readers feeling like they need to search again to get better information from other sources?\"\n- \"Are you writing to a particular word count because you've heard or read that Google has a preferred word count? (No, we don't.)\"\n\nGoogle calls \"Why\" \"perhaps the most important question to answer about your content\".",
          whyItMatters:
            "Everything in this lesson serves readers first. Answer-first passages, clear structure and honest proof help people who visit directly. Google says that is the kind of content its systems seek to reward.",
          pitfall:
            "Writing \"for AI\": thin pages of rephrased answers that add nothing new. That is exactly the summarising-without-value pattern Google warns about.",
          sources: [GOOGLE_HELPFUL, GOOGLE_AI_FEATURES],
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
          "The Fernhill 330-litre compost bin takes about 20 minutes to assemble and needs no tools.",
        ],
        answer: 1,
        explanation:
          "The second opening answers the questions a customer is most likely to have, how long and what do I need, in one sentence that names the product. The first is a welcome, not an answer.",
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
    ],
    debrief:
      "The rewrite says the same things as the original, in a different order: a heading that names the question, a first sentence that answers it, then numbered steps that each name the part they describe. Nothing was hidden or added for machines. Each change also helps a customer standing over a box of panels. Run the same four checks on your own pages: opening, heading, self-contained sentences, format.",
  },

  example: {
    title: "GOV.UK: Holiday entitlement",
    context:
      "The \"Entitlement\" section of GOV.UK's Holiday entitlement guide, fetched on 27 October 2026. The section answers its question in its first sentence.",
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
        label: "Self-contained, with the condition attached",
        text: "\"Most workers who work a 5-day week must receive at least 28 days’ paid annual leave a year\" names who, what and the condition in one sentence. Lifted alone, it is still accurate. The next sentence ties it back to the 5.6-week figure.",
      },
      {
        label: "Both terms people use",
        text: "The first sentence gives the plain phrase \"paid holiday\" and the terms \"statutory leave entitlement\" and \"annual leave\" in brackets. Microsoft Bing recommends the same habit, using synonyms and related terms, because it \"helps AI connect concepts\".",
      },
      {
        label: "What it does not show",
        text: "On the day it was fetched, the page showed no published or last updated date. Its dates sat only in the code, and they disagreed: the JSON-LD gave a dateModified of 17 November 2014, matching the govuk:public-updated-at meta tag, while the govuk:updated-at tag said 16 October 2026. Facts like these can change, so for your own pages, follow Google's advice: show a labelled date that changes when the content does, and keep the dates in your markup in step with it.",
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
        "<h1>Fernhill compost bin, 330 litres</h1>",
        "<p>The Fernhill compost bin holds 330 litres and costs £45.</p>",
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
        { term: "Three bins compared on capacity, size and price", definition: "A table (<table>)" },
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
        "Google asks for a prominent, labelled date that matches datePublished or dateModified in structured data. It says not to use future dates.",
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

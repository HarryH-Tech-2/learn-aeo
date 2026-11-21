// Lesson 4: structured data and entities.
// Every claim about Google, Bing, schema.org or JSON-LD is tied to a source
// checked on the `accessed` date. Google retired the How-to rich result in 2023,
// a group of lesser-used features in 2025 (book actions was later kept), the
// practice problem feature in January 2026 and the FAQ rich result on 7 May 2026;
// breadcrumbs have shown on desktop only since January 2025. The lesson teaches
// what Google's structured data gallery lists as of the `accessed` date.
// Larkfield Tea is a made-up shop on a reserved .example domain, and its details
// (founding year, phone number, VAT number, address, staff, profiles, prices)
// are invented for the examples and exercises. Maya Okafor is a made-up employee.

import type { LessonContent, Source } from "../lesson-types";

const ACCESSED = "2026-11-06";

const GOOGLE_SD_INTRO: Source = {
  title: "Introduction to structured data markup in Google Search",
  publisher: "Google Search Central",
  url: "https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data",
  date: "2025-12-10",
  dateKind: "updated",
  accessed: ACCESSED,
};

const GOOGLE_SD_GUIDELINES: Source = {
  title: "General structured data guidelines",
  publisher: "Google Search Central",
  url: "https://developers.google.com/search/docs/appearance/structured-data/sd-policies",
  date: "2026-07-10",
  dateKind: "updated",
  accessed: ACCESSED,
};

const GOOGLE_GALLERY: Source = {
  title: "Structured data markup that Google Search supports",
  publisher: "Google Search Central",
  url: "https://developers.google.com/search/docs/appearance/structured-data/search-gallery",
  date: "2026-10-16",
  dateKind: "updated",
  accessed: ACCESSED,
};

const GOOGLE_RICH_RESULTS_TEST: Source = {
  title: "Rich Results Test",
  publisher: "Search Console Help (Google)",
  url: "https://support.google.com/webmasters/answer/7445569",
  accessed: ACCESSED,
};

const GOOGLE_SDTT_UPDATE: Source = {
  title: "An update on the Structured Data Testing Tool",
  publisher: "Google Search Central Blog",
  url: "https://developers.google.com/search/blog/2020/12/structured-data-testing-tool-update",
  date: "2020-12-15",
  dateKind: "published",
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

const GOOGLE_SITE_NAMES: Source = {
  title: "Site names in Google Search",
  publisher: "Google Search Central",
  url: "https://developers.google.com/search/docs/appearance/site-names",
  date: "2025-12-10",
  dateKind: "updated",
  accessed: ACCESSED,
};

const GOOGLE_ARTICLE: Source = {
  title: "Article (Article, NewsArticle, BlogPosting) structured data",
  publisher: "Google Search Central",
  url: "https://developers.google.com/search/docs/appearance/structured-data/article",
  date: "2026-09-08",
  dateKind: "updated",
  accessed: ACCESSED,
};

const GOOGLE_PROFILE_PAGE: Source = {
  title: "Profile page (ProfilePage) structured data",
  publisher: "Google Search Central",
  url: "https://developers.google.com/search/docs/appearance/structured-data/profile-page",
  date: "2026-09-08",
  dateKind: "updated",
  accessed: ACCESSED,
};

const GOOGLE_PRODUCT_SNIPPET: Source = {
  title: "Product snippet (Product, Review, Offer) structured data",
  publisher: "Google Search Central",
  url: "https://developers.google.com/search/docs/appearance/structured-data/product-snippet",
  date: "2026-09-08",
  dateKind: "updated",
  accessed: ACCESSED,
};

const GOOGLE_REVIEW_SNIPPET: Source = {
  title: "Review snippet (Review, AggregateRating) structured data",
  publisher: "Google Search Central",
  url: "https://developers.google.com/search/docs/appearance/structured-data/review-snippet",
  date: "2026-09-08",
  dateKind: "updated",
  accessed: ACCESSED,
};

const GOOGLE_BREADCRUMB: Source = {
  title: "Breadcrumb (BreadcrumbList) structured data",
  publisher: "Google Search Central",
  url: "https://developers.google.com/search/docs/appearance/structured-data/breadcrumb",
  date: "2026-09-08",
  dateKind: "updated",
  accessed: ACCESSED,
};

const GOOGLE_BREADCRUMB_MOBILE: Source = {
  title: "Simplifying the visible URL element on mobile search results",
  publisher: "Google Search Central Blog",
  url: "https://developers.google.com/search/blog/2025/01/simplifying-breadcrumbs",
  date: "2025-01-23",
  dateKind: "published",
  accessed: ACCESSED,
};

const GOOGLE_SIMPLIFYING_2025: Source = {
  title: "Simplifying the search results page",
  publisher: "Google Search Central Blog",
  url: "https://developers.google.com/search/blog/2025/06/simplifying-search-results",
  date: "2025-06-12",
  dateKind: "published",
  accessed: ACCESSED,
};

const GOOGLE_HOWTO_FAQ_2023: Source = {
  title: "Changes to HowTo and FAQ rich results",
  publisher: "Google Search Central Blog",
  url: "https://developers.google.com/search/blog/2023/08/howto-faq-changes",
  date: "2023-08-08",
  dateKind: "published",
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

const GOOGLE_KNOWLEDGE_GRAPH: Source = {
  title: "Introducing the Knowledge Graph: things, not strings",
  publisher: "Google (The Keyword)",
  url: "https://blog.google/products-and-platforms/products/search/introducing-knowledge-graph-things-not/",
  date: "2012-05-16",
  dateKind: "published",
  accessed: ACCESSED,
};

const GOOGLE_KNOWLEDGE_GRAPH_HELP: Source = {
  title: "How Google's Knowledge Graph works",
  publisher: "Knowledge Panel Help (Google)",
  url: "https://support.google.com/knowledgepanel/answer/9787176",
  accessed: ACCESSED,
};

const SCHEMA_SAME_AS: Source = {
  title: "sameAs",
  publisher: "Schema.org",
  url: "https://schema.org/sameAs",
  accessed: ACCESSED,
};

const W3C_JSON_LD: Source = {
  title: "JSON-LD 1.1: A JSON-based Serialization for Linked Data",
  publisher: "W3C",
  url: "https://www.w3.org/TR/json-ld11/",
  date: "2020-07-16",
  dateKind: "published",
  accessed: ACCESSED,
};

const MAILCHIMP_HOME: Source = {
  title: "Mailchimp home page (JSON-LD in the page source)",
  publisher: "Mailchimp",
  url: "https://mailchimp.com/",
  accessed: ACCESSED,
};

export const LESSON_4: LessonContent = {
  intro:
    "In Lesson 3 you wrote passages that people and engines can lift. Here you describe those pages, the people who write them and the organization behind them, in a form machines can read without guessing: structured data. You will also find out what markup no longer does, because some of the most repeated advice about it is out of date.",

  outro:
    "You can now write JSON-LD that matches the page, test it with the right tool, pick the types Google still uses, tell a client honestly what markup does today, and describe your brand, your site and your authors as unambiguous entities joined by one @id. Lesson 5 is next, where you work on what the rest of the web says about that entity.",

  groups: [
    {
      id: "g-sd-basics",
      title: "Structured data basics",
      concepts: [
        {
          id: "c-structured-data",
          quiz: {
            kind: "choice",
            id: "cq-structured-data",
            prompt: "Your markup is valid. What does Google say that guarantees?",
            options: [
              "That the rich result will be shown",
              "Nothing: markup enables a feature to be present but doesn't guarantee it",
              "A citation in AI Overviews",
              "A higher ranking for the page",
            ],
            answer: 1,
            explanation:
              "Google says using structured data enables a feature to be present; it does not guarantee that it will be present. Markup makes you eligible, nothing more.",
          },
          term: "Structured data",
          summary: "Structured data is code on a page that labels what the page is about, in a standard vocabulary machines read the same way.",
          explanation:
            "A person reading a product page knows which number is the price and which is the model number. A machine has to infer it. Structured data removes the guesswork. Google describes it as \"explicit clues about the meaning of a page\", and defines it as \"a standardized format for providing information about a page and classifying the page content\".\n\nThe vocabulary almost everyone uses is **schema.org**: types such as `Organization`, `Article` and `Product`, each with properties such as `name`, `url` and `datePublished`. Schema.org defines far more than Google uses, so Google says to \"rely on the Google Search Central documentation as definitive for Google Search behavior, rather than the schema.org documentation.\"\n\nGoogle says it uses the markup it finds \"to gather information about the web and the world in general, such as information about the people, books, or companies that are included in the markup\". Microsoft Bing makes the AI point directly: \"Schema is a type of code that helps search engines and AI systems understand your content.\"",
          whyItMatters:
            "Markup is how you state facts about your page and your brand in a form that can't be misread: this is the price, this is the publisher, this is the date. Search engines use it for rich results, and Bing says AI systems use it to understand content.",
          example: {
            kind: "code",
            language: "json",
            caption: "A minimal block for a made-up shop, placed in a <script type=\"application/ld+json\"> tag",
            code: `{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Larkfield Tea",
  "url": "https://www.larkfieldtea.example/"
}`,
          },
          pitfall:
            "Treating markup as a guarantee. Google says: \"Using structured data enables a feature to be present, it does not guarantee that it will be present.\" Markup makes you eligible; it doesn't promise a rich result or a citation.",
          sources: [GOOGLE_SD_INTRO, GOOGLE_SD_GUIDELINES, BING_AI_ANSWERS],
        },
        {
          id: "c-json-ld",
          quiz: {
            kind: "choice",
            id: "cq-json-ld",
            prompt: "Your CMS plugin injects the JSON-LD with JavaScript after the page loads. What does Google say?",
            options: [
              "Google can read JSON-LD that is dynamically injected into the page",
              "Google ignores any JSON-LD added by JavaScript",
              "Injected markup must be copied into Microdata as well",
              "Only RDFa can be injected",
            ],
            answer: 0,
            explanation:
              "The card quotes Google: it can read JSON-LD data when it is dynamically injected into the page's contents, for example by a CMS plugin.",
          },
          term: "JSON-LD",
          summary: "JSON-LD is the format Google recommends for structured data: a block of JSON in a script tag, separate from the visible text.",
          explanation:
            "Google supports three formats: JSON-LD, Microdata and RDFa. It recommends whichever is easiest for you to maintain, adding \"in most cases, that's JSON-LD\". The reason is practical: \"The markup is not interleaved with the user-visible text\", so you can change the page copy without breaking the markup, and nest one thing inside another (an address inside an organization) cleanly. Google is clear that the choice of format doesn't change eligibility: \"all 3 formats are equally fine for Google, as long as the markup is valid\".\n\nEvery block has the same three parts:\n\n- `@context` names the vocabulary, almost always `https://schema.org`.\n- `@type` says what the thing is, such as `Organization` or `Article`.\n- The properties describe it: `name`, `url`, `logo` and so on.\n\nGoogle also says it \"can read JSON-LD data when it is dynamically injected into the page's contents\", for example by a CMS plugin.",
          whyItMatters:
            "Most CMS platforms and SEO plugins already output JSON-LD. Once you can read a block, you can check what your site is telling machines, and spot when a plugin's defaults are wrong.",
          example: {
            kind: "code",
            language: "json",
            caption: "The three parts of a block, for a made-up article",
            code: `{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "How to brew loose-leaf green tea",
  "datePublished": "2026-03-02T09:00:00+00:00",
  "author": { "@type": "Organization", "name": "Larkfield Tea" }
}`,
          },
          pitfall:
            "Filling in every property a plugin offers, accurate or not. Google says \"it is more important to supply fewer but complete and accurate recommended properties rather than trying to provide every possible recommended property with less complete, badly-formed, or inaccurate data.\"",
          sources: [GOOGLE_SD_INTRO],
        },
        {
          id: "c-match-the-page",
          quiz: {
            kind: "passage",
            id: "cq-match-the-page",
            prompt: "Which approach follows Google's guidelines?",
            passages: [
              "Generate the Product markup from the same product record as the page, so the price in the markup and on the page always agree.",
              "Keep last year's lower price in the markup, because it is accurate for some customers, even though the page shows the new price.",
            ],
            answer: 0,
            explanation:
              "Markup must describe what a visitor can see. Generating both from one record keeps them in step; a price the page doesn't show breaks the rule even if it was once accurate.",
          },
          term: "Markup must match the page",
          summary: "Structured data describes what a visitor can see on the page; it is not a place for extra claims.",
          explanation:
            "Google's general guidelines are blunt: \"Don't mark up content that is not visible to readers of the page.\" They give an example: \"if the JSON-LD markup describes a performer, the HTML body must describe that same performer.\" The introduction adds that you shouldn't add structured data \"about information that is not visible to the user, even if the information is accurate.\"\n\nThe guidelines also ask for markup that is current and true to the page: \"Provide up-to-date information\", and \"Your structured data must be a true representation of the page content.\" One of Google's examples of irrelevant markup is \"A woodworking site labeling instructions as recipes.\"\n\nWhere it goes matters too: \"Put the structured data on the page that it describes\". If you have duplicate pages for the same content, Google recommends \"placing the same structured data on all page duplicates, not just on the canonical page.\"",
          whyItMatters:
            "When the markup and the page disagree, a machine has to choose which to believe, and Google lists markup that \"is not representative of the main content of the page\" among the reasons a rich result doesn't show.",
          example: {
            kind: "before-after",
            before: "The page shows \"£24.00\" for a 250 g tin. The Product markup says \"price\": \"19.00\", left over from last year's price.",
            after: "The page and the markup both say 24.00 GBP, and the markup is generated from the same product record as the page, so a price change updates both.",
            note: "Larkfield Tea and its prices are made up. Generating markup from the same data as the page is the simplest way to keep the two in step.",
          },
          pitfall:
            "Creating pages only to carry markup. Google says: \"Don't create blank or empty pages just to hold structured data\".",
          sources: [GOOGLE_SD_GUIDELINES, GOOGLE_SD_INTRO],
        },
        {
          id: "c-validate",
          quiz: {
            kind: "match",
            id: "cq-validate",
            prompt: "Match each tool to the question it answers.",
            pairs: [
              { term: "Rich Results Test", definition: "Is this markup valid for Google's rich result features?" },
              { term: "Schema Markup Validator", definition: "Is this valid schema.org syntax, whatever the type?" },
              { term: "URL Inspection", definition: "How does Google see this published page?" },
              { term: "Rich result status reports", definition: "Has markup broken across the site since launch?" },
            ],
            explanation:
              "The Rich Results Test checks Google's features, the Schema Markup Validator checks schema.org compliance only, URL Inspection shows how Google sees a live page, and the status reports catch breakage after deployment.",
          },
          term: "Testing and monitoring markup",
          summary: "Test markup before launch with the Rich Results Test (Google features) or the Schema Markup Validator (schema.org syntax), then monitor it in Search Console.",
          explanation:
            "Two free tools check markup, and they answer different questions.\n\n- The **Rich Results Test** checks markup against Google's features. Google calls it \"an easy and useful tool for validating your structured data, and in some cases, previewing a feature in Google Search.\" You can test a live URL or paste a code snippet. For a URL, the tool fetches the page \"as Google-InspectionTool\", so a robots.txt block stops the test.\n- The **Schema Markup Validator** at validator.schema.org replaced Google's old Structured Data Testing Tool. Its job is \"to check syntax and compliance of markup with schema.org standards\", and Google said \"the tool will no longer check for Google Search rich result types\". Use it for types Google doesn't consume.\n\nGoogle's release checklist: \"Validate your code using the Rich Results Test and fix any critical errors.\" Warnings are worth fixing, \"however, this isn't necessary to be eligible for rich results\". After launch, deploy to a few pages and check them with the URL Inspection tool. Then, as Google puts it, use \"the rich result status reports after deployment\", because pages \"might break after deployment due to templating or serving issues.\"",
          whyItMatters:
            "A green tick in the wrong tool proves the wrong thing. Knowing which tool answers which question saves arguments with developers and catches template breakage before a client notices lost rich results.",
          example: {
            kind: "before-after",
            before:
              "A developer leaves a note inside the JSON-LD: // TODO confirm logo size. The Rich Results Test passes, so the block ships with the comment in it.",
            after:
              "The comment is removed before publishing. Google's help page says the test ignores comments in JSON-LD, but that the JSON-LD standard doesn't support them, so they \"might result in errors in actual usage\".",
            note: "A made-up example. The quoted words are from Google's Rich Results Test help page.",
          },
          pitfall:
            "Reading a clean result in the Schema Markup Validator as proof a page is eligible for a rich result. That tool checks schema.org compliance only; Google's own features are checked in the Rich Results Test.",
          sources: [GOOGLE_RICH_RESULTS_TEST, GOOGLE_SDTT_UPDATE, GOOGLE_SD_INTRO, GOOGLE_ORGANIZATION],
        },
      ],
      check: [
        {
          kind: "choice",
          id: "q-basics-format",
          prompt: "Why does Google recommend JSON-LD over Microdata and RDFa in most cases?",
          options: [
            "It is the only format AI systems can read",
            "It sits apart from the visible text, so it is easier to write and maintain",
            "Pages with JSON-LD rank higher than pages with Microdata",
            "It is required for rich results",
          ],
          answer: 1,
          explanation:
            "Google says all three formats are equally fine for it if valid, and recommends JSON-LD because the markup is not interleaved with the user-visible text. Nothing in its docs says JSON-LD ranks higher, is required, or is the only format AI systems read.",
        },
        {
          kind: "blank",
          id: "q-basics-parts",
          prompt: "Fill in the two keywords every JSON-LD block starts with.",
          text: `{
  "___": "https://schema.org",
  "___": "Organization",
  "name": "Larkfield Tea"
}`,
          mono: true,
          answers: ["@context", "@type"],
          distractors: ["@id", "@graph", "@vocab"],
          explanation:
            "@context names the vocabulary (schema.org) and @type says what the thing is. @id and @graph are real JSON-LD keywords, used for naming nodes and grouping several of them, but they don't take these values.",
        },
        {
          kind: "choice",
          id: "q-basics-visible",
          prompt:
            "A client wants to add a list of awards to their Organization markup. The awards appear nowhere on the site. What do you advise?",
          options: [
            "Add them: the markup is a good place for facts that don't fit the design",
            "Add them, but only on the home page",
            "Show the awards on the page first, then mark up what the page shows",
            "Put them in a hidden div so the markup has visible text to match",
          ],
          answer: 2,
          explanation:
            "Google says not to mark up content that isn't visible to readers, even if it is accurate. Hiding the text doesn't help: Google lists content \"hidden from the user\" as a reason markup is ignored. Put the facts on the page, then describe them.",
        },
      ],
    },
    {
      id: "g-types",
      title: "The types your pages need",
      concepts: [
        {
          id: "c-organization",
          quiz: {
            kind: "choice",
            id: "cq-organization",
            prompt: "Where does Google recommend putting Organization markup?",
            options: [
              "On every page of the site",
              "On the home page, or a single page that describes the organization, such as About us",
              "Only in a sitemap",
              "On each product page, with a different name per page",
            ],
            answer: 1,
            explanation:
              "Google recommends the home page or one page that describes the organization, and says you don't need it on every page.",
          },
          term: "Organization markup",
          summary: "Organization markup on your home page tells search engines your official name, site, logo and profiles.",
          explanation:
            "Google says adding Organization markup to your home page \"can help Google better understand your organization's administrative details and disambiguate your organization in search results\". Some properties shape what people see, \"such as which logo is shown in Search results and your knowledge panel\".\n\nPlace it once: Google recommends \"your home page, or a single page that describes your organization, for example the about us page\", and adds \"You don't need to include it on every page of your site.\" Use the most specific type that fits: for an ecommerce site, Google recommends \"the OnlineStore subtype instead of OnlineBusiness\".\n\n\"There are no required properties; instead, we recommend adding as many properties that are relevant to your organization.\" The ones to start with:\n\n- `name`: your name, written the way you write it everywhere else.\n- `url`: Google says this \"helps Google uniquely identify your organization.\"\n- `logo`: at least 112x112px, and it should look right on a white background.\n- `sameAs`: your profiles on other sites (more on this in the last group).",
          whyItMatters:
            "This is the one block where you describe the brand itself, not a page. It is the anchor the rest of your markup, such as the publisher of every article, can point back to.",
          example: {
            kind: "code",
            language: "json",
            caption: "Organization markup for a made-up shop",
            code: `{
  "@context": "https://schema.org",
  "@type": "OnlineStore",
  "@id": "https://www.larkfieldtea.example/#organization",
  "name": "Larkfield Tea",
  "url": "https://www.larkfieldtea.example/",
  "logo": "https://www.larkfieldtea.example/logo.png",
  "sameAs": [
    "https://www.linkedin.com/company/larkfield-tea-example",
    "https://www.instagram.com/larkfieldtea.example"
  ]
}`,
          },
          pitfall:
            "Writing the name differently in different places (Larkfield Tea, Larkfield Tea Co., LarkfieldTea). Pick the official form and use it in the markup, the page copy and your profiles.",
          sources: [GOOGLE_ORGANIZATION],
        },
        {
          id: "c-website",
          quiz: {
            kind: "blank",
            id: "cq-website",
            prompt: "Fill in the type and the property that give Google a site name and a fallback.",
            text: `{
  "@context": "https://schema.org",
  "@type": "___",
  "name": "Larkfield Tea",
  "___": ["Larkfield"],
  "url": "https://www.larkfieldtea.example/"
}`,
            mono: true,
            answers: ["WebSite", "alternateName"],
            distractors: ["WebPage", "legalName", "sameAs"],
            explanation:
              "WebSite structured data on the home page states your site name preference, and alternateName gives Google other options if the preferred name isn't selected.",
          },
          term: "WebSite markup and site names",
          summary: "WebSite markup on your home page tells Google the site name you want shown next to your results, plus alternatives.",
          explanation:
            "Every Google result shows the name of the site it comes from. Google says \"Google's generation of site names on the Google Search results page is completely automated\", and that it weighs content on your home page and references to it across the web.\n\nYou can state a preference: \"To indicate your site name preference, add WebSite structured data to your home page.\" Google also reads `og:site_name`, the title and headings, but adds: \"WebSite structured data is most important, if you want to specify a preference.\"\n\nThe rules are short:\n\n- Use \"a concise, commonly-recognized name for your site\" (Google's example is Google rather than Google, Inc).\n- Add `alternateName` for an acronym or short form, in order of preference.\n- One name per domain or subdomain: \"Google Search does not support site names at the subdirectory level.\"\n- Keep it consistent: Google's Organization docs say \"Use the same name and alternateName that you're using for your site name.\"\n\nTesting is different here: \"Site names aren't supported in the Rich Results Test.\" Use the URL Inspection tool instead.",
          whyItMatters:
            "The site name is your brand's label on every result. A plugin default such as \"Home\" or a long legal name is an easy fix that shows on every query you appear for.",
          example: {
            kind: "code",
            language: "json",
            caption: "A WebSite node for a made-up shop, pointing to its Organization by @id",
            code: `{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://www.larkfieldtea.example/#website",
  "name": "Larkfield Tea",
  "alternateName": ["Larkfield"],
  "url": "https://www.larkfieldtea.example/",
  "publisher": { "@id": "https://www.larkfieldtea.example/#organization" }
}`,
          },
          pitfall:
            "Letting a theme and an SEO plugin each output their own WebSite block with different names. Google asks you to nest the site name properties in your existing WebSite node and to \"avoid creating an additional WebSite structured data block on your home page if you can help it.\"",
          sources: [GOOGLE_SITE_NAMES, GOOGLE_ORGANIZATION],
        },
        {
          id: "c-article",
          quiz: {
            kind: "choice",
            id: "cq-article",
            prompt: "You changed the site's template but none of a post's text. Should the post's dateModified change?",
            options: [
              "Yes, every time the page is republished",
              "No: dateModified is when the article was most recently modified, and the markup must match the page",
              "Yes, monthly, to look fresh",
              "Only if the post is older than a year",
            ],
            answer: 1,
            explanation:
              "Google describes dateModified as the date and time the article was most recently modified. Bumping it when nothing in the article changed misstates the page.",
          },
          term: "Article markup",
          summary: "Article markup states a post's headline, author and dates, so they don't have to be inferred from the layout.",
          explanation:
            "Google says Article markup can help it \"show better title text, images, and date information\" for the article. It isn't a gate: \"there's no markup requirement to be eligible for Google News features like Top stories\", but it lets you state explicitly what the content is and who wrote it. As with Organization, \"There are no required properties\". The useful ones:\n\n- `@type`: `Article`, `NewsArticle` or `BlogPosting`, whichever fits.\n- `headline`: the title.\n- `datePublished` and `dateModified`: \"in ISO 8601 format\", with a timezone.\n- `image`: images relevant to the article, which Google must be able to crawl and index.\n- `author`: a Person or an Organization. A brand blog without named writers can use the Organization.\n- `publisher`: the organization, ideally by its `@id`.\n\nFor authors, Google recommends a URL that identifies them and adds: \"Google can understand both sameAs and url when disambiguating authors.\"",
          whyItMatters:
            "Dates and authorship are facts readers check before they trust a page. Lesson 3 covered showing them on the page; Article markup states the same facts for machines, and Google says it helps it show better date information.",
          pitfall:
            "Updating dateModified on a schedule when nothing changed. The markup must match the page, and Google's own description is \"The date and time the article was most recently modified\", not the date you last republished it.",
          sources: [GOOGLE_ARTICLE],
        },
        {
          id: "c-author-profile",
          quiz: {
            kind: "spot",
            id: "cq-author-profile",
            prompt: "Which line breaks Google's author markup best practices?",
            language: "json",
            lines: [
              "\"@type\": \"Person\",",
              "\"name\": \"Posted by Maya Okafor, Head Blender\",",
              "\"jobTitle\": \"Head Blender\",",
              "\"url\": \"https://www.larkfieldtea.example/team/maya-okafor\"",
            ],
            answer: 1,
            explanation:
              "Google says to put only the author's name in author.name. The job title belongs in jobTitle, and introductory words like \"posted by\" don't belong at all.",
          },
          term: "Authors, Person and ProfilePage",
          summary: "Mark up every named author as a Person with a URL, and mark up their bio page as a ProfilePage about that person.",
          explanation:
            "Google publishes best practices for author markup. The main ones:\n\n- \"Make sure that all the authors that are presented as authors on the web page are also included in markup.\"\n- List each author in their own `author` entry, never several names in one.\n- \"We strongly recommend using the type and url (or sameAs) properties.\" Use `Person` for people and `Organization` for organizations.\n- \"In the author.name property, only specify the name of the author.\" Job titles go in `jobTitle`.\n\nThe author's URL is often a bio page on your own site. Google says: \"If the URL is an internal profile page, we recommend marking up that author using profile page structured data.\" A profile page is \"a page that primarily focuses on information about a single person or organization that is somehow affiliated with the overall website\". Google lists \"An employee page on a company website\" as a valid use, and \"The main home page of a store\" as invalid. ProfilePage has one required property, `mainEntity`: the Person or Organization the page is about.",
          whyItMatters:
            "One Person, described on one bio page and referenced from every article, gives that author a single, consistent identity in your markup instead of a loose byline string on each post. It also makes it easy to show readers who wrote what.",
          example: {
            kind: "code",
            language: "json",
            caption: "A made-up author: the article's author entry (top) and her bio page's markup (bottom), joined by one @id",
            code: `"author": {
  "@type": "Person",
  "@id": "https://www.larkfieldtea.example/team/maya-okafor#person",
  "name": "Maya Okafor",
  "jobTitle": "Head Blender",
  "url": "https://www.larkfieldtea.example/team/maya-okafor"
}

{
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  "mainEntity": {
    "@type": "Person",
    "@id": "https://www.larkfieldtea.example/team/maya-okafor#person",
    "name": "Maya Okafor",
    "jobTitle": "Head Blender"
  }
}`,
          },
          pitfall:
            "Marking up your home page or a team listing as a ProfilePage. Google's valid uses are pages focused on a single person or organization, and it names a store's main home page as an invalid case.",
          sources: [GOOGLE_ARTICLE, GOOGLE_PROFILE_PAGE, GOOGLE_GALLERY],
        },
        {
          id: "c-product",
          quiz: {
            kind: "choice",
            id: "cq-product",
            prompt: "Besides a name, what does a product snippet need?",
            options: [
              "A GTIN and a brand",
              "At least one of review, aggregateRating or offers",
              "An FAQ section",
              "A video",
            ],
            answer: 1,
            explanation:
              "Google says product snippets require either review or aggregateRating or offers, alongside the product's name.",
          },
          term: "Product markup and reviews",
          summary: "Product markup describes a product's price, availability and ratings; review markup has strict rules against self-serving and fake reviews.",
          explanation:
            "For a product snippet (a result with ratings, price and availability), Google requires a `name` and says: \"Product snippets require either review or aggregateRating or offers\". If people can buy on the page, Google's docs ask: \"Can customers purchase products from you? Consider adding merchant listing markup.\" Merchant listings have stricter rules, which Lesson 9 covers in depth.\n\nReviews come with rules. Google says: \"Don't include fake or undisclosed incentivized reviews on your page or in your structured data markup.\" And for brands reviewing themselves: \"If the entity that's being reviewed controls the reviews about itself, their pages that use LocalBusiness or any other type of Organization structured data are ineligible for star review feature.\" That covers reviews shown through an embedded widget too.\n\nIn November 2025 Google also clarified that \"site owners should avoid using multiple ways of indicating what's being reviewed\".",
          whyItMatters:
            "Price, availability and ratings are facts you want stated precisely, not inferred from a page layout. Review markup is also where a well-meant shortcut, such as marking up your own testimonials, can break Google's rules.",
          example: {
            kind: "before-after",
            before:
              "The home page shows six customer testimonials, and the Organization markup carries an AggregateRating of 4.9 built from them.",
            after:
              "The rating is removed from the Organization. Product pages that show genuine customer reviews of each tea carry Review and AggregateRating markup nested in the Product.",
            note: "Larkfield Tea and its ratings are made up. Reviews of a product on its product page aren't the self-serving case; an organization rating itself is.",
          },
          pitfall:
            "Marking up your own testimonials as a star rating for your company. Under Google's rule, an organization's reviews of itself on its own pages aren't eligible for star review features.",
          sources: [GOOGLE_PRODUCT_SNIPPET, GOOGLE_REVIEW_SNIPPET, GOOGLE_UPDATES],
        },
      ],
      check: [
        {
          kind: "match",
          id: "q-types-match",
          prompt: "Match each property to what it says.",
          pairs: [
            { term: "url (Organization)", definition: "Your organization's website, which helps Google identify you uniquely" },
            { term: "logo", definition: "The image you want shown as your logo" },
            { term: "dateModified", definition: "When the article was most recently changed" },
            { term: "offers", definition: "A product's price and availability" },
          ],
          explanation:
            "These descriptions follow Google's property tables for Organization, Article and Product snippets.",
        },
        {
          kind: "choice",
          id: "q-types-reviews",
          prompt:
            "A software company shows testimonials from its customers on its home page and wants to mark them up as an AggregateRating on its Organization. What does Google's review snippet guidance say?",
          options: [
            "Fine, as long as the testimonials are genuine",
            "Fine, as long as there are at least ten of them",
            "The page is ineligible for star review features, because the company controls reviews about itself",
            "Fine, if the reviews come from an embedded third-party widget",
          ],
          answer: 2,
          explanation:
            "Google's self-serving review rule makes Organization and LocalBusiness pages ineligible for star review features when the entity controls the reviews about itself, and it names embedded third-party widgets as included.",
        },
        {
          kind: "choice",
          id: "q-types-site-name",
          prompt:
            "Google shows \"larkfieldtea.example\" as the site name instead of \"Larkfield Tea\". The home page has two WebSite blocks with different names, one from the theme and one from a plugin. What do you do first?",
          options: [
            "Add a third WebSite block with the right name",
            "Keep one WebSite node with the preferred name and an alternateName, and check the home page with URL Inspection",
            "Test the site name in the Rich Results Test",
            "Add WebSite markup to every page of the site",
          ],
          answer: 1,
          explanation:
            "Google asks for one WebSite node on the home page, says site names aren't supported in the Rich Results Test (use URL Inspection), and says the markup is needed only on the home page.",
        },
      ],
    },
    {
      id: "g-markup-today",
      title: "What markup does today",
      concepts: [
        {
          id: "c-faq-howto",
          quiz: {
            kind: "choice",
            id: "cq-faq-howto",
            prompt: "FAQ rich results are gone. What should a site do with its existing FAQ content?",
            options: [
              "Delete it, since it no longer earns anything",
              "Keep questions with direct answers on the page for readers; drop the promise of a bigger Google result",
              "Convert it to HowTo markup instead",
              "Hide it and keep only the FAQPage markup",
            ],
            answer: 1,
            explanation:
              "The card's pitfall: questions with direct answers are still useful to readers and engines. It's the promise of a bigger Google result that ended.",
          },
          term: "FAQ and How-to rich results",
          summary: "Google no longer shows How-to rich results (since 2023) or FAQ rich results (since May 2026), whatever markup a page has.",
          explanation:
            "For years, FAQPage and HowTo markup were standard advice because they made a result bigger. That advice is out of date.\n\nIn August 2023 Google said FAQ rich results \"will only be shown for well-known, authoritative government and health websites.\" A month later it extended the How-to change: \"As of September 13, Google Search no longer shows How-to rich results on desktop, which means this result type is now deprecated.\"\n\nIn May 2026 the FAQ result went too. Google's documentation changelog says: \"This feature will no longer appear in Google Search starting May 7, 2026.\" In June it removed the FAQ documentation because \"The FAQ rich result feature is no longer shown in Google Search results\". Neither feature appears in Google's current gallery of supported structured data.",
          whyItMatters:
            "Audits, plugins and agency checklists still recommend FAQ schema for extra space on the results page. You need to be able to say plainly that Google no longer shows that result, so a client's budget goes somewhere it can work.",
          example: {
            kind: "before-after",
            before: "Audit recommendation: \"Add FAQPage schema to all 40 service pages to win expanded FAQ results.\"",
            after:
              "Audit recommendation: \"Google stopped showing FAQ rich results on May 7, 2026. Keep the question-and-answer sections that help readers; spend the markup budget on Organization, Article and Product markup, which Google still supports.\"",
            note: "A made-up audit line, rewritten to match Google's changelog and its current structured data gallery.",
          },
          pitfall:
            "Deleting good FAQ content along with the idea of the rich result. Questions with direct answers on the page are still useful to readers and to engines (Lesson 3). It's the promise of a bigger Google result that ended.",
          sources: [GOOGLE_HOWTO_FAQ_2023, GOOGLE_UPDATES, GOOGLE_GALLERY],
        },
        {
          id: "c-supported-now",
          quiz: {
            kind: "choice",
            id: "cq-supported-now",
            prompt: "Since January 2025, where does Google show breadcrumbs in results?",
            options: [
              "On mobile only",
              "On desktop only; mobile shows just the domain",
              "Nowhere: BreadcrumbList is deprecated",
              "Only in AI Overviews",
            ],
            answer: 1,
            explanation:
              "Google stopped showing breadcrumbs on mobile in January 2025 and keeps them on desktop, so breadcrumb markup is still supported.",
          },
          term: "What Google still supports",
          summary: "Google's structured data gallery is the current list of features markup can earn; several types were retired in 2025 and 2026.",
          explanation:
            "Google keeps one list of the rich results structured data can earn: its gallery. As of November 2026 it lists features such as Article, Breadcrumb, Event, Image metadata, Local business, Organization, Product, Profile page, Q&A, Recipe, Review snippet, Software app and Video. FAQ and How-to are gone.\n\nThe list keeps shrinking. In June 2025 Google retired seven features (book actions, course info, claim review, estimated salary, learning video, special announcement and vehicle listing) because \"these specific displays are no longer providing significant additional value for users.\" It later kept book actions, \"as there's still a feature using the markup\", and it dropped practice problems in January 2026. Google added: \"This update won't affect how pages are ranked.\"\n\nDisplays change within a feature too. In January 2025 Google stopped showing breadcrumbs on mobile; the breadcrumb feature \"is available on desktop in all regions and languages where Google Search is available.\" Google's advice for the trail itself: \"we recommend providing breadcrumbs that represent a typical user path to a page, instead of mirroring the URL structure.\"",
          whyItMatters:
            "Plugins and old checklists recommend markup for features that no longer exist. Checking the gallery and the documentation changelog before you scope markup work keeps a client's budget on features Google still shows.",
          example: {
            kind: "code",
            language: "json",
            caption: "BreadcrumbList for a made-up product page: Teas › Oolong › Tieguanyin",
            code: `{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Teas",
      "item": "https://www.larkfieldtea.example/teas" },
    { "@type": "ListItem", "position": 2, "name": "Oolong",
      "item": "https://www.larkfieldtea.example/teas/oolong" },
    { "@type": "ListItem", "position": 3, "name": "Tieguanyin" }
  ]
}`,
          },
          pitfall:
            "Treating a retired feature as a markup error to fix. Google says the use of the retired types \"outside of Google Search (and dependent features) is not affected\", so existing markup can stay; it just won't earn that display in Google.",
          sources: [GOOGLE_GALLERY, GOOGLE_SIMPLIFYING_2025, GOOGLE_UPDATES, GOOGLE_BREADCRUMB_MOBILE, GOOGLE_BREADCRUMB],
        },
        {
          id: "c-manual-action",
          quiz: {
            kind: "order",
            id: "cq-manual-action",
            prompt: "Put the response to a structured data manual action in order.",
            items: [
              "Open the Manual Actions report in Search Console",
              "Fix the markup that breaks the guidelines",
              "Submit the site for reconsideration",
            ],
            explanation:
              "Google says to check the Manual Actions report, and that once you have remedied the problem you can submit your site for reconsideration.",
          },
          term: "Spammy markup and manual actions",
          summary: "Markup that misleads can cost a page its rich results through a manual action; Google's quality guidelines can't be checked by any testing tool.",
          explanation:
            "Google splits its rules into technical guidelines, which the Rich Results Test catches, and quality guidelines, which \"are not easily testable using an automated tool.\" Breaking a quality guideline \"can prevent syntactically correct structured data from being displayed as a rich result in Google Search, or possibly cause it to be marked as spam.\"\n\nThe ones that catch marketers out:\n\n- \"Don't mark up irrelevant or misleading content, such as fake reviews or content unrelated to the focus of a page.\"\n- \"Don't impersonate any person or organization, or misrepresent your ownership, affiliation, or primary purpose.\"\n- Ratings must be real: \"reviews or ratings not by actual users may result in manual action.\"\n\nThe penalty is specific: \"A structured data manual action means that a page loses eligibility for appearance as a rich result; it doesn't affect how the page ranks in Google web search.\" Check the Manual Actions report in Search Console. Google's Organization docs add: \"Once you have remedied the problem, you can submit your site for reconsideration.\"",
          whyItMatters:
            "This is the honest risk statement for a client: misleading markup won't usually sink rankings, but it can switch off rich results for the pages involved, and no testing tool will warn you first.",
          example: {
            kind: "before-after",
            before:
              "To get prices shown in results, a blog post comparing green teas is marked up as a Product with an Offer, though nothing on the page can be bought.",
            after:
              "The post is marked up as an Article, the honest description of the page. Product markup stays on the product pages where the teas are sold.",
            note: "A made-up example. Google's guidelines require structured data to be a true representation of the page content.",
          },
          pitfall:
            "Assuming a page is compliant because the Rich Results Test shows no errors. The test checks syntax and required properties; whether the markup is honest is a quality guideline it can't check.",
          sources: [GOOGLE_SD_GUIDELINES, GOOGLE_ORGANIZATION],
        },
        {
          id: "c-markup-and-ai",
          quiz: {
            kind: "passage",
            id: "cq-markup-and-ai",
            prompt: "Which statement matches Google's AI optimization guide?",
            passages: [
              "Structured data isn't required for Google's generative AI features and there's no special markup for them, but it still helps with rich result eligibility.",
              "Pages need special AI schema markup before Google's generative AI features can use them.",
            ],
            answer: 0,
            explanation:
              "The guide says structured data isn't required for generative AI search, there's no special schema.org markup to add, and it's still a good idea for rich result eligibility.",
          },
          term: "Structured data and AI answers",
          summary: "Google says no special markup is needed for its AI features; Bing says schema helps AI systems understand content. Neither promises citations.",
          explanation:
            "Google's guide to its generative AI features addresses this directly: \"Structured data isn't required for generative AI search, and there's no special schema.org markup you need to add.\" It still recommends markup: \"it's a good idea to continue using it as part of your overall SEO strategy, as it helps with being eligible for rich results on Google Search.\"\n\nThe same guide says \"You don't need to create new machine readable files, AI text files, markup, or Markdown to appear in Google Search\". Where Google does point shops and local businesses is feeds and profiles: \"Using products like Merchant Center (such as Merchant Center feeds) and Google Business Profiles can help your products and services to be visible in both AI responses and other Google Search results.\"\n\nMicrosoft Bing puts more weight on markup: \"Schema can label your content as a product, review, FAQ, or event, turning plain text into structured data that machines can interpret with confidence.\"",
          whyItMatters:
            "This is the honest position to give a client: markup states facts unambiguously, earns rich results where Google still offers them, and Bing says it helps AI systems understand content. No vendor documents it as a switch for being cited.",
          pitfall:
            "Buying \"AI schema\" or special markup sold as a way into AI answers. Google says no special markup is needed for its AI features, and no vendor documents a markup type that earns citations.",
          sources: [GOOGLE_AI_GUIDE, BING_AI_ANSWERS],
        },
      ],
      check: [
        {
          kind: "passage",
          id: "q-today-report",
          prompt: "Which sentence would you put in a client report?",
          passages: [
            "Adding FAQPage schema to every service page will win expanded FAQ results in Google and get the pages cited in AI Overviews.",
            "Google stopped showing FAQ rich results in May 2026, and says no special markup is needed for its AI features. We'll keep accurate Organization, Article and Product markup, which still supports rich results.",
          ],
          answer: 1,
          explanation:
            "The first sentence promises a result Google no longer shows and a citation no vendor documents. The second states what Google's changelog and AI guide say and recommends the markup that still has a job.",
        },
        {
          kind: "choice",
          id: "q-today-howto",
          prompt: "A plugin's audit flags \"Missing HowTo schema\" on a step-by-step guide. What is the best response?",
          options: [
            "Add HowTo markup to get the How-to rich result",
            "Treat it as low priority: Google deprecated How-to rich results in 2023",
            "Add HowTo markup and FAQPage markup together, so one of them shows",
            "Remove the steps from the page so the warning goes away",
          ],
          answer: 1,
          explanation:
            "Google deprecated How-to rich results in September 2023 and stopped showing FAQ rich results in May 2026. The numbered steps on the page are still useful to readers; the warning is out of date.",
        },
        {
          kind: "choice",
          id: "q-today-manual",
          prompt: "A site receives a structured data manual action. What does Google say happens?",
          options: [
            "The whole site is removed from Google Search",
            "The affected pages lose eligibility for rich results, but their ranking in web search isn't affected",
            "The pages drop in ranking until the markup is removed",
            "Nothing, unless the Rich Results Test also shows errors",
          ],
          answer: 1,
          explanation:
            "Google says a structured data manual action means a page loses eligibility for appearance as a rich result; it doesn't affect how the page ranks in Google web search.",
        },
      ],
    },
    {
      id: "g-entities",
      title: "Entities",
      concepts: [
        {
          id: "c-entity",
          quiz: {
            kind: "choice",
            id: "cq-entity",
            prompt: "How does Google say knowledge panels are created?",
            options: [
              "Automatically, when there is enough information available on the open web",
              "By submitting Organization markup",
              "By paying for a verified listing",
              "By creating a Wikidata item, which always produces one",
            ],
            answer: 0,
            explanation:
              "Google's help page says knowledge panels are created automatically by its algorithm when there is enough information available on the open web.",
          },
          term: "Entity",
          summary: "An entity is a distinct real-world thing, such as a company, person or product, that a search engine keeps track of as one thing.",
          explanation:
            "In 2012 Google introduced the Knowledge Graph, a model \"that understands real-world entities and their relationships to one another: things, not strings.\" Its example was the query [taj mahal]: \"Language can be ambiguous—do you mean Taj Mahal the monument, or Taj Mahal the musician?\"\n\nToday Google describes the Knowledge Graph as \"our database of billions of facts about people, places, and things.\" Its facts \"come from a variety of sources that compile factual information\", plus licensed data and information \"directly from content owners in various ways\". The visible result is the knowledge panel, and Google says \"Knowledge panels are created automatically by Google Search algorithm when there is enough information available on the open web.\" Claiming a panel and suggesting edits is covered in Lesson 12.\n\nYour brand is an entity in this sense too, and it is recognized from what your site and other sites say about it.",
          whyItMatters:
            "Search engines keep track of things, not just words, and ambiguity is the problem the Knowledge Graph was built to solve. Consistent names, descriptions and details give engines one clear entity to recognize as your brand, instead of leaving them to work out which of several similar names you are.",
          pitfall:
            "Sharing a name with another company and assuming search engines will work it out. Use the same full name, logo, address and description everywhere, so the signals point at one entity.",
          sources: [GOOGLE_KNOWLEDGE_GRAPH, GOOGLE_KNOWLEDGE_GRAPH_HELP],
        },
        {
          id: "c-same-as",
          quiz: {
            kind: "choice",
            id: "cq-same-as",
            prompt: "Which page fits schema.org's definition of a sameAs URL for a company?",
            options: [
              "Its Wikidata entry",
              "A news story that mentions it",
              "A directory category page listing it among others",
              "A competitor's comparison page",
            ],
            answer: 0,
            explanation:
              "sameAs is for a reference page that unambiguously indicates the item's identity, and schema.org names a Wikidata entry as an example. The others mention the company among other things.",
          },
          term: "sameAs",
          summary: "sameAs lists pages on other sites that are about the same entity, such as its Wikipedia, Wikidata and official social profiles.",
          explanation:
            "Schema.org defines `sameAs` as the \"URL of a reference Web page that unambiguously indicates the item's identity. E.g. the URL of the item's Wikipedia page, Wikidata entry, or official website.\"\n\nGoogle's Organization docs describe it as \"The URL of a page on another website with additional information about your organization\", such as a profile on \"a social media or review site\", and note \"You can provide multiple sameAs URLs.\" Google also says it \"can make general use of the sameAs property\" beyond its documented features, and its author guidance accepts `sameAs` alongside `url` for people.\n\nOnly list pages you'd stand behind as yours: your verified social profiles, your Wikidata item and your Wikipedia article if one exists. Whether a brand should have a Wikipedia article or Wikidata item at all is covered in Lesson 5.",
          whyItMatters:
            "sameAs links the entity on your site to the same entity elsewhere. It is a direct way to tell machines that your LinkedIn page, your Wikidata item and your website are all one organization.",
          pitfall:
            "Listing pages that mention you instead of pages that are about you, such as a news story or a directory's category page. The definition says \"unambiguously indicates the item's identity\": each URL should be a profile of you and nobody else.",
          sources: [SCHEMA_SAME_AS, GOOGLE_ORGANIZATION, GOOGLE_SD_INTRO],
        },
        {
          id: "c-id",
          quiz: {
            kind: "blank",
            id: "cq-id",
            prompt: "Fill in the keyword that lets the video say it is about the recipe described elsewhere on the page.",
            text: `"about": { "___": "https://www.larkfieldtea.example/iced-oolong#recipe" }`,
            mono: true,
            answers: ["@id"],
            distractors: ["@type", "url", "sameAs"],
            explanation:
              "Google's guidelines say to use @id in both items to specify that the video is about the recipe; without the link, Google may not know it can show the video as part of the recipe result.",
          },
          term: "@id and the graph",
          summary: "@id gives a thing in your markup a fixed identifier, so other blocks and pages can point to it instead of describing it again.",
          explanation:
            "JSON-LD's `@id` keyword is used \"to uniquely identify node objects that are being described in the document with IRIs or blank node identifiers\". In practice you give your organization a URL-style identifier, such as `https://www.larkfieldtea.example/#organization`, and use it everywhere.\n\nThen an article's `publisher`, or a `WebSite` node, can reference the organization by that `@id`, and every page describes the same organization instead of a slightly different copy. Several nodes can sit together in one block under `@graph`.\n\nGoogle uses the same idea within a page. When a page has several items, \"use @id in both the recipe and the video items to specify that the video is about the recipe on the page.\" It warns: \"If you didn't link the items together, Google Search may not know that it can show the video as a recipe rich result.\"",
          whyItMatters:
            "This is entity consistency written in markup. One identifier, used site-wide, means the brand behind your home page, your blog and your products is stated to be a single thing.",
          example: {
            kind: "code",
            language: "json",
            caption: "A WebSite node pointing to the organization by its @id (made-up shop)",
            code: `{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://www.larkfieldtea.example/#organization",
      "name": "Larkfield Tea"
    },
    {
      "@type": "WebSite",
      "url": "https://www.larkfieldtea.example/",
      "publisher": { "@id": "https://www.larkfieldtea.example/#organization" }
    }
  ]
}`,
          },
          pitfall:
            "Generating a different @id for the organization on each page, for example from the page URL. The identifier only helps if it is the same everywhere.",
          sources: [W3C_JSON_LD, GOOGLE_SD_GUIDELINES],
        },
        {
          id: "c-org-identifiers",
          quiz: {
            kind: "match",
            id: "cq-org-identifiers",
            prompt: "Match each Organization property to what it holds.",
            pairs: [
              { term: "legalName", definition: "The registered, legal name, if different from name" },
              { term: "alternateName", definition: "Another common name the organization goes by" },
              { term: "vatID", definition: "The value added tax code for the business" },
              { term: "iso6523Code", definition: "An ID such as a DUNS number or LEI, with its scheme code" },
            ],
            explanation:
              "These follow Google's Organization property table: legalName, alternateName, vatID and iso6523Code, whose first part names the identification scheme.",
          },
          term: "Identifiers that disambiguate",
          summary: "Legal names, registered identifiers and a real address help Google tell your organization apart from others with similar names.",
          explanation:
            "A name alone is ambiguous: there may be several companies called Larkfield. Google says \"Some properties are used behind the scenes to disambiguate your organization from other organizations (like iso6523 and naics)\". The useful ones:\n\n- `legalName`: \"The registered, legal name of your organization, if applicable and different from the name property.\"\n- `alternateName`: another common name you go by.\n- `iso6523Code`: a registered identifier with a prefix for the scheme. Google lists common ones such as \"0060: Dun & Bradstreet Data Universal Numbering System (DUNS)\" and \"0199: Legal Entity Identifier (LEI)\".\n- `vatID` and `taxID`: Google calls a VAT code \"an important trust signal for users\", and says \"Make sure taxID matches the country that you provided in the address field.\"\n\nGoogle's overall advice is to focus on what helps users: a business name, \"an indication of real-world presence (for example, address or telephone) and online presence (for example, url or logo).\"",
          whyItMatters:
            "These are the facts that separate you from a namesake: a registered name, a registry number, an address. They give a machine, and a customer, something to check besides a name: Google notes that users can look up a VAT code in public registries.",
          example: {
            kind: "code",
            language: "json",
            caption: "Identifiers added to a made-up shop's Organization node (all values invented)",
            code: `{
  "@context": "https://schema.org",
  "@type": "OnlineStore",
  "@id": "https://www.larkfieldtea.example/#organization",
  "name": "Larkfield Tea",
  "legalName": "Larkfield Tea Ltd",
  "vatID": "GB000000000",
  "telephone": "+44 113 496 0000",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Leeds",
    "addressCountry": "GB"
  }
}`,
          },
          pitfall:
            "Copying an identifier from a lookup site without checking it is yours. A wrong registry number ties your markup to a different company, the opposite of disambiguation. Use the numbers on your own registration documents, and show them on the page too.",
          sources: [GOOGLE_ORGANIZATION],
        },
      ],
      check: [
        {
          kind: "choice",
          id: "q-entities-sameas",
          prompt: "Which URL belongs in Larkfield Tea's sameAs list?",
          options: [
            "A newspaper article that mentions Larkfield Tea in a roundup",
            "Larkfield Tea's own company page on LinkedIn",
            "A directory's \"Tea shops in Leeds\" category page",
            "A competitor's comparison page that includes Larkfield Tea",
          ],
          answer: 1,
          explanation:
            "sameAs is for pages that unambiguously indicate the entity's identity: its own profiles, its Wikipedia or Wikidata entry. Articles, category pages and comparisons mention it among other things.",
        },
        {
          kind: "spot",
          id: "q-entities-id",
          prompt: "This markup appears on a blog post. Which line breaks the link to the organization described on the home page?",
          language: "json",
          lines: [
            "\"@type\": \"BlogPosting\",",
            "\"headline\": \"Our 2026 harvest notes\",",
            "\"datePublished\": \"2026-09-14T08:00:00+01:00\",",
            "\"publisher\": { \"@id\": \"https://www.larkfieldtea.example/blog/harvest-notes#org\" }",
          ],
          answer: 3,
          explanation:
            "The home page identifies the organization as https://www.larkfieldtea.example/#organization. This publisher points to a different identifier built from the post's URL, so it reads as a different organization. Reuse the one @id everywhere.",
        },
        {
          kind: "match",
          id: "q-entities-match",
          prompt: "Match each term to its meaning.",
          pairs: [
            { term: "Entity", definition: "A distinct real-world thing tracked as one thing" },
            { term: "sameAs", definition: "Pages elsewhere that are about the same thing" },
            { term: "@id", definition: "A fixed identifier other markup can point to" },
            { term: "Knowledge Graph", definition: "Google's model of things and their relationships" },
          ],
          explanation: "Things, not strings: entities, the links between their copies (sameAs, @id), and the graph that holds them.",
        },
      ],
    },
  ],

  exercise: {
    id: "x-assemble-json-ld",
    title: "Assemble the JSON-LD block",
    brief:
      "Larkfield Tea (made up) has asked you to write the Organization markup for its home page. The home page footer shows the name Larkfield Tea, the phone number +44 113 496 0000 and \"Blending since 2014\". The shop has a LinkedIn company page, an Instagram account and a Wikidata item. Build the block one decision at a time.",
    steps: [
      {
        kind: "blank",
        id: "x-step-start",
        prompt: "Start the block: fill in the vocabulary, the type and the fixed identifier.",
        text: `{
  "@context": "___",
  "@type": "___",
  "@id": "https://www.larkfieldtea.example/___",
  "name": "Larkfield Tea"
}`,
        mono: true,
        answers: ["https://schema.org", "Organization", "#organization"],
        distractors: ["https://json-ld.org", "WebPage", "Product"],
        explanation:
          "schema.org is the vocabulary and Organization the type (OnlineStore, a more specific subtype, would also fit a shop). The #organization fragment gives the brand an identifier on the home page URL that other markup can reuse. WebPage would describe the page, not the shop.",
      },
      {
        kind: "choice",
        id: "x-step-sameas",
        prompt: "Which sameAs list should the block carry?",
        options: [
          "The LinkedIn page, the Instagram account and the Wikidata item",
          "The LinkedIn page, the Instagram account, the Wikidata item and a newspaper review of the shop",
          "Every page on the web that mentions Larkfield Tea",
          "None: sameAs is only for people",
        ],
        answer: 0,
        explanation:
          "sameAs takes pages that unambiguously identify the shop: its own profiles and its Wikidata item. A review is about the shop but isn't a profile of it. sameAs is defined on Thing, so it applies to organizations as well as people.",
      },
      {
        kind: "spot",
        id: "x-step-mismatch",
        prompt: "A colleague added more properties. Which line contradicts what the home page shows?",
        language: "json",
        lines: [
          "\"url\": \"https://www.larkfieldtea.example/\",",
          "\"logo\": \"https://www.larkfieldtea.example/logo.png\",",
          "\"telephone\": \"+44 113 496 0000\",",
          "\"foundingDate\": \"2009\",",
        ],
        answer: 3,
        explanation:
          "The footer says \"Blending since 2014\". Markup must describe what the page shows, so either the founding date is 2014 or the page is wrong; fix whichever is incorrect so they agree.",
      },
      {
        kind: "choice",
        id: "x-step-publisher",
        prompt: "The blog's Article markup needs a publisher. Which value is best?",
        options: [
          "\"publisher\": \"Larkfield Tea\"",
          "\"publisher\": { \"@id\": \"https://www.larkfieldtea.example/#organization\" }",
          "A full copy of the Organization block on every post, with its own @id per post",
          "Leave publisher out: it's covered by the home page",
        ],
        answer: 1,
        explanation:
          "Pointing to the home page's @id says every article is published by that one organization. Plain text is weaker, and a copy with its own @id per post describes many organizations instead of one.",
      },
      {
        kind: "order",
        id: "x-step-release",
        prompt: "Put the release steps in order.",
        items: [
          "Write the markup from the same data the page shows",
          "Check it with the Rich Results Test and fix any critical errors",
          "Publish it on a few pages and check them with the URL Inspection tool",
          "Watch the rich result status reports in Search Console",
        ],
        explanation:
          "Google's checklist: validate with the Rich Results Test, deploy a few pages and inspect them with URL Inspection, then monitor the status reports, because templates and serving issues can break markup that tested fine.",
      },
    ],
    debrief:
      "The finished block says one thing, the same way everywhere: here is Larkfield Tea, at this address, with these profiles, known by this identifier. Every fact in it is on the page, and every other block on the site, from the WebSite node to each article's publisher, can point to it. That is most of what structured data can do for a brand, and it is worth doing well.",
  },

  example: {
    title: "Mailchimp's Organization markup",
    context:
      "The JSON-LD on mailchimp.com's home page, fetched on 6 November 2026. The page has two blocks: an @graph with an Organization node and a WebSite node, and a separate Service block. The excerpt is shortened: it leaves out the logo, four of the seven sameAs links (marked with …), Intuit's url and tickerSymbol, the WebSite node's url and name, and the Service block's description and serviceType.",
    excerpt: {
      kind: "code",
      language: "json",
      caption: "Excerpt from the JSON-LD on https://mailchimp.com/, fetched 2026-11-06",
      code: `{ "@type": "Organization",
  "@id": "https://mailchimp.com/#organization",
  "name": "Mailchimp",
  "alternateName": "Intuit Mailchimp",
  "url": "https://mailchimp.com/",
  "sameAs": ["https://en.wikipedia.org/wiki/Mailchimp",
    "https://www.wikidata.org/wiki/Q6735673",
    "https://www.linkedin.com/company/mailchimp", …],
  "parentOrganization": { "@type": "Corporation",
    "@id": "https://www.intuit.com/#organization", "name": "Intuit" } },
{ "@type": "WebSite",
  "@id": "https://mailchimp.com/#website",
  "publisher": { "@id": "https://mailchimp.com/#organization" } }

{ "@type": "Service",
  "name": "Mailchimp Email and SMS Marketing Platform",
  "provider": { "@id": "https://mailchimp.com/#organization" } }`,
    },
    points: [
      {
        label: "Reference pages first",
        text: "The sameAs list opens with the Wikipedia article and the Wikidata item (Q6735673, labeled Mailchimp on Wikidata), then the official social profiles. Those are the kinds of pages schema.org names: ones that \"unambiguously indicates the item's identity\".",
      },
      {
        label: "One identifier, reused",
        text: "The organization's @id is https://mailchimp.com/#organization. The WebSite node names its publisher by that @id, and the separate Service block names its provider by it too, so neither describes Mailchimp a second time.",
      },
      {
        label: "Relationships, not just names",
        text: "parentOrganization links Mailchimp to Intuit, with Intuit's own @id. That is the Knowledge Graph idea in markup: entities and the relationships between them.",
      },
      {
        label: "Two names, one entity",
        text: "alternateName records \"Intuit Mailchimp\" next to the name \"Mailchimp\", so both forms of the brand point at the same organization.",
      },
    ],
    source: MAILCHIMP_HOME,
  },

  audit: [
    {
      kind: "choice",
      id: "a-define",
      prompt: "Which is the best one-sentence definition of structured data?",
      options: [
        "Code that labels what a page is about in a standard vocabulary, so machines read the facts the same way",
        "A ranking factor that moves pages up Google's results",
        "A file at the root of a site that lists pages for AI crawlers",
        "Hidden text written for search engines instead of readers",
      ],
      answer: 0,
      explanation:
        "Google calls structured data explicit clues about the meaning of a page in a standardized format. It doesn't describe it as a ranking factor, it lives in the page rather than in a root file, and markup for content readers can't see breaks Google's guidelines.",
    },
    {
      kind: "choice",
      id: "a-faq-2026",
      prompt: "A client asks whether adding FAQPage markup will get them FAQ rich results in Google. What is the accurate answer?",
      options: [
        "Yes, if every question is marked up",
        "Only for government and health sites",
        "No: Google stopped showing FAQ rich results in May 2026",
        "Yes, but only on mobile",
      ],
      answer: 2,
      explanation:
        "From August 2023 FAQ rich results were limited to well-known government and health sites. Google's changelog says the feature stopped appearing in Search on May 7, 2026, and the documentation was removed in June.",
    },
    {
      kind: "spot",
      id: "a-spot-visible",
      prompt: "This Product markup is on a page showing a 250 g tin for £24.00, in stock. Which line breaks Google's guidelines?",
      language: "json",
      lines: [
        "\"@type\": \"Product\",",
        "\"name\": \"Larkfield Breakfast Blend, 250 g tin\",",
        "\"offers\": { \"@type\": \"Offer\", \"price\": \"19.00\",",
        "\"priceCurrency\": \"GBP\", \"availability\": \"https://schema.org/InStock\" }",
      ],
      answer: 2,
      explanation:
        "The page shows £24.00 and the markup says 19.00. Markup must describe what readers see; generate both from the same product record so they can't drift apart.",
    },
    {
      kind: "blank",
      id: "a-blank-sameas",
      prompt: "Complete schema.org's definition of sameAs.",
      text: "URL of a reference Web page that ___ indicates the item's identity. E.g. the URL of the item's Wikipedia page, ___ entry, or official website.",
      answers: ["unambiguously", "Wikidata"],
      distractors: ["occasionally", "Reddit", "LinkedIn"],
      explanation:
        "Schema.org's wording is \"unambiguously indicates the item's identity\", and its examples are a Wikipedia page, a Wikidata entry or the official website.",
    },
    {
      kind: "match",
      id: "a-match-types",
      prompt: "Match each page to the markup type that describes it best.",
      pairs: [
        { term: "Home page of a brand", definition: "Organization" },
        { term: "A dated blog post", definition: "Article" },
        { term: "A tin of tea for sale", definition: "Product" },
        { term: "The site as a whole, with its site name", definition: "WebSite" },
        { term: "An employee's bio page", definition: "ProfilePage" },
      ],
      explanation:
        "Organization describes the brand, Article a dated piece of writing, Product something for sale, WebSite the site itself (and its site name), and ProfilePage a page focused on one person or organization affiliated with the site.",
    },
    {
      kind: "passage",
      id: "a-passage-ai",
      prompt: "Which statement about structured data and AI answers matches what Google and Bing say?",
      passages: [
        "Google says structured data isn't required for its generative AI features and there's no special markup to add; Bing says schema helps AI systems understand content. Neither says markup earns citations.",
        "Both Google and Bing require schema.org markup before a page can be cited in an AI answer, so pages without it are excluded.",
      ],
      answer: 0,
      explanation:
        "Google's AI guide says structured data isn't required and there's no special schema.org markup to add. Bing's guidance says schema helps search engines and AI systems understand content. Neither requires it for citation.",
    },
    {
      kind: "choice",
      id: "a-reviews",
      prompt: "Which review markup does Google say is eligible for star review features?",
      options: [
        "A restaurant marking up reviews of itself collected on its own site",
        "A shop marking up its own testimonials as an AggregateRating on its Organization",
        "A product page marking up genuine customer reviews of the product",
        "A company embedding a Google reviews widget and marking up its own rating",
      ],
      answer: 2,
      explanation:
        "Google's self-serving rule makes LocalBusiness and Organization pages ineligible when the entity controls the reviews about itself, including through embedded widgets. Genuine reviews of a product on a product page don't fall under that rule, though they must not be fake or undisclosed incentivized reviews.",
    },
    {
      kind: "order",
      id: "a-order-history",
      prompt: "Put these Google changes in the order they happened.",
      items: [
        "Google introduces the Knowledge Graph: things, not strings",
        "FAQ rich results are limited to well-known government and health sites",
        "How-to rich results are deprecated on desktop as well as mobile",
        "Breadcrumbs stop showing in mobile results",
        "FAQ rich results stop appearing in Google Search",
      ],
      explanation:
        "The Knowledge Graph arrived in May 2012. The FAQ limit came in August 2023 and the How-to deprecation in September 2023. Breadcrumbs left mobile results in January 2025, and FAQ rich results stopped appearing on May 7, 2026.",
    },
    {
      kind: "choice",
      id: "a-guarantee",
      prompt: "Your markup passes the Rich Results Test, but no rich result appears. What does Google say about this?",
      options: [
        "The test is wrong; resubmit the page",
        "Using structured data enables a feature but doesn't guarantee it will be shown",
        "Rich results only appear after 90 days",
        "The page must be marked up in Microdata as well",
      ],
      answer: 1,
      explanation:
        "Google's guidelines say markup enables a feature but doesn't guarantee it. Its systems choose what to show based on many factors, such as the person's location and device.",
    },
    {
      kind: "blank",
      id: "a-blank-publisher",
      prompt: "Fill in the keyword that makes this article's publisher the same organization as the home page's.",
      text: `"publisher": { "___": "https://www.larkfieldtea.example/#organization" }`,
      mono: true,
      answers: ["@id"],
      distractors: ["@type", "sameAs", "url"],
      explanation:
        "@id references the node already described on the home page. url would be the organization's website, not its identifier in the graph, and sameAs points to profiles on other sites.",
    },
    {
      kind: "choice",
      id: "a-validator",
      prompt: "You want to know whether your Product markup is eligible for Google's product rich results. Which tool answers that?",
      options: [
        "The Schema Markup Validator",
        "The Rich Results Test",
        "A JSON syntax linter",
        "The Knowledge Graph Search API",
      ],
      answer: 1,
      explanation:
        "The Rich Results Test checks markup against Google's rich result features. The Schema Markup Validator checks syntax and compliance with schema.org standards and no longer checks for Google Search rich result types.",
    },
  ],
};

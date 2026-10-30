// Lesson 4, The Schema Works: structured data and entities.
// Every claim about Google, Bing, schema.org or JSON-LD is tied to a source
// checked on the `accessed` date. Google retired the How-to rich result in 2023
// and the FAQ rich result on 7 May 2026; the lesson teaches FAQPage and HowTo as
// they stand now. Larkfield Tea is a made-up shop on a reserved .example domain,
// and its details (founding year, phone number, profiles) are invented for the
// exercises.

import type { LessonContent, Source } from "../lesson-types";

const ACCESSED = "2026-10-30";

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

const GOOGLE_ORGANIZATION: Source = {
  title: "Organization (Organization) structured data",
  publisher: "Google Search Central",
  url: "https://developers.google.com/search/docs/appearance/structured-data/organization",
  date: "2026-09-08",
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
    "You have reached The Schema Works, the fourth district of the City of Answers. In The Answer Quarter you wrote passages that people and engines can lift. Here you describe those pages, and the organization behind them, in a form machines can read without guessing: structured data. You will also find out what markup no longer does, because some of the most repeated advice about it is out of date.",

  outro:
    "You leave The Schema Works able to write JSON-LD that matches the page, pick the types that fit, tell a client honestly what markup does today, and describe your brand as one unambiguous entity. Next stop is The Agora, where you work on what the rest of the web says about that entity.",

  groups: [
    {
      id: "g-sd-basics",
      title: "Structured data basics",
      concepts: [
        {
          id: "c-structured-data",
          term: "Structured data",
          summary: "Structured data is code on a page that labels what the page is about, in a standard vocabulary machines read the same way.",
          explanation:
            "A person reading a product page knows which number is the price and which is the model number. A machine has to infer it. Structured data removes the guesswork. Google describes it as \"explicit clues about the meaning of a page\", and defines it as \"a standardized format for providing information about a page and classifying the page content\".\n\nThe vocabulary almost everyone uses is **schema.org**: types such as `Organization`, `Article` and `Product`, each with properties such as `name`, `url` and `datePublished`.\n\nGoogle says it uses the markup it finds \"to gather information about the web and the world in general, such as information about the people, books, or companies that are included in the markup\". Microsoft Bing makes the AI point directly: \"Schema is a type of code that helps search engines and AI systems understand your content.\"",
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
          term: "JSON-LD",
          summary: "JSON-LD is the format Google recommends for structured data: a block of JSON in a script tag, separate from the visible text.",
          explanation:
            "Google supports three formats: JSON-LD, Microdata and RDFa. It recommends whichever is easiest for you to maintain, adding \"in most cases, that's JSON-LD\". The reason is practical: \"The markup is not interleaved with the user-visible text\", so you can change the page copy without breaking the markup, and nest one thing inside another (an address inside an organization) cleanly.\n\nEvery block has the same three parts:\n\n- `@context` names the vocabulary, almost always `https://schema.org`.\n- `@type` says what the thing is, such as `Organization` or `Article`.\n- The properties describe it: `name`, `url`, `logo` and so on.\n\nGoogle also says it \"can read JSON-LD data when it is dynamically injected into the page's contents\", for example by a CMS plugin.",
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
          term: "Markup must match the page",
          summary: "Structured data describes what a visitor can see on the page; it is not a place for extra claims.",
          explanation:
            "Google's general guidelines are blunt: \"Don't mark up content that is not visible to readers of the page.\" They give an example: \"if the JSON-LD markup describes a performer, the HTML body must describe that same performer.\" The introduction adds that you shouldn't add structured data \"about information that is not visible to the user, even if the information is accurate.\"\n\nCheck your work with the Rich Results Test. Google advises using it \"during development, and the Rich result status reports after deployment\", because templates and plugins can break markup after launch.",
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
          term: "Organization markup",
          summary: "Organization markup on your home page tells search engines your official name, site, logo and profiles.",
          explanation:
            "Google says adding Organization markup to your home page \"can help Google better understand your organization's administrative details and disambiguate your organization in search results\". Some properties shape what people see, \"such as which logo is shown in Search results and your knowledge panel\".\n\n\"There are no required properties; instead, we recommend adding as many properties that are relevant to your organization.\" The ones to start with:\n\n- `name`: your name, written the way you write it everywhere else.\n- `url`: Google says this \"helps Google uniquely identify your organization.\"\n- `logo`: the logo you want shown.\n- `sameAs`: your profiles on other sites (more on this in the last group).",
          whyItMatters:
            "This is the one block where you describe the brand itself, not a page. It is the anchor the rest of your markup, such as the publisher of every article, can point back to.",
          example: {
            kind: "code",
            language: "json",
            caption: "Organization markup for a made-up shop",
            code: `{
  "@context": "https://schema.org",
  "@type": "Organization",
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
          id: "c-article",
          term: "Article markup",
          summary: "Article markup states a post's headline, author and dates, so they don't have to be inferred from the layout.",
          explanation:
            "Google says Article markup can help it \"show better title text, images, and date information\" for the article. As with Organization, \"There are no required properties\". The useful ones:\n\n- `headline`: the title.\n- `datePublished` and `dateModified`: \"in ISO 8601 format\", with a timezone.\n- `author`: a Person or an Organization. A brand blog without named writers can use the Organization.\n\nFor authors, Google recommends a URL that identifies them and adds: \"Google can understand both sameAs and url when disambiguating authors.\"",
          whyItMatters:
            "Dates and authorship are facts readers check before they trust a page. The Answer Quarter covered showing them on the page; Article markup states the same facts for machines, and Google says it helps it show better date information.",
          pitfall:
            "Updating dateModified on a schedule when nothing changed. The markup must match the page, and Google's own description is \"The date and time the article was most recently modified\", not the date you last republished it.",
          sources: [GOOGLE_ARTICLE],
        },
        {
          id: "c-product",
          term: "Product markup and reviews",
          summary: "Product markup describes a product's price, availability and ratings; review markup has strict rules against self-serving and fake reviews.",
          explanation:
            "For a product snippet (a result with ratings, price and availability), Google requires a `name` and says: \"Product snippets require either review or aggregateRating or offers\".\n\nReviews come with rules. Google says: \"Don't include fake or undisclosed incentivized reviews on your page or in your structured data markup.\" And for brands reviewing themselves: \"If the entity that's being reviewed controls the reviews about itself, their pages that use LocalBusiness or any other type of Organization structured data are ineligible for star review feature.\" That covers reviews shown through an embedded widget too.",
          whyItMatters:
            "Price, availability and ratings are facts you want stated precisely, not inferred from a page layout. Review markup is also where a well-meant shortcut, such as marking up your own testimonials, can break Google's rules.",
          pitfall:
            "Marking up your own testimonials as a star rating for your company. Under Google's rule, an organization's reviews of itself on its own pages aren't eligible for star review features.",
          sources: [GOOGLE_PRODUCT_SNIPPET, GOOGLE_REVIEW_SNIPPET],
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
      ],
    },
    {
      id: "g-markup-today",
      title: "What markup does today",
      concepts: [
        {
          id: "c-faq-howto",
          term: "FAQ and How-to rich results",
          summary: "Google no longer shows How-to rich results (since 2023) or FAQ rich results (since May 2026), whatever markup a page has.",
          explanation:
            "For years, FAQPage and HowTo markup were standard advice because they made a result bigger. That advice is out of date.\n\nIn August 2023 Google said FAQ rich results \"will only be shown for well-known, authoritative government and health websites.\" A month later it extended the How-to change: \"As of September 13, Google Search no longer shows How-to rich results on desktop, which means this result type is now deprecated.\"\n\nIn May 2026 the FAQ result went too. Google's documentation changelog says: \"This feature will no longer appear in Google Search starting May 7, 2026.\" In June it removed the FAQ documentation because \"The FAQ rich result feature is no longer shown in Google Search results\".",
          whyItMatters:
            "Audits, plugins and agency checklists still recommend FAQ schema for extra space on the results page. You need to be able to say plainly that Google no longer shows that result, so a client's budget goes somewhere it can work.",
          pitfall:
            "Deleting good FAQ content along with the idea of the rich result. Questions with direct answers on the page are still useful to readers and to engines (The Answer Quarter). It's the promise of a bigger Google result that ended.",
          sources: [GOOGLE_HOWTO_FAQ_2023, GOOGLE_UPDATES],
        },
        {
          id: "c-markup-and-ai",
          term: "Structured data and AI answers",
          summary: "Google says no special markup is needed for its AI features; Bing says schema helps AI systems understand content. Neither promises citations.",
          explanation:
            "Google's guide to its generative AI features addresses this directly: \"Structured data isn't required for generative AI search, and there's no special schema.org markup you need to add.\" It still recommends markup: \"it's a good idea to continue using it as part of your overall SEO strategy, as it helps with being eligible for rich results on Google Search.\"\n\nThe same guide says \"You don't need to create new machine readable files, AI text files, markup, or Markdown to appear in Google Search\".\n\nMicrosoft Bing puts more weight on it: \"Schema can label your content as a product, review, FAQ, or event, turning plain text into structured data that machines can interpret with confidence.\"",
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
      ],
    },
    {
      id: "g-entities",
      title: "Entities",
      concepts: [
        {
          id: "c-entity",
          term: "Entity",
          summary: "An entity is a distinct real-world thing, such as a company, person or product, that a search engine keeps track of as one thing.",
          explanation:
            "In 2012 Google introduced the Knowledge Graph, a model \"that understands real-world entities and their relationships to one another: things, not strings.\" Its example was the query [taj mahal]: \"Language can be ambiguous—do you mean Taj Mahal the monument, or Taj Mahal the musician?\"\n\nGoogle said the Knowledge Graph \"isn't just rooted in public sources such as Freebase, Wikipedia and the CIA World Factbook\". Your brand is an entity in this sense too, and it is recognized from what your site and other sites say about it.",
          whyItMatters:
            "Search engines keep track of things, not just words, and ambiguity is the problem the Knowledge Graph was built to solve. Consistent names, descriptions and details give engines one clear entity to recognize as your brand, instead of leaving them to work out which of several similar names you are.",
          pitfall:
            "Sharing a name with another company and assuming search engines will work it out. Use the same full name, logo, address and description everywhere, so the signals point at one entity.",
          sources: [GOOGLE_KNOWLEDGE_GRAPH],
        },
        {
          id: "c-same-as",
          term: "sameAs",
          summary: "sameAs lists pages on other sites that are about the same entity, such as its Wikipedia, Wikidata and official social profiles.",
          explanation:
            "Schema.org defines `sameAs` as the \"URL of a reference Web page that unambiguously indicates the item's identity. E.g. the URL of the item's Wikipedia page, Wikidata entry, or official website.\"\n\nGoogle's Organization docs describe it as \"The URL of a page on another website with additional information about your organization\", such as a profile on \"a social media or review site\". Google also notes it \"can make general use of the sameAs property\" beyond its documented features.",
          whyItMatters:
            "sameAs links the entity on your site to the same entity elsewhere. It is a direct way to tell machines that your LinkedIn page, your Wikidata item and your website are all one organization.",
          pitfall:
            "Listing pages that mention you instead of pages that are about you, such as a news story or a directory's category page. The definition says \"unambiguously indicates the item's identity\": each URL should be a profile of you and nobody else.",
          sources: [SCHEMA_SAME_AS, GOOGLE_ORGANIZATION, GOOGLE_SD_INTRO],
        },
        {
          id: "c-id",
          term: "@id and the graph",
          summary: "@id gives a thing in your markup a fixed identifier, so other blocks and pages can point to it instead of describing it again.",
          explanation:
            "JSON-LD's `@id` keyword is used \"to uniquely identify node objects that are being described in the document with IRIs or blank node identifiers\". In practice you give your organization a URL-style identifier, such as `https://www.larkfieldtea.example/#organization`, and use it everywhere.\n\nThen an article's `publisher`, or a `WebSite` node, can reference the organization by that `@id`, and every page describes the same organization instead of a slightly different copy. Several nodes can sit together in one block under `@graph`.",
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
          sources: [W3C_JSON_LD],
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
          "schema.org is the vocabulary and Organization the type. The #organization fragment gives the brand an identifier on the home page URL that other markup can reuse. WebPage would describe the page, not the shop.",
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
          "Check it with the Rich Results Test",
          "Publish the change",
          "Watch the rich result status reports in Search Console",
        ],
        explanation:
          "Google advises the Rich Results Test during development and the status reports after deployment, because templates and serving issues can break markup that tested fine.",
      },
    ],
    debrief:
      "The finished block says one thing, the same way everywhere: here is Larkfield Tea, at this address, with these profiles, known by this identifier. Every fact in it is on the page, and every other block on the site can point to it. That is most of what structured data can do for a brand, and it is worth doing well.",
  },

  example: {
    title: "Mailchimp's Organization markup",
    context:
      "The JSON-LD on mailchimp.com's home page, fetched on 30 October 2026. The excerpt keeps both nodes of its @graph but leaves out the logo and four of the seven sameAs links, marked with …",
    excerpt: {
      kind: "code",
      language: "json",
      caption: "Excerpt from the JSON-LD on https://mailchimp.com/, fetched 2026-10-30",
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
  "publisher": { "@id": "https://mailchimp.com/#organization" } }`,
    },
    points: [
      {
        label: "Reference pages first",
        text: "The sameAs list opens with the Wikipedia article and the Wikidata item (Q6735673, labeled Mailchimp on Wikidata), then the official social profiles. Those are the kinds of pages schema.org names: ones that \"unambiguously indicates the item's identity\".",
      },
      {
        label: "One identifier, reused",
        text: "The organization's @id is https://mailchimp.com/#organization, and the WebSite node names its publisher by that same @id instead of describing Mailchimp a second time.",
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
        { term: "The site as a whole, with its publisher", definition: "WebSite" },
      ],
      explanation:
        "Organization describes the brand, Article a dated piece of writing, Product something for sale, and WebSite the site itself, which can name its publisher by the organization's @id.",
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
        "FAQ rich results stop appearing in Google Search",
      ],
      explanation:
        "The Knowledge Graph arrived in May 2012. The FAQ limit came in August 2023 and the How-to deprecation in September 2023. FAQ rich results stopped appearing on May 7, 2026.",
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
  ],
};

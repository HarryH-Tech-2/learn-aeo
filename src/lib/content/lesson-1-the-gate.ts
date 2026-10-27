// Lesson 1, The Gate: how answer engines choose sources.
// Every claim about an engine is tied to a primary source checked on the
// `accessed` date. Brands such as Brightdesk and Northwind Planner are made up.

import type { LessonContent, Source } from "../lesson-types";

const ACCESSED = "2026-10-26";

const GOOGLE_AI_FEATURES: Source = {
  title: "AI features and your website",
  publisher: "Google Search Central",
  url: "https://developers.google.com/search/docs/appearance/ai-features",
  date: "2025-12-10",
  dateKind: "updated",
  accessed: ACCESSED,
};

const GOOGLE_AI_MODE: Source = {
  title: "AI in Search: Going beyond information to intelligence",
  publisher: "Google",
  url: "https://blog.google/products-and-platforms/products/search/google-search-ai-mode-update/",
  date: "2025-05-20",
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

const GOOGLE_SUCCEEDING: Source = {
  title: "Top ways to ensure your content performs well in Google's AI experiences on Search",
  publisher: "Google Search Central Blog",
  url: "https://developers.google.com/search/blog/2025/05/succeeding-in-ai-search",
  date: "2025-05-21",
  dateKind: "published",
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

const GEMINI_GROUNDING: Source = {
  title: "Grounding with Google Search",
  publisher: "Google Cloud Documentation",
  url: "https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/grounding/grounding-with-google-search",
  date: "2026-10-27",
  dateKind: "updated",
  // re-checked on 2026-10-27, when the page showed a newer update
  accessed: "2026-10-27",
};

const RAG_PAPER: Source = {
  title: "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks (Lewis et al.)",
  publisher: "arXiv",
  url: "https://arxiv.org/abs/2005.11401",
  date: "2020-05-22",
  dateKind: "published",
  accessed: ACCESSED,
};

const RAG_PAPER_FULL: Source = {
  title: "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks, full text (v4)",
  publisher: "arXiv",
  url: "https://arxiv.org/html/2005.11401v4",
  date: "2021-04-12",
  dateKind: "published",
  accessed: ACCESSED,
};

const OPENAI_CRAWLERS: Source = {
  title: "Overview of OpenAI Crawlers",
  publisher: "OpenAI",
  url: "https://developers.openai.com/api/docs/bots",
  accessed: ACCESSED,
};

const OPENAI_WEB_SEARCH: Source = {
  title: "Web search (API guide)",
  publisher: "OpenAI",
  url: "https://developers.openai.com/api/docs/guides/tools-web-search",
  accessed: ACCESSED,
};

const PERPLEXITY_CRAWLERS: Source = {
  title: "Perplexity Crawlers",
  publisher: "Perplexity",
  url: "https://docs.perplexity.ai/docs/resources/perplexity-crawlers",
  accessed: ACCESSED,
};

const PERPLEXITY_HOW: Source = {
  title: "How does Perplexity work?",
  publisher: "Perplexity Help Center",
  url: "https://www.perplexity.ai/help-center/en/articles/10352895-how-does-perplexity-work",
  accessed: ACCESSED,
};

const CLAUDE_WEB_SEARCH: Source = {
  title: "Web search tool",
  publisher: "Anthropic (Claude Platform Docs)",
  url: "https://platform.claude.com/docs/en/agents-and-tools/tool-use/web-search-tool",
  accessed: ACCESSED,
};

const ANTHROPIC_CRAWLERS: Source = {
  title: "Does Anthropic crawl data from the web, and how can site owners block the crawler?",
  publisher: "Claude Help Center",
  url: "https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler",
  date: "2026-04-07",
  dateKind: "updated",
  accessed: ACCESSED,
};

const BING_COPILOT_SEARCH: Source = {
  title: "Introducing Copilot Search in Bing",
  publisher: "Microsoft Bing Blog",
  url: "https://blogs.bing.com/search/2025/4/Introducing-Copilot-Search-in-Bing/",
  date: "2025-04-04",
  dateKind: "published",
  accessed: ACCESSED,
};

export const LESSON_1: LessonContent = {
  intro:
    "You have reached The Gate, the first district of the City of Answers. Every question that enters the city leaves as a single written answer, with a short list of sources attached. Before you work on getting your pages onto that list, you need to see how the list gets made.",

  outro:
    "You leave The Gate with the model the rest of the course builds on: an engine retrieves pages from an index, grounds its answer in a few passages, and cites the ones it relied on. Next stop is The Crawl Docks, where you make sure the bots doing that retrieving can actually reach your site.",

  groups: [
    {
      id: "g-one-answer",
      title: "From ten blue links to one answer",
      concepts: [
        {
          id: "c-answer-engine",
          term: "Answer engine",
          summary: "A search product that reads pages for the user and writes a response, with links to its sources.",
          explanation:
            "A classic results page hands the user ten links and leaves the reading to them. An answer engine does the reading itself and writes a response, then attaches links to the pages it drew on.\n\nYou already know the main ones. Google's AI Overviews and AI Mode surface links alongside the AI response, and Google says AI Mode gives \"a comprehensive AI-powered response with links to supporting websites\". Microsoft says Copilot Search \"cites its sources prominently\". Perplexity says each answer \"includes numbered citations linking to the original sources\". ChatGPT search and Claude's web search work the same way: search, read, write, cite.",
          whyItMatters:
            "The user may never scroll a list of results. Your visibility comes down to one question: is your page among the handful of sources attached to the answer?",
          pitfall:
            "Treating AI Overviews as a separate system that needs special tricks. Google's own guidance says there are no extra requirements: a page has to be indexed and eligible to appear in Search with a snippet.",
          sources: [GOOGLE_AI_FEATURES, BING_COPILOT_SEARCH, PERPLEXITY_HOW, OPENAI_WEB_SEARCH, CLAUDE_WEB_SEARCH],
        },
        {
          id: "c-cited-vs-mentioned",
          term: "Cited source vs mention",
          summary: "A citation links to your page as evidence; a mention only names you.",
          explanation:
            "A **citation** is a link to a specific page, attached to part of the answer. OpenAI's API calls it a `url_citation` and records where in the response the source was used. Claude's web search attaches a `web_search_result_location` to each cited claim.\n\nA **mention** is your brand named in the answer text without a link to your site. The supporting citation may go to a review site or a competitor's comparison page instead.\n\nThere is a third state too: retrieved but not cited. OpenAI notes that the number of sources the model consulted \"is often greater than the number of citations\".",
          whyItMatters:
            "Citations can send clicks and show that your page was trusted as evidence. Mentions shape what people think of you, but they send no traffic. Track the two separately, or you will misread your results.",
          example: {
            kind: "code",
            language: "text",
            caption: "A made-up answer, for illustration",
            code: "Q: Which project tool suits a ten-person design agency?\n\nA: Brightdesk and Northwind Planner are both common picks.\n   Brightdesk includes client approval on every plan [1].\n   Northwind Planner is cheaper per user for small teams [2].\n\nSources:\n[1] brightdesk.example/features\n[2] reviews.example/agency-project-tools",
          },
          pitfall:
            "Counting every brand mention as a win. In the example above, Northwind Planner is named twice but never cited. The review site earned that citation.",
          sources: [OPENAI_WEB_SEARCH, CLAUDE_WEB_SEARCH],
        },
        {
          id: "c-passage-unit",
          term: "The passage is the unit",
          summary: "Engines lift and cite a sentence or passage, not a whole page.",
          explanation:
            "Engines judge pages passage by passage. In 2020 Google said it could now \"better understand the relevancy of specific passages\", because \"the single sentence that answers your question might be buried deep in a web page\". The original RAG research split each Wikipedia article \"into disjoint 100-word chunks\" before retrieval.\n\nCitations work at the same scale. Claude's web search citations carry \"up to 150 characters of the cited content\": a sentence or two, not a page.",
          whyItMatters:
            "You are not competing page against page. You are competing paragraph against paragraph. One clear paragraph on a modest page can beat a vague paragraph on a strong one.",
          example: {
            kind: "before-after",
            before:
              "When it comes to choosing the right plan for your needs, there are lots of factors to weigh up, and pricing is one of the things we get asked about most.",
            after:
              "The Brightdesk Standard plan costs £12 per user per month, billed annually, and includes up to 50 active projects.",
            note: "A made-up product. The second version still makes sense when it is lifted out alone: it names the product, the price and the condition in one sentence.",
          },
          pitfall:
            "Checking only where the whole page ranks. A page can rank well and still offer no passage worth quoting.",
          sources: [GOOGLE_PASSAGES, RAG_PAPER_FULL, CLAUDE_WEB_SEARCH],
        },
      ],
      check: [
        {
          kind: "choice",
          id: "q-g1-mention",
          prompt:
            "A user asks Perplexity which CRM suits a ten-person charity. The answer names your brand, but the numbered sources link to two review sites and a competitor. What did you get?",
          options: [
            "A citation",
            "A mention, but not a citation",
            "Both a citation and a mention",
            "Nothing, because Perplexity does not link sources",
          ],
          answer: 1,
          explanation:
            "You were named in the text, which is a mention. None of the numbered sources point to your site, so the citations, and any clicks, went to the review sites and the competitor.",
        },
        {
          kind: "passage",
          id: "q-g1-passage",
          prompt: "A shopper asks, \"How long does delivery to Ireland take?\" Which passage from a (made-up) shop is easier for an engine to cite?",
          passages: [
            "We take shipping seriously, and our team works hard to get your order to you as quickly as we possibly can, wherever you are in the world.",
            "Orders to Ireland arrive in 3 to 5 working days with standard delivery, or the next working day with express delivery if you order by 2pm.",
          ],
          answer: 1,
          explanation:
            "The second passage answers the question in one self-contained sentence: the place, the times and the condition. The first could sit on any shop's site and answers nothing, so there is no claim in it to cite.",
        },
        {
          kind: "blank",
          id: "q-g1-blank",
          prompt: "Complete Google's eligibility rule for AI features.",
          text: "To be eligible to be shown as a supporting link in AI Overviews or AI Mode, a page must be ___ and eligible to be shown in Google Search with a ___.",
          answers: ["indexed", "snippet"],
          distractors: ["marked up with FAQ schema", "listed in llms.txt", "rich result"],
          explanation:
            "Google's AI features page says a page must be indexed and eligible to be shown in Search with a snippet, and that there are no additional technical requirements. Schema and llms.txt are not on that list.",
        },
      ],
    },
    {
      id: "g-retrieval",
      title: "Retrieval and grounding",
      concepts: [
        {
          id: "c-training-vs-retrieval",
          term: "Training data vs live retrieval",
          summary: "A model knows some things from training and looks others up at the moment you ask.",
          explanation:
            "A language model answers from two places. The first is what it learned in training, which is fixed until the next model is trained. The second is documents it retrieves when the question is asked. The RAG paper calls these **parametric** memory (stored in the model's weights) and **non-parametric** memory (an index it can search).\n\nThe vendors run separate bots for each job. OpenAI's GPTBot crawls content \"that may be used in training\", while OAI-SearchBot \"is used to surface websites in search results in ChatGPT's search features\". Anthropic draws the same line between ClaudeBot (training) and Claude-SearchBot and Claude-User (search and user requests).",
          whyItMatters:
            "Only retrieval can produce a citation to the current version of your page. Training influence is diffuse, slow to change and impossible to link to. OpenAI also says each robots.txt setting is \"independent of the others\", so you can opt out of training and stay in search.",
          example: {
            kind: "code",
            language: "text",
            caption: "User-agent strings as published by OpenAI and Perplexity (version numbers may change)",
            code: "# OpenAI search crawler (ChatGPT search)\nMozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36; compatible; OAI-SearchBot/1.4; +https://openai.com/searchbot\n\n# OpenAI training crawler\nMozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; GPTBot/1.4; +https://openai.com/gptbot\n\n# Perplexity search crawler\nMozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)",
          },
          pitfall:
            "Blocking every AI bot at once to stop training. OpenAI states that sites opted out of OAI-SearchBot \"will not be shown in ChatGPT search answers, though can still appear as navigational links\".",
          sources: [RAG_PAPER, OPENAI_CRAWLERS, ANTHROPIC_CRAWLERS, PERPLEXITY_CRAWLERS],
        },
        {
          id: "c-rag",
          term: "Retrieval-augmented generation (RAG)",
          summary: "Retrieve relevant passages first, then generate an answer conditioned on them.",
          explanation:
            "Lewis et al. (2020) set out the retrieve-then-generate pattern that the engines' own docs show in outline: search first, then answer from the results. A **retriever** searches an index for the passages most relevant to the question. A **generator** then writes the answer using those passages as context. In the paper, the index was \"a dense vector index of Wikipedia, accessed with a pre-trained neural retriever\".\n\nThe paper also showed why retrieval matters for freshness. Because the knowledge lives in the index, it \"can be easily updated at test time\" by swapping the index, with no retraining.",
          whyItMatters:
            "This is why indexing and passage quality come before anything else. If your passage is not retrieved, the generator never sees it, however good the model is.",
          pitfall:
            "Reading the paper as a specification of ChatGPT or Google. It sets out a research pattern. Each commercial engine builds its own, much larger version and does not publish the details.",
          sources: [RAG_PAPER, RAG_PAPER_FULL],
        },
        {
          id: "c-grounding",
          term: "Grounding",
          summary: "Basing an answer on retrieved sources and linking each claim back to them.",
          explanation:
            "Grounding connects what the model writes to sources it can point to. Google's Gemini docs put it plainly: \"If you want to connect your model with world knowledge, a wide possible range of topics, or up-to-date information on the Internet, then use Grounding with Google Search.\"\n\nRetrieval is a decision, not a given. Anthropic's docs say \"Claude determines when to search based on the prompt\", and OpenAI's say the model \"can choose to search the web or not based on the content of the input prompt\".",
          whyItMatters:
            "Anthropic says Claude searches when a request depends on information that is \"current, changing, or outside its training data\". Questions about prices, policies and recent releases fit that description, so they are your best chance of being cited.",
          pitfall:
            "Assuming every prompt triggers a search. Broad, stable questions may be answered from training alone, with no citations for anyone to win.",
          sources: [GEMINI_GROUNDING, CLAUDE_WEB_SEARCH, OPENAI_WEB_SEARCH],
        },
        {
          id: "c-search-index",
          term: "Engines depend on a search index",
          summary: "Retrieval runs over an index built by crawlers, so crawlability and indexing come first.",
          explanation:
            "Every engine here retrieves from an index of the web. For Google's AI features, the page must be in Google's index. PerplexityBot exists \"to surface and link websites in search results on Perplexity\". OAI-SearchBot does the same job for ChatGPT search. Anthropic says disabling Claude-SearchBot \"prevents our system from indexing your content for search optimization, which may reduce your site's visibility and accuracy in user search results\". Copilot Search runs inside Bing.\n\nSeparate user-triggered fetchers (ChatGPT-User, Perplexity-User, Claude-User) visit a page while answering a particular question. Lesson 2 covers how they treat robots.txt.",
          whyItMatters:
            "Classic technical SEO is the entry ticket. A page the crawler cannot reach, or that the index drops, is not a candidate for any answer.",
          pitfall:
            "Polishing copy for AI while a robots.txt rule or a firewall setting quietly blocks the search crawler.",
          sources: [GOOGLE_AI_FEATURES, PERPLEXITY_CRAWLERS, OPENAI_CRAWLERS, ANTHROPIC_CRAWLERS],
        },
      ],
      check: [
        {
          kind: "choice",
          id: "q-g2-robots",
          prompt:
            "Your robots.txt disallows GPTBot and allows OAI-SearchBot. According to OpenAI's crawler documentation, what happens?",
          options: [
            "Your pages can still appear in ChatGPT search answers, and you have signalled that your content should not be used for training",
            "You disappear from ChatGPT entirely",
            "Both bots stop, because OpenAI uses one crawl for both",
            "Nothing changes, because OpenAI ignores robots.txt",
          ],
          answer: 0,
          explanation:
            "OpenAI says each setting is independent: you can allow OAI-SearchBot to appear in search while disallowing GPTBot for training. It may reuse one crawl for both purposes, but only when you have allowed both bots.",
        },
        {
          kind: "order",
          id: "q-g2-rag-order",
          prompt: "Put the steps of retrieval-augmented generation in order.",
          items: [
            "The user's question arrives",
            "The retriever searches an index for the most relevant passages",
            "The top passages are passed to the generator with the question",
            "The generator writes an answer conditioned on those passages",
          ],
          explanation:
            "Retrieval comes before generation. The generator can only use what the retriever found, so if your passage is not retrieved, it cannot shape the answer.",
        },
        {
          kind: "match",
          id: "q-g2-bots",
          prompt: "Match each user agent to its job, as its operator documents it.",
          pairs: [
            { term: "GPTBot", definition: "Crawls content that may be used to train foundation models" },
            { term: "OAI-SearchBot", definition: "Surfaces websites in ChatGPT's search features" },
            { term: "PerplexityBot", definition: "Surfaces and links websites in Perplexity's search results" },
            { term: "Claude-User", definition: "Fetches a page when a Claude user's question needs it" },
          ],
          explanation:
            "Training crawlers, search crawlers and user-triggered fetchers do different jobs. Blocking one does not block the others, so decide on each separately.",
        },
      ],
    },
    {
      id: "g-fan-out",
      title: "Query fan-out and source selection",
      concepts: [
        {
          id: "c-fan-out",
          term: "Query fan-out",
          summary: "The engine splits one question into several related searches and combines the results.",
          explanation:
            "Google is explicit about this. When it launched AI Mode, it said the feature uses query fan-out, \"breaking down your question into subtopics and issuing a multitude of queries simultaneously on your behalf\". Its Search Central docs say AI Overviews may use the same technique. Google's Gemini grounding docs show the pattern from the developer's side: \"A single prompt might lead to one or more search queries.\" Their example turns *\"Tell me about the life of Albert Einstein\"* into three searches: his early life and education, the theory of relativity, and his life in the US.\n\nTake the prompt *\"Is a heat pump worth it for a 1930s semi?\"* A fan-out could plausibly search running costs, heat pumps in older and less insulated homes, available grants, and air-source versus ground-source.",
          whyItMatters:
            "You can be cited for one sub-question even if you would never rank for the long original prompt. Each clearly answered subtopic on your page is another way in.",
          pitfall:
            "Treating the sub-queries above as real data. Google does not publish the queries it fans out to. The list is an illustration of the pattern, not a log.",
          sources: [GOOGLE_AI_MODE, GOOGLE_AI_FEATURES, GEMINI_GROUNDING],
        },
        {
          id: "c-candidate-set",
          term: "A wider candidate set",
          summary: "More queries pull in more candidate pages, but only some of them get cited.",
          explanation:
            "Each sub-query brings back its own results, so the pool of candidate pages is wider than one results page. Google says that as responses are generated its models \"identify more supporting web pages\", so it can show a wider and more varied set of links than a classic search.\n\nThe pool is then narrowed. OpenAI's web search docs say the number of sources the model consulted \"is often greater than the number of citations\" it shows.",
          whyItMatters:
            "Being outside the top three for a head term does not rule you out. Being retrieved does not guarantee a citation either. The passage has to be the one the answer actually relies on.",
          pitfall:
            "Judging AI visibility from rankings for one head keyword. The sub-queries, and the passages they surface, matter more.",
          sources: [GOOGLE_AI_FEATURES, OPENAI_WEB_SEARCH],
        },
        {
          id: "c-liftable",
          term: "What makes a passage easy to lift",
          summary: "Self-contained, specific, original and technically reachable.",
          explanation:
            "Citations are short: Claude's carry up to 150 characters of the cited text. So write key claims to stand alone. Name the subject instead of writing \"it\", put the figure or condition in the same sentence, and answer the question before you add context.\n\nGoogle's guidance for its AI experiences adds two requirements. Make \"unique, non-commodity content\", because users ask \"longer and more specific questions\". And meet the basics: Googlebot is not blocked, the page returns HTTP 200, and it has indexable content. If you use structured data, it must match what is visible on the page.",
          whyItMatters:
            "A sentence that is still true and complete when copied out on its own can be cited safely. A sentence that leans on its neighbours cannot.",
          example: {
            kind: "before-after",
            before: "As mentioned above, it depends. For most people it's about a week, though there are some exceptions, which we cover below.",
            after:
              "Refunds reach your original payment card within 5 working days of us receiving your return. PayPal refunds take up to 2 working days.",
            note: "A made-up shop. The second version answers \"how long does a refund take?\" in two standalone sentences, each with its own figure and condition.",
          },
          pitfall:
            "Writing a generic AI-ready summary that repeats every other page, or hiding text that only bots can see. Google asks for non-commodity content, and hidden text breaks its spam policies.",
          sources: [CLAUDE_WEB_SEARCH, GOOGLE_SUCCEEDING, GOOGLE_SPAM],
        },
      ],
      check: [
        {
          kind: "choice",
          id: "q-g3-ninth",
          prompt:
            "Your guide ranks ninth for \"project management software\", yet an AI Mode answer to a long question about agency workflows cites it. What is the most likely explanation?",
          options: [
            "A fan-out sub-query matched a section of your guide that answers part of the question well",
            "AI Mode only cites pages outside the top three",
            "AI Mode answers do not use Google's index",
            "Someone paid for your guide to be cited",
          ],
          answer: 0,
          explanation:
            "AI Mode fans a question out into sub-queries. Your guide did not need to win the head term: it needed a passage that answered one of the subtopics better than the alternatives.",
        },
        {
          kind: "spot",
          id: "q-g3-spot",
          prompt:
            "These are the answer sentences under the heading \"How long does a refund take?\" on a (made-up) help page. Which sentence would be hardest to cite on its own?",
          language: "text",
          lines: [
            "Card refunds arrive within 5 working days of us receiving your return.",
            "PayPal refunds take up to 2 working days.",
            "As mentioned above, this also applies to it in most cases.",
            "Gift card purchases are refunded as store credit on the same day.",
          ],
          answer: 2,
          explanation:
            "\"This\", \"it\" and \"as mentioned above\" all point at text the reader cannot see once the line is lifted out. The other sentences each carry their own subject, figure and condition.",
        },
        {
          kind: "blank",
          id: "q-g3-blank",
          prompt: "Complete the reasoning.",
          text: "Because fan-out issues several related ___, a page can be cited for one ___ of a question even if it does not rank for the full prompt.",
          answers: ["searches", "subtopic"],
          distractors: ["crawls", "backlinks", "keyword"],
          explanation:
            "Google's own wording is \"multiple related searches across subtopics\". Each sub-search has its own results, so each subtopic is a separate chance to be the cited source.",
        },
      ],
    },
  ],

  exercise: {
    id: "x-trace-an-answer",
    title: "Trace an answer",
    brief:
      "Follow one prompt through an answer engine: \"Which project management tool is best for a ten-person design agency?\" Put the steps in order, predict the sub-queries, then sort out who was cited and who was only mentioned.",
    steps: [
      {
        kind: "order",
        id: "x-step-order",
        prompt: "Put the steps of a grounded answer in order.",
        items: [
          "The engine decides the prompt needs information from the web",
          "It generates one or more search queries",
          "The search system returns candidate pages from its index",
          "The model writes the answer from the retrieved passages, attaching a citation to each claim it took from a source",
        ],
        explanation:
          "This follows the flow in Anthropic's web search docs: Claude decides when to search, the searches run (Google's Gemini docs note one prompt can lead to several queries), and the final response carries cited sources. Citations are attached as the answer is written, and OpenAI's API records where in the response each source was used. They can only point to passages that were retrieved.",
      },
      {
        kind: "choice",
        id: "x-step-fanout",
        prompt: "Which set of searches is a query fan-out most likely to run for this prompt?",
        options: [
          "project management tools for small agencies · project tools with client approval · project management pricing per user",
          "project · management · tool",
          "The full prompt, sent once, word for word",
          "design agency jobs · design awards · design trends",
        ],
        answer: 0,
        explanation:
          "Fan-out breaks a question into the subtopics needed to answer it: tools for small agencies, features agencies need, and cost for a team of ten. Single words lose the meaning, and the last set wanders off the question.",
      },
      {
        kind: "match",
        id: "x-step-classify",
        prompt:
          "The engine answers: \"Brightdesk and Northwind Planner are both common picks. Brightdesk includes client approval on every plan [1]. Northwind Planner is cheaper per user for small teams [2].\" Sources: [1] brightdesk.example/features, [2] reviews.example/agency-project-tools. Match each site to what it got.",
        pairs: [
          { term: "Brightdesk", definition: "Mentioned, and cited to its own page" },
          { term: "Northwind Planner", definition: "Mentioned, but its citation went to someone else" },
          { term: "reviews.example", definition: "Cited, without being named in the answer" },
        ],
        explanation:
          "Brightdesk won both. Northwind Planner was named, but the evidence for its claim came from a review site, which earned the citation and any click. That is why mentions and citations need tracking separately.",
      },
    ],
    debrief:
      "Every answer you trace follows the same path: a decision to search, a set of queries, a pool of retrieved pages, and a few cited passages. You can influence three points on it. Make sure the crawler can reach you, cover the sub-questions people actually ask, and write passages that stand alone. The rest of the course takes these one at a time.",
  },

  example: {
    title: "Google: AI features and your website",
    context:
      "Google's Search Central guide for site owners on AI Overviews and AI Mode. It is Google's own account of how these features pick links, so it is worth reading closely, including the hedges.",
    excerpt: {
      kind: "quote",
      text: "Both AI Overviews and AI Mode may use a \"query fan-out\" technique — issuing multiple related searches across subtopics and data sources — to develop a response. While responses are being generated, our advanced models identify more supporting web pages, allowing us to display a wider and more diverse set of helpful links associated with the response than with a classic web search, enabling new opportunities for exploration.",
    },
    points: [
      {
        label: "Fan-out is on the record",
        text: "This is not a theory from a tools vendor. Google documents it for site owners, so planning content around sub-questions rests on a primary source.",
      },
      {
        label: "\"May use\"",
        text: "The wording is hedged. Not every AI response fans out, so treat fan-out as something that widens your chances, not a promise.",
      },
      {
        label: "More supporting pages",
        text: "Google says it finds more supporting pages while it writes the answer, and shows a wider set of links than a classic search. Pages beyond the usual top results are in play.",
      },
      {
        label: "What the page does not ask for",
        text: "Elsewhere on the same page, Google says there are no additional requirements or special optimisations for AI features: be indexed and snippet-eligible. It also says AI feature traffic is counted in Search Console's Performance report under the \"Web\" search type.",
      },
    ],
    source: GOOGLE_AI_FEATURES,
  },

  audit: [
    {
      kind: "choice",
      id: "a-block-all",
      prompt:
        "A colleague wants to block every AI bot in robots.txt to keep your content out of model training. What is the main risk?",
      options: [
        "Search crawlers such as OAI-SearchBot and PerplexityBot are blocked too, so you can drop out of those engines' answers",
        "Google stops indexing the site for classic search",
        "There is no risk, because training and search use the same crawler everywhere",
        "Your site will be flagged as spam",
      ],
      answer: 0,
      explanation:
        "OpenAI and Perplexity run separate search crawlers from any training crawler. OpenAI says sites opted out of OAI-SearchBot will not be shown in ChatGPT search answers. A blanket block throws away search visibility to stop training.",
    },
    {
      kind: "passage",
      id: "a-passage-support",
      prompt: "A user asks, \"Does the Standard plan include phone support?\" Which passage is easier to cite?",
      passages: [
        "Yes. Phone support is included on the Standard plan, Monday to Friday, 9am to 5pm UK time.",
        "Support is at the heart of everything we do, and our friendly team are always happy to help however they can.",
      ],
      answer: 0,
      explanation:
        "The first passage answers yes or no, names the plan and gives the hours, all in a span short enough to quote. The second makes no checkable claim.",
    },
    {
      kind: "blank",
      id: "a-blank-memory",
      prompt: "Fill in the RAG paper's terms.",
      text: "Knowledge stored in a model's weights is ___ memory. A searchable index of documents is ___ memory.",
      answers: ["parametric", "non-parametric"],
      distractors: ["semantic", "cached", "episodic"],
      explanation:
        "Lewis et al. combine pre-trained parametric memory (the model) with non-parametric memory (a retrievable index). Only the second can be updated without retraining, and only the second can point to your page.",
    },
    {
      kind: "order",
      id: "a-order-path",
      prompt: "Put the steps a page goes through to earn a citation in order.",
      items: [
        "The search crawler can reach the page",
        "The page is added to the index",
        "A query or fan-out sub-query retrieves the page",
        "A passage on it supports part of the answer",
        "The engine attaches a citation to that passage",
      ],
      explanation:
        "Each step depends on the one before. A brilliant passage on a page the crawler cannot reach never gets as far as retrieval.",
    },
    {
      kind: "match",
      id: "a-match-terms",
      prompt: "Match each term to its meaning.",
      pairs: [
        { term: "Grounding", definition: "Basing a response on retrieved sources and linking back to them" },
        { term: "Query fan-out", definition: "Splitting one question into several related searches" },
        { term: "Citation", definition: "A link to a source attached to part of the answer" },
        { term: "Mention", definition: "Your brand named in the answer without a link to you" },
      ],
      explanation:
        "These four terms run through the rest of the course. Grounding and fan-out explain how an engine finds sources. Citations and mentions are the two ways you can show up in what it writes.",
    },
    {
      kind: "spot",
      id: "a-spot-robots",
      prompt:
        "You want to keep content out of OpenAI's model training but stay visible in ChatGPT search. Which line breaks that goal?",
      language: "robots",
      lines: [
        "User-agent: GPTBot",
        "Disallow: /",
        "User-agent: OAI-SearchBot",
        "Disallow: /",
        "User-agent: *",
        "Allow: /",
      ],
      answer: 3,
      explanation:
        "Disallowing GPTBot covers training. Disallowing OAI-SearchBot as well removes you from ChatGPT search answers, which is the opposite of what you want.",
    },
    {
      kind: "choice",
      id: "a-sources-vs-citations",
      prompt:
        "OpenAI's docs say the number of sources a model consulted is often greater than the number of citations it shows. What should you take from that?",
      options: [
        "Being retrieved is not enough. Your passage has to be the one the answer relies on",
        "Citations are chosen at random from the sources",
        "Only the first source retrieved is ever cited",
        "Retrieval does not matter, only training data does",
      ],
      answer: 0,
      explanation:
        "Retrieval gets your page into the pool, and the answer cites only the passages it actually used. That is why passage clarity matters even after you have solved crawling and indexing.",
    },
    {
      kind: "choice",
      id: "a-first-step",
      prompt:
        "Your pages never appear as supporting links in AI Overviews. Based on Google's own guidance, what should you check first?",
      options: [
        "That the pages are indexed and eligible for a snippet, for example not blocked by nosnippet",
        "That you have published an llms.txt file",
        "That you have added hidden summaries written for AI",
        "That you are running Google Ads on the same queries",
      ],
      answer: 0,
      explanation:
        "Google says the requirements are the same as for Search: the page must be indexed and eligible to show with a snippet. Preview controls such as nosnippet limit what can be shown. Hidden text is a spam risk, and ads do not buy citations.",
    },
    {
      kind: "choice",
      id: "a-stale-answer",
      prompt:
        "An assistant answers a question about your March price change with last year's price and no citation. What is the most likely cause?",
      options: [
        "It answered from training data without retrieving your current page",
        "It retrieved and cited your current pricing page",
        "Fan-out found too many sources",
        "Grounding always uses data from the previous year",
      ],
      answer: 0,
      explanation:
        "No citation plus out-of-date facts points to an answer from parametric memory. Retrieval is how current pages reach the answer, which is one reason clear, crawlable pricing pages matter.",
    },
    {
      kind: "choice",
      id: "a-fanout-fix",
      prompt:
        "Your heat pump guide targets \"heat pump UK\". Which change most improves its chances of being cited for \"Is a heat pump worth it for a 1930s semi?\"",
      options: [
        "Add clearly headed sections that each answer one likely sub-question, such as running costs, older homes and grants, in their opening sentence",
        "Repeat the full prompt several times as a keyword",
        "Add a long general introduction before the first heading",
        "Put a copy of the prompt in white text at the bottom of the page",
      ],
      answer: 0,
      explanation:
        "Fan-out searches subtopics, so give each likely sub-question its own self-contained answer. Keyword repetition and padding add nothing citable, and hidden text breaks Google's spam policies.",
    },
  ],
};

// Lesson 12: when AI gets your brand wrong.
// Claims about how ChatGPT, Google AI Overviews, Perplexity and Copilot handle
// errors and feedback, knowledge panels, Business Profiles, Wikipedia and
// Wikidata conduct rules, OpenAI's personal-data requests, Google's legal
// removal route and the FTC's fake-review rule are tied to sources checked on
// the `accessed` date. The three kinds of wrong answer and the error log are
// this course's own way of organizing the work, not platform terms. Larkfield
// Tea is the made-up shop from Lesson 4; its errors, citations and listings are
// invented for the examples and exercises. Nothing here is legal advice.

import type { LessonContent, Source } from "../lesson-types";

const ACCESSED = "2026-11-04";

const OPENAI_TRUTH: Source = {
  title: "Does ChatGPT tell the truth?",
  publisher: "OpenAI Help Center",
  url: "https://help.openai.com/en/articles/8313428-does-chatgpt-tell-the-truth",
  accessed: ACCESSED,
};

const OPENAI_PRIVACY: Source = {
  title: "Privacy policy",
  publisher: "OpenAI",
  url: "https://openai.com/policies/privacy-policy/",
  date: "2026-07-30",
  dateKind: "updated",
  accessed: ACCESSED,
};

const OPENAI_RTBF: Source = {
  title: "Right to be forgotten and personal data removal from ChatGPT",
  publisher: "OpenAI Help Center",
  url: "https://help.openai.com/en/articles/20001057-right-to-be-forgotten-and-personal-data-removal-from-chatgpt",
  accessed: ACCESSED,
};

const OPENAI_REPORTING: Source = {
  title: "Reporting content in ChatGPT and OpenAI platforms",
  publisher: "OpenAI Help Center",
  url: "https://help.openai.com/en/articles/10245791-reporting-content-in-chatgpt-and-openai-platforms",
  accessed: ACCESSED,
};

const OPENAI_BEHAVIOR_FEEDBACK: Source = {
  title: "Model behavior feedback",
  publisher: "OpenAI",
  url: "https://openai.com/form/model-behavior-feedback/",
  accessed: ACCESSED,
};

const OPENAI_SEARCH_HELP: Source = {
  title: "Searching the web with ChatGPT",
  publisher: "OpenAI Help Center",
  url: "https://help.openai.com/en/articles/9237897-searching-the-web-with-chatgpt",
  accessed: ACCESSED,
};

const GOOGLE_AIO_HELP: Source = {
  title: "Find information in faster & easier ways with AI Overviews in Google Search",
  publisher: "Google Search Help",
  url: "https://support.google.com/websearch/answer/14901683",
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

const KP_ABOUT: Source = {
  title: "About knowledge panels",
  publisher: "Knowledge Panel Help",
  url: "https://support.google.com/knowledgepanel/answer/9163198",
  accessed: ACCESSED,
};

const KP_GET_VERIFIED: Source = {
  title: "Get verified on Google",
  publisher: "Knowledge Panel Help",
  url: "https://support.google.com/knowledgepanel/answer/7534902",
  accessed: ACCESSED,
};

const KP_FEEDBACK: Source = {
  title: "Submit feedback on content about you",
  publisher: "Knowledge Panel Help",
  url: "https://support.google.com/knowledgepanel/answer/7534842",
  accessed: ACCESSED,
};

const GBP_EDIT: Source = {
  title: "Edit your Business Profile",
  publisher: "Google Business Profile Help",
  url: "https://support.google.com/business/answer/3039617",
  accessed: ACCESSED,
};

const MAPS_ERRORS: Source = {
  title: "Report data or content errors on Google Maps",
  publisher: "Google Maps Help",
  url: "https://support.google.com/maps/answer/3094088",
  accessed: ACCESSED,
};

const MAPS_CONTENT_POLICY: Source = {
  title: "Prohibited & restricted content",
  publisher: "Maps User Contributed Content Policy Help",
  url: "https://support.google.com/contributionpolicy/answer/7400114",
  accessed: ACCESSED,
};

const GOOGLE_LEGAL: Source = {
  title: "Report content for legal reasons",
  publisher: "Google Legal Help",
  url: "https://support.google.com/legal/answer/3110420",
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

const PERPLEXITY_REPORT: Source = {
  title: "How can I report incorrect or inaccurate answers?",
  publisher: "Perplexity Help Center",
  url: "https://www.perplexity.ai/help-center/en/articles/10354902-how-can-i-report-incorrect-or-inaccurate-answers",
  date: "2026-10-27",
  dateKind: "updated",
  accessed: ACCESSED,
};

const MS_COPILOT_FEEDBACK: Source = {
  title: "Providing feedback about Microsoft Copilot with Microsoft 365 apps",
  publisher: "Microsoft Support",
  url: "https://support.microsoft.com/en-us/privacy/microsoft-copilot/providing-feedback",
  accessed: ACCESSED,
};

const WP_COI: Source = {
  title: "Wikipedia:Conflict of interest",
  publisher: "Wikipedia",
  url: "https://en.wikipedia.org/wiki/Wikipedia:Conflict_of_interest",
  date: "2026-11-01",
  dateKind: "updated",
  accessed: ACCESSED,
};

const WP_PLAIN_COI: Source = {
  title: "Wikipedia:Plain and simple conflict of interest guide",
  publisher: "Wikipedia",
  url: "https://en.wikipedia.org/wiki/Wikipedia:Plain_and_simple_conflict_of_interest_guide",
  date: "2026-10-24",
  dateKind: "updated",
  accessed: ACCESSED,
};

const WP_ABOUT_YOU: Source = {
  title: "Wikipedia:About you",
  publisher: "Wikipedia",
  url: "https://en.wikipedia.org/wiki/Wikipedia:About_you",
  date: "2026-08-25",
  dateKind: "updated",
  accessed: ACCESSED,
};

const WP_SOCKPUPPETRY: Source = {
  title: "Wikipedia:Sock puppetry",
  publisher: "Wikipedia",
  url: "https://en.wikipedia.org/wiki/Wikipedia:Sock_puppetry",
  date: "2026-10-28",
  dateKind: "updated",
  accessed: ACCESSED,
};

const WD_SELF_PROMOTION: Source = {
  title: "Wikidata:Self-promotion",
  publisher: "Wikidata",
  url: "https://www.wikidata.org/wiki/Wikidata:Self-promotion",
  date: "2026-09-18",
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

export const LESSON_12: LessonContent = {
  intro:
    "AI answers repeat what the web says about your brand, and sometimes that is wrong: an AI answer gives old prices, a closed branch, a founder who never existed. In this lesson you learn why that happens, how to trace a wrong answer back to the pages it relied on, how to fix those pages under each site's rules, which feedback and request routes the platforms actually document, and what not to do, however tempting it is.",

  outro:
    "You now have a method: sort the error, trace it to its sources, fix the source you control, ask for fixes where you don't, use each platform's own feedback route, and rerun the same prompts until the error is gone. None of it rewrites a model overnight, but all of it changes what the answer engines read next time.",

  groups: [
    {
      id: "g-why-wrong",
      title: "Why AI gets your facts wrong",
      concepts: [
        {
          id: "c-hallucination",
          quiz: {"kind": "choice", "id": "cq-hallucination", "prompt": "What does OpenAI warn about how confident ChatGPT sounds?", "options": ["It may express high confidence even in incorrect answers", "It only sounds confident when it has a source", "It shows a confidence score next to each claim", "It refuses to answer when it isn't sure"], "answer": 0, "explanation": "OpenAI says the model may express high confidence even in incorrect answers, so a confident tone doesn't mean the answer came from a source."},
          term: "Hallucination",
          summary: "A language model predicts likely words, so it can state false facts fluently and confidently. The platforms say so themselves.",
          explanation:
            "OpenAI describes ChatGPT producing \"responses that are not factually accurate\", such as wrong dates or facts and invented citations, and adds that \"this phenomenon is often referred to as a hallucination\". Its privacy policy explains why: responses are built by predicting the words most likely to come next, and \"in some cases, the words most likely to appear next may not be the most factually accurate.\" It also warns that the model \"may express high confidence even in incorrect answers.\"\n\nGoogle is just as direct about its own feature: \"AI Overviews can and will make mistakes.\"\n\nFor a brand, a hallucination usually looks like a plausible detail with no source behind it: a made-up founding year, a product you never sold, a policy you never had.",
          whyItMatters:
            "If the platforms themselves say errors will happen, the question for a marketer isn't whether AI will ever get your brand wrong, but how quickly you notice and what you can change.",
          example: {
            kind: "before-after",
            before: "Larkfield Tea was founded in 1998 by tea merchant Thomas Larkfield and is known for its smoked Lapsang blends.",
            after: "Larkfield Tea is a loose-leaf tea shop founded in 2019 (larkfieldtea.example/about). It sells green, black and herbal teas.",
            note: "Both answers are made up for this lesson. The first sounds authoritative but has no citation and invents a founder; the second is tied to a page you can check.",
          },
          pitfall:
            "Assuming a confident tone means the answer came from a source. OpenAI's own help page says the model may sound confident even when it is wrong.",
          sources: [OPENAI_TRUTH, OPENAI_PRIVACY, GOOGLE_AIO_HELP],
        },
        {
          id: "c-training-vs-retrieval",
          quiz: {"kind": "choice", "id": "cq-training-vs-retrieval", "prompt": "A wrong answer about your brand shows no citations. What does the card say that may mean?", "options": ["It may come from training data, which you can't edit directly", "It must come from your own website", "It was fetched live from today's search results", "It came from Google's knowledge panel"], "answer": 0, "explanation": "A cited answer shows which pages it leaned on. An answer with no citations may be coming from training data, which you can only influence by making better information available."},
          term: "Training data vs live retrieval",
          summary: "An answer can come from what the model learned in training, which stops at a cutoff, or from pages it fetched for this question. The fix depends on which.",
          explanation:
            "There are two places an answer can come from:\n\n- **Training data.** OpenAI says \"the models are trained on data up to a certain point and responses do not incorporate information about events beyond that, unless tools are used.\" If you changed your prices after that point, a model answering from memory can still give the old ones.\n- **Live retrieval (grounding).** With search on, ChatGPT \"can access and cite real-time web sources\". Perplexity says it searches the internet \"in real-time\" and that \"each answer includes numbered citations linking to the original sources\". Google says AI Overviews and AI Mode may use query fan-out, \"issuing multiple related searches across subtopics and data sources\", to build a response.\n\nA cited answer tells you which pages it leaned on. An answer with no citations may be coming from training data, which you can't edit directly; you can only make sure better information is out there for future retrieval and training.",
          whyItMatters:
            "Most fixes you can make work through retrieval: change the pages an answer engine fetches, and the next grounded answer can change. Errors that come from training data can take longer to shift.",
          pitfall:
            "Treating every wrong answer the same way. A wrong price cited to an old directory page needs that page fixed; an uncited error in a no-search answer won't respond to any single page edit straight away.",
          sources: [OPENAI_TRUTH, PERPLEXITY_HOW, GOOGLE_AI_FEATURES],
        },
        {
          id: "c-error-types",
          quiz: {"kind": "choice", "id": "cq-error-types", "prompt": "Which kind of error does the card say to treat as a hallucination?", "options": ["Invented: the detail appears nowhere you can find", "Outdated: the fact was true once", "Inherited: a cited page says it"], "answer": 0, "explanation": "Invented errors have no source, so they're treated as hallucinations. Outdated and inherited errors are fixed on the pages that carry them."},
          term: "Three kinds of wrong answer",
          summary: "Sort each error before you act: invented (no source), outdated (an old fact the model or a page still holds), or inherited (a cited page says it).",
          explanation:
            "This course sorts brand errors into three kinds, because each needs a different fix:\n\n1. **Invented.** The detail appears nowhere you can find. Treat it as a hallucination: strengthen clear, consistent facts on your own site and trusted profiles, and use the platform's feedback route.\n2. **Outdated.** The fact was true once: an old address, last year's price. Update every page that still carries it, including your own old pages.\n3. **Inherited.** The answer repeats something a cited page says. Fix or request a fix on that page; the answer usually follows its sources.\n\nGoogle describes the inherited case for knowledge panels in plain terms: descriptions come from other sources, and \"changing the source of the information usually causes the information in the knowledge panel to change as well.\"",
          whyItMatters:
            "Sorting first stops you wasting weeks on feedback forms for an error that one outdated directory listing is causing, or editing pages for an error no page contains.",
          pitfall:
            "Calling everything a hallucination. Many brand errors are faithful repetitions of a wrong page, often one the brand itself published years ago.",
          sources: [OPENAI_TRUTH, KP_FEEDBACK],
        },
      ],
      check: [
        {
          kind: "match",
          id: "q-why-match",
          prompt: "Match each wrong answer about Larkfield Tea (made up) to its kind.",
          pairs: [
            { term: "Says Larkfield was founded in 1998 by a founder who never existed; no source anywhere", definition: "Invented" },
            { term: "Gives last year's delivery charge, which Larkfield's old FAQ page still shows", definition: "Outdated" },
            { term: "Repeats a wrong street address from a cited directory listing", definition: "Inherited" },
          ],
          explanation:
            "An invented detail has no source; an outdated one was true once and lingers somewhere; an inherited one comes straight from a page the answer cites. (Some errors are both outdated and inherited, which is why you check the citations.)",
        },
        {
          kind: "choice",
          id: "q-why-cutoff",
          prompt: "ChatGPT answers without search and gives Larkfield's old opening hours. What does OpenAI's help page say explains this?",
          options: [
            "ChatGPT copies Google's knowledge panel",
            "Models are trained on data up to a certain point and don't include later events unless tools such as search are used",
            "ChatGPT only reads Wikipedia",
            "Larkfield's robots.txt file is blocking ChatGPT's training",
          ],
          answer: 1,
          explanation:
            "OpenAI lists a knowledge cutoff as a limitation: without tools like search, responses are based on what the model learned in training.",
        },
      ],
    },
    {
      id: "g-trace",
      title: "Trace and log the error",
      concepts: [
        {
          id: "c-read-citations",
          quiz: {"kind": "choice", "id": "cq-read-citations", "prompt": "A wrong answer about Larkfield (made up) cites three pages. What does the card advise?", "options": ["Open every cited page and find the sentence that matches the error", "Check only the first citation, since that's where the error comes from", "Skip the citations and send feedback straight away", "Assume the error comes from training data"], "answer": 0, "explanation": "An answer can combine several pages, and the wrong detail may come from the third link, so open every cited page and note who controls it."},
          term: "Read the citations",
          summary: "Open every source a wrong answer cites. The page that says the wrong thing is usually the page you need to fix.",
          explanation:
            "Each platform shows its sources:\n\n- **ChatGPT**: \"Responses that use web search may include citations.\" You can \"select Sources, when available, to view cited sources and other relevant links.\"\n- **Perplexity**: each answer has numbered citations linking to the original sources.\n- **Google AI Overviews**: Google's help page tells users to \"click the links to supporting information from the web\" to double-check.\n\nFor each wrong answer, open every cited page and find the sentence that matches the error. Note who controls that page: you, a directory, a review site, a news outlet, Wikipedia.",
          whyItMatters:
            "Citations turn a vague complaint (the AI is wrong about us) into a short list of pages, each with an owner and a fix route.",
          pitfall:
            "Stopping at the first citation. An answer can combine several pages, and the wrong detail may come from the third link, not the first.",
          sources: [OPENAI_SEARCH_HELP, PERPLEXITY_HOW, GOOGLE_AIO_HELP],
        },
        {
          id: "c-error-log",
          quiz: {"kind": "spot", "id": "cq-error-log", "prompt": "Which line of this (made-up) error log entry falls short of what the card asks for?", "language": "text", "lines": ["Prompt and platform: how much is larkfield tea delivery, ChatGPT", "Date and evidence: 2026-11-02, conversation link saved", "Wrong statement: it said something about delivery being expensive", "Correct fact: UK delivery is free, see larkfieldtea.example/delivery"], "answer": 2, "explanation": "The card asks for the wrong statement word for word. A paraphrase doesn't give a reviewer what they need or let you check the same wording later."},
          term: "The error log",
          summary: "Record each error with the exact prompt, platform, date, wording, citations and correct fact. Every report route asks for some of this.",
          explanation:
            "Keep one row per error:\n\n- the exact prompt and the platform\n- the date, and a link to the conversation or a screenshot\n- the wrong statement, word for word\n- the cited sources, and which one carries the error\n- the correct fact, with a public page that proves it\n- what you did, and when you'll recheck\n\nThe platforms ask for the same details. Perplexity asks for the \"URL to the query\" and a \"description of the error and expected result\". OpenAI's privacy requests advise you to \"provide specific examples of where the information appears, including links to chats\".",
          whyItMatters:
            "A complete log makes every report faster to file and easier for a reviewer to act on, and it lets you prove later that the error was fixed.",
          pitfall:
            "Logging only a paraphrase. The exact wording and the conversation link are what a reviewer needs, and what you need to rerun the same prompt.",
          sources: [PERPLEXITY_REPORT, OPENAI_RTBF],
        },
        {
          id: "c-monitor",
          quiz: {"kind": "choice", "id": "cq-monitor", "prompt": "When does the card say to close a row in your error log?", "options": ["When the error has stopped appearing across several runs", "After one clean answer", "As soon as you've sent feedback", "After 30 days, whatever the answers say"], "answer": 0, "explanation": "Answers vary from run to run, so close a row only after the error has stopped appearing across several runs, and reopen it if it comes back."},
          term: "Monitoring for recurring errors",
          summary: "Put the questions that produced errors into your prompt set and rerun them on a schedule, across phrasings, until the error stops appearing.",
          explanation:
            "A single clean answer doesn't prove a fix. Google's own advice for checking AI Overviews is to \"ask multiple versions of your question\" and to \"always check important info in more than one place\". Apply the same habit to monitoring:\n\n- Add every question that produced an error to the prompt set from Lesson 7, with two or three phrasings.\n- Rerun them on the same schedule as the rest of the set, on each platform where the error appeared.\n- Close a log row only when the error has stopped appearing across several runs, and reopen it if the error comes back.\n\nPerplexity's report page lists \"repetitive behavior\" and \"outdated information\" among the issues it looks for, so recurring errors are worth reporting again with your log.",
          whyItMatters:
            "Answers vary from run to run. Without a fixed recheck you can't tell a real fix from a lucky answer.",
          pitfall:
            "Declaring victory after one good answer, then finding the old error back next month because the source page was never fixed.",
          sources: [GOOGLE_AIO_HELP, PERPLEXITY_REPORT],
        },
      ],
      check: [
        {
          kind: "order",
          id: "q-trace-order",
          prompt: "Put the first steps for a wrong answer in order.",
          items: [
            "Save the exact prompt, wording, date and conversation link",
            "Open every cited source and find the sentence with the error",
            "Decide whether the error is invented, outdated or inherited",
            "Fix or request a fix on the page that carries it",
          ],
          explanation:
            "Capture the evidence first (answers change), then trace the citations, then sort the error, then act on the right page.",
        },
        {
          kind: "blank",
          id: "q-trace-perplexity",
          prompt: "Complete what Perplexity asks you to include in a report about a wrong answer.",
          text: "___ to the query; description of the error and ___ result.",
          answers: ["URL", "expected"],
          distractors: ["Screenshot", "correct", "previous"],
          explanation:
            "Perplexity's help page asks for the URL to the query and a description of the error and expected result.",
        },
      ],
    },
    {
      id: "g-fix-sources",
      title: "Fix the sources",
      concepts: [
        {
          id: "c-own-site",
          quiz: {"kind": "passage", "id": "cq-own-site", "prompt": "Larkfield (made up) has made UK delivery free. Which approach follows the card?", "passages": ["Publish a new delivery page with the free delivery offer, and leave the 2023 FAQ with the old price live.", "Update the 2023 FAQ to say delivery is now free and when that changed, so no live page carries the old price."], "answer": 1, "explanation": "If the old page stays live, both can be retrieved and the old one may be cited. Update or remove pages that contradict the current fact."},
          term: "Your own site first",
          summary: "Make your site the clearest, most current statement of your facts, and remove or update old pages that contradict it.",
          explanation:
            "Your site is the one source you fully control. Put the facts people ask about (prices, delivery, locations, hours, founding date, leadership) on clear, current pages, and hunt down old pages that still say otherwise: old FAQs, archived announcements, outdated PDFs.\n\nWikidata's advice to subjects who want accurate information online starts here: \"maintain a personal or professional website with accurate facts\" and \"use structured data such as schema.org\" so search engines can identify you. Google notes that \"there are no additional requirements to appear in AI Overviews or AI Mode\" beyond its normal search requirements, so ordinary SEO hygiene (indexable, crawlable, current pages) is how your corrections get found.",
          whyItMatters:
            "When an answer engine fetches pages about you, your own page is the one most likely to state the fact directly. If your own old pages disagree with each other, you have handed the error to the model.",
          example: {
            kind: "before-after",
            before: "FAQ (2023, still live): Delivery is £4.95 on all UK orders.",
            after: "FAQ (updated May 2026): UK delivery is free on every order. We changed this on 1 May 2026; earlier prices no longer apply.",
            note: "Made-up Larkfield Tea pages. The updated version states the current fact, the date it changed, and removes the old figure that answers kept repeating.",
          },
          pitfall:
            "Publishing a new page with the right fact while leaving the old page live. Both can be retrieved, and the old one may be the one that gets cited.",
          sources: [WD_SELF_PROMOTION, GOOGLE_AI_FEATURES],
        },
        {
          id: "c-business-listings",
          quiz: {"kind": "match", "id": "cq-business-listings", "prompt": "Match each listing to the route the card gives for fixing it.", "pairs": [{"term": "Your own Google Business Profile", "definition": "Edit it while signed in; Google reviews changes before they go live"},{"term": "A Business Profile you don't own or manage", "definition": "Suggest an edit"},{"term": "Another directory or review site", "definition": "Claim your listing where the site allows it, and correct it"}], "explanation": "You edit your own profile directly, suggest edits to profiles you don't manage, and claim and correct listings on other sites, logging each change."},
          term: "Business Profile, maps and directories",
          summary: "Correct your own listings directly, and use each site's suggest-an-edit or report route for listings you don't control.",
          explanation:
            "Directory and map listings are frequent sources of wrong addresses, hours and phone numbers.\n\n- **Your Google Business Profile**: sign in to the linked Google Account and edit it on Search or Maps. Google says \"we review your changes before we update them live on your profile.\"\n- **Someone else's listing on Google**: \"If you find something wrong with a Business Profile that you don't own or manage, you can suggest an edit.\" Google Maps also lets you report businesses for fake, spam or inappropriate content.\n- **Other directories and review sites**: claim your listing where the site allows it, correct it, and keep a copy of what you changed in your error log.",
          whyItMatters:
            "One wrong directory entry can be cited again and again. Fixing it at the source fixes every answer that leans on it.",
          pitfall:
            "Editing a competitor's or customer's listing to make yourself look better, or reporting accurate content you simply dislike. Report only genuine errors and policy violations.",
          sources: [GBP_EDIT, MAPS_ERRORS],
        },
        {
          id: "c-wikipedia",
          quiz: {"kind": "choice", "id": "cq-wikipedia", "prompt": "When does Wikipedia's page for article subjects allow you to correct an article about yourself directly?", "options": ["In cases of blatant falsehoods, such as fake death dates", "Whenever the content is unflattering", "Once you've disclosed that you're paid", "Whenever you have a press release to cite"], "answer": 0, "explanation": "Wikipedia allows the narrow exception of blatant falsehoods. Otherwise, disclose your connection and request changes on the talk page, and don't remove content just because you find it objectionable."},
          term: "Wikipedia, under its conflict of interest rules",
          summary: "If a Wikipedia article about your brand is wrong, disclose your connection and request the change on the talk page; don't edit the article directly.",
          explanation:
            "Wikipedia's conflict of interest guideline, in a nutshell: \"Do not edit Wikipedia in your own interests, or in the interests of your external relationships. Paid editing must be disclosed.\" Editors with a conflict of interest are \"strongly discouraged from editing affected articles directly\".\n\nThe route Wikipedia describes instead:\n\n1. Declare your connection (paid editors must disclose employer, client and affiliation under the Wikimedia terms of use).\n2. Post the requested change on the article's talk page with the edit COI template, with reliable sources.\n3. Let uninvolved editors review and make it.\n\nWikipedia's page for article subjects allows one narrow exception: \"In cases of blatant falsehoods you are permitted to correct the article yourself,\" such as fake death dates. The plain-language guide also says: \"Do not use large language models\" to write your suggestions.",
          whyItMatters:
            "Wikipedia is widely read and reused, so a wrong fact there spreads. A well-sourced, disclosed edit request is the route the community accepts; covert editing can be reverted and damage your brand's reputation on the site.",
          pitfall:
            "Asking for content to be removed because it is unflattering. Wikipedia says you \"should not remove content about you that you simply find objectionable\"; changes must be supported by reliable sources.",
          sources: [WP_COI, WP_PLAIN_COI, WP_ABOUT_YOU],
        },
        {
          id: "c-wikidata",
          quiz: {"kind": "blank", "id": "cq-wikidata", "prompt": "Complete the line from Wikidata's self-promotion page.", "text": "Truth is not the same as ___.", "answers": ["verifiability"], "distractors": ["notability", "popularity", "neutrality"], "explanation": "Wikidata needs statements backed by independent, reliable sources, even when they're true."},
          term: "Wikidata",
          summary: "Wikidata wants items about notable subjects backed by independent sources, not self-written entries, and it doesn't control Google's panels.",
          explanation:
            "Wikidata is structured data that many systems reuse, so a wrong statement on an existing item is worth correcting with a reliable reference. But Wikidata's self-promotion page warns brands off writing about themselves: \"creating an item about yourself is almost always a bad idea\", and \"paid promotion is still self-promotion\".\n\nTwo lines from that page answer the usual marketing reasons:\n\n- \"Wikidata does not control Google's knowledge panels\", so creating an item to fix a panel is not a valid reason.\n- \"Truth is not the same as verifiability.\" Even true statements need independent sources.\n\nIf your brand already has an item with a wrong value, correct it only with an independent, reliable reference, and be open about your connection. Anyone paid to edit must also follow Wikidata's rules on disclosure of paid editing.",
          whyItMatters:
            "Wikidata errors can travel into other databases. Corrections stick when they cite independent sources; self-promotion gets deleted and can get the account blocked.",
          pitfall:
            "Creating a Wikidata item for a brand with no independent coverage, hoping it will create a knowledge panel. Wikidata says such items are likely to be deleted.",
          sources: [WD_SELF_PROMOTION],
        },
        {
          id: "c-knowledge-panel",
          quiz: {"kind": "order", "id": "cq-knowledge-panel", "prompt": "Put the steps for claiming a knowledge panel and suggesting a change in order.", "items": ["Search for the entity and select Claim this knowledge panel", "Verify by signing in to one of the official sites or profiles Google lists", "Select Suggest edits, then Edit next to the item", "Describe what's wrong and add public URLs that support the change"], "explanation": "You claim and verify first; only then, signed in with that account, can you suggest edits backed by public evidence."},
          term: "Claiming a knowledge panel and suggesting edits",
          summary: "If your brand has a Google knowledge panel, you can claim it, then suggest changes to facts with public URLs as evidence.",
          explanation:
            "Google says \"knowledge panels are automatically generated, and information that appears in a knowledge panel comes from various sources across the web.\" If you are the subject or official representative, you can claim the panel:\n\n1. Search for the entity, find the panel and select **Claim this knowledge panel**.\n2. Verify by signing in to one of the official sites or profiles Google lists.\n3. Signed in with that account, select **Suggest edits**, then **Edit** next to the item, describe what's wrong, and add publicly accessible URLs that support the change.\n\nGoogle says it \"reviews feedback from verified users within a few days\" and emails a resolution, though it can take longer. Some things can't be edited directly: descriptions come from other sources, so you ask the source to correct them. And \"not all knowledge panels are claimable as of now\"; anyone can still use the Feedback link on a panel.",
          whyItMatters:
            "Knowledge panel facts are Google's record of your entity. Verified feedback is prioritized over anonymous feedback.",
          pitfall:
            "Expecting Google to create or delete a panel on request. Google says \"our current policy doesn't manually create or delete knowledge panels.\"",
          sources: [KP_ABOUT, KP_GET_VERIFIED, KP_FEEDBACK],
        },
      ],
      check: [
        {
          kind: "passage",
          id: "q-fix-wiki-request",
          prompt: "Larkfield's marketing manager finds the wrong founding year on a Wikipedia article about the shop. Which approach follows Wikipedia's guidance?",
          passages: [
            "Log in with a new account called LarkfieldTeaOfficial, change the year in the article, and add a line about the shop's award-winning blends.",
            "Disclose on the user page that she works for Larkfield, then post an edit request on the article's talk page with the edit COI template, citing an independent source that gives the correct year.",
          ],
          answer: 1,
          explanation:
            "Wikipedia strongly discourages COI editors from editing affected articles directly and asks them to disclose and propose changes on the talk page. Usernames shouldn't be a company's official name, and promotional additions are exactly what the guideline warns against.",
        },
        {
          kind: "choice",
          id: "q-fix-description",
          prompt: "Your knowledge panel's description is wrong. What does Google say to do first?",
          options: [
            "Edit the description directly after claiming the panel",
            "Contact the source of the description and ask them to correct it",
            "Ask Google to write a custom description",
            "Create a Wikidata item with the right description",
          ],
          answer: 1,
          explanation:
            "Google says descriptions come from other data sources and can't be edited; changing the source usually changes the panel. If that fails, submit feedback with strong evidence. Google can remove a wrong description but won't create a custom one.",
        },
        {
          kind: "spot",
          id: "q-fix-spot",
          prompt: "Larkfield's (made-up) correction plan. Which step breaks a platform's rules?",
          language: "text",
          lines: [
            "Update our FAQ page with the new delivery price and date",
            "Edit our Google Business Profile hours while signed in to our account",
            "Suggest an edit to the old directory listing that shows our former address",
            "Create a Wikidata item about Larkfield to fix the knowledge panel",
          ],
          answer: 3,
          explanation:
            "Wikidata's self-promotion page says creating an item about yourself is almost always a bad idea and that Wikidata does not control Google's knowledge panels. The other steps use the routes each site documents.",
        },
      ],
    },
    {
      id: "g-report",
      title: "Report, escalate and stay clean",
      concepts: [
        {
          id: "c-platform-feedback",
          quiz: {"kind": "choice", "id": "cq-platform-feedback", "prompt": "For which product does the card say an IT admin can turn off feedback?", "options": ["Copilot at work or school", "Google AI Overviews", "Perplexity", "ChatGPT"], "answer": 0, "explanation": "Microsoft says that if you're using Copilot at work or school, your IT admin can turn off feedback."},
          term: "In-product feedback",
          summary: "Each platform documents a way to flag a bad answer: Google's thumbs down, ChatGPT's thumbs down, Perplexity's flag icon, and thumbs down in Copilot for Microsoft 365 apps.",
          explanation:
            "Use the platform's own route, with details from your error log:\n\n- **Google AI Overviews**: thumbs down at the bottom of the overview, then **Report a problem**, pick a category and add details. Google notes that \"the feedback you submit includes your most recent search query and its search results.\"\n- **ChatGPT**: OpenAI says to \"click the thumbs down icon below any response to provide feedback\", or select Report for content that may break its terms or the law.\n- **Perplexity**: \"Use the flag icon below the answer to report issues\", or open a support ticket.\n- **Copilot**: Microsoft documents thumbs up and thumbs down on responses for Copilot in Microsoft 365 apps, with a follow-up box for what went wrong. \"If you're using Copilot at work or school, your IT admin can turn off feedback.\"\n\nNone of these pages promises that a single report will change future answers.",
          whyItMatters:
            "Feedback is the documented way to tell each platform an answer is wrong, and it costs a minute. It works best alongside fixing the sources, not instead of it.",
          pitfall:
            "Asking colleagues to mass-report the same answer from many accounts. One clear, specific report with evidence is what these routes ask for.",
          sources: [GOOGLE_AIO_HELP, OPENAI_BEHAVIOR_FEEDBACK, PERPLEXITY_REPORT, MS_COPILOT_FEEDBACK],
        },
        {
          id: "c-personal-data",
          quiz: {"kind": "choice", "id": "cq-personal-data", "prompt": "What does OpenAI say about disputed facts in a request to remove personal data from ChatGPT?", "options": ["It can't independently investigate them, so explain why the information is wrong and include reliable evidence", "It investigates every disputed claim itself", "It approves every request from the person named", "Removal also takes the information off external websites"], "answer": 0, "explanation": "OpenAI says it cannot independently investigate disputed facts, assesses requests case by case, and that removal from ChatGPT doesn't remove information from external websites or search engines."},
          term: "OpenAI's personal-data requests",
          summary: "For inaccurate personal information about a person (such as a founder), OpenAI documents a correction or removal request through its privacy portal.",
          explanation:
            "OpenAI's privacy policy says: if ChatGPT output \"contains factually inaccurate information about you\" and you want a correction or removal, you can submit a request through privacy.openai.com or dsar@openai.com, and \"we will consider your request based on applicable law and the technical capabilities of our models.\"\n\nIts help article describes the removal request (select **Remove personal data from ChatGPT responses** in the privacy portal). Key points:\n\n- It covers information about a person, whether or not they have an account; a legally authorized representative can also apply.\n- \"Requests are assessed on a case-by-case basis\", weighing privacy against things like freedom of expression and the public interest.\n- OpenAI says it \"cannot independently investigate disputed facts\", so explain why the information is wrong and include reliable evidence.\n- Approval isn't guaranteed, and removal from ChatGPT \"does not remove it from external websites or search engines.\"",
          whyItMatters:
            "When an answer gets a founder's or executive's personal details wrong, this is a documented route beyond a thumbs down. It is about people, not about correcting product facts.",
          pitfall:
            "Using a personal-data request to argue about a company's prices or reviews. The route is for personal information about an individual, under privacy law.",
          sources: [OPENAI_PRIVACY, OPENAI_RTBF],
        },
        {
          id: "c-legal-routes",
          quiz: {"kind": "choice", "id": "cq-legal-routes", "prompt": "What does Google advise before you create a legal removal request?", "options": ["Try to flag the content in the relevant product", "Post the problem on a public forum", "Send the request to several Google teams at once", "Wait for the content to disappear from the web"], "answer": 0, "explanation": "Google's legal help page says to try flagging the content in the relevant product first, and to be specific, with URLs, when you do file."},
          term: "Legal and policy reporting routes",
          summary: "Content that may break the law or a platform's terms has its own report forms; both Google and OpenAI point you to in-product reporting first.",
          explanation:
            "Some problems go beyond accuracy: content that may infringe a trademark or copyright, or break a platform's policies.\n\n- **Google**: its legal help page covers content on a Google product \"that you believe violates the law or your rights\". It advises: \"Before creating a request, try to flag the content in the relevant product.\" Include specific URLs and be specific about what is wrong. Google adds that it can restrict access in its own products, but \"that content may still exist elsewhere on the web.\"\n- **OpenAI**: content that may violate its terms or applicable laws can be reported in ChatGPT (thumbs down, then **Safety or legal concern**) or through its content reporting form, with separate forms for copyright and trademark disputes. OpenAI says \"reported domains and other content may be reviewed by OpenAI's Model Quality team, which may apply filters or other mitigations to help prevent ChatGPT from relying on unreliable sources in future responses.\"\n\nThese pages describe how to file, not whether you have a case. Take legal questions to a lawyer.",
          whyItMatters:
            "Knowing the documented routes keeps genuine legal and policy issues out of the general feedback queue, and keeps ordinary accuracy issues out of the legal one.",
          pitfall:
            "Treating a legal form as a faster feedback button. These routes are for content that may break the law or policy, not for answers you'd like worded differently.",
          sources: [GOOGLE_LEGAL, OPENAI_REPORTING],
        },
        {
          id: "c-what-not-to-do",
          quiz: {"kind": "spot", "id": "cq-what-not-to-do", "prompt": "Which step in this (made-up) plan breaks the rules the card describes?", "language": "text", "lines": ["Correct the founding year on our own About page", "Ask five staff to post reviews from their personal accounts", "Disclose our connection when requesting a Wikipedia edit", "Write our Wikipedia edit request ourselves, without an AI tool"], "answer": 1, "explanation": "Google Maps treats content posted from multiple accounts by or at the request of one person as fake engagement and removes it. The other steps follow the card."},
          term: "What not to do",
          summary: "Fake reviews, sock puppet accounts and undisclosed self-editing break platform rules, and fake reviews are banned by the FTC in the US.",
          explanation:
            "When an answer is unfair, it is tempting to flood the web with counter-evidence. Don't:\n\n- **Fake or bought reviews.** The FTC's final rule bans fake reviews and testimonials, including ones that misrepresent who wrote them, \"such as AI-generated fake reviews\", and lets the agency \"seek civil penalties against knowing violators.\" Google Maps says \"fake engagement is not allowed and will be removed\", including \"content that has been posted from multiple accounts by or at the request of one person.\"\n- **Sock puppets.** Wikipedia says \"misuse of multiple accounts is a serious breach of community trust\", which can lead to blocks and bans.\n- **Undisclosed self-editing.** On Wikipedia, paid editing must be disclosed; on Wikidata, self-written items are likely to be deleted.\n- **AI-written edit requests.** Wikipedia's plain COI guide asks you not to use large language models to write your suggestions.",
          whyItMatters:
            "Astroturfing creates new, false records about your brand, and it can be removed, penalized or exposed, turning one wrong answer into a reputation problem.",
          pitfall:
            "Paying an agency to do it for you. Wikidata's line applies everywhere: paid promotion is still self-promotion, and the rules still apply to the brand.",
          sources: [FTC_FAKE_REVIEWS, MAPS_CONTENT_POLICY, WP_SOCKPUPPETRY, WP_COI, WP_PLAIN_COI, WD_SELF_PROMOTION],
        },
      ],
      check: [
        {
          kind: "match",
          id: "q-report-match",
          prompt: "Match each platform to the feedback route it documents.",
          pairs: [
            { term: "Google AI Overviews", definition: "Thumbs down, then Report a problem" },
            { term: "Perplexity", definition: "The flag icon below the answer" },
            { term: "ChatGPT", definition: "Thumbs down below the response, or Report" },
            { term: "Copilot in Microsoft 365 apps", definition: "Thumbs down, unless an IT admin turned feedback off" },
          ],
          explanation:
            "Each route comes from the platform's own help pages. Use the one that matches where you saw the error, with details from your log.",
        },
        {
          kind: "choice",
          id: "q-report-personal",
          prompt: "ChatGPT says Larkfield's founder was convicted of fraud. She wasn't. Which documented route fits best, alongside a thumbs down?",
          options: [
            "Google's knowledge panel feedback",
            "A personal-data request through OpenAI's privacy portal, with evidence that the claim is false",
            "Posting ten five-star reviews to drown it out",
            "Editing her Wikipedia biography without disclosure",
          ],
          answer: 1,
          explanation:
            "OpenAI documents correction and removal requests for inaccurate personal information through its privacy portal. It assesses accuracy from the evidence you provide, so include it. The last two options break the FTC rule and Wikipedia's rules.",
        },
        {
          kind: "choice",
          id: "q-report-fake",
          prompt: "What does the FTC's final rule on reviews prohibit?",
          options: [
            "Replying to negative reviews",
            "Fake reviews and testimonials, including AI-generated fake reviews, and buying or selling them",
            "Asking customers for honest reviews",
            "Displaying reviews on your website",
          ],
          answer: 1,
          explanation:
            "The rule targets reviews that misrepresent who wrote them or their experience, such as AI-generated fake reviews, and prohibits creating, selling or buying them.",
        },
      ],
    },
  ],

  exercise: {
    id: "x-larkfield-delivery",
    title: "Fix a wrong answer about Larkfield",
    brief:
      "Larkfield Tea (made up) made UK delivery free on 1 May 2026. In November, a customer forwards a ChatGPT answer saying delivery costs £4.95, and Google's AI Overview says the same. Trace it, fix it and report it.",
    steps: [
      {
        kind: "choice",
        id: "x-step-first",
        prompt: "What should Larkfield do first?",
        options: [
          "Post a social campaign saying ChatGPT is wrong",
          "Save the prompt, wording, date and link, then open every source each answer cites",
          "Report the answer to Google's legal team",
          "Ask staff to thumbs-down the answer from their own accounts",
        ],
        answer: 1,
        explanation:
          "Capture the evidence and trace the citations before acting. The cited pages tell you whether the error is inherited and where the fix belongs.",
      },
      {
        kind: "spot",
        id: "x-step-source",
        prompt: "These are the pages the answers cite. Which one is carrying the error?",
        language: "text",
        lines: [
          "larkfieldtea.example/delivery: \"UK delivery is free on every order.\"",
          "larkfieldtea.example/faq-2023: \"Delivery is £4.95 on all UK orders.\"",
          "teadirectory.example/larkfield: \"Loose-leaf tea shop. Ships UK-wide.\"",
        ],
        answer: 1,
        explanation:
          "Larkfield's own 2023 FAQ is still live and still states the old charge. The error is outdated and inherited, and the fix is in Larkfield's hands. (All pages are made up.)",
      },
      {
        kind: "order",
        id: "x-step-plan",
        prompt: "Put Larkfield's fix in a sensible order.",
        items: [
          "Update or retire the old FAQ so no live page shows £4.95",
          "Check the Business Profile and directory listings for the same old charge",
          "Send feedback on each wrong answer, with the correct fact and the page that proves it",
          "Add the delivery questions to the prompt set and recheck on schedule",
        ],
        explanation:
          "Fix the source you control first, then the other listings, then tell each platform, then monitor until the answer changes across several runs.",
      },
      {
        kind: "blank",
        id: "x-step-aio",
        prompt: "Complete the steps for Google AI Overviews feedback.",
        text: "Click the thumbs ___ icon, then ___ a problem, choose a category and add details.",
        answers: ["down", "Report"],
        distractors: ["up", "Share", "Delete"],
        explanation:
          "Google's help page: for an unhelpful or inaccurate overview, click thumbs down, then Report a problem, pick the category and add details (recommended).",
      },
      {
        kind: "passage",
        id: "x-step-report",
        prompt: "Which report text is more useful to a reviewer?",
        passages: [
          "Your AI is wrong about us again. Please fix it.",
          "Prompt: \"Larkfield Tea delivery cost\" (4 Nov 2026). The answer says UK delivery is £4.95. Since 1 May 2026 it has been free: larkfieldtea.example/delivery. The cited faq-2023 page was outdated and has now been updated.",
        ],
        answer: 1,
        explanation:
          "The second gives the query, the wrong statement, the correct fact, proof, and what was fixed: the details Perplexity and others ask for.",
      },
    ],
    debrief:
      "The answer engines weren't inventing anything: they were faithfully repeating a page Larkfield forgot to update. Most brand errors work like this. Fix the record at its source, tell each platform with evidence, and rerun the same questions until the right answer holds.",
  },

  example: {
    title: "Google: descriptions follow their sources",
    context:
      "The \"Update a description\" section of Google's Knowledge Panel Help page \"Submit feedback on content about you\", fetched on 4 November 2026.",
    excerpt: {
      kind: "quote",
      text: "Descriptions come from various data sources and can't be edited. To update descriptions, you can contact the source of the information and ask them to correct it. Changing the source of the information usually causes the information in the knowledge panel to change as well. If you contacted the source but couldn't get a description changed, you can submit feedback on the knowledge panel. Explain that you contacted the source and provide strong evidence for why the description is inaccurate. If the evidence is strong, we can remove the description but we can't create a custom description.",
    },
    points: [
      {
        label: "Fix the source",
        text: "Google's first instruction is to go to the source, not to Google. That is the inherited-error fix from this lesson, stated by the platform.",
      },
      {
        label: "Feedback is the fallback",
        text: "Feedback comes second, after you have tried the source, and it needs strong evidence. Keep a record of the contact you made.",
      },
      {
        label: "Removal, not rewriting",
        text: "Google can remove a wrong description but \"can't create a custom description\". Platforms correct records; they don't let you write them.",
      },
      {
        label: "The same pattern elsewhere",
        text: "AI answers that cite pages behave the same way: change what the source says, and the answer has something better to repeat.",
      },
    ],
    source: KP_FEEDBACK,
  },

  audit: [
    {
      kind: "choice",
      id: "a-hallucination",
      prompt: "What does OpenAI call a model producing responses that are not factually accurate, such as fabricated citations?",
      options: ["Grounding", "A hallucination", "Query fan-out", "A knowledge cutoff"],
      answer: 1,
      explanation: "OpenAI's help page says this phenomenon is often referred to as a hallucination.",
    },
    {
      kind: "choice",
      id: "a-first-step",
      prompt: "An AI answer about your brand cites three pages. What should you check first?",
      options: [
        "Whether the platform has a legal form",
        "Which cited page contains the wrong statement",
        "How many reviews you have",
        "Whether your brand has a Wikidata item",
      ],
      answer: 1,
      explanation: "The page that says the wrong thing is usually where the fix belongs.",
    },
    {
      kind: "match",
      id: "a-match-fix",
      prompt: "Match each source of an error to the route this lesson recommends.",
      pairs: [
        { term: "Your own outdated FAQ page", definition: "Update or retire it yourself" },
        { term: "A Wikipedia article about your company", definition: "Disclosed edit request on the talk page" },
        { term: "Someone else's Google Business Profile listing", definition: "Suggest an edit" },
        { term: "A knowledge panel description", definition: "Ask the source to correct it, then send feedback with evidence" },
      ],
      explanation: "Each site documents its own route. Use it, with evidence.",
    },
    {
      kind: "blank",
      id: "a-blank-wikipedia",
      prompt: "Complete Wikipedia's conflict of interest guideline in a nutshell.",
      text: "Do not edit Wikipedia in your own interests, or in the interests of your external relationships. Paid editing must be ___.",
      answers: ["disclosed"],
      distractors: ["avoided", "approved", "anonymous"],
      explanation: "Paid editing is allowed only with disclosure, and COI editors should propose changes on talk pages rather than edit directly.",
    },
    {
      kind: "choice",
      id: "a-wikidata-panel",
      prompt: "Why isn't creating a Wikidata item about your brand a good way to fix a knowledge panel?",
      options: [
        "Wikidata items can't contain company names",
        "Wikidata says it does not control Google's knowledge panels, and self-written items are likely to be deleted",
        "Google blocks Wikidata",
        "Wikidata only accepts items in German",
      ],
      answer: 1,
      explanation: "Wikidata's self-promotion page says so directly, and asks for independent, reliable sources for any item.",
    },
    {
      kind: "order",
      id: "a-order-panel",
      prompt: "Put the knowledge panel correction steps in order.",
      items: [
        "Select Claim this knowledge panel",
        "Verify through one of the official sites or profiles listed",
        "Select Suggest edits while signed in to the verified account",
        "Describe what's wrong and add public URLs as evidence",
      ],
      explanation: "Claim, verify, then suggest edits with evidence. Google reviews verified feedback and emails a resolution.",
    },
    {
      kind: "choice",
      id: "a-openai-request",
      prompt: "What does OpenAI say about requests to remove inaccurate personal information from ChatGPT responses?",
      options: [
        "They are always approved within 24 hours",
        "They are assessed case by case, and OpenAI can't independently investigate disputed facts, so you should provide evidence",
        "They also remove the information from search engines",
        "Only account holders can make them",
      ],
      answer: 1,
      explanation:
        "Requests are weighed case by case, accuracy is judged on the evidence you send, removal from ChatGPT doesn't affect other sites, and you don't need an account.",
    },
    {
      kind: "passage",
      id: "a-passage-response",
      prompt: "An AI answer says your shop has closed. Which response is better?",
      passages: [
        "Correct the old 'closing down sale' page on your site, check your listings, send feedback on the answer with your log details, and add the question to your prompt set.",
        "Ask ten friends to post reviews saying the shop is open, and edit the Wikipedia article to add a note.",
      ],
      answer: 0,
      explanation:
        "The first fixes the source and uses documented routes. The second breaks the FTC rule on fake reviews, Google's fake engagement policy and Wikipedia's conflict of interest guideline.",
    },
    {
      kind: "spot",
      id: "a-spot-astroturf",
      prompt: "Which action is astroturfing?",
      language: "text",
      lines: [
        "Thumbs down on a wrong AI Overview, with details",
        "Disclosed edit request on a Wikipedia talk page",
        "Posting positive reviews from several accounts run by one employee",
        "Updating the delivery page with today's price",
      ],
      answer: 2,
      explanation:
        "Google Maps calls content posted from multiple accounts by or at the request of one person fake engagement, and removes it.",
    },
    {
      kind: "choice",
      id: "a-monitor",
      prompt: "When can you close an error in your log?",
      options: [
        "As soon as you've sent feedback",
        "After one correct answer on one platform",
        "When the error has stopped appearing across several scheduled runs and phrasings",
        "When the platform emails you",
      ],
      answer: 2,
      explanation: "Answers vary from run to run, so only repeated rechecks show a real fix. Reopen the row if the error returns.",
    },
  ],
};

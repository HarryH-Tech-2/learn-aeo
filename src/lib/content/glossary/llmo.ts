import type { GlossaryTerm } from "@/lib/glossary-types";

export const term: GlossaryTerm = {
  slug: "llmo",
  term: "LLM optimization",
  guide: "aeo-vs-seo-vs-geo",
  question: "What is LLMO (LLM optimization)?",
  aka: ["LLMO", "Large language model optimization"],
  definition:
    "LLMO is a vendor term for optimizing your content and website so large language model tools mention and cite you more often in their answers.",
  explanation:
    "LLMO is one of several overlapping labels for the same broad job. Conductor's glossary describes it as optimizing content and websites to increase visibility and citations in large language model outputs, and calls it \"synonymous with Generative Engine Optimization (GEO)\", with more emphasis on the underlying models than on search engine algorithms.\n\nThere is no agreed definition, and no standards body or AI company defines the term. Different vendors use LLMO, GEO and AEO to mean the same thing, or to carve out slightly different scopes. When an agency or tool pitches you \"LLMO\", ask what exactly it measures and changes.\n\nThe engines' own documentation points back to familiar ground. Google says there are \"no additional requirements to appear in AI Overviews or AI Mode, nor other special optimizations necessary\" beyond being indexed and eligible for a snippet. Treat LLMO as a name for a goal, not a separate technique.",
  sections: [
    {
      heading: "LLMO metrics: what to measure",
      body:
        "No AI company publishes an LLMO score, so build one from numbers you can check. Two kinds are worth tracking.\n\n**From a fixed prompt set.** Pick 20 to 50 questions your buyers ask, run them in the same tools on set dates, and log every answer. Then work out three ratios:\n\n- **Mention rate**: answers that name your brand ÷ answers checked.\n- **Citation rate**: answers that link to your site as a source ÷ answers checked.\n- **[AI share of voice](/glossary/ai-share-of-voice)**: your brand mentions ÷ mentions of every brand you track.\n\n**From the platforms themselves.** Google Search Console has a Generative AI performance report showing how your site does in Google's generative AI features. Bing Webmaster Tools' AI Performance report shows citations, cited pages and grounding queries across Copilot and Bing's AI summaries. In Google Analytics, the default AI Assistant channel counts visits from tools such as ChatGPT, Gemini and Copilot. Google says that channel excludes AI Overviews and AI Mode, which count as Organic Search.\n\nState the method next to every figure (prompts, tools, dates), and only compare a number with the same setup over time. The course's [measuring AI visibility](/lessons/measuring-ai-visibility) lesson sets this up step by step.",
    },
    {
      heading: "An LLMO strategy that holds up",
      body:
        "Because the engines say they need nothing special, a sound LLMO strategy is mostly SEO done carefully, in this order:\n\n1. **Be eligible.** Google's bar for AI Overviews and AI Mode is a page that is indexed and eligible for a snippet. Fix indexing problems first.\n2. **Let the search bots in.** OpenAI says OAI-SearchBot surfaces sites in ChatGPT search, and Perplexity says PerplexityBot surfaces and links sites in its results. Training crawlers such as GPTBot are a separate choice. Check yours with the [AI crawler checker](/tools/ai-crawler-checker).\n3. **Write passages that can be quoted.** Answer each likely question in a sentence or two that names the subject (see [passage ranking](/glossary/passage-ranking)).\n4. **Get mentioned elsewhere.** Answers draw on reviews, lists and forums as well as your own site (see [brand mentions](/glossary/brand-mention)).\n5. **Measure on a fixed prompt set**, using the metrics above, and change one thing at a time.\n\nFor how LLMO, GEO and AEO compare, read [AEO vs SEO vs GEO](/blog/aeo-vs-seo-vs-geo).",
    },
    {
      heading: "Hiring an LLMO service: questions to ask",
      body:
        "An agency selling \"LLMO\" or a tool selling an \"LLM visibility score\" is selling its own method, so ask it to show its working:\n\n- Which prompts, tools and dates does the score come from, and can you see the logged answers?\n- Does it count mentions, citations or both, and with which formula?\n- What is the baseline, and how will you know whether a change caused any movement?\n- What will it change on your site, and is any of it different from good SEO?\n\nBe wary of guaranteed citations. Google says no special optimizations are necessary to appear in its AI features, and no vendor controls what an AI tool writes.",
    },
  ],
  related: ["geo", "aeo", "brand-mention", "ai-share-of-voice"],
  sources: [
    {
      title: "Generative AI performance report (Search)",
      publisher: "Search Console Help",
      url: "https://support.google.com/webmasters/answer/16984139",
      accessed: "2026-10-30",
    },
    {
      title: "Introducing AI Performance in Bing Webmaster Tools Public Preview",
      publisher: "Bing Webmaster Blog",
      url: "https://blogs.bing.com/webmaster/2026/2/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview/",
      date: "2026-02-10",
      dateKind: "published",
      accessed: "2026-10-30",
    },
    {
      title: "Default channel group",
      publisher: "Google Analytics Help",
      url: "https://support.google.com/analytics/answer/9756891",
      accessed: "2026-10-30",
    },
    {
      title: "Overview of OpenAI Crawlers",
      publisher: "OpenAI",
      url: "https://developers.openai.com/api/docs/bots",
      accessed: "2026-10-28",
    },
    {
      title: "Perplexity Crawlers",
      publisher: "Perplexity",
      url: "https://docs.perplexity.ai/docs/resources/perplexity-crawlers",
      accessed: "2026-10-28",
    },
    {
      title: "LLMO (Large Language Model Optimization) | Glossary",
      publisher: "Conductor",
      url: "https://www.conductor.com/academy/glossary/llmo-large-language-model-optimization/",
      accessed: "2026-10-28",
    },
    {
      title: "AI features and your website",
      publisher: "Google Search Central",
      url: "https://developers.google.com/search/docs/appearance/ai-features",
      accessed: "2026-10-28",
      date: "2025-12-10",
      dateKind: "updated",
    },
  ],
};

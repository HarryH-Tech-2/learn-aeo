import type { GlossaryTerm } from "@/lib/glossary-types";

export const term: GlossaryTerm = {
  slug: "aeo",
  term: "Answer engine optimization",
  guide: "what-is-aeo",
  question: "AEO definition: answer engine optimization",
  aka: ["AEO"],
  definition:
    "AEO is the practice of making your content easy for AI answer engines to find, understand and cite when they write a response to a question.",
  explanation:
    "AEO is industry jargon, not a standard. The term is used by SEO platforms such as Conductor, whose glossary frames the goal this way: \"Unlike traditional SEO, which prioritizes ranking positions, AEO prioritizes becoming the cited source\". In practice, the win you are chasing is a link next to an AI answer rather than a blue link on page one.\n\nThe engines themselves don't ask for anything exotic. Google says that to appear as a supporting link in AI Overviews or AI Mode, \"a page must be indexed and eligible to be shown in Google Search with a snippet\", and that there are no special optimizations necessary. Perplexity says \"Each answer includes numbered citations linking to the original sources\".\n\nSo for you, AEO is mostly SEO with a different scoreboard: keep pages crawlable and indexed, write passages that answer a question in a sentence or two, and measure citations and mentions in AI answers, not only rankings and clicks.",
  related: ["geo", "llmo", "answer-engine", "citation", "ai-share-of-voice"],
  lesson: "how-answer-engines-choose-sources",
  sources: [
    {
      title: "Answer Engine Optimization (AEO) | Glossary",
      publisher: "Conductor",
      url: "https://www.conductor.com/academy/glossary/answer-engine-optimization/",
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
    {
      title: "How does Perplexity work?",
      publisher: "Perplexity",
      url: "https://www.perplexity.ai/help-center/en/articles/10352895-how-does-perplexity-work",
      accessed: "2026-10-28",
    },
  ],
};

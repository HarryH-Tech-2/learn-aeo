import type { GlossaryTerm } from "@/lib/glossary-types";

export const term: GlossaryTerm = {
  slug: "answer-engine",
  term: "Answer engine",
  question: "What is an answer engine?",
  definition:
    "Answer engines are search products that read web pages for the user and write a direct response, with links to the sources they drew on.",
  explanation:
    "A classic search engine hands you a list of links and leaves the reading to you. An answer engine does the reading itself, writes a response, and attaches citations to the pages it used.\n\nThe main ones work in a similar way. Perplexity says it searches the internet in real time and that \"Each answer includes numbered citations linking to the original sources.\" Microsoft says \"Copilot Search cites its sources prominently, so you know exactly where the information came from\". Google's AI Overviews and AI Mode show supporting links with the AI response. Claude's web search tool ends with \"a final response with cited sources\".\n\nFor a marketer, this changes the scoreboard. Your visibility depends on whether your page is one of the few sources attached to the answer, or whether your brand is named in the text. Users may never scroll a list of results, so a ranking report alone no longer tells you the whole story.",
  related: ["aeo", "ai-overviews", "ai-mode", "citation", "grounding", "zero-click-search"],
  lesson: "how-answer-engines-choose-sources",
  sources: [
    {
      title: "How does Perplexity work?",
      publisher: "Perplexity",
      url: "https://www.perplexity.ai/help-center/en/articles/10352895-how-does-perplexity-work",
      accessed: "2026-10-28",
    },
    {
      title: "Introducing Copilot Search in Bing",
      publisher: "Microsoft Bing Blogs",
      url: "https://blogs.bing.com/search/2025/4/Introducing-Copilot-Search-in-Bing/",
      accessed: "2026-10-28",
      date: "2025-04-04",
      dateKind: "published",
    },
    {
      title: "Web search tool",
      publisher: "Anthropic",
      url: "https://platform.claude.com/docs/en/agents-and-tools/tool-use/web-search-tool",
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

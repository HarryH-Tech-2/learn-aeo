import type { GlossaryTerm } from "@/lib/glossary-types";

export const term: GlossaryTerm = {
  slug: "citation",
  term: "Citation",
  question: "What is a citation in AI search?",
  aka: ["AI citation"],
  definition:
    "Citations are links an AI answer attaches to a specific source page, showing which page supports each part of the response.",
  explanation:
    "A citation is the AI-search version of a ranking: your page shown as evidence next to the answer. The engines build them in. OpenAI's web search returns a `url_citation` annotation that holds \"the URL, title and location of the cited source\", and its docs say \"inline citations must be made clearly visible and clickable in your user interface.\" Claude's web search citations include \"Up to 150 characters of the cited content\", so a citation usually points at a sentence or two, not a whole page. Perplexity says \"Each answer includes numbered citations linking to the original sources.\"\n\nTwo things are easy to miss. First, being read is not the same as being cited: OpenAI notes that \"The number of sources is often greater than the number of citations.\" Second, a citation is different from a brand mention. Your brand can be named in the answer while the citation goes to a review site or a competitor.\n\nTrack citations by page, and write key claims as standalone sentences that still make sense when quoted alone.",
  related: ["brand-mention", "grounding", "ai-share-of-voice", "passage-ranking", "answer-engine"],
  lesson: "how-answer-engines-choose-sources",
  sources: [
    {
      title: "Web search (API guide)",
      publisher: "OpenAI",
      url: "https://developers.openai.com/api/docs/guides/tools-web-search",
      accessed: "2026-10-28",
    },
    {
      title: "Web search tool",
      publisher: "Anthropic",
      url: "https://platform.claude.com/docs/en/agents-and-tools/tool-use/web-search-tool",
      accessed: "2026-10-28",
    },
    {
      title: "How does Perplexity work?",
      publisher: "Perplexity",
      url: "https://www.perplexity.ai/help-center/en/articles/10352895-how-does-perplexity-work",
      accessed: "2026-10-28",
    },
  ],
};

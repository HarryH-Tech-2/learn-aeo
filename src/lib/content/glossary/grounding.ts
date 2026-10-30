import type { GlossaryTerm } from "@/lib/glossary-types";

export const term: GlossaryTerm = {
  slug: "grounding",
  term: "Grounding",
  question: "What is grounding in AI search?",
  definition:
    "Grounding is connecting an AI model's answer to retrieved sources, such as live search results, so its claims can be traced back to specific pages.",
  explanation:
    "Grounding is how an answer engine ties what it writes to evidence. Google's Gemini docs describe a Grounding with Google Search feature that lets the model draw on search results, and the response carries metadata linking each part of the answer to its source: `groundingSupports` \"provides specific mappings that link the generated content to its relevant citation source in the chunks.\"\n\nGrounding is not automatic. Anthropic's docs say \"Claude determines when to search based on the prompt\", and that it searches when a request depends on information that is \"current, changing, or outside its training data\". OpenAI's docs say the model \"can choose to search the web or not based on the content of the input prompt.\"\n\nFor you, that means grounded answers are where citations happen. Questions about prices, policies, recent releases and specific products are the ones most likely to trigger a search, so those are the pages most worth keeping accurate, crawlable and easy to quote. A broad, stable question may be answered from training data alone, with no links for anyone.",
  related: ["rag", "citation", "query-fan-out", "answer-engine"],
  lesson: "how-answer-engines-choose-sources",
  sources: [
    {
      title: "Grounding with Google Search",
      publisher: "Google Cloud",
      url: "https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/grounding/grounding-with-google-search",
      accessed: "2026-10-28",
      date: "2026-10-28",
      dateKind: "updated",
    },
    {
      title: "Web search tool",
      publisher: "Anthropic",
      url: "https://platform.claude.com/docs/en/agents-and-tools/tool-use/web-search-tool",
      accessed: "2026-10-28",
    },
    {
      title: "Web search (API guide)",
      publisher: "OpenAI",
      url: "https://developers.openai.com/api/docs/guides/tools-web-search",
      accessed: "2026-10-28",
    },
  ],
};

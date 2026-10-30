import type { GlossaryTerm } from "@/lib/glossary-types";

export const term: GlossaryTerm = {
  slug: "brand-mention",
  term: "Brand mention",
  question: "What is a brand mention?",
  definition:
    "A brand mention is your brand named in the text of an AI-generated answer, whether or not the answer links to your website.",
  explanation:
    "A brand mention and a citation are different results, and you should track them separately. A citation is a link to a source page attached to the answer: OpenAI's API records it as a `url_citation`, and Claude's web search attaches a `web_search_result_location` to the cited text. A mention is just your name in the answer. The supporting link may go to a review site, a directory or a competitor's comparison page instead.\n\nMentions shape what people think of you, and some AI visibility tools count them as their core metric. Superlines, for example, calculates share of voice from brand mention counts across a set of AI prompts. But a mention with no citation sends no click, and you can't see which source put your name there.\n\nIn practice, log each answer you check in two columns: named or not, and cited or not. A brand that is often named but rarely cited may be relying on what other sites say about it.",
  related: ["citation", "ai-share-of-voice", "llmo", "zero-click-search"],
  lesson: "measuring-ai-visibility",
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
      title: "What is Share of Voice in AI Search? | AI Search Glossary",
      publisher: "Superlines",
      url: "https://www.superlines.io/glossary/share-of-voice/",
      accessed: "2026-10-28",
    },
  ],
};

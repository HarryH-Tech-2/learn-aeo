import type { GlossaryTerm } from "@/lib/glossary-types";

export const term: GlossaryTerm = {
  slug: "llms-txt",
  term: "llms.txt",
  definition:
    "llms.txt is a proposed markdown file, suggested by Jeremy Howard, that gives AI agents a short, curated guide to a site's most useful content.",
  explanation:
    "llms.txt is a proposal, not a standard. Its author, Jeremy Howard, writes: \"We propose adding a /llms.txt markdown file to websites to provide LLM-friendly content.\" The proposal was published in September 2024 and last modified in August 2026.\n\nThe format is simple. The only required part is \"An H1 with the name of the project or site.\" A blockquote summary, more detail, and H2 sections listing links with short notes can follow. A section called \"Optional\" holds links an agent can skip when it needs a shorter context. The file can sit at the site root or under a path such as `/docs/`.\n\nIt does not control access. The proposal says \"robots.txt and llms.txt have different purposes\": robots.txt says which automated access is acceptable, while llms.txt is context that is \"used on demand\" when an agent is helping a user.\n\nSupport varies. OpenAI's and Perplexity's own docs sites publish an llms.txt, but none of the crawler pages from OpenAI, Anthropic or Perplexity says their bots read one. Google says you \"don't need to create new machine readable files, AI text files, or markup\" to appear in its AI features. Get crawler access and rendering right first.",
  example: {
    label: "A minimal llms.txt in the proposed format (example.com is a placeholder)",
    language: "markdown",
    body: "# Example Garden Supply\n\n> Online garden supplies shop. Delivery is free on orders over $50.\n\n## Help\n\n- [Delivery and returns](https://www.example.com/help/delivery.md): times, costs and returns policy\n\n## Optional\n\n- [Company history](https://www.example.com/about.md)",
  },
  related: ["robots-txt", "answer-engine", "grounding", "rag"],
  lesson: "make-your-site-reachable-by-ai",
  sources: [
    {
      title: "The /llms.txt file",
      publisher: "llmstxt.org (Jeremy Howard)",
      url: "https://llmstxt.org/",
      date: "2026-08-10",
      dateKind: "updated",
      accessed: "2026-10-28",
    },
    {
      title: "AI features and your website",
      publisher: "Google Search Central",
      url: "https://developers.google.com/search/docs/appearance/ai-features",
      date: "2025-12-10",
      dateKind: "updated",
      accessed: "2026-10-28",
    },
    {
      title: "Overview of OpenAI Crawlers",
      publisher: "OpenAI",
      url: "https://developers.openai.com/api/docs/bots",
      accessed: "2026-10-28",
    },
    {
      title: "Does Anthropic crawl data from the web, and how can site owners block the crawler?",
      publisher: "Claude Help Center",
      url: "https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler",
      date: "2026-04-07",
      dateKind: "updated",
      accessed: "2026-10-28",
    },
    {
      title: "Perplexity Crawlers",
      publisher: "Perplexity",
      url: "https://docs.perplexity.ai/docs/resources/perplexity-crawlers",
      accessed: "2026-10-28",
    },
  ],
};

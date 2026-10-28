import type { GlossaryTerm } from "@/lib/glossary-types";

export const term: GlossaryTerm = {
  slug: "ai-share-of-voice",
  term: "AI share of voice",
  aka: ["AI SOV", "Share of voice in AI search"],
  definition:
    "AI share of voice is a vendor-defined metric comparing how often your brand appears in AI-generated answers with how often competitors appear, across a set of prompts.",
  explanation:
    "AI share of voice borrows an old advertising idea and applies it to AI answers. It is not a standard metric: AI visibility tool vendors define and calculate it, and they don't all do it the same way.\n\nOne vendor, llmrefs, defines it as measuring \"how often a brand appears in relevant AI-generated answers compared with competitors\", and describes two calculations: the share of sampled answers that include your brand, and your brand's mentions divided by all tracked brands' mentions. Superlines uses the second: your brand mentions divided by total brand mentions, times 100, across ChatGPT, Gemini, Perplexity and Copilot.\n\nThose give different numbers from the same answers. So when you report AI share of voice, state which tool, which prompts, which engines, which competitors and which formula you used, and compare a figure only with the same setup over time. Keep citations separate from mentions too: a high share of voice built on mentions alone may send little traffic.",
  related: ["brand-mention", "citation", "aeo", "geo"],
  lesson: "measuring-ai-visibility",
  sources: [
    {
      title: "What Is AI Share of Voice: The Complete Guide for Brands",
      publisher: "llmrefs",
      url: "https://llmrefs.com/blog/what-is-ai-share-of-voice",
      accessed: "2026-10-28",
      date: "2026-10-12",
      dateKind: "updated",
    },
    {
      title: "What is Share of Voice in AI Search? | AI Search Glossary",
      publisher: "Superlines",
      url: "https://www.superlines.io/glossary/share-of-voice/",
      accessed: "2026-10-28",
    },
  ],
};

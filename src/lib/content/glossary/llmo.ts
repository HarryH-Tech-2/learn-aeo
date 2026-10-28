import type { GlossaryTerm } from "@/lib/glossary-types";

export const term: GlossaryTerm = {
  slug: "llmo",
  term: "LLM optimization",
  aka: ["LLMO", "Large language model optimization"],
  definition:
    "LLMO is a vendor term for optimizing your content and website so large language model tools mention and cite you more often in their answers.",
  explanation:
    "LLMO is one of several overlapping labels for the same broad job. Conductor's glossary describes it as optimizing content and websites to increase visibility and citations in large language model outputs, and calls it \"synonymous with Generative Engine Optimization (GEO)\", with more emphasis on the underlying models than on search engine algorithms.\n\nThere is no agreed definition, and no standards body or AI company defines the term. Different vendors use LLMO, GEO and AEO to mean the same thing, or to carve out slightly different scopes. When an agency or tool pitches you \"LLMO\", ask what exactly it measures and changes.\n\nThe engines' own documentation points back to familiar ground. Google says there are \"no additional requirements to appear in AI Overviews or AI Mode, nor other special optimizations necessary\" beyond being indexed and eligible for a snippet. Treat LLMO as a name for a goal, not a separate technique.",
  related: ["geo", "aeo", "brand-mention", "ai-share-of-voice"],
  sources: [
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

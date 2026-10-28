import type { GlossaryTerm } from "@/lib/glossary-types";

export const term: GlossaryTerm = {
  slug: "geo",
  term: "Generative engine optimization",
  aka: ["GEO"],
  definition:
    "GEO is the practice of improving how visible your content is inside the answers that generative AI search engines write, a term introduced in a 2023 research paper.",
  explanation:
    "GEO started as an academic term. The paper \"GEO: Generative Engine Optimization\" by Aggarwal and colleagues (first posted to arXiv in November 2023, accepted to KDD 2024) argued that creators have little control over how generative engines use their content, and proposed GEO as a framework for improving and measuring visibility in those answers. The authors built a benchmark of queries, GEO-bench, and reported that their methods could boost visibility by up to 40% in generative engine responses, with results that varied by domain.\n\nSince then, the label has been picked up by agencies and tool vendors, and its meaning has loosened. Some use GEO and AEO interchangeably; others draw lines between them. There is no standard body behind any of these definitions, so treat GEO as a contested, vendor-shaped term.\n\nFor you, the useful takeaway from the paper is the framing, not the 40% figure: visibility in an AI answer is something you can measure on a fixed set of queries and test changes against. The figure comes from the authors' own benchmark, not from live tests on Google or ChatGPT.",
  related: ["aeo", "llmo", "answer-engine", "ai-share-of-voice", "citation"],
  sources: [
    {
      title: "GEO: Generative Engine Optimization (Aggarwal et al.)",
      publisher: "arXiv",
      url: "https://arxiv.org/abs/2311.09735",
      accessed: "2026-10-28",
      date: "2023-11-16",
      dateKind: "published",
    },
    {
      title: "LLMO (Large Language Model Optimization) | Glossary",
      publisher: "Conductor",
      url: "https://www.conductor.com/academy/glossary/llmo-large-language-model-optimization/",
      accessed: "2026-10-28",
    },
  ],
};

import type { GlossaryTerm } from "@/lib/glossary-types";

export const term: GlossaryTerm = {
  slug: "e-e-a-t",
  term: "E-E-A-T",
  aka: ["Experience, Expertise, Authoritativeness, Trustworthiness", "E-A-T"],
  definition:
    "E-E-A-T stands for experience, expertise, authoritativeness and trustworthiness: the qualities Google's systems and search quality raters look for in reliable, helpful content.",
  explanation:
    "E-E-A-T is a framework for judging content quality, not a single score. Google describes it as \"experience, expertise, authoritativeness, and trustworthiness\" and says \"Of these aspects, trust is most important.\"\n\nTwo points to keep straight:\n\n- **It is not a ranking factor on its own.** Google says \"E-E-A-T itself isn't a specific ranking factor\", but its systems use a mix of factors that identify content with good E-E-A-T.\n- **Raters do not rank pages.** Google's search quality raters are trained to assess E-E-A-T and give feedback on whether results are good. Google says \"Search raters have no control over how pages rank.\"\n\nThe first E was added in December 2022: \"Now to better assess our results, E-A-T is gaining an E: experience.\" Google's example of experience is content produced \"with actual use of a product, having actually visited a place\".\n\nGoogle gives more weight to strong E-E-A-T for \"Your Money or Your Life\" topics, those that could significantly affect health, financial stability, safety or well-being. For a marketer, that means showing who wrote a page, what first-hand experience is behind it, and why a reader should trust it.",
  related: ["citation", "brand-mention", "knowledge-graph", "entity", "aeo"],
  sources: [
    {
      title: "Creating helpful, reliable, people-first content",
      publisher: "Google Search Central",
      url: "https://developers.google.com/search/docs/fundamentals/creating-helpful-content",
      date: "2026-10-05",
      dateKind: "updated",
      accessed: "2026-10-28",
    },
    {
      title: "Our latest update to the quality rater guidelines: E-A-T gets an extra E for Experience",
      publisher: "Google Search Central Blog",
      url: "https://developers.google.com/search/blog/2022/12/google-raters-guidelines-e-e-a-t",
      date: "2022-12-15",
      dateKind: "published",
      accessed: "2026-10-28",
    },
  ],
};

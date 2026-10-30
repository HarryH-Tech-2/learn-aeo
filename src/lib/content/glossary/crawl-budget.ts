import type { GlossaryTerm } from "@/lib/glossary-types";

export const term: GlossaryTerm = {
  slug: "crawl-budget",
  term: "Crawl budget",
  question: "What is crawl budget?",
  definition:
    "Crawl budget is, in Google's definition, the set of URLs that Google can and wants to crawl on a site, set by its crawl capacity limit and crawl demand.",
  explanation:
    "Most sites do not need to manage crawl budget. Google's guide is aimed at large sites (roughly 1 million+ unique pages changing weekly, or 10,000+ changing daily) and sites with many URLs in Search Console's \"Discovered - currently not indexed\" status. Google calls those figures a rough estimate, and says that if your pages are crawled the day they are published, \"you don't need to read this guide.\"\n\nGoogle defines the budget from two parts: the **crawl capacity limit** (how much load Google can place on your server without overwhelming it) and **crawl demand** (how much Google wants to crawl, based on things like popularity and staleness).\n\nOn a large site, Google lists common waste to fix:\n\n- duplicate URLs and low-value variants, such as differently sorted versions of the same page\n- removed pages that do not return a 404 or 410\n- soft 404 errors\n- long redirect chains\n- slow pages and missing HTTP caching\n\nGoogle also notes that `noindex` does not save budget: Google still requests those pages before dropping them. To keep low-value URLs from being crawled at all, the guide points to robots.txt.",
  related: ["robots-txt", "indexnow", "user-agent"],
  lesson: "make-your-site-reachable-by-ai",
  sources: [
    {
      title: "Optimize your crawl budget",
      publisher: "Google Crawling Infrastructure",
      url: "https://developers.google.com/crawling/docs/crawl-budget",
      date: "2026-07-22",
      dateKind: "updated",
      accessed: "2026-10-28",
    },
  ],
};

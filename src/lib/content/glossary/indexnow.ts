import type { GlossaryTerm } from "@/lib/glossary-types";

export const term: GlossaryTerm = {
  slug: "indexnow",
  term: "IndexNow",
  definition:
    "IndexNow is a protocol for notifying participating search engines that URLs on your site changed, verified by a key file you host, so they can be crawled sooner.",
  explanation:
    "IndexNow lets you push a change instead of waiting for a crawler to come back. When a price, policy or product page changes, you send the URL and your key to a participating engine.\n\nHow it works, per the IndexNow docs:\n\n- You prove ownership by hosting \"a UTF-8 encoded text key file {your-key}.txt\" at your site's root. The key is 8 to 128 characters.\n- One POST can carry up to 10,000 URLs.\n- Engines that adopt the protocol agree that \"submitted URLs will be automatically shared with all other participating search engines\", so one ping reaches all of them.\n\nThe participant list names Bing, Yandex, Seznam, Naver, Yep, the Internet Archive and Amazonbot. Google is not on it.\n\nKeep expectations realistic. The docs say an HTTP 200 \"only indicates that the search engine has received your URL\", and the FAQ says \"Submitting a URL does not guarantee immediate indexing.\" Engines still decide what to crawl and index.",
  related: ["crawl-budget", "robots-txt", "answer-engine"],
  lesson: "make-your-site-reachable-by-ai",
  sources: [
    {
      title: "IndexNow documentation",
      publisher: "IndexNow.org",
      url: "https://www.indexnow.org/documentation",
      accessed: "2026-10-28",
    },
    {
      title: "IndexNow FAQ",
      publisher: "IndexNow.org",
      url: "https://www.indexnow.org/faq",
      accessed: "2026-10-28",
    },
    {
      title: "Participating search engines (searchengines.json)",
      publisher: "IndexNow.org",
      url: "https://www.indexnow.org/searchengines.json",
      accessed: "2026-10-28",
    },
  ],
};

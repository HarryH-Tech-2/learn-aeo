import type { BlogPost } from "@/lib/blog-posts";

// Every claim below traces to a source opened on 2026-10-28.
// OpenAI's help center and openai.com pages returned HTTP 403 to the fetcher
// that day, so they are not cited and nothing here relies on them.

export const post: BlogPost = {
  slug: "how-chatgpt-chooses-sources",
  title: "How ChatGPT chooses which sources to cite",
  excerpt:
    "What OpenAI actually documents about ChatGPT search, its three crawlers and robots.txt, what it leaves out, and the steps that follow.",
  quickAnswer:
    "OpenAI does not publish a ranking algorithm for ChatGPT search. What it does document is the gate: sites that block OAI-SearchBot in robots.txt will not be shown in ChatGPT search answers, so allowing that crawler, in robots.txt and at its published IP ranges, is what OpenAI itself recommends.",
  date: "October 28, 2026",
  publishedAt: "2026-10-28",
  category: "Platforms",
  image: "/blog/how-chatgpt-chooses-sources.webp",
  imageAlt:
    "Abstract brand illustration titled \"How ChatGPT chooses which sources to cite\", with simple shapes linking a web page to a cited answer.",
  relatedSlugs: ["get-cited-in-google-ai-overviews", "llms-txt-explained", "what-is-aeo"],
  faqs: [
    {
      question: "Does blocking GPTBot remove my site from ChatGPT search?",
      answer:
        "Not according to OpenAI's crawler documentation. GPTBot is the training crawler, and OpenAI describes each setting as independent. Search visibility is controlled by OAI-SearchBot, so you can allow OAI-SearchBot and disallow GPTBot.",
    },
    {
      question: "How long does a robots.txt change take to affect ChatGPT search?",
      answer:
        "OpenAI says it can take about 24 hours from a robots.txt update for its systems to adjust.",
    },
    {
      question: "Can I pay or submit my site to be cited by ChatGPT?",
      answer:
        "The OpenAI pages cited in this post describe no submission form, paid placement for citations or ranking factors. What they document is crawler access, so the controllable step is letting OAI-SearchBot reach your pages.",
    },
    {
      question: "Does ChatGPT-User decide whether I appear in ChatGPT search?",
      answer:
        "No. OpenAI states that ChatGPT-User is not used to determine whether content may appear in Search. It handles user-initiated actions, and OpenAI notes robots.txt rules may not apply to it.",
    },
  ],
  content: `## Does OpenAI explain how ChatGPT picks its sources?

Only partly. OpenAI documents which crawler decides whether your site can appear in ChatGPT search, and how to allow or block it. None of the OpenAI pages cited in this post describes how ChatGPT ranks, weights or chooses between eligible pages. So anyone who tells you the exact formula is guessing.

What you can work with is the part OpenAI does publish: the crawlers, the robots.txt rules that govern them, and, for developers, a description of how its web search tool behaves in the API. This post covers each, then the practical steps that follow.

## Which OpenAI crawlers matter, and what does each do?

OpenAI's [crawler overview](https://developers.openai.com/api/docs/bots) lists separate user agents with separate jobs. The three that matter for most sites:

| User agent | What OpenAI says it is for | Affects ChatGPT search? |
| --- | --- | --- |
| [OAI-SearchBot](/glossary/oai-searchbot) | Surfacing websites in ChatGPT's search features | Yes |
| [GPTBot](/glossary/gptbot) | Crawling content that may be used to train its generative AI foundation models | No, it is the training opt-out |
| ChatGPT-User | User-initiated actions in ChatGPT, Custom GPTs and GPT Actions | No |

The page also lists OAI-AdsBot, which checks landing pages submitted as ads in ChatGPT and visits only those pages.

OpenAI describes each setting as independent. You can allow OAI-SearchBot so you can appear in search while disallowing GPTBot to opt out of training. If you allow both, OpenAI says it may use the results of one crawl for both purposes to avoid crawling twice.

## Which crawler decides whether you can be cited?

OAI-SearchBot. OpenAI's wording is direct: "Sites that are opted out of OAI-SearchBot will not be shown in ChatGPT search answers". The same page says such sites can still show up as navigational links, and it gives publishers one recommendation: "we recommend allowing OAI-SearchBot in your site's robots.txt file" and allowing requests from OpenAI's published IP ranges.

Two common mix-ups follow from the table above:

- **Blocking GPTBot is not blocking search.** GPTBot is the training crawler. Disallowing it, in OpenAI's words, "indicates a site's content should not be used in training generative AI foundation models."
- **ChatGPT-User is not the search gate.** OpenAI states that "ChatGPT-User is not used to determine whether content may appear in Search." It fetches pages when a user's action calls for it, does not crawl the web automatically, and OpenAI notes that robots.txt rules may not apply to it.

Changes are not instant. OpenAI says "it can take ~24 hours from a site's robots.txt update for our systems to adjust."

## What does the API web search guide reveal?

OpenAI's [web search guide](https://developers.openai.com/api/docs/guides/tools-web-search) describes the search tool developers call through its API. It is documentation for builders, not a description of the ChatGPT app, so treat it as a view of how OpenAI's search tooling is designed rather than a statement about ChatGPT's ranking. Three points are useful:

1. **Search is optional for the model.** The guide says "the model can choose to search the web or not based on the content of the input prompt." No search means no web citations for that answer.
2. **Consulted is not the same as cited.** Developers can request a full list of the URLs the model consulted, and the guide notes this list is usually longer than the inline citations. Being retrieved does not guarantee being cited.
3. **Citations are meant to be visible.** The guide requires that inline citations "must be made clearly visible and clickable in your user interface" when web results are shown to end users.

With reasoning models, the guide says the model can run several searches, open pages and search within them before deciding to stop. That fits the general retrieval pattern covered in the free lesson on [how answer engines choose sources](/lessons/how-answer-engines-choose-sources): retrieve candidates, ground the answer in a few passages, cite those.

## What does OpenAI not document?

Be clear with yourself and your stakeholders about the gaps. The pages cited here do not describe:

- a ranking algorithm or list of ranking factors for ChatGPT search
- how many sources an answer will cite, or why one eligible page is cited over another
- a way to submit pages or request citations

Anything presented as "the ChatGPT ranking factors" is inference from outside, not OpenAI documentation. Treat it as a hypothesis to test, not a rule.

## What should you do, based on the docs?

The steps below are the ones that follow from what OpenAI publishes. None of them guarantees a citation; they remove the reasons you could not be cited.

### 1. Allow OAI-SearchBot in robots.txt

If you want to appear in ChatGPT search but keep your content out of training, a [robots.txt](/glossary/robots-txt) file like this expresses both choices:

\`\`\`robots
User-agent: OAI-SearchBot
Allow: /

User-agent: GPTBot
Disallow: /
\`\`\`

Under the robots.txt standard, RFC 9309, "Crawlers MUST use case-insensitive matching to find the group that matches the product token." If no group names the crawler, it follows your \`User-agent: *\` group. So a blanket \`Disallow: /\` under \`*\` also blocks OAI-SearchBot unless you give it its own group.

### 2. Check what sits in front of robots.txt

RFC 9309 also says robots.txt rules "are not a form of access authorization." A firewall, bot-management setting or CDN rule can block a crawler that your robots.txt allows. OpenAI publishes IP ranges for each crawler and recommends allowing OAI-SearchBot's (\`openai.com/searchbot.json\`), so check that your security settings do. You can test the user-agent side with the [AI crawler checker](/tools/ai-crawler-checker).

### 3. Give the change a day, then verify

Because OpenAI says robots.txt changes can take about 24 hours to apply, check your server logs for OAI-SearchBot requests after that window rather than right away. OpenAI notes that when its crawlers fetch robots.txt, it may add a "robots.txt" marker to the user-agent string, which helps you spot those requests.

### 4. Make the page worth citing

Once access is settled, the remaining lever is the page itself. OpenAI does not publish content guidance for ChatGPT search, so this is practice, not a documented rule: put a direct answer near the top, keep each section focused on one question, and state facts in plain text a model can lift as a passage. The lesson on [how answer engines choose sources](/lessons/how-answer-engines-choose-sources) and the [citation](/glossary/citation) and [grounding](/glossary/grounding) glossary entries explain why passage-level clarity matters.

## The short version

OpenAI documents the gate, not the ranking. Allow OAI-SearchBot, decide separately about GPTBot, make sure nothing in front of your server blocks the crawler you allowed, and wait a day before checking. Past that point, nobody outside OpenAI can tell you exactly why one page is cited over another, and you should be wary of anyone who claims to.
`,
  sources: [
    {
      title: "Overview of OpenAI Crawlers",
      publisher: "OpenAI",
      url: "https://developers.openai.com/api/docs/bots",
      accessed: "2026-10-28",
    },
    {
      title: "Web search (API guide)",
      publisher: "OpenAI",
      url: "https://developers.openai.com/api/docs/guides/tools-web-search",
      accessed: "2026-10-28",
    },
    {
      title: "RFC 9309: Robots Exclusion Protocol",
      publisher: "RFC Editor (IETF)",
      url: "https://www.rfc-editor.org/rfc/rfc9309.html",
      date: "2022-09",
      dateKind: "published",
      accessed: "2026-10-28",
    },
  ],
};

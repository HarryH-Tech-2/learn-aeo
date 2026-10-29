import type { BlogPost } from "@/lib/blog-posts";

export const post: BlogPost = {
  slug: "llms-txt-explained",
  title: "llms.txt explained",
  excerpt:
    "What the llms.txt proposal is, what it is not, which AI operators document using it, and how to write one for your own site.",
  quickAnswer:
    "llms.txt is a proposed markdown file, published by Jeremy Howard in September 2024, that gives AI agents a short guide to a site and links to its key pages. It does not control crawling the way robots.txt does, and as of October 28, 2026, the Google, OpenAI and Anthropic crawler and AI-feature pages we checked don't document reading other sites' llms.txt files.",
  date: "October 28, 2026",
  publishedAt: "2026-10-28",
  category: "Technical",
  image: "/blog/llms-txt-explained.webp",
  imageAlt: "Abstract brand illustration titled \"llms.txt explained\"",
  relatedSlugs: ["how-chatgpt-chooses-sources", "get-cited-in-google-ai-overviews", "what-is-aeo"],
  faqs: [
    {
      question: "Does llms.txt replace robots.txt?",
      answer:
        "No. The proposal itself says \"robots.txt and llms.txt have different purposes.\" robots.txt is where you allow or disallow crawlers. llms.txt is a reading guide and grants or refuses nothing.",
    },
    {
      question: "Will an llms.txt file get me cited in AI answers?",
      answer:
        "No source we checked says so. Google's AI features guide says you don't need AI text files to appear, and the OpenAI and Anthropic crawler pages we checked don't mention reading llms.txt.",
    },
    {
      question: "Where does the llms.txt file go?",
      answer:
        "The proposal puts it at /llms.txt in the root of your site, or under a subpath such as /docs/llms.txt, where it covers the pages under that path.",
    },
    {
      question: "Is llms-full.txt part of the standard?",
      answer:
        "llms.txt is a proposal, not a standard, and version 2 of the proposal page doesn't mention llms-full.txt. Treat it as outside the spec.",
    },
  ],
  content: `## What llms.txt is

[llms.txt](/glossary/llms-txt) is a proposed markdown file that sits at the root of your site and gives AI agents a short, curated guide to your content. It was proposed by Jeremy Howard on llmstxt.org, first published on September 3, 2024. The page was last modified on August 10, 2026, and describes itself as "v2 of the proposal."

The proposal opens with one sentence: "We propose adding a /llms.txt markdown file to websites to provide LLM-friendly content."

The idea is that a language model working on a user's question doesn't need your whole site. It needs a summary and a list of the pages that matter. The proposal says this information is "used on demand, when an agent needs information about a topic while assisting a user."

## The file format

The proposal defines a simple markdown structure, in this order:

1. **An H1 with the name of the project or site.** This is the only required part.
2. **A blockquote** with a short summary of the project.
3. **Optional detail**: paragraphs or lists with more context.
4. **Sections headed by H2s**, each holding a list of links. Each link can carry a short note after a colon.
5. **An "Optional" section.** In the spec's words, it "is used, by convention, for secondary information", meaning links an agent "can skip when a shorter context is needed."

The file lives at \`/llms.txt\`. The proposal also allows it under a subpath, such as \`/docs/llms.txt\`, covering the pages below that path.

### Markdown versions of your pages

The proposal also suggests that pages agents may need should "provide a clean markdown version of those pages at the same URL as the original page", with \`.md\` added. For URLs without a file name, it says to "append index.html.md or index.md instead."

It adds that a link with \`rel="alternate" type="text/markdown"\` can point to the markdown version, as an HTML \`<link>\` element or an HTTP \`Link:\` header.

If you have read about a file called llms-full.txt, note that version 2 of the proposal page doesn't mention it, so it isn't part of what the spec describes.

## What llms.txt is not

llms.txt is not robots.txt, and it is not an access control. The proposal says it plainly: "robots.txt and llms.txt have different purposes."

- **It doesn't allow or block crawlers.** That is the job of [robots.txt](/glossary/robots-txt). Anthropic's help page, for example, tells you to block its crawler with a robots.txt rule naming the [user agent](/glossary/user-agent), such as [ClaudeBot](/glossary/claudebot), and says nothing about llms.txt.
- **It doesn't hide anything.** Leaving a page out of llms.txt doesn't stop any crawler from fetching it.
- **It isn't a sitemap replacement.** It is a short, human-curated guide, not a full list of URLs.
- **It isn't a standard.** It is a proposal on llmstxt.org, now in its second version.

## Which AI engines use it today

As of October 28, 2026, none of the Google, OpenAI or Anthropic pages we checked documents reading other sites' llms.txt files to crawl, rank or cite them. That doesn't prove they never read one. It means there is no documented support you can rely on.

Here is what each says:

- **Google.** Its guide to AI features in Search doesn't mention llms.txt, and it says: "You don't need to create new machine readable files, AI text files, or markup to appear in these features." That covers [AI Overviews](/glossary/ai-overviews) and [AI Mode](/glossary/ai-mode).
- **OpenAI.** Its crawler overview describes [OAI-SearchBot](/glossary/oai-searchbot), OAI-AdsBot, [GPTBot](/glossary/gptbot) and ChatGPT-User. It doesn't say any of them read llms.txt. The page does link to OpenAI's own llms.txt as an index of its documentation.
- **Anthropic.** Its help page on crawling describes ClaudeBot, Claude-User and Claude-SearchBot, and explains how to control them with robots.txt. It doesn't mention llms.txt.

There is a pattern here. Developer-focused companies publish llms.txt files for their own documentation. llmstxt.org lists OpenAI, Anthropic and Google's Gemini API docs among its examples. Publishing a file for your docs is not the same as your crawler reading other people's files, and none of the pages above claims the second.

## Should you write one?

Write one if it is cheap for you and your site has content an agent would use on demand, such as documentation, product specs or help pages. Don't write one expecting it to change whether you are crawled, indexed or cited, because none of the Google, OpenAI or Anthropic pages we checked documents that.

Do the basics first. A crawler blocked by your robots.txt or your CDN gains nothing from a good llms.txt. You can check what your robots.txt says to AI bots with the [AI crawler checker](/tools/ai-crawler-checker).

## How to write an llms.txt file

1. **Start with an H1** naming your site or product.
2. **Write a one- or two-sentence blockquote** that says what the site is and who it serves. Lead with facts an agent might need, such as what you sell and where.
3. **Group your key pages under H2 sections**, such as Docs, Products or Help. Keep each list short and give each link a plain note.
4. **Put nice-to-have pages under "## Optional."**
5. **Publish it at /llms.txt** and update it when your key pages change.

If you'd rather not write the markdown by hand, the [llms.txt generator](/tools/llms-txt-generator) builds the structure for you.

## A real example and a made-up one

FastHTML's documentation is one of the examples linked from llmstxt.org. Its file at fastht.ml/docs/llms.txt starts with \`# FastHTML\`, followed by a short summary of the library and a line that reads "Things to remember when writing FastHTML apps:". Its H2 sections are Docs, API, Examples and Optional, so it uses every part of the format above.

Here is a short made-up example for a marketing site, so you can see the shape. It is not a real site.

\`\`\`markdown
# Example Analytics

> Example Analytics is a web analytics tool for small online stores. Plans start with a free tier.

## Product

- [Features](https://www.example.com/features.md): what the tool tracks and reports
- [Pricing](https://www.example.com/pricing.md): plans, limits and billing

## Help

- [Install guide](https://www.example.com/help/install.md): adding the tracking script to your store

## Optional

- [Changelog](https://www.example.com/changelog.md): release notes
\`\`\`

Every line follows the proposal: one H1, a blockquote, H2 sections of links with notes, and an Optional section at the end.`,
  sources: [
    {
      title: "The /llms.txt file, v2",
      publisher: "llmstxt.org (Jeremy Howard)",
      url: "https://llmstxt.org/",
      date: "2026-08-10",
      dateKind: "updated",
      accessed: "2026-10-28",
    },
    {
      title: "FastHTML llms.txt",
      publisher: "FastHTML",
      url: "https://www.fastht.ml/docs/llms.txt",
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
      publisher: "Claude Help Center (Anthropic)",
      url: "https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler",
      accessed: "2026-10-28",
    },
  ],
};

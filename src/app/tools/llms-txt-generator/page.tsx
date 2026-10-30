import type { Metadata } from "next";
import Link from "next/link";
import ToolPage, { type ToolFaq } from "@/components/tools/ToolPage";
import LlmsGenerator from "./LlmsGenerator";
import { pageMetadata } from "@/lib/seo";
import { TOOLS } from "@/lib/tools";

const TOOL = TOOLS.find((t) => t.slug === "llms-txt-generator")!;

export const metadata: Metadata = pageMetadata({
  title: "llms.txt Generator: build your file free",
  description:
    "Fill in a short form and get an llms.txt file in the llmstxt.org format, ready to copy or download. Free, runs in your browser.",
  path: "/tools/llms-txt-generator",
});

// Facts from https://llmstxt.org/ (published 2024-09-03, modified 2026-08-10) and Google's "AI
// features and your website" (updated 2025-12-10), both checked 2026-10-28.
const FAQS: ToolFaq[] = [
  {
    question: "What is llms.txt?",
    answer:
      "A proposal, published by Jeremy Howard on llmstxt.org in September 2024, for a markdown file at /llms.txt that gives language models a short summary of a site and links to its most useful pages.",
  },
  {
    question: "Do Google, ChatGPT or Perplexity read it?",
    answer:
      "None of them documents doing so. Google's guidance on AI features says you don't need to create new machine readable files, AI text files, or markup to appear in them. Treat llms.txt as a low-cost extra, not a ranking lever.",
  },
  {
    question: "Where do I put the file?",
    answer:
      "At the root of your site, as /llms.txt. The proposal also allows a file at a subpath, such as /docs/llms.txt, which covers the pages under that path.",
  },
  {
    question: "What goes in the Optional section?",
    answer:
      "Secondary links. By the proposal's convention, a tool that needs a shorter context can skip everything listed under Optional.",
  },
  {
    question: "Is my draft sent anywhere?",
    answer: "No. The generator runs in your browser and keeps your draft in this browser's local storage only.",
  },
];

export default function LlmsTxtGeneratorPage() {
  return (
    <ToolPage
      tool={TOOL}
      faqs={FAQS}
      intro={
        <>
          <p>
            Fill in your site&rsquo;s name, a one-paragraph summary and the pages that matter, and get an llms.txt file in the format the
            llmstxt.org proposal describes. Copy it or download it, then upload it to the root of your site.
          </p>
          <p className="text-base text-sand-400">
            No major AI search tool documents reading llms.txt yet, so do this after the basics: crawlers allowed (try the{" "}
            <Link href="/tools/ai-crawler-checker" className="text-cyan-400 underline underline-offset-2">AI Crawler Checker</Link>) and
            pages that answer questions clearly.
          </p>
        </>
      }
      howItWorks={
        <>
          <p>
            The file follows the order in the{" "}
            <a href="https://llmstxt.org/" className="text-cyan-400 underline underline-offset-2">llmstxt.org</a> proposal: an H1 with the
            name (the only required part), a blockquote summary, optional detail paragraphs, then H2 sections that list links as{" "}
            <code>- [name](url): notes</code>. Links under &ldquo;Optional&rdquo; go last.
          </p>
          <p>
            Empty sections and links are left out, line breaks in one-line fields are joined, and square brackets in link titles are
            escaped so the markdown stays valid. Everything happens in your browser.
          </p>
          <p>
            Lesson 2,{" "}
            <Link href="/lessons/make-your-site-reachable-by-ai" className="text-cyan-400 underline underline-offset-2">The Crawl Docks</Link>,
            covers llms.txt alongside robots.txt, sitemaps and IndexNow.
          </p>
        </>
      }
    >
      <LlmsGenerator />
    </ToolPage>
  );
}

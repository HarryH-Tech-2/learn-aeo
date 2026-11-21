import type { Metadata } from "next";
import Link from "next/link";
import ToolPage, { type ToolFaq } from "@/components/tools/ToolPage";
import CitabilityChecker from "./CitabilityChecker";
import { pageMetadata } from "@/lib/seo";
import { TOOLS } from "@/lib/tools";

const TOOL = TOOLS.find((t) => t.slug === "citability-checker")!;

export const metadata: Metadata = pageMetadata({
  title: "Citability Checker: is your page easy to quote?",
  description:
    "Enter a URL to see how easily AI answers could quote your page: answer-first openings, question headings, self-contained passages, sources and dates. Free.",
  path: "/tools/citability-checker",
});

const FAQS: ToolFaq[] = [
  {
    question: "What does citability mean?",
    answer:
      "How easily a passage from your page can be lifted into an AI answer and still make sense: it answers a question directly, names its subject, gives specifics and shows where its facts come from.",
  },
  {
    question: "Is the score what ChatGPT or Google uses?",
    answer:
      "No. No AI company publishes a citability score. The checks are this course's checklist for writing passages that can be quoted, so treat the score as a to-do list, not a ranking.",
  },
  {
    question: "Why does it say my page has almost no text?",
    answer:
      "The checker reads the HTML your server sends, without running JavaScript. If your content only appears after scripts run, crawlers that read raw HTML may see the same near-empty page.",
  },
  {
    question: "Which part of the page does it read?",
    answer: "The main content: the <main> or <article> element if the page has one, otherwise the body, with navigation, headers, footers and forms left out.",
  },
  {
    question: "Is the page I check stored?",
    answer: "No. The page is fetched once to build the report, and neither the page nor the address is kept.",
  },
];

export default function CitabilityCheckerPage() {
  return (
    <ToolPage
      tool={TOOL}
      faqs={FAQS}
      intro={
        <>
          <p>
            Enter the address of a page and see how easily an AI answer could quote it: whether it opens with the answer, uses
            question-shaped headings, keeps passages short and self-contained, and backs its claims with sources and dates.
          </p>
          <p className="text-base text-sand-400">
            Check crawler access first with the{" "}
            <Link href="/tools/ai-crawler-checker" className="text-cyan-400 underline underline-offset-2">AI Crawler Checker</Link>: a
            perfectly written page can&rsquo;t be cited if the bots can&rsquo;t reach it.
          </p>
        </>
      }
      howItWorks={
        <>
          <p>
            The tool fetches the page once, reads the HTML as served (no JavaScript), and keeps the main content. It then runs 14 checks:
            whether the page loads and is indexable, how much text there is, the main heading, the length of the opening passage,
            question-shaped subheadings, paragraph length, paragraphs that open with words like &ldquo;this&rdquo; or &ldquo;it&rdquo;,
            lists and tables, numbers and dates, links to other sites, a machine-readable date, a named author, JSON-LD and the title and
            description.
          </p>
          <p>
            Each check passes (2 points), needs improving (1) or needs fixing (0), and the score is the share of points out of 100. The
            thresholds, such as an opening passage under about 60 words, are rules of thumb from the course, not published limits.
          </p>
          <p>
            Lesson 3,{" "}
            <Link href="/lessons/writing-citable-content" className="text-cyan-400 underline underline-offset-2">Writing citable content</Link>,
            covers answer-first writing, question headings and passage-level clarity in depth.
          </p>
        </>
      }
    >
      <CitabilityChecker />
    </ToolPage>
  );
}

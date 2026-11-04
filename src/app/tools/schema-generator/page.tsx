import type { Metadata } from "next";
import Link from "next/link";
import ToolPage, { type ToolFaq } from "@/components/tools/ToolPage";
import SchemaGenerator from "./SchemaGenerator";
import { pageMetadata } from "@/lib/seo";
import { TOOLS } from "@/lib/tools";

const TOOL = TOOLS.find((t) => t.slug === "schema-generator")!;

export const metadata: Metadata = pageMetadata({
  title: "Schema Generator: free JSON-LD builder",
  description:
    "Build Organization, Article or Product JSON-LD from a short form, with hints that catch common mistakes. Copy the snippet and paste it into your page. Free.",
  path: "/tools/schema-generator",
});

// Google facts from Search Central's Article and Product snippet guides, checked 2026-11-04.
const FAQS: ToolFaq[] = [
  {
    question: "What is JSON-LD?",
    answer:
      "A way of writing schema.org structured data as a small block of JSON inside a script tag. It tells search engines what a page is about (an organization, an article, a product) without changing what visitors see.",
  },
  {
    question: "Does schema help with AI search?",
    answer:
      "It helps machines understand who you are and what the page describes, and it keeps facts like prices and dates unambiguous. Google says there are no special requirements to appear in its AI features, so treat schema as good hygiene, not a shortcut to citations.",
  },
  {
    question: "Which properties does Google need?",
    answer:
      "Article has no required properties; Google recommends author, datePublished, dateModified, headline and image. Product snippets need a name plus at least one of review, aggregateRating or offers.",
  },
  {
    question: "Where do I put the snippet?",
    answer: "Anywhere in the page's HTML, usually the head. Each page should describe itself: Article schema on the article, Product schema on the product page.",
  },
  {
    question: "Is anything I type sent anywhere?",
    answer: "No. The generator runs entirely in your browser.",
  },
];

export default function SchemaGeneratorPage() {
  return (
    <ToolPage
      tool={TOOL}
      faqs={FAQS}
      intro={
        <>
          <p>
            Pick Organization, Article or Product, fill in what you know, and copy a ready-to-paste JSON-LD snippet. Hints flag what&rsquo;s
            missing or malformed as you type: relative URLs, dates in the wrong format, a product with no price or ratings.
          </p>
          <p className="text-base text-sand-400">
            Then check the page itself with the{" "}
            <Link href="/tools/citability-checker" className="text-cyan-400 underline underline-offset-2">Citability Checker</Link>, which
            also looks for JSON-LD.
          </p>
        </>
      }
      howItWorks={
        <>
          <p>
            Each field maps to a schema.org property. Empty fields are left out, one-per-line fields become arrays (sameAs, image), and the
            author, publisher, brand, offer and rating become nested objects of the right type. A closing script tag inside your text is
            escaped, so the snippet can&rsquo;t break your page.
          </p>
          <p>
            Hints come in three kinds: things to fix (the markup would be invalid or misleading), things Google recommends for that type, and
            tips.
          </p>
          <p>
            Lesson 4,{" "}
            <Link href="/lessons/structured-data-and-entities" className="text-cyan-400 underline underline-offset-2">The Schema Works</Link>,
            covers structured data, entities and sameAs in depth.
          </p>
        </>
      }
    >
      <SchemaGenerator />
    </ToolPage>
  );
}

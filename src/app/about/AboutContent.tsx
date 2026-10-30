import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { LESSON_CATALOG, lessonPath } from "@/lib/lesson-catalog";
import { SITE } from "@/lib/site";
import JsonLd from "@/components/JsonLd";
import { AUTHOR } from "@/lib/author";
import { personSchema } from "@/lib/schema";

const principles = [
  {
    title: "Sourced",
    description:
      "Every concept lists where it comes from, and the source is the vendor's own documentation wherever one exists. If a claim cannot be traced to a page you can open, it is not in the lesson.",
  },
  {
    title: "Hands-on",
    description:
      "You do not just read about robots.txt or passage structure. Each lesson has checks as you go, hands-on exercises, and an audit at the end.",
  },
  {
    title: "Honest about the unknowns",
    description:
      "ChatGPT, Perplexity and Google's AI search change quickly, and their makers say only so much. Where the documentation hedges, the lesson says so rather than filling the gap with guesses.",
  },
];

const SOURCE_EXAMPLES = [
  "Google Search Central",
  "OpenAI",
  "Anthropic",
  "Perplexity",
  "Microsoft Bing",
  "the IETF's robots.txt standard (RFC 9309)",
  "and research papers on arXiv",
];

export default function AboutContent() {
  const live = LESSON_CATALOG.filter((l) => l.status === "live");
  return (
    <main className="grain-overlay">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-36 pb-16 overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <p className="enter-up font-body text-xs uppercase tracking-[0.3em] text-cyan-500 mb-6">About {SITE.name}</p>
          <h1 className="enter-up font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-gradient-gold mb-6">
            A course in answer engine optimization
          </h1>
          <p className="enter-up font-body text-lg md:text-xl text-sand-300 leading-relaxed max-w-2xl mx-auto">
            {SITE.name} teaches marketers who already know SEO how ChatGPT, Perplexity and Google AI Overviews pick their sources, and what to
            change so your pages are among them.
          </p>
        </div>
      </section>

      {/* What it is */}
      <section className="relative py-16">
        <div className="max-w-3xl mx-auto px-6 lg:px-8 space-y-6 font-body text-sand-400 leading-relaxed">
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-sand-100">What the course is</h2>
          <p>
            Ask ChatGPT, Perplexity or Google&rsquo;s AI Overviews a question and you get an answer the engine has
            written, with a few sources, instead of a list of links. Getting cited in those answers takes some of
            what you already do for search, and some things you probably don&rsquo;t do yet.
          </p>
          <p>
            The course is laid out as a City of Answers with {LESSON_CATALOG.length} districts, one lesson each. You
            start at {LESSON_CATALOG[0].district}, where you see how an answer gets built, and work through crawling,
            writing, structured data, authority, the individual platforms and measurement, to{" "}
            {LESSON_CATALOG[LESSON_CATALOG.length - 1].district}, where you plan an AEO program of your own.
          </p>
          <p>
            {live.length === LESSON_CATALOG.length
              ? `All ${live.length} lessons are live: `
              : `${live.length} of the ${LESSON_CATALOG.length} lessons are live now: `}
            {live.map((l, i) => (
              <span key={l.id}>
                <Link href={lessonPath(l.id)} className="text-cyan-500 underline underline-offset-4 hover:text-gold-400">
                  {l.title}
                </Link>
                {i < live.length - 1 ? ", " : "."}
              </span>
            ))}{" "}
            {live.length < LESSON_CATALOG.length && "The rest are coming soon. "}Lesson 1 is free once you sign in.
          </p>
        </div>
      </section>

      {/* How lessons are sourced */}
      <section className="relative py-16">
        <div className="max-w-3xl mx-auto px-6 lg:px-8 space-y-6 font-body text-sand-400 leading-relaxed">
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-sand-100">How the lessons are sourced</h2>
          <p>
            Each concept in a lesson ends with its sources, linked to the original page, with the date it was
            published or last updated, or the date we last checked it. Sources in the live lessons include {SOURCE_EXAMPLES.join(", ")}.
          </p>
          <p>
            When a vendor documents how its own crawler or AI search tool behaves, that is the source we use.
          </p>
          <p>
            Spotted something out of date or wrong?{" "}
            <Link href="/contact" className="text-cyan-500 underline underline-offset-4 hover:text-gold-400">
              Tell us
            </Link>{" "}
            and we will check it against the source.
          </p>
        </div>
      </section>

      {/* Who writes it: the author every byline links to (src/lib/author.ts) */}
      <section id="author" aria-labelledby="author-heading" className="relative py-16 scroll-mt-28">
        <JsonLd data={personSchema()} />
        <div className="max-w-3xl mx-auto px-6 lg:px-8 space-y-6 font-body text-sand-400 leading-relaxed">
          <h2 id="author-heading" className="font-display text-3xl md:text-4xl font-semibold text-sand-100">
            Who writes {SITE.name}
          </h2>
          <p>{AUTHOR.bio}</p>
          <p>
            <a
              href={AUTHOR.linkedIn}
              target="_blank"
              rel="me noopener noreferrer"
              className="text-cyan-500 underline underline-offset-4 hover:text-gold-400"
            >
              {AUTHOR.name} on LinkedIn
            </a>
          </p>
        </div>
      </section>

      {/* Principles */}
      <section className="relative py-16">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-gradient-gold mb-10 text-center">
            How we teach
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {principles.map((p) => (
              <div
                key={p.title}
                className="relative rounded-2xl border border-gold-700/20 bg-obsidian-light/40 p-8 backdrop-blur-sm"
              >
                <h3 className="font-display text-xl font-semibold text-gold-400 mb-3">{p.title}</h3>
                <p className="font-body text-sm text-sand-400 leading-relaxed">{p.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-20">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center space-y-4">
          <Link href="/get-started" className="btn-primary inline-flex justify-center text-base py-4 px-8">
            Start lesson 1 free
          </Link>
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 font-body text-sm text-sand-400 hover:text-gold-400 transition-colors"
            >
              <span>Back to home</span>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

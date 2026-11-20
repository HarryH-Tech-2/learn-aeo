import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import type { CSSProperties } from "react";
import { LESSON_CATALOG, TOTAL_MINUTES, courseParts, lessonPath } from "@/lib/lesson-catalog";
import { LESSONS, isLive } from "@/lib/lessons";
import InView from "@/components/InView";
import { reveal } from "@/components/reveal";
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
  "IETF robots.txt standard (RFC 9309)",
  "Research papers on arXiv",
];

const STEPS = [
  { step: "Learn", body: "Short concept cards. Each one lists the sources it relies on and the date they were checked." },
  { step: "Check", body: "A quick question on every concept, and a short check after each set, so you know it went in." },
  { step: "Practice", body: "A hands-on exercise on real material: fix a robots.txt file, rewrite a passage, read a server log." },
  { step: "Audit", body: "A final audit with no hints. Pass it to complete the lesson and move toward your certificate." },
];

/** Counted from the lesson content itself, so the page never claims more than the course holds. */
function courseStats() {
  const live = LESSONS.filter(isLive);
  const concepts = live.flatMap((l) => l.content.groups.flatMap((g) => g.concepts));
  const sources = new Set(concepts.flatMap((c) => c.sources.map((src) => src.url)));
  const questions = live.reduce(
    (n, l) =>
      n +
      l.content.groups.reduce((m, g) => m + g.check.length + g.concepts.filter((c) => c.quiz).length, 0) +
      l.content.exercise.steps.length +
      l.content.audit.length,
    0,
  );
  const hours = Math.round((TOTAL_MINUTES / 60) * 2) / 2;
  return [
    { value: String(LESSON_CATALOG.length), label: "lessons" },
    { value: `${hours}`, label: "hours of material" },
    { value: String(concepts.length), label: "concepts explained" },
    { value: String(questions), label: "questions and exercises" },
    { value: String(sources.size), label: "sources cited" },
  ];
}

export default function AboutContent() {
  const live = LESSON_CATALOG.filter((l) => l.status === "live");
  const stats = courseStats();
  const parts = courseParts();
  const initials = AUTHOR.name.split(" ").map((w) => w[0]).join("");
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
        <dl className="enter-up about-stats max-w-5xl mx-auto mt-14" style={{ "--enter-delay": "0.15s" } as CSSProperties}>
          {stats.map((s) => (
            <div key={s.label} className="about-stat">
              <dt className="font-body text-xs uppercase tracking-[0.18em] text-sand-400 order-2">{s.label}</dt>
              <dd className="font-display text-4xl md:text-5xl font-semibold text-gradient-gold order-1">{s.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* What it is */}
      <section className="relative py-16">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 space-y-6 font-body text-sand-400 leading-relaxed">
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
              ? `All ${live.length} lessons are live. `
              : `${live.length} of the ${LESSON_CATALOG.length} lessons are live now. The rest are coming soon. `}
            Lesson 1 is free once you sign in.
          </p>
        </div>
      </section>

      {/* Roadmap: the parts and their lessons, from the catalog */}
      <section aria-labelledby="roadmap-heading" className="relative py-16">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <h2 id="roadmap-heading" className="font-display text-3xl md:text-4xl font-semibold text-sand-100 mb-3 text-center">
            The path through the course
          </h2>
          <p className="font-body text-sand-400 text-center max-w-2xl mx-auto mb-12">
            {parts.length} parts, in the order the work happens on a real site. Take them in order, or jump to the one you need.
          </p>
          <InView>
            <ol className="about-roadmap">
              {parts.map(({ part, number, lessons }, i) => (
                <li key={part.title} className="about-part reveal" style={reveal(i * 0.08)}>
                  <span aria-hidden="true" className="about-part-num">{number}</span>
                  <div className="min-w-0">
                    <h3 className="font-display text-xl md:text-2xl font-semibold text-sand-100">{part.title}</h3>
                    <p className="font-body text-sm text-sand-400 mt-1 mb-4">{part.summary}</p>
                    <ul className="flex flex-wrap gap-2">
                      {lessons.map((l) => (
                        <li key={l.id}>
                          {l.status === "live" ? (
                            <Link href={lessonPath(l.id)} className="about-lesson-chip">
                              <span className="text-cyan-500 font-semibold">{l.order}</span>
                              {l.title}
                              <span className="text-sand-500">{l.minutes} min</span>
                            </Link>
                          ) : (
                            <span className="about-lesson-chip opacity-60">
                              <span className="text-cyan-500 font-semibold">{l.order}</span>
                              {l.title}
                              <span className="text-sand-500">soon</span>
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              ))}
            </ol>
          </InView>
        </div>
      </section>

      {/* How a lesson works */}
      <section aria-labelledby="steps-heading" className="relative py-16">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <h2 id="steps-heading" className="font-display text-3xl md:text-4xl font-semibold text-sand-100 mb-10 text-center">
            How a lesson works
          </h2>
          <InView>
            <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((st, i) => (
                <li key={st.step} className="about-step reveal" style={reveal(i * 0.08)}>
                  <span className="font-display text-sm font-bold text-cyan-500">0{i + 1}</span>
                  <h3 className="font-display text-xl font-semibold text-sand-100 mt-2 mb-2">{st.step}</h3>
                  <p className="font-body text-sm text-sand-400 leading-relaxed">{st.body}</p>
                </li>
              ))}
            </ol>
          </InView>
        </div>
      </section>

      {/* How lessons are sourced */}
      <section className="relative py-16">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 space-y-6 font-body text-sand-400 leading-relaxed">
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-sand-100">How the lessons are sourced</h2>
          <p>
            Each concept in a lesson ends with its sources, linked to the original page, with the date it was
            published or last updated, or the date we last checked it. Sources in the live lessons include:
          </p>
          <ul className="flex flex-wrap gap-2">
            {SOURCE_EXAMPLES.map((name) => (
              <li key={name} className="about-source-chip">{name}</li>
            ))}
          </ul>
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
        <div className="max-w-4xl mx-auto px-6 lg:px-8 space-y-6 font-body text-sand-400 leading-relaxed">
          <h2 id="author-heading" className="font-display text-3xl md:text-4xl font-semibold text-sand-100">
            Who writes {SITE.name}
          </h2>
          <div className="about-author">
            <span aria-hidden="true" className="about-author-avatar">{initials}</span>
            <div className="space-y-3">
              <div>
                <p className="font-display text-xl font-semibold text-sand-100">{AUTHOR.name}</p>
                <p className="font-body text-sm text-cyan-500">{AUTHOR.jobTitle}</p>
              </div>
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
          </div>
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

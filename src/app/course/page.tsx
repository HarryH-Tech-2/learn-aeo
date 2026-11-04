import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import { pageMetadata } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";
import { breadcrumbSchema, courseSchema, faqSchema } from "@/lib/schema";
import { FIRST_LESSON_PATH, LESSON_CATALOG, courseParts, lessonPath } from "@/lib/lesson-catalog";
import { PLANS, PLAN_IDS, formatPlanPrice, planPeriodLabel } from "@/lib/plans";
import { AUTHOR } from "@/lib/author";

// The course's own page (navbar "Course"): what it covers, who it is for, how a lesson works, and what it costs.
// Lesson names, counts and minutes come from the catalog, prices from the plan catalog: nothing is typed twice.

export const metadata: Metadata = pageMetadata({
  title: "The AEO course: 8 lessons for marketers",
  description:
    "An answer engine optimization course for marketers who know SEO: how AI search picks sources, crawler access, citable writing, schema and measurement.",
  path: "/course",
});

const TOTAL_MINUTES = LESSON_CATALOG.reduce((n, l) => n + l.minutes, 0);
const HOURS = Math.round((TOTAL_MINUTES / 60) * 2) / 2;

const LEVEL_LABEL: Record<string, string> = { beginner: "Beginner", intermediate: "Intermediate", advanced: "Advanced" };


const WHO = [
  {
    title: "You know SEO",
    body: "You can read a robots.txt file and you know what a canonical is. The course starts from there, not from what a search engine is.",
  },
  {
    title: "You're asked about AI search",
    body: "A client or your boss wants to know why ChatGPT recommends a competitor. You want an answer built on the platforms' own documentation, not hype.",
  },
  {
    title: "You'd rather practice than watch",
    body: "Every lesson has checks, a hands-on exercise and an audit. You work on real files and passages, not slides.",
  },
];

const HOW = [
  { step: "Learn", body: "Short concept cards, each with the sources it relies on and the date they were checked." },
  { step: "Check", body: "A quick check after each group of concepts, so you know it went in before you move on." },
  { step: "Practice", body: "A hands-on exercise: trace an answer through an engine, fix a robots.txt file, rewrite a passage answer-first." },
  { step: "Audit", body: "Each lesson ends with an audit that tests what you learned and earns XP toward your level in the City of Answers." },
];

const FAQS = [
  {
    question: "Do I need to know SEO first?",
    answer:
      "The basics, yes: crawling, indexing, titles and links. The course builds on SEO rather than teaching it from scratch, because most of AEO is SEO with a different scoreboard.",
  },
  {
    question: "How long does the course take?",
    answer: `About ${HOURS} hours in total. Each of the ${LESSON_CATALOG.length} lessons takes ${Math.min(...LESSON_CATALOG.map((l) => l.minutes))} to ${Math.max(...LESSON_CATALOG.map((l) => l.minutes))} minutes, and your place is saved, so you can stop and come back.`,
  },
  {
    question: "Is the first lesson really free?",
    answer: "Yes. Lesson 1 is free with a sign-in and no card. It covers how AI answers get built and how sources get chosen.",
  },
  {
    question: "Will this guarantee my brand gets cited?",
    answer:
      "No, and nothing honestly can: no one controls what an AI tool writes. The course teaches what the platforms document, how to remove the things that stop you being used, and how to measure whether changes work.",
  },
];

export default function CoursePage() {
  const parts = courseParts();
  return (
    <main className="grain-overlay">
      <JsonLd
        data={[
          courseSchema(),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Course", path: "/course" },
          ]),
          faqSchema(FAQS, absoluteUrl("/course")),
        ]}
      />
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-16 md:pt-40 md:pb-20">
        <div aria-hidden="true" className="course-hero-glow" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <nav aria-label="Breadcrumb" className="flex justify-center items-center gap-2 mb-8 font-body text-sm text-sand-500">
            <Link href="/" className="hover:text-gold-400 transition-colors">Home</Link>
            <span aria-hidden="true">/</span>
            <span className="text-sand-400">Course</span>
          </nav>
          <p className="font-body text-xs sm:text-sm uppercase tracking-[0.25em] text-cyan-400 mb-5">The course</p>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-sand-100 leading-[1.05] mb-6">
            Get your brand into <span className="text-gradient-gold">AI answers</span>
          </h1>
          <p className="font-body text-lg md:text-xl text-sand-300 leading-relaxed max-w-3xl mx-auto mb-10">
            {LESSON_CATALOG.length} interactive lessons on answer engine optimization for marketers who already know SEO: how ChatGPT,
            Perplexity and Google AI Overviews choose their sources, and the work that makes one of them yours.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href={FIRST_LESSON_PATH} className="btn-primary px-8 py-3.5">
              Start lesson 1 free
            </Link>
            <Link href="/pricing" className="btn-secondary px-8 py-3.5">
              See pricing
            </Link>
          </div>
        </div>

      </section>

      {/* Who it's for */}
      <section aria-labelledby="who" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 id="who" className="font-display text-3xl md:text-4xl font-bold text-sand-100 mb-10 text-center">Who it&rsquo;s for</h2>
        <div className="grid gap-5 md:grid-cols-3">
          {WHO.map((w) => (
            <div key={w.title} className="card-ancient p-6">
              <h3 className="font-display text-xl font-bold text-gold-400 mb-3">{w.title}</h3>
              <p className="font-body text-base text-sand-300 leading-relaxed">{w.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Syllabus */}
      <section aria-labelledby="syllabus" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <p className="font-body text-xs uppercase tracking-[0.25em] text-cyan-500 mb-3 text-center">Syllabus</p>
        <h2 id="syllabus" className="font-display text-3xl md:text-4xl font-bold text-sand-100 mb-4 text-center">
          {parts.length} parts, {LESSON_CATALOG.length} lessons
        </h2>
        <p className="font-body text-lg text-sand-400 text-center max-w-2xl mx-auto mb-12">
          Each lesson is a district of the City of Answers. Work through them in order, or jump to the one you need.
        </p>
        <ol className="space-y-10">
          {parts.map(({ part, number, lessons }) => (
            <li key={part.title}>
              <div className="flex items-baseline gap-3 mb-4">
                <span className="font-display text-sm font-bold text-cyan-400 uppercase tracking-[0.2em]">Part {number}</span>
                <h3 className="font-display text-2xl font-bold text-sand-100">{part.title}</h3>
              </div>
              <p className="font-body text-sand-400 mb-5">{part.summary}</p>
              <ol className="grid gap-4">
                {lessons.map((l) => (
                  <li key={l.id} className="course-lesson">
                    <span aria-hidden="true" className="course-lesson-num">{l.order}</span>
                    <div className="min-w-0">
                      <p className="font-body text-xs uppercase tracking-[0.2em] text-sand-500 mb-1">
                        District {l.order}: {l.district}
                      </p>
                      <h4 className="font-display text-xl font-bold text-sand-100 mb-2">
                        {l.isFree ? (
                          <Link href={lessonPath(l.id)} className="hover:text-cyan-400 transition-colors">{l.title}</Link>
                        ) : (
                          l.title
                        )}
                      </h4>
                      <p className="font-body text-base text-sand-300 leading-relaxed mb-3">{l.description}</p>
                      <p className="flex flex-wrap items-center gap-2 font-body text-sm text-sand-400">
                        <span>{LEVEL_LABEL[l.level] ?? l.level}</span>
                        <span aria-hidden="true">·</span>
                        <span>{l.minutes} min</span>
                        {l.isFree && <span className="course-free-tag">Free</span>}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </li>
          ))}
        </ol>
      </section>

      {/* How a lesson works */}
      <section aria-labelledby="how" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 id="how" className="font-display text-3xl md:text-4xl font-bold text-sand-100 mb-10 text-center">How a lesson works</h2>
        <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {HOW.map((h, i) => (
            <li key={h.step} className="card-ancient p-6">
              <span className="font-display text-sm font-bold text-cyan-400">0{i + 1}</span>
              <h3 className="font-display text-xl font-bold text-sand-100 mt-2 mb-3">{h.step}</h3>
              <p className="font-body text-base text-sand-300 leading-relaxed">{h.body}</p>
            </li>
          ))}
        </ol>
        <p className="font-body text-base text-sand-400 text-center mt-8">
          Finish all {LESSON_CATALOG.length} and download a certificate with your name on it, with a link anyone can use to verify it.
        </p>
      </section>

      {/* Pricing summary */}
      <section aria-labelledby="price" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 id="price" className="font-display text-3xl md:text-4xl font-bold text-sand-100 mb-3 text-center">What it costs</h2>
        <p className="font-body text-lg text-sand-400 text-center mb-10">Lesson 1 is free. Every plan unlocks the whole course.</p>
        <div className={`grid gap-5 ${PLAN_IDS.length >= 3 ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
          {PLAN_IDS.map((id) => {
            const p = PLANS[id];
            return (
              <div key={id} className={`card-ancient p-6 text-center ${p.featured ? "course-plan-featured" : ""}`}>
                {p.featured && <p className="font-body text-xs uppercase tracking-[0.2em] text-cyan-400 mb-2">Best value</p>}
                <h3 className="font-display text-xl font-bold text-sand-100">{p.name}</h3>
                <p className="font-display text-4xl font-bold text-sand-100 mt-3">{formatPlanPrice(p, "USD")}</p>
                <p className="font-body text-sm text-sand-400 mb-3">{planPeriodLabel(p)}</p>
                <p className="font-body text-base text-sand-300">{p.tagline}</p>
              </div>
            );
          })}
        </div>
        <p className="text-center mt-8">
          <Link href="/pricing" className="font-body text-cyan-400 underline underline-offset-4">Compare plans and what&rsquo;s included</Link>
        </p>
      </section>

      {/* Author */}
      <section aria-labelledby="author" className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h2 id="author" className="font-display text-2xl font-bold text-sand-100 mb-4">Who writes it</h2>
        <p className="font-body text-lg text-sand-300 leading-relaxed">
          {AUTHOR.bio}{" "}
          <Link href={AUTHOR.path} className="text-cyan-400 underline underline-offset-4">More about the course</Link>.
        </p>
      </section>

      {/* FAQ */}
      <section aria-labelledby="faq" className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 id="faq" className="font-display text-3xl md:text-4xl font-bold text-sand-100 mb-8 text-center">Questions</h2>
        <div className="space-y-3">
          {FAQS.map((f) => (
            <details key={f.question} className="card-ancient p-5 group">
              <summary className="font-display text-lg font-bold text-sand-100 cursor-pointer list-none flex justify-between gap-4">
                {f.question}
                <span aria-hidden="true" className="text-cyan-400 transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="font-body text-base text-sand-300 leading-relaxed mt-3">{f.answer}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Closing CTA */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 text-center">
        <div className="course-cta">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-sand-100 mb-4">Start with the free lesson</h2>
          <p className="font-body text-lg text-sand-300 mb-8">See how an AI answer gets built, in about {LESSON_CATALOG[0].minutes} minutes.</p>
          <Link href={FIRST_LESSON_PATH} className="btn-primary px-8 py-3.5">
            Start lesson 1 free
          </Link>
        </div>
      </section>
      <Footer />
    </main>
  );
}

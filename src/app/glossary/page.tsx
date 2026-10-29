import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbSchema, definedTermSetSchema } from "@/lib/schema";
import { GLOSSARY } from "@/lib/glossary";
import { FIRST_LESSON_PATH } from "@/lib/lesson-catalog";

export const metadata: Metadata = pageMetadata({
  title: "AEO glossary: 30 terms explained",
  description:
    "Plain definitions of the answer engine optimization terms marketers meet: AI Overviews, query fan-out, llms.txt, GPTBot, grounding, E-E-A-T and more.",
  path: "/glossary",
});

/** First letter of a term, for the A-Z groups ("E-E-A-T" → "E", "sameAs" → "S"). */
const letterOf = (term: string) => term[0].toUpperCase();

export default function GlossaryPage() {
  const letters = [...new Set(GLOSSARY.map((t) => letterOf(t.term)))];
  return (
    <main className="grain-overlay">
      <JsonLd
        data={[
          definedTermSetSchema(GLOSSARY),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Glossary", path: "/glossary" },
          ]),
        ]}
      />
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 mb-8 font-body text-sm text-sand-500">
          <Link href="/" className="hover:text-gold-400 transition-colors">Home</Link>
          <span aria-hidden="true">/</span>
          <span className="text-sand-400">Glossary</span>
        </nav>
        <p className="font-body text-xs uppercase tracking-[0.3em] text-cyan-500 mb-4">Glossary</p>
        <h1 className="font-display text-4xl md:text-5xl font-light text-sand-100 mb-6">AEO glossary</h1>
        <p className="font-body text-lg text-sand-300 leading-relaxed max-w-3xl mb-10">
          {GLOSSARY.length} terms you will meet in answer engine optimization, each with a one-line definition, what it means in
          practice, and the sources behind it.
        </p>
        <nav aria-label="Jump to letter" className="flex flex-wrap gap-2 mb-12">
          {letters.map((l) => (
            <a
              key={l}
              href={`#${l}`}
              className="font-display text-lg w-9 h-9 grid place-items-center rounded-lg border border-sand-500/30 text-sand-200 hover:text-cyan-400 hover:border-cyan-400/50 transition-colors"
            >
              {l}
            </a>
          ))}
        </nav>
        <div className="space-y-12 mb-16">
          {letters.map((l) => (
            <section key={l} id={l} aria-labelledby={`letter-${l}`} className="scroll-mt-28">
              <h2 id={`letter-${l}`} className="font-display text-3xl font-light text-gold-400 mb-4">{l}</h2>
              <dl className="space-y-5">
                {GLOSSARY.filter((t) => letterOf(t.term) === l).map((t) => (
                  <div key={t.slug}>
                    <dt className="font-display text-xl text-sand-100">
                      <Link href={`/glossary/${t.slug}`} className="hover:text-cyan-400 underline-offset-4 hover:underline">
                        {t.term}
                      </Link>
                    </dt>
                    <dd className="font-body text-sand-400 leading-relaxed mt-1">{t.definition}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>
        <p className="font-body text-sand-400">
          Want to put the terms to work?{" "}
          <Link href={FIRST_LESSON_PATH} className="text-cyan-400 underline underline-offset-2">Lesson 1 is free</Link>.
        </p>
      </div>
      <Footer />
    </main>
  );
}

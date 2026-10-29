import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Markdown, { type Components } from "react-markdown";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import CodeBlock from "@/components/player/CodeBlock";
import { SourceLink } from "@/components/player/ConceptCard";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbSchema, definedTermSchema } from "@/lib/schema";
import { GLOSSARY, getTerm } from "@/lib/glossary";
import { LESSON_CATALOG, lessonPath, FIRST_LESSON_PATH } from "@/lib/lesson-catalog";

type Params = { params: Promise<{ term: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return GLOSSARY.map((t) => ({ term: t.slug }));
}

/** The definition, trimmed at a word to fit a meta description (at most 160 characters). */
function metaDescription(definition: string): string {
  if (definition.length <= 160) return definition;
  return `${definition.slice(0, 157).replace(/\s+\S*$/, "")}…`;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const t = getTerm((await params).term);
  if (!t) return { title: "Term not found", robots: { index: false, follow: true } };
  return pageMetadata({
    title: `What is ${t.term}? AEO glossary`,
    description: metaDescription(t.definition),
    path: `/glossary/${t.slug}`,
  });
}

// Internal links stay in the tab; external ones open a new one.
const MD: Components = {
  p: ({ children }) => <p className="font-body text-lg text-sand-300 leading-relaxed mb-5">{children}</p>,
  strong: ({ children }) => <strong className="font-semibold text-sand-100">{children}</strong>,
  ul: ({ children }) => <ul className="list-disc pl-6 space-y-2 mb-5 font-body text-lg text-sand-300">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal pl-6 space-y-2 mb-5 font-body text-lg text-sand-300">{children}</ol>,
  code: ({ children }) => (
    <code className="rounded bg-obsidian-lighter px-1 py-0.5 font-mono text-[0.88em] text-sand-100 break-words">{children}</code>
  ),
  a: ({ href = "", children }) =>
    href.startsWith("/") ? (
      <Link href={href} className="text-cyan-400 underline underline-offset-4">{children}</Link>
    ) : (
      <a href={href} target="_blank" rel="noopener" className="text-cyan-400 underline underline-offset-4">
        {children}
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    ),
};

export default async function TermPage({ params }: Params) {
  const t = getTerm((await params).term);
  if (!t) notFound();
  const lesson = t.lesson ? LESSON_CATALOG.find((l) => l.id === t.lesson) : undefined;
  const related = t.related.map(getTerm).filter((r): r is NonNullable<typeof r> => !!r);

  return (
    <main className="grain-overlay">
      <JsonLd
        data={[
          definedTermSchema(t),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Glossary", path: "/glossary" },
            { name: t.term, path: `/glossary/${t.slug}` },
          ]),
        ]}
      />
      <Navbar />
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 mb-8 font-body text-sm text-sand-500">
          <Link href="/" className="hover:text-gold-400 transition-colors">Home</Link>
          <span aria-hidden="true">/</span>
          <Link href="/glossary" className="hover:text-gold-400 transition-colors">Glossary</Link>
          <span aria-hidden="true">/</span>
          <span className="text-sand-400">{t.term}</span>
        </nav>
        <p className="font-body text-xs uppercase tracking-[0.3em] text-cyan-500 mb-4">AEO glossary</p>
        <h1 className="font-display text-4xl md:text-5xl font-light text-sand-100 mb-3">{t.term}</h1>
        {t.aka?.length ? <p className="font-body text-sand-400 mb-6">Also called {t.aka.join(", ")}</p> : null}
        <p className="font-body text-xl text-sand-100 leading-relaxed border-l-2 border-cyan-400 pl-5 mt-6 mb-10">{t.definition}</p>

        <section aria-label="Explanation" className="mb-10">
          <Markdown components={MD}>{t.explanation}</Markdown>
        </section>

        {t.example && (
          <section aria-labelledby="example" className="mb-12">
            <h2 id="example" className="font-display text-2xl font-light text-sand-100 mb-4">Example</h2>
            <CodeBlock language={t.example.language ?? "text"} caption={t.example.label} code={t.example.body} />
          </section>
        )}

        {lesson && (
          <section aria-label="Lesson" className="card-ancient p-6 mb-12">
            <p className="font-body text-xs uppercase tracking-[0.2em] text-cyan-500 mb-2">Learn it properly</p>
            <p className="font-body text-sand-300">
              The course covers this in{" "}
              <Link href={lessonPath(lesson.id)} className="text-cyan-400 underline underline-offset-4">{lesson.title}</Link>.
              {lesson.isFree ? (
                " That lesson is free."
              ) : (
                <>
                  {" "}
                  <Link href={FIRST_LESSON_PATH} className="text-cyan-400 underline underline-offset-4">Lesson 1 is free</Link>.
                </>
              )}
            </p>
          </section>
        )}

        {related.length > 0 && (
          <section aria-labelledby="related" className="mb-12">
            <h2 id="related" className="font-display text-2xl font-light text-sand-100 mb-4">Related terms</h2>
            <ul className="flex flex-wrap gap-2">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link
                    href={`/glossary/${r.slug}`}
                    className="inline-block font-body text-sm rounded-full border border-sand-500/30 px-4 py-1.5 text-sand-200 hover:text-cyan-400 hover:border-cyan-400/50 transition-colors"
                  >
                    {r.term}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section aria-labelledby="sources" className="mb-12">
          <h2 id="sources" className="font-display text-2xl font-light text-sand-100 mb-4">Sources</h2>
          <ol className="list-decimal pl-6 space-y-2 font-body text-sm">
            {t.sources.map((s) => (
              <li key={s.url}>
                <SourceLink source={s} />
              </li>
            ))}
          </ol>
        </section>

        <p className="font-body text-sand-400">
          <Link href="/glossary" className="text-cyan-400 underline underline-offset-4">All {GLOSSARY.length} glossary terms</Link>
        </p>
      </article>
      <Footer />
    </main>
  );
}

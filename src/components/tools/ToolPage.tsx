import type { ReactNode } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import { breadcrumbSchema, faqSchema, webApplicationSchema } from "@/lib/schema";
import { toolPath, type ToolMeta } from "@/lib/tools";
import { FIRST_LESSON_PATH, LESSON_CATALOG } from "@/lib/lesson-catalog";

export type ToolFaq = { question: string; answer: string };

/**
 * The shared shape of every free tool page (spec "Free tools"): an answer-first intro, the tool,
 * how it works, an FAQ (with FAQPage schema), and a way into lesson 1.
 */
export default function ToolPage({
  tool,
  intro,
  children,
  howItWorks,
  faqs,
}: {
  tool: ToolMeta;
  intro: ReactNode;
  children: ReactNode;
  howItWorks: ReactNode;
  faqs: ToolFaq[];
}) {
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Tools", path: "/tools" },
    { name: tool.name, path: toolPath(tool.slug) },
  ];
  return (
    <main className="grain-overlay">
      <JsonLd data={[webApplicationSchema(tool), faqSchema(faqs), breadcrumbSchema(crumbs)]} />
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 mb-8 font-body text-sm text-sand-500">
          <Link href="/" className="hover:text-gold-400 transition-colors">Home</Link>
          <span aria-hidden="true">/</span>
          <Link href="/tools" className="hover:text-gold-400 transition-colors">Tools</Link>
          <span aria-hidden="true">/</span>
          <span className="text-sand-400">{tool.name}</span>
        </nav>

        <p className="font-body text-xs uppercase tracking-[0.3em] text-cyan-500 mb-4">Free tool</p>
        <h1 className="font-display text-4xl md:text-5xl font-light text-sand-100 mb-6">{tool.name}</h1>
        <div className="font-body text-lg text-sand-300 leading-relaxed space-y-4 max-w-3xl mb-10">{intro}</div>

        <section aria-label={tool.name} className="mb-16">{children}</section>

        <section className="mb-16">
          <h2 className="font-display text-3xl font-light text-sand-100 mb-5">How it works</h2>
          <div className="font-body text-sand-400 leading-relaxed space-y-4 max-w-3xl">{howItWorks}</div>
        </section>

        <section className="mb-16">
          <h2 className="font-display text-3xl font-light text-sand-100 mb-5">Questions</h2>
          <div className="space-y-6 max-w-3xl">
            {faqs.map((f) => (
              <div key={f.question}>
                <h3 className="font-display text-xl text-sand-100 mb-2">{f.question}</h3>
                <p className="font-body text-sand-400 leading-relaxed">{f.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="card-ancient p-8 text-center">
          <h2 className="font-display text-2xl md:text-3xl text-sand-100 mb-3">Learn what to do with the results</h2>
          <p className="font-body text-sand-400 mb-6 max-w-xl mx-auto">
            Lesson 1, &ldquo;{LESSON_CATALOG[0].title}&rdquo;, is free. {LESSON_CATALOG[0].summary}
          </p>
          <Link href={FIRST_LESSON_PATH} className="btn-primary justify-center text-sm py-3 px-8">
            Start lesson 1 free
          </Link>
        </section>
      </div>
      <Footer />
    </main>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import { ToolCard } from "@/components/ToolsSection";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbSchema, itemListSchema } from "@/lib/schema";
import { TOOLS, toolPath } from "@/lib/tools";
import { FIRST_LESSON_PATH } from "@/lib/lesson-catalog";

export const metadata: Metadata = pageMetadata({
  title: "Free AEO tools",
  description:
    "Free answer engine optimization tools: check which AI crawlers your robots.txt allows, and build an llms.txt file. No sign-in needed.",
  path: "/tools",
});

export default function ToolsPage() {
  const live = TOOLS.filter((t) => t.status === "live");
  return (
    <main className="grain-overlay">
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Tools", path: "/tools" },
          ]),
          itemListSchema("Free AEO tools", live.map((t) => ({ name: t.name, path: toolPath(t.slug) }))),
        ]}
      />
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 mb-8 font-body text-sm text-sand-500">
          <Link href="/" className="hover:text-gold-400 transition-colors">Home</Link>
          <span aria-hidden="true">/</span>
          <span className="text-sand-400">Tools</span>
        </nav>
        <p className="font-body text-xs uppercase tracking-[0.3em] text-cyan-500 mb-4">Free tools</p>
        <h1 className="font-display text-4xl md:text-5xl font-light text-sand-100 mb-6">Free AEO tools</h1>
        <p className="font-body text-lg text-sand-300 leading-relaxed max-w-3xl mb-12">
          Small tools for jobs the course teaches. They are free, need no sign-in, and say what they check and what they don&rsquo;t.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 mb-16">
          {TOOLS.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
        <p className="font-body text-sand-400">
          Want to know what to do with the results?{" "}
          <Link href={FIRST_LESSON_PATH} className="text-cyan-400 underline underline-offset-2">Lesson 1 is free</Link>.
        </p>
      </div>
      <Footer />
    </main>
  );
}

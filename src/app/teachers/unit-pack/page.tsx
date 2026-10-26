import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import UnitPackOffer from "@/components/teachers/UnitPackOffer";
import { LESSONS } from "@/lib/unit-pack/content";
import { UNIT_PACK, UNIT_PACK_PAGE } from "@/lib/unit-pack/product";

const BASE = "https://www.learnhieroglyphics.com";

export const metadata: Metadata = {
  title: "Ancient Egypt Writing Unit: 5 Hieroglyphs Lessons for KS2 & Grade 6 | Learn Hieroglyphics",
  description:
    "A ready-to-teach five-lesson unit on Egyptian hieroglyphs: the Rosetta Stone, the alphabet signs, real royal cartouches, determinatives and an assessment. Lesson plans, worksheets, quiz and answer key. Free Lesson 1 sample.",
  alternates: { canonical: `${BASE}${UNIT_PACK_PAGE}` },
  openGraph: {
    title: "Ancient Egypt Writing Unit: five ready-to-teach hieroglyphs lessons",
    description: "Lesson plans, pupil worksheets, an end-of-unit quiz and answers for KS2 and US grade 6. Try Lesson 1 free.",
    url: `${BASE}${UNIT_PACK_PAGE}`,
    type: "website",
  },
};

const GLYPH_FONT = { fontFamily: "'Noto Sans Egyptian Hieroglyphs', 'Segoe UI Historic', serif" };
const LESSON_GLYPHS = ["𓏛", "𓅓", "𓋹", "𓀀", "𓏞"];

export default function UnitPackPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: UNIT_PACK.name,
    url: `${BASE}${UNIT_PACK_PAGE}`,
    description: UNIT_PACK.description,
    learningResourceType: ["Lesson plan", "Worksheet", "Quiz"],
    educationalLevel: ["Key Stage 2", "Grade 6"],
    audience: { "@type": "EducationalAudience", educationalRole: "teacher" },
    teaches: "Egyptian hieroglyphs: the Rosetta Stone, alphabet signs, royal cartouches and determinatives.",
    isAccessibleForFree: false,
    inLanguage: "en",
    provider: { "@type": "Organization", name: "Learn Hieroglyphics", url: BASE },
  };

  return (
    <main className="grain-overlay">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />

      <section className="px-4 pb-12 pt-32 sm:px-6 md:pt-36">
        <div className="mx-auto max-w-4xl">
          <p className="mb-4 font-body text-xs uppercase tracking-[0.25em] text-gold-500">
            <Link href="/teachers" className="hover:text-gold-300">
              For teachers
            </Link>{" "}
            &middot; KS2 &amp; grade 6 Ancient Egypt
          </p>
          <h1 className="mb-5 font-display text-4xl font-light text-sand-100 md:text-5xl">
            The Ancient Egypt <span className="text-gradient-gold font-medium">Writing Unit</span>
          </h1>
          <p className="max-w-2xl font-body text-lg leading-relaxed text-sand-300">
            Five ready-to-teach lessons that take a class from &ldquo;what are hieroglyphs?&rdquo; to reading
            Tutankhamun&apos;s cartouche. Each lesson has a teacher plan with timings and what to say, a pupil
            worksheet, and the answers. Print it tomorrow; teach it every year.
          </p>
        </div>
      </section>

      <section className="px-4 pb-16 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <UnitPackOffer location="unit-pack" />
        </div>
      </section>

      <section className="border-t border-gold-700/20 px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-8 font-display text-3xl font-semibold text-sand-100">
            Five lessons, <span className="text-gradient-gold">about 50 minutes each</span>
          </h2>
          <ol className="space-y-6">
            {LESSONS.map((l, i) => (
              <li key={l.n} className="grid gap-4 border border-gold-700/20 bg-obsidian-light/40 p-6 md:grid-cols-[64px_1fr]">
                <span className="text-4xl text-gold-400" style={GLYPH_FONT} aria-hidden>
                  {LESSON_GLYPHS[i]}
                </span>
                <div>
                  <p className="font-body text-xs uppercase tracking-[0.2em] text-gold-500">Lesson {l.n}</p>
                  <h3 className="mt-1 font-display text-xl text-sand-100">{l.title}</h3>
                  <p className="mt-2 font-body text-sm italic text-sand-400">{l.bigQuestion}</p>
                  <ul className="mt-3 space-y-1">
                    {l.objectives.map((o) => (
                      <li key={o} className="font-body text-sm leading-relaxed text-sand-300">
                        &middot; {o}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 font-body text-xs text-sand-500">
                    Free tool in the lesson: <span className="text-sand-300">{l.tool.name}</span>
                    {l.n === 1 && <> &middot; this lesson is the free sample</>}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-t border-gold-700/20 px-4 py-16 sm:px-6">
        <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-2">
          <div className="border border-gold-700/20 bg-obsidian-light/40 p-6">
            <p className="mb-2 font-body text-xs uppercase tracking-[0.2em] text-gold-500">England</p>
            <p className="font-body text-sm leading-relaxed text-sand-300">
              KS2 history: the achievements of the earliest civilizations, with Ancient Egypt as the depth study, and
              how our knowledge of the past is built from sources.
            </p>
          </div>
          <div className="border border-gold-700/20 bg-obsidian-light/40 p-6">
            <p className="mb-2 font-body text-xs uppercase tracking-[0.2em] text-gold-500">United States</p>
            <p className="font-body text-sm leading-relaxed text-sand-300">
              Grade 6 world history (Ancient Egypt): C3 Framework D2.His indicators for grades 6&ndash;8, and Common
              Core literacy in history RH.6-8.4 and RH.6-8.7. Each lesson lists its own.
            </p>
          </div>
          <div className="border border-gold-700/20 bg-obsidian-light/40 p-6 sm:col-span-2">
            <p className="mb-2 font-body text-xs uppercase tracking-[0.2em] text-gold-500">Accurate</p>
            <p className="font-body text-sm leading-relaxed text-sand-300">
              Every sign is a real hieroglyph from Gardiner&apos;s sign list, and the facts follow our course and our
              articles on the{" "}
              <Link href="/blog/how-the-rosetta-stone-changed-everything" className="text-gold-400 underline underline-offset-2">
                Rosetta Stone
              </Link>{" "}
              and{" "}
              <Link href="/blog/reading-your-first-cartouche" className="text-gold-400 underline underline-offset-2">
                royal cartouches
              </Link>
              . Questions about the content? <Link href="/contact" className="text-gold-400 underline underline-offset-2">Ask Harry</Link>: I reply to every teacher.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AlphabetTable, { UNILITERALS } from "@/components/AlphabetTable";
import AlphabetSelfTest from "@/components/AlphabetSelfTest";
import LangAttr from "@/components/LangAttr";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import TranslatedCtaLink from "@/components/TranslatedCtaLink";
import { ALPHABET_I18N } from "@/lib/content/alphabet-i18n";
import { guestPlayHref } from "@/lib/guest-play";
import { SITE, TOOL_PATHS, toolUrl, type Locale } from "@/lib/i18n";
import type { ChartSign } from "@/lib/sign-quiz";
import LocaleLessonCta from "@/components/LocaleLessonCta";

export type AlphabetCopy = {
  home: string;
  here: string;
  eyebrow: string;
  h1Lead: string;
  h1Gold: string;
  intro: string;
  by: string;
  published: string;
  publishedLabel: string;
  testLink: string;
  quickLabel: string;
  quickAnswer: React.ReactNode;
  /** The quick answer as plain text, for the JSON-LD abstract. */
  quickAnswerText: string;
  chartNote: React.ReactNode;
  /** The explanatory sections between the chart and the name section. */
  sections: { heading: string; body: React.ReactNode }[];
  name: { heading: string; body: React.ReactNode; cta: string };
  learn: { heading: string; body: React.ReactNode; lesson: string; lessonNote: string; keyboard: string; keyboardNote: string };
  faqHeading: string;
  faq: { q: string; a: string }[];
  headline: string;
  description: string;
};

/** Ancient Egyptian signs inside the copy. */
export function G({ children }: { children: React.ReactNode }) {
  return (
    <span className="hieroglyph-font" lang="egy">
      {children}
    </span>
  );
}

const PUBLISHED = "2026-10-15";

/**
 * The Spanish and French alphabet chart pages (src/app/es/alfabeto-jeroglifico, src/app/fr/alphabet-hieroglyphique):
 * the same chart and self-test as /hieroglyphic-alphabet in that language, around copy written for that language's
 * searches. Everything inside is wrapped in lang="es"/"fr" (the root layout says "en"), and LangAttr fixes <html>.
 */
export default function TranslatedAlphabetPage({ locale, copy }: { locale: Exclude<Locale, "en">; copy: AlphabetCopy }) {
  const local = ALPHABET_I18N[locale];
  const url = toolUrl("alphabet", locale);
  const signs: ChartSign[] = UNILITERALS.map((g) => ({
    glyph: g.symbol,
    english: local[g.symbol]?.equivalent ?? g.transliteration,
    name: local[g.symbol]?.name ?? g.meaning,
  }));

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: copy.headline,
      description: copy.description,
      abstract: copy.quickAnswerText,
      datePublished: PUBLISHED,
      dateModified: PUBLISHED,
      inLanguage: locale,
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
      author: { "@type": "Person", name: "Harry Harrison", url: `${SITE}/about`, sameAs: ["https://x.com/HarryHH1993", "https://www.linkedin.com/in/harry-harrison/"] },
      publisher: {
        "@type": "Organization",
        name: "Learn Hieroglyphics",
        url: SITE,
        logo: { "@type": "ImageObject", url: `${SITE}/icon-512.png` },
      },
      about: UNILITERALS.map((g) => ({
        "@type": "Thing",
        name: `${g.symbol} ${g.transliteration}`,
        description: local[g.symbol] ? `${local[g.symbol].name}: ${local[g.symbol].desc}` : g.meaning,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: copy.home, item: SITE },
        { "@type": "ListItem", position: 2, name: copy.here, item: url },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      inLanguage: locale,
      mainEntity: copy.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
  ];

  const link = "text-gold-400 hover:text-gold-300 underline underline-offset-2";

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <LangAttr lang={locale} />
      <main className="min-h-screen bg-obsidian">
        <Navbar />
        <article lang={locale} className="pt-28 md:pt-36 pb-20 px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 mb-8">
              <nav aria-label="Breadcrumb" className="flex items-center gap-2 font-body text-sm text-sand-600">
                <Link href="/" className="hover:text-gold-400 transition-colors">
                  {copy.home}
                </Link>
                <span>/</span>
                <span className="text-sand-400">{copy.here}</span>
              </nav>
              <LanguageSwitcher page="alphabet" current={locale} />
            </div>

            <header className="mb-10">
              <p className="font-body text-xs tracking-[0.3em] uppercase text-gold-500 mb-4">{copy.eyebrow}</p>
              <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-light text-sand-100 mb-5 leading-tight">
                {copy.h1Lead} <span className="text-gradient-gold font-medium">{copy.h1Gold}</span>
              </h1>
              <p className="font-body text-lg text-sand-400 font-light leading-relaxed">{copy.intro}</p>
              <p className="font-body text-xs text-sand-500 mt-4">
                {copy.by}{" "}
                <a href="https://x.com/HarryHH1993" target="_blank" rel="noopener noreferrer" className="hover:text-gold-400">
                  Harry Harrison
                </a>{" "}
                · {copy.published} <time dateTime={PUBLISHED}>{copy.publishedLabel}</time>
              </p>
              <p className="font-body text-sm mt-4">
                <a href="#test-yourself" className="text-gold-400 hover:text-gold-300 underline underline-offset-4">
                  {copy.testLink} <span aria-hidden="true">↓</span>
                </a>
              </p>
            </header>

            {/* Answer-first definition */}
            <section className="mb-10 border border-gold-500/25 bg-gold-500/5 p-6 md:p-7" aria-labelledby="qa-heading">
              <p id="qa-heading" className="font-body text-[10px] tracking-[0.25em] uppercase text-gold-500 mb-3">
                {copy.quickLabel}
              </p>
              <p className="font-body text-base md:text-lg text-sand-200 leading-relaxed">{copy.quickAnswer}</p>
            </section>

            {/* The way into the course (the lesson is in English, and the card says so) */}
            <LocaleLessonCta locale={locale} page="alphabet" className="mb-10" />

            <AlphabetTable variant="full" locale={locale} className="mb-6" />
            <p className="font-body text-xs text-sand-500 mb-10">{copy.chartNote}</p>

            <AlphabetSelfTest signs={signs} locale={locale} />

            <div className="prose-ancient space-y-10">
              {copy.sections.map((s) => (
                <section key={s.heading}>
                  <h2 className="font-display text-2xl md:text-3xl font-semibold text-sand-100 mb-4">{s.heading}</h2>
                  <div className="font-body text-sand-300 font-light leading-relaxed space-y-4">{s.body}</div>
                </section>
              ))}

              <section>
                <h2 className="font-display text-2xl md:text-3xl font-semibold text-sand-100 mb-4">{copy.name.heading}</h2>
                <div className="font-body text-sand-300 font-light leading-relaxed space-y-4 mb-6">{copy.name.body}</div>
                <TranslatedCtaLink
                  href={TOOL_PATHS.translator[locale]}
                  locale={locale}
                  target="translator"
                  className="btn-primary text-sm py-3 px-6 justify-center"
                >
                  {copy.name.cta}
                </TranslatedCtaLink>
              </section>

              <section>
                <h2 className="font-display text-2xl md:text-3xl font-semibold text-sand-100 mb-4">{copy.learn.heading}</h2>
                <div className="font-body text-sand-300 font-light leading-relaxed space-y-4 mb-4">{copy.learn.body}</div>
                <ul className="font-body text-sand-300 font-light leading-relaxed list-disc pl-5 space-y-1">
                  <li>
                    <TranslatedCtaLink href={TOOL_PATHS.keyboard[locale]} locale={locale} target="keyboard" className={link}>
                      {copy.learn.keyboard}
                    </TranslatedCtaLink>{" "}
                    {copy.learn.keyboardNote}
                  </li>
                  <li>
                    <TranslatedCtaLink href={guestPlayHref()} locale={locale} target="lesson" className={link} hrefLang="en">
                      {copy.learn.lesson}
                    </TranslatedCtaLink>{" "}
                    {copy.learn.lessonNote}
                  </li>
                </ul>
              </section>

              <section aria-labelledby="faq-heading">
                <h2 id="faq-heading" className="font-display text-2xl md:text-3xl font-semibold text-sand-100 mb-6">
                  {copy.faqHeading}
                </h2>
                <div className="space-y-3">
                  {copy.faq.map((f) => (
                    <details key={f.q} className="border border-gold-700/15 bg-obsidian-light/50 group">
                      <summary className="cursor-pointer list-none px-5 py-4 font-display text-base md:text-lg text-sand-100 flex justify-between items-center gap-4">
                        {f.q}
                        <span className="text-gold-500 transition-transform group-open:rotate-45" aria-hidden="true">
                          +
                        </span>
                      </summary>
                      <p className="px-5 pb-5 font-body text-sand-300 font-light leading-relaxed">{f.a}</p>
                    </details>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </article>
        <Footer />
      </main>
    </>
  );
}

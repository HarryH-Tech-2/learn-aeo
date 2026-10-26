import type { ReactNode } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LangAttr from "@/components/LangAttr";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import IntlNameTranslator from "@/components/IntlNameTranslator";
import LocaleLessonCta from "@/components/LocaleLessonCta";
import { toolUrl, type Locale } from "@/lib/i18n";
import type { IntlLocale } from "@/lib/hieroglyph-translator-locales";

export type TranslatorCopy = {
  h1Start: string;
  h1Gold: string;
  intro: string;
  quickAnswerLabel: string;
  /** answer-first paragraph, with a worked example */
  quickAnswer: ReactNode;
  howHeading: string;
  sections: { h: string; p: ReactNode }[];
  faqHeading: string;
  faq: { q: string; a: string }[];
  moreHeading: string;
  links: { href: string; label: string; desc: string; hrefLang?: Locale }[];
  /** JSON-LD */
  appName: string;
  appDescription: string;
};

/** JSON-LD for a translated translator page: the tool itself and its FAQ, both in the page's language. */
export function translatorJsonLd(locale: IntlLocale, copy: TranslatorCopy) {
  return [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: copy.appName,
      url: toolUrl("translator", locale),
      description: copy.appDescription,
      inLanguage: locale,
      applicationCategory: "EducationalApplication",
      operatingSystem: "Any",
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      provider: { "@type": "Organization", name: "Learn Hieroglyphics", url: "https://www.learnhieroglyphics.com" },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      inLanguage: locale,
      mainEntity: copy.faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ];
}

/** The Spanish and French name translator pages: the tool first, then the answer, how it works, FAQ and related tools. */
export default function TranslatorLocalePage({ locale, copy }: { locale: IntlLocale; copy: TranslatorCopy }) {
  return (
    <div lang={locale}>
      <LangAttr lang={locale} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(translatorJsonLd(locale, copy)) }} />
      <main className="grain-overlay">
        <Navbar />
        <div className="min-h-screen pt-32 pb-20">
          <div className="max-w-4xl mx-auto px-6 lg:px-8 is-inview">
            <LanguageSwitcher page="translator" current={locale} className="justify-center mb-6" />

            <header className="text-center mb-12">
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-light text-sand-100 mb-6">
                {copy.h1Start} <span className="text-gradient-gold font-medium">{copy.h1Gold}</span>
              </h1>
              <p className="font-body text-lg text-sand-400 font-light max-w-2xl mx-auto">{copy.intro}</p>
            </header>

            <IntlNameTranslator locale={locale} />

            {/* Answer first, for search and answer engines */}
            <section className="mt-12 border border-gold-500/25 bg-gold-500/5 p-6 md:p-7" aria-labelledby="qa-heading">
              <h2 id="qa-heading" className="font-body text-xs tracking-[0.2em] uppercase text-gold-500 mb-3">
                {copy.quickAnswerLabel}
              </h2>
              <p className="font-body text-base md:text-lg text-sand-200 leading-relaxed">{copy.quickAnswer}</p>
            </section>

            {/* The way into the course (the lesson is in English, and the card says so) */}
            <LocaleLessonCta locale={locale} page="translator" className="mt-8" />

            <section className="mt-16 pt-12 border-t border-gold-700/20" aria-labelledby="how-heading">
              <h2 id="how-heading" className="font-display text-3xl font-semibold text-sand-100 mb-8 text-center">
                {copy.howHeading}
              </h2>
              <div className="space-y-8 max-w-3xl mx-auto">
                {copy.sections.map((s) => (
                  <div key={s.h}>
                    <h3 className="font-display text-xl font-medium text-gold-400 mb-3">{s.h}</h3>
                    <p className="font-body text-sand-400 font-light leading-relaxed">{s.p}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-16 pt-12 border-t border-gold-700/20" aria-labelledby="faq-heading">
              <h2 id="faq-heading" className="font-display text-3xl font-semibold text-sand-100 mb-8 text-center">
                {copy.faqHeading}
              </h2>
              <div className="space-y-3 max-w-3xl mx-auto">
                {copy.faq.map((f) => (
                  <details key={f.q} className="group border border-gold-700/25 bg-obsidian-light/60">
                    <summary className="cursor-pointer list-none flex items-center justify-between gap-4 p-5 font-body text-base text-sand-100">
                      <span>{f.q}</span>
                      <span className="text-gold-500 text-xl transition-transform group-open:rotate-45" aria-hidden="true">
                        +
                      </span>
                    </summary>
                    <p className="px-5 pb-5 font-body text-sm text-sand-300 leading-relaxed">{f.a}</p>
                  </details>
                ))}
              </div>
            </section>

            <section className="mt-16 pt-12 border-t border-gold-700/20" aria-labelledby="more-heading">
              <h2 id="more-heading" className="font-display text-2xl font-semibold text-sand-100 mb-6 text-center">
                {copy.moreHeading}
              </h2>
              <ul className="grid gap-4 md:grid-cols-3">
                {copy.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      hrefLang={l.hrefLang}
                      className="block h-full border border-gold-700/25 hover:border-gold-500/60 bg-obsidian-light/50 p-5 transition-colors"
                    >
                      <span className="block font-display text-lg text-gold-400 mb-1">{l.label}</span>
                      <span className="block font-body text-sm text-sand-400 leading-relaxed">{l.desc}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
        <Footer />
      </main>
    </div>
  );
}

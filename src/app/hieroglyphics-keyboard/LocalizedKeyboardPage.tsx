import type { ReactNode } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import TranslatorBackdrop from "@/components/TranslatorBackdrop";
import Footer from "@/components/Footer";
import GuestPlayBanner from "@/components/GuestPlayBanner";
import LangAttr from "@/components/LangAttr";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { keySigns } from "@/lib/hieroglyph-keyboard";
import { localizedSign } from "@/lib/hieroglyph-keyboard-i18n";
import { SITE, TOOL_PATHS, toolUrl } from "@/lib/i18n";
import KeyboardTool from "./KeyboardTool";
import LocaleLessonCta from "@/components/LocaleLessonCta";

/** Everything the Spanish or French keyboard page says. The words live in each page file; the layout is here. */
export type KeyboardPageCopy = {
  home: string;
  breadcrumb: string;
  h1: string;
  intro: string;
  quickAnswerLabel: string;
  quickAnswer: ReactNode;
  chartHeading: string;
  chartIntro: string;
  chartCaption: string;
  chartColumns: [string, string, string, string, string];
  chartFootnote: ReactNode;
  howHeading: string;
  howSteps: ReactNode[];
  pasteHeading: string;
  paste: ReactNode;
  realHeading: string;
  real: ReactNode;
  nameHeading: string;
  name: ReactNode;
  nameButton: string;
  alphabetButton: string;
  gameLead: string;
  faqHeading: string;
  faq: { q: string; a: string }[];
  schemaName: string;
  schemaDescription: string;
  features: string[];
};

const PUBLISHED = "2026-10-15";

export default function LocalizedKeyboardPage({ locale, copy }: { locale: "es" | "fr"; copy: KeyboardPageCopy }) {
  const url = toolUrl("keyboard", locale);
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: copy.schemaName,
      url,
      description: copy.schemaDescription,
      applicationCategory: "EducationalApplication",
      operatingSystem: "Any",
      browserRequirements: "Requires JavaScript",
      isAccessibleForFree: true,
      datePublished: PUBLISHED,
      dateModified: PUBLISHED,
      inLanguage: locale,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      featureList: copy.features,
      author: { "@type": "Person", name: "Harry Harrison", url: `${SITE}/about`, sameAs: ["https://x.com/HarryHH1993", "https://www.linkedin.com/in/harry-harrison/"] },
      provider: { "@type": "Organization", name: "Learn Hieroglyphics", url: SITE },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: copy.home, item: SITE },
        { "@type": "ListItem", position: 2, name: copy.breadcrumb, item: url },
      ],
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

  const h2 = "font-display text-2xl md:text-3xl font-semibold text-sand-100 mb-4";
  const para = "font-body text-sand-300 font-light leading-relaxed";

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <LangAttr lang={locale} />
      <main className="min-h-screen">
        <TranslatorBackdrop />
        {/* (over the fixed backdrop) */}
        <div className="relative z-[1]">
        <Navbar />
        <article lang={locale} className="pt-20 md:pt-28 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <nav aria-label="Breadcrumb" className="flex items-center gap-2 font-body text-sm text-sand-600">
                <Link href="/" className="hover:text-gold-400 transition-colors">
                  {copy.home}
                </Link>
                <span>/</span>
                <span className="text-sand-400">{copy.breadcrumb}</span>
              </nav>
              <LanguageSwitcher page="keyboard" current={locale} />
            </div>

            <header className="mb-6">
              <h1 className="font-display text-3xl md:text-4xl font-light text-sand-100 mb-2 leading-tight">{copy.h1}</h1>
              <p className="font-body text-lg text-sand-400 font-light leading-relaxed max-w-2xl">{copy.intro}</p>
            </header>

            <KeyboardTool locale={locale} />

            <div className="max-w-4xl">
              {/* Answer-first definition */}
              <section className="mb-12 border border-gold-500/25 bg-gold-500/5 p-6 md:p-7" aria-labelledby="qa-heading">
                <p id="qa-heading" className="font-body text-[10px] tracking-[0.25em] uppercase text-gold-500 mb-3">
                  {copy.quickAnswerLabel}
                </p>
                <p className="font-body text-base md:text-lg text-sand-200 leading-relaxed">{copy.quickAnswer}</p>
              </section>

              {/* The way into the course (the lesson is in English, and the card says so) */}
              <LocaleLessonCta locale={locale} page="keyboard" />

              <div className="space-y-12 mt-12">
                <section aria-labelledby="chart-heading">
                  <h2 id="chart-heading" className={h2}>
                    {copy.chartHeading}
                  </h2>
                  <p className={`${para} mb-5`}>{copy.chartIntro}</p>
                  <div className="overflow-x-auto border border-gold-700/20">
                    <table className="w-full border-collapse font-body text-sm md:text-base">
                      <caption className="sr-only">{copy.chartCaption}</caption>
                      <thead>
                        <tr className="bg-obsidian-light/60 text-left">
                          {copy.chartColumns.map((h) => (
                            <th key={h} scope="col" className="px-3 py-3 font-medium text-gold-400 text-xs tracking-[0.15em] uppercase">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {keySigns(locale).map((s) => {
                          const text = localizedSign(s, s.input, locale);
                          return (
                            <tr key={s.input} className="border-t border-gold-700/15 align-top">
                              <th scope="row" className="px-3 py-2.5 font-display text-xl text-sand-100 uppercase">
                                {s.input}
                              </th>
                              <td className="px-3 py-2.5 whitespace-nowrap">
                                <span className="text-3xl md:text-4xl leading-none text-sand-100 hieroglyph-font" lang="egy">
                                  {s.glyph}
                                </span>
                                <span className="block font-body text-[10px] tracking-[0.15em] uppercase text-sand-500 mt-1">{s.gardiner}</span>
                              </td>
                              <td className="px-3 py-2.5 text-sand-200">{text.signName}</td>
                              <td className="px-3 py-2.5 text-sand-100 font-medium">{s.transliteration}</td>
                              <td className="px-3 py-2.5 text-sand-300 font-light">{text.note}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <p className="font-body text-xs text-sand-500 mt-3">{copy.chartFootnote}</p>
                </section>

                <section>
                  <h2 className={h2}>{copy.howHeading}</h2>
                  <ol className={`${para} list-decimal pl-5 space-y-2`}>
                    {copy.howSteps.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                </section>

                <section>
                  <h2 className={h2}>{copy.pasteHeading}</h2>
                  {copy.paste}
                </section>

                <section>
                  <h2 className={h2}>{copy.realHeading}</h2>
                  {copy.real}
                </section>

                <section>
                  <h2 className={h2}>{copy.nameHeading}</h2>
                  <div className={`${para} mb-4`}>{copy.name}</div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link href={TOOL_PATHS.translator[locale]} className="btn-primary text-sm py-3 px-6 justify-center">
                      {copy.nameButton}
                    </Link>
                    <Link href={TOOL_PATHS.alphabet[locale]} className="btn-secondary text-sm py-3 px-6 justify-center">
                      {copy.alphabetButton}
                    </Link>
                  </div>
                </section>

                {/* The game is in English: said so before the card, so nobody clicks expecting Spanish or French */}
                <section>
                  <p className={`${para} mb-4`}>{copy.gameLead}</p>
                  <div lang="en">
                    <GuestPlayBanner location="keyboard" game />
                  </div>
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
          </div>
        </article>
        <Footer />
        </div>
      </main>
    </>
  );
}

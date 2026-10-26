import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GuestPlayBanner from "@/components/GuestPlayBanner";
import {
  ANKH_POST,
  HUB_PATH,
  PUBLISHED,
  SIGN_MEANINGS,
  getSignMeaning,
  signMeaningPath,
  unicodeNameFor,
} from "@/lib/sign-meanings";
import { guestPlayHref } from "@/lib/guest-play";
import { CopySignButton, TrackedLink } from "../SignMeaningClient";
import { plainText, renderInline } from "../inline";

const BASE = "https://www.learnhieroglyphics.com";
/** The five-signs post's picture shows these signs; reused rather than a new asset. */
const OG_IMAGE = `${BASE}/blog/five-egyptian-hieroglyphs-you-already-know.webp`;

export const dynamicParams = false;

export function generateStaticParams() {
  return SIGN_MEANINGS.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const sign = getSignMeaning(slug);
  if (!sign) return { title: "Not found | Learn Hieroglyphics", robots: { index: false, follow: true } };
  const url = `${BASE}${signMeaningPath(sign.slug)}`;
  return {
    title: sign.metaTitle,
    description: sign.metaDescription,
    authors: [{ name: "Harry Harrison", url: `${BASE}/about` }],
    alternates: { canonical: url },
    robots: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
    openGraph: {
      title: sign.metaTitle,
      description: sign.metaDescription,
      type: "article",
      url,
      siteName: "Learn Hieroglyphics",
      locale: "en_GB",
      publishedTime: PUBLISHED,
      images: [{ url: OG_IMAGE, width: 1024, height: 1024, alt: "Famous Egyptian hieroglyphs: the ankh, Eye of Horus, scarab, djed pillar and sun disc" }],
    },
    twitter: { card: "summary_large_image", title: sign.metaTitle, description: sign.metaDescription, images: [OG_IMAGE] },
  };
}

export default async function SignMeaningPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sign = getSignMeaning(slug);
  if (!sign) notFound();
  const url = `${BASE}${signMeaningPath(sign.slug)}`;
  const others = SIGN_MEANINGS.filter((s) => s.slug !== sign.slug);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: `${sign.glyph} ${sign.name} meaning`,
      description: sign.metaDescription,
      abstract: sign.quickAnswer,
      datePublished: PUBLISHED,
      dateModified: PUBLISHED,
      inLanguage: "en-GB",
      image: OG_IMAGE,
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
      author: { "@type": "Person", name: "Harry Harrison", url: `${BASE}/about`, sameAs: ["https://x.com/HarryHH1993", "https://www.linkedin.com/in/harry-harrison/"] },
      publisher: {
        "@type": "Organization",
        name: "Learn Hieroglyphics",
        url: BASE,
        logo: { "@type": "ImageObject", url: `${BASE}/icon-512.png` },
      },
      about: {
        "@type": "DefinedTerm",
        name: sign.name,
        alternateName: [sign.glyph, ...sign.otherNames],
        termCode: sign.gardiner,
        description: sign.quickAnswer,
        inDefinedTermSet: { "@type": "DefinedTermSet", name: "Gardiner's sign list", url: `${BASE}${HUB_PATH}` },
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: sign.faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: BASE },
        { "@type": "ListItem", position: 2, name: "Egyptian symbol meanings", item: `${BASE}${HUB_PATH}` },
        { "@type": "ListItem", position: 3, name: `${sign.name} ${sign.glyph}`, item: url },
      ],
    },
  ];

  const facts: [string, React.ReactNode][] = [
    ["Unicode", <>{sign.codePoint} <span className="text-sand-500">({unicodeNameFor(sign.gardiner)})</span></>],
    ["Gardiner sign", <>{sign.gardiner}, {sign.gardinerDescription}</>],
    ["Transliteration", <em key="t">{sign.transliteration}</em>],
    ["Said", <>&ldquo;{sign.say}&rdquo;</>],
    ["How it was read", sign.reading],
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="min-h-screen bg-obsidian">
        <Navbar />
        <article className="pt-28 md:pt-36 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 font-body text-sm text-sand-600 mb-8">
              <Link href="/" className="hover:text-gold-400 transition-colors">
                Home
              </Link>
              <span>/</span>
              <Link href={HUB_PATH} className="hover:text-gold-400 transition-colors">
                Symbol meanings
              </Link>
              <span>/</span>
              <span className="text-sand-400">{sign.name}</span>
            </nav>

            <header className="mb-8">
              <p className="font-body text-xs tracking-[0.3em] uppercase text-gold-500 mb-4">Hieroglyph meaning</p>
              <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-light text-sand-100 mb-5 leading-tight">
                <span className="hieroglyph-font text-gold-400 mr-3">{sign.glyph}</span>
                {sign.h1}
              </h1>
              <p className="font-body text-xs text-sand-500">
                By{" "}
                <a href="https://x.com/HarryHH1993" target="_blank" rel="noopener noreferrer" className="hover:text-gold-400">
                  Harry Harrison
                </a>{" "}
                · Published <time dateTime={PUBLISHED}>16 October 2026</time>
              </p>
            </header>

            {/* Answer first */}
            <section className="mb-8 border border-gold-500/25 bg-gold-500/5 p-6 md:p-7" aria-labelledby="qa-heading">
              <p id="qa-heading" className="font-body text-[10px] tracking-[0.25em] uppercase text-gold-500 mb-3">
                Quick answer
              </p>
              <p className="font-body text-base md:text-lg text-sand-200 leading-relaxed">{renderInline(sign.quickAnswer)}</p>
            </section>

            {/* The sign itself, to copy */}
            <section
              className="mb-10 flex flex-col gap-6 border border-gold-700/20 bg-obsidian-light/50 p-6 sm:flex-row sm:items-center"
              aria-label={`The ${sign.name} sign`}
            >
              <div className="flex flex-col items-center gap-4 sm:w-48 sm:shrink-0">
                <span id="sign-glyph" lang="egy" className="hieroglyph-font text-8xl leading-[1.2] text-gold-300 sm:text-9xl">
                  {sign.glyph}
                </span>
                <CopySignButton glyph={sign.glyph} sign={sign.slug} />
              </div>
              <dl className="grid grid-cols-1 gap-x-4 gap-y-2 font-body text-sm sm:grid-cols-[auto_1fr]">
                {facts.map(([k, v]) => (
                  <div key={k} className="contents">
                    <dt className="text-gold-500 text-xs uppercase tracking-[0.15em] sm:pt-0.5">{k}</dt>
                    <dd className="text-sand-300 mb-2 sm:mb-0 break-words">{v}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <div className="prose-ancient space-y-10">
              {sign.sections.map((s, i) => (
                <section key={s.heading}>
                  <h2 className="font-display text-2xl md:text-3xl font-semibold text-sand-100 mb-4">{renderInline(s.heading)}</h2>
                  {s.paragraphs.map((p, j) => (
                    <p key={j} className="font-body text-sand-300 font-light leading-relaxed mb-4">
                      {renderInline(p)}
                    </p>
                  ))}
                  {i === 1 && <GuestPlayBanner location="sign_meaning" lazy />}
                </section>
              ))}

              <section>
                <h2 className="font-display text-2xl md:text-3xl font-semibold text-sand-100 mb-4">
                  How to type or copy {sign.glyph}
                </h2>
                <p className="font-body text-sand-300 font-light leading-relaxed mb-4">
                  {sign.glyph} is a real character, not a picture: Unicode added the Egyptian hieroglyphs in 2009, and
                  this one is <strong className="font-medium text-sand-200">{sign.codePoint}</strong>,{" "}
                  {unicodeNameFor(sign.gardiner)}. Press Copy above and it pastes into messages, documents and social
                  posts like any letter. In HTML you can write <code className="text-gold-300">&amp;#x{sign.codePoint.slice(2)};</code>.
                </p>
                <p className="font-body text-sand-300 font-light leading-relaxed">
                  If it shows as an empty box, the device has no hieroglyph font: Windows includes Segoe UI Historic, and
                  Noto Sans Egyptian Hieroglyphs is free for everything else. To spell words with sound signs, try the{" "}
                  <Link href="/hieroglyphics-keyboard" className="text-gold-400 underline underline-offset-2 hover:text-gold-300">
                    hieroglyphics keyboard
                  </Link>
                  .
                </p>
              </section>

              <section aria-labelledby="faq-heading">
                <h2 id="faq-heading" className="font-display text-2xl md:text-3xl font-semibold text-sand-100 mb-6">
                  Frequently asked questions
                </h2>
                <div className="space-y-3">
                  {sign.faqs.map((f) => (
                    <details key={f.q} className="border border-gold-700/15 bg-obsidian-light/50 group">
                      <summary className="cursor-pointer list-none px-5 py-4 font-display text-base md:text-lg text-sand-100 flex justify-between items-center gap-4">
                        <span>{renderInline(f.q)}</span>
                        <span className="text-gold-500 transition-transform group-open:rotate-45" aria-hidden="true">
                          +
                        </span>
                      </summary>
                      <p className="px-5 pb-5 font-body text-sand-300 font-light leading-relaxed">{renderInline(f.a)}</p>
                    </details>
                  ))}
                </div>
              </section>

              {/* Write your own name / learn to read */}
              <section className="border border-gold-600/40 bg-gold-500/10 p-6 md:p-8">
                <h2 className="font-display text-2xl text-sand-100 mb-3">Read the signs around it</h2>
                <p className="font-body text-sand-300 font-light leading-relaxed mb-5">
                  {plainText(sign.name)} is one sign among hundreds. The quickest way in is the 25-sign alphabet: see your
                  own name written in it, then learn to read it in the free first lesson.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <TrackedLink
                    href="/translate-name-to-hieroglyphics"
                    sign={sign.slug}
                    target="translator"
                    className="inline-flex justify-center items-center gap-2 bg-gold-500 px-5 py-3 font-body text-sm font-semibold text-black hover:bg-gold-400"
                  >
                    Write my name in hieroglyphs
                  </TrackedLink>
                  <TrackedLink
                    href={guestPlayHref()}
                    sign={sign.slug}
                    target="lesson"
                    className="inline-flex justify-center items-center gap-2 border border-gold-500/60 px-5 py-3 font-body text-sm font-semibold text-gold-300 hover:border-gold-400 hover:text-gold-200"
                  >
                    Start Lesson 1 free
                  </TrackedLink>
                </div>
              </section>

              {/* Related signs */}
              <nav aria-labelledby="related-heading">
                <h2 id="related-heading" className="font-display text-xl text-sand-100 mb-4">
                  Other Egyptian symbols
                </h2>
                <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {[
                    ...others.map((o) => ({ glyph: o.glyph, name: o.name, href: signMeaningPath(o.slug), blurb: o.hubBlurb, key: o.slug })),
                    { glyph: ANKH_POST.glyph, name: ANKH_POST.name, href: ANKH_POST.href, blurb: ANKH_POST.blurb, key: "ankh" },
                  ].map((r) => (
                    <li key={r.key}>
                      <TrackedLink
                        href={r.href}
                        sign={sign.slug}
                        target={`related_${r.key}`}
                        className="flex h-full items-center gap-4 border border-gold-700/20 bg-obsidian-light/50 p-4 transition-colors hover:border-gold-500/60"
                      >
                        <span className="hieroglyph-font text-4xl text-gold-400" aria-hidden="true">
                          {r.glyph}
                        </span>
                        <span>
                          <span className="block font-display text-sand-100">{r.name}</span>
                          <span className="block font-body text-xs text-sand-400 leading-snug">{r.blurb}</span>
                        </span>
                      </TrackedLink>
                    </li>
                  ))}
                </ul>
                <p className="font-body text-sm text-sand-400 mt-4">
                  <Link href={HUB_PATH} className="text-gold-400 underline underline-offset-2 hover:text-gold-300">
                    All symbol meanings
                  </Link>{" "}
                  ·{" "}
                  <Link href="/blog/5-hieroglyphs-you-already-know" className="text-gold-400 underline underline-offset-2 hover:text-gold-300">
                    5 hieroglyphs you already know
                  </Link>
                </p>
              </nav>
            </div>
          </div>
        </article>
        <Footer />
      </main>
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { guestPlayHref } from "@/lib/guest-play";
import { ANKH_POST, HUB_PATH, PUBLISHED, SIGN_MEANINGS, signMeaningPath } from "@/lib/sign-meanings";
import { TrackedLink } from "./SignMeaningClient";

const BASE = "https://www.learnhieroglyphics.com";
const URL = `${BASE}${HUB_PATH}`;
const OG_IMAGE = `${BASE}/blog/five-egyptian-hieroglyphs-you-already-know.webp`;
const TITLE = "Egyptian Symbol Meanings: 𓂀 𓋹 𓆣 𓊽";
const DESCRIPTION =
  "What the famous Egyptian symbols mean: 𓂀 the Eye of Horus (protection), 𓋹 the ankh (life), 𓆣 the scarab (coming into being) and 𓊽 the djed (stability). Copy each sign.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: URL,
    type: "website",
    siteName: "Learn Hieroglyphics",
    locale: "en_GB",
    images: [OG_IMAGE],
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, images: [OG_IMAGE] },
};

type Entry = { glyph: string; name: string; href: string; blurb: string; key: string; codePoint: string; gardiner: string };

const ENTRIES: Entry[] = [
  ...SIGN_MEANINGS.map((s) => ({
    glyph: s.glyph,
    name: s.name,
    href: signMeaningPath(s.slug),
    blurb: s.hubBlurb,
    key: s.slug,
    codePoint: s.codePoint,
    gardiner: s.gardiner,
  })),
  { ...ANKH_POST, key: "ankh" },
];
// ankh second, as it is usually listed: eye, ankh, scarab, djed
const ORDERED = ["eye-of-horus", "ankh", "scarab", "djed-pillar"]
  .map((k) => ENTRIES.find((e) => e.key === k))
  .filter((e): e is Entry => e !== undefined);

export default function SignMeaningHub() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: TITLE,
      description: DESCRIPTION,
      url: URL,
      inLanguage: "en-GB",
      datePublished: PUBLISHED,
      mainEntity: {
        "@type": "ItemList",
        itemListElement: ORDERED.map((e, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: `${e.glyph} ${e.name}`,
          url: `${BASE}${e.href}`,
        })),
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: BASE },
        { "@type": "ListItem", position: 2, name: "Egyptian symbol meanings", item: URL },
      ],
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="min-h-screen bg-obsidian">
        <Navbar />
        <article className="pt-28 md:pt-36 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 font-body text-sm text-sand-600 mb-8">
              <Link href="/" className="hover:text-gold-400 transition-colors">
                Home
              </Link>
              <span>/</span>
              <span className="text-sand-400">Symbol meanings</span>
            </nav>

            <header className="mb-8">
              <p className="font-body text-xs tracking-[0.3em] uppercase text-gold-500 mb-4">Hieroglyph meanings</p>
              <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-light text-sand-100 mb-5 leading-tight">
                Egyptian symbol meanings{" "}
                <span className="hieroglyph-font text-gold-400 whitespace-nowrap">𓂀 𓋹 𓆣 𓊽</span>
              </h1>
              <p className="font-body text-lg text-sand-400 font-light leading-relaxed">
                Pasted a hieroglyph into a search box? Here is what the most famous ones meant to the people who
                carved them, how each worked in writing, and how to copy it.
              </p>
            </header>

            <section className="mb-10 border border-gold-500/25 bg-gold-500/5 p-6 md:p-7" aria-labelledby="qa-heading">
              <p id="qa-heading" className="font-body text-[10px] tracking-[0.25em] uppercase text-gold-500 mb-3">
                Quick answer
              </p>
              <p className="font-body text-base md:text-lg text-sand-200 leading-relaxed">
                The four best-known Egyptian symbols are working hieroglyphs: the Eye of Horus{" "}
                <span className="hieroglyph-font">𓂀</span> (<em>wedjat</em>) means protection and healing; the ankh{" "}
                <span className="hieroglyph-font">𓋹</span> (<em>ꜥnḫ</em>) means life; the scarab{" "}
                <span className="hieroglyph-font">𓆣</span> (<em>ḫpr</em>) means &ldquo;to come into being&rdquo;; and
                the djed pillar <span className="hieroglyph-font">𓊽</span> (<em>ḏd</em>) means stability. Each was
                also a sign with a sound value in the script, not only a lucky charm.
              </p>
            </section>

            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-12">
              {ORDERED.map((e) => (
                <li key={e.key}>
                  <TrackedLink
                    href={e.href}
                    sign="hub"
                    target={`related_${e.key}`}
                    className="flex h-full items-center gap-5 border border-gold-700/20 bg-obsidian-light/50 p-5 transition-colors hover:border-gold-500/60"
                  >
                    <span className="hieroglyph-font text-6xl leading-none text-gold-300" aria-hidden="true">
                      {e.glyph}
                    </span>
                    <span>
                      <span className="block font-display text-xl text-sand-100">
                        {e.name} <span className="hieroglyph-font">{e.glyph}</span> meaning
                      </span>
                      <span className="block font-body text-sm text-sand-400 leading-snug mt-1">{e.blurb}</span>
                      <span className="block font-body text-xs text-sand-500 mt-2">
                        {e.codePoint} · Gardiner {e.gardiner}
                      </span>
                    </span>
                  </TrackedLink>
                </li>
              ))}
            </ul>

            <section className="prose-ancient mb-12">
              <h2 className="font-display text-2xl md:text-3xl font-semibold text-sand-100 mb-4">
                Symbols, or letters?
              </h2>
              <p className="font-body text-sand-300 font-light leading-relaxed mb-4">
                Both. None of these four is one of the 25 &ldquo;alphabet&rdquo; signs, but each was used in
                ordinary writing for its sounds: the scarab spells <em>ḫ-p-r</em> in words that have nothing to do with
                beetles, and the djed spells <em>ḏ-d</em>. The same pictures were also worn as amulets, because the
                Egyptians believed a written sign could do what it said. For more famous signs, including the sun
                disc, see{" "}
                <Link href="/blog/5-hieroglyphs-you-already-know" className="text-gold-400 underline underline-offset-2 hover:text-gold-300">
                  5 hieroglyphs you already know
                </Link>
                , and for the sound signs, the{" "}
                <Link href="/hieroglyphic-alphabet" className="text-gold-400 underline underline-offset-2 hover:text-gold-300">
                  hieroglyphic alphabet
                </Link>
                .
              </p>
            </section>

            <section className="border border-gold-600/40 bg-gold-500/10 p-6 md:p-8">
              <h2 className="font-display text-2xl text-sand-100 mb-3">Write your own name in hieroglyphs</h2>
              <p className="font-body text-sand-300 font-light leading-relaxed mb-5">
                See your name spelled in the signs scribes used for names, then learn to read them yourself in the
                free first lesson.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <TrackedLink
                  href="/translate-name-to-hieroglyphics"
                  sign="hub"
                  target="translator"
                  className="inline-flex justify-center items-center gap-2 bg-gold-500 px-5 py-3 font-body text-sm font-semibold text-black hover:bg-gold-400"
                >
                  Write my name in hieroglyphs
                </TrackedLink>
                <TrackedLink
                  href={guestPlayHref()}
                  sign="hub"
                  target="lesson"
                  className="inline-flex justify-center items-center gap-2 border border-gold-500/60 px-5 py-3 font-body text-sm font-semibold text-gold-300 hover:border-gold-400 hover:text-gold-200"
                >
                  Start Lesson 1 free
                </TrackedLink>
              </div>
            </section>
          </div>
        </article>
        <Footer />
      </main>
    </>
  );
}

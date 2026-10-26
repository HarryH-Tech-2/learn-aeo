import type { Metadata } from "next";
import { toolAlternates } from "@/lib/i18n";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GuestPlayBanner from "@/components/GuestPlayBanner";
import AlphabetTable, { ENGLISH_EQUIVALENT, UNILITERALS } from "@/components/AlphabetTable";
import AlphabetSelfTest from "@/components/AlphabetSelfTest";
import ClassVisitStrip from "@/components/ClassVisitStrip";
import NameBox from "@/components/NameBox";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import type { ChartSign } from "@/lib/sign-quiz";

const BASE = "https://www.learnhieroglyphics.com";
const PUBLISHED = "2026-08-24";

export const metadata: Metadata = {
  title: "Hieroglyphic Alphabet: All 25 Signs, Sounds & Chart",
  description:
    "All 25 signs of the hieroglyphic alphabet in one chart: the sound each makes, what it pictures and an example word. Plus why there are no vowels or L.",
  alternates: toolAlternates("alphabet", "en"),
  openGraph: {
    title: "The Hieroglyphic Alphabet: All 25 Signs, Sounds & Chart",
    description:
      "Every single-sound hieroglyph with its pronunciation, Gardiner code, origin and an example word: the chart the ancient Egyptian 'alphabet' actually consisted of.",
    url: `${BASE}/hieroglyphic-alphabet`,
    type: "article",
    images: [`${BASE}/og-homepage.jpg`],
  },
};

const FAQ = [
  {
    q: "How many letters are in the hieroglyphic alphabet?",
    a: "Twenty-four sounds, written with twenty-five signs: the double reed (y) is usually listed alongside the single reed (ꞽ). They are called uniliteral signs because each writes exactly one consonant. Egyptian also used hundreds of two- and three-consonant signs and silent determinatives, so the 'alphabet' is only the first layer of the script.",
  },
  {
    q: "Why does the hieroglyphic alphabet have no vowels?",
    a: "Egyptian writing recorded consonants only, like Arabic and Hebrew still do; readers supplied the vowels from context. When Egyptologists pronounce a word they insert a conventional 'e' between consonants, which is why the god's name written ꞽmn is said 'Amun' or 'Amen'. For modern names the weak consonants 𓄿, 𓇋 and 𓅱 stand in for a, i/e and u/o.",
  },
  {
    q: "Is there a hieroglyph for the letter L?",
    a: "Not originally. Classical Egyptian had no distinct l sound and used 𓂋 (r) where we would expect one. From the Ptolemaic period, scribes spelling Greek and Roman names used the recumbent lion 𓃭 for l, which is how Cleopatra and Ptolemy are written, and how the name translator on this site writes an L.",
  },
  {
    q: "What about C, J, V, X and other English letters?",
    a: "They are written by sound. A hard c is 𓎡 (k) or 𓈎 (q) and a soft c is 𓋴 (s); j is 𓆓 (ḏ, as in 'judge'); v is 𓆑 (f); x is written as k + s (𓎡𓋴); ch is 𓍿 (as in 'church') or 𓐍 (as in Scottish 'loch'); sh is 𓈙; th is simply 𓏏 (t), because Egyptian had no 'th' sound.",
  },
  {
    q: "Which direction do you read hieroglyphs?",
    a: "Towards the faces. Signs that show a person or animal look towards the start of the line, so if the birds face left you read left to right, and if they face right you read right to left. Columns are read top to bottom. Most modern charts, including this one, print the signs facing left for left-to-right reading.",
  },
  {
    q: "What are Gardiner codes?",
    a: "Sir Alan Gardiner's Egyptian Grammar (1927) numbered every common hieroglyph within a lettered category: G for birds, D for parts of the body, N for sky and earth, and so on. G1 is the vulture, D21 the mouth, N35 the water ripple. Egyptologists worldwide use these codes to refer to a sign unambiguously, and the codes in the chart above are the ones you will see in dictionaries and museum catalogues.",
  },
];

/** The chart's signs as the self-test under it asks them. */
const CHART_SIGNS: ChartSign[] = UNILITERALS.map((g) => ({
  glyph: g.symbol,
  english: ENGLISH_EQUIVALENT[g.symbol] ?? g.transliteration,
  name: g.meaning.split(/: | — /)[0],
}));

export default function HieroglyphicAlphabetPage() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "The Hieroglyphic Alphabet: All 25 Signs, Sounds & Chart",
      description: metadata.description,
      abstract:
        "The hieroglyphic alphabet is the set of 25 uniliteral signs (hieroglyphs that each write a single consonant) with which ancient Egyptian scribes spelled out words and foreign names. Egyptian wrote no vowels and had no native L; the vulture, reed and quail chick stand in for vowel sounds and the lion was later used for L in Greek names.",
      datePublished: PUBLISHED,
      dateModified: PUBLISHED,
      inLanguage: "en",
      mainEntityOfPage: { "@type": "WebPage", "@id": `${BASE}/hieroglyphic-alphabet` },
      author: {
        "@type": "Person",
        name: "Harry Harrison",
        url: `${BASE}/about`,
        sameAs: ["https://x.com/HarryHH1993", "https://www.linkedin.com/in/harry-harrison/"],
      },
      publisher: {
        "@type": "Organization",
        name: "Learn Hieroglyphics",
        url: BASE,
        logo: { "@type": "ImageObject", url: `${BASE}/icon-512.png` },
      },
      about: UNILITERALS.map((g) => ({
        "@type": "Thing",
        name: `${g.symbol} ${g.transliteration}`,
        description: g.meaning,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: BASE },
        { "@type": "ListItem", position: 2, name: "Hieroglyphic Alphabet", item: `${BASE}/hieroglyphic-alphabet` },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQ.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="min-h-screen bg-obsidian">
        <Navbar />
        <article className="pt-28 md:pt-36 pb-20 px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Breadcrumb, and the chart in Spanish and French */}
            <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 mb-8">
              <nav aria-label="Breadcrumb" className="flex items-center gap-2 font-body text-sm text-sand-600">
                <Link href="/" className="hover:text-gold-400 transition-colors">
                  Home
                </Link>
                <span>/</span>
                <span className="text-sand-400">Hieroglyphic Alphabet</span>
              </nav>
              <LanguageSwitcher page="alphabet" current="en" />
            </div>

            <ClassVisitStrip className="mb-8" />

            <header className="mb-10">
              <p className="font-body text-xs tracking-[0.3em] uppercase text-gold-500 mb-4">Reference chart</p>
              <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-light text-sand-100 mb-5 leading-tight">
                The Hieroglyphic Alphabet: <span className="text-gradient-gold font-medium">All 25 Signs</span>
              </h1>
              <p className="font-body text-lg text-sand-400 font-light leading-relaxed">
                Every single-sound hieroglyph with its pronunciation, Gardiner code, what the picture shows, and a
                real Egyptian word that uses it.
              </p>
              <p className="font-body text-xs text-sand-500 mt-4">
                By{" "}
                <a href="https://x.com/HarryHH1993" target="_blank" rel="noopener noreferrer" className="hover:text-gold-400">
                  Harry Harrison
                </a>{" "}
                · Published <time dateTime={PUBLISHED}>24 August 2026</time>
              </p>
              <p className="font-body text-sm mt-4">
                <a href="#test-yourself" className="text-gold-400 hover:text-gold-300 underline underline-offset-4">
                  Know them already? Test yourself on all 25 <span aria-hidden="true">↓</span>
                </a>
              </p>
            </header>

            <GuestPlayBanner location="alphabet" />

            {/* Answer-first definition */}
            <section className="mb-10 border border-gold-500/25 bg-gold-500/5 p-6 md:p-7" aria-labelledby="qa-heading">
              <p id="qa-heading" className="font-body text-[10px] tracking-[0.25em] uppercase text-gold-500 mb-3">
                Quick answer
              </p>
              <p className="font-body text-base md:text-lg text-sand-200 leading-relaxed">
                The <strong className="text-sand-100 font-medium">hieroglyphic alphabet</strong> is the set of 25{" "}
                <em>uniliteral</em> signs (hieroglyphs that each write one consonant) with which ancient Egyptian
                scribes spelled words and, later, foreign names such as Cleopatra. It records no vowels: the vulture{" "}
                <span className="hieroglyph-font">𓄿</span>, reed <span className="hieroglyph-font">𓇋</span> and quail
                chick <span className="hieroglyph-font">𓅱</span> stand in for vowel sounds, and the lion{" "}
                <span className="hieroglyph-font">𓃭</span> was used for <em>L</em>, a sound classical Egyptian did not
                write. The alphabet is the first thing to learn, but the script also used hundreds of two- and
                three-sound signs and silent determinatives.
              </p>
            </section>

            <AlphabetTable variant="full" className="mb-4" />
            <p className="mb-4">
              <Link href="/hieroglyphic-alphabet/print" className="btn-secondary text-sm py-2.5 px-5">
                Print the chart (one A4 page, with room for notes)
              </Link>
            </p>
            <p className="font-body text-xs text-sand-500 mb-10">
              Signs are printed facing left, for reading left to right. Transliteration follows Gardiner&apos;s{" "}
              <em>Egyptian Grammar</em> and Allen&apos;s <em>Middle Egyptian</em>; &ldquo;say&rdquo; values are the
              conventional Egyptological pronunciation, not a reconstruction of ancient speech.
            </p>

            <AlphabetSelfTest signs={CHART_SIGNS} />

            <div className="prose-ancient space-y-10">
              <section>
                <h2 className="font-display text-2xl md:text-3xl font-semibold text-sand-100 mb-4">
                  Why does the alphabet have no vowels?
                </h2>
                <p className="font-body text-sand-300 font-light leading-relaxed mb-4">
                  Egyptian belongs to the Afro-Asiatic family, alongside Arabic and Hebrew, and like them it wrote
                  the consonant skeleton of a word and left the vowels to the reader. A native speaker seeing{" "}
                  <span className="hieroglyph-font">𓊪𓂋</span> <em>pr</em> knew from context whether it meant
                  &ldquo;house&rdquo; or &ldquo;to go out&rdquo;, just as an English reader copes with{" "}
                  <em>rd</em> for &ldquo;read&rdquo; or &ldquo;road&rdquo; in a text message.
                </p>
                <p className="font-body text-sand-300 font-light leading-relaxed">
                  Because the vowels were never written, nobody knows exactly how most Egyptian words sounded.
                  Egyptologists insert a conventional <em>e</em> between consonants to make words sayable, so{" "}
                  <em>nfr</em> becomes &ldquo;nefer&rdquo; and <em>ꞽmn</em> becomes &ldquo;Amun&rdquo;. When you
                  write a modern name, the three weak consonants <span className="hieroglyph-font">𓄿 𓇋 𓅱</span>{" "}
                  do duty as <em>a</em>, <em>i/e</em> and <em>u/o</em>, which is exactly what Ptolemaic scribes did
                  for Greek names.
                </p>
              </section>

              <section>
                <h2 className="font-display text-2xl md:text-3xl font-semibold text-sand-100 mb-4">
                  Why is there no L, and what about C, J, V and X?
                </h2>
                <p className="font-body text-sand-300 font-light leading-relaxed mb-4">
                  Classical Egyptian had no separate <em>l</em>; where we would expect one it used{" "}
                  <span className="hieroglyph-font">𓂋</span> <em>r</em>. When Greek rulers arrived after 332 BCE
                  their scribes needed the sound constantly (Ptolemy, Cleopatra, Alexander) and settled on the
                  recumbent lion <span className="hieroglyph-font">𓃭</span>, whose Egyptian name <em>rw</em>{" "}
                  had by then come to be pronounced with an <em>l</em>. That is the sign every modern name
                  translator uses for <em>L</em>.
                </p>
                <ul className="font-body text-sand-300 font-light leading-relaxed list-disc pl-5 space-y-1">
                  <li>
                    <strong className="text-sand-200">C</strong>: hard <em>c</em> is <span className="hieroglyph-font">𓎡</span>{" "}
                    <em>k</em> (or <span className="hieroglyph-font">𓈎</span> <em>q</em> in Cleopatra); soft <em>c</em> is{" "}
                    <span className="hieroglyph-font">𓋴</span> <em>s</em>.
                  </li>
                  <li>
                    <strong className="text-sand-200">J</strong>: <span className="hieroglyph-font">𓆓</span> <em>ḏ</em>, the cobra,
                    pronounced like the <em>j</em> in &ldquo;judge&rdquo;.
                  </li>
                  <li>
                    <strong className="text-sand-200">V</strong>: <span className="hieroglyph-font">𓆑</span> <em>f</em>, the horned
                    viper; Egyptian did not distinguish <em>f</em> from <em>v</em>.
                  </li>
                  <li>
                    <strong className="text-sand-200">X</strong>: two signs, <span className="hieroglyph-font">𓎡𓋴</span> <em>ks</em>.
                  </li>
                  <li>
                    <strong className="text-sand-200">Ch, Sh, Th</strong>: <span className="hieroglyph-font">𓍿</span> (church) or{" "}
                    <span className="hieroglyph-font">𓐍</span> (loch); <span className="hieroglyph-font">𓈙</span> <em>š</em>; and plain{" "}
                    <span className="hieroglyph-font">𓏏</span> <em>t</em>, since there was no <em>th</em>.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="font-display text-2xl md:text-3xl font-semibold text-sand-100 mb-4">
                  How to write your name in hieroglyphs
                </h2>
                <p className="font-body text-sand-300 font-light leading-relaxed mb-4">
                  Spell the name by sound, not by English spelling: <em>Philip</em> starts with{" "}
                  <span className="hieroglyph-font">𓆑</span> (<em>f</em>), <em>Charlotte</em> with{" "}
                  <span className="hieroglyph-font">𓈙</span> (<em>sh</em>), and a double letter is written once.
                  Drop silent letters, keep the vowels only where they carry a real sound, and enclose the result in
                  a cartouche, the rope loop that marked a royal name.
                </p>
                {/* the translator itself, mid-article, where the plain "Write my name" link was */}
                <NameBox location="alphabet" placement="inline" className="mb-4" />
                <Link href="/teachers/worksheet" className="btn-secondary text-sm py-3 px-6 justify-center">
                  Printable alphabet worksheet
                </Link>
              </section>

              <section>
                <h2 className="font-display text-2xl md:text-3xl font-semibold text-sand-100 mb-4">
                  How to learn the 25 signs
                </h2>
                <p className="font-body text-sand-300 font-light leading-relaxed mb-4">
                  Most people can learn the alphabet in a single sitting if they learn each sign as a picture with
                  a sound, not as a shape. The owl <span className="hieroglyph-font">𓅓</span> is <em>m</em>; the
                  water ripple <span className="hieroglyph-font">𓈖</span> is <em>n</em>; the mouth{" "}
                  <span className="hieroglyph-font">𓂋</span> is <em>r</em>. Once the pictures are fixed, the next
                  step is reading them inside real words and royal names, which is where cartouches come in.
                </p>
                <ul className="font-body text-sand-300 font-light leading-relaxed list-disc pl-5 space-y-1">
                  <li>
                    <Link href="/get-started" className="text-gold-400 hover:text-gold-300 underline underline-offset-2">
                      The free first lesson
                    </Link>{" "}
                    teaches all 25 signs with audio, quick checks and a real inscription to read, in about 25 minutes.
                  </li>
                  <li>
                    <Link href="/blog/reading-your-first-cartouche" className="text-gold-400 hover:text-gold-300 underline underline-offset-2">
                      Reading your first cartouche
                    </Link>{" "}
                    walks through Tutankhamun, Cleopatra and Ramesses II sign by sign.
                  </li>
                  <li>
                    <Link href="/hieroglyphics-keyboard" className="text-gold-400 hover:text-gold-300 underline underline-offset-2">
                      The hieroglyphics keyboard
                    </Link>{" "}
                    types the sign for every key you press, with its name and sound.
                  </li>
                  <li>
                    <Link href="/games/sign-hunt" className="text-gold-400 hover:text-gold-300 underline underline-offset-2">
                      Sign Hunt
                    </Link>{" "}
                    drills the alphabet against 3D models of the objects each sign depicts.
                  </li>
                </ul>
              </section>

              <section aria-labelledby="faq-heading">
                <h2 id="faq-heading" className="font-display text-2xl md:text-3xl font-semibold text-sand-100 mb-6">
                  Frequently asked questions
                </h2>
                <div className="space-y-3">
                  {FAQ.map((f) => (
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

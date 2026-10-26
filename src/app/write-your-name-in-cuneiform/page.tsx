import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NameToolLinks from "@/components/NameToolLinks";
import { cuneiformName } from "@/lib/cuneiform";
import CuneiformTool from "./CuneiformTool";

/**
 * A free cuneiform name writer (2026-10-24): a cheap test of demand for a cuneiform course before building one.
 * Measure: GSC impressions for cuneiform queries, cuneiform_* events, and EmailLead rows with source cuneiform-course.
 */
const BASE = "https://www.learnhieroglyphics.com";
const URL = `${BASE}/write-your-name-in-cuneiform`;
const PUBLISHED = "2026-10-24";

export const metadata: Metadata = {
  title: "Write Your Name in Cuneiform: Free Babylonian Name Converter | Learn Hieroglyphics",
  description:
    "Free cuneiform name converter. Type your name and see it in Babylonian cuneiform, written syllable by syllable the way scribes wrote foreign names, with every sign explained, and the same name in Egyptian hieroglyphs beside it.",
  alternates: { canonical: URL },
  openGraph: {
    title: "Write Your Name in Cuneiform",
    description: "Your name in Babylonian cuneiform, sign by sign, and how the world's other oldest writing compares with Egyptian hieroglyphs.",
    url: URL,
    type: "website",
    images: [`${BASE}/blog/cuneiform-and-hieroglyphs-side-by-side.webp`],
  },
};

const harry = cuneiformName("Harry");

const FAQ = [
  {
    q: "Is cuneiform the oldest writing in the world?",
    a: "It is one of the two oldest. The first cuneiform tablets come from Uruk in southern Iraq and date to about 3400 to 3200 BCE; the first Egyptian hieroglyphs, on labels from tomb U-j at Abydos, date to about 3250 BCE. The dates overlap, so scholars still debate which came first. Writing was later invented separately in China and in Mesoamerica.",
  },
  {
    q: "Is cuneiform a language?",
    a: "No, it is a script: a way of writing, like the Latin alphabet. Over three thousand years it was used for more than a dozen languages, among them Sumerian, Akkadian (the language of Babylon and Assyria), Hittite, Elamite, Hurrian and Urartian, and Old Persian used a simplified cuneiform of its own. This converter writes names the way Old Babylonian scribes wrote Akkadian, in the time of Hammurabi.",
  },
  {
    q: "Is Sumerian the oldest language?",
    a: "Sumerian is one of the two oldest written languages, with Egyptian. Nobody can say which spoken language is the oldest, because speech leaves no trace before writing. Sumerian is also a language isolate: it has no known relatives, living or dead.",
  },
  {
    q: "How do you write a name in cuneiform?",
    a: `Syllable by syllable. Cuneiform has no alphabet; its sound signs stand for syllables such as ba, ri or ak. Babylonian scribes wrote foreign names by sound, so a name is split into syllables and each gets its sign: Harry is ${harry.transliteration}, ${harry.text}. A scribe would usually add a silent marker before a personal name, a single upright wedge for a man and the sign for 'woman' for a woman.`,
  },
  {
    q: "How accurate is the cuneiform name converter?",
    a: "It follows the rules a scribe would: Akkadian has four vowels (a, e, i, u) and no o, f, v or j, so o is written u, f as p, v as b and j as y. The signs and their readings come from the standard sign lists for Old Babylonian. But a modern name never had an ancient spelling, so treat the result as one good way to write it, not the only one. Spell the name the way it sounds (Mikel for Michael) for the best result.",
  },
  {
    q: "Did the ancient Egyptians use cuneiform?",
    a: "Yes, for foreign affairs. The Amarna letters, about 380 clay tablets found at Akhenaten's capital in Egypt, are the letters between the pharaohs and the kings of Babylon, Assyria, Mitanni and the Hittites, and the rulers of Canaan, written in Akkadian cuneiform, the diplomatic language of the time. Scribes in Egypt trained to read and write it, practising on Babylonian myths.",
  },
  {
    q: "How many cuneiform signs are there?",
    a: "Around 600 were in common use at any one time, and about a thousand are known overall. A Babylonian scribe writing letters managed with a core of roughly 200. Each sign could have several readings, as a syllable, a whole word, or a silent classifier, so reading cuneiform means knowing which reading fits.",
  },
  {
    q: "Which way is cuneiform read?",
    a: "Left to right, in lines across the tablet. The earliest tablets were written in columns from top to bottom, and the whole script was later turned on its side, which is why the oldest signs look rotated a quarter turn compared with later ones.",
  },
  {
    q: "Can I copy and paste cuneiform?",
    a: "Yes. Cuneiform has been in Unicode since 2006, so the Copy button gives you text you can paste anywhere. If the signs show as empty boxes, the device has no cuneiform font; the free Noto Sans Cuneiform font fixes that, and Windows has one built in (Segoe UI Historic).",
  },
];

export default function CuneiformNamePage() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "Cuneiform Name Converter",
      url: URL,
      description:
        "Writes a name in Old Babylonian cuneiform syllable by syllable, with each sign's reading and name, an optional personal-name marker, and the same name in Egyptian hieroglyphs.",
      applicationCategory: "EducationalApplication",
      operatingSystem: "Any",
      browserRequirements: "Requires JavaScript",
      isAccessibleForFree: true,
      datePublished: PUBLISHED,
      dateModified: PUBLISHED,
      inLanguage: "en",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      featureList: [
        "Any name in Old Babylonian cuneiform, written by syllables",
        "Each sign's reading and standard sign name",
        "The man's or woman's name marker scribes put before a personal name",
        "Scholarly transliteration of the result",
        "The same name in Egyptian hieroglyphs",
        "Copy the cuneiform as Unicode text",
      ],
      author: { "@type": "Person", name: "Harry Harrison", url: `${BASE}/about`, sameAs: ["https://x.com/HarryHH1993", "https://www.linkedin.com/in/harry-harrison/"] },
      provider: { "@type": "Organization", name: "Learn Hieroglyphics", url: BASE },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: BASE },
        { "@type": "ListItem", position: 2, name: "Write Your Name in Cuneiform", item: URL },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
  ];

  const h2 = "font-display text-2xl md:text-3xl font-semibold text-sand-100 mb-4";
  const para = "font-body text-sand-300 font-light leading-relaxed";
  const inline = "text-gold-400 hover:text-gold-300 underline underline-offset-2";
  // (the cuneiform face is in the site-wide font stack, layout.tsx)
  const cf = "font-body";
  const glyph = "hieroglyph-font";
  const examples = ["Anna", "Jack", "Sophie", "Thomas", "Olivia", "Hammurabi"].map((n) => ({ n, ...cuneiformName(n) }));

  const compare: [string, string, string][] = [
    ["First written", "c. 3400–3200 BCE, Uruk (Iraq)", "c. 3250 BCE, Abydos (Egypt)"],
    ["Written on", "Clay, pressed with a reed stylus", "Stone, wood and papyrus, carved or painted"],
    ["Sound signs stand for", "Syllables with their vowels (ba, ri, ak)", "Consonants only, no vowels (n, ḥ, nfr)"],
    ["Signs in use", "About 600", "About 700 in Middle Egyptian"],
    ["Word signs and classifiers", "Yes; classifiers usually before the word", "Yes; classifiers after the word"],
    ["Languages written", "Sumerian, Akkadian, Hittite and a dozen more", "Egyptian only"],
    ["Direction", "Left to right", "Usually right to left, any direction"],
    ["Last use", "c. 75 CE, an astronomical tablet", "394 CE, at the temple of Philae"],
    ["Deciphered", "1850s, from the Behistun inscription", "1822, from the Rosetta Stone"],
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="min-h-screen bg-obsidian">
        <Navbar />
        <article className="pt-20 md:pt-28 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 font-body text-sm text-sand-600 mb-4">
              <Link href="/" className="hover:text-gold-400 transition-colors">
                Home
              </Link>
              <span>/</span>
              <span className="text-sand-400">Write Your Name in Cuneiform</span>
            </nav>

            <header className="mb-6">
              <h1 className="font-display text-3xl md:text-4xl font-light text-sand-100 mb-2 leading-tight">Write Your Name in Cuneiform</h1>
              <p className="font-body text-lg text-sand-400 font-light leading-relaxed max-w-2xl">
                Type your name and see it in Babylonian cuneiform, the wedge-shaped writing of ancient Iraq, written syllable by syllable the way a scribe would have.
              </p>
            </header>

            <CuneiformTool fontClass={cf} />

            <div className="max-w-4xl">
              <section className="mb-12 border border-gold-500/25 bg-gold-500/5 p-6 md:p-7" aria-labelledby="qa-heading">
                <p id="qa-heading" className="font-body text-[10px] tracking-[0.25em] uppercase text-gold-500 mb-3">
                  Quick answer
                </p>
                <p className="font-body text-base md:text-lg text-sand-200 leading-relaxed">
                  <strong className="text-sand-100 font-medium">Cuneiform</strong> is a writing system, not a language: wedge-shaped marks pressed into clay with a
                  reed, invented in Sumer (southern Iraq) around 3400 to 3200 BCE and used for some 3,000 years to write Sumerian, Akkadian, Hittite and other
                  languages. It and Egyptian hieroglyphs are the two oldest writing systems in the world. Cuneiform&apos;s sound signs stand for syllables, so a
                  name is written syllable by syllable: Harry is <em>{harry.transliteration}</em>, <span className={cf}>{harry.text}</span>.
                </p>
              </section>

              <div className="space-y-12 mt-12">
                <section aria-labelledby="how-heading">
                  <h2 id="how-heading" className={h2}>
                    How the converter writes your name
                  </h2>
                  <ol className={`${para} list-decimal pl-6 space-y-2`}>
                    <li>
                      <strong className="text-sand-100 font-medium">Your spelling becomes Babylonian sounds.</strong> Akkadian had four vowels, a, e, i and u, and
                      no o, f, v, j or th. So o is written u, f as p, v as b, j as y and th as t. An h becomes ḫ, the rough &ldquo;ch&rdquo; of Scottish
                      &ldquo;loch&rdquo;, and sh is š.
                    </li>
                    <li>
                      <strong className="text-sand-100 font-medium">The sounds are split into syllables.</strong> A consonant and its vowel make one sign (ḫa,
                      ri). A consonant that closes a syllable joins the vowel before it (ak, in), and a consonant left on its own gets a helper vowel, as scribes
                      did.
                    </li>
                    <li>
                      <strong className="text-sand-100 font-medium">Each syllable gets its sign.</strong> One sign can have several readings, so you will see a
                      syllable written with a sign named for another: pi with the BI sign, wa with PI, ši with IGI (&ldquo;eye&rdquo;). That is real cuneiform,
                      not a mistake.
                    </li>
                    <li>
                      <strong className="text-sand-100 font-medium">A marker, if you want one.</strong> Scribes put a silent sign before a personal name: a single
                      upright wedge <span className={cf}>𒁹</span> for a man, the sign for &ldquo;woman&rdquo; <span className={cf}>𒊩</span> for a woman.
                      Scholars write them as a raised ᵐ and ᶠ.
                    </li>
                  </ol>
                  <p className={`${para} mt-4`}>
                    No modern name had an ancient spelling, so the result is one good way to write yours, not the only one. Spell the name the way it sounds
                    (Mikel for Michael, Shawn for Sean) and the converter does better.
                  </p>
                </section>

                <section aria-labelledby="examples-heading">
                  <h2 id="examples-heading" className={h2}>
                    Names in cuneiform
                  </h2>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {examples.map((e) => (
                      <figure key={e.n} className="border border-gold-700/25 bg-obsidian-light/40 p-4 text-center">
                        <p className={`${cf} text-4xl text-sand-100`}>{e.text}</p>
                        <figcaption className="mt-3 font-body text-sm text-sand-400">
                          <span className="block font-display text-lg text-sand-100">{e.n}</span>
                          <em className="text-gold-300">{e.transliteration}</em>
                        </figcaption>
                      </figure>
                    ))}
                  </div>
                  <p className={`${para} mt-4`}>
                    Hammurabi&apos;s own scribes usually wrote his name with a doubled m, ḫa-am-mu-ra-bi: doubled consonants were spelled out in Akkadian. The
                    converter writes a double letter once, because English spells many sounds double that are said once.
                  </p>
                </section>

                <section aria-labelledby="hiero-heading">
                  <h2 id="hiero-heading" className={h2}>
                    Cuneiform and Egyptian hieroglyphs
                  </h2>
                  <p className={`${para} mb-4`}>
                    Cuneiform and hieroglyphs were invented within a century or two of each other, some 1,500 kilometres apart, and they are the two oldest
                    writing systems we know. Whether Egypt took the <em>idea</em> of writing from Mesopotamia is still argued. The signs, the materials and
                    the way the two systems work are each their own, and since the early labels from Abydos were dated to about 3250 BCE most Egyptologists
                    see two separate inventions.
                  </p>
                  <div className="overflow-x-auto border border-gold-700/20 mb-5">
                    <table className="w-full border-collapse font-body text-sm md:text-base">
                      <caption className="sr-only">Cuneiform and Egyptian hieroglyphs compared</caption>
                      <thead>
                        <tr className="bg-obsidian-light/60 text-left">
                          {["", "Cuneiform", "Hieroglyphs"].map((h) => (
                            <th key={h} scope="col" className="px-3 py-3 font-medium text-gold-400 text-xs tracking-[0.15em] uppercase">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {compare.map(([k, c, h]) => (
                          <tr key={k} className="border-t border-gold-700/15 align-top">
                            <th scope="row" className="px-3 py-2.5 font-medium text-sand-100 whitespace-nowrap">
                              {k}
                            </th>
                            <td className="px-3 py-2.5 text-sand-300">{c}</td>
                            <td className="px-3 py-2.5 text-sand-300">{h}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <h3 className="font-display text-xl text-sand-100 mb-2">Built the same way</h3>
                  <p className={`${para} mb-4`}>
                    Both mix three kinds of sign: signs for whole words, signs for sounds, and silent classifiers that tell the reader what kind of thing a word
                    is. Egyptian puts the classifier after the word, as the seated man <span className={glyph}>𓀀</span> after a man&apos;s name; cuneiform
                    usually puts it first, as the star <span className={cf}>𒀭</span> before a god&apos;s name and the wedge <span className={cf}>𒁹</span>{" "}
                    before a man&apos;s. The big difference is the sound signs. Hieroglyphs have{" "}
                    <Link href="/hieroglyphic-alphabet" className={inline}>
                      25 signs for single consonants
                    </Link>{" "}
                    and write no vowels; cuneiform has no single consonants at all, only syllables, with their vowels. That is why your name is a handful of
                    letters in hieroglyphs and a handful of syllables in cuneiform.
                  </p>
                  <h3 className="font-display text-xl text-sand-100 mb-2">Where they met</h3>
                  <p className={`${para} mb-4`}>
                    In the 14th century BCE the pharaohs wrote to the other great kings in cuneiform. The Amarna letters, about 380 clay tablets found at
                    Akhenaten&apos;s capital, are their correspondence with Babylon, Assyria, Mitanni and the Hittites, written in Akkadian, the diplomatic
                    language of the age. Egyptian scribes learned cuneiform to read them, and practised on Babylonian myths. A century later, around 1259 BCE,
                    Ramesses II and the Hittite king Hattusili III made the earliest peace treaty whose text survives on both sides: the Hittite copy in Akkadian
                    cuneiform on clay, the Egyptian one in hieroglyphs on the walls of Karnak and the Ramesseum.
                  </p>
                  <h3 className="font-display text-xl text-sand-100 mb-2">How both were read again</h3>
                  <p className={para}>
                    Both scripts were forgotten, and both came back through an inscription in several scripts.{" "}
                    <Link href="/blog/how-the-rosetta-stone-changed-everything" className={inline}>
                      The Rosetta Stone
                    </Link>{" "}
                    gave Champollion hieroglyphs in 1822. For cuneiform it was the cliff inscription of the Persian king Darius I at Behistun, in Old Persian,
                    Elamite and Babylonian, copied by Henry Rawlinson. In 1857 four scholars were sent the same newly found Assyrian text to translate
                    separately; their versions agreed, and cuneiform was accepted as read. Read the whole story in{" "}
                    <Link href="/blog/cuneiform-vs-hieroglyphs" className={inline}>
                      cuneiform vs. hieroglyphs: the world&apos;s two oldest scripts
                    </Link>
                    .
                  </p>
                </section>

                <section aria-labelledby="learn-heading" className="border border-gold-500/30 bg-gold-500/5 p-6 md:p-7">
                  <h2 id="learn-heading" className={h2}>
                    Read the other oldest script
                  </h2>
                  <p className={`${para} mb-5`}>
                    Learn Hieroglyphics teaches you to read Egyptian hieroglyphs from scratch. The first lesson is free: your own name on a sealed door, then
                    your first real Egyptian words.
                  </p>
                  <Link href="/lessons/expedition-begins" className="btn-primary py-3 px-8 text-sm justify-center">
                    Start the free first lesson
                  </Link>
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

                <NameToolLinks current="cuneiform" />
              </div>
            </div>
          </div>
        </article>
        <Footer />
      </main>
    </>
  );
}

import type { Metadata } from "next";
import { OG_LOCALE, toolAlternates } from "@/lib/i18n";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import TranslatorBackdrop from "@/components/TranslatorBackdrop";
import Footer from "@/components/Footer";
import NameToolLinks from "@/components/NameToolLinks";
import GuestPlayBanner from "@/components/GuestPlayBanner";
import ClassVisitStrip from "@/components/ClassVisitStrip";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { KEY_SIGNS } from "@/lib/hieroglyph-keyboard";
import KeyboardTool from "./KeyboardTool";

const BASE = "https://www.learnhieroglyphics.com";
const URL = `${BASE}/hieroglyphics-keyboard`;
const PUBLISHED = "2026-10-05";

export const metadata: Metadata = {
  title: "Hieroglyphics Keyboard: Type Egyptian Hieroglyphs Online | Learn Hieroglyphics",
  description:
    "A free hieroglyphics keyboard. Press any letter and see the Egyptian hieroglyph for its sound, with the sign's name and meaning. Copy and paste the hieroglyphs or save them as an image. No sign-up.",
  alternates: toolAlternates("keyboard", "en"),
  openGraph: {
    title: "Hieroglyphics Keyboard: Type Egyptian Hieroglyphs Online",
    description:
      "Press a key, see the hieroglyph. A free online keyboard for the 26 letters, with each sign's name, sound and story. Copy, paste or save as an image.",
    url: URL,
    type: "website",
    locale: OG_LOCALE.en,
    alternateLocale: [OG_LOCALE.es, OG_LOCALE.fr],
    images: [`${BASE}/og-homepage.jpg`],
  },
};

const FAQ = [
  {
    q: "Is there a hieroglyphics keyboard?",
    a: "Yes. The keyboard on this page types Egyptian hieroglyphs from an ordinary keyboard: press a letter and the sign for that sound appears, and on a phone you tap the keys on screen. Ancient Egypt had no keyboards, and no fixed alphabet either. Scribes chose from roughly 700 signs in common use, and this keyboard uses the single-sound signs they spelled names with.",
  },
  {
    q: "Can I copy and paste hieroglyphs?",
    a: "Yes. Egyptian hieroglyphs have been part of Unicode since 2009 (the block U+13000 to U+1342F, 1,071 signs), so they copy and paste like any other text. Press Copy hieroglyphs above and paste them into a message, document or social post. If they show up as empty boxes, the device has no hieroglyph font: save them as an image instead, or install the free Noto Sans Egyptian Hieroglyphs font.",
  },
  {
    q: "Why do E, I and Y type the same hieroglyph?",
    a: "Egyptian writing recorded consonants only, so there is no sign for E. The reed leaf 𓇋 wrote a weak y-like sound, and it is the sign scribes used when a foreign name needed an i or e. In the same way O, U and W share the quail chick 𓅱, and A is the vulture 𓄿.",
  },
  {
    q: "Why do some letters share a sign, like L and R, or C and K?",
    a: "The keys follow sounds, not English spelling. Classical Egyptian had no separate l and wrote it with the mouth 𓂋 (r); later scribes used a lion 𓃭 for L in Greek names such as Cleopatra. C and K are the same sound, written with the basket 𓎡; F and V share the horned viper 𓆑; Z is the door bolt 𓊃, which by the Middle Kingdom sounded the same as S, the folded cloth 𓋴. X has no sign of its own, so it types two: 𓎡𓋴 (k + s).",
  },
  {
    q: "Does this keyboard translate English into Egyptian?",
    a: "No. It spells English letters with Egyptian sound signs, which is how scribes wrote foreign names. It does not translate meaning. Real Egyptian words were written with a mix of one-, two- and three-sound signs plus silent signs called determinatives: the word for house is 𓉐, not the letters h-o-u-s-e.",
  },
  {
    q: "How do I type hieroglyphs on my own computer or phone?",
    a: "The quickest way is to type them here and copy them. To type them anywhere, install a hieroglyph font (Noto Sans Egyptian Hieroglyphs is free; Windows includes Segoe UI Historic) and an input tool such as Keyman's hieroglyphic keyboard. Egyptologists who typeset whole inscriptions use JSesh, a free hieroglyphic editor.",
  },
  {
    q: "How long does it take to learn the hieroglyphic alphabet?",
    a: "About half an hour. The alphabet is 25 single-sound signs, and most people learn them in one sitting when each sign is taught as a picture with a sound: the owl is m, the water ripple is n, the mouth is r. The free first lesson on this site teaches all 25 through your own name and real Egyptian words.",
  },
];

export default function HieroglyphicsKeyboardPage() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "Hieroglyphics Keyboard",
      url: URL,
      description:
        "An online keyboard that types Egyptian hieroglyphs: each letter key shows the single-sound hieroglyph for that sound, with its name, transliteration and Gardiner code. The result can be copied as Unicode text or saved as an image.",
      applicationCategory: "EducationalApplication",
      operatingSystem: "Any",
      browserRequirements: "Requires JavaScript",
      isAccessibleForFree: true,
      datePublished: PUBLISHED,
      dateModified: PUBLISHED,
      inLanguage: "en",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      featureList: [
        "Types a hieroglyph for each letter A to Z",
        "On-screen keys for phones and tablets",
        "Shows each sign's name, sound and Gardiner code",
        "Copy hieroglyphs as Unicode text",
        "Save hieroglyphs as a PNG image",
      ],
      author: { "@type": "Person", name: "Harry Harrison", url: `${BASE}/about`, sameAs: ["https://x.com/HarryHH1993", "https://www.linkedin.com/in/harry-harrison/"] },
      provider: { "@type": "Organization", name: "Learn Hieroglyphics", url: BASE },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: BASE },
        { "@type": "ListItem", position: 2, name: "Hieroglyphics Keyboard", item: URL },
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

  const h2 = "font-display text-2xl md:text-3xl font-semibold text-sand-100 mb-4";
  const para = "font-body text-sand-300 font-light leading-relaxed";
  const inline = "text-gold-400 hover:text-gold-300 underline underline-offset-2";

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="min-h-screen">
        <TranslatorBackdrop />
        {/* (over the fixed backdrop) */}
        <div className="relative z-[1]">
        <Navbar />
        <article className="pt-20 md:pt-28 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <nav aria-label="Breadcrumb" className="flex items-center gap-2 font-body text-sm text-sand-600">
                <Link href="/" className="hover:text-gold-400 transition-colors">
                  Home
                </Link>
                <span>/</span>
                <span className="text-sand-400">Hieroglyphics Keyboard</span>
              </nav>
              <LanguageSwitcher page="keyboard" current="en" />
            </div>

            <ClassVisitStrip className="mb-6" />

            <header className="mb-6">
              <h1 className="font-display text-3xl md:text-4xl font-light text-sand-100 mb-2 leading-tight">
                Hieroglyphics Keyboard
              </h1>
              <p className="font-body text-lg text-sand-400 font-light leading-relaxed max-w-2xl">
                Type in Egyptian hieroglyphs. Press a key and see the sign a scribe would use for that sound.
              </p>
            </header>

            <KeyboardTool />

            <div className="max-w-4xl">
              {/* Answer-first definition */}
              <section className="mb-12 border border-gold-500/25 bg-gold-500/5 p-6 md:p-7" aria-labelledby="qa-heading">
                <p id="qa-heading" className="font-body text-[10px] tracking-[0.25em] uppercase text-gold-500 mb-3">
                  Quick answer
                </p>
                <p className="font-body text-base md:text-lg text-sand-200 leading-relaxed">
                  A <strong className="text-sand-100 font-medium">hieroglyphics keyboard</strong> turns each letter you
                  type into the Egyptian hieroglyph for that sound: M is the owl{" "}
                  <span className="hieroglyph-font">𓅓</span>, N the water ripple{" "}
                  <span className="hieroglyph-font">𓈖</span>, R the mouth <span className="hieroglyph-font">𓂋</span>.
                  It uses the single-sound signs, often called the hieroglyphic alphabet, that scribes spelled foreign
                  names with. Because Egyptian wrote no vowels, A, E/I and O/U borrow the vulture, the reed and the quail
                  chick. The signs are Unicode text, so they can be copied and pasted.
                </p>
              </section>

              <div className="space-y-12 mt-12">
                {/* The game, with its gameplay loop: under the keyboard (2026-10-16), so the tool comes first */}
                <GuestPlayBanner location="keyboard" game />

                <section aria-labelledby="chart-heading">
                  <h2 id="chart-heading" className={h2}>
                    Which hieroglyph does each key type?
                  </h2>
                  <p className={`${para} mb-5`}>
                    All 26 letter keys, the sign each one types, and why. Several letters share a sign because the keys
                    follow sounds, and Egyptian had fewer of them than English has letters.
                  </p>
                  <div className="overflow-x-auto border border-gold-700/20">
                    <table className="w-full border-collapse font-body text-sm md:text-base">
                      <caption className="sr-only">
                        Hieroglyphics keyboard chart: each letter key, the hieroglyph it types, the sign&apos;s name, its
                        sound in Egyptological transliteration, its Gardiner code, and why that sign is used.
                      </caption>
                      <thead>
                        <tr className="bg-obsidian-light/60 text-left">
                          {["Key", "Sign", "Shows", "Sound", "Why this sign"].map((h) => (
                            <th key={h} scope="col" className="px-3 py-3 font-medium text-gold-400 text-xs tracking-[0.15em] uppercase">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {KEY_SIGNS.map((s) => (
                          <tr key={s.input} className="border-t border-gold-700/15 align-top">
                            <th scope="row" className="px-3 py-2.5 font-display text-xl text-sand-100 uppercase">
                              {s.input}
                            </th>
                            <td className="px-3 py-2.5 whitespace-nowrap">
                              <span className="text-3xl md:text-4xl leading-none text-sand-100 hieroglyph-font" lang="egy">
                                {s.glyph}
                              </span>
                              <span className="block font-body text-[10px] tracking-[0.15em] uppercase text-sand-500 mt-1">
                                {s.gardiner}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 text-sand-200">{s.signName}</td>
                            <td className="px-3 py-2.5 text-sand-100 font-medium">{s.transliteration}</td>
                            <td className="px-3 py-2.5 text-sand-300 font-light">{s.note}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="font-body text-xs text-sand-500 mt-3">
                    Codes are from Gardiner&apos;s sign list, the numbering Egyptologists use for every hieroglyph. The
                    full chart of the 25 alphabet signs, with example words, is on{" "}
                    <Link href="/hieroglyphic-alphabet" className={inline}>
                      the hieroglyphic alphabet
                    </Link>{" "}
                    page.
                  </p>
                </section>

                <section>
                  <h2 className={h2}>How to use the hieroglyphics keyboard</h2>
                  <ol className={`${para} list-decimal pl-5 space-y-2`}>
                    <li>
                      <strong className="text-sand-200 font-medium">Type.</strong> Press any letter key, or tap the keys on
                      screen. Each press adds one sign to the wall. Space separates words and Backspace removes the last
                      sign.
                    </li>
                    <li>
                      <strong className="text-sand-200 font-medium">Read the sign.</strong> The panel beside the wall names
                      the sign you just typed, gives its sound and explains why it stands for that letter.
                    </li>
                    <li>
                      <strong className="text-sand-200 font-medium">Copy or save.</strong> Copy hieroglyphs puts the signs
                      on your clipboard as text. Save as image downloads a picture, which is the safer choice for sharing
                      because every phone can show it.
                    </li>
                  </ol>
                </section>

                <section>
                  <h2 className={h2}>Is this how Egyptians really wrote?</h2>
                  <p className={`${para} mb-4`}>
                    For names, yes. When Egyptian scribes had to write a foreign name such as Ptolemy, Cleopatra or
                    Alexander, they spelled it sound by sound with single-consonant signs, the same ones this keyboard
                    types. That habit is what let Champollion decipher the script in 1822: he matched the signs in royal
                    names to the Greek spellings.
                  </p>
                  <p className={para}>
                    Ordinary Egyptian words were different. A scribe had signs for two and three consonants at once, and
                    ended most words with a silent picture that told the reader what kind of thing it was. So typing
                    c-a-t here gives you the sounds <span className="hieroglyph-font">𓎡𓄿𓏏</span>, while the Egyptian
                    word for cat, <em>miw</em>, was written <span className="hieroglyph-font">𓏇𓇋𓅱𓃠</span>: a milk jug
                    for <em>mi</em>, a reed, a quail chick, and a sitting cat to finish.
                  </p>
                </section>

                <section>
                  <h2 className={h2}>Writing a name? Use the translator</h2>
                  <p className={`${para} mb-4`}>
                    The keyboard types exactly what you press: S then H gives two signs. The name translator listens for
                    sounds instead. It writes SH as the single pool sign <span className="hieroglyph-font">𓈙</span>,
                    turns a soft C into S, drops doubled letters, and draws the royal cartouche around the result.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link href="/translate-name-to-hieroglyphics" className="btn-primary text-sm py-3 px-6 justify-center">
                      Write my name in hieroglyphs
                    </Link>
                    <Link href="/teachers/worksheet" className="btn-secondary text-sm py-3 px-6 justify-center">
                      Printable alphabet worksheet
                    </Link>
                  </div>
                </section>

                <section>
                  <h2 className={h2}>Learn to read what you just typed</h2>
                  <p className={`${para} mb-4`}>
                    Typing hieroglyphs is the easy half. Reading them back, on a museum label or a temple wall, takes
                    about half an hour of practice with the 25 alphabet signs. The first lesson is free: you uncover your
                    own name on a sealed door, then read real Egyptian words with the rest of the alphabet.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 mb-5">
                    <Link href="/get-started" className="btn-primary text-sm py-3 px-6 justify-center">
                      Create a free account
                    </Link>
                    <Link href="/#lessons" className="btn-secondary text-sm py-3 px-6 justify-center">
                      See the full course
                    </Link>
                  </div>
                  <ul className={`${para} list-disc pl-5 space-y-1`}>
                    <li>
                      <Link href="/daily" className={inline}>
                        Cartouche of the Day
                      </Link>{" "}
                      gives you a real pharaoh&apos;s name to decode each morning.
                    </li>
                    <li>
                      <Link href="/blog/reading-your-first-cartouche" className={inline}>
                        Reading your first cartouche
                      </Link>{" "}
                      walks through Tutankhamun, Cleopatra and Ramesses II sign by sign.
                    </li>
                    <li>
                      <Link href="/blog/5-hieroglyphs-you-already-know" className={inline}>
                        Five hieroglyphs you already know
                      </Link>{" "}
                      shows how much of the script you can recognise before you start.
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

                <NameToolLinks current="keyboard" />
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

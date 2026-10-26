import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NameToolLinks from "@/components/NameToolLinks";
import GuestPlayBanner from "@/components/GuestPlayBanner";
import { NUMERAL_SIGNS, toHieroglyphic } from "@/lib/numerals";
import { EPAGOMENAL_GODS, GREEK_MONTHS, SEASONS } from "@/lib/egyptian-calendar";
import NumeralsTool, { NumeralGroups } from "./NumeralsTool";

const BASE = "https://www.learnhieroglyphics.com";
const URL = `${BASE}/egyptian-numerals-converter`;
const PUBLISHED = "2026-10-20";

export const metadata: Metadata = {
  title: "Egyptian Numerals Converter: Numbers & Dates in Hieroglyphs | Learn Hieroglyphics",
  description:
    "Free Egyptian numerals converter. Type any number or date and see it in ancient Egyptian hieroglyphs, stacked the way scribes wrote them, with the 7 number signs explained. Read numerals back, and find a birthday on the ancient Egyptian calendar.",
  alternates: { canonical: URL },
  openGraph: {
    title: "Egyptian Numerals Converter: Numbers & Dates in Hieroglyphs",
    description: "Type a number or a date and see it in Egyptian hieroglyphic numerals, from the single stroke to the god Heh for a million.",
    url: URL,
    type: "website",
    images: [`${BASE}/og-homepage.jpg`],
  },
};

const n2026 = toHieroglyphic(2026);

const FAQ = [
  {
    q: "How do you write 2026 in Egyptian numerals?",
    a: `2026 is ${n2026}: two lotus plants (2 × 1,000), two cattle hobbles (2 × 10) and six strokes (6 × 1). There is no sign for the hundreds because the number has none; Egyptian numerals have no zero and simply leave a value out.`,
  },
  {
    q: "What are the 7 Egyptian number signs?",
    a: "A stroke 𓏤 for 1, a cattle hobble 𓎆 for 10, a coil of rope 𓍢 for 100, a lotus plant 𓆼 for 1,000, a bent finger 𓂭 for 10,000, a tadpole 𓆐 for 100,000 and the kneeling god Heh 𓁨 for 1,000,000. Every number is written by repeating these, up to nine of each.",
  },
  {
    q: "Did the ancient Egyptians have a zero?",
    a: "Not as a digit. Their numerals were additive, so a missing place is just left out: 105 is a coil of rope and five strokes, with nothing for the tens. Scribes did have a word for nothing left over, nfr, written in accounts for a zero balance and on building guidelines for the base level, but it was never used inside a written number.",
  },
  {
    q: "What is the Egyptian hieroglyph for a million?",
    a: "The god Heh 𓁨, kneeling with both arms raised, often holding palm ribs, the sign for counting years. He stood for a million and also for 'countless' or 'eternity', so the sign appears in wishes for a king to live 'millions of years'.",
  },
  {
    q: "Which way are Egyptian numbers written?",
    a: "Largest value first in the direction of reading. Most inscriptions run right to left, so the thousands stand on the right and the units on the left; in a left-to-right line it is the other way round. Repeated signs are stacked in neat groups, such as seven strokes as four over three, so a number can be counted at a glance.",
  },
  {
    q: "What is my birthday on the ancient Egyptian calendar?",
    a: "Pick your birthday in the Date tab above. The Egyptian civil year had 12 months of 30 days in three seasons (Akhet, Peret and Shemu) plus five extra days, the birthdays of Osiris, Horus, Seth, Isis and Nephthys. It had no leap day, so the converter counts days the way Greek astronomers kept the calendar running, and the Egyptian date of your birthday slowly moves: one day later every four years.",
  },
  {
    q: "How many days were in the Egyptian year?",
    a: "365: twelve months of 30 days and five 'days upon the year'. Without a leap day the calendar slipped a quarter of a day each year against the seasons, and came back into line only after about 1,460 years, a span later called the Sothic cycle after the star Sirius (Sothis), whose dawn rising marked the ideal new year.",
  },
  {
    q: "How did the Egyptians write fractions?",
    a: "Mostly as unit fractions, one over a number: the mouth sign 𓂋 placed over a number means 'one part of', so 𓂋 over ten strokes is 1/10. Other fractions were written as sums of different unit fractions, as in the Rhind Mathematical Papyrus. There were special signs for 1/2, 2/3 and 3/4. The popular idea that the parts of the Eye of Horus stood for 1/2 to 1/64 is now doubted by historians of Egyptian mathematics.",
  },
  {
    q: "Can I copy and paste Egyptian numerals?",
    a: "Yes. The number signs are in Unicode's Egyptian Hieroglyphs block, so the Copy hieroglyphs button gives you text you can paste into a message or document. If they show as empty boxes, the device has no hieroglyph font; the free Noto Sans Egyptian Hieroglyphs font fixes that.",
  },
];

const EXAMPLES = [
  { n: 7, note: "Seven strokes, stacked four over three." },
  { n: 46, note: "Four hobbles and six strokes." },
  { n: 365, note: "The days of the Egyptian year." },
  { n: 1922, note: "The year Tutankhamun's tomb was found." },
  { n: 2026, note: "No hundreds, so no coil of rope." },
  { n: 1_422_000, note: "The goats on the Narmer macehead." },
];

export default function EgyptianNumeralsPage() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "Egyptian Numerals Converter",
      url: URL,
      description:
        "Converts numbers and dates into ancient Egyptian hieroglyphic numerals, grouped the way scribes wrote them; reads hieroglyphic numerals back to numbers; and places a date on the ancient Egyptian civil calendar.",
      applicationCategory: "EducationalApplication",
      operatingSystem: "Any",
      browserRequirements: "Requires JavaScript",
      isAccessibleForFree: true,
      datePublished: PUBLISHED,
      dateModified: PUBLISHED,
      inLanguage: "en",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      featureList: [
        "Any whole number from 1 to 9,999,999 in Egyptian hieroglyphic numerals",
        "Signs stacked in the groups scribes used, left to right or right to left",
        "Hieroglyphic numerals read back to a number",
        "A date written in Egyptian numerals",
        "A date placed on the ancient Egyptian civil calendar (season, month and day)",
        "Copy the numerals as Unicode text",
      ],
      author: { "@type": "Person", name: "Harry Harrison", url: `${BASE}/about`, sameAs: ["https://x.com/HarryHH1993", "https://www.linkedin.com/in/harry-harrison/"] },
      provider: { "@type": "Organization", name: "Learn Hieroglyphics", url: BASE },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: BASE },
        { "@type": "ListItem", position: 2, name: "Egyptian Numerals Converter", item: URL },
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
  const glyph = "hieroglyph-font";

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
              <span className="text-sand-400">Egyptian Numerals Converter</span>
            </nav>

            <header className="mb-6">
              <h1 className="font-display text-3xl md:text-4xl font-light text-sand-100 mb-2 leading-tight">Egyptian Numerals Converter</h1>
              <p className="font-body text-lg text-sand-400 font-light leading-relaxed max-w-2xl">
                Type a number or pick a date and see it written in ancient Egyptian hieroglyphs, the way scribes carved it.
              </p>
            </header>

            <NumeralsTool />

            <div className="max-w-4xl">
              <section className="mb-12 border border-gold-500/25 bg-gold-500/5 p-6 md:p-7" aria-labelledby="qa-heading">
                <p id="qa-heading" className="font-body text-[10px] tracking-[0.25em] uppercase text-gold-500 mb-3">
                  Quick answer
                </p>
                <p className="font-body text-base md:text-lg text-sand-200 leading-relaxed">
                  <strong className="text-sand-100 font-medium">Egyptian numerals</strong> are a base-10 system with one
                  sign for each power of ten: a stroke <span className={glyph}>𓏤</span> for 1, a hobble{" "}
                  <span className={glyph}>𓎆</span> for 10, a coil of rope <span className={glyph}>𓍢</span> for 100, a lotus{" "}
                  <span className={glyph}>𓆼</span> for 1,000, a finger <span className={glyph}>𓂭</span> for 10,000, a tadpole{" "}
                  <span className={glyph}>𓆐</span> for 100,000 and the god Heh <span className={glyph}>𓁨</span> for a million.
                  To write a number, repeat each sign as many times as that digit (up to nine) and add them up, largest
                  first. There is no zero and no place value: 2026 is two lotuses, two hobbles and six strokes,{" "}
                  <span className={glyph}>{n2026}</span>.
                </p>
              </section>

              <div className="space-y-12 mt-12">
                <section aria-labelledby="signs-heading">
                  <h2 id="signs-heading" className={h2}>
                    The seven Egyptian number signs
                  </h2>
                  <p className={`${para} mb-5`}>
                    Every number in hieroglyphs is built from these seven signs. Each is a picture of something, and some
                    of the pictures may explain the value: tadpoles swarmed in the flood pools in their hundreds of
                    thousands, and Heh was the god of endless time.
                  </p>
                  <div className="overflow-x-auto border border-gold-700/20">
                    <table className="w-full border-collapse font-body text-sm md:text-base">
                      <caption className="sr-only">
                        Egyptian numeral signs: value, hieroglyph, what it shows, Egyptian word and Gardiner sign-list code.
                      </caption>
                      <thead>
                        <tr className="bg-obsidian-light/60 text-left">
                          {["Value", "Sign", "Picture", "Egyptian", "Gardiner"].map((h) => (
                            <th key={h} scope="col" className="px-3 py-3 font-medium text-gold-400 text-xs tracking-[0.15em] uppercase">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {NUMERAL_SIGNS.map((s, i) => (
                          <tr key={s.value} className="border-t border-gold-700/15 align-top">
                            <th scope="row" className="px-3 py-2.5 font-display text-lg text-sand-100 whitespace-nowrap">
                              {s.value.toLocaleString("en-GB")}
                            </th>
                            <td className="px-3 py-2.5">
                              <span className={`text-3xl md:text-4xl leading-none text-sand-100 ${glyph}`} lang="egy">
                                {s.glyph}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 text-sand-300">
                              <span className="text-sand-100">{s.name}</span>
                              <span className="block text-sm text-sand-500">{s.note}</span>
                            </td>
                            <td className="px-3 py-2.5 italic text-sand-200 whitespace-nowrap">{s.translit}</td>
                            <td className="px-3 py-2.5 text-sand-400">{["Z1", "V20", "V1", "M12", "D50", "I8", "C11"][i]}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                <section aria-labelledby="how-heading">
                  <h2 id="how-heading" className={h2}>
                    How to write a number in Egyptian numerals
                  </h2>
                  <ol className={`${para} list-decimal pl-6 space-y-2`}>
                    <li>
                      <strong className="text-sand-100 font-medium">Split the number into its digits.</strong> 1,922 is 1
                      thousand, 9 hundreds, 2 tens and 2 units.
                    </li>
                    <li>
                      <strong className="text-sand-100 font-medium">Repeat each power&apos;s sign that many times.</strong> One
                      lotus, nine coils of rope, two hobbles, two strokes. A digit of 0 gets no sign at all.
                    </li>
                    <li>
                      <strong className="text-sand-100 font-medium">Write the largest first</strong>, in the direction the
                      text runs (usually right to left).
                    </li>
                    <li>
                      <strong className="text-sand-100 font-medium">Stack the repeats in tidy groups</strong>: three over
                      three over three for nine, four over three for seven. The groups made a number quick to count.
                    </li>
                  </ol>
                  <p className={`${para} mt-4`}>
                    Reading works the same way backwards: count each kind of sign and add. Because the value is in the
                    sign and not its position, the order does not change the number, which is why the reverse converter
                    above accepts the signs in any order.
                  </p>
                </section>

                <section aria-labelledby="examples-heading">
                  <h2 id="examples-heading" className={h2}>
                    Examples
                  </h2>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {EXAMPLES.map((e) => (
                      <figure key={e.n} className="border border-gold-700/25 bg-obsidian-light/40 p-4">
                        <div className="flex min-h-[5.5rem] items-center justify-center">
                          <NumeralGroups n={e.n} size="text-3xl" />
                        </div>
                        <figcaption className="mt-3 text-center font-body text-sm text-sand-400">
                          <span className="block font-display text-lg text-sand-100">{e.n.toLocaleString("en-GB")}</span>
                          {e.note}
                        </figcaption>
                      </figure>
                    ))}
                  </div>
                  <p className={`${para} mt-4`}>
                    Some of the largest numbers in early Egyptian writing are on the Narmer macehead, from about 3100 BCE, which
                    counts the spoils of a victory: 120,000 captives, 400,000 cattle and 1,422,000 goats, written with
                    tadpoles, fingers, lotuses and a single god Heh.
                  </p>
                </section>

                <section aria-labelledby="dates-heading">
                  <h2 id="dates-heading" className={h2}>
                    How the Egyptians wrote dates
                  </h2>
                  <p className={`${para} mb-4`}>
                    The Egyptians did not count years from a fixed starting point. A date named the year of the
                    reigning king, the month and the day: &ldquo;Year 17, under the majesty of&hellip;&rdquo; opens the
                    stela of the steward Mentuwoser, which you can read sign by sign in the{" "}
                    <Link href="/games/stela" className={inline}>
                      Stela Reader
                    </Link>
                    . When a new king came to the throne, the count started again at Year 1.
                  </p>
                  <p className={`${para} mb-4`}>
                    The civil year had 365 days: three seasons of four months, each month 30 days, and five extra days at
                    the end. A month is written with the crescent moon and star <span className={glyph}>𓇹𓇼</span> (
                    <em>ꜣbd</em>), its number in strokes, then the season; the day with the sun{" "}
                    <span className={glyph}>𓇳</span> (<em>sw</em>) and its number.
                  </p>
                  <div className="overflow-x-auto border border-gold-700/20 mb-4">
                    <table className="w-full border-collapse font-body text-sm md:text-base">
                      <caption className="sr-only">The three seasons of the Egyptian civil year and their months</caption>
                      <thead>
                        <tr className="bg-obsidian-light/60 text-left">
                          {["Season", "Egyptian", "Meaning", "Months (later Greek names)"].map((h) => (
                            <th key={h} scope="col" className="px-3 py-3 font-medium text-gold-400 text-xs tracking-[0.15em] uppercase">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {SEASONS.map((s, i) => (
                          <tr key={s.name} className="border-t border-gold-700/15 align-top">
                            <th scope="row" className="px-3 py-2.5 font-display text-lg text-sand-100">
                              {s.name}
                            </th>
                            <td className="px-3 py-2.5 italic text-sand-200">{s.translit}</td>
                            <td className="px-3 py-2.5 text-sand-300">{s.meaning}</td>
                            <td className="px-3 py-2.5 text-sand-300">{GREEK_MONTHS.slice(i * 4, i * 4 + 4).join(", ")}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className={para}>
                    The five extra days, &ldquo;the days upon the year&rdquo;, were the birthdays of the children of the sky
                    goddess Nut: {EPAGOMENAL_GODS.join(", ")}. With no leap day, the calendar slipped a quarter of a day
                    each year against the seasons, so festivals named for the flood could fall in the harvest. The date
                    converter above follows that slipping count, the one Greek astronomers kept running, so it shows where
                    a modern date falls on the calendar a scribe would have used.
                  </p>
                </section>

                <GuestPlayBanner location="numerals" game />

                <section aria-labelledby="learn-heading">
                  <h2 id="learn-heading" className={h2}>
                    Learn to read numbers on real monuments
                  </h2>
                  <p className={para}>
                    Numbers are everywhere in Egyptian texts: offering lists promise &ldquo;a thousand of bread, a thousand
                    of beer&rdquo; with a single lotus, and dates head royal decrees and tomb stelae. The Treasury lesson of
                    the course teaches the number signs, fractions and offering counts with practice, and the{" "}
                    <Link href="/lessons/expedition-begins" className={inline}>
                      free first lesson
                    </Link>{" "}
                    starts you on the 25-sign alphabet. To put a year next to two names, try{" "}
                    <Link href="/couple-names-in-hieroglyphics" className={inline}>
                      two names together
                    </Link>
                    ; for a single name, the{" "}
                    <Link href="/translate-name-to-hieroglyphics" className={inline}>
                      name translator
                    </Link>
                    .
                  </p>
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

                <NameToolLinks current="numerals" />
              </div>
            </div>
          </div>
        </article>
        <Footer />
      </main>
    </>
  );
}

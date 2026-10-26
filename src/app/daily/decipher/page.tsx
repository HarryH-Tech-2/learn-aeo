import type { Metadata } from "next";
import Link from "next/link";
import DecipherContent from "./DecipherContent";
import { CHAPTERS } from "@/lib/decipher";

const URL = "https://www.learnhieroglyphics.com/daily/decipher";
const OG = "https://www.learnhieroglyphics.com/cartouche-image?name=Ptolemy";

export const metadata: Metadata = {
  title: "How Were Hieroglyphs Deciphered? Do It Yourself: Decipher | Learn Hieroglyphics",
  description:
    "Retrace Champollion and Young step by step. Match Ptolemy and Cleopatra to their cartouches, spot the homophone, read Ramesses with a Coptic clue, and learn why 14 September 1822 gave back 3,000 years of Egyptian writing. Free.",
  alternates: { canonical: URL },
  openGraph: {
    title: "Decipher: crack the hieroglyphs the way Champollion did in 1822",
    description: "A free five-chapter puzzle that retraces the Rosetta Stone decipherment, with the history explained underneath.",
    url: URL,
    type: "website",
    images: [{ url: OG, width: 1200, height: 630, alt: "The cartouche of Ptolemy from the Rosetta Stone" }],
  },
  twitter: { card: "summary_large_image", title: "Decipher the hieroglyphs yourself", description: "Ptolemy, Cleopatra, Ramesses: deduce the signs the way Champollion did.", images: [OG] },
};

export const dynamic = "force-static";

const FAQ = [
  {
    q: "Who deciphered hieroglyphs, Young or Champollion?",
    a: "Both, in stages. Thomas Young showed between 1814 and 1819 that the cartouche on the Rosetta Stone spelled Ptolemy by sound and worked out a run of Demotic words. Jean-François Champollion, using the Ptolemy and Cleopatra cartouches together and his knowledge of Coptic, showed in September 1822 that the sound-signs wrote native Egyptian words too, and in 1824 set out the whole system. Young found the door; Champollion walked through it and mapped the house.",
  },
  {
    q: "Does the Rosetta Stone mention Cleopatra?",
    a: "No. The Rosetta Stone names Ptolemy V. The Cleopatra cartouche that let Champollion test the alphabet comes from the obelisk William Bankes shipped from Philae to England in 1821.",
  },
  {
    q: "Are hieroglyphs a picture language?",
    a: "No. A sign can stand for a sound (one, two or three consonants), for a whole word, or act as a silent classifier telling you what kind of word you just read, and a single line usually mixes all three. That is what Champollion's Précis of 1824 established, and why the 'hieroglyphic alphabet' taught to beginners is a modern learning aid rather than how the Egyptians thought of their script.",
  },
  {
    q: "What happened on 14 September 1822?",
    a: "Champollion received copies of reliefs from Abu Simbel and read a cartouche as Ra-ms-s, Ramesses, using the Coptic words for 'sun' and 'birth'. A second cartouche read Thoth-ms, Thutmose. Because these were native Egyptian names spelled with the same signs as the Greek ones, the whole script had to be readable. He ran to his brother, said 'Je tiens l'affaire!' and collapsed. He read the Lettre à M. Dacier to the Académie on 27 September.",
  },
  {
    q: "When did hieroglyphs stop being used?",
    a: "The last dated hieroglyphic inscription was carved at the temple of Philae in 394 CE. For roughly 1,400 years afterwards nobody could read the script, until the Rosetta Stone, found in July 1799, provided a Greek text alongside the Egyptian.",
  },
];

export default function DecipherPage() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: "How to decipher hieroglyphs the way Champollion did",
      description: "Five chapters that retrace the 1814–1822 decipherment: deduce sign values from Greek royal names, then read native Egyptian names.",
      totalTime: "PT20M",
      step: CHAPTERS.map((ch, i) => ({
        "@type": "HowToStep",
        position: i + 1,
        name: `Chapter ${ch.number}: ${ch.title} (${ch.date})`,
        text: ch.intro.join(" "),
        url: `${URL}#chapter-${ch.number}`,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "Decipher",
      url: URL,
      applicationCategory: "EducationalApplication",
      operatingSystem: "Any",
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      provider: { "@type": "Organization", name: "Learn Hieroglyphics", url: "https://www.learnhieroglyphics.com" },
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <DecipherContent>
        <article className="mt-14 max-w-2xl mx-auto font-body text-sm sm:text-base text-sand-300 leading-relaxed">
          <p className="font-body text-xs tracking-[0.3em] uppercase text-gold-500 mb-2">The history behind the puzzle</p>
          <h2 className="font-display text-2xl sm:text-3xl text-sand-100 mb-5 leading-snug">Why this puzzle is the most important 200 years in the history of hieroglyphics</h2>

          <h3 className="font-display text-xl text-sand-100 mt-8 mb-2">Fourteen centuries of silence</h3>
          <p className="mb-3">
            Hieroglyphs fell out of use after the fourth century CE. The last dated inscription was carved at the temple of Isis at Philae, in the far south of Egypt, in 394 CE; the last Demotic text, on the same
            island, in 452. With the temples closed, the priests who could read the signs died without pupils, and for about 1,400 years nobody on earth could read a single Egyptian sentence.
          </p>
          <p className="mb-3">
            Scholars did not stop guessing. Horapollo’s <em>Hieroglyphica</em>, a late-antique treatise rediscovered in 1419, taught that each sign was a symbol for an idea. The seventeenth-century Jesuit
            Athanasius Kircher published volumes of “translations” in that spirit, reading obelisks as mystical allegories. He got one sign right, the triple water sign as m (from Coptic mou, ‘water’), almost by accident. The picture-symbol
            theory sent decipherment down a dead end that lasted until the nineteenth century.
          </p>

          <h3 className="font-display text-xl text-sand-100 mt-8 mb-2">1799: a key is found</h3>
          <p className="mb-3">
            In July 1799 French soldiers rebuilding a fort at Rashid (Rosetta), in the Nile Delta, uncovered a broken slab of dark granodiorite carrying the same priestly decree of 196 BCE three times: in
            hieroglyphs, in Demotic and in Greek. Because scholars could read the Greek, there was, for the first time, a known text to compare the unknown ones against. After the French surrender in Egypt the stone
            passed to Britain and reached the British Museum in 1802, where it is still on display. What mattered more than the object was the copies: prints of all three texts circulated across Europe within a
            few years.
          </p>

          <h3 className="font-display text-xl text-sand-100 mt-8 mb-2">1814 to 1819: Thomas Young</h3>
          <p className="mb-3">
            The English physician and physicist Thomas Young took up the stone in 1814. He worked first on the Demotic, matched a long run of its words to the Greek, and saw that Demotic signs derived from
            hieroglyphs. He then showed that the ringed group on the hieroglyphic text, the cartouche, spelled the Greek name Ptolemy sound by sound, and assigned values to most of its signs. He published this in the
            1819 supplement to the <em>Encyclopædia Britannica</em>. Then he stopped: Young believed the Egyptians spelled by sound only when forced to by a foreign name, and wrote their own language in symbols.
            Chapter 1 of the puzzle above is Young’s achievement.
          </p>

          <h3 className="font-display text-xl text-sand-100 mt-8 mb-2">1821 to 1822: Cleopatra, Coptic and the leap</h3>
          <p className="mb-3">
            In December 1821 an obelisk that William Bankes had shipped from Philae arrived in England. Its Greek base named Ptolemy and Cleopatra, and Bankes pencilled “Cleopatra” beside the second cartouche.
            Comparing the two names gave Jean-François Champollion, in Paris, a set of letters that held across both, plus the discovery that two different signs could write one sound. With those letters he attacked
            every Greek and Roman name he could find in copies from Egypt’s temples: Alexander, Berenice, the Caesars.
          </p>
          <p className="mb-3">
            Champollion had one thing Young lacked: fluent Coptic, the last stage of the Egyptian language, which survived in the liturgy of Egypt’s Christians. On 14 September 1822 he received copies of reliefs from
            Abu Simbel. One cartouche began with a sun disc and ended with two signs he knew, s and s. In Coptic the sun is <em>re</em>; a sign he had seen on the Rosetta Stone beside the Greek word for “birthday”
            matched Coptic <em>mise</em>, “to give birth”. Ra-mes-s: Ramesses. A second cartouche, with the ibis of Thoth, read Thutmose. These were native Egyptian names, spelled with the same signs as the Greek
            ones. He ran to his brother at the Institut, said “Je tiens l’affaire!”, and collapsed.
          </p>
          <p className="mb-3">
            On 27 September 1822 he read his <em>Lettre à M. Dacier</em> to the Académie des Inscriptions. The <em>Précis du système hiéroglyphique</em> of 1824 set out the full system: the script is “at once
            figurative, symbolic and phonetic”, and a sign can be a sound, a word or a silent classifier, often all three in one line. Not everything was right yet; it was Karl Richard Lepsius in 1837 who showed that
            many sound-signs carry two or three consonants, not one. But the door was open.
          </p>

          <h3 className="font-display text-xl text-sand-100 mt-8 mb-2">Why it matters</h3>
          <p className="mb-3">
            The decipherment gave back three thousand years of a civilisation’s own words: the Pyramid Texts, the oldest religious writings in the world; medical and mathematical papyri; love songs, wisdom
            literature, court records and tax receipts. It founded Egyptology as a discipline. It is also the template for every later decipherment, Linear B in 1952 and the Maya script from the 1950s onward: find a
            bilingual, start with names, and trust that the script records a real, pronounceable language.
          </p>

          <h3 className="font-display text-xl text-sand-100 mt-8 mb-2">Four things people get wrong</h3>
          <ul className="list-disc pl-5 space-y-2 mb-3">
            <li>
              <strong className="text-sand-100 font-medium">The Rosetta Stone does not name Cleopatra.</strong> The Cleopatra cartouche comes from the Philae obelisk at Kingston Lacy.
            </li>
            <li>
              <strong className="text-sand-100 font-medium">Hieroglyphs are not a picture language.</strong> Most signs in a sentence are sounds; the pictures are the script’s alphabet and word-signs, not a rebus of ideas.
            </li>
            <li>
              <strong className="text-sand-100 font-medium">Nobody cracked it alone or overnight.</strong> Young’s Ptolemy came first; Champollion’s general system took from 1822 to 1824, and the two men argued about credit
              for the rest of their lives. Both contributions were real.
            </li>
            <li>
              <strong className="text-sand-100 font-medium">The “hieroglyphic alphabet” is a modern learning aid.</strong> The Egyptians never listed their 25 one-consonant signs as an alphabet; we
              teach them first because they are the quickest way in.
            </li>
          </ul>

          <p className="mb-3">
            Read more: <Link href="/blog/how-the-rosetta-stone-changed-everything" className="text-gold-500 underline underline-offset-4">how the Rosetta Stone was deciphered and why it mattered</Link>,{" "}
            <Link href="/blog/reading-your-first-cartouche" className="text-gold-500 underline underline-offset-4">reading your first cartouche</Link>, and the{" "}
            <Link href="/hieroglyphic-alphabet" className="text-gold-500 underline underline-offset-4">25-sign alphabet chart</Link>. Then take the{" "}
            <Link href="/lessons/expedition-begins" className="text-gold-500 underline underline-offset-4">free first lesson</Link>.
          </p>

          <h2 className="font-display text-2xl text-sand-100 mt-10 mb-4">Questions people ask</h2>
          <dl className="space-y-4">
            {FAQ.map((f) => (
              <div key={f.q}>
                <dt className="text-sand-100 font-medium">{f.q}</dt>
                <dd className="mt-1">{f.a}</dd>
              </div>
            ))}
          </dl>
          <p className="font-body text-xs text-sand-600 mt-8">
            Sources: British Museum object EA 24; the Wikipedia articles on the Rosetta Stone, the Philae obelisk, Thomas Young, Jean-François Champollion and the decipherment of Egyptian scripts, cross-checked
            against each other; sign sequences from the ruler infoboxes in two language editions. Cartouches simplified to the name itself (epithets such as “living forever, beloved of Ptah” are omitted).
          </p>
        </article>
      </DecipherContent>
    </>
  );
}

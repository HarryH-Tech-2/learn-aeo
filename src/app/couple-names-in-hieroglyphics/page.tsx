import type { Metadata } from "next";
import Link from "next/link";
import CoupleTool from "./CoupleTool";
import NameToolLinks, { FaqList, faqJsonLd } from "@/components/NameToolLinks";

const URL = "https://www.learnhieroglyphics.com/couple-names-in-hieroglyphics";

export const metadata: Metadata = {
  title: "Couple Names in Hieroglyphics: Wedding & Anniversary Cartouches",
  description:
    "Write two names in Egyptian hieroglyphs, side by side in royal cartouches with the ankh of life and your year in Egyptian numerals. Free, with a two-name print for a wedding or anniversary gift.",
  alternates: { canonical: URL },
  openGraph: { title: "Couple Names in Hieroglyphics", url: URL, type: "website" },
};

const FAQS = [
  {
    q: "How do I write our two names in hieroglyphs?",
    a: "Type both names above. Each is written sound by sound with the 25 Egyptian alphabet signs and closed in its own cartouche, the oval rope ring Egyptians drew around royal names. The ankh, the sign for life, sits between them.",
  },
  {
    q: "How is the year written in Egyptian numerals?",
    a: "Egyptian numbers repeat signs instead of using place value: a lotus plant is 1,000, a coil of rope 100, a hobble for cattle 10 and a single stroke 1. 2026 is two lotuses, two hobbles and six strokes. Egyptians themselves dated by the year of the king's reign, so a calendar year in numerals is a modern touch.",
  },
  {
    q: "What did love look like in ancient Egyptian writing?",
    a: "New Kingdom love songs, such as those on Papyrus Chester Beatty I, call the beloved ‘my brother’ (sn) and ‘my sister’ (snt), words of endearment rather than family. Statues and tomb paintings show husbands and wives side by side, often with an arm around each other.",
  },
  {
    q: "Can we get it printed for a wedding or anniversary?",
    a: "Yes. Both cartouches go on one A4 page: as an HD picture to print yourself, as a posted fine-art print, or framed and ready to hang.",
  },
  {
    q: "Is it a translation of our names?",
    a: "It is a transliteration: the sounds of your names in Egyptian signs, the way Egyptians wrote foreign names like Cleopatra. Each sign's sound is shown under the cartouche on the name translator.",
  },
];

export default function CouplePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Couple Names in Hieroglyphics",
              url: URL,
              description: "Two names in Egyptian hieroglyphs in royal cartouches, with the ankh and the year in Egyptian numerals.",
              applicationCategory: "EducationalApplication",
              operatingSystem: "Any",
              offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            },
            faqJsonLd(FAQS),
          ]),
        }}
      />
      <CoupleTool>
        <section className="mt-16 space-y-4 font-body text-base leading-relaxed text-sand-400">
          <h2 className="text-center font-display text-3xl font-semibold text-sand-100">A gift in the oldest writing for love</h2>
          <p>
            Cartouches were for kings and queens, and royal couples were shown together: Akhenaten and Nefertiti, Ramesses II and Nefertari,
            whose names fill the walls of the small temple at Abu Simbel he built for her. Two names in cartouches with the ankh between them
            borrows that idea for a wedding, an anniversary or a first home.
          </p>
          <p>
            Want each name on its own, as a picture with a background? Write it on the{" "}
            <Link href="/translate-name-to-hieroglyphics" className="text-gold-400 underline underline-offset-2 hover:text-gold-300">
              name translator
            </Link>
            , or learn to read every sign in the{" "}
            <Link href="/get-started" className="text-gold-400 underline underline-offset-2 hover:text-gold-300">
              free first lesson
            </Link>
            .
          </p>
        </section>
        <FaqList faqs={FAQS} />
        <NameToolLinks current="couple" className="mt-16" />
      </CoupleTool>
    </>
  );
}

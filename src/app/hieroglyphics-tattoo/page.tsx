import type { Metadata } from "next";
import Link from "next/link";
import TattooTool from "./TattooTool";
import NameToolLinks, { FaqList, faqJsonLd } from "@/components/NameToolLinks";

const URL = "https://www.learnhieroglyphics.com/hieroglyphics-tattoo";

export const metadata: Metadata = {
  title: "Hieroglyphics Tattoo: Your Name as a Stencil (Checked Sign by Sign)",
  description:
    "Get a name in Egyptian hieroglyphs as a clean black tattoo stencil, horizontal or vertical, with every sign explained so you know exactly what it says before you ink it.",
  alternates: { canonical: URL },
  openGraph: { title: "Hieroglyphics Tattoo Stencil", url: URL, type: "website" },
};

const FAQS = [
  {
    q: "Is this an accurate hieroglyphics tattoo?",
    a: "It is an honest transliteration: each sound of the name is written with the Egyptian sign for that sound, the way Egyptians wrote foreign names such as Cleopatra and Alexander. It is not a translation of the name's meaning. Every sign is listed with its sound under the cartouche, so you and your artist can check it before anything is inked.",
  },
  {
    q: "Should a hieroglyphic tattoo go across or down?",
    a: "Either is authentic. Egyptians wrote in rows or in columns, and columns are read from the top down. A column suits a forearm, spine or ankle; a row suits a collarbone or wrist. Pick ‘Stencil, vertical’ for a column.",
  },
  {
    q: "Which way do the signs face?",
    a: "The animals and people face the start of the line, so a reader knows where to begin. The stencil writes left to right with the signs facing left. If you want it to read right to left, ask your artist to mirror the whole design, never single signs.",
  },
  {
    q: "Can I have my name in a cartouche?",
    a: "Yes, the stencil draws the oval rope ring. In ancient Egypt the cartouche was reserved for kings and queens, which is exactly why people choose it for their own name today.",
  },
  {
    q: "How do I get the stencil?",
    a: "The preview is free. Keep it by email, or buy the HD version without our web address on it (2400 pixels on its long side, sharp enough for any tattoo size). Course members get the HD stencil free.",
  },
  {
    q: "What did Egyptians themselves tattoo?",
    a: "Tattoos are found on mummies from before the first pharaohs: figures of animals on a man and a woman from Gebelein, around 3300 BCE. Later women's mummies carry patterns of dots and lines, and one from the village of Deir el-Medina has protective signs such as the wedjat eye.",
  },
];

export default function TattooPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Hieroglyphics Tattoo Stencil",
              url: URL,
              description: "A name in Egyptian hieroglyphs as a black-on-white tattoo stencil, horizontal or vertical.",
              applicationCategory: "DesignApplication",
              operatingSystem: "Any",
              offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            },
            faqJsonLd(FAQS),
          ]),
        }}
      />
      <TattooTool>
        <section className="mt-16 space-y-4 font-body text-base leading-relaxed text-sand-400">
          <h2 className="text-center font-display text-3xl font-semibold text-sand-100">Before you book the tattoo</h2>
          <ol className="ml-5 list-decimal space-y-2">
            <li>Check the sign-by-sign breakdown above against the name. Egyptian wrote no vowels, so some sounds are approximated.</li>
            <li>Choose a row or a column, then keep the stencil and take it to your artist at full size.</li>
            <li>Ask for even line weight and spacing. Very fine inner lines can blur over the years, so let your artist thicken them where needed.</li>
            <li>
              Want to read it yourself? The{" "}
              <Link href="/hieroglyphic-alphabet" className="text-gold-400 underline underline-offset-2 hover:text-gold-300">
                25-sign alphabet
              </Link>{" "}
              shows every sign, and the{" "}
              <Link href="/get-started" className="text-gold-400 underline underline-offset-2 hover:text-gold-300">
                free first lesson
              </Link>{" "}
              teaches them in about half an hour.
            </li>
          </ol>
        </section>
        <FaqList faqs={FAQS} />
        <NameToolLinks current="tattoo" className="mt-16" />
      </TattooTool>
    </>
  );
}

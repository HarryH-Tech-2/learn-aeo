import type { Metadata } from "next";
import Link from "next/link";
import PetNameTool from "./PetNameTool";
import NameToolLinks, { FaqList, faqJsonLd } from "@/components/NameToolLinks";

const URL = "https://www.learnhieroglyphics.com/pet-name-in-hieroglyphics";

export const metadata: Metadata = {
  title: "Your Pet's Name in Hieroglyphics: Free Cat & Dog Cartouche",
  description:
    "Write your cat's or dog's name in Egyptian hieroglyphs, with the cat or dog sign a scribe would add. Free, instant, and ready to save as a picture or print.",
  alternates: { canonical: URL },
  openGraph: { title: "Your Pet's Name in Hieroglyphics", url: URL, type: "website" },
};

const FAQS = [
  {
    q: "How do you write a pet's name in hieroglyphs?",
    a: "Sound by sound, the way Egyptians wrote foreign names: each sound of the name gets one of the 25 alphabet signs, and vowels are approximated with the vulture, the reed or the quail chick. A scribe would then end the name with a silent picture of what it named, here the seated cat or the dog, so a reader knows at a glance whose name it is.",
  },
  {
    q: "What was the Egyptian word for cat?",
    a: "Miu (mjw), written with the owl (m), the reed (i) and the quail chick (w). It almost certainly imitates the cat's own call. A female cat was mjt, and Ta-miu, ‘the she-cat’, is the name on the carved sarcophagus Prince Thutmose, a son of Amenhotep III, made for his cat.",
  },
  {
    q: "Did ancient Egyptians name their dogs?",
    a: "Yes. Dogs' names survive on stelae, tomb walls and collars, often short and affectionate, and some describe the dog. The best known is Abuwtiyuw, a royal guard dog buried at Giza in the Old Kingdom with a tomb inscription that records the king's gifts for his burial.",
  },
  {
    q: "Is the cat sign read aloud?",
    a: "No. The seated cat and the dog are determinatives: silent signs at the end of a word that show what kind of thing it is. That is why the picture shows no English letter under them.",
  },
  {
    q: "Can I print my pet's cartouche?",
    a: "Yes. Save the picture free, keep a background by email or in HD, or order the cartouche as a posted A4 fine-art print, framed or unframed.",
  },
];

export default function PetNamePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Pet Name in Hieroglyphics",
              url: URL,
              description: "Write a cat's or dog's name in Egyptian hieroglyphs with the cat or dog determinative.",
              applicationCategory: "EducationalApplication",
              operatingSystem: "Any",
              offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            },
            faqJsonLd(FAQS),
          ]),
        }}
      />
      <PetNameTool>
        <section className="mt-16 space-y-4 font-body text-base leading-relaxed text-sand-400">
          <h2 className="text-center font-display text-3xl font-semibold text-sand-100">Pets in ancient Egypt</h2>
          <p>
            Egyptians lived closely with cats and dogs. Cats kept granaries free of mice and became the animal of the goddess Bastet; in the Late
            Period cats were mummified in huge numbers as offerings at her temple in Bubastis. Dogs guarded houses, hunted in the desert
            and appear under their owners&apos; chairs in tomb paintings, sometimes with their names written beside them.
          </p>
          <p>
            A name in hieroglyphs ended with a picture of what it named. That is what the card does here: your pet&apos;s name, sound by sound,
            then the seated cat <span lang="egy" className="hieroglyph-font text-gold-300">𓃠</span> or the dog{" "}
            <span lang="egy" className="hieroglyph-font text-gold-300">𓃡</span>, silent, the way a scribe would have finished it. Want to know
            what each sign says? The{" "}
            <Link href="/hieroglyphic-alphabet" className="text-gold-400 underline underline-offset-2 hover:text-gold-300">
              25-sign alphabet
            </Link>{" "}
            covers every one, and the{" "}
            <Link href="/get-started" className="text-gold-400 underline underline-offset-2 hover:text-gold-300">
              free first lesson
            </Link>{" "}
            teaches them in about half an hour.
          </p>
        </section>
        <FaqList faqs={FAQS} />
        <NameToolLinks current="pet" className="mt-16" />
      </PetNameTool>
    </>
  );
}

import type { Metadata } from "next";
import { toolAlternates } from "@/lib/i18n";
import TranslateContent from "./TranslateContent";
import CartoucheGallery from "@/components/CartoucheGallery";
import { galleryImages } from "@/lib/cartouche-gallery";

export const metadata: Metadata = {
  title: "Write Your Name in Hieroglyphics: Free & Instant",
  description:
    "Type your name and see it in real Egyptian hieroglyphs, inside a royal cartouche. Free, no sign-up. Learn what each sign means, then print or share it.",
  alternates: toolAlternates("translator", "en"),
};

export default function TranslatePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Hieroglyphic Name Translator",
            url: "https://www.learnhieroglyphics.com/translate-name-to-hieroglyphics",
            description:
              "Type a name and see it written in Egyptian hieroglyphs with the 25 single-sound signs, inside a royal cartouche.",
            applicationCategory: "EducationalApplication",
            operatingSystem: "Any",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            provider: {
              "@type": "Organization",
              name: "Learn Hieroglyphics",
              url: "https://www.learnhieroglyphics.com",
            },
            // the gallery's cartouches, so image search can tie each picture to its name
            image: galleryImages().map((img) => ({
              "@type": "ImageObject",
              contentUrl: img.url,
              caption: img.alt,
              width: 1200,
              height: 630,
            })),
          }),
        }}
      />
      <TranslateContent />
      <CartoucheGallery />
    </>
  );
}

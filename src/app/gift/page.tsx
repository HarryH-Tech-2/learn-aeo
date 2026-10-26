import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NameToolLinks, { FaqList, faqJsonLd } from "@/components/NameToolLinks";
import GiftContent from "./GiftContent";
import { GIFT_COURSE } from "@/lib/gift-course";

const URL = "https://www.learnhieroglyphics.com/gift";

export const metadata: Metadata = {
  title: "Gift a Hieroglyphics Course: Lifetime Access + Name Certificate",
  description:
    "Give someone lifetime access to learn Egyptian hieroglyphs, with a gift certificate showing their name in a royal cartouche. Instant gift link, no expiry, 14-day guarantee.",
  alternates: { canonical: URL },
  openGraph: { title: "Gift a Hieroglyphics Course", url: URL, type: "website" },
};

const FAQS = [
  {
    q: "How does the gift work?",
    a: "You pay once and get a gift link and a certificate with their name written in hieroglyphs inside a cartouche, by email and on screen. Send the link, or print the certificate and write it in a card. When they open the link and sign in, every lesson unlocks for good.",
  },
  {
    q: "Does the gift expire?",
    a: "No. They can open it whenever they like, and the access it gives is lifetime: every chamber of the course, the 3D games and every lesson added later.",
  },
  {
    q: "Who is the course for?",
    a: "Anyone curious about ancient Egypt, from about age 8 up. It starts with the 25 alphabet signs and builds to reading real names, words and inscriptions on museum objects. No experience needed.",
  },
  {
    q: "What if they already have the course?",
    a: "Tell us and we will refund you. Every purchase has a 14-day money-back guarantee.",
  },
  {
    q: "Can I try it before I buy?",
    a: "The first lesson is free for everyone, so you can try it yourself first. The gift unlocks the rest.",
  },
];

export default function GiftPage() {
  return (
    <main className="grain-overlay">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "Product",
              name: "Gift: Learn Hieroglyphics lifetime course",
              description: GIFT_COURSE.description,
              url: URL,
              brand: { "@type": "Brand", name: "Learn Hieroglyphics" },
              offers: { "@type": "Offer", price: GIFT_COURSE.usd.toFixed(2), priceCurrency: "USD", availability: "https://schema.org/InStock", url: URL },
            },
            faqJsonLd(FAQS),
          ]),
        }}
      />
      <Navbar />
      <div className="min-h-screen pt-24 pb-20 md:pt-32">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="mb-10 text-center">
            <p className="mb-3 font-body text-xs uppercase tracking-[0.25em] text-gold-500">A gift that teaches</p>
            <h1 className="mb-4 font-display text-3xl font-light text-sand-100 sm:text-4xl md:text-5xl">
              Gift the Hieroglyphics <span className="text-gradient-gold font-medium">Course</span>
            </h1>
            <p className="mx-auto max-w-2xl font-body text-lg font-light text-sand-400">
              Lifetime access to learn to read Egyptian hieroglyphs, with a certificate that has their name written in a royal cartouche.
            </p>
          </div>
          <GiftContent />
          <div className="mx-auto max-w-4xl">
            <FaqList faqs={FAQS} />
            <NameToolLinks current="gift" className="mt-16" />
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}

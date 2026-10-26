"use client";

import { useState } from "react";
import InView from "@/components/InView";
import { reveal } from "@/components/reveal";
import { useFreeCourseGuest } from "@/components/useFreeCourseGuest";

// What the free-unlock test's free group reads instead (src/lib/access-test.ts); the FAQ schema keeps the real answer.
const FREE_PRICING_ANSWER = "For you, the whole course is free: make an account and all eight lessons, the 3D levels, the Journey and the certificate open on it, with nothing to pay. Teachers can still buy a Classroom or School licence for a class.";

const faqs = [
  {
    question: "How long does it take to learn hieroglyphics?",
    answer:
      "You can learn the 25 core uniliteral signs (the hieroglyphic \"alphabet\") in just a few hours. With consistent practice over 2-3 months, you'll be able to recognize common words, read royal cartouches, and understand basic inscriptions. Full fluency in reading Middle Egyptian texts typically takes 1-2 years of dedicated study, similar to learning any ancient language.",
  },
  {
    question: "How do I learn Egyptian hieroglyphs?",
    answer:
      "Start with the 25 alphabet signs, the ones that each stand for a single sound, and use them to spell names. Then add the common two- and three-sound signs, the silent determinatives that tell you what a word means, and the royal cartouches you see on every monument. Practise writing the signs yourself, not just recognising them. Our first lesson teaches the alphabet signs in one sitting and is free, so you can try the method before deciding to go further.",
  },
  {
    question: "Is learning hieroglyphics the same as learning ancient Egyptian?",
    answer:
      "Not quite. Hieroglyphics is the script; ancient Egyptian is the language it writes, which was also written in hieratic and demotic. Learning hieroglyphs means learning to read the signs and sound out words, which is where everyone starts. Learning the language means its grammar too, usually Middle Egyptian, the classical form used on most monuments. Our course takes you from the signs to reading real names, titles and offering formulae; for full grammar you would move on to a textbook such as Allen's Middle Egyptian.",
  },
  {
    question: "Do I need any prior knowledge to start?",
    answer:
      "No prior knowledge of ancient Egyptian, linguistics, or archaeology is required. Our curriculum starts from absolute zero: the first lesson introduces the alphabet one sign at a time. Each subsequent lesson builds on the previous one, gradually increasing complexity. We provide pronunciation guides, cultural context, and memory aids throughout.",
  },
  {
    question: "Are these real hieroglyphs or simplified versions?",
    answer:
      "We use authentic Unicode Egyptian Hieroglyph characters from the official Unicode block (U+13000–U+1342F) and follow the standard Egyptological transliteration system used in academic publications worldwide. Our lessons are based on real inscriptions from temples, tombs, and papyri, not simplified or invented symbols.",
  },
  {
    question: "How are hieroglyphics different from an alphabet?",
    answer:
      "Unlike modern alphabets where each letter represents a single sound, hieroglyphs can function in three different ways: as phonograms (representing sounds, like letters), as logograms (representing whole words or concepts), or as determinatives (silent classifiers indicating a word's meaning category). A single hieroglyphic text uses all three types simultaneously, making it more complex but also more expressive than alphabetic writing.",
  },
  {
    question: "Can I read actual Egyptian monuments after this course?",
    answer:
      "Yes! By the intermediate level, you'll be able to identify and read royal names in cartouches, recognize offering formulas on tomb walls, and decode basic temple inscriptions. Our advanced lessons focus specifically on reading real monumental texts from Karnak, Luxor, Abu Simbel, and the Valley of the Kings. Many of our students report being able to read inscriptions during visits to museums and Egyptian sites.",
  },
  {
    question: "How does pricing work?",
    answer:
      "Lifetime access is a single one-time payment of $19.99 (£15.99): no recurring charges, no upgrade tiers. If you'd rather not pay up front there's an Expedition Pass at $4.99 a month, and teachers can buy a Classroom licence for a whole class. You can also try the first lesson for free before buying. We use Stripe for secure payment processing.",
  },
  {
    question: "Is hieroglyphic writing read left-to-right or right-to-left?",
    answer:
      "Hieroglyphs can be written in either direction! The key is to look at the animal and human signs, which always face toward the beginning of the text. If a bird faces left, you read from left to right. If it faces right, read right to left. Hieroglyphs can also be written in vertical columns (read top to bottom). Our lessons teach you to identify reading direction from context clues.",
  },
  {
    question: "How many hieroglyphic signs are there in total?",
    answer:
      "The complete hieroglyphic inventory contains over 700 distinct signs, though some lists count over 1,000 when including rare and variant forms. However, you don't need all of them; about 130-150 signs cover the vast majority of common texts. Our 8-lesson curriculum focuses on the most essential and frequently encountered signs, giving you a practical reading ability that covers real-world inscriptions.",
  },
  {
    question: "Do I get a certificate?",
    answer:
      "Yes. When you complete all 8 lessons in the Temple of Thoth curriculum, you earn a certificate of completion that you can download and share. It recognises your achievement in learning to read ancient Egyptian hieroglyphics.",
  },
  {
    question: "How often is the site updated?",
    answer:
      "We update Learn Hieroglyphics weekly, adding new lessons, improving existing content, publishing blog posts, and refining the learning experience based on student feedback. Lifetime access includes all current and future content at no additional cost.",
  },
  {
    question: "Do I get a discount if I'm a student?",
    answer:
      "Yes, students get free access. Use the contact form at the bottom of this page to get in touch from your .edu email address, and we'll set you up with a free account. We believe cost shouldn't be a barrier to learning about ancient civilisation.",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const freeGuest = useFreeCourseGuest();

  return (
    <section id="faq" className="relative py-20">
      <InView className="max-w-5xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="reveal inline-flex items-center gap-3 mb-6">
            <span className="h-px w-12 bg-gold-700" />
            <span className="font-body text-xs tracking-[0.3em] uppercase text-gold-500">
              Common Questions
            </span>
            <span className="h-px w-12 bg-gold-700" />
          </div>

          <h2
            className="reveal font-display text-4xl md:text-5xl font-light text-sand-100 mb-4"
            style={reveal(0.1, { y: 30 })}
          >
            Frequently Asked{" "}
            <span className="text-gradient-gold font-medium">Questions</span>
          </h2>

          <p className="reveal font-body text-sand-400 font-light" style={reveal(0.2)}>
            Everything you need to know about learning hieroglyphics.
          </p>
        </div>

        {/* FAQ Items — answers stay in the DOM (crawlable) and expand via the
            CSS .accordion-panel grid transition instead of framer-motion. */}
        <div className="space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className="faq-item reveal border border-gold-700/15 bg-obsidian-light/50 overflow-hidden"
                style={reveal(0.3 + i * 0.05, { dur: 0.5 })}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${i}`}
                  className="w-full flex items-center justify-between p-5 text-left group"
                >
                  <span className="faq-q font-body text-sm font-medium text-sand-200 group-hover:text-gold-400 transition-colors pr-4">
                    {faq.question}
                  </span>
                  <span
                    className={`faq-plus flex-shrink-0 text-gold-600 text-lg transition-transform duration-200${isOpen ? " rotate-45" : ""}`}
                  >
                    +
                  </span>
                </button>

                <div
                  id={`faq-panel-${i}`}
                  className="accordion-panel"
                  data-open={isOpen ? "true" : "false"}
                >
                  <div>
                    <div className="px-5 pb-5 pt-0">
                      <p className="faq-a font-body text-sm text-sand-400 font-light leading-relaxed">
                        {freeGuest && faq.question === "How does pricing work?" ? FREE_PRICING_ANSWER : faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* JSON-LD structured data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: faqs.map((faq) => ({
                "@type": "Question",
                name: faq.question,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: faq.answer,
                },
              })),
            }),
          }}
        />
      </InView>
    </section>
  );
}

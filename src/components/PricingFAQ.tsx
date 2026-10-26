"use client";

import { useState } from "react";
import { reveal } from "@/components/reveal";
import { useFreeCourseGuest } from "@/components/useFreeCourseGuest";

const faqs = [
  {
    question: "Is Lifetime really a one-time payment?",
    answer:
      "Yes. You pay $19.99 (£15.99) once and receive lifetime access to the full course: every lesson, game and future chamber. No recurring charge, no expiring licence.",
  },
  {
    question: "What is the Expedition Pass?",
    answer:
      "The full course for $4.99 (£3.99) a month, for people who would rather not pay up front. Cancel any time from your account page; your progress is kept if you come back. Four months costs about the same as Lifetime, so if you know you'll finish, Lifetime is the better deal.",
  },
  {
    question: "How do Classroom and School licences work?",
    answer:
      "A teacher buys the licence and gets a class code. Pupils create a free account, enter the code at /join, and have the full course while the licence runs. Classroom covers you and up to 30 pupils for a year ($29.50 / £24.50); School has no seat limit ($124.50 / £99.50). Your licence page shows every pupil's progress. Schools that need a purchase order can contact us.",
  },
  {
    question: "Can I try a lesson before I buy?",
    answer:
      "Yes. Our first lesson, 'The Expedition Begins', is completely free with a free account. Work through it to get a feel for the teaching style before committing.",
  },
  {
    question: "What exactly does 'lifetime access' cover?",
    answer:
      "Every lesson, exercise, game and quiz currently on the platform, plus any new content we add in the future. No extra charges, no upgrade tiers.",
  },
  {
    question: "Do I need any prior knowledge?",
    answer:
      "No prior knowledge is needed. The course starts from scratch with the 24 uniliteral signs (the hieroglyphic alphabet) and builds up from there. It's designed for complete beginners.",
  },
  {
    question: "How long does it take to complete the course?",
    answer:
      "Most learners complete all 8 lessons in 4 to 8 weeks, studying a few hours per week. The course is entirely self-paced, so you can go faster or slower depending on your schedule.",
  },
  {
    question: "Will new lessons be added?",
    answer:
      "Yes. New lessons are added regularly. Your one-time purchase includes access to all current and future content at no additional cost.",
  },
  {
    question: "Do you offer refunds?",
    answer:
      "If you're unhappy with the course within 14 days of purchase, contact us and we'll refund you in full, no questions asked.",
  },
];

// The free-unlock test's free group (src/lib/access-test.ts) is not asked to buy, so the buying questions give way
// to one about the free course. (The FAQ schema below keeps the full list for crawlers.)
const PAID_ONLY = new Set(["Is Lifetime really a one-time payment?", "What is the Expedition Pass?", "Can I try a lesson before I buy?", "What exactly does 'lifetime access' cover?", "Do you offer refunds?"]);
const FREE_FAQ = { question: "Is the course really free?", answer: "For you, the whole course is free: make an account and all eight lessons, the 3D levels, the Journey and the certificate open on it, with nothing to pay. Teachers can still buy a Classroom or School licence for a class." };

export default function PricingFAQ() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const freeGuest = useFreeCourseGuest();
  const shown = freeGuest ? [FREE_FAQ, ...faqs.filter((f) => !PAID_ONLY.has(f.question))] : faqs;

  return (
    <div className="is-inview">
      <h2 className="font-display text-2xl md:text-3xl font-semibold text-sand-100 mb-6 text-center">
        Frequently Asked Questions
      </h2>
      <div className="space-y-3">
        {shown.map((faq, i) => (
          <div
            key={i}
            className="border border-gold-700/15 bg-obsidian-light/50 overflow-hidden"
          >
            <button
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
              className="w-full flex items-center justify-between p-5 text-left group"
            >
              <span className="font-body text-base font-medium text-sand-200 group-hover:text-gold-400 transition-colors pr-4">
                {faq.question}
              </span>
              <span className={`flex-shrink-0 text-gold-600 text-lg transition-transform duration-200 ${openFaq === i ? "rotate-45" : ""}`}>
                +
              </span>
            </button>
            {openFaq === i && (
              <div className="reveal" style={reveal(0, { y: -6, dur: 0.3 })}>
                <div className="px-5 pb-5 pt-0">
                  <p className="font-body text-base text-sand-400 font-light leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
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
    </div>
  );
}

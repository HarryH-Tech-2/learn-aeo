"use client";

/**
 * The pricing page's FAQ, with FAQPage schema. Prices are read from src/lib/plans.ts (formatPlanPrice), never
 * typed here, so they always match the cards and Stripe.
 */
import { useState } from "react";
import { reveal } from "@/components/reveal";
import { useFreeCourseGuest } from "@/components/useFreeCourseGuest";
import { PLANS, formatPlanPrice } from "@/lib/plans";

const both = (plan: (typeof PLANS)[keyof typeof PLANS]) => `${formatPlanPrice(plan, "USD")} (${formatPlanPrice(plan, "GBP")})`;
const MONTHS_TO_LIFETIME = Math.round(PLANS.lifetime.usd / PLANS.monthly.usd);

const faqs = [
  {
    question: "Is Lifetime really a one-time payment?",
    answer: `Yes. You pay ${both(PLANS.lifetime)} once and keep the full course for good: every lesson, including each new one as it's released, plus the tools, templates and certificate. No recurring charge.`,
  },
  {
    question: "How does the Monthly plan work?",
    answer: `The full course for ${both(PLANS.monthly)} a month, for people who would rather not pay up front. Cancel any time from your account page; your progress is kept if you come back. ${MONTHS_TO_LIFETIME} months costs the same as Lifetime, so if you know you'll finish, Lifetime is the better deal.`,
  },
  {
    question: "Can I try a lesson before I buy?",
    answer: "Yes. The first lesson is completely free with a free account. Work through it to get a feel for the teaching before you pay anything.",
  },
  {
    question: "What exactly does 'lifetime access' cover?",
    answer: "Every lesson, tool, template and quiz on the platform now, plus any new lessons we add as answer engines change. No extra charges, no upgrade tiers.",
  },
  {
    question: "Do I need any prior knowledge?",
    answer: "No. If you work in marketing you have everything you need. The course starts from how answer engines pick their sources and builds up from there.",
  },
  {
    question: "How long does it take to complete the course?",
    answer: "Most learners finish all 8 lessons in a few weeks, a couple of hours a week. It's entirely self-paced, so you can go faster or slower.",
  },
  {
    question: "Will new lessons be added?",
    answer: "Yes. New lessons are added as answer engines change. Lifetime includes every current and future lesson at no extra cost.",
  },
  {
    question: "Do you offer refunds?",
    answer: "If you're unhappy with the course within 14 days of purchase, contact us and we'll refund you in full, no questions asked.",
  },
];

// The free-unlock test's free group (src/lib/access-test.ts) is not asked to buy, so the buying questions give way
// to one about the free course. (The FAQ schema below keeps the full list for crawlers.)
const PAID_ONLY = new Set(["Is Lifetime really a one-time payment?", "How does the Monthly plan work?", "Can I try a lesson before I buy?", "What exactly does 'lifetime access' cover?", "Do you offer refunds?"]);
const FREE_FAQ = { question: "Is the course really free?", answer: "For you, the whole course is free: make an account and all eight lessons, the tools and the certificate open on it, with nothing to pay." };

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

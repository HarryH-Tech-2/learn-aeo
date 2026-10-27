"use client";

import { useState } from "react";
import InView from "@/components/InView";
import { reveal } from "@/components/reveal";
import { useFreeCourseGuest } from "@/components/useFreeCourseGuest";
import { PLANS, formatPlanPrice } from "@/lib/plans";
import { LESSON_CATALOG } from "@/lib/lesson-catalog";

// What the free-unlock test's free group reads instead (src/lib/access-test.ts); the FAQ schema keeps the real answer.
const FREE_PRICING_ANSWER =
  "For you, the whole course is free: make an account and every live lesson, and the certificate when you finish, open on it, with nothing to pay.";

const PRICING_QUESTION = "How does pricing work?";

// Course facts come from the catalog (src/lib/lesson-catalog.ts), prices from src/lib/plans.ts, and the refund and
// discount terms from the Terms of Service (src/app/terms/TermsContent.tsx), so the answers never drift from them.
const FIRST = LESSON_CATALOG[0];
const LIVE = LESSON_CATALOG.filter((l) => l.status === "live");
const SOON = LESSON_CATALOG.filter((l) => l.status === "coming-soon");
const MINUTES = LESSON_CATALOG.map((l) => l.minutes);
const TOTAL = LESSON_CATALOG.length;

function orderRange(lessons: readonly { order: number }[]): string {
  if (lessons.length === 1) return `Lesson ${lessons[0].order}`;
  return `Lessons ${lessons[0].order} to ${lessons[lessons.length - 1].order}`;
}

const faqs = [
  {
    question: "What is answer engine optimisation (AEO)?",
    answer:
      "AEO is the work of making your pages easy for AI answer engines (ChatGPT search, Perplexity, Google AI Overviews and AI Mode, Copilot, Claude) to reach, understand and cite when they answer a question. It builds on SEO rather than replacing it: a page an engine cannot crawl or index is a page it cannot cite.",
  },
  {
    question: "How is AEO different from SEO?",
    answer:
      "SEO wins you a place in a list of results. AEO wins you a place inside an answer: a link the engine cites, or your brand named in the text it writes. The foundations carry over, but what gets used is often a single passage rather than a whole page, and part of what engines know about you comes from sites you do not control.",
  },
  {
    question: "Who is the course for?",
    answer:
      "Marketers who already know SEO basics: in-house, agency or freelance. You do not need to code, though you will read robots.txt files and JSON-LD snippets and decide what they should say.",
  },
  {
    question: "Do I need to know SEO first?",
    answer:
      "You should know the basics: what crawling and indexing are, and what a title tag and a sitemap do. The course does not teach them again; it starts where they stop.",
  },
  {
    question: "What is in the course?",
    answer: `${TOTAL} lessons, one for each district of the City of Answers: ${LESSON_CATALOG.map(
      (l) => `${l.district} (${l.title.charAt(0).toLowerCase()}${l.title.slice(1)})`,
    ).join(", ")}. Each lesson mixes short explanations with checks, hands-on exercises and an audit at the end.`,
  },
  {
    question: "Are all the lessons out yet?",
    answer:
      SOON.length === 0
        ? `Yes. All ${TOTAL} lessons are live.`
        : `Not yet. ${orderRange(LIVE)} are live now: ${LIVE.map((l) => l.title).join(", ")}. ${orderRange(SOON)} are coming soon, and both plans include every lesson as it opens.`,
  },
  {
    question: "What is free?",
    answer: `Lesson ${FIRST.order}, ${FIRST.title}, is free once you sign in with Google or your email address. No card is needed.`,
  },
  {
    question: "How long does it take?",
    answer: `Each lesson takes about ${Math.min(...MINUTES)} to ${Math.max(...MINUTES)} minutes. It is self-paced, so you can do one in a lunch break or several in a sitting, and your progress is saved as you go.`,
  },
  {
    question: "Do I get a certificate?",
    answer: `Yes. Once you have completed all ${TOTAL} lessons you can download a Learn AEO certificate with your name on it, ready to share on LinkedIn.`,
  },
  {
    question: PRICING_QUESTION,
    answer: `Lifetime access is a single payment of ${formatPlanPrice(PLANS.lifetime, "USD")} (${formatPlanPrice(PLANS.lifetime, "GBP")}), with no recurring charges. If you would rather not pay up front, the Monthly plan is ${formatPlanPrice(PLANS.monthly, "USD")} (${formatPlanPrice(PLANS.monthly, "GBP")}) a month and you can cancel any time from your account. Payments are handled by Stripe.`,
  },
  {
    question: "Can I get a refund?",
    answer:
      "Yes. There is a 14-day money-back guarantee: if you are unhappy with the course within 14 days of buying it, email us and we will refund you in full. A Monthly plan can be cancelled at any time, and your access runs to the end of the period you have paid for.",
  },
  {
    question: "Is there a discount?",
    answer:
      "If you are visiting from a country with lower purchasing power, a percentage discount is offered automatically and applied at checkout.",
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
            What the course covers, what it costs, and what you get.
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
                        {freeGuest && faq.question === PRICING_QUESTION ? FREE_PRICING_ANSWER : faq.answer}
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

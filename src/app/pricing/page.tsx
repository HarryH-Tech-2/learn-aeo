import type { Metadata } from "next";
import { SITE, absoluteUrl } from "@/lib/site";
import Navbar from "@/components/Navbar";
import PricingSection from "@/components/PricingSection";
import PricingFAQ from "@/components/PricingFAQ";
import Footer from "@/components/Footer";
import { PLANS, PLAN_IDS, formatPlanPrice } from "@/lib/plans";
import { LESSON_CATALOG, titleMidSentence } from "@/lib/lesson-catalog";

export const metadata: Metadata = {
  title: "Pricing: Lifetime or Monthly | Learn AEO",
  description: `Lifetime access to the answer engine optimization course for one payment of ${formatPlanPrice(PLANS.lifetime, "USD")}, or ${formatPlanPrice(PLANS.monthly, "USD")} a month. The first lesson is free.`,
  alternates: {
    canonical: absoluteUrl("/pricing"),
  },
};

const LIVE = LESSON_CATALOG.filter((l) => l.status === "live");
const FIRST = LESSON_CATALOG[0];
const LAST = LESSON_CATALOG[LESSON_CATALOG.length - 1];

/** What's included: lesson counts and district names from the catalog, never typed here. */
const INCLUDED = [
  {
    title: `${LESSON_CATALOG.length} lessons, ${LIVE.length} live now`,
    body: `One lesson for each district of the City of Answers, from ${FIRST.district} (${titleMidSentence(FIRST.title)}) to ${LAST.district} (${titleMidSentence(LAST.title)}). The rest open as they are finished, at no extra cost.`,
  },
  {
    title: "Checks and hands-on exercises",
    body: "Each group of concepts ends with a quick check, and each lesson has a hands-on exercise: trace an answer through an engine, fix a robots.txt file, rewrite a passage answer-first.",
  },
  {
    title: "An audit to finish each lesson",
    body: "Every lesson ends with an audit that tests what you have learned and earns XP toward your level.",
  },
  {
    title: "Certificate of completion",
    body: `Finish all ${LESSON_CATALOG.length} lessons and download a Learn AEO certificate with your name on it, ready to share on LinkedIn.`,
  },
];

export default function PricingPage() {
  return (
    <main className="grain-overlay">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Course",
            name: "Learn AEO",
            description:
              "Online course for marketers on answer engine optimization (AEO): how to get your brand cited by ChatGPT, Perplexity, Google AI Overviews and other answer engines.",
            provider: {
              "@type": "Organization",
              name: "Learn AEO",
              url: SITE.url,
            },
            offers: PLAN_IDS.map((id) => ({
              "@type": "Offer",
              name: PLANS[id].name,
              price: String(PLANS[id].usd),
              priceCurrency: "USD",
              availability: "https://schema.org/InStock",
              url: absoluteUrl("/pricing"),
            })),
            hasCourseInstance: {
              "@type": "CourseInstance",
              courseMode: "online",
              courseWorkload: "self-paced",
            },
          }),
        }}
      />
      <Navbar />
      <div className="pt-16" />
      <PricingSection />
      <div className="max-w-4xl mx-auto px-6 lg:px-8 py-16">
        <h2 className="font-display text-2xl md:text-3xl font-semibold text-sand-100 mb-6 text-center">
          What&apos;s Included
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {INCLUDED.map((item) => (
            <div key={item.title} className="border border-gold-700/20 p-6 bg-obsidian-light/50">
              <h3 className="font-display text-lg font-medium text-gold-400 mb-3">{item.title}</h3>
              <p className="font-body text-sm text-sand-400 font-light leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
        <PricingFAQ />
      </div>
      <Footer />
    </main>
  );
}

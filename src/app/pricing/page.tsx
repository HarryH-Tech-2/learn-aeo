import type { Metadata } from "next";
import { SITE, absoluteUrl } from "@/lib/site";
import Navbar from "@/components/Navbar";
import PricingSection from "@/components/PricingSection";
import PricingFAQ from "@/components/PricingFAQ";
import Footer from "@/components/Footer";
import { PLANS, PLAN_IDS } from "@/lib/plans";

export const metadata: Metadata = {
  title: "Pricing: Lifetime, Monthly Pass and Classroom Licences | Learn AEO",
  description:
    "Lifetime access for one payment of $19.99, an Expedition Pass at $4.99 a month, or Classroom and School licences for teachers. The first lesson is free.",
  alternates: {
    canonical: absoluteUrl("/pricing"),
  },
};

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
              "Interactive online course covering the hieroglyphic alphabet, cartouches, temple inscriptions, and Book of the Dead.",
            provider: {
              "@type": "Organization",
              name: "Learn AEO",
              url: SITE.url,
            },
            offers: PLAN_IDS.map((id) => ({
              "@type": "Offer",
              name: `${PLANS[id].name}${PLANS[id].mode === "subscription" ? ` (${PLANS[id].interval}ly)` : ""}`,
              price: PLANS[id].usd.toFixed(2),
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
          <div className="border border-gold-700/20 p-6 bg-obsidian-light/50">
            <h3 className="font-display text-lg font-medium text-gold-400 mb-3">8 Immersive Lessons</h3>
            <p className="font-body text-sm text-sand-400 font-light leading-relaxed">
              From the hieroglyphic alphabet through royal cartouches, temple inscriptions,
              and the Book of the Dead. Each lesson builds on the last with guided exercises
              and cultural context.
            </p>
          </div>
          <div className="border border-gold-700/20 p-6 bg-obsidian-light/50">
            <h3 className="font-display text-lg font-medium text-gold-400 mb-3">Interactive Quizzes</h3>
            <p className="font-body text-sm text-sand-400 font-light leading-relaxed">
              Reinforce your learning with quizzes after every lesson. Practice identifying
              hieroglyphs, reading cartouches, and translating real inscriptions.
            </p>
          </div>
          <div className="border border-gold-700/20 p-6 bg-obsidian-light/50">
            <h3 className="font-display text-lg font-medium text-gold-400 mb-3">Progressive Difficulty</h3>
            <p className="font-body text-sm text-sand-400 font-light leading-relaxed">
              Start with the 24 uniliteral signs and progress through biliterals, triliterals,
              determinatives, and full sentences. The course adapts to your pace.
            </p>
          </div>
          <div className="border border-gold-700/20 p-6 bg-obsidian-light/50">
            <h3 className="font-display text-lg font-medium text-gold-400 mb-3">Completion Certificate</h3>
            <p className="font-body text-sm text-sand-400 font-light leading-relaxed">
              Earn a shareable certificate when you complete the course. Show off your
              achievement to friends, colleagues, or your mummy.
            </p>
          </div>
        </div>
        <PricingFAQ />
      </div>
      <Footer />
    </main>
  );
}

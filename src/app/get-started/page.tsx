import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GetStartedContent from "./GetStartedContent";
import { PLANS, formatPlanPrice } from "@/lib/plans";
import { LESSON_CATALOG, courseParts } from "@/lib/lesson-catalog";
import { pageMetadata } from "@/lib/seo";

const FIRST = LESSON_CATALOG[0];

export const metadata: Metadata = pageMetadata({
  title: "Start learning AEO: lesson 1 is free",
  description:
    `Sign in free and start lesson 1 of the Learn AEO answer engine optimization course. Unlock the rest for a one-time ${formatPlanPrice(PLANS.lifetime, "USD")} payment or ${formatPlanPrice(PLANS.monthly, "USD")} a month.`,
  path: "/get-started",
});

export default function GetStartedPage() {
  return (
    <main className="grain-overlay min-h-screen flex flex-col">
      <Navbar />
      {/* Server-rendered SEO content — visible to crawlers, visually hidden for users who see the form */}
      <section className="sr-only" aria-hidden="false">
        <h1>Start learning answer engine optimization: lesson 1 free</h1>
        <p>
          Sign in with Google or your email address and start lesson 1, {FIRST.title}, straight away. When you&apos;re
          ready, unlock the rest of the course for a single payment of {formatPlanPrice(PLANS.lifetime, "USD")}, or learn
          month by month for {formatPlanPrice(PLANS.monthly, "USD")}. Both include every lesson as it opens.
        </p>
        <h2>The {LESSON_CATALOG.length} lessons</h2>
        {courseParts().map(({ part, number, lessons }) => (
          <div key={part.title}>
            <h3>
              Part {number}: {part.title}
            </h3>
            <ul>
              {lessons.map((l) => (
                <li key={l.id}>
                  Lesson {l.order}, {l.district}: {l.title}
                  {l.status === "coming-soon" ? " (coming soon)" : l.isFree ? " (free)" : ""}. {l.summary}
                </li>
              ))}
            </ul>
          </div>
        ))}
        <h2>Who it is for</h2>
        <p>
          Marketers who know SEO basics and want their pages cited by ChatGPT, Perplexity, Google AI Overviews and other
          AI search tools.
        </p>
      </section>
      <GetStartedContent />
      <Footer />
    </main>
  );
}

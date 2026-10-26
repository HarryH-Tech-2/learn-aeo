import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/site";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GetStartedContent from "./GetStartedContent";

export const metadata: Metadata = {
  title: "Start Learning Hieroglyphics | Free First Lesson",
  description:
    "Create a free account and start your first hieroglyphics lesson. Unlock the full course anytime with a one-time $19.99 payment.",
  alternates: {
    canonical: absoluteUrl("/get-started"),
  },
};

export default function GetStartedPage() {
  return (
    <main className="grain-overlay min-h-screen flex flex-col">
      <Navbar />
      {/* Server-rendered SEO content — visible to crawlers, visually hidden for users who see the form */}
      <section className="sr-only" aria-hidden="false">
        <h1>Start Learning Hieroglyphics: First Lesson Free</h1>
        <p>
          Create a free account and begin your first lesson right away. When
          you&apos;re ready, unlock the full hieroglyphics course for a single
          one-time payment of $19.99, or dig month by month for $4.99.
          Every current and future lesson included.
        </p>
        <h2>What you&apos;ll learn</h2>
        <ul>
          <li>The 24 uniliteral signs that form the hieroglyphic alphabet</li>
          <li>Interactive quizzes to reinforce each sign</li>
          <li>Pronunciation guide for every glyph</li>
          <li>How to read royal cartouches and temple inscriptions</li>
          <li>Cultural context and mythology of ancient Egypt</li>
          <li>Real inscription reading from tombs and monuments</li>
        </ul>
        <h2>Why learn hieroglyphics?</h2>
        <p>
          Hieroglyphics were the writing system of ancient Egypt for over 3,000
          years. Learning to read them connects you directly with one of
          history&apos;s greatest civilizations, from the pyramids of Giza to the
          temples of Luxor.
        </p>
      </section>
      <GetStartedContent />
      <Footer />
    </main>
  );
}

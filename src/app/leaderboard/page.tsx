import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Leaderboard from "@/components/Leaderboard";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Leaderboard",
  description:
    "The Learn AEO leaderboard ranks learners by XP earned from concept cards, quick checks, exercises and lesson audits.",
  path: "/leaderboard",
});

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen bg-obsidian grain-overlay flex flex-col">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 lg:px-8 pt-28 pb-20 flex-1 w-full">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="font-body text-xs tracking-[0.2em] uppercase text-gold-500">Leaderboard</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-light text-sand-100 mb-2">
            Who knows the <span className="text-gradient-gold font-medium">city</span> best?
          </h1>
          <p className="font-body text-sand-500 font-light">
            XP comes from every concept card you read, every quick check and exercise you get right, and every audit answer.
            Names are shown as first name and last initial.
          </p>
        </div>
        <Leaderboard limit={50} heading="Top 50 learners" />
      </div>
      <Footer />
    </div>
  );
}

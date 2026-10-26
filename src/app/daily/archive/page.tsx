import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ArchiveList from "./ArchiveList";

const URL = "https://www.learnhieroglyphics.com/daily/archive";

export const metadata: Metadata = {
  title: "Cartouche of the Day archive: every past puzzle | Learn Hieroglyphics",
  description: "Missed a day? Replay every past Cartouche of the Day and read the royal names you haven't seen yet. Free, no account needed.",
  alternates: { canonical: URL },
};

// The list depends on the visitor's date and on what they have played, so it is drawn on the client.
export const dynamic = "force-static";

export default function DailyArchivePage() {
  return (
    <main className="min-h-screen bg-obsidian text-sand-100">
      <Navbar />
      <section className="max-w-3xl mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-12">
        <div className="text-center mb-8">
          <p className="font-body text-xs tracking-[0.3em] uppercase text-gold-500 mb-2">Cartouche of the Day</p>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-light">
            The <span className="text-gradient-gold font-medium">archive</span>
          </h1>
          <p className="font-body text-sand-400 mt-3 max-w-xl mx-auto text-sm sm:text-base">
            Every past puzzle, newest first. A king’s name appears once you have read it, so the ones you haven’t played stay a
            surprise. Replays don’t change your streak.
          </p>
        </div>
        <ArchiveList />
      </section>
      <Footer />
    </main>
  );
}

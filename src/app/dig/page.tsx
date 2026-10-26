import type { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkSubscription } from "@/lib/subscription";
import { getUserProgress } from "@/lib/progress";
import { devBypassAuth } from "@/lib/dev-bypass";
import { computeChambers, computeSideRooms, type LessonProgressMap, type Visitor } from "@/lib/dig";
import { dueCount } from "@/lib/srs-server";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DigMap from "./DigMap";

export const metadata: Metadata = {
  title: "The Dig: your tomb, one chamber per lesson | Learn Hieroglyphics",
  description:
    "An isometric plan of the tomb you are excavating. Chambers you have cleared are lit, the next one is a dark doorway, the rest is sand. Chamber I, the free lesson, is open to everyone.",
  alternates: { canonical: "https://www.learnhieroglyphics.com/dig" },
  robots: { index: true, follow: true },
};

// Progress is per visitor, so this page renders on demand.
export const dynamic = "force-dynamic";

async function loadVisitor(): Promise<{ visitor: Visitor; progress: LessonProgressMap | null; due: number | null }> {
  if (devBypassAuth()) {
    // Local preview: a paid member three chambers in.
    const done = { started: true, bestScore: 9, completed: true };
    return { visitor: { signedIn: true, paid: true }, progress: { "expedition-begins": done, "outer-courtyard": done, "pilgrims-gallery": done }, due: 7 };
  }
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; email?: string | null } | undefined;
  if (!user?.id) return { visitor: { signedIn: false, paid: false }, progress: null, due: null };
  const [sub, prog] = await Promise.all([user.email ? checkSubscription(user.email) : Promise.resolve({ active: false }), getUserProgress(user.id)]);
  const due = await dueCount(user.id, sub.active).catch(() => null);
  return { visitor: { signedIn: true, paid: sub.active }, progress: prog.lessons, due };
}

export default async function DigPage() {
  const { visitor, progress, due } = await loadVisitor();
  const chambers = computeChambers(visitor, progress);
  const sideRooms = computeSideRooms(visitor);

  return (
    <main className="min-h-screen bg-obsidian text-sand-100">
      <Navbar />
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-16">
        <div className="text-center mb-6">
          <p className="font-body text-xs tracking-[0.3em] uppercase text-gold-500 mb-2">Your excavation</p>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-light">
            The <span className="text-gradient-gold font-medium">Dig</span>
          </h1>
          <p className="font-body text-sand-400 mt-3 max-w-xl mx-auto text-sm sm:text-base">
            One chamber per lesson. Cleared chambers stay lit; the next one is a dark doorway; the rest is still sand. Side rooms are the games that practise each chamber’s signs.
          </p>
        </div>

        <DigMap chambers={chambers} sideRooms={sideRooms} visitor={visitor} dueCount={due} />

        <p className="font-body text-xs text-sand-500 text-center mt-8">
          {visitor.signedIn ? (
            <>
              <Link href="/dashboard" className="text-gold-500 underline underline-offset-4">
                Dashboard
              </Link>{" "}
              · XP, badges and the Hall of Scribes
            </>
          ) : (
            <>
              Free to start:{" "}
              <Link href="/lessons/expedition-begins" className="text-gold-500 underline underline-offset-4">
                Chamber I, the 25 alphabet signs
              </Link>{" "}
              ·{" "}
              <Link href="/daily" className="text-gold-500 underline underline-offset-4">
                today’s cartouche
              </Link>
            </>
          )}
        </p>
      </section>
      <Footer />
    </main>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { lookUpUnitPackSession } from "@/lib/unit-pack/session";
import { UNIT_PACK, unitPackDownloadPath } from "@/lib/unit-pack/product";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your Ancient Egypt Writing Unit | Learn Hieroglyphics",
  description: "Download the Ancient Egypt Writing Unit.",
  robots: { index: false, follow: false },
};

type Props = { searchParams: Promise<{ session_id?: string }> };

/** The thank-you page after buying the unit: the download, on either paper size. */
export default async function UnitPackThanksPage({ searchParams }: Props) {
  const { session_id } = await searchParams;
  const { found, paid, paper, email } = await lookUpUnitPackSession(session_id);
  const other = paper === "letter" ? "a4" : "letter";
  const label = (p: "a4" | "letter") => (p === "letter" ? "US Letter" : "A4");

  return (
    <main className="min-h-screen bg-obsidian">
      <Navbar />
      <section className="px-4 pb-20 pt-24 sm:px-6 md:pt-32">
        <div className="mx-auto max-w-2xl text-center">
          {paid && session_id ? (
            <>
              <h1 className="font-display text-3xl text-sand-100 md:text-4xl">Thank you. Your unit is ready</h1>
              <p className="mt-3 font-body text-sand-300">
                The {UNIT_PACK.name}: five lesson plans, the worksheets, the quiz and the answers in one PDF
                {email ? `. A copy is on its way to ${email}` : ""}.
              </p>
              <div className="mt-8 flex flex-col items-center gap-3">
                <a
                  href={unitPackDownloadPath(session_id, paper)}
                  className="inline-flex items-center justify-center bg-gold-500 px-7 py-3 font-body text-base font-semibold text-black transition-colors hover:bg-gold-400"
                >
                  Download the unit ({label(paper)})
                </a>
                <a href={unitPackDownloadPath(session_id, other)} className="font-body text-sm text-gold-400 underline underline-offset-4">
                  Or on {label(other)} paper
                </a>
              </div>
              <div className="mt-12 grid gap-3 text-left sm:grid-cols-2">
                <Link href="/teachers/class" className="border border-gold-700/40 p-4 transition-colors hover:border-gold-400">
                  <p className="font-display text-lg text-sand-100">The Lesson 5 finale</p>
                  <p className="mt-1 font-body text-sm text-sand-400">A live hieroglyph quiz on the whiteboard, pupils join with a team name. Free for 7 days.</p>
                </Link>
                <Link href="/translate-name-to-hieroglyphics" className="border border-gold-700/40 p-4 transition-colors hover:border-gold-400">
                  <p className="font-display text-lg text-sand-100">For the Lesson 2 starter</p>
                  <p className="mt-1 font-body text-sm text-sand-400">The name translator: type a pupil&apos;s name on the whiteboard and the class works out the rules.</p>
                </Link>
              </div>
              <p className="mt-8 font-body text-sm text-sand-500">
                Anything not working for your class? Reply to the email or{" "}
                <Link href="/contact" className="text-gold-400 underline">
                  get in touch
                </Link>
                .
              </p>
            </>
          ) : (
            <>
              <h1 className="font-display text-3xl text-sand-100">We could not find that purchase</h1>
              <p className="mt-3 font-body text-sand-300">
                {found ? "The payment has not gone through yet. If you were charged, the PDF will arrive by email shortly." : "The link may be incomplete."} Reply to any of our emails, or{" "}
                <Link href="/contact" className="text-gold-400 underline">
                  get in touch
                </Link>
                , and we will sort it out.
              </p>
              <Link href="/teachers/unit-pack" className="mt-6 inline-block text-gold-400 underline">
                Back to the unit
              </Link>
            </>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { lookUpClassSetSession } from "@/lib/class-set-server";
import { classSetDownloadPath } from "@/lib/class-set";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your Class Cartouche Set | Learn Hieroglyphics",
  description: "Download your Class Cartouche Set.",
  robots: { index: false, follow: false },
};

type Props = { searchParams: Promise<{ session_id?: string }> };

/** The thank-you page after buying a class set: the download, rebuilt against the session id. */
export default async function ClassSetThanksPage({ searchParams }: Props) {
  const { session_id } = await searchParams;
  const { found, paid, names, email } = await lookUpClassSetSession(session_id);

  return (
    <main className="min-h-screen bg-obsidian">
      <Navbar />
      <section className="px-4 pb-20 pt-24 sm:px-6 md:pt-32">
        <div className="mx-auto max-w-2xl text-center">
          {paid && session_id ? (
            <>
              <h1 className="font-display text-3xl text-sand-100 md:text-4xl">Thank you. Your class set is ready</h1>
              <p className="mt-3 font-body text-sand-300">
                {names.length} pupil page{names.length === 1 ? "" : "s"} and a class page in one PDF
                {email ? `. A copy is on its way to ${email}` : ""}.
              </p>
              <div className="mt-8 flex flex-col items-center gap-3">
                <a
                  href={classSetDownloadPath(session_id)}
                  className="inline-flex items-center justify-center bg-gold-500 px-7 py-3 font-body text-base font-semibold text-black transition-colors hover:bg-gold-400"
                >
                  Download the set
                </a>
              </div>
              {names.length > 0 && (
                <p className="mx-auto mt-6 max-w-lg font-body text-sm text-sand-400">In this set: {names.join(", ")}.</p>
              )}
              <div className="mt-12 grid gap-3 text-left sm:grid-cols-2">
                <Link href="/teachers/class" className="border border-gold-700/40 p-4 transition-colors hover:border-gold-400">
                  <p className="font-display text-lg text-sand-100">Finish with the class quiz</p>
                  <p className="mt-1 font-body text-sm text-sand-400">A live hieroglyph quiz on the whiteboard, pupils answer in teams. Free for 7 days.</p>
                </Link>
                <Link href="/teachers/worksheet" className="border border-gold-700/40 p-4 transition-colors hover:border-gold-400">
                  <p className="font-display text-lg text-sand-100">The free worksheet</p>
                  <p className="mt-1 font-body text-sm text-sand-400">The alphabet chart and a blank cartouche, so pupils can write their own names first.</p>
                </Link>
              </div>
              <p className="mt-8 font-body text-sm text-sand-500">
                A name spelled oddly, or a pupil missing? Reply to the email or{" "}
                <Link href="/contact" className="text-gold-400 underline">
                  get in touch
                </Link>{" "}
                and you will get a corrected set.
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
              <Link href="/teachers/class-set" className="mt-6 inline-block text-gold-400 underline">
                Back to the class set
              </Link>
            </>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
}

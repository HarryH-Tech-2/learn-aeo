import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ClassSetForm from "./ClassSetForm";
import { CLASS_SET, CLASS_SET_MAX_NAMES, CLASS_SET_PAGE } from "@/lib/class-set";

const BASE = "https://www.learnhieroglyphics.com";

export const metadata: Metadata = {
  title: "Class Cartouche Set: Every Pupil's Name in Hieroglyphs (Printable PDF) | Learn Hieroglyphics",
  description: `Paste your class list and get one PDF: each pupil's name in a royal cartouche on its own A4 page, plus a class page with every name and its signs. Up to ${CLASS_SET_MAX_NAMES} names, ready for display or to take home.`,
  alternates: { canonical: `${BASE}${CLASS_SET_PAGE}` },
  openGraph: {
    title: "Class Cartouche Set: every pupil's name in hieroglyphs",
    description: "One printable PDF for the whole class: a cartouche page for each pupil and a class page.",
    url: `${BASE}${CLASS_SET_PAGE}`,
    type: "website",
  },
};

const FROM = ["class-strip", "teachers", "worksheet", "class"];

type Props = { searchParams: Promise<{ from?: string; class_set?: string }> };

/** The Class Cartouche Set: what it is, and the order form (src/app/teachers/class-set/ClassSetForm.tsx). */
export default async function ClassSetPage({ searchParams }: Props) {
  const { from, class_set } = await searchParams;
  const source = from && FROM.includes(from) ? from : "class-set";

  return (
    <main className="grain-overlay">
      <Navbar />
      <section className="px-4 pb-16 pt-32 sm:px-6 md:pt-36">
        <div className="mx-auto max-w-4xl">
          <p className="mb-4 font-body text-xs uppercase tracking-[0.25em] text-gold-500">
            <Link href="/teachers" className="hover:text-gold-300">
              For teachers
            </Link>{" "}
            &middot; Ancient Egypt display &amp; take-home
          </p>
          <h1 className="mb-5 font-display text-4xl font-light text-sand-100 md:text-5xl">
            Every pupil&rsquo;s name <span className="text-gradient-gold font-medium">in a cartouche</span>
          </h1>
          <p className="max-w-2xl font-body text-lg leading-relaxed text-sand-300">
            Paste your class list and get one PDF: each pupil&rsquo;s name written in hieroglyphs inside a royal cartouche, on
            its own A4 page, plus a class page with every name and its signs. Print it for a classroom display, hand the pages
            out at the end of the lesson, or send them home.
          </p>
          {class_set === "cancelled" && (
            <p className="mt-4 font-body text-sm text-sand-400">Checkout cancelled: your list is not saved, so paste it again when you are ready.</p>
          )}

          <div className="card-ancient mt-10 p-5 sm:p-8">
            <ClassSetForm from={source} />
          </div>

          <div className="mt-10 grid gap-4 font-body text-sm leading-relaxed text-sand-300 sm:grid-cols-3">
            <div>
              <p className="font-display text-lg text-sand-100">Spelled the way scribes did</p>
              <p className="mt-1">
                Each name is written sound by sound with the alphabet signs, the way Egyptologists write modern names, using the
                same rules as the{" "}
                <Link href="/translate-name-to-hieroglyphics" className="text-gold-400 underline underline-offset-2">
                  name translator
                </Link>
                .
              </p>
            </div>
            <div>
              <p className="font-display text-lg text-sand-100">Prints on any school printer</p>
              <p className="mt-1">
                Vector PDF, crisp at any size. Cream uses the least ink; Papyrus and Temple are full-page pictures for a display
                wall.
              </p>
            </div>
            <div>
              <p className="font-display text-lg text-sand-100">A name looks wrong?</p>
              <p className="mt-1">
                Reply to the email with the change and you get a corrected set. {CLASS_SET.name}s are for use with your own class.
              </p>
            </div>
          </div>

          <p className="mt-10 font-body text-sm text-sand-400">
            Teaching the whole topic? The{" "}
            <Link href="/teachers/unit-pack" className="text-gold-400 underline underline-offset-2">
              Ancient Egypt Writing Unit
            </Link>{" "}
            has five lesson plans with worksheets, and the{" "}
            <Link href="/teachers/class" className="text-gold-400 underline underline-offset-2">
              live class quiz
            </Link>{" "}
            makes a good finish (free for 7 days).
          </p>
        </div>
      </section>
      <Footer />
    </main>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getStripe } from "@/lib/stripe";
import { looksLikeCheckoutSessionId } from "@/lib/cartouche-print";
import { guestPlayHref } from "@/lib/guest-play";
import {
  KEYBOARD_HD,
  cleanText,
  isKeyboardStyle,
  isKeyboardTemplate,
  keyboardImagePath,
  keyboardRestorePath,
  printableName,
  type CardSpell,
  type KeyboardStyleId,
  type KeyboardTemplateId,
} from "@/lib/keyboard-card";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your HD hieroglyphs picture | Learn Hieroglyphics",
  description: "Download the HD picture of your hieroglyphs.",
  robots: { index: false, follow: false },
};

type Props = { searchParams: Promise<{ session_id?: string }> };

type Card = { typed: string[]; style: KeyboardStyleId; template: KeyboardTemplateId; spell: CardSpell; letters: boolean };

async function lookUp(sessionId: string | undefined): Promise<{ paid: boolean; card: Card | null; email: string | null }> {
  if (!looksLikeCheckoutSessionId(sessionId)) return { paid: false, card: null, email: null };
  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId);
    const md = session.metadata ?? {};
    if (md.product !== KEYBOARD_HD.id) return { paid: false, card: null, email: null };
    const spell: CardSpell = md.spell === "name" ? "name" : "keys";
    const card = {
      typed: cleanText(md.keys ?? "", spell),
      spell,
      style: isKeyboardStyle(md.style) ? md.style : "plain",
      template: isKeyboardTemplate(md.template) ? md.template : "none",
      letters: md.letters === "1",
    } as Card;
    return { paid: session.payment_status === "paid", card, email: session.customer_details?.email ?? session.customer_email ?? null };
  } catch (err) {
    console.error("[keyboard-image:page] session lookup failed:", err);
    return { paid: false, card: null, email: null };
  }
}

/** The thank-you page after buying the HD keyboard picture: a preview and the download. */
export default async function KeyboardHdPage({ searchParams }: Props) {
  const { session_id } = await searchParams;
  const { paid, card, email } = await lookUp(session_id);
  const name = card ? printableName(card.typed) : null;

  return (
    <main className="min-h-screen bg-obsidian">
      <Navbar />
      <section className="px-4 pb-20 pt-24 sm:px-6 md:pt-32">
        <div className="mx-auto max-w-3xl text-center">
          {paid && card ? (
            <>
              <h1 className="font-display text-3xl text-sand-100 md:text-4xl">Thank you. Your picture is ready</h1>
              <p className="mt-3 font-body text-sand-300">
                The HD copy, 2400 × 1260 and without our address{email ? `, is on its way to ${email} too` : ""}.
              </p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={keyboardImagePath(card)} alt={`${card.typed.join("").trim().toUpperCase()} in hieroglyphs`} className="mx-auto mt-8 w-full border border-gold-600/40" />
              <a
                href={`/api/keyboard-image/hd?session_id=${encodeURIComponent(session_id!)}`}
                className="mt-6 inline-flex items-center justify-center bg-gold-500 px-7 py-3 font-body text-base font-semibold text-black transition-colors hover:bg-gold-400"
              >
                Download the HD picture
              </a>
              <p className="mt-2 font-body text-xs text-sand-500">The preview above carries our address; the download does not.</p>
              <div className="mt-10 grid gap-3 text-left sm:grid-cols-2">
                {name && (
                  <Link href={keyboardRestorePath(card, { keep: "print" })} className="border border-gold-700/40 p-4 transition-colors hover:border-gold-400">
                    <p className="font-display text-lg text-sand-100">Put it on the wall</p>
                    <p className="mt-1 font-body text-sm text-sand-400">{name.toUpperCase()} in a pharaoh&rsquo;s cartouche, printed and posted, framed or not.</p>
                  </Link>
                )}
                <Link href={guestPlayHref()} className="border border-gold-700/40 p-4 transition-colors hover:border-gold-400">
                  <p className="font-display text-lg text-sand-100">Learn to read it yourself</p>
                  <p className="mt-1 font-body text-sm text-sand-400">Lesson 1 teaches the alphabet through real Egyptian words. It is free.</p>
                </Link>
              </div>
            </>
          ) : (
            <>
              <h1 className="font-display text-3xl text-sand-100">We could not find that purchase</h1>
              <p className="mt-3 font-body text-sand-300">
                {card ? "The payment has not gone through yet. If you were charged, the picture will arrive by email shortly." : "The link may be incomplete."} Reply to any of our emails, or{" "}
                <Link href="/contact" className="text-gold-400 underline">
                  get in touch
                </Link>
                , and we will sort it out.
              </p>
              <Link href="/hieroglyphics-keyboard" className="mt-6 inline-block text-gold-400 underline">
                Back to the keyboard
              </Link>
            </>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PrintReady from "./PrintReady";
import { getStripe } from "@/lib/stripe";
import {
  cartoucheImageDownloadPath,
  cartouchePrintDownloadPath,
  cartouchePrintFormat,
  cartouchePrintImagePath,
  cartouchePrintTheme,
  cartouchePrintFormatById,
  cartouchePrintName,
  cartouchePrintNames,
  isCartouchePrintSession,
  joinCartoucheNames,
  isPaidCartouchePrintSession,
  looksLikeCheckoutSessionId,
  type CartouchePrintFormatId,
  type CartouchePrintThemeId,
} from "@/lib/cartouche-print";
import { getHieroglyphs } from "@/lib/hieroglyph-translator";
import { TRANSLATOR_PATH, cartoucheSharePath } from "@/lib/share";
import { FREE_LESSON_PATH } from "@/lib/translator-bridge";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your Cartouche Print | Learn Hieroglyphics",
  description: "Download the print-ready PDF of your name in a cartouche.",
  robots: { index: false, follow: false },
};

type Props = { searchParams: Promise<{ session_id?: string }> };

type State =
  | { kind: "none" }
  | { kind: "unpaid"; name: string | null }
  | { kind: "paid"; name: string; names: string[]; email: string | null; sessionId: string; format: CartouchePrintFormatId; theme: CartouchePrintThemeId; shipTo: string | null };

async function lookUp(sessionId: string | undefined): Promise<State> {
  if (!looksLikeCheckoutSessionId(sessionId)) return { kind: "none" };
  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId);
    if (!isCartouchePrintSession(session)) return { kind: "none" };
    const name = cartouchePrintName(session);
    if (!isPaidCartouchePrintSession(session) || !name) return { kind: "unpaid", name };
    const legacy = (session as unknown as { shipping_details?: { address?: { city?: string | null; country?: string | null } | null } | null }).shipping_details;
    const addr = legacy?.address ?? session.collected_information?.shipping_details?.address ?? null;
    const shipTo = addr ? [addr.city, addr.country].filter(Boolean).join(", ") || null : null;
    return {
      kind: "paid",
      name,
      names: cartouchePrintNames(session),
      email: session.customer_details?.email ?? session.customer_email ?? null,
      sessionId,
      format: cartouchePrintFormat(session),
      theme: cartouchePrintTheme(session),
      shipTo,
    };
  } catch (err) {
    console.error("[cartouche-print:page] session lookup failed:", err);
    return { kind: "none" };
  }
}

export default async function CartouchePrintPage({ searchParams }: Props) {
  const { session_id } = await searchParams;
  const state = await lookUp(session_id);

  return (
    <main className="grain-overlay">
      <Navbar />
      <div className="min-h-screen pt-32 pb-20">
        <div className="max-w-2xl mx-auto px-6 lg:px-8 text-center">
          {state.kind === "paid" && cartouchePrintFormatById(state.format).file === "jpeg" ? (
            <>
              <PrintReady name={state.name} />
              <p className="font-body text-xs text-gold-500 tracking-[0.2em] uppercase mb-4">Paid, with thanks</p>
              <h1 className="font-display text-4xl md:text-5xl font-light text-sand-100 mb-8">
                Your cartouche is <span className="text-gradient-gold font-medium">ready</span>
              </h1>
              {/* The free share size as the preview; the download is the 300 dpi file without the address */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cartouchePrintImagePath(state.names.length > 1 ? state.names : state.name, state.theme)}
                alt={`The ${state.names.length > 1 ? "cartouches" : "cartouche"} of ${joinCartoucheNames(state.names)} in hieroglyphs`}
                width={1240}
                height={1754}
                className="mx-auto mb-8 w-full max-w-xs h-auto shadow-[0_18px_40px_-18px_rgba(0,0,0,0.7)]"
              />
              <a href={cartoucheImageDownloadPath(state.sessionId)} className="btn-primary text-sm py-3 px-8 justify-center" download>
                ⤓ Download the HD image
              </a>
              <p className="font-body text-sm text-sand-400 mt-5 leading-relaxed">
                A 300 dpi JPEG sized for A4 (2480 × 3508), with no web address on it.
                {state.email ? (
                  <>
                    {" "}
                    A copy is on its way to <span className="text-sand-200">{state.email}</span>, so this link is safe to lose.
                  </>
                ) : null}
              </p>
              <div className="mt-10 text-left border border-gold-700/20 bg-obsidian-light/50 p-5">
                <p className="font-body text-xs text-gold-500 tracking-[0.15em] uppercase mb-3">What to do with it</p>
                <ul className="font-body text-sm text-sand-300 space-y-2 leading-relaxed">
                  <li>Print it at 100% (no “fit to page”) on A4, the heaviest paper your printer takes, and it is ready for a frame.</li>
                  <li>Set it as the wallpaper on your phone or desktop.</li>
                  <li>
                    Rather we printed it? We make it as a giclée print on fine-art paper and post it, framed if you like.{" "}
                    <Link href={`${cartoucheSharePath(state.name)}#print`} className="text-gold-400 hover:text-gold-300 underline underline-offset-4">
                      See the prints
                    </Link>
                  </li>
                </ul>
              </div>
              <p className="font-body text-sm text-sand-500 mt-10">
                Want to read the rest of what the scribes wrote?{" "}
                <Link href={FREE_LESSON_PATH} className="text-gold-400 hover:text-gold-300 underline underline-offset-4">
                  The first lesson is free
                </Link>
                , and it teaches every sign in your name.
              </p>
            </>
          ) : state.kind === "paid" ? (
            <>
              <PrintReady name={state.name} />
              <p className="font-body text-xs text-gold-500 tracking-[0.2em] uppercase mb-4">Paid, with thanks</p>
              <h1 className="font-display text-4xl md:text-5xl font-light text-sand-100 mb-6">
                {cartouchePrintFormatById(state.format).physical ? (
                  <>
                    Your print is <span className="text-gradient-gold font-medium">being made</span>
                  </>
                ) : (
                  <>
                    Your print is <span className="text-gradient-gold font-medium">ready</span>
                  </>
                )}
              </h1>
              {cartouchePrintFormatById(state.format).physical && (
                <p className="font-body text-sand-300 mb-8 leading-relaxed">
                  The file has gone to the printer. Your {cartouchePrintFormatById(state.format).label.toLowerCase()} ships in{" "}
                  {cartouchePrintFormatById(state.format).shipsIn}
                  {state.shipTo ? <> to {state.shipTo}</> : null}, and you will get an email with tracking when it leaves. The PDF below is
                  yours as well.
                </p>
              )}
              {/* One block per name: a family print lists each, the way the page stacks them */}
              <div className="border border-gold-500/30 bg-gold-500/5 px-6 py-8 mb-8 flex flex-col gap-6">
                {state.names.map((n) => (
                  <div key={n}>
                    <p
                      className={`${state.names.length > 1 ? "text-4xl md:text-5xl" : "text-5xl md:text-6xl"} text-gold-400 leading-none mb-3 break-all`}
                      style={{ fontFamily: "'Noto Sans Egyptian Hieroglyphs', 'Segoe UI Historic', serif" }}
                      aria-label={`${n} in hieroglyphs`}
                    >
                      {getHieroglyphs(n)}
                    </p>
                    <p className="font-body text-xs text-sand-500 tracking-[0.15em] uppercase">The cartouche of {n}</p>
                  </div>
                ))}
              </div>
              <a
                href={cartouchePrintDownloadPath(state.sessionId)}
                className="btn-primary text-sm py-3 px-8 justify-center"
                download
              >
                ⤓ Download the PDF
              </a>
              <p className="font-body text-sm text-sand-400 mt-5 leading-relaxed">
                {state.names.length > 1
                  ? "A4 pages: the print with every name, a sign-by-sign key for each name and the story of the cartouche."
                  : "Three A4 pages: the print, a sign-by-sign key and the story of the cartouche."}
                {state.email ? (
                  <>
                    {" "}
                    A copy is on its way to <span className="text-sand-200">{state.email}</span>, so this link is safe to lose.
                  </>
                ) : null}
              </p>
              <div className="mt-10 text-left border border-gold-700/20 bg-obsidian-light/50 p-5">
                <p className="font-body text-xs text-gold-500 tracking-[0.15em] uppercase mb-3">Printing it</p>
                <ul className="font-body text-sm text-sand-300 space-y-2 leading-relaxed">
                  <li>Print page one at 100% (no “fit to page”) on A4, heavier paper if you have it: 160 gsm and up frames well.</li>
                  <li>Cream, papyrus and white print well at home. Night, with its deep blue page, is best run by a print shop on card.</li>
                  <li>Pages two and three are the key and the story: a good thing to fold behind the frame.</li>
                </ul>
              </div>
              <p className="font-body text-sm text-sand-500 mt-10">
                Want to read the rest of what the scribes wrote?{" "}
                <Link href={FREE_LESSON_PATH} className="text-gold-400 hover:text-gold-300 underline underline-offset-4">
                  The first lesson is free
                </Link>
                , and it teaches every sign in your name.
              </p>
            </>
          ) : state.kind === "unpaid" ? (
            <>
              <h1 className="font-display text-4xl font-light text-sand-100 mb-6">Payment not completed</h1>
              <p className="font-body text-sand-400 mb-8">
                Stripe has not confirmed this purchase yet. If you just paid, wait a moment and refresh this page. If you
                closed the checkout, you can start it again from your cartouche.
              </p>
              <Link href={state.name ? cartoucheSharePath(state.name) : TRANSLATOR_PATH} className="btn-secondary text-sm py-3 px-7">
                Back to {state.name ? `the cartouche of ${state.name}` : "the translator"}
              </Link>
            </>
          ) : (
            <>
              <h1 className="font-display text-4xl font-light text-sand-100 mb-6">Nothing to download here</h1>
              <p className="font-body text-sand-400 mb-8">
                This page opens from the link Stripe sends you after buying a Cartouche Print, and from the email that follows.
                Write a name on the translator to order one.
              </p>
              <Link href={TRANSLATOR_PATH} className="btn-secondary text-sm py-3 px-7">
                Open the name translator
              </Link>
            </>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}

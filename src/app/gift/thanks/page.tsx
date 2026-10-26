import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getStripe } from "@/lib/stripe";
import { certificateImagePath, giftFromSession, giftRedeemPath } from "@/lib/gift-course";
import { giftCode } from "@/lib/gift-code";
import CopyGiftLink from "./CopyGiftLink";

export const metadata: Metadata = { title: "Your Gift Is Ready | Learn Hieroglyphics", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

/** After the gift checkout: the gift link to send and the certificate, against the paid session id. */
export default async function GiftThanksPage({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  const { session_id } = await searchParams;
  let ready: { recipient: string; from: string; link: string; certificate: string } | null = null;
  if (session_id && /^cs_[A-Za-z0-9_]+$/.test(session_id)) {
    try {
      const session = await getStripe().checkout.sessions.retrieve(session_id);
      const gift = giftFromSession(session);
      if (gift && session.payment_status === "paid") {
        const base = process.env.NEXTAUTH_URL ?? "";
        ready = { ...gift, link: `${base}${giftRedeemPath(giftCode(session.id))}`, certificate: certificateImagePath(gift.recipient, new Date(), gift.from) };
      }
    } catch (err) {
      console.error("[gift:thanks] session lookup failed:", err);
    }
  }

  return (
    <main className="grain-overlay">
      <Navbar />
      <div className="min-h-screen pt-24 pb-20 md:pt-32">
        <div className="mx-auto max-w-3xl px-6 text-center lg:px-8">
          {ready ? (
            <>
              <p className="mb-3 font-body text-xs uppercase tracking-[0.25em] text-gold-500">Thank you</p>
              <h1 className="mb-4 font-display text-3xl text-sand-100 md:text-4xl">Your gift for {ready.recipient} is ready</h1>
              <p className="mb-6 font-body text-base text-sand-400">
                Send them the link below, or print the certificate and write the link inside a card. It works once, never expires, and we have
                emailed it to you too.
              </p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ready.certificate}
                alt={`Gift certificate: ${ready.recipient}'s name in hieroglyphs`}
                width={1200}
                height={630}
                className="mx-auto w-full border border-gold-600/40"
              />
              <CopyGiftLink link={ready.link} certificate={ready.certificate} recipient={ready.recipient} />
            </>
          ) : (
            <>
              <h1 className="mb-4 font-display text-3xl text-sand-100">We&apos;re getting your gift ready</h1>
              <p className="font-body text-base text-sand-400">
                The payment may still be finishing. Refresh this page in a moment; the gift link is also on its way to your inbox. If it
                doesn&apos;t arrive, <Link href="/contact" className="text-gold-400 underline underline-offset-2">contact us</Link>.
              </p>
            </>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}

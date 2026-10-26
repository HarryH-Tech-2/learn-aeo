import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getStripe } from "@/lib/stripe";
import { certificateImagePath, giftFromSession } from "@/lib/gift-course";
import { verifyGiftCode } from "@/lib/gift-code";
import RedeemGift from "./RedeemGift";

export const metadata: Metadata = { title: "Open Your Gift | Learn Hieroglyphics", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

/** Where a gift link lands: the certificate, then sign in and open it (src/app/api/gift/redeem). */
export default async function RedeemGiftPage({ searchParams }: { searchParams: Promise<{ code?: string }> }) {
  const { code } = await searchParams;
  const sessionId = verifyGiftCode(code);
  let gift: { recipient: string; from: string } | null = null;
  if (sessionId) {
    try {
      const session = await getStripe().checkout.sessions.retrieve(sessionId);
      if (session.payment_status === "paid") gift = giftFromSession(session);
    } catch (err) {
      console.error("[gift:redeem-page] session lookup failed:", err);
    }
  }

  return (
    <main className="grain-overlay">
      <Navbar />
      <div className="min-h-screen pt-24 pb-20 md:pt-32">
        <div className="mx-auto max-w-3xl px-6 text-center lg:px-8">
          {gift && code ? (
            <>
              <p className="mb-3 font-body text-xs uppercase tracking-[0.25em] text-gold-500">
                A gift{gift.from ? ` from ${gift.from}` : ""}
              </p>
              <h1 className="mb-4 font-display text-3xl text-sand-100 md:text-4xl">{gift.recipient}, you&apos;ve been given the hieroglyphics course</h1>
              <p className="mb-6 font-body text-base text-sand-400">
                Lifetime access to learn to read Egyptian hieroglyphs: every lesson, the 3D games and every chamber added later. This is your
                name, written the way a scribe would have carved it.
              </p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={certificateImagePath(gift.recipient, new Date(), gift.from)}
                alt={`${gift.recipient}'s name in hieroglyphs`}
                width={1200}
                height={630}
                className="mx-auto w-full border border-gold-600/40"
              />
              <RedeemGift code={code} />
            </>
          ) : (
            <>
              <h1 className="mb-4 font-display text-3xl text-sand-100">This gift link doesn&apos;t look right</h1>
              <p className="font-body text-base text-sand-400">
                Check the link was copied in full. If it still doesn&apos;t open, ask the person who gave it to forward the email, or contact
                us and we&apos;ll sort it out.
              </p>
            </>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}

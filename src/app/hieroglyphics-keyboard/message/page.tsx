import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SITE_ORIGIN } from "@/lib/share";
import { keyboardImagePath, readCardParams } from "@/lib/keyboard-card";
import MessageDecoder from "./MessageDecoder";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? null;

/**
 * The secret message: /hieroglyphics-keyboard/message?m=<base64url>&s=<finish>, made by "Send as a secret
 * message" on the keyboard. Noindex: every message is its own URL. The link preview is the card itself
 * (no letters on it), so the message arrives as a picture to be read.
 */
export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const q = await searchParams;
  const card = readCardParams((k) => one(q[k]));
  const image =
    card.typed.length > 0 ? `${SITE_ORIGIN}${keyboardImagePath({ typed: card.typed, style: card.style, spell: card.spell })}` : `${SITE_ORIGIN}/og-homepage.jpg`;
  const title = card.spell === "name" ? "Someone sent you a name in hieroglyphs" : "Someone sent you a secret message in hieroglyphs";
  const description = "Can you read it? Use the sign key to decode it, then write one back.";
  return {
    title: `${title} | Learn Hieroglyphics`,
    description,
    robots: { index: false, follow: true },
    alternates: { canonical: `${SITE_ORIGIN}/hieroglyphics-keyboard` },
    openGraph: { title, description, images: [{ url: image, width: 1200, height: 630 }], type: "website" },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default async function MessagePage({ searchParams }: Props) {
  const q = await searchParams;
  const card = readCardParams((k) => one(q[k]));
  return (
    <main className="min-h-screen bg-obsidian">
      <Navbar />
      <section className="px-4 pb-20 pt-24 sm:px-6 md:pt-32">
        <div className="mx-auto max-w-4xl">
          <MessageDecoder typed={card.typed} style={card.style} spell={card.spell} />
        </div>
      </section>
      <Footer />
    </main>
  );
}

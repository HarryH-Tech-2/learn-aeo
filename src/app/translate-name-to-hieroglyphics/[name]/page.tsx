import type { Metadata } from "next";
import { redirect } from "next/navigation";
import TranslateContent from "../TranslateContent";
import {
  SITE_ORIGIN,
  TRANSLATOR_PATH,
  cartoucheImageUrl,
  cartoucheShareUrl,
  normaliseShareName,
} from "@/lib/share";
import { getTransliteration } from "@/lib/hieroglyph-translator";

/**
 * Shareable cartouche page: /translate-name-to-hieroglyphics/Cleopatra
 *
 * Renders the translator with the name already written, so a shared link
 * shows the cartouche immediately and carries a preview image. Deliberately
 * noindex with a canonical back to the translator: there are infinitely many
 * names and none of them should compete with the tool page in search.
 */

type Params = { params: Promise<{ name: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { name: raw } = await params;
  const name = normaliseShareName(raw);
  if (!name) {
    return { title: "Name Translator | Learn Hieroglyphics", robots: { index: false, follow: true } };
  }
  const title = `${name} in Egyptian Hieroglyphics`;
  const description = `See the name ${name} written in ancient Egyptian hieroglyphs inside a royal cartouche (${getTransliteration(
    name
  )}), with the sound of each sign explained. Write your own name for free.`;
  const image = cartoucheImageUrl(name);
  return {
    title: `${title} | Learn Hieroglyphics`,
    description,
    robots: { index: false, follow: true },
    alternates: { canonical: `${SITE_ORIGIN}${TRANSLATOR_PATH}` },
    openGraph: {
      title,
      description,
      url: cartoucheShareUrl(name),
      siteName: "Learn Hieroglyphics",
      type: "website",
      images: [{ url: image, width: 1200, height: 630, alt: `The name ${name} written in hieroglyphs inside a cartouche` }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function SharedCartouchePage({ params }: Params) {
  const { name: raw } = await params;
  const name = normaliseShareName(raw);
  if (!name) redirect(TRANSLATOR_PATH);
  return <TranslateContent initialName={name} />;
}

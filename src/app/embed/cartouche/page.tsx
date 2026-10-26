import type { Metadata } from "next";
import { Suspense } from "react";
import EmbedContent from "./EmbedContent";

/**
 * Embeddable name translator, meant to be iframed on other sites:
 *   <iframe src="https://www.learnhieroglyphics.com/embed/cartouche">
 * vercel.json lifts the SAMEORIGIN frame restriction for /embed/ only.
 * Noindex: the canonical tool is /translate-name-to-hieroglyphics.
 */
export const metadata: Metadata = {
  title: "Hieroglyphic Name Translator (embed) | Learn Hieroglyphics",
  robots: { index: false, follow: true },
  alternates: { canonical: "https://www.learnhieroglyphics.com/translate-name-to-hieroglyphics" },
};

export default function EmbedCartouchePage() {
  return (
    <Suspense fallback={null}>
      <EmbedContent />
    </Suspense>
  );
}

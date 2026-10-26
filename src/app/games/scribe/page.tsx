import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkSubscription } from "@/lib/subscription";
import { devBypassAuth } from "@/lib/dev-bypass";
import ScribeContent from "./ScribeContent";

export const dynamic = "force-dynamic";

const URL = "https://www.learnhieroglyphics.com/games/scribe";

export const metadata: Metadata = {
  title: "Scribe's Hand: draw hieroglyphs from memory | Learn Hieroglyphics",
  description:
    "A hieroglyph appears for three seconds, then you draw it from memory with your finger. Your line is laid over the true form with a match percentage. The 25 alphabet signs are free; every sign in the course for members.",
  alternates: { canonical: URL },
};

export default async function ScribePage() {
  let paid = false;
  if (devBypassAuth()) paid = true;
  else {
    const session = await getServerSession(authOptions);
    if (session?.user?.email) paid = (await checkSubscription(session.user.email)).active;
  }
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Scribe's Hand",
    url: URL,
    applicationCategory: "EducationalApplication",
    operatingSystem: "Any",
    isAccessibleForFree: true,
    description: "Draw Egyptian hieroglyphs from memory on a touch screen and compare your line with the true form.",
    provider: { "@type": "Organization", name: "Learn Hieroglyphics", url: "https://www.learnhieroglyphics.com" },
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ScribeContent paid={paid} />
    </>
  );
}

import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkSubscription } from "@/lib/subscription";
import { devBypassAuth } from "@/lib/dev-bypass";
import { STELA_OBJECTS, playableObjects } from "@/lib/stela";
import StelaContent from "./StelaContent";

export const dynamic = "force-dynamic";

const URL = "https://www.learnhieroglyphics.com/games/stela";

export const metadata: Metadata = {
  title: "Stela Reader: read real Egyptian inscriptions | Learn Hieroglyphics",
  description:
    "Zoom into museum photographs of real stelae and reliefs and tap the hieroglyphs in reading order: royal names, the offering formula, a regnal-year date. Met Open Access objects, first one free, plus a museum mode for standing in front of the case.",
  alternates: { canonical: URL },
};

async function hasAccess(): Promise<boolean> {
  if (devBypassAuth()) return true;
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return false;
  return (await checkSubscription(session.user.email)).active;
}

export default async function StelaPage() {
  const paid = await hasAccess();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Stela Reader",
    url: URL,
    applicationCategory: "EducationalApplication",
    operatingSystem: "Any",
    isAccessibleForFree: true,
    description: "Read hieroglyphic phrases on photographs of real museum objects by tapping the signs in reading order.",
    offers: [
      { "@type": "Offer", price: "0", priceCurrency: "USD", description: `First object free (${playableObjects().find((o) => o.free)?.title})` },
      { "@type": "Offer", price: "19.99", priceCurrency: "USD", description: `All ${playableObjects().length} objects with lifetime access` },
    ],
    provider: { "@type": "Organization", name: "Learn Hieroglyphics", url: "https://www.learnhieroglyphics.com" },
    about: STELA_OBJECTS.filter((o) => o.image).map((o) => ({ "@type": "CreativeWork", name: o.title, url: o.objectUrl })),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <StelaContent paid={paid} />
    </>
  );
}

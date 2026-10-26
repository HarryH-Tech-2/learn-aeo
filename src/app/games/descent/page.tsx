import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkSubscription } from "@/lib/subscription";
import { devBypassAuth } from "@/lib/dev-bypass";
import DescentContent from "./DescentContent";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Scribe's Descent: 3D hieroglyph platformer | Learn Hieroglyphics",
  description:
    "Descend a tomb shaft on floating stone blocks. A voice names a sound; only the blocks carrying that hieroglyph hold your weight, the rest crumble. Reach the sarcophagus. Included with lifetime access.",
  alternates: { canonical: "https://www.learnhieroglyphics.com/games/descent" },
};

async function hasAccess(): Promise<boolean> {
  if (devBypassAuth()) return true;
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return false;
  return (await checkSubscription(session.user.email)).active;
}

export default async function DescentPage() {
  const unlocked = await hasAccess();
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "VideoGame",
            name: "Scribe's Descent",
            url: "https://www.learnhieroglyphics.com/games/descent",
            description: "A side-view 3D platformer down a tomb shaft: land only on the blocks carrying the hieroglyph the voice names.",
            applicationCategory: "EducationalApplication",
            gamePlatform: "Web browser",
            operatingSystem: "Any",
            isAccessibleForFree: false,
            offers: { "@type": "Offer", price: "19.99", priceCurrency: "USD" },
            provider: { "@type": "Organization", name: "Learn Hieroglyphics", url: "https://www.learnhieroglyphics.com" },
          }),
        }}
      />
      <DescentContent locked={!unlocked} paid={unlocked} />
    </>
  );
}

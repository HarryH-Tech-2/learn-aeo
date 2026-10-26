import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkSubscription } from "@/lib/subscription";
import { devBypassAuth } from "@/lib/dev-bypass";
import TombWallContent from "./TombWallContent";

// Access depends on the signed-in user's purchase, so never prerender.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tomb Wall Decode: 3D Hieroglyph Reading Game | Learn Hieroglyphics",
  description:
    "Read a torch-lit tomb inscription: tap the hieroglyphs in reading order (signs face the start of the line), then find the silent determinative. Learn how real Egyptian words are built. Included with lifetime access.",
  alternates: {
    canonical: "https://www.learnhieroglyphics.com/games/tomb-wall",
  },
};

/** Members-only: the game is part of the paid course, like the sealed lessons. */
async function hasAccess(): Promise<boolean> {
  if (devBypassAuth()) return true; // local preview only
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return false;
  const sub = await checkSubscription(session.user.email);
  return sub.active;
}

export default async function TombWallPage() {
  const unlocked = await hasAccess();
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "VideoGame",
            name: "Tomb Wall Decode",
            url: "https://www.learnhieroglyphics.com/games/tomb-wall",
            description:
              "Read carved hieroglyphic words on a torch-lit tomb wall: tap the signs in reading order, then identify the determinative. A learning game for reading direction and word structure, included with Learn Hieroglyphics lifetime access.",
            applicationCategory: "EducationalApplication",
            gamePlatform: "Web browser",
            operatingSystem: "Any",
            isAccessibleForFree: false,
            offers: { "@type": "Offer", price: "19.99", priceCurrency: "USD" },
            provider: {
              "@type": "Organization",
              name: "Learn Hieroglyphics",
              url: "https://www.learnhieroglyphics.com",
            },
          }),
        }}
      />
      <TombWallContent locked={!unlocked} />
    </>
  );
}

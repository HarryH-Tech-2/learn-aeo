import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkSubscription } from "@/lib/subscription";
import { devBypassAuth } from "@/lib/dev-bypass";
import SignHuntContent from "./SignHuntContent";

// Access depends on the signed-in user's purchase, so never prerender.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign Hunt: 3D Hieroglyph Game | Learn Hieroglyphics",
  description:
    "A 3D object appears (owl, reed, loaf, viper) and you pick the hieroglyph that depicts it. Learn the pictographic origin of the Egyptian alphabet signs in a fast 10-round game. Included with lifetime access.",
  alternates: {
    canonical: "https://www.learnhieroglyphics.com/games/sign-hunt",
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

export default async function SignHuntPage() {
  const unlocked = await hasAccess();
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "VideoGame",
            name: "Sign Hunt",
            url: "https://www.learnhieroglyphics.com/games/sign-hunt",
            description:
              "Match 3D objects to the Egyptian hieroglyphs that depict them. A learning game for the uniliteral signs, included with Learn Hieroglyphics lifetime access.",
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
      <SignHuntContent locked={!unlocked} />
    </>
  );
}

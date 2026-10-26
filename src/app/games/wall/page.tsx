import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkSubscription } from "@/lib/subscription";
import { devBypassAuth } from "@/lib/dev-bypass";
import WallContent from "./WallContent";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Fading Paint: spaced repetition on your own tomb wall | Learn Hieroglyphics",
  description:
    "Every hieroglyph you have learned is painted on your personal tomb wall. Paint fades on a spaced-repetition schedule; tap a weathered sign, answer one question, and it is painted fresh. No flashcards.",
  alternates: { canonical: "https://www.learnhieroglyphics.com/games/wall" },
  robots: { index: false, follow: true },
};

export default async function WallPage() {
  if (devBypassAuth()) return <WallContent signedIn paid />;
  const session = await getServerSession(authOptions);
  const email = session?.user?.email ?? null;
  const paid = email ? (await checkSubscription(email)).active : false;
  return <WallContent signedIn={!!session?.user} paid={paid} />;
}

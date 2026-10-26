import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { devBypassAuth } from "@/lib/dev-bypass";
import { classroomAccessFor, type ClassroomAccess } from "@/lib/licence";
import { PLANS, formatPlanPrice } from "@/lib/plans";
import { COUNTRY_COOKIE, currencyForCountry } from "@/lib/pricing";
import ClassHost from "./ClassHost";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Classroom mode: live hieroglyph quiz with room codes | Learn Hieroglyphics",
  description:
    "Put the room code on the projector; pupils join from their phones with a team name, no accounts. Ten KS2-friendly questions on the hieroglyphic alphabet and royal cartouches, a countdown and a team leaderboard.",
  alternates: { canonical: "https://www.learnhieroglyphics.com/teachers/class" },
  robots: { index: true, follow: true },
};

export default async function ClassPage() {
  const bypass = devBypassAuth();
  const session = bypass ? null : await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  const signedIn = bypass || !!session?.user;
  const access: ClassroomAccess = bypass
    ? { licensed: true, trialAvailable: false, trial: null }
    : userId
      ? await classroomAccessFor(userId)
      : { licensed: false, trialAvailable: true, trial: null };
  const currency = currencyForCountry((await cookies()).get(COUNTRY_COOKIE)?.value);
  return <ClassHost signedIn={signedIn} access={access} price={formatPlanPrice(PLANS.classroom, currency)} />;
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getActiveOffer } from "@/lib/offers";

/** The signed-in user's live discount offer, if any. */
export async function GET() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) return NextResponse.json({ offer: null });
  const offer = await getActiveOffer(email);
  return NextResponse.json({
    offer: offer
      ? { code: offer.code, expiresAt: offer.expiresAt.toISOString(), percentOff: offer.percentOff, source: offer.source }
      : null,
  });
}

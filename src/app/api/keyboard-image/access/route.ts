import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkSubscription, hasPaidAccess } from "@/lib/subscription";

export const dynamic = "force-dynamic";

/** GET /api/keyboard-image/access → { member }: does the keyboard offer the HD picture as included? */
export async function GET() {
  const email = (await getServerSession(authOptions))?.user?.email;
  if (!email) return NextResponse.json({ member: false });
  const access = await checkSubscription(email);
  return NextResponse.json({ member: hasPaidAccess(access) });
}

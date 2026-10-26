import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { checkSubscription } from "@/lib/subscription";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ active: false });
  }

  const sub = await checkSubscription(session.user.email);
  return NextResponse.json(sub);
}

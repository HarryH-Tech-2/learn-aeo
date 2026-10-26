import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";

/**
 * POST /api/stripe/create-portal-session → { url }
 * Billing portal for the user's Stripe customer: their own purchase /
 * Expedition Pass.
 */
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "You must be signed in." }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      subscription: { select: { stripeCustomerId: true } },
    },
  });

  const customerId = user?.subscription?.stripeCustomerId ?? null;
  if (!customerId) {
    return NextResponse.json({ error: "No subscription found." }, { status: 404 });
  }

  let returnTo = "/account";
  try {
    const body = (await request.json()) as { returnTo?: unknown };
    if (typeof body.returnTo === "string" && body.returnTo.startsWith("/")) returnTo = body.returnTo;
  } catch {
    /* no body */
  }

  const portalSession = await getStripe().billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXTAUTH_URL}${returnTo}`,
  });

  return NextResponse.json({ url: portalSession.url });
}

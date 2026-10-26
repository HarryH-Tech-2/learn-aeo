import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getStripe } from "@/lib/stripe";

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  const { name } = await request.json();

  await prisma.user.update({
    where: { id: user.id },
    data: { name },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  // Cancel Stripe subscription if one exists
  const subscription = await prisma.subscription.findFirst({
    where: { userId: user.id },
    select: { stripeCustomerId: true },
  });

  if (subscription?.stripeCustomerId) {
    try {
      const stripeCustomer = await getStripe().customers.retrieve(
        subscription.stripeCustomerId,
        { expand: ["subscriptions"] }
      );
      if ("subscriptions" in stripeCustomer && stripeCustomer.subscriptions?.data) {
        for (const sub of stripeCustomer.subscriptions.data) {
          if (sub.status !== "canceled") {
            await getStripe().subscriptions.cancel(sub.id);
          }
        }
      }
    } catch (err) {
      console.error("[account:delete] Failed to cancel Stripe subscription:", err);
    }
  }

  // Cascade delete handles subscription, progress, streak, sessions, accounts
  await prisma.user.delete({ where: { id: user.id } });

  return NextResponse.json({ ok: true });
}

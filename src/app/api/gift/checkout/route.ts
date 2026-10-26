import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createCheckoutSession, getStripe } from "@/lib/stripe";
import { COUNTRY_COOKIE, currencyForCountry, type Currency } from "@/lib/pricing";
import { GA_SESSION_COOKIE, gaClientIdFromCookie, gaSessionIdFromCookie } from "@/lib/ga-server";
import { GIFT_COURSE, GIFT_PATH, GIFT_THANKS_PATH, cleanGiftName } from "@/lib/gift-course";

export const dynamic = "force-dynamic";

/**
 * POST /api/gift/checkout  { recipient, from }  → { url }
 *
 * Lifetime access as a gift, no account needed to buy it. An inline price at the Lifetime amount; the names travel
 * in the metadata, so the webhook's email, the thank-you page and the gift link all rebuild the same certificate.
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const recipient = cleanGiftName(body?.recipient);
  const from = cleanGiftName(body?.from);
  if (!recipient) return NextResponse.json({ error: "Type the name of the person the gift is for." }, { status: 400 });

  try {
    const stripe = getStripe();
    const country = request.cookies.get(COUNTRY_COOKIE)?.value ?? request.headers.get("x-vercel-ip-country");
    const currency: Currency = currencyForCountry(country);

    let email: string | undefined;
    try {
      email = (await getServerSession(authOptions))?.user?.email ?? undefined;
    } catch {
      email = undefined;
    }

    const base = process.env.NEXTAUTH_URL;
    const checkout = await createCheckoutSession(stripe, {
      mode: "payment",
      ...(email ? { customer_email: email } : {}),
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: currency.toLowerCase(),
            unit_amount: Math.round((currency === "GBP" ? GIFT_COURSE.gbp : GIFT_COURSE.usd) * 100),
            product_data: { name: `${GIFT_COURSE.name} for ${recipient}`, description: GIFT_COURSE.description },
          },
        },
      ],
      metadata: {
        product: GIFT_COURSE.id,
        recipient,
        from,
        ga_client_id: gaClientIdFromCookie(request.cookies.get("_ga")?.value),
        ga_session_id: gaSessionIdFromCookie(request.cookies.get(GA_SESSION_COOKIE)?.value),
      },
      payment_intent_data: { description: `${GIFT_COURSE.name} for ${recipient}${from ? `, from ${from}` : ""}` },
      success_url: `${base}${GIFT_THANKS_PATH}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}${GIFT_PATH}?${new URLSearchParams({ to: recipient, ...(from ? { from } : {}), cancelled: "1" }).toString()}`,
    });
    return NextResponse.json({ url: checkout.url });
  } catch (error) {
    console.error("[gift:checkout] failed:", error);
    return NextResponse.json({ error: "Could not start the checkout." }, { status: 500 });
  }
}

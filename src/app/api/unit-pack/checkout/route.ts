import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createCheckoutSession, getStripe } from "@/lib/stripe";
import { COUNTRY_COOKIE, currencyForCountry, type Currency } from "@/lib/pricing";
import { GA_SESSION_COOKIE, gaClientIdFromCookie, gaSessionIdFromCookie } from "@/lib/ga-server";
import { isPaper, isUnitPackFrom, paperForCountry, unitPackCheckoutParams } from "@/lib/unit-pack/product";

export const dynamic = "force-dynamic";

/**
 * POST /api/unit-pack/checkout  { from?: "teachers" | "worksheet" | "unit-pack", paper?: "a4" | "letter" }  → { url }
 *
 * The Ancient Egypt Writing Unit, no account needed: an inline price ($19 / £15 by the visitor's country, as
 * the keyboard's HD picture), the paper size in the metadata (Letter for the US and Canada unless chosen),
 * and the webhook emails the PDF. The thank-you page rebuilds it from the session id.
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const from = isUnitPackFrom(body?.from) ? body.from : "unit-pack";

  try {
    const stripe = getStripe();
    const country = request.cookies.get(COUNTRY_COOKIE)?.value ?? request.headers.get("x-vercel-ip-country");
    const currency: Currency = currencyForCountry(country);
    const paper = isPaper(body?.paper) ? body.paper : paperForCountry(country);

    let email: string | undefined;
    try {
      email = (await getServerSession(authOptions))?.user?.email ?? undefined;
    } catch {
      email = undefined;
    }

    const params = unitPackCheckoutParams({
      currency,
      paper,
      from,
      gaClientId: gaClientIdFromCookie(request.cookies.get("_ga")?.value),
      gaSessionId: gaSessionIdFromCookie(request.cookies.get(GA_SESSION_COOKIE)?.value),
      base: process.env.NEXTAUTH_URL ?? request.nextUrl.origin,
    });
    const checkout = await createCheckoutSession(stripe, { ...params, ...(email ? { customer_email: email } : {}) });
    return NextResponse.json({ url: checkout.url });
  } catch (error) {
    console.error("[unit-pack:checkout] failed:", error);
    return NextResponse.json({ error: "Could not start the checkout." }, { status: 500 });
  }
}

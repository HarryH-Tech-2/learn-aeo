import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createCheckoutSession, getStripe } from "@/lib/stripe";
import { COUNTRY_COOKIE, currencyForCountry, type Currency } from "@/lib/pricing";
import { GA_SESSION_COOKIE, gaClientIdFromCookie, gaSessionIdFromCookie } from "@/lib/ga-server";
import { DEFAULT_CLASS_SET_THEME, classSetCheckoutParams, isClassSetTheme, parseClassList } from "@/lib/class-set";

export const dynamic = "force-dynamic";

/** Where a checkout may come from, for the owner's email and GA4. */
const FROM = ["class-set", "class-strip", "teachers", "worksheet", "class"];

/**
 * POST /api/class-set/checkout  { names: string (the pasted list), theme?: "cream" | "papyrus" | "temple", from?: string }
 * → { url }, or 400 when no name in the list gives any signs.
 *
 * The Class Cartouche Set, no account needed: an inline price ($9.99 / £7.99 by the visitor's country), the names
 * and paper in the metadata, and the webhook emails the PDF. The thank-you page rebuilds it from the session id.
 * The list is parsed again here, so the client's parse is only for showing the teacher what will print.
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { names } = parseClassList(typeof body?.names === "string" ? body.names : "");
  if (names.length === 0) return NextResponse.json({ error: "Add at least one name." }, { status: 400 });
  const theme = isClassSetTheme(body?.theme) ? body.theme : DEFAULT_CLASS_SET_THEME;
  const from = typeof body?.from === "string" && FROM.includes(body.from) ? body.from : "class-set";

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

    const params = classSetCheckoutParams({
      currency,
      names,
      theme,
      from,
      gaClientId: gaClientIdFromCookie(request.cookies.get("_ga")?.value),
      gaSessionId: gaSessionIdFromCookie(request.cookies.get(GA_SESSION_COOKIE)?.value),
      base: (process.env.NEXTAUTH_URL ?? request.nextUrl.origin).replace(/\/+$/, ""),
    });
    const checkout = await createCheckoutSession(stripe, { ...params, ...(email ? { customer_email: email } : {}) });
    return NextResponse.json({ url: checkout.url });
  } catch (error) {
    console.error("[class-set:checkout] failed:", error);
    return NextResponse.json({ error: "Could not start the checkout." }, { status: 500 });
  }
}

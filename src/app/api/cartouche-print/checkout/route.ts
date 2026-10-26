import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import type Stripe from "stripe";
import { authOptions } from "@/lib/auth";
import { createCheckoutSession, getStripe } from "@/lib/stripe";
import { COUNTRY_COOKIE, currencyForCountry, type Currency } from "@/lib/pricing";
import { CARTOUCHE_FAMILY, CARTOUCHE_PRINT, CARTOUCHE_PRINT_PATH, CARTOUCHE_PRINT_SHIP_TO, DEFAULT_CARTOUCHE_PRINT_FORMAT, DEFAULT_CARTOUCHE_PRINT_THEME, cartoucheFamilySurcharge, cartouchePrintFormatById, cartouchePrintOrderMinor, cartouchePrintThemeById, cleanCartoucheNames, encodeCartoucheNames, isCartouchePrintFormat, isCartouchePrintTheme, joinCartoucheNames } from "@/lib/cartouche-print";
import { cartoucheSharePath, normaliseShareName } from "@/lib/share";
import { transliterateName } from "@/lib/hieroglyph-translator";
import { cleanKeys, encodeMessage } from "@/lib/keyboard-card";
import { GA_SESSION_COOKIE, gaClientIdFromCookie, gaSessionIdFromCookie } from "@/lib/ga-server";

export const dynamic = "force-dynamic";

/**
 * POST /api/cartouche-print/checkout  { name, theme?, format? }  → { url }
 *
 * Starts a Stripe Checkout for one Cartouche Print. No account needed:
 * Stripe collects the email, the webhook emails the PDF, and the success
 * page offers it for download against the session id. The name travels in
 * metadata so both can rebuild the exact same PDF.
 */
export async function POST(request: NextRequest) {
  let body: { name?: unknown; names?: unknown; theme?: unknown; format?: unknown; from?: unknown } = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }
  const name = normaliseShareName(typeof body.name === "string" ? body.name : null);
  if (!name || transliterateName(name).length === 0) {
    return NextResponse.json({ error: "Please write a name with at least one letter." }, { status: 400 });
  }
  // A family print: `names` is every name on the page, the first being `name`. A name the
  // buyer typed that cannot be written is refused rather than silently left off the print.
  const extra = Array.isArray(body.names) ? body.names.filter((n): n is string => typeof n === "string" && n.trim() !== "") : [];
  for (const n of extra) {
    const clean = normaliseShareName(n);
    if (!clean || transliterateName(clean).length === 0) {
      return NextResponse.json({ error: `"${n.trim().slice(0, 30)}" cannot be written in hieroglyphs. Please check the names.` }, { status: 400 });
    }
  }
  if (extra.length > CARTOUCHE_FAMILY.maxNames) {
    return NextResponse.json({ error: `A family print takes up to ${CARTOUCHE_FAMILY.maxNames} names.` }, { status: 400 });
  }
  const names = cleanCartoucheNames([name, ...extra]);
  const family = names.length > 1;
  // The paper: an unknown value never blocks a sale, it just prints on cream.
  const theme = isCartouchePrintTheme(body.theme) ? body.theme : DEFAULT_CARTOUCHE_PRINT_THEME;
  // What they get: the PDF, the HD image, or a posted print. Unknown values fall to the default rather than failing.
  const formatId = isCartouchePrintFormat(body.format) ? body.format : DEFAULT_CARTOUCHE_PRINT_FORMAT;
  const format = cartouchePrintFormatById(formatId);

  try {
    const stripe = getStripe();
    const country = request.cookies.get(COUNTRY_COOKIE)?.value ?? request.headers.get("x-vercel-ip-country");
    const currency: Currency = currencyForCountry(country);

    // The catalogue Price if it is configured (USD with a GBP option, see
    // scripts/stripe-create-plans.mjs); an inline price otherwise, so a fresh
    // environment can still sell one.
    //
    // A posted or framed family print costs a little more (CARTOUCHE_FAMILY): it is
    // always one inline price for the whole thing, in the visitor's currency, so it
    // never has to be mixed with a catalogue Price that may lack a GBP option.
    const surcharge = cartoucheFamilySurcharge(currency, formatId, names.length);
    const priceId = surcharge > 0 ? undefined : process.env[format.envKey];
    const lineItem: Stripe.Checkout.SessionCreateParams.LineItem = priceId
      ? { price: priceId, quantity: 1 }
      : {
          quantity: 1,
          price_data: {
            currency: currency.toLowerCase(),
            unit_amount: cartouchePrintOrderMinor(currency, formatId, names.length),
            product_data: {
              name: family ? `${CARTOUCHE_PRINT.name} · ${format.label} · family print, ${names.length} names` : `${CARTOUCHE_PRINT.name} · ${format.label}`,
              // The HD image is page one only, not the three-page PDF the shared description promises.
              description: format.file === "jpeg" ? format.blurb : CARTOUCHE_PRINT.description,
            },
          },
        };
    // With a catalogue Price the session itself has to ask for pounds.
    const sessionCurrency = priceId && currency === "GBP" ? "gbp" : undefined;
    const namesMeta = encodeCartoucheNames(names);

    // A signed-in visitor need not type their email again.
    let email: string | undefined;
    try {
      const session = await getServerSession(authOptions);
      email = session?.user?.email ?? undefined;
    } catch {
      email = undefined;
    }

    const base = process.env.NEXTAUTH_URL;
    const checkout = await createCheckoutSession(stripe, {
      mode: "payment",
      ...(email ? { customer_email: email } : {}),
      line_items: [lineItem],
      billing_address_collection: "auto",
      // A posted print needs somewhere to go; the countries are the ones the price covers.
      ...(format.physical ? { shipping_address_collection: { allowed_countries: [...CARTOUCHE_PRINT_SHIP_TO] } } : {}),
      metadata: {
        product: CARTOUCHE_PRINT.id,
        // The first name, as every order has always carried; a family adds the whole list.
        name,
        ...(namesMeta ? { names: namesMeta } : {}),
        theme,
        format: formatId,
        ga_client_id: gaClientIdFromCookie(request.cookies.get("_ga")?.value),
        ga_session_id: gaSessionIdFromCookie(request.cookies.get(GA_SESSION_COOKIE)?.value),
      },
      payment_intent_data: { description: `${CARTOUCHE_PRINT.name} · ${format.label} (${cartouchePrintThemeById(theme).label}): ${family ? joinCartoucheNames(names) : name}` },
      success_url: `${base}${CARTOUCHE_PRINT_PATH}?session_id={CHECKOUT_SESSION_ID}`,
      // Back to where they were: the keyboard offers the print too.
      cancel_url: body.from === "keyboard" ? `${base}/hieroglyphics-keyboard?m=${encodeMessage(cleanKeys(name))}&keep=print` : `${base}${cartoucheSharePath(name)}?print=cancelled`,
    }, sessionCurrency);
    return NextResponse.json({ url: checkout.url });
  } catch (error) {
    console.error("[cartouche-print:checkout] failed:", error);
    return NextResponse.json({ error: "Could not start the checkout." }, { status: 500 });
  }
}

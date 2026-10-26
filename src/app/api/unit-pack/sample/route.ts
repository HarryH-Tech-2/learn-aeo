import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isValidEmail, normaliseEmail, recordLead } from "@/lib/leads";
import { notifyOwner } from "@/lib/notify";
import { allowSend, clientIp } from "@/lib/send-limit";
import { COUNTRY_COOKIE, currencyForCountry } from "@/lib/pricing";
import { buildUnitPackPdf } from "@/lib/unit-pack/pdf";
import { isPaper, paperForCountry, unitPackFilename, unitPackPrice } from "@/lib/unit-pack/product";
import { sendUnitPackSampleEmail } from "@/lib/unit-pack/email";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 30;

function country(request: NextRequest) {
  return request.cookies.get(COUNTRY_COOKIE)?.value ?? request.headers.get("x-vercel-ip-country");
}

/**
 * The free sample of the Ancient Egypt Writing Unit: Lesson 1 complete, cover to answers.
 *   GET  /api/unit-pack/sample?paper=a4|letter       the PDF, no email needed (the lead magnet is the lesson itself)
 *   POST /api/unit-pack/sample  { email, paper? }    the same PDF by email; the address is kept (lead "unit-pack-sample")
 */
export async function GET(request: NextRequest) {
  const asked = request.nextUrl.searchParams.get("paper");
  const paper = isPaper(asked) ? asked : paperForCountry(country(request));
  try {
    const pdf = await buildUnitPackPdf({ paper, sample: true });
    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        // inline: it opens in the browser's viewer, where the teacher can print or save it
        "Content-Disposition": `inline; filename="${unitPackFilename(paper, true)}"`,
        "Content-Length": String(pdf.byteLength),
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (err) {
    console.error("[unit-pack:sample] build failed:", err);
    return NextResponse.json({ error: "Could not build the PDF." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  if (!isValidEmail(body?.email)) return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
  const to = normaliseEmail(body.email);
  // Anyone can type any address here, so cap it: 6 an hour from one visitor, 3 a day to one inbox.
  if (!allowSend(`unit-sample:ip:${clientIp(request)}`, 6, 60 * 60 * 1000) || !allowSend(`unit-sample:to:${to}`, 3, 24 * 60 * 60 * 1000)) {
    return NextResponse.json({ error: "That's a few already. Please try again later." }, { status: 429 });
  }
  const c = country(request);
  const paper = isPaper(body?.paper) ? body.paper : paperForCountry(c);

  const known = await prisma.emailLead
    .findUnique({ where: { email_source: { email: to, source: "unit-pack-sample" } }, select: { id: true } })
    .catch(() => null);
  await recordLead({ email: to, source: "unit-pack-sample" });
  if (!known) {
    void notifyOwner({
      subject: `Unit pack sample lead: ${to}`,
      text: `${to} asked for the free Lesson 1 sample of the Ancient Egypt Writing Unit (${paper}, country ${c ?? "unknown"}). Probably a teacher.`,
      replyTo: to,
    });
  }

  try {
    const pdf = await buildUnitPackPdf({ paper, sample: true });
    await sendUnitPackSampleEmail(to, pdf, { paper, price: unitPackPrice(currencyForCountry(c)) });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[unit-pack:sample] email failed:", err);
    return NextResponse.json({ error: "Could not send the email" }, { status: 500 });
  }
}

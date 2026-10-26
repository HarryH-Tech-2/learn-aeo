import { NextRequest, NextResponse } from "next/server";
import { isLicenceKind } from "@/lib/licence";
import { buildLicenceQuotePdf } from "@/lib/licence-quote-pdf";
import { allowSend, clientIp } from "@/lib/send-limit";

/**
 * GET /api/licence/quote?plan=school&country=GB[&school=&contact=&line1=&line2=&city=&postcode=]
 * A one-page quotation PDF for a school office. Open to anyone (a quote commits nobody to anything), throttled.
 */
export async function GET(request: NextRequest) {
  if (!allowSend(`licence-quote:${clientIp(request)}`, 20, 3_600_000)) {
    return NextResponse.json({ error: "Too many quotes in a row. Please try again later." }, { status: 429 });
  }
  const q = request.nextUrl.searchParams;
  const plan = q.get("plan");
  if (!isLicenceKind(plan)) return NextResponse.json({ error: "plan must be classroom or school" }, { status: 400 });
  const country = (q.get("country") ?? request.cookies.get("lh_cc")?.value ?? "").toUpperCase().slice(0, 2);
  const text = (k: string, max: number) => (q.get(k) ?? "").replace(/\s+/g, " ").trim().slice(0, max);
  const cityLine = [text("city", 80), text("postcode", 20)].filter(Boolean).join(" ");

  const { bytes, reference } = await buildLicenceQuotePdf({
    plan,
    country,
    schoolName: text("school", 120),
    contactName: text("contact", 80),
    addressLines: [text("line1", 120), text("line2", 120), cityLine].filter(Boolean),
  });
  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="learn-hieroglyphics-${plan}-licence-quote-${reference}.pdf"`,
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex",
    },
  });
}

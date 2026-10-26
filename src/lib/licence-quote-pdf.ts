/**
 * A one-page A4 quotation for a Classroom or School licence, for a school office that needs a quote before it
 * raises a purchase order. Server only (GET /api/licence/quote).
 *
 * Standard PDF fonts only (Helvetica), so nothing has to be traced into the serverless bundle; they are WinAnsi,
 * so anything a school types is folded to plain Latin first (winAnsiSafe). Seller details come from
 * src/lib/business-details.ts and any placeholder still empty is left off, never invented.
 */
import { PDFDocument, PDFFont, PDFPage, StandardFonts, rgb } from "pdf-lib";
import { BUSINESS, sellerLines } from "@/lib/business-details";
import { INVOICE_DAYS_UNTIL_DUE, invoiceCurrency, licenceLineDescription } from "@/lib/licence-invoice";
import type { LicenceKind } from "@/lib/licence";
import { PLANS, formatPlanPrice } from "@/lib/plans";

export const QUOTE_VALID_DAYS = 30;
const A4 = { width: 595.28, height: 841.89 } as const;
const MARGIN = 56;
const GOLD = rgb(0.55, 0.42, 0.12);
const INK = rgb(0.12, 0.11, 0.1);
const MUTED = rgb(0.4, 0.38, 0.35);
const RULE = rgb(0.8, 0.74, 0.6);

export type QuoteInput = {
  plan: LicenceKind;
  country: string;
  schoolName?: string;
  contactName?: string;
  addressLines?: string[];
  now?: Date;
  reference?: string;
};

export function quoteReference(now = new Date(), rnd: () => number = Math.random): string {
  const d = now.toISOString().slice(0, 10).replace(/-/g, "");
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let tail = "";
  for (let i = 0; i < 4; i++) tail += alphabet[Math.floor(rnd() * alphabet.length)];
  return `Q-${d}-${tail}`;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

/** Fold accents away and replace anything Helvetica (WinAnsi) still cannot set, so a typed name never throws. */
export function winAnsiSafe(font: PDFFont, text: string): string {
  let out = "";
  for (const ch of text.normalize("NFKD").replace(/[̀-ͯ]/g, "")) {
    try {
      font.encodeText(ch);
      out += ch;
    } catch {
      out += "?";
    }
  }
  return out;
}

function wrap(font: PDFFont, text: string, size: number, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (font.widthOfTextAtSize(next, size) > maxWidth && line) {
      lines.push(line);
      line = w;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

export async function buildLicenceQuotePdf(input: QuoteInput): Promise<{ bytes: Uint8Array; reference: string }> {
  const now = input.now ?? new Date();
  const reference = input.reference ?? quoteReference(now);
  const plan = PLANS[input.plan];
  const currency = invoiceCurrency(input.country);
  const price = formatPlanPrice(plan, currency);
  const validUntil = new Date(now.getTime() + QUOTE_VALID_DAYS * 86_400_000);

  const doc = await PDFDocument.create();
  doc.setTitle(`Quotation ${reference}: ${plan.name} licence`);
  doc.setAuthor(BUSINESS.tradingName);
  doc.setCreationDate(now);
  const page: PDFPage = doc.addPage([A4.width, A4.height]);
  const body = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const s = (t: string, f: PDFFont = body) => winAnsiSafe(f, t);
  const draw = (t: string, x: number, y: number, size: number, f: PDFFont = body, color = INK) => page.drawText(s(t, f), { x, y, size, font: f, color });
  const drawRight = (t: string, xRight: number, y: number, size: number, f: PDFFont = body, color = INK) => {
    const safe = s(t, f);
    page.drawText(safe, { x: xRight - f.widthOfTextAtSize(safe, size), y, size, font: f, color });
  };
  const right = A4.width - MARGIN;
  const contentWidth = A4.width - MARGIN * 2;

  // Header: seller on the left, the quote's own details on the right.
  let y = A4.height - MARGIN - 6;
  draw(BUSINESS.tradingName, MARGIN, y, 20, bold, GOLD);
  drawRight("QUOTATION", right, y, 20, bold, INK);
  y -= 22;
  const seller = sellerLines().slice(1);
  let sy = y;
  for (const line of seller) {
    draw(line, MARGIN, sy, 9.5, body, MUTED);
    sy -= 13;
  }
  const meta: [string, string][] = [
    ["Quote no.", reference],
    ["Date", formatDate(now)],
    ["Valid until", formatDate(validUntil)],
    ["Currency", currency],
  ];
  let my = y;
  for (const [k, v] of meta) {
    drawRight(v, right, my, 9.5, bold);
    drawRight(k, right - 110, my, 9.5, body, MUTED);
    my -= 13;
  }
  y = Math.min(sy, my) - 18;
  page.drawLine({ start: { x: MARGIN, y }, end: { x: right, y }, thickness: 0.8, color: RULE });
  y -= 24;

  // Prepared for
  const forLines = [input.schoolName, input.contactName ? `For the attention of ${input.contactName}` : "", ...(input.addressLines ?? [])]
    .map((l) => (l ?? "").trim())
    .filter(Boolean);
  if (forLines.length) {
    draw("PREPARED FOR", MARGIN, y, 8.5, bold, GOLD);
    y -= 15;
    for (const [i, l] of forLines.entries()) {
      draw(l, MARGIN, y, i === 0 ? 11.5 : 10, i === 0 ? bold : body);
      y -= i === 0 ? 15 : 13;
    }
    y -= 14;
  }

  // The line item
  const colQty = right - 150;
  const colAmt = right;
  draw("DESCRIPTION", MARGIN, y, 8.5, bold, GOLD);
  drawRight("QTY", colQty, y, 8.5, bold, GOLD);
  drawRight("AMOUNT", colAmt, y, 8.5, bold, GOLD);
  y -= 8;
  page.drawLine({ start: { x: MARGIN, y }, end: { x: right, y }, thickness: 0.5, color: RULE });
  y -= 16;
  const descLines = wrap(body, s(licenceLineDescription(input.plan)), 10.5, colQty - MARGIN - 60);
  drawRight("1", colQty, y, 10.5);
  drawRight(price, colAmt, y, 10.5, bold);
  for (const l of descLines) {
    page.drawText(l, { x: MARGIN, y, size: 10.5, font: body, color: INK });
    y -= 14;
  }
  y -= 6;
  page.drawLine({ start: { x: MARGIN, y }, end: { x: right, y }, thickness: 0.5, color: RULE });
  y -= 20;
  drawRight(`Total ${price} ${currency}`, right, y, 13, bold);
  y -= 34;

  // What it includes
  draw("WHAT THE LICENCE INCLUDES", MARGIN, y, 8.5, bold, GOLD);
  y -= 16;
  for (const f of plan.features) {
    for (const [i, l] of wrap(body, s(f), 10, contentWidth - 14).entries()) {
      if (i === 0) draw("-", MARGIN, y, 10, body, MUTED);
      page.drawText(l, { x: MARGIN + 12, y, size: 10, font: body, color: INK });
      y -= 13.5;
    }
  }
  y -= 16;

  // Terms and how to order
  draw("TERMS AND HOW TO ORDER", MARGIN, y, 8.5, bold, GOLD);
  y -= 16;
  const terms = [
    `The licence runs for 12 months from the day payment is received. It does not renew by itself.`,
    `To order, raise a purchase order and request an invoice at ${BUSINESS.website}/teachers/licence ("Pay by invoice"), quoting this quote number and your PO number, or email ${BUSINESS.email}.`,
    `Invoices are payable within ${INVOICE_DAYS_UNTIL_DUE} days of issue by bank transfer or card, through the secure payment page linked from the invoice.`,
    `This quotation is valid for ${QUOTE_VALID_DAYS} days from the date above. Prices are in ${currency === "GBP" ? "pounds sterling" : "US dollars"}.`,
  ];
  for (const t of terms) {
    for (const l of wrap(body, s(t), 10, contentWidth)) {
      page.drawText(l, { x: MARGIN, y, size: 10, font: body, color: INK });
      y -= 13.5;
    }
    y -= 5;
  }

  // Footer
  const foot = `${BUSINESS.tradingName} · ${BUSINESS.email} · ${BUSINESS.website}`;
  const footSafe = s(foot);
  page.drawLine({ start: { x: MARGIN, y: MARGIN + 18 }, end: { x: right, y: MARGIN + 18 }, thickness: 0.5, color: RULE });
  page.drawText(footSafe, { x: (A4.width - body.widthOfTextAtSize(footSafe, 8.5)) / 2, y: MARGIN, size: 8.5, font: body, color: MUTED });

  return { bytes: await doc.save(), reference };
}

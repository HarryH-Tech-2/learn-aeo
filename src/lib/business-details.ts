/**
 * The seller details printed on licence quotes (src/lib/licence-quote-pdf.ts) and used in invoice footers.
 *
 * ┌─────────────────────────────────────────────────────────────────────────────────────────────┐
 * │ HARRY: FILL THESE IN. Schools' finance offices usually want the legal name and a postal     │
 * │ address of the business they are paying before they raise a purchase order. Until they are  │
 * │ filled in, those lines are simply left off the quote: nothing made up is ever printed.       │
 * └─────────────────────────────────────────────────────────────────────────────────────────────┘
 */
export const BUSINESS = {
  /** Trading name, always shown. */
  tradingName: "Learn Hieroglyphics",
  /** TODO(Harry): the legal name (e.g. your own name as a sole trader, or the registered company name). Empty = not printed. */
  legalName: "",
  /** TODO(Harry): postal address, one line per entry. Empty = not printed. */
  addressLines: [] as string[],
  /** TODO(Harry): company number, if a limited company. Empty = not printed. */
  companyNumber: "",
  /** TODO(Harry): VAT registration number, only if VAT-registered. Empty = not printed (and the quote says nothing about VAT). */
  vatNumber: "",
  email: "contact@learnhieroglyphics.com",
  website: "www.learnhieroglyphics.com",
};

/** The seller block as printable lines, skipping every placeholder still empty. */
export function sellerLines(b: typeof BUSINESS = BUSINESS): string[] {
  const lines: string[] = [b.tradingName];
  if (b.legalName.trim() && b.legalName.trim() !== b.tradingName) lines.push(b.legalName.trim());
  for (const l of b.addressLines) if (l.trim()) lines.push(l.trim());
  if (b.companyNumber.trim()) lines.push(`Company no. ${b.companyNumber.trim()}`);
  if (b.vatNumber.trim()) lines.push(`VAT no. ${b.vatNumber.trim()}`);
  lines.push(b.email, b.website);
  return lines;
}

import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/db", () => ({ prisma: {} }));
vi.mock("@/lib/notify", () => ({ notifyOwner: vi.fn() }));
vi.mock("@/lib/email", () => ({ sendLicenceEmail: vi.fn() }));

import { PDFDocument, StandardFonts } from "pdf-lib";
import { BUSINESS, sellerLines } from "@/lib/business-details";
import { buildLicenceQuotePdf, quoteReference, winAnsiSafe } from "@/lib/licence-quote-pdf";

describe("seller details", () => {
  it("leaves every empty placeholder off, so no made-up address is printed", () => {
    const blank = { ...BUSINESS, legalName: "", addressLines: [], companyNumber: "", vatNumber: "" };
    expect(sellerLines(blank)).toEqual(["Learn Hieroglyphics", "contact@learnhieroglyphics.com", "www.learnhieroglyphics.com"]);
  });

  it("prints them once they are filled in", () => {
    const filled = { ...BUSINESS, legalName: "A Person", addressLines: ["1 Road", "", "Town"], companyNumber: "", vatNumber: "GB123" };
    expect(sellerLines(filled)).toEqual(["Learn Hieroglyphics", "A Person", "1 Road", "Town", "VAT no. GB123", "contact@learnhieroglyphics.com", "www.learnhieroglyphics.com"]);
  });
});

describe("buildLicenceQuotePdf", () => {
  it("builds a one-page PDF even from names the standard font cannot set", async () => {
    const { bytes, reference } = await buildLicenceQuotePdf({
      plan: "school",
      country: "GB",
      schoolName: "Ærøskøbing Skole 学校 — Zoë's",
      contactName: "Siân Ó Briain",
      addressLines: ["1 Church Lane", "York YO1 7HH"],
      now: new Date("2026-10-16T00:00:00Z"),
      reference: "Q-20261016-TEST",
    });
    expect(reference).toBe("Q-20261016-TEST");
    expect(Buffer.from(bytes.slice(0, 5)).toString()).toBe("%PDF-");
    const doc = await PDFDocument.load(bytes);
    expect(doc.getPageCount()).toBe(1);
    expect(doc.getTitle()).toContain("School licence");
  });

  it("works with nothing but a plan (the quote link before the form is filled)", async () => {
    const { bytes } = await buildLicenceQuotePdf({ plan: "classroom", country: "" });
    expect((await PDFDocument.load(bytes)).getPageCount()).toBe(1);
  });

  it("makes readable references", () => {
    expect(quoteReference(new Date("2026-10-16T00:00:00Z"), () => 0)).toBe("Q-20261016-AAAA");
  });

  it("folds accents and replaces what WinAnsi cannot set", async () => {
    const font = await (await PDFDocument.create()).embedFont(StandardFonts.Helvetica);
    expect(winAnsiSafe(font, "Zoë £99.50")).toBe("Zoe £99.50");
    expect(winAnsiSafe(font, "学")).toBe("?");
  });
});

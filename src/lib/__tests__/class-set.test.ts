import { describe, expect, it } from "vitest";
import { PDFDocument } from "pdf-lib";
import {
  CLASS_SET,
  CLASS_SET_MAX_NAMES,
  classSetCheckoutParams,
  classSetPrice,
  decodeClassSetNames,
  encodeClassSetNames,
  isClassSetTheme,
  parseClassList,
} from "@/lib/class-set";
import { buildClassSetPdf } from "@/lib/cartouche-print-pdf";

describe("parseClassList", () => {
  it("splits lines, commas and tabs, tidies spaces and drops repeats", () => {
    const parsed = parseClassList("Olivia\n  Noah ,Ava;\tLiam\nolivia\n\n");
    expect(parsed.names).toEqual(["Olivia", "Noah", "Ava", "Liam"]);
    expect(parsed.skipped).toEqual([]);
  });
  it("reports names with nothing to spell", () => {
    expect(parseClassList("Mia\n1234\n!!").skipped).toEqual(["1234", "!!"]);
  });
  it("stops at the name limit and counts the rest", () => {
    const many = Array.from({ length: CLASS_SET_MAX_NAMES + 3 }, (_, i) => `Pupil${String.fromCharCode(97 + (i % 26))}${i}`).join("\n");
    const parsed = parseClassList(many);
    expect(parsed.names).toHaveLength(CLASS_SET_MAX_NAMES);
    expect(parsed.overflow).toBe(3);
  });
});

describe("names in Stripe metadata", () => {
  it("round-trips a full class in values under 500 characters", () => {
    const names = Array.from({ length: CLASS_SET_MAX_NAMES }, (_, i) => `Maximiliana-Jose${i}`);
    const md = encodeClassSetNames(names);
    for (const v of Object.values(md)) expect(v.length).toBeLessThanOrEqual(500);
    expect(Object.keys(md).length).toBeGreaterThan(1);
    expect(decodeClassSetNames(md)).toEqual(names);
  });
  it("reads nothing from empty metadata", () => {
    expect(decodeClassSetNames(undefined)).toEqual([]);
    expect(decodeClassSetNames({ product: "class-set" })).toEqual([]);
  });
});

describe("classSetCheckoutParams", () => {
  it("prices by currency and carries the product, paper and names", () => {
    const p = classSetCheckoutParams({ currency: "GBP", names: ["Olivia", "Noah"], theme: "papyrus", from: "class-strip", gaClientId: "", gaSessionId: "", base: "https://x.test" });
    expect(p.line_items[0].price_data.unit_amount).toBe(799);
    expect(p.line_items[0].price_data.currency).toBe("gbp");
    expect(p.metadata.product).toBe(CLASS_SET.id);
    expect(p.metadata.theme).toBe("papyrus");
    expect(decodeClassSetNames(p.metadata)).toEqual(["Olivia", "Noah"]);
    expect(p.success_url).toBe("https://x.test/teachers/class-set/thanks?session_id={CHECKOUT_SESSION_ID}");
    expect(classSetPrice("USD")).toBe("$9.99");
  });
  it("offers only the classroom papers", () => {
    expect(isClassSetTheme("cream")).toBe(true);
    expect(isClassSetTheme("valentine")).toBe(false);
    expect(isClassSetTheme("nonsense")).toBe(false);
  });
});

describe("buildClassSetPdf", () => {
  it("gives one page per pupil plus the class page", async () => {
    const pdf = await buildClassSetPdf(["Olivia", "Noah", "Zoë", "1234"], "cream");
    const doc = await PDFDocument.load(pdf);
    expect(doc.getPageCount()).toBe(4);
  }, 30000);
  it("runs the class page onto a second page for a big class", async () => {
    const names = Array.from({ length: CLASS_SET_MAX_NAMES }, (_, i) => `Pupil${String.fromCharCode(97 + (i % 26))}`);
    const doc = await PDFDocument.load(await buildClassSetPdf(names, "cream"));
    expect(doc.getPageCount()).toBe(CLASS_SET_MAX_NAMES + 2);
  }, 30000);
});

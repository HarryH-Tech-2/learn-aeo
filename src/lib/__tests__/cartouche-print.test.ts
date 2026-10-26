import { describe, it, expect } from "vitest";
import {
  CARTOUCHE_PRINT,
  cartouchePrintDownloadPath,
  cartouchePrintFilename,
  cartouchePrintMinor,
  cartouchePrintName,
  formatCartouchePrintPrice,
  isCartouchePrintSession,
  isPaidCartouchePrintSession,
  looksLikeCheckoutSessionId,
  CARTOUCHE_PRINT_THEMES,
  DEFAULT_CARTOUCHE_PRINT_THEME,
  cartouchePrintTheme,
  cartouchePrintThemeById,
  isCartouchePrintTheme,
  CARTOUCHE_PRINT_FORMATS,
  CARTOUCHE_PRINT_SHIP_TO,
  DEFAULT_CARTOUCHE_PRINT_FORMAT,
  cartouchePrintFormat,
  cartouchePrintFormatById,
  cartouchePrintFormatMinor,
  formatCartouchePrintFormatPrice,
  isCartouchePrintFormat,
  isPhysicalCartouchePrint,
  isCartoucheImageSession,
  cartoucheHdImageFilename,
  cartoucheImageDownloadPath,
} from "@/lib/cartouche-print";

describe("cartouche-print", () => {
  it("prices match the Stripe amounts in scripts/stripe-create-plans.mjs", () => {
    expect(cartouchePrintMinor("USD")).toBe(1999);
    expect(cartouchePrintMinor("GBP")).toBe(1599);
    expect(formatCartouchePrintPrice("USD")).toBe("$19.99");
    expect(formatCartouchePrintPrice("GBP")).toBe("£15.99");
  });

  it("makes a safe filename", () => {
    expect(cartouchePrintFilename("Harry")).toBe("harry-cartouche-print.pdf");
    expect(cartouchePrintFilename("Mary-Anne O'Neil")).toBe("mary-anne-o-neil-cartouche-print.pdf");
    expect(cartouchePrintFilename("𓂀")).toBe("my-cartouche-print.pdf");
  });

  it("only accepts things that look like Checkout Session ids", () => {
    expect(looksLikeCheckoutSessionId("cs_test_a1B2c3D4e5")).toBe(true);
    expect(looksLikeCheckoutSessionId("cs_live_a1B2c3D4e5")).toBe(true);
    expect(looksLikeCheckoutSessionId("pi_123456789")).toBe(false);
    expect(looksLikeCheckoutSessionId("cs_<script>")).toBe(false);
    expect(looksLikeCheckoutSessionId(null)).toBe(false);
  });

  it("recognises a paid print order and nothing else", () => {
    const paid = { payment_status: "paid", metadata: { product: CARTOUCHE_PRINT.id, name: "Harry" } };
    expect(isCartouchePrintSession(paid)).toBe(true);
    expect(isPaidCartouchePrintSession(paid)).toBe(true);
    expect(cartouchePrintName(paid)).toBe("Harry");

    expect(isPaidCartouchePrintSession({ payment_status: "unpaid", metadata: { product: CARTOUCHE_PRINT.id, name: "Harry" } })).toBe(false);
    expect(isCartouchePrintSession({ payment_status: "paid", metadata: { plan: "lifetime" } })).toBe(false);
    expect(cartouchePrintName({ metadata: { product: CARTOUCHE_PRINT.id, name: "  " } })).toBeNull();
  });

  it("builds the download path against the session id", () => {
    expect(cartouchePrintDownloadPath("cs_test_1")).toBe("/api/cartouche-print/download?session_id=cs_test_1");
  });

  it("offers a few named papers, each with a full set of print colours", () => {
    const ids = CARTOUCHE_PRINT_THEMES.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toContain(DEFAULT_CARTOUCHE_PRINT_THEME);
    for (const t of CARTOUCHE_PRINT_THEMES) {
      for (const hex of [t.page, t.gold, t.goldDeep, t.ink, t.muted, t.rule]) expect(hex).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(t.label.length).toBeGreaterThan(0);
      expect(t.blurb.length).toBeGreaterThan(0);
    }
    expect(cartouchePrintThemeById("night").art).toBe("/cartouche-print/night.jpg");
    expect(cartouchePrintThemeById("cream").art).toBeUndefined();
    for (const t of CARTOUCHE_PRINT_THEMES) {
      expect(t.footerInset).toBeGreaterThanOrEqual(40);
      if (t.art) expect(t.thumb).toBeTruthy();
    }
  });

  it("offers the PDF, a posted print, a framed print and the HD image, each with its own Stripe Price", () => {
    expect(CARTOUCHE_PRINT_FORMATS.map((f) => f.id)).toEqual(["digital", "print", "print-a3", "print-a2", "print-a1", "framed", "image"]);
    expect(new Set(CARTOUCHE_PRINT_FORMATS.map((f) => f.envKey)).size).toBe(7);
    expect(new Set(CARTOUCHE_PRINT_FORMATS.map((f) => f.stripeProductId)).size).toBe(7);
    // the posters cost more as they grow, and each has its Prodigi SKU
    const sizes = (["print", "print-a3", "print-a2", "print-a1"] as const).map(cartouchePrintFormatById);
    sizes.slice(1).forEach((f, i) => expect(f.usd).toBeGreaterThan(sizes[i].usd));
    expect(sizes.map((f) => f.prodigiSku)).toEqual(["GLOBAL-FAP-A4", "GLOBAL-FAP-A3", "GLOBAL-FAP-A2", "GLOBAL-FAP-A1"]);
    expect(cartouchePrintFormatById("digital")).toMatchObject({ usd: 19.99, gbp: 15.99, physical: false, envKey: "STRIPE_PRICE_CARTOUCHE" });
    expect(cartouchePrintFormatById("print").physical).toBe(true);
    expect(cartouchePrintFormatById("framed").usd).toBeGreaterThan(cartouchePrintFormatById("print").usd);
    expect(cartouchePrintFormatById("print").usd).toBeGreaterThan(cartouchePrintFormatById("digital").usd);
    for (const f of CARTOUCHE_PRINT_FORMATS) if (f.physical) expect(f.shipsIn).toBeTruthy();
    expect(isCartouchePrintFormat(DEFAULT_CARTOUCHE_PRINT_FORMAT)).toBe(true);
    expect(cartouchePrintFormatMinor("USD", "framed")).toBe(9499);
    expect(formatCartouchePrintFormatPrice("GBP", "print")).toBe("£27.99");
    expect(CARTOUCHE_PRINT_SHIP_TO).toContain("GB");
    expect(CARTOUCHE_PRINT_SHIP_TO).toContain("US");
    expect(new Set(CARTOUCHE_PRINT_SHIP_TO).size).toBe(CARTOUCHE_PRINT_SHIP_TO.length);
  });

  it("reads the format from the session, digital for orders placed before formats existed", () => {
    const base = { payment_status: "paid", metadata: { product: CARTOUCHE_PRINT.id, name: "Harry" } };
    expect(cartouchePrintFormat(base)).toBe("digital");
    expect(isPhysicalCartouchePrint(base)).toBe(false);
    expect(cartouchePrintFormat({ ...base, metadata: { ...base.metadata, format: "framed" } })).toBe("framed");
    expect(isPhysicalCartouchePrint({ ...base, metadata: { ...base.metadata, format: "print" } })).toBe(true);
    expect(cartouchePrintFormat({ ...base, metadata: { ...base.metadata, format: "hologram" } })).toBe("digital");
  });

  it("reads the paper from the session and falls back to cream for old or odd orders", () => {
    expect(isCartouchePrintTheme("night")).toBe(true);
    expect(isCartouchePrintTheme("neon")).toBe(false);
    expect(isCartouchePrintTheme(undefined)).toBe(false);
    expect(cartouchePrintTheme({ metadata: { product: CARTOUCHE_PRINT.id, name: "Harry", theme: "papyrus" } })).toBe("papyrus");
    expect(cartouchePrintTheme({ metadata: { product: CARTOUCHE_PRINT.id, name: "Harry" } })).toBe("cream");
    expect(cartouchePrintTheme({ metadata: { product: CARTOUCHE_PRINT.id, name: "Harry", theme: "neon" } })).toBe("cream");
  });
});

describe("share image helpers", () => {
  it("builds the share image path and file name from the name and paper", async () => {
    const { cartouchePrintImagePath, cartouchePrintImageFilename } = await import("@/lib/cartouche-print");
    expect(cartouchePrintImagePath(" Mary Jane ", "night")).toBe("/cartouche-image/print?name=Mary%20Jane&paper=night");
    expect(cartouchePrintImageFilename("Mary-Jane O'Neil", "temple")).toBe("mary-jane-o-neil-cartouche-temple.jpg");
    expect(cartouchePrintImageFilename("!!!", "cream")).toBe("my-cartouche-cream.jpg");
  });

  it("lays page one out so the loop stays inside the margins for long names", async () => {
    const { printPageLayout, PRINT_PAGE, printNameSize } = await import("@/lib/cartouche-print");
    const short = printPageLayout(4);
    const long = printPageLayout(20);
    expect(short.size).toBeGreaterThan(long.size);
    expect(long.size).toBeGreaterThanOrEqual(24);
    expect(long.loopX + long.loopW).toBeLessThanOrEqual(PRINT_PAGE.width - PRINT_PAGE.margin);
    expect(printNameSize("HARRY")).toBe(36);
    expect(printNameSize("MAXIMILIAN ALEXANDER")).toBeLessThan(36);
  });
});

describe("HD image format", () => {
  it("is priced $3.99 / £2.99 and delivers a JPEG, not the PDF", () => {
    expect(formatCartouchePrintFormatPrice("USD", "image")).toBe("$3.99");
    expect(formatCartouchePrintFormatPrice("GBP", "image")).toBe("£2.99");
    expect(cartouchePrintFormatMinor("USD", "image")).toBe(399);
    expect(cartouchePrintFormatById("image")).toMatchObject({ physical: false, file: "jpeg" });
    expect(CARTOUCHE_PRINT_FORMATS.filter((f) => f.id !== "image").every((f) => f.file === "pdf")).toBe(true);
  });

  it("tells image orders apart from PDF orders", () => {
    expect(isCartoucheImageSession({ metadata: { product: "cartouche-print", format: "image" } })).toBe(true);
    expect(isCartoucheImageSession({ metadata: { product: "cartouche-print", format: "framed" } })).toBe(false);
    // orders from before formats existed were the PDF
    expect(isCartoucheImageSession({ metadata: { product: "cartouche-print" } })).toBe(false);
  });

  it("names and links the HD file", () => {
    expect(cartoucheHdImageFilename("Harry", "papyrus")).toBe("harry-cartouche-papyrus-hd.jpg");
    expect(cartoucheImageDownloadPath("cs_test_1")).toBe("/api/cartouche-print/image?session_id=cs_test_1");
  });
});

describe("family prints", () => {
  it("cleans the names: valid only, no repeats, at most four, first name first", async () => {
    const { cleanCartoucheNames } = await import("@/lib/cartouche-print");
    expect(cleanCartoucheNames(["Harry", " sally ", "", "HARRY", "<b>x</b>", 42, "Tom", "Ann", "Zed"])).toEqual(["Harry", "sally", "Tom", "Ann"]);
    // a "|" cannot get through, so it is safe as the metadata separator
    expect(cleanCartoucheNames(["Harry|Sally"])).toEqual([]);
  });

  it("keeps a one-name order's metadata unchanged and stores a family as a joined list", async () => {
    const { encodeCartoucheNames } = await import("@/lib/cartouche-print");
    expect(encodeCartoucheNames(["Harry"])).toBeUndefined();
    expect(encodeCartoucheNames(["Harry", "Sally", "Tom"])).toBe("Harry|Sally|Tom");
    // four names at the 30-character cap stay well inside Stripe's 500-character value limit
    const long = ["A", "B", "C", "D"].map((c) => `${c}${"bcdefghij".repeat(4).slice(0, 29)}`);
    expect(long.every((n) => n.length === 30)).toBe(true);
    expect(encodeCartoucheNames(long)!.length).toBeLessThanOrEqual(500);
  });

  it("reads every name back from the session, falling back to the one name for old orders", async () => {
    const { cartouchePrintNames, cartouchePrintSubject } = await import("@/lib/cartouche-print");
    const old = { metadata: { product: "cartouche-print", name: "Harry" } };
    expect(cartouchePrintNames(old)).toEqual(["Harry"]);
    expect(cartouchePrintSubject(old)).toBe("Harry");
    const fam = { metadata: { product: "cartouche-print", name: "Harry", names: "Harry|Sally|Tom" } };
    expect(cartouchePrintNames(fam)).toEqual(["Harry", "Sally", "Tom"]);
    expect(cartouchePrintSubject(fam)).toEqual(["Harry", "Sally", "Tom"]);
    // a names value that does not parse to two good names is ignored
    expect(cartouchePrintNames({ metadata: { name: "Harry", names: "Harry|<x>" } })).toEqual(["Harry"]);
    expect(cartouchePrintSubject({ metadata: {} })).toBeNull();
  });

  it("joins names for people to read", async () => {
    const { joinCartoucheNames } = await import("@/lib/cartouche-print");
    expect(joinCartoucheNames(["Harry"])).toBe("Harry");
    expect(joinCartoucheNames(["Harry", "Sally"])).toBe("Harry and Sally");
    expect(joinCartoucheNames(["Harry", "Sally", "Tom"])).toBe("Harry, Sally and Tom");
  });

  it("adds $5 / £4 to a posted or framed family print only; the HD image and PDF never change", async () => {
    const { cartouchePrintOrderAmount, cartouchePrintOrderMinor, formatCartouchePrintOrderPrice, cartoucheFamilySurcharge } = await import("@/lib/cartouche-print");
    expect(cartouchePrintOrderMinor("USD", "print", 1)).toBe(3999);
    expect(cartouchePrintOrderMinor("USD", "print", 2)).toBe(4499);
    expect(cartouchePrintOrderMinor("GBP", "print", 4)).toBe(3199);
    expect(cartouchePrintOrderMinor("USD", "framed", 3)).toBe(9999);
    expect(cartouchePrintOrderMinor("GBP", "framed", 2)).toBe(6399);
    expect(cartouchePrintOrderAmount("USD", "image", 4)).toBe(3.99);
    expect(cartouchePrintOrderAmount("GBP", "digital", 3)).toBe(15.99);
    expect(cartoucheFamilySurcharge("USD", "image", 4)).toBe(0);
    expect(formatCartouchePrintOrderPrice("GBP", "framed", 2)).toBe("£63.99");
  });

  it("never prices a format below what it was (no price is lowered)", async () => {
    const { cartouchePrintOrderAmount } = await import("@/lib/cartouche-print");
    for (const f of CARTOUCHE_PRINT_FORMATS)
      for (const n of [1, 2, 3, 4]) {
        expect(cartouchePrintOrderAmount("USD", f.id, n)).toBeGreaterThanOrEqual(f.usd);
        expect(cartouchePrintOrderAmount("GBP", f.id, n)).toBeGreaterThanOrEqual(f.gbp);
      }
  });

  it("leads the card with the cheapest offered format", async () => {
    const { cartouchePrintFromPrice } = await import("@/lib/cartouche-print");
    expect(cartouchePrintFromPrice("USD", ["image", "print", "framed"])).toBe("$3.99");
    expect(cartouchePrintFromPrice("GBP", ["framed", "print", "image"])).toBe("£2.99");
  });

  it("builds a family share image path with name= repeated, and keeps the one-name path unchanged", async () => {
    const { cartouchePrintImagePath } = await import("@/lib/cartouche-print");
    expect(cartouchePrintImagePath(["Harry"], "night")).toBe("/cartouche-image/print?name=Harry&paper=night");
    expect(cartouchePrintImagePath(["Harry", "Mary Jane"], "night")).toBe("/cartouche-image/print?name=Harry&name=Mary%20Jane&paper=night");
  });

  it("stacks two to four cartouches inside the margins and between the kicker and the caption", async () => {
    const { familyPageLayout, FAMILY_BAND, PRINT_PAGE, glyphRunEm } = await import("@/lib/cartouche-print");
    const { getHieroglyphs } = await import("@/lib/hieroglyph-translator");
    for (const names of [
      ["Harry", "Sally"],
      ["Mum", "Dad", "Olivia"],
      ["Christopher Alexander", "Maximiliana Josephine", "Bartholomew Fitzgerald", "Dad"],
    ]) {
      const runs = names.map((n) => getHieroglyphs(n));
      const { slots, nameMax } = familyPageLayout(runs);
      expect(slots).toHaveLength(names.length);
      slots.forEach((s, i) => {
        expect(s.loopX).toBeGreaterThanOrEqual(PRINT_PAGE.margin - 1);
        expect(s.loopX + s.loopW + 30).toBeLessThanOrEqual(PRINT_PAGE.width - PRINT_PAGE.margin + 1);
        // the signs fit their loop
        expect(glyphRunEm(runs[i]) * s.size).toBeLessThanOrEqual(s.loopW);
        expect(s.loopTop).toBeGreaterThan(FAMILY_BAND.kicker);
        expect(s.nameBaseline).toBeLessThan(FAMILY_BAND.caption - 8);
        if (i > 0) expect(s.loopTop).toBeGreaterThan(slots[i - 1].nameBaseline);
      });
      expect(nameMax).toBeGreaterThanOrEqual(14);
    }
  });

  it("the sign widths table matches the font for every sign the translator can write", async () => {
    const fs = await import("node:fs");
    const path = await import("node:path");
    const fontkit = (await import("@pdf-lib/fontkit")).default;
    const { getAlphabetMappings } = await import("@/lib/hieroglyph-translator");
    const { glyphRunEm } = await import("@/lib/cartouche-print");
    const font = fontkit.create(fs.readFileSync(path.join(process.cwd(), "src/app/cartouche-image/noto-egyptian-translator.ttf")));
    for (const m of getAlphabetMappings()) {
      // Four of the same sign clear the 1 em floor on a single narrow one.
      // Some letters are two signs (x = k + s): add them all up.
      const em = [...m.glyph].reduce((sum, ch) => sum + font.glyphForCodePoint(ch.codePointAt(0)!).advanceWidth / font.unitsPerEm, 0);
      expect({ sign: m.input, off: Math.abs(glyphRunEm(m.glyph.repeat(4)) / 4 - em) < 0.02 }).toEqual({ sign: m.input, off: true });
    }
  });
});

describe("Christmas notice", () => {
  it("says order by 10 December for the print and 8 December for the framed print, from 1 November", async () => {
    const { christmasNotice } = await import("@/lib/cartouche-print");
    expect(christmasNotice("print", new Date(2026, 9, 31))).toBeNull();
    expect(christmasNotice("print", new Date(2026, 10, 1))).toEqual({ kind: "order-by", date: "10 December", text: "Order by 10 December for Christmas delivery" });
    expect(christmasNotice("framed", new Date(2026, 10, 20))?.text).toBe("Order by 8 December for Christmas delivery");
    expect(christmasNotice("print", new Date(2026, 11, 10, 23, 59))?.kind).toBe("order-by");
    expect(christmasNotice("framed", new Date(2026, 11, 8))?.kind).toBe("order-by");
  });

  it("warns after the cutoff until Christmas Eve, then says nothing", async () => {
    const { christmasNotice } = await import("@/lib/cartouche-print");
    expect(christmasNotice("framed", new Date(2026, 11, 9))).toEqual({
      kind: "late",
      text: "Posted prints may arrive after Christmas — the HD image arrives in a minute",
    });
    expect(christmasNotice("print", new Date(2026, 11, 11))?.kind).toBe("late");
    expect(christmasNotice("print", new Date(2026, 11, 24, 23, 0))?.kind).toBe("late");
    expect(christmasNotice("print", new Date(2026, 11, 25))).toBeNull();
    expect(christmasNotice("print", new Date(2027, 0, 5))).toBeNull();
  });

  it("never shows on formats that are not posted", async () => {
    const { christmasNotice } = await import("@/lib/cartouche-print");
    expect(christmasNotice("image", new Date(2026, 11, 1))).toBeNull();
    expect(christmasNotice("digital", new Date(2026, 11, 20))).toBeNull();
  });
});

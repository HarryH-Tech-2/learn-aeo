import { describe, it, expect } from "vitest";
import { STELA_OBJECTS, assembled, hitTest, isHotspotList, objectsFor, playableObjects, sortByDirection, tapSign, xpForPhrase, type Hotspot } from "../stela";

const HIERO = /^[\u{13000}-\u{1345F}]+$/u;
const intef = STELA_OBJECTS.find((o) => o.id === "intef")!;
const titulary = intef.phrases[0];

describe("object data", () => {
  it("every playable object has a CC0 Met image, attribution and in-bounds hotspots", () => {
    for (const o of playableObjects()) {
      expect(o.museum).toBe("met");
      expect(o.image!.src).toMatch(/^\/stela\/.+\.webp$/);
      expect(o.credit).toContain("CC0");
      expect(o.objectUrl).toContain("metmuseum.org");
      for (const p of o.phrases) {
        expect(p.hotspots.length).toBeGreaterThan(0);
        const ids = new Set(p.hotspots.map((h) => h.id));
        expect(ids.size).toBe(p.hotspots.length);
        for (const h of p.hotspots) {
          expect(h.glyph, `${o.id}/${p.id}/${h.id}`).toMatch(HIERO);
          expect(h.x - h.w / 2).toBeGreaterThanOrEqual(0);
          expect(h.x + h.w / 2).toBeLessThanOrEqual(1);
          expect(h.y - h.h / 2).toBeGreaterThanOrEqual(0);
          expect(h.y + h.h / 2).toBeLessThanOrEqual(1);
        }
      }
    }
  });

  it("exactly one free playable object, and BM entries are link-only", () => {
    expect(playableObjects().filter((o) => o.free).length).toBe(1);
    for (const o of objectsFor("bm")) expect(o.image).toBeUndefined();
    expect(objectsFor("all").length).toBe(STELA_OBJECTS.length);
  });
});

describe("reading", () => {
  it("hit-tests a tap to the smallest enclosing hotspot", () => {
    const goose = titulary.hotspots.find((h) => h.id === "goose")!;
    expect(hitTest(titulary, goose.x, goose.y)?.id).toBe("goose");
    expect(hitTest(titulary, 0.1, 0.9)).toBeNull();
    const big = { id: "big", x: 0.5, y: 0.5, w: 0.4, h: 0.4, glyph: "𓀀", value: "a", name: "" };
    const small = { id: "small", x: 0.5, y: 0.5, w: 0.05, h: 0.05, glyph: "𓀀", value: "b", name: "" };
    expect(hitTest({ ...titulary, hotspots: [big, small] }, 0.5, 0.5)?.id).toBe("small");
    expect(hitTest({ ...titulary, hotspots: [big, small] }, 0.4, 0.4)?.id).toBe("big");
  });

  it("advances only on the expected sign and finishes at the end", () => {
    let r = tapSign(titulary, 0, "goose");
    expect(r.ok).toBe(false);
    expect(r.index).toBe(0);
    expect(r.expected.id).toBe("nswbity");
    r = tapSign(titulary, 0, "nswbity");
    expect(r.ok).toBe(true);
    expect(r.index).toBe(1);
    let i = 0;
    for (const h of titulary.hotspots) i = tapSign(titulary, i, h.id).index;
    expect(tapSign(titulary, titulary.hotspots.length - 1, titulary.hotspots[titulary.hotspots.length - 1].id).done).toBe(true);
    expect(assembled(titulary, 2)).toBe("nsw-bity nb");
  });

  it("sorts hotspots into reading order for the editor", () => {
    const hs: Hotspot[] = [
      { id: "a", x: 0.8, y: 0.1, w: 0.1, h: 0.1, glyph: "𓀀", value: "", name: "" },
      { id: "b", x: 0.2, y: 0.1, w: 0.1, h: 0.1, glyph: "𓀀", value: "", name: "" },
      { id: "c", x: 0.5, y: 0.5, w: 0.1, h: 0.1, glyph: "𓀀", value: "", name: "" },
    ];
    expect(sortByDirection(hs, "ltr").map((h) => h.id)).toEqual(["b", "a", "c"]);
    expect(sortByDirection(hs, "rtl").map((h) => h.id)).toEqual(["a", "b", "c"]);
    expect(sortByDirection(hs, "ttb").map((h) => h.id)).toEqual(["b", "c", "a"]);
    expect(isHotspotList(hs)).toBe(true);
    expect(isHotspotList([{ id: 1 }])).toBe(false);
  });

  it("xp rewards clean reads", () => {
    expect(xpForPhrase(10, 0)).toBe(60);
    expect(xpForPhrase(2, 5)).toBe(10);
  });
});

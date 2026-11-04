import { describe, it, expect } from "vitest";
import { afterFirst, confidenceKey, parseConfidence, reviewOrder } from "@/lib/concept-confidence";

describe("concept confidence", () => {
  it("uses the site's storage prefix", () => {
    expect(confidenceKey("lesson-x")).toBe("aeo_confidence_lesson-x");
  });

  it("keeps only valid ratings from storage", () => {
    expect(parseConfidence(null)).toEqual({});
    expect(parseConfidence("not json")).toEqual({});
    expect(parseConfidence("[1,2]")).toEqual({});
    expect(parseConfidence('{"a":"got","b":"shaky","c":"maybe","d":3}')).toEqual({ a: "got", b: "shaky" });
  });

  it("orders the review: not sure, then unrated, then got it, each in lesson order", () => {
    const cs = ["a", "b", "c", "d", "e"].map((id) => ({ id }));
    expect(reviewOrder(cs, { a: "got", c: "shaky", e: "shaky", b: "got" }).map((c) => c.id)).toEqual(["c", "e", "d", "a", "b"]);
    expect(reviewOrder(cs, {}).map((c) => c.id)).toEqual(["a", "b", "c", "d", "e"]);
  });

  it("puts the after version first for some concepts and not others, the same way every time", () => {
    const ids = ["c-one", "c-two", "c-three", "c-four", "c-five", "c-six"];
    const sides = ids.map(afterFirst);
    expect(new Set(sides).size).toBe(2);
    expect(ids.map(afterFirst)).toEqual(sides);
  });
});

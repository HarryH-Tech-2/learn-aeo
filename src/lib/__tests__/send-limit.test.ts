import { describe, expect, it } from "vitest";
import { allowSend } from "@/lib/send-limit";

describe("allowSend", () => {
  it("allows up to max in the window, then refuses until it slides", () => {
    const t = 1_000_000;
    expect([1, 2, 3, 4].map((i) => allowSend("k1", 3, 1000, t + i))).toEqual([true, true, true, false]);
    expect(allowSend("k1", 3, 1000, t + 1002)).toBe(true);
  });
  it("keeps keys apart", () => {
    expect(allowSend("a", 1, 1000, 5)).toBe(true);
    expect(allowSend("b", 1, 1000, 5)).toBe(true);
    expect(allowSend("a", 1, 1000, 6)).toBe(false);
  });
});

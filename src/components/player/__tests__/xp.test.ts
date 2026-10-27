import { describe, it, expect } from "vitest";
import { auditGain, claimExerciseAnswer, claimXp, cleanKey } from "@/components/player/xp";
import { AUDIT_KEY, checkKey, conceptKey, exerciseKey } from "@/lib/xp-claims";

describe("player claim keys", () => {
  it("uses the server's explicit key formats", () => {
    expect(conceptKey("c-rag")).toBe("concept:c-rag");
    expect(checkKey("q-g1")).toBe("check:q-g1");
    expect(exerciseKey("x-ex", "x-1")).toBe("exercise:x-ex:x-1");
    expect(cleanKey("x-ex")).toBe("exercise:x-ex:clean");
    expect(AUDIT_KEY).toBe("audit");
  });
});

describe("claimXp", () => {
  it("pays a key once per sitting, and a wrong first try keeps it unpaid", () => {
    const claimed = new Set<string>();
    expect(claimXp(claimed, "check:a", 10)).toBe(10);
    expect(claimXp(claimed, "check:a", 10)).toBe(0);
    expect(claimXp(claimed, "check:b", 0)).toBe(0);
    expect(claimXp(claimed, "check:b", 10)).toBe(0);
  });
});

describe("claimExerciseAnswer", () => {
  it("claims the step under exercise:<id>:<q> and a wrong answer forfeits the clean key", () => {
    const claimed = new Set<string>();
    expect(claimExerciseAnswer(claimed, "x", "s1", true, 20)).toBe(20);
    expect(claimed.has("exercise:x:s1")).toBe(true);
    expect(claimExerciseAnswer(claimed, "x", "s2", false, 20)).toBe(0);
    expect(claimed.has(cleanKey("x"))).toBe(true);
    expect(claimXp(claimed, cleanKey("x"), 50)).toBe(0);
  });
});

describe("auditGain", () => {
  it("pays only an improvement on the sitting's best audit value", () => {
    expect(auditGain(0, 150)).toBe(150);
    expect(auditGain(150, 225)).toBe(75);
    expect(auditGain(225, 150)).toBe(0);
    expect(auditGain(225, 225)).toBe(0);
  });
});

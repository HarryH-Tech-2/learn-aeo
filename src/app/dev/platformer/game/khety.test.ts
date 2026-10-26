import { describe, expect, it } from "vitest";
import { FACTS, finishLine, finishSpoken, hintFor, pokeLine, rightLine, startLine, teachLine, wrongLine } from "./khety";
import { clipKey, speakable, spokenLines } from "./voice";
import { ALL_SIGNS, LAYOUTS, planLevel, signInfo, type Layout } from "./lesson";

describe("Khety", () => {
  it("has something to say at the start of every kind of level", () => {
    for (const layout of Object.keys(LAYOUTS) as Layout[]) expect(startLine(layout).length).toBeGreaterThan(10);
  });

  it("makes more of answers that come in a row", () => {
    expect(rightLine(3)).toMatch(/three in a row/i);
    expect(rightLine(5)).toMatch(/five in a row/i);
    expect(rightLine(1, () => 0).length).toBeGreaterThan(2);
    expect(wrongLine(() => 0.99).length).toBeGreaterThan(5);
    expect(teachLine(() => 0.5)).toMatch(/new|fresh|met/i);
  });

  it("congratulates by name, and by how the run went", () => {
    expect(finishLine({ clean: 5, total: 5, last: false, name: "Amira" })).toMatch(/Flawless, Amira/);
    expect(finishLine({ clean: 4, total: 5, last: false, name: "" })).toMatch(/nearly perfect!/);
    expect(finishLine({ clean: 2, total: 5, last: false, name: "" })).toMatch(/2 of 5/);
    expect(finishLine({ clean: 9, total: 9, last: true, name: "" })).toMatch(/read the alphabet/);
  });
});

describe("asking Khety", () => {
  const plan = (level: number, known: string[]) => ({ ...planLevel({ level, name: "", known, review: null, now: 0, rand: () => 0.42 }), progress: 0, taught: [] as string[] });

  it("sends the learner to meet a new sign before anything else", () => {
    expect(hintFor(plan(1, []))).toMatch(/new sign to meet first/);
  });

  it("names the picture to look for, not the tablet to take", () => {
    const hint = hintFor(plan(1, ["𓂋", "𓈖", "𓋴", "𓏏"]));
    expect(hint).toContain("“r”");
    expect(hint).toMatch(/the mouth/i);
    expect(hint).not.toContain("𓂋");
  });

  it("rules a sound out when a sign is shown and its sound is wanted, without giving the sound away", () => {
    const wall = plan(11, ALL_SIGNS);
    const st = wall.stations[0];
    const hint = hintFor(wall, () => 0);
    expect(hint).toMatch(/^That sign is the /);
    expect(hint).toMatch(/it is not “/);
    expect(hint).not.toContain(`“${signInfo(st.target).sound}”`);
    // the buried wall asks its spelling stations the same way round
    expect(hintFor(plan(5, ALL_SIGNS), () => 0)).toMatch(/^That sign is the /);
  });

  it("asks for a silent picture by meaning, and knows when there is nothing left to ask", () => {
    const market = plan(4, ALL_SIGNS);
    const det = market.stations.findIndex((s) => s.kind === "det");
    expect(hintFor({ ...market, progress: det })).toMatch(/which picture shows that kind of thing/);
    expect(hintFor({ ...market, progress: market.stations.length })).toMatch(/old orders/i);
    const river = plan(1, ALL_SIGNS);
    expect(hintFor({ ...river, progress: river.stations.length })).toMatch(/way out/);
  });

  it("is ticklish, up to a point", () => {
    expect(pokeLine(1)).toMatch(/hello/i);
    expect(pokeLine(2)).toMatch(/tickles/i);
    expect(pokeLine(99)).toMatch(/Anubis/);
    expect(FACTS.length).toBeGreaterThan(8);
  });
});

describe("recordings", () => {
  it("lists every fixed line once, each under a stable key", () => {
    const lines = spokenLines();
    expect(lines.filter((l) => l.voice === "sign").length).toBeGreaterThanOrEqual(20);
    expect(lines.filter((l) => l.voice === "khety").length).toBeGreaterThan(40);
    expect(new Set(lines.map((l) => l.key)).size).toBe(lines.length);
    expect(clipKey("Yes!")).toBe(clipKey("  yes! "));
    // what he says aloud at the finish is always one of the recordable lines
    for (const how of [{ clean: 5, total: 5, last: false }, { clean: 4, total: 5, last: false }, { clean: 1, total: 5, last: false }, { clean: 5, total: 5, last: true }]) {
      expect(lines.map((l) => l.key)).toContain(clipKey(finishSpoken(how)));
    }
    for (let streak = 1; streak <= 8; streak++) expect(lines.map((l) => l.key)).toContain(clipKey(rightLine(streak, () => 0.3)));
  });
});

describe("the sign voice", () => {
  it("says a sound the way an alphabet book would", () => {
    expect(speakable("b as in boy")).toBe("B, as in boy!");
    expect(speakable("kh as in Scottish loch")).toBe("Kh, as in Scottish loch!");
    expect(speakable("r (lightly rolled)")).toBe("R. Lightly rolled.");
    expect(speakable("oo / w")).toBe("Oo, or w!");
    expect(speakable("ah")).toBe("Ah!");
  });
});

describe("not repeating himself", () => {
  it("never announces two new signs running with the same line, and keeps every line in rotation", () => {
    const said: string[] = [];
    for (let i = 0; i < 40; i++) said.push(teachLine());
    for (let i = 1; i < said.length; i++) expect(said[i]).not.toBe(said[i - 1]);
    // and no line is left out for long: every one of them turns up in any stretch of eight
    const kinds = new Set(said).size;
    expect(kinds).toBeGreaterThan(2);
    for (let i = 0; i + 8 <= said.length; i++) expect(new Set(said.slice(i, i + 8)).size).toBe(kinds);
  });
});

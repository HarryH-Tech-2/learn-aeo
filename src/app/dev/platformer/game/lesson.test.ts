import { describe, expect, it } from "vitest";
import { ALL_SIGNS, DET_SITE, FINAL_PHRASE, LAYOUTS, LEVELS, MARKET_ORDERS, MAX_NAME_SIGNS, WALL_WORDS, allDone, columnWord, currentPhrase, optionCount, phraseFromName, phraseFromWord, planLevel, qualityAfterRun, signInfo, socketFilled, soundChoices, stationOfSocket, weakness } from "./lesson";
import { WORDS } from "@/lib/content/uniliteral-words";
import type { SignState } from "@/lib/srs";

const NOW = 1_800_000_000_000;
const state = (glyph: string, over: Partial<SignState> = {}): SignState => ({ glyph, ease: 2.5, interval: 10, reps: 3, lapses: 0, lastReview: NOW - 1000, due: NOW + 86_400_000, ...over });
const rand = () => 0.42;

describe("signs", () => {
  it("knows the sound, the picture and a hook for every alphabet sign", () => {
    expect(ALL_SIGNS.length).toBe(25);
    expect(signInfo("𓂋")).toMatchObject({ sound: "r" });
    expect(signInfo("𓅓").picture.toLowerCase()).toContain("owl");
    for (const s of ALL_SIGNS) {
      expect(signInfo(s).sound).not.toBe("?");
      expect(signInfo(s).hook.length).toBeGreaterThan(5);
      expect(signInfo(s).trick.length).toBeGreaterThan(5);
    }
  });

  it("scores forgotten, hard and overdue signs as weak", () => {
    expect(weakness(state("𓂋"), NOW)).toBe(0);
    expect(weakness(state("𓂋", { lapses: 2 }), NOW)).toBeGreaterThan(weakness(state("𓂋", { lapses: 1 }), NOW));
    expect(weakness(state("𓂋", { due: NOW - 1 }), NOW)).toBe(1);
  });
});

describe("the campaign", () => {
  it("runs name, the 19 words two at a time, then an unaided reading", () => {
    expect(LEVELS[0].kind).toBe("name");
    expect(LEVELS[LEVELS.length - 1].kind).toBe("final");
    const words = LEVELS.flatMap((l) => l.words);
    expect(words.map((w) => w.id)).toEqual(WORDS.map((w) => w.id));
    expect(LEVELS.length).toBe(12);
    LEVELS.forEach((l, i) => expect(l.index).toBe(i));
  });

  it("keeps the causeway for the first level only, and gives every other level a place of its own kind", () => {
    expect(LEVELS.map((l) => l.layout)).toEqual(["causeway", "felucca", "workshop", "tomb", "market", "brush", "passage", "felucca", "workshop", "tomb", "market", "wall"]);
    expect(LEVELS[0].fork).toBe("off");
    for (const l of LEVELS) expect(LAYOUTS[l.layout].begin.length).toBeGreaterThan(1);
  });

  it("states each idea where the place that teaches it first appears, and the silent picture only after it is explained", () => {
    expect(LEVELS[1].brief.title).toMatch(/no vowels/i);
    expect(LEVELS[2].brief.title).toMatch(/silent/i);
    expect(LEVELS[3].brief.title).toMatch(/which way/i);
    expect(LEVELS[4].brief.title).toMatch(/what kind of word/i);
    expect(LEVELS[5].brief.title).toMatch(/reading/i);
    // the second visit to a place has no new idea: the briefing names the words and says how the place works
    expect(LEVELS[7].brief.title).toMatch(/two more words/i);
    expect(LEVELS[7].brief.body[0]).toBe(LAYOUTS.felucca.how);
    expect(LEVELS[11 - 1].brief.title).toMatch(/one more word/i);
    expect(LEVELS[1].askDet).toBe(false);
    expect(LEVELS[2].askDet).toBe(true);
  });

  it("teaches all 25 signs by the end, each at a beacon the first time it is asked for", () => {
    const known = new Set<string>();
    for (const spec of LEVELS.filter((l) => l.kind === "words")) {
      const plan = planLevel({ level: spec.index, name: "", known: [...known], review: null, now: NOW, rand });
      const taughtHere = new Set<string>();
      for (const st of plan.stations.filter((s) => s.kind === "sign")) {
        expect(st.teach).toBe(!known.has(st.target) && !taughtHere.has(st.target));
        taughtHere.add(st.target);
      }
      taughtHere.forEach((s) => known.add(s));
    }
    expect(known.size).toBe(25);
  });
});

describe("the plan for one level", () => {
  it("starts from zero: one tablet, then two, and only ever signs already met as decoys", () => {
    const plan = planLevel({ level: 0, name: "Harry", known: [], review: null, now: NOW, rand });
    expect(plan.stations[0].options).toEqual([plan.stations[0].target]);
    expect(plan.stations.every((s) => s.teach)).toBe(true);
    const met = new Set<string>();
    plan.stations.forEach((st, i) => {
      expect(st.options.length).toBeLessThanOrEqual(optionCount(0, i));
      expect(st.options).toContain(st.target);
      for (const o of st.options) if (o !== st.target) expect(met.has(o)).toBe(true);
      met.add(st.target);
    });
    expect(plan.reviews).toEqual([]);
  });

  it("spells a name with repeated letters once per sign, and carves what it cannot teach", () => {
    // Barbara: b, a and r all come round again
    const name = phraseFromName("Barbara");
    const plan = planLevel({ level: 0, name: "Barbara", known: [], review: null, now: NOW, rand });
    expect(plan.stations.length).toBe(new Set(name.sockets.map((s) => s.symbol)).size);
    expect(plan.stations.length).toBeLessThan(name.sockets.length);
    const twice = name.sockets.filter((s) => s.symbol === name.sockets[0].symbol);
    expect(twice.length).toBeGreaterThan(1);
    const at = plan.stations.findIndex((s) => s.target === twice[0].symbol);
    expect(socketFilled(plan, 0, twice[1], at)).toBe(false);
    expect(socketFilled(plan, 0, twice[1], at + 1)).toBe(true);

    const long = phraseFromName("Christopher");
    expect(new Set(long.sockets.filter((s) => !s.given).map((s) => s.symbol)).size).toBeLessThanOrEqual(MAX_NAME_SIGNS);
    expect(phraseFromName("").translit).toBe("Khufu");
  });

  it("uses three tablets once past the name, with the next sign of the word as the trap when it is known", () => {
    const known = ["𓂋", "𓈖", "𓋴", "𓏏", "𓅓", "𓅱"];
    const plan = planLevel({ level: 1, name: "", known, review: null, now: NOW, rand });
    expect(plan.phrases.map((p) => p.id)).toEqual(["rn", "snt"]);
    expect(plan.stations.map((s) => s.target)).toEqual(["𓂋", "𓈖", "𓋴", "𓈖", "𓏏"]);
    expect(plan.stations.every((s) => !s.teach && s.options.length === 3)).toBe(true);
    expect(plan.stations[0].options).toContain("𓈖");
    // sites run in course order and never collide
    const sites = plan.stations.map((s) => s.site);
    expect([...sites].sort((a, b) => a - b)).toEqual(sites);
    expect(new Set([...sites, ...plan.reviews.map((r) => r.site)]).size).toBe(sites.length + plan.reviews.length);
  });

  it("asks for the silent picture at the gate, last, with one wrong picture beside it", () => {
    const plan = planLevel({ level: 2, name: "", known: ALL_SIGNS, review: null, now: NOW, rand });
    const det = plan.stations[plan.stations.length - 1];
    // pt then mw: the picture asked for is the one that ends the word just spelled
    expect(det).toMatchObject({ kind: "det", site: DET_SITE, target: "𓈗", phrase: 1 });
    expect(det.options).toHaveLength(2);
    expect(det.options.filter((o) => o === "𓈗")).toHaveLength(1);
    expect(plan.reviews.every((r) => r.site <= 4)).toBe(true);
  });

  it("carves a sign that is not in the alphabet and asks only for the rest", () => {
    const nfr = phraseFromWord(WORDS.find((w) => w.id === "nfr")!);
    expect(nfr.sockets[0]).toMatchObject({ symbol: "𓄤", given: true });
    expect(nfr.sockets.slice(1).map((s) => s.sound)).toEqual(["f", "r"]);
  });

  it("brings back the weakest old signs as reviews, asked sign to sound", () => {
    const known = ["𓂋", "𓈖", "𓋴", "𓏏", "𓊪", "𓅓", "𓅱"];
    const review = known.map((g) => state(g, g === "𓅓" ? { lapses: 4, ease: 1.4 } : {}));
    const plan = planLevel({ level: 3, name: "", known, review, now: NOW, rand });
    expect(plan.reviews.length).toBeGreaterThan(0);
    expect(plan.reviews[0].sign).toBe("𓅓");
    expect(plan.reviews[0].options).toContain("m");
    expect(new Set(plan.reviews[0].options).size).toBe(plan.reviews[0].options.length);
    for (const r of plan.reviews) expect(plan.stations.some((s) => s.target === r.sign)).toBe(false);
  });

  it("teaches a sign again when a word needs its real sound, not the letter it stood for in a name", () => {
    // Dawson met the vulture as “a”; level 3 (ꜥꜣ, nfr) wants it as ꜣ
    const knownAs = { "𓄿": "a", "𓂧": "d" };
    const plan = planLevel({ level: 3, name: "Dawson", known: ["𓄿", "𓂧", "𓂋"], knownAs, review: null, now: NOW, rand });
    const vulture = plan.stations.find((s) => s.target === "𓄿")!;
    expect(vulture).toMatchObject({ teach: true, metAs: "a", sound: "ꜣ" });
    // it is not counted as a new sign, and a sign known under its real sound is simply recalled
    expect(plan.newSigns).not.toContain("𓄿");
    expect(plan.stations.find((s) => s.target === "𓂋")).toMatchObject({ teach: false });
    expect(plan.stations.find((s) => s.target === "𓂋")?.metAs).toBeUndefined();
  });

  it("reviews a sign under the sound the learner knows it by", () => {
    const known = ["𓄿", "𓂧", "𓅱", "𓋴", "𓈖"];
    const knownAs = { "𓄿": "a", "𓂧": "d", "𓅱": "w", "𓋴": "s", "𓈖": "n" };
    const review = known.map((g) => state(g, g === "𓄿" ? { lapses: 5, ease: 1.3 } : {}));
    const plan = planLevel({ level: 1, name: "Dawson", known, knownAs, review, now: NOW, rand });
    expect(plan.reviews[0]).toMatchObject({ kind: "sound", sign: "𓄿", sound: "a" });
    expect(plan.reviews[0].options).toContain("a");
    expect(plan.reviews[0].options).not.toContain("ꜣ");
  });

  it("ends on a wall read with no help: old words below, a real name on top, signs shown and sounds chosen", () => {
    const review = ALL_SIGNS.map((g) => state(g, g === "𓈙" ? { lapses: 6, ease: 1.3 } : {}));
    const plan = planLevel({ level: LEVELS.length - 1, name: "", known: ALL_SIGNS, review, now: NOW, rand });
    expect(plan.phrases).toHaveLength(WALL_WORDS + 1);
    expect(plan.phrases[plan.phrases.length - 1]).toBe(FINAL_PHRASE);
    // the word that holds the learner's shakiest sign is on the wall
    expect(plan.phrases.map((p) => p.id)).toContain("ss");
    expect(plan.stations.every((s) => s.kind === "read" && !s.teach)).toBe(true);
    plan.stations.forEach((s) => expect(s.options).toContain(signInfo(s.target).sound));
    expect(plan.newSigns).toEqual([]);
    // Khufu's chick comes round twice: one station answers for both places
    const khufu = plan.phrases.length - 1;
    const [, w1, , w2] = FINAL_PHRASE.sockets;
    expect(stationOfSocket(plan, khufu, w1)).toBe(stationOfSocket(plan, khufu, w2));
    expect(stationOfSocket(plan, khufu, w1)).toBeGreaterThanOrEqual(0);
  });

  it("is not short of room away from the causeway: every sign of both words is asked for", () => {
    // ḥnqt and ḫt: six signs on the causeway would be the limit; the buried wall takes them all, plus the silent picture
    const plan = planLevel({ level: 5, name: "", known: [], review: null, now: NOW, rand });
    expect(plan.spec.layout).toBe("brush");
    expect(plan.stations.filter((s) => s.kind === "sign").map((s) => s.target)).toEqual(["𓎛", "𓈖", "𓈎", "𓏏", "𓐍", "𓏏"]);
    expect(plan.stations[plan.stations.length - 1].kind).toBe("det");
    expect(plan.reviews).toEqual([]);
  });

  it("makes the market about silent pictures: one after each word, three stalls to choose from, and old orders to finish", () => {
    const plan = planLevel({ level: 4, name: "", known: ALL_SIGNS, review: null, now: NOW, rand });
    expect(plan.spec.layout).toBe("market");
    expect(plan.stations.map((s) => s.kind)).toEqual(["sign", "sign", "det", "sign", "sign", "sign", "det"]);
    const dets = plan.stations.filter((s) => s.kind === "det");
    expect(dets.map((d) => d.phrase)).toEqual([0, 1]);
    dets.forEach((d) => {
      expect(d.options).toHaveLength(3);
      expect(new Set(d.options).size).toBe(3);
      expect(d.options).toContain(d.target);
    });
    const orders = plan.reviews.filter((r) => r.kind === "det");
    expect(orders).toHaveLength(MARKET_ORDERS);
    orders.forEach((o) => {
      expect(o.options).toContain(o.sound);
      expect(new Set(o.options).size).toBe(3);
      expect(o.word?.translit.length).toBeGreaterThan(0);
    });
    // the gate stays shut until the old orders are filled too
    const none = plan.reviews.map(() => null);
    expect(allDone(plan, plan.stations.length, none)).toBe(false);
    expect(allDone(plan, plan.stations.length, plan.reviews.map(() => "wrong" as const))).toBe(true);
    // everywhere else reviews are optional
    const river = planLevel({ level: 7, name: "", known: ALL_SIGNS, review: null, now: NOW, rand });
    expect(river.reviews.length).toBe(LAYOUTS.felucca.reviews);
    expect(allDone(river, river.stations.length, river.reviews.map(() => null))).toBe(true);
  });

  it("brings more old signs back in the passage, the review level", () => {
    const plan = planLevel({ level: 6, name: "", known: ALL_SIGNS, review: null, now: NOW, rand });
    expect(plan.spec.layout).toBe("passage");
    expect(plan.reviews).toHaveLength(LAYOUTS.passage.reviews);
    expect(new Set(plan.reviews.map((r) => r.sign)).size).toBe(plan.reviews.length);
  });

  it("turns a spelling station round for the buried wall: the sign is shown and sounds are offered", () => {
    const plan = planLevel({ level: 5, name: "", known: ["𓈖", "𓏏", "𓂋", "𓅓"], review: null, now: NOW, rand });
    const st = plan.stations.find((s) => s.target === "𓈖")!;
    const choices = soundChoices(st);
    expect(choices.map((c) => c.sound)).toContain("n");
    expect(new Set(choices.map((c) => c.sound)).size).toBe(choices.length);
    expect(choices.find((c) => c.sound === "n")?.option).toBe("𓈖");
  });

  it("carves a known word in a column for the tomb, with its reading and the same signs read upside down", () => {
    const col = columnWord(WORDS.slice(0, 4), rand)!;
    expect(col.signs.length).toBeGreaterThanOrEqual(2);
    expect(col.right).toBe(col.signs.map((s) => signInfo(s).sound).join(" "));
    expect(col.wrong).toBe(col.right.split(" ").reverse().join(" "));
    expect(col.wrong).not.toBe(col.right);
    expect(columnWord([], rand)).toBeNull();
  });

  it("says what needs saying about a word that starts with a sign outside the alphabet", () => {
    const nfr = phraseFromWord(WORDS.find((w) => w.id === "nfr")!);
    expect(nfr.note).toMatch(/already in place/);
    expect(nfr.note).toContain("“f” and “r”");
    expect(phraseFromWord(WORDS[0]).note).toBeUndefined();
  });

  it("follows the learner from the first word to the second", () => {
    const plan = planLevel({ level: 1, name: "", known: [], review: null, now: NOW, rand });
    expect(currentPhrase(plan, 0)).toBe(0);
    expect(currentPhrase(plan, 2)).toBe(1);
    expect(currentPhrase(plan, 99)).toBe(1);
  });

  it("files a clean recall as good and a wrong pick as a lapse", () => {
    expect(qualityAfterRun(0)).toBe(4);
    expect(qualityAfterRun(2)).toBe(2);
  });
});

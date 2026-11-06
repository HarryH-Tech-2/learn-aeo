import { describe, expect, it } from "vitest";
import {
  analyzeAnswer,
  answerKey,
  citesDomain,
  firstMention,
  normalizeDomain,
  pct,
  runsToCsv,
  scoreRun,
  splitNames,
  splitPrompts,
  type Brand,
  type Setup,
} from "@/lib/share-of-voice";

const brand = (name: string, aliases: string[] = [], domain = ""): Brand => ({ name, aliases, domain });

describe("parsing input", () => {
  it("splits names on commas and lines, dropping blanks and repeats", () => {
    expect(splitNames(" Acme, acme Cloud\n\nACME ,Widgets ")).toEqual(["Acme", "acme Cloud", "Widgets"]);
  });

  it("splits prompts one per line, without blanks or repeats", () => {
    expect(splitPrompts("best tea\n\n best tea \nloose leaf tea")).toEqual(["best tea", "loose leaf tea"]);
  });

  it("normalizes a typed domain to a bare host", () => {
    expect(normalizeDomain("https://www.Example.com/path?q=1")).toBe("example.com");
    expect(normalizeDomain("shop.example.co.uk:443")).toBe("shop.example.co.uk");
    expect(normalizeDomain("not a domain")).toBe("");
    expect(normalizeDomain("")).toBe("");
  });
});

describe("finding mentions", () => {
  it("matches a name or alias as a whole word, ignoring case", () => {
    const b = brand("Larkfield Tea", ["Larkfield"]);
    expect(firstMention("Try larkfield for loose leaf.", b)).toBe(4);
    expect(firstMention("Larkfieldian tea is not it.", b)).toBe(-1);
  });

  it("matches a name across a line break or double space", () => {
    expect(firstMention("Larkfield\nTea sells blends", brand("Larkfield Tea"))).toBe(0);
  });

  it("treats regex characters in a name literally", () => {
    expect(firstMention("We like C++ (and C#).", brand("C++"))).toBe(8);
    expect(firstMention("We like Cxx.", brand("C++"))).toBe(-1);
  });

  it("handles accented names and words next to them", () => {
    expect(firstMention("Le Thé Café est bon.", brand("Thé Café"))).toBe(3);
    expect(firstMention("ThéCafé", brand("Thé"))).toBe(-1);
  });
});

describe("finding citations", () => {
  it("matches the domain bare, in a URL and as a subdomain", () => {
    expect(citesDomain("Source: example.com", "example.com")).toBe(true);
    expect(citesDomain("[1] https://blog.example.com/post", "https://www.example.com")).toBe(true);
    expect(citesDomain("(EXAMPLE.COM)", "example.com")).toBe(true);
  });

  it("doesn't match a longer host that contains it", () => {
    expect(citesDomain("notexample.com", "example.com")).toBe(false);
    expect(citesDomain("example.com.au", "example.com")).toBe(false);
    expect(citesDomain("my-example.com", "example.com")).toBe(false);
  });

  it("ends a match at the end of a sentence", () => {
    expect(citesDomain("Read more at example.com.", "example.com")).toBe(true);
  });

  it("never matches without a domain", () => {
    expect(citesDomain("anything", "")).toBe(false);
  });
});

describe("an answer", () => {
  it("lists brands in the order they first appear, and the sites it cites", () => {
    const brands = [brand("Larkfield Tea", [], "larkfieldtea.example"), brand("Brewhouse"), brand("Leafly", [], "leafly.example")];
    const r = analyzeAnswer("Brewhouse is popular, but Larkfield Tea (larkfieldtea.example) wins on taste.", brands);
    expect(r.mentioned).toEqual(["Brewhouse", "Larkfield Tea"]);
    expect(r.cited).toEqual(["Larkfield Tea"]);
  });
});

describe("scoring a run", () => {
  const setup: Setup = {
    brands: [brand("Larkfield", [], "larkfield.example"), brand("Brewhouse", ["BH"]), brand("Leafly")],
    prompts: ["best loose leaf tea", "tea subscription uk"],
    platforms: ["ChatGPT", "Perplexity"],
  };
  const answers = {
    [answerKey(0, "ChatGPT")]: "Larkfield and Brewhouse are good. Larkfield again. See larkfield.example",
    [answerKey(0, "Perplexity")]: "BH tops the list, then Leafly.",
    [answerKey(1, "ChatGPT")]: "Larkfield runs a subscription.",
    [answerKey(1, "Perplexity")]: "   ",
  };
  const r = scoreRun(setup, answers);
  const by = Object.fromEntries(r.brands.map((b) => [b.name, b]));

  it("counts only answers that were pasted", () => {
    expect(r.answersChecked).toBe(3);
    expect(r.answers.map((a) => a.platform)).toEqual(["ChatGPT", "Perplexity", "ChatGPT"]);
  });

  it("counts a brand once per answer", () => {
    expect(by.Larkfield.mentions).toBe(2);
    expect(by.Brewhouse.mentions).toBe(2);
    expect(by.Leafly.mentions).toBe(1);
  });

  it("uses the course's definitions of the three rates", () => {
    // 5 mentions in all across the 3 answers
    expect(by.Larkfield.mentionRate).toBeCloseTo(2 / 3);
    expect(by.Larkfield.citationRate).toBeCloseTo(1 / 3);
    expect(by.Larkfield.shareOfVoice).toBeCloseTo(2 / 5);
    expect(r.brands.reduce((n, b) => n + b.shareOfVoice, 0)).toBeCloseTo(1);
  });

  it("counts who is named first", () => {
    expect(by.Larkfield.namedFirst).toBe(2);
    expect(by.Brewhouse.namedFirst).toBe(1);
  });

  it("breaks the user's brand down by platform", () => {
    expect(r.byPlatform).toEqual([
      { platform: "ChatGPT", answers: 2, mentionRate: 1, shareOfVoice: 2 / 3 },
      { platform: "Perplexity", answers: 1, mentionRate: 0, shareOfVoice: 0 },
    ]);
  });

  it("scores zero, not NaN, with no answers", () => {
    const empty = scoreRun(setup, {});
    expect(empty.answersChecked).toBe(0);
    expect(empty.brands.every((b) => b.mentionRate === 0 && b.shareOfVoice === 0)).toBe(true);
    expect(empty.byPlatform).toEqual([]);
  });

  it("skips brands with no name", () => {
    expect(scoreRun({ ...setup, brands: [...setup.brands, brand("  ")] }, answers).brands).toHaveLength(3);
  });
});

describe("output", () => {
  it("formats a percentage", () => {
    expect(pct(0.284)).toBe("28%");
    expect(pct(0)).toBe("0%");
  });

  it("writes saved runs as CSV, quoting awkward cells", () => {
    const csv = runsToCsv([
      {
        id: "1",
        date: "2026-11-06",
        label: 'Week 1, "baseline"',
        result: {
          answersChecked: 3,
          brands: [{ name: "Larkfield", mentions: 2, citations: 1, namedFirst: 2, mentionRate: 2 / 3, citationRate: 1 / 3, shareOfVoice: 0.4 }],
        },
      },
    ]);
    const [head, row] = csv.split("\n");
    expect(head).toBe("date,label,brand,answers_checked,mentions,citations,named_first,mention_rate,citation_rate,share_of_voice");
    expect(row).toBe('2026-11-06,"Week 1, ""baseline""",Larkfield,3,2,1,2,0.667,0.333,0.400');
  });
});

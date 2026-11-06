import { describe, expect, it } from "vitest";
import { AI_BOTS, analyze, botsToCsv, classifyAgent, cleanPath, newParseState, parseLine, sortedBots, topPages } from "@/lib/bot-log";

const GPTBOT_UA = "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; GPTBot/1.3; +https://openai.com/gptbot";
const CLAUDE_UA = "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ClaudeBot/1.0; +claudebot@anthropic.com)";
const GOOGLEBOT_UA = "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)";
const BROWSER_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";

const combined = (ip: string, path: string, status: number, ua: string, time = "06/Nov/2026:10:00:00 +0000") =>
  `${ip} - - [${time}] "GET ${path} HTTP/1.1" ${status} 512 "-" "${ua}"`;

describe("classifying user agents", () => {
  it("knows the AI crawlers by their tokens", () => {
    expect(classifyAgent(GPTBOT_UA)?.token).toBe("GPTBot");
    expect(classifyAgent(CLAUDE_UA)?.token).toBe("ClaudeBot");
    expect(classifyAgent("Mozilla/5.0; compatible; OAI-SearchBot/1.0")?.token).toBe("OAI-SearchBot");
    expect(classifyAgent("Mozilla/5.0; compatible; ChatGPT-User/1.0")?.token).toBe("ChatGPT-User");
    expect(classifyAgent("Claude-SearchBot/1.0")?.token).toBe("Claude-SearchBot");
    expect(classifyAgent("perplexitybot/1.0")?.token).toBe("PerplexityBot");
  });

  it("tells search crawlers apart and ignores browsers", () => {
    expect(classifyAgent(GOOGLEBOT_UA)?.kind).toBe("search-engine");
    expect(classifyAgent("Mozilla/5.0 (compatible; bingbot/2.0)")?.token).toBe("bingbot");
    expect(classifyAgent(BROWSER_UA)).toBeNull();
  });

  it("doesn't take Applebot-Extended (a robots.txt token only) for a crawler, but knows Applebot", () => {
    expect(AI_BOTS.map((b) => b.token)).not.toContain("Applebot-Extended");
    expect(AI_BOTS.map((b) => b.token)).not.toContain("Google-Extended");
    expect(classifyAgent("Mozilla/5.0 (Applebot/0.1)")?.token).toBe("Applebot");
  });

  it("matches whole tokens only", () => {
    expect(classifyAgent("NotGPTBotReally")).toBeNull();
  });
});

describe("paths", () => {
  it("drops the query string and keeps only the path of a full URL", () => {
    expect(cleanPath("/blog/post?utm_source=x#top")).toBe("/blog/post");
    expect(cleanPath("https://www.example.com/a/b?c=1")).toBe("/a/b");
    expect(cleanPath("https://www.example.com")).toBe("/");
    expect(cleanPath("robots.txt")).toBe("/robots.txt");
  });
});

describe("parsing log formats", () => {
  it("reads the combined format, including the time zone", () => {
    const e = parseLine(combined("203.0.113.5", "/pricing?x=1", 200, GPTBOT_UA, "06/Nov/2026:10:00:00 +0100"), newParseState());
    expect(e).toMatchObject({ ip: "203.0.113.5", method: "GET", path: "/pricing", status: 200, ua: GPTBOT_UA });
    expect(new Date(e!.time!).toISOString()).toBe("2026-11-06T09:00:00.000Z");
  });

  it("reads Cloudflare-style JSON lines with a nanosecond timestamp", () => {
    const line = JSON.stringify({
      ClientIP: "198.51.100.7",
      ClientRequestMethod: "GET",
      ClientRequestURI: "/docs?page=2",
      EdgeResponseStatus: 404,
      ClientRequestUserAgent: CLAUDE_UA,
      EdgeStartTimestamp: 1793959200000000000,
    });
    const e = parseLine(line, newParseState());
    expect(e).toMatchObject({ ip: "198.51.100.7", path: "/docs", status: 404, ua: CLAUDE_UA });
    expect(e!.time).toBe(1793959200000);
  });

  it("reads JSON with nested request and response objects", () => {
    const line = JSON.stringify({ timestamp: "2026-11-06T10:00:00Z", request: { path: "/a", userAgent: GPTBOT_UA, method: "GET" }, response: { status: 301 } });
    expect(parseLine(line, newParseState())).toMatchObject({ path: "/a", status: 301, ua: GPTBOT_UA });
  });

  it("reads a W3C (IIS) log using its #Fields header", () => {
    const state = newParseState();
    expect(parseLine("#Fields: date time c-ip cs-method cs-uri-stem sc-status cs(User-Agent)", state)).toBeNull();
    const e = parseLine("2026-11-06 10:00:00 192.0.2.1 GET /about 200 Mozilla/5.0+(compatible;+GPTBot/1.3)", state);
    expect(e).toMatchObject({ ip: "192.0.2.1", path: "/about", status: 200, ua: "Mozilla/5.0 (compatible; GPTBot/1.3)" });
    expect(e!.time).toBe(Date.UTC(2026, 10, 6, 10));
  });

  it("returns null for lines it can't read", () => {
    expect(parseLine("hello world", newParseState())).toBeNull();
    expect(parseLine("{not json", newParseState())).toBeNull();
    expect(parseLine("", newParseState())).toBeNull();
  });
});

describe("analysis", () => {
  const log = [
    combined("203.0.113.5", "/robots.txt", 200, GPTBOT_UA),
    combined("203.0.113.5", "/pricing", 200, GPTBOT_UA, "06/Nov/2026:11:00:00 +0000"),
    combined("203.0.113.6", "/pricing", 200, GPTBOT_UA),
    combined("198.51.100.7", "/old-page", 404, CLAUDE_UA),
    combined("198.51.100.7", "/old-page", 404, CLAUDE_UA),
    combined("198.51.100.8", "/api/x", 503, CLAUDE_UA),
    combined("66.249.66.1", "/old-page", 404, GOOGLEBOT_UA),
    combined("192.0.2.9", "/", 200, BROWSER_UA),
    "garbage line",
    "",
  ].join("\n");
  const a = analyze(log);
  const { ai, search } = sortedBots(a);

  it("counts lines, parsed lines and the time range", () => {
    expect(a.lines).toBe(9);
    expect(a.parsed).toBe(8);
    expect(new Date(a.last!).toISOString()).toBe("2026-11-06T11:00:00.000Z");
  });

  it("groups hits per bot, with status classes, pages and IPs", () => {
    expect(ai.map((s) => s.bot.token)).toEqual(["GPTBot", "ClaudeBot"]);
    const gpt = ai[0];
    expect(gpt).toMatchObject({ hits: 3, ok: 3, clientErrors: 0 });
    expect(gpt.pages.get("/pricing")).toBe(2);
    expect(gpt.ips.size).toBe(2);
    expect(gpt.robotsTxt).toEqual({ hits: 1, lastStatus: 200 });
    expect(ai[1]).toMatchObject({ hits: 3, clientErrors: 2, serverErrors: 1 });
    expect(search.map((s) => s.bot.token)).toEqual(["Googlebot"]);
  });

  it("lists errors AI bots hit, but not search crawlers' errors", () => {
    expect(a.errors.get("404 /old-page")).toMatchObject({ status: 404, hits: 2 });
    expect([...a.errors.get("404 /old-page")!.bots]).toEqual(["ClaudeBot"]);
    expect(a.errors.get("503 /api/x")?.hits).toBe(1);
  });

  it("ranks the pages AI bots fetched", () => {
    expect(topPages(ai)[0]).toEqual({ path: "/old-page", hits: 2, bots: ["ClaudeBot"] });
    expect(topPages(ai).find((p) => p.path === "/pricing")).toEqual({ path: "/pricing", hits: 2, bots: ["GPTBot"] });
  });

  it("writes a per-bot CSV", () => {
    const [head, first] = botsToCsv(a).split("\n");
    expect(head.split(",")[0]).toBe("bot");
    expect(first.startsWith("GPTBot,OpenAI,training,3,2,2,3,0,0,0,1,")).toBe(true);
  });
});

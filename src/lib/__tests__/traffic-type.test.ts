import { describe, it, expect } from "vitest";
import { classifyTraffic, gaCountryBlockScript, trafficTypeScript, type TrafficSignals } from "@/lib/traffic-type";

const CHROME_WIN = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36";
const IPHONE = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1";
const WEBVIEW = "Mozilla/5.0 (Linux; Android 13; Pixel 5 Build/TQ3A; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/120.0.0.0 Mobile Safari/537.36";

function person(over: Partial<TrafficSignals> = {}): TrafficSignals {
  return { webdriver: false, userAgent: CHROME_WIN, languages: 2, screenWidth: 1920, screenHeight: 1080, outerWidth: 1600, outerHeight: 900, onScreen: true, internal: false, ...over };
}

describe("classifyTraffic", () => {
  it("leaves ordinary visitors alone", () => {
    expect(classifyTraffic(person())).toBeNull();
    expect(classifyTraffic(person({ userAgent: IPHONE, screenWidth: 390, screenHeight: 844, outerWidth: 0, outerHeight: 0 }))).toBeNull();
    // an in-app browser on a real phone
    expect(classifyTraffic(person({ userAgent: WEBVIEW, screenWidth: 412, screenHeight: 915 }))).toBeNull();
    // a phone whose name has "bot" in it
    expect(classifyTraffic(person({ userAgent: CHROME_WIN.replace("Windows NT 10.0", "Linux; Android 12; CUBOT NOTE 9") }))).toBeNull();
  });

  it("marks our own browsers first", () => {
    expect(classifyTraffic(person({ internal: true }))).toBe("internal");
    expect(classifyTraffic(person({ internal: true, webdriver: true }))).toBe("internal");
  });

  it("marks automated browsers", () => {
    expect(classifyTraffic(person({ webdriver: true }))).toBe("bot");
    expect(classifyTraffic(person({ userAgent: CHROME_WIN.replace("Chrome/", "HeadlessChrome/") }))).toBe("bot");
    expect(classifyTraffic(person({ userAgent: "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" }))).toBe("bot");
    expect(classifyTraffic(person({ languages: 0 }))).toBe("bot");
    expect(classifyTraffic(person({ outerWidth: 0, outerHeight: 0 }))).toBe("bot");
  });

  it("leaves a sizeless window alone when it is a background tab or a prerendered page", () => {
    expect(classifyTraffic(person({ outerWidth: 0, outerHeight: 0, onScreen: false }))).toBeNull();
  });

  it("marks the screens only the silent visits came on", () => {
    expect(classifyTraffic(person({ screenWidth: 1280, screenHeight: 1200 }))).toBe("bot");
    expect(classifyTraffic(person({ screenWidth: 1366, screenHeight: 1366 }))).toBe("bot");
    expect(classifyTraffic(person({ userAgent: WEBVIEW, screenWidth: 393, screenHeight: 851 }))).toBe("bot");
    expect(classifyTraffic(person({ userAgent: WEBVIEW, screenWidth: 800, screenHeight: 600 }))).toBe("bot");
    // the same phone size in a real browser is a person
    expect(classifyTraffic(person({ userAgent: WEBVIEW.replace("; wv)", ")"), screenWidth: 393, screenHeight: 851 }))).toBeNull();
  });
});

describe("gaCountryBlockScript", () => {
  function run(cookie: string) {
    const window: Record<string, unknown> = {};
    new Function("window", "document", gaCountryBlockScript("G-TEST"))(window, { cookie });
    return window["ga-disable-G-TEST"] === true;
  }

  it("switches GA4 off for Singapore and China, and for nobody else", () => {
    expect(run("aeo_cc=SG")).toBe(true);
    expect(run("aeo_home=3d; aeo_cc=CN; aeo_vid=abc")).toBe(true);
    expect(run("aeo_cc=GB")).toBe(false);
    expect(run("aeo_cc=HK")).toBe(false);
    expect(run("")).toBe(false);
    expect(run("x_aeo_cc=SG")).toBe(false);
  });
});

describe("trafficTypeScript", () => {
  function run(env: { search?: string; stored?: string | null; webdriver?: boolean; screen?: [number, number] }) {
    const store = new Map<string, string>();
    if (env.stored) store.set("aeo_internal", env.stored);
    const window: Record<string, unknown> = { outerWidth: 1600, outerHeight: 900 };
    const localStorage = {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, v),
      removeItem: (k: string) => void store.delete(k),
    };
    const navigator = { webdriver: env.webdriver ?? false, userAgent: CHROME_WIN, languages: ["en-GB"] };
    const screen = { width: env.screen?.[0] ?? 1920, height: env.screen?.[1] ?? 1080 };
    new Function("window", "localStorage", "navigator", "screen", "location", trafficTypeScript())(window, localStorage, navigator, screen, { search: env.search ?? "" });
    return { type: window.__lhTraffic, stored: store.get("aeo_internal") ?? null };
  }

  it("stands on its own and classifies", () => {
    expect(run({}).type).toBeNull();
    expect(run({ webdriver: true }).type).toBe("bot");
    expect(run({ screen: [1280, 1200] }).type).toBe("bot");
  });

  it("?aeo_internal=1 marks the browser as ours, =0 undoes it", () => {
    expect(run({ search: "?aeo_internal=1" })).toEqual({ type: "internal", stored: "1" });
    expect(run({ stored: "1" }).type).toBe("internal");
    expect(run({ search: "?x=1&aeo_internal=0", stored: "1" })).toEqual({ type: null, stored: null });
  });
});

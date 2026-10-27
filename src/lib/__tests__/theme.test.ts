import { describe, it, expect } from "vitest";
import { resolveInitialTheme, THEME_INIT_SCRIPT, THEME_STORAGE_KEY, MOBILE_MAX_WIDTH } from "@/lib/theme";

describe("resolveInitialTheme", () => {
  it("defaults to light on phone-sized viewports", () => {
    expect(resolveInitialTheme(null, 375)).toBe("light");
    expect(resolveInitialTheme(null, MOBILE_MAX_WIDTH)).toBe("light");
  });
  it("defaults to dark on larger viewports", () => {
    expect(resolveInitialTheme(null, MOBILE_MAX_WIDTH + 1)).toBe("dark");
    expect(resolveInitialTheme(null, 1440)).toBe("dark");
  });
  it("always honours a saved choice", () => {
    expect(resolveInitialTheme("dark", 375)).toBe("dark");
    expect(resolveInitialTheme("light", 1440)).toBe("light");
  });
  it("ignores garbage in storage", () => {
    expect(resolveInitialTheme("banana", 375)).toBe("light");
    expect(resolveInitialTheme("banana", 1440)).toBe("dark");
  });
});

describe("THEME_INIT_SCRIPT", () => {
  function run(stored: string | null, width: number): boolean {
    const classes = new Set<string>();
    const fakeWindow = {
      innerWidth: width,
      localStorage: { getItem: () => stored },
      document: { documentElement: { classList: { add: (c: string) => classes.add(c), remove: (c: string) => classes.delete(c) } } },
    };
    // Evaluate the snippet with the fake globals in scope.
    new Function("window", "localStorage", "document", THEME_INIT_SCRIPT)(
      fakeWindow,
      fakeWindow.localStorage,
      fakeWindow.document
    );
    return classes.has("light");
  }

  it("reads the prefixed storage key", () => {
    expect(THEME_STORAGE_KEY).toBe("aeo_theme");
    const keys: string[] = [];
    const ls = { getItem: (k: string) => (keys.push(k), "light") };
    const doc = { documentElement: { classList: { add: () => {}, remove: () => {} } } };
    new Function("window", "localStorage", "document", THEME_INIT_SCRIPT)({ innerWidth: 1440 }, ls, doc);
    expect(keys).toEqual(["aeo_theme"]);
  });

  it("matches resolveInitialTheme for every case", () => {
    for (const stored of [null, "light", "dark", "banana"]) {
      for (const width of [320, MOBILE_MAX_WIDTH, MOBILE_MAX_WIDTH + 1, 1920]) {
        expect(run(stored, width), `stored=${stored} width=${width}`).toBe(
          resolveInitialTheme(stored, width) === "light"
        );
      }
    }
  });
});

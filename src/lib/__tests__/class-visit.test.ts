import { afterEach, describe, expect, it, vi } from "vitest";
import { classPlatform, classVisit } from "@/lib/class-visit";

function stubSession(initial: Record<string, string> = {}) {
  const store = new Map(Object.entries(initial));
  vi.stubGlobal("sessionStorage", {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
  });
  return store;
}

afterEach(() => vi.unstubAllGlobals());

describe("classPlatform", () => {
  it("knows a school's learning platform from the referrer", () => {
    expect(classPlatform("https://mnps.schoology.com/course/123/materials")).toBe("schoology.com");
    expect(classPlatform("https://classroom.google.com/")).toBe("classroom.google.com");
    expect(classPlatform("https://app.epraise.co.uk/x")).toBe("epraise.co.uk");
    expect(classPlatform("https://eclass03.sch.gr/modules/link/")).toBe("sch.gr");
    expect(classPlatform("https://school.instructure.com/courses/1")).toBe("instructure.com");
  });

  it("is not fooled by search engines, look-alike domains or nothing at all", () => {
    expect(classPlatform("https://www.google.com/")).toBeNull();
    expect(classPlatform("https://accounts.google.com/")).toBeNull();
    expect(classPlatform("https://notschoology.com/")).toBeNull();
    expect(classPlatform("https://schoology.com.evil.test/")).toBeNull();
    expect(classPlatform("")).toBeNull();
    expect(classPlatform(null)).toBeNull();
    expect(classPlatform("not a url")).toBeNull();
  });
});

describe("classVisit", () => {
  it("remembers the platform for the tab once the referrer is our own site", () => {
    const store = stubSession();
    expect(classVisit("https://mnps.schoology.com/x")).toBe("schoology.com");
    expect(store.get("lh_class_visit")).toBe("schoology.com");
    expect(classVisit("https://www.learnhieroglyphics.com/translate-name-to-hieroglyphics")).toBe("schoology.com");
  });

  it("is null for an ordinary visit, and survives blocked storage", () => {
    stubSession();
    expect(classVisit("https://www.bing.com/")).toBeNull();
    vi.stubGlobal("sessionStorage", {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
    });
    expect(classVisit("https://mnps.schoology.com/x")).toBe("schoology.com");
    expect(classVisit("")).toBeNull();
  });
});

import { describe, it, expect, vi, afterEach } from "vitest";
import { fetchJson } from "@/lib/fetch-json";

afterEach(() => vi.unstubAllGlobals());

function stubFetch(status: number, body: unknown) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response(JSON.stringify(body), { status }))
  );
}

describe("fetchJson", () => {
  it("resolves with the parsed body on 2xx", async () => {
    stubFetch(200, { lessons: {}, xp: 10 });
    await expect(fetchJson("/api/progress")).resolves.toEqual({ lessons: {}, xp: 10 });
  });

  it("rejects on a non-2xx status instead of returning the error body", async () => {
    // Regression: /api/progress returned 401 {error:"Unauthorized"} and the
    // dashboard stored that object as progress, then crashed on .lessons[id].
    stubFetch(401, { error: "Unauthorized" });
    await expect(fetchJson("/api/progress")).rejects.toMatchObject({ status: 401 });
  });

  it("rejects on a 500 too", async () => {
    stubFetch(500, { error: "boom" });
    await expect(fetchJson("/api/progress")).rejects.toMatchObject({ status: 500 });
  });
});

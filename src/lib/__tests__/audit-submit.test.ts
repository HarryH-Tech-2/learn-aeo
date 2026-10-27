import { describe, it, expect, vi, afterEach } from "vitest";
import { submitAuditResult } from "@/lib/audit-submit";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

type Call = { url: string; body: unknown; at: number };

/** fetch stub: /api/progress/complete resolves only when `release` is called. */
function stubFetch(completeStatus = 200) {
  const calls: Call[] = [];
  let release!: () => void;
  const gate = new Promise<void>((r) => (release = r));
  let tick = 0;
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, init?: RequestInit) => {
      calls.push({ url, body: JSON.parse(String(init?.body)), at: tick++ });
      if (url === "/api/progress/complete") {
        await gate;
        return new Response(JSON.stringify({ ok: true, offer: null }), { status: completeStatus });
      }
      return new Response(JSON.stringify({ awarded: [] }), { status: 200 });
    })
  );
  return { calls, release };
}

describe("submitAuditResult", () => {
  it("checks badges only after the audit result is saved", async () => {
    const { calls, release } = stubFetch();
    const done = submitAuditResult("lesson-a", 9, 10);
    await new Promise((r) => setTimeout(r, 10));
    expect(calls.map((c) => c.url)).toEqual(["/api/progress/complete"]);
    release();
    await done;
    expect(calls.map((c) => c.url)).toEqual(["/api/progress/complete", "/api/badges/check"]);
    expect(calls[0].body).toEqual({ lessonId: "lesson-a", score: 9, totalQuestions: 10 });
    expect(calls[1].body).toEqual({ lessonId: "lesson-a", score: 9, total: 10 });
  });

  it("hands the saved response to onSaved", async () => {
    const { release } = stubFetch();
    const onSaved = vi.fn();
    release();
    await submitAuditResult("lesson-a", 9, 10, onSaved);
    expect(onSaved).toHaveBeenCalledWith({ ok: true, offer: null });
  });

  it("logs a refused save and skips the badge check", async () => {
    const { calls, release } = stubFetch(403);
    const err = vi.spyOn(console, "error").mockImplementation(() => {});
    release();
    await submitAuditResult("lesson-a", 9, 10);
    expect(calls.map((c) => c.url)).toEqual(["/api/progress/complete"]);
    expect(err).toHaveBeenCalled();
  });

  it("logs a failed badge check instead of swallowing it", async () => {
    const err = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) =>
        url === "/api/badges/check"
          ? new Response("{}", { status: 400 })
          : new Response(JSON.stringify({ ok: true }), { status: 200 })
      )
    );
    await submitAuditResult("lesson-a", 9, 10);
    expect(err).toHaveBeenCalledWith("Badge check failed", expect.objectContaining({ lessonId: "lesson-a" }));
  });
});

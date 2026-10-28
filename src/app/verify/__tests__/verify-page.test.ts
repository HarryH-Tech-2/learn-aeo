import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

const notFound = vi.hoisted(() =>
  vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  })
);
vi.mock("next/navigation", () => ({ notFound }));

const findUnique = vi.hoisted(() => vi.fn());
vi.mock("@/lib/db", () => ({ prisma: { certificate: { findUnique } } }));

import VerifyPage, { metadata } from "@/app/verify/[code]/page";

const render = async (code: string) =>
  renderToStaticMarkup(await VerifyPage({ params: Promise.resolve({ code }) }));

describe("/verify/[code]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("is not indexed", () => {
    expect((metadata.robots as { index: boolean }).index).toBe(false);
  });

  it("404s on a malformed code without touching the database", async () => {
    await expect(render("bad")).rejects.toThrow("NEXT_NOT_FOUND");
    await expect(render("x".repeat(500))).rejects.toThrow("NEXT_NOT_FOUND");
    expect(findUnique).not.toHaveBeenCalled();
  });

  it("404s on an unknown valid code", async () => {
    findUnique.mockResolvedValue(null);
    await expect(render("ABCDEFGH23")).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("shows first name, last initial, course and issue date", async () => {
    findUnique.mockResolvedValue({ code: "ABCDEFGH23", name: "Jane Smith", issuedAt: new Date("2026-10-28T12:00:00Z") });
    const html = await render("ABCDEFGH23");
    expect(html).toContain("Verified");
    expect(html).toContain("Jane S.");
    expect(html).not.toContain("Smith");
    expect(html).toContain("Answer Engine Optimization");
    expect(html).toContain("Issued October 28, 2026");
  });
});

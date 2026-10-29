import { describe, it, expect, vi, beforeEach } from "vitest";

const findUnique = vi.fn();
vi.mock("@/lib/db", () => ({ prisma: { certificate: { findUnique: (...a: unknown[]) => findUnique(...a) } } }));
vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
  redirect: (to: string) => {
    throw new Error(`REDIRECT:${to}`);
  },
}));

import VerifyPage from "@/app/verify/[code]/page";

const page = (code: string) => VerifyPage({ params: Promise.resolve({ code }) });

describe("/verify/[code]", () => {
  beforeEach(() => findUnique.mockReset());

  it("redirects a lowercase code to the uppercase one before looking it up", async () => {
    await expect(page("abcdefgh23")).rejects.toThrow("REDIRECT:/verify/ABCDEFGH23");
    expect(findUnique).not.toHaveBeenCalled();
  });

  it("404s a malformed code without touching the database", async () => {
    await expect(page("not-a-code")).rejects.toThrow("NEXT_NOT_FOUND");
    expect(findUnique).not.toHaveBeenCalled();
  });
});

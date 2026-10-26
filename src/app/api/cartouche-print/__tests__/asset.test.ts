import { beforeEach, describe, expect, it, vi } from "vitest";

const mockRetrieve = vi.hoisted(() => vi.fn());
const mockBuildPdf = vi.hoisted(() => vi.fn().mockResolvedValue(new Uint8Array([0x25, 0x50, 0x44, 0x46])));

vi.mock("@/lib/stripe", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/stripe")>()),
  getStripe: vi.fn().mockReturnValue({ checkout: { sessions: { retrieve: mockRetrieve } } }),
}));
vi.mock("@/lib/cartouche-print-pdf", () => ({ buildCartouchePrintPdf: mockBuildPdf }));

import { NextRequest } from "next/server";
import { GET } from "@/app/api/cartouche-print/asset/route";
import { signAsset } from "@/lib/prodigi";

function get(query: string) {
  return GET(new NextRequest(`http://localhost/api/cartouche-print/asset?${query}`));
}

describe("GET /api/cartouche-print/asset", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXTAUTH_SECRET = "test-secret";
    delete process.env.PRODIGI_ASSET_SECRET;
    mockRetrieve.mockResolvedValue({
      id: "cs_test_print",
      payment_status: "paid",
      metadata: { product: "cartouche-print", name: "Harry", theme: "night", format: "print" },
    });
  });

  it("refuses without a session id or with a bad signature, before touching Stripe", async () => {
    expect((await get("")).status).toBe(400);
    expect((await get("session_id=cs_test_print&sig=nope")).status).toBe(403);
    expect((await get(`session_id=cs_test_print&sig=${signAsset("cs_test_other")}`)).status).toBe(403);
    expect(mockRetrieve).not.toHaveBeenCalled();
  });

  it("serves page one alone as a PDF for a paid, posted order", async () => {
    const res = await get(`session_id=cs_test_print&sig=${signAsset("cs_test_print")}`);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("application/pdf");
    expect(mockBuildPdf).toHaveBeenCalledWith("Harry", "night", { pages: "print", large: false });
    expect(new Uint8Array(await res.arrayBuffer()).slice(0, 4)).toEqual(new Uint8Array([0x25, 0x50, 0x44, 0x46]));
  });

  it("serves the family page for a family order: every name, still page one alone", async () => {
    mockRetrieve.mockResolvedValueOnce({
      id: "cs_test_print",
      payment_status: "paid",
      metadata: { product: "cartouche-print", name: "Harry", names: "Harry|Sally|Tom|Ann", theme: "temple", format: "framed" },
    });
    expect((await get(`session_id=cs_test_print&sig=${signAsset("cs_test_print")}`)).status).toBe(200);
    expect(mockBuildPdf).toHaveBeenCalledWith(["Harry", "Sally", "Tom", "Ann"], "temple", { pages: "print", large: false });
  });

  it("refuses a digital-only or unpaid order even with a good signature", async () => {
    mockRetrieve.mockResolvedValueOnce({ id: "cs_test_print", payment_status: "paid", metadata: { product: "cartouche-print", name: "Harry" } });
    expect((await get(`session_id=cs_test_print&sig=${signAsset("cs_test_print")}`)).status).toBe(403);
    mockRetrieve.mockResolvedValueOnce({ id: "cs_test_print", payment_status: "unpaid", metadata: { product: "cartouche-print", name: "Harry", format: "framed" } });
    expect((await get(`session_id=cs_test_print&sig=${signAsset("cs_test_print")}`)).status).toBe(403);
    expect(mockBuildPdf).not.toHaveBeenCalled();
  });
});

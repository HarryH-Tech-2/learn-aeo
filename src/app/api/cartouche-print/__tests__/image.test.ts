import { describe, it, expect, vi, beforeEach } from "vitest";

const mockRetrieve = vi.hoisted(() => vi.fn());
const mockRender = vi.hoisted(() => vi.fn().mockResolvedValue(Buffer.from([0xff, 0xd8, 0xff, 0xd9])));

vi.mock("@/lib/stripe", () => ({ getStripe: () => ({ checkout: { sessions: { retrieve: mockRetrieve } } }) }));
vi.mock("@/lib/cartouche-print-image", () => ({ renderCartouchePrintJpeg: mockRender }));

import { NextRequest } from "next/server";
import { GET } from "@/app/api/cartouche-print/image/route";

function get(sessionId?: string) {
  const q = sessionId === undefined ? "" : `?session_id=${sessionId}`;
  return GET(new NextRequest(`http://localhost/api/cartouche-print/image${q}`));
}

const session = (extra: Record<string, unknown> = {}) => ({
  id: "cs_test_image123",
  payment_status: "paid",
  metadata: { product: "cartouche-print", name: "Harry", theme: "papyrus", format: "image" },
  ...extra,
});

describe("GET /api/cartouche-print/image", () => {
  beforeEach(() => vi.clearAllMocks());

  it("needs a Checkout Session id that looks real", async () => {
    expect((await get()).status).toBe(400);
    expect((await get("nope")).status).toBe(400);
    expect(mockRetrieve).not.toHaveBeenCalled();
  });

  it("404s when Stripe does not know the session", async () => {
    mockRetrieve.mockRejectedValueOnce(new Error("No such checkout.session"));
    expect((await get("cs_test_missing1")).status).toBe(404);
  });

  it("refuses an unpaid session and a session for another product", async () => {
    mockRetrieve.mockResolvedValueOnce(session({ payment_status: "unpaid" }));
    expect((await get("cs_test_image123")).status).toBe(403);
    mockRetrieve.mockResolvedValueOnce(session({ metadata: { plan: "lifetime" } }));
    expect((await get("cs_test_image123")).status).toBe(403);
    expect(mockRender).not.toHaveBeenCalled();
  });

  it("serves the HD JPEG on the paper bought, as a download", async () => {
    mockRetrieve.mockResolvedValueOnce(session());
    const res = await get("cs_test_image123");
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("image/jpeg");
    expect(res.headers.get("content-disposition")).toBe('attachment; filename="harry-cartouche-papyrus-hd.jpg"');
    expect(mockRender).toHaveBeenCalledWith("Harry", "papyrus", "hd");
  });

  it("renders every name of a family order, and names the file for them all", async () => {
    mockRetrieve.mockResolvedValueOnce(session({ metadata: { product: "cartouche-print", name: "Harry", names: "Harry|Sally", theme: "papyrus", format: "image" } }));
    const res = await get("cs_test_image123");
    expect(res.status).toBe(200);
    expect(res.headers.get("content-disposition")).toBe('attachment; filename="harry-sally-cartouche-papyrus-hd.jpg"');
    expect(mockRender).toHaveBeenCalledWith(["Harry", "Sally"], "papyrus", "hd");
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";

const update = vi.hoisted(() => vi.fn(async () => ({ data: { id: "c1" }, error: null })));
vi.mock("resend", () => ({ Resend: class { contacts = { update }; } }));
vi.mock("@/lib/leads", () => ({ recordLead: vi.fn(async () => undefined) }));
vi.mock("@/lib/db", () => ({ prisma: { user: { updateMany: vi.fn(async () => ({ count: 1 })) } } }));

process.env.NEXTAUTH_SECRET ??= "test-secret";

import { NextRequest } from "next/server";
import { GET } from "@/app/api/email/unsubscribe/route";
import { leadUnsubscribeUrl } from "@/lib/unsubscribe";
import { recordLead } from "@/lib/leads";

describe("lead unsubscribe (?e=)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.RESEND_AUDIENCE_ID = "aud_1";
  });

  it("records the opt-out and unsubscribes the newsletter contact in the Resend audience", async () => {
    const url = leadUnsubscribeUrl("reader@example.com", "http://localhost:3000");
    const res = await GET(new NextRequest(url));
    expect(res.status).toBe(200);
    expect(recordLead).toHaveBeenCalledWith({ email: "reader@example.com", source: "no-more" });
    expect(update).toHaveBeenCalledWith({ audienceId: "aud_1", email: "reader@example.com", unsubscribed: true });
  });

  it("still confirms when no audience is configured", async () => {
    delete process.env.RESEND_AUDIENCE_ID;
    const res = await GET(new NextRequest(leadUnsubscribeUrl("reader@example.com", "http://localhost:3000")));
    expect(res.status).toBe(200);
    expect(update).not.toHaveBeenCalled();
  });

  it("rejects a bad token without touching anything", async () => {
    const res = await GET(new NextRequest("http://localhost:3000/api/email/unsubscribe?e=reader%40example.com&t=nope"));
    expect(res.status).toBe(400);
    expect(update).not.toHaveBeenCalled();
    expect(recordLead).not.toHaveBeenCalled();
  });
});

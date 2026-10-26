import { describe, it, expect, vi, beforeEach } from "vitest";

const mockSend = vi.hoisted(() =>
  vi.fn().mockResolvedValue({ data: { id: "em_1" }, error: null })
);
const mockContactsCreate = vi.hoisted(() => vi.fn().mockResolvedValue({}));
const mockUpsert = vi.hoisted(() => vi.fn().mockResolvedValue({}));

vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(function (this: {
    emails: { send: typeof mockSend };
    contacts: { create: typeof mockContactsCreate };
  }) {
    this.emails = { send: mockSend };
    this.contacts = { create: mockContactsCreate };
  }),
}));

vi.mock("@/lib/notify", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
  ownerEmail: () => "contact@learnhieroglyphics.com",
}));

vi.mock("@/lib/db", () => ({
  prisma: { emailLead: { upsert: mockUpsert } },
}));

import { POST } from "@/app/api/cartouche-email/route";

const PNG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";

function makeRequest(body: unknown): Request {
  return new Request("http://localhost/api/cartouche-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/cartouche-email", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.RESEND_FROM_EMAIL = "hello@example.com";
    process.env.RESEND_API_KEY = "test-key";
    delete process.env.RESEND_AUDIENCE_ID;
  });

  it("rejects an invalid email", async () => {
    const res = await POST(makeRequest({ email: "nope", name: "Harry", image: PNG }));
    expect(res.status).toBe(400);
    expect(mockSend).not.toHaveBeenCalled();
    expect(mockUpsert).not.toHaveBeenCalled();
  });

  it("rejects a missing name", async () => {
    const res = await POST(makeRequest({ email: "a@b.co", name: "  ", image: PNG }));
    expect(res.status).toBe(400);
  });

  it("rejects a non-PNG or oversized image", async () => {
    const bad = await POST(makeRequest({ email: "a@b.co", name: "Harry", image: "data:text/html;base64,AAAA" }));
    expect(bad.status).toBe(400);
    const huge = await POST(
      makeRequest({ email: "a@b.co", name: "Harry", image: "data:image/png;base64," + "A".repeat(2_100_000) })
    );
    expect(huge.status).toBe(400);
  });

  it("records the lead in our DB and emails the PNG with a UTM-tagged lesson link", async () => {
    const res = await POST(
      makeRequest({ email: " Harry@Example.com ", name: "Harry", glyphs: "𓉔𓄿𓂋𓇋", image: PNG })
    );
    expect(res.status).toBe(200);

    expect(mockUpsert).toHaveBeenCalledTimes(1);
    const upsertArg = mockUpsert.mock.calls[0][0];
    expect(upsertArg.where).toEqual({ email_source: { email: "harry@example.com", source: "cartouche" } });
    expect(upsertArg.create).toMatchObject({ email: "harry@example.com", source: "cartouche", name: "Harry" });

    expect(mockSend).toHaveBeenCalledTimes(1);
    const sendArg = mockSend.mock.calls[0][0];
    expect(sendArg.to).toBe("harry@example.com");
    expect(sendArg.attachments[0].filename).toBe("harry-cartouche.png");
    expect(sendArg.attachments[0].content).toBe(PNG.split(",")[1]);
    expect(sendArg.html).toContain("utm_source=cartouche-email");
    expect(sendArg.html).toContain("/get-started?");
  });

  it("still sends the email if recording the lead fails", async () => {
    mockUpsert.mockRejectedValueOnce(new Error("db down"));
    const res = await POST(makeRequest({ email: "a@b.co", name: "Ada", image: PNG }));
    expect(res.status).toBe(200);
    expect(mockSend).toHaveBeenCalledTimes(1);
  });

  it("adds the contact to a Resend audience when one is configured", async () => {
    process.env.RESEND_AUDIENCE_ID = "aud_1";
    await POST(makeRequest({ email: "a@b.co", name: "Ada", image: PNG }));
    expect(mockContactsCreate).toHaveBeenCalledWith({ audienceId: "aud_1", email: "a@b.co", unsubscribed: false });
  });

  it("returns 500 when Resend reports an error", async () => {
    mockSend.mockResolvedValueOnce({ data: null, error: { message: "boom" } });
    const res = await POST(makeRequest({ email: "a@b.co", name: "Ada", image: PNG }));
    expect(res.status).toBe(500);
  });
});

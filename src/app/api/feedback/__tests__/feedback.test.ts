import { describe, it, expect, vi, beforeEach } from "vitest";

const mockSend = vi.hoisted(() =>
  vi.fn().mockResolvedValue({ data: { id: "em_1" }, error: null })
);

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  authOptions: {},
}));

vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(function (this: {
    emails: { send: typeof mockSend };
  }) {
    this.emails = { send: mockSend };
  }),
}));

import { POST } from "@/app/api/feedback/route";
import { getServerSession } from "next-auth";

const mockedGetServerSession = vi.mocked(getServerSession);

function makeRequest(body: unknown): Request {
  return new Request("http://localhost/api/feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/feedback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.RESEND_FROM_EMAIL = "feedback@example.com";
    process.env.RESEND_API_KEY = "test-key";
  });

  it("returns 400 when message is empty", async () => {
    mockedGetServerSession.mockResolvedValue(null);

    const res = await POST(makeRequest({ message: "" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when message is whitespace only", async () => {
    mockedGetServerSession.mockResolvedValue(null);

    const res = await POST(makeRequest({ message: "   " }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when message exceeds max length", async () => {
    mockedGetServerSession.mockResolvedValue(null);

    const res = await POST(makeRequest({ message: "x".repeat(2001) }));
    expect(res.status).toBe(400);
  });

  it("sends feedback email and succeeds when authenticated", async () => {
    mockedGetServerSession.mockResolvedValue({
      user: { email: "user@example.com", name: "Harry" },
    });

    const res = await POST(
      makeRequest({
        message: "This is really good, but the video loads slowly.",
        rating: 4,
        page: "/dashboard",
      })
    );

    expect(res.status).toBe(200);
    expect(mockSend).toHaveBeenCalledOnce();

    const args = mockSend.mock.calls[0][0];
    // Owner notifications always go to the site mailbox, not the sender.
    expect(args.to).toBe("hello@learnaeo.com");
    expect(args.replyTo).toBe("user@example.com");
    expect(args.subject).toContain("4/5");
    expect(args.text).toContain("Harry");
    expect(args.text).toContain("user@example.com");
    expect(args.text).toContain("/dashboard");
    expect(args.text).toContain(
      "This is really good, but the video loads slowly."
    );
  });

  it("sends feedback without replyTo when anonymous", async () => {
    mockedGetServerSession.mockResolvedValue(null);

    const res = await POST(makeRequest({ message: "Love the site!" }));

    expect(res.status).toBe(200);
    const args = mockSend.mock.calls[0][0];
    expect(args.replyTo).toBeUndefined();
    expect(args.text).toContain("(anonymous)");
  });

  it("labels rating as not provided when missing or out of range", async () => {
    mockedGetServerSession.mockResolvedValue(null);

    await POST(makeRequest({ message: "No rating" }));
    expect(mockSend.mock.calls[0][0].text).toContain("Rating: (not provided)");
    expect(mockSend.mock.calls[0][0].subject).not.toContain("/5");

    mockSend.mockClear();
    await POST(makeRequest({ message: "Bad rating", rating: 99 }));
    expect(mockSend.mock.calls[0][0].text).toContain("Rating: (not provided)");
  });

  it("lets a signed-out visitor leave an email to be answered, and ignores one that is not an email", async () => {
    mockedGetServerSession.mockResolvedValue(null);
    await POST(makeRequest({ message: "Love it", page: "/gift", email: "anna@example.com" }));
    expect(mockSend.mock.calls[0][0].replyTo).toBe("anna@example.com");
    expect(mockSend.mock.calls[0][0].subject).toBe("Feedback from /gift");

    mockSend.mockClear();
    await POST(makeRequest({ message: "Hi", email: "not an email" }));
    expect(mockSend.mock.calls[0][0].replyTo).toBeUndefined();
  });

  it("returns 500 when email send fails", async () => {
    mockedGetServerSession.mockResolvedValue(null);
    mockSend.mockRejectedValueOnce(new Error("Resend down"));

    const res = await POST(makeRequest({ message: "hi" }));
    expect(res.status).toBe(500);
  });

  it("returns 500 when Resend refuses the send without throwing", async () => {
    mockedGetServerSession.mockResolvedValue(null);
    mockSend.mockResolvedValueOnce({ data: null, error: { name: "validation_error", message: "domain not verified" } });

    const res = await POST(makeRequest({ message: "hi" }));
    expect(res.status).toBe(500);
  });
});

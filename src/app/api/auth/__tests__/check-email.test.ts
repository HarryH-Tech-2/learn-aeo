import { describe, it, expect, vi, beforeEach } from "vitest";

const mockFindUnique = vi.hoisted(() => vi.fn());

vi.mock("@/lib/db", () => ({
  prisma: {
    user: {
      findUnique: mockFindUnique,
    },
  },
}));

import { POST } from "@/app/api/auth/check-email/route";

function makeRequest(body: unknown): Request {
  return new Request("http://localhost/api/auth/check-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/auth/check-email", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 when email is missing", async () => {
    const res = await POST(makeRequest({}) as never);
    expect(res.status).toBe(400);
  });

  it("returns 400 when email is not a string", async () => {
    const res = await POST(makeRequest({ email: 123 }) as never);
    expect(res.status).toBe(400);
  });

  it("returns exists: false for unknown users", async () => {
    mockFindUnique.mockResolvedValue(null);

    const res = await POST(makeRequest({ email: "new@example.com" }) as never);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual({ exists: false, provider: null });
    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { email: "new@example.com" },
      include: { accounts: true },
    });
  });

  it("returns provider: 'google' for existing Google users", async () => {
    mockFindUnique.mockResolvedValue({
      id: "u1",
      email: "learner@example.com",
      accounts: [{ provider: "google" }],
    });

    const res = await POST(
      makeRequest({ email: "learner@example.com" }) as never
    );
    const data = await res.json();

    expect(data).toEqual({ exists: true, provider: "google" });
  });

  it("returns provider: 'email' for existing email-only users", async () => {
    mockFindUnique.mockResolvedValue({
      id: "u2",
      email: "learner@example.com",
      accounts: [],
    });

    const res = await POST(
      makeRequest({ email: "learner@example.com" }) as never
    );
    const data = await res.json();

    expect(data).toEqual({ exists: true, provider: "email" });
  });

  it("normalizes email to lowercase and trims", async () => {
    mockFindUnique.mockResolvedValue(null);

    await POST(makeRequest({ email: "  Learner@Example.COM  " }) as never);

    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { email: "learner@example.com" },
      include: { accounts: true },
    });
  });
});

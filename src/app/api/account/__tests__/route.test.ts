import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  authOptions: {},
}));

vi.mock("@/lib/db", () => ({
  prisma: {
    user: {
      update: vi.fn().mockResolvedValue({ id: "user1", name: "New Name" }),
      delete: vi.fn().mockResolvedValue({ id: "user1" }),
      findUnique: vi.fn(),
    },
    subscription: {
      findFirst: vi.fn(),
    },
  },
}));

vi.mock("@/lib/stripe", () => ({
  getStripe: vi.fn().mockReturnValue({
    subscriptions: {
      cancel: vi.fn().mockResolvedValue({}),
    },
  }),
}));

import { PATCH, DELETE } from "@/app/api/account/route";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";

const mockedGetServerSession = vi.mocked(getServerSession);

describe("PATCH /api/account", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when unauthenticated", async () => {
    mockedGetServerSession.mockResolvedValue(null);
    const request = new Request("http://localhost/api/account", {
      method: "PATCH",
      body: JSON.stringify({ name: "Test" }),
    });
    const response = await PATCH(request);
    expect(response.status).toBe(401);
  });

  it("updates the user name", async () => {
    mockedGetServerSession.mockResolvedValue({
      user: { email: "harry@example.com" },
    });
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: "user1" } as never);

    const request = new Request("http://localhost/api/account", {
      method: "PATCH",
      body: JSON.stringify({ name: "New Name" }),
    });
    const response = await PATCH(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: "user1" },
      data: { name: "New Name" },
    });
  });
});

describe("DELETE /api/account", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when unauthenticated", async () => {
    mockedGetServerSession.mockResolvedValue(null);
    const request = new Request("http://localhost/api/account", {
      method: "DELETE",
    });
    const response = await DELETE(request);
    expect(response.status).toBe(401);
  });

  it("deletes the user and their data", async () => {
    mockedGetServerSession.mockResolvedValue({
      user: { email: "harry@example.com" },
    });
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: "user1" } as never);
    vi.mocked(prisma.subscription.findFirst).mockResolvedValue(null);

    const request = new Request("http://localhost/api/account", {
      method: "DELETE",
    });
    const response = await DELETE(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(prisma.user.delete).toHaveBeenCalledWith({
      where: { id: "user1" },
    });
  });
});

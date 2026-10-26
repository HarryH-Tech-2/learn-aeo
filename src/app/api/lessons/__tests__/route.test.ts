import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock next-auth before importing the route
vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  authOptions: {},
}));

vi.mock("@/lib/subscription", () => ({
  checkSubscription: vi.fn(),
}));

import { GET } from "@/app/api/lessons/[id]/route";
import { getServerSession } from "next-auth";
import { checkSubscription } from "@/lib/subscription";

const mockedGetServerSession = vi.mocked(getServerSession);
const mockedCheckSubscription = vi.mocked(checkSubscription);

function buildRequest() {
  return new Request("http://localhost:3000/api/lessons/pilgrims-gallery");
}

function buildParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

describe("GET /api/lessons/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns full content for free lesson when unauthenticated", async () => {
    mockedGetServerSession.mockResolvedValue(null);

    const response = await GET(buildRequest(), buildParams("expedition-begins"));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.isFree).toBe(true);
    expect(data.hieroglyphs).toBeDefined();
    expect(data.hieroglyphs.length).toBeGreaterThan(0);
    expect(data.locked).toBeUndefined();
  });

  it("returns full content for free lesson when authenticated without subscription", async () => {
    mockedGetServerSession.mockResolvedValue({
      user: { email: "test@example.com" },
    });
    mockedCheckSubscription.mockResolvedValue({ active: false, trial: false } as never);

    const response = await GET(buildRequest(), buildParams("expedition-begins"));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.hieroglyphs).toBeDefined();
    expect(data.hieroglyphs.length).toBeGreaterThan(0);
  });

  it("strips glyphGroups from paid lesson when unauthenticated", async () => {
    mockedGetServerSession.mockResolvedValue(null);

    const response = await GET(buildRequest(), buildParams("pilgrims-gallery"));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.locked).toBe(true);
    expect(data.glyphGroups).toBeUndefined();
    expect(data.title).toBe("The Pilgrim's Gallery");
  });

  it("strips glyphGroups from paid lesson when authenticated without subscription", async () => {
    mockedGetServerSession.mockResolvedValue({
      user: { email: "test@example.com" },
    });
    mockedCheckSubscription.mockResolvedValue({ active: false, trial: false } as never);

    const response = await GET(buildRequest(), buildParams("pilgrims-gallery"));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.locked).toBe(true);
    expect(data.glyphGroups).toBeUndefined();
    expect(data.title).toBe("The Pilgrim's Gallery");
  });

  it("returns full content for paid lesson when authenticated with active subscription", async () => {
    mockedGetServerSession.mockResolvedValue({
      user: { email: "test@example.com" },
    });
    mockedCheckSubscription.mockResolvedValue({ active: true, trial: false } as never);

    const response = await GET(buildRequest(), buildParams("pilgrims-gallery"));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.locked).toBeUndefined();
    expect(data.hieroglyphs).toBeDefined();
    expect(data.hieroglyphs.length).toBeGreaterThan(0);
  });

  it("returns 404 for non-existent lesson", async () => {
    const response = await GET(buildRequest(), buildParams("does-not-exist"));
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("Lesson not found");
  });
});

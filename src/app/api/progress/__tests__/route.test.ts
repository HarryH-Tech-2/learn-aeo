import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  authOptions: {},
}));

vi.mock("@/lib/progress", () => ({
  getUserProgress: vi.fn(),
  markLessonStarted: vi.fn(),
  recordQuizScore: vi.fn(),
}));

import { GET } from "@/app/api/progress/route";
import { POST as StartPOST } from "@/app/api/progress/start/route";
import { POST as CompletePOST } from "@/app/api/progress/complete/route";
import { getServerSession } from "next-auth";

const mockedGetServerSession = vi.mocked(getServerSession);

describe("GET /api/progress", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    mockedGetServerSession.mockResolvedValue(null);

    const response = await GET();
    expect(response.status).toBe(401);
  });
});

describe("POST /api/progress/start", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    mockedGetServerSession.mockResolvedValue(null);

    const request = new Request("http://localhost:3000/api/progress/start", {
      method: "POST",
      body: JSON.stringify({ lessonId: "test" }),
    });
    const response = await StartPOST(request);
    expect(response.status).toBe(401);
  });
});

describe("POST /api/progress/complete", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    mockedGetServerSession.mockResolvedValue(null);

    const request = new Request("http://localhost:3000/api/progress/complete", {
      method: "POST",
      body: JSON.stringify({ lessonId: "test", score: 3, totalQuestions: 5 }),
    });
    const response = await CompletePOST(request);
    expect(response.status).toBe(401);
  });
});

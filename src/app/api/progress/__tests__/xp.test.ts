import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  authOptions: {},
}));

vi.mock("@/lib/progress", () => ({
  recordXP: vi.fn(async () => ({ xp: 10 })),
}));

import { POST } from "@/app/api/progress/xp/route";
import { getServerSession } from "next-auth";
import { recordXP } from "@/lib/progress";
import { AUDIT_LENGTH, MAX_XP_AWARD, XP_REWARDS } from "@/lib/gamification";

const mockedSession = vi.mocked(getServerSession);
const mockedRecord = vi.mocked(recordXP);

function post(body: Record<string, unknown>) {
  return POST(
    new Request("http://localhost:3000/api/progress/xp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
  );
}

describe("POST /api/progress/xp", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedSession.mockResolvedValue({ user: { id: "u1" } });
  });

  it("records XP for a catalog lesson, coming soon or not", async () => {
    expect((await post({ lessonId: "how-answer-engines-choose-sources", xp: 25 })).status).toBe(200);
    expect((await post({ lessonId: "running-an-aeo-programme", xp: 200 })).status).toBe(200);
    expect(mockedRecord).toHaveBeenCalledTimes(2);
  });

  it("accepts the largest possible audit award: a perfect audit of the longest allowed length", async () => {
    const largest = AUDIT_LENGTH.max * XP_REWARDS.auditCorrect + XP_REWARDS.perfectAudit;
    expect(MAX_XP_AWARD).toBe(largest);
    expect(largest).toBe(400);
    expect((await post({ lessonId: "writing-citable-content", xp: largest })).status).toBe(200);
    expect(mockedRecord).toHaveBeenCalledWith("u1", "writing-citable-content", largest);
  });

  it("rejects one XP above the largest possible audit award", async () => {
    expect((await post({ lessonId: "writing-citable-content", xp: MAX_XP_AWARD + 1 })).status).toBe(400);
    expect(mockedRecord).not.toHaveBeenCalled();
  });

  it.each([
    ["an unknown lesson", { lessonId: "not-a-lesson", xp: 10 }],
    ["zero XP", { lessonId: "how-answer-engines-choose-sources", xp: 0 }],
    ["fractional XP", { lessonId: "how-answer-engines-choose-sources", xp: 2.5 }],
    ["XP as a string", { lessonId: "how-answer-engines-choose-sources", xp: "10" }],
  ])("rejects %s", async (_label, body) => {
    expect((await post(body)).status).toBe(400);
    expect(mockedRecord).not.toHaveBeenCalled();
  });
});

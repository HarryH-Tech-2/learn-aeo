import { describe, it, expect, vi, beforeEach } from "vitest";

// A lesson forced to "coming soon", so the coming-soon branch stays tested once every real lesson is live.
const { SOON_ID } = vi.hoisted(() => ({ SOON_ID: "running-an-aeo-program" }));
vi.mock("@/lib/lesson-catalog", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/lesson-catalog")>();
  const LESSON_CATALOG = actual.LESSON_CATALOG.map((l) => (l.id === SOON_ID ? { ...l, status: "coming-soon" as const } : l));
  return { ...actual, LESSON_CATALOG };
});
vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  authOptions: {},
}));

vi.mock("@/lib/progress", () => ({
  recordQuizScore: vi.fn(),
}));

vi.mock("@/lib/subscription", () => ({
  checkSubscription: vi.fn(),
}));

vi.mock("@/lib/offers", () => ({
  OFFER_PERCENT_OFF: 33,
  grantOffer: vi.fn(async () => null),
  getActiveOffer: vi.fn(async () => null),
}));

vi.mock("@/lib/email", () => ({
  sendLessonCompleteEmail: vi.fn(async () => undefined),
}));

vi.mock("@/lib/db", () => ({
  prisma: { user: { findUnique: vi.fn(async () => null) } },
}));

vi.mock("@/lib/ppp", () => ({
  pppBeatsOffer: vi.fn(() => false),
  requestCountry: vi.fn(() => null),
}));

// A paid *live* lesson for the 403 case: lesson 2's catalog entry with lesson 1's content.
const { PAID_ID } = vi.hoisted(() => ({ PAID_ID: "make-your-site-reachable-by-ai" }));
vi.mock("@/lib/lessons", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/lessons")>();
  const lesson1 = actual.LESSONS[0] as import("@/lib/lessons").LiveLesson;
  const paidMeta = actual.LESSONS.find((l) => l.id === PAID_ID)!;
  const paid = { ...paidMeta, status: "live" as const, content: lesson1.content };
  const lessons = actual.LESSONS.map((l) => (l.id === PAID_ID ? paid : l));
  return { ...actual, LESSONS: lessons, getLesson: (id: string) => lessons.find((l) => l.id === id) };
});

import { POST } from "@/app/api/progress/complete/route";
import { getServerSession } from "next-auth";
import { recordQuizScore } from "@/lib/progress";
import { checkSubscription } from "@/lib/subscription";
import { grantOffer } from "@/lib/offers";
import { sendLessonCompleteEmail } from "@/lib/email";

const mockedSession = vi.mocked(getServerSession);
const mockedRecord = vi.mocked(recordQuizScore);
const mockedCheck = vi.mocked(checkSubscription);
const mockedGrant = vi.mocked(grantOffer);
const mockedEmail = vi.mocked(sendLessonCompleteEmail);

const FREE_ID = "how-answer-engines-choose-sources";

function post(body: Record<string, unknown>) {
  return POST(
    new Request("http://localhost:3000/api/progress/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
  );
}

describe("POST /api/progress/complete", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedSession.mockResolvedValue({ user: { id: "u1", email: "learner@example.com", name: "Lee" } });
    mockedCheck.mockResolvedValue({ active: false, trial: false, via: null, periodEnd: null });
  });

  it("returns 401 when signed out", async () => {
    mockedSession.mockResolvedValue(null);
    const res = await post({ lessonId: FREE_ID, score: 6, totalQuestions: 10 });
    expect(res.status).toBe(401);
    expect(mockedRecord).not.toHaveBeenCalled();
  });

  it("rejects a total that does not match the lesson's audit", async () => {
    const res = await post({ lessonId: FREE_ID, score: 1, totalQuestions: 1 });
    expect(res.status).toBe(400);
    expect(mockedRecord).not.toHaveBeenCalled();
  });

  it("rejects a score above the total", async () => {
    const res = await post({ lessonId: FREE_ID, score: 11, totalQuestions: 10 });
    expect(res.status).toBe(400);
    expect(mockedRecord).not.toHaveBeenCalled();
  });

  it("rejects a fractional score", async () => {
    const res = await post({ lessonId: FREE_ID, score: 2.5, totalQuestions: 10 });
    expect(res.status).toBe(400);
    expect(mockedRecord).not.toHaveBeenCalled();
  });

  it("rejects a negative score", async () => {
    const res = await post({ lessonId: FREE_ID, score: -1, totalQuestions: 10 });
    expect(res.status).toBe(400);
    expect(mockedRecord).not.toHaveBeenCalled();
  });

  it("rejects a malformed JSON body", async () => {
    const res = await POST(
      new Request("http://localhost:3000/api/progress/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{",
      })
    );
    expect(res.status).toBe(400);
    expect(mockedRecord).not.toHaveBeenCalled();
  });

  it("rejects a coming-soon lesson", async () => {
    const res = await post({ lessonId: SOON_ID, score: 6, totalQuestions: 10 });
    expect(res.status).toBe(400);
    expect(mockedRecord).not.toHaveBeenCalled();
  });

  it("rejects an unknown lesson", async () => {
    const res = await post({ lessonId: "not-a-lesson", score: 6, totalQuestions: 10 });
    expect(res.status).toBe(400);
    expect(mockedRecord).not.toHaveBeenCalled();
  });

  it("refuses a paid lesson without access", async () => {
    const res = await post({ lessonId: PAID_ID, score: 6, totalQuestions: 10 });
    expect(res.status).toBe(403);
    expect(mockedCheck).toHaveBeenCalledWith("learner@example.com");
    expect(mockedRecord).not.toHaveBeenCalled();
  });

  it("records a paid lesson for a learner with access", async () => {
    mockedCheck.mockResolvedValue({ active: true, trial: false, via: "lifetime", periodEnd: null });
    const res = await post({ lessonId: PAID_ID, score: 6, totalQuestions: 10 });
    expect(res.status).toBe(200);
    expect(mockedRecord).toHaveBeenCalledTimes(1);
    expect(mockedGrant).not.toHaveBeenCalled();
  });

  it("records a valid lesson 1 submission and opens the offer", async () => {
    const res = await post({ lessonId: FREE_ID, score: 6, totalQuestions: 10 });
    expect(res.status).toBe(200);
    expect(mockedRecord).toHaveBeenCalledTimes(1);
    expect(mockedRecord).toHaveBeenCalledWith("u1", FREE_ID, 6, 10);
    expect(mockedGrant).toHaveBeenCalledWith("learner@example.com", "lesson-complete");
    expect(mockedCheck).not.toHaveBeenCalled();
  });

  it("emails the lesson-complete offer, naming the lesson that was passed", async () => {
    const expiresAt = new Date("2026-10-28T12:00:00Z");
    mockedGrant.mockResolvedValueOnce({ code: "AEO-ABC123", expiresAt, source: "lesson-complete", percentOff: 33 });
    const res = await post({ lessonId: FREE_ID, score: 8, totalQuestions: 10 });
    expect(res.status).toBe(200);
    expect(mockedEmail).toHaveBeenCalledWith({
      name: "Lee",
      email: "learner@example.com",
      code: "AEO-ABC123",
      expiresAt,
      percentOff: 33,
      lessonId: FREE_ID,
    });
  });
});

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

vi.mock("@/lib/subscription", () => ({
  checkSubscription: vi.fn(),
}));

vi.mock("@/lib/dev-bypass", () => ({
  devBypassAuth: vi.fn(() => false),
}));

// Lesson 2 is a live paid lesson, so the paid cases use it directly.
const PAID_ID = "make-your-site-reachable-by-ai";

import { GET } from "@/app/api/lessons/[id]/route";
import { getServerSession } from "next-auth";
import { checkSubscription } from "@/lib/subscription";
import { devBypassAuth } from "@/lib/dev-bypass";

const mockedGetServerSession = vi.mocked(getServerSession);
const mockedCheckSubscription = vi.mocked(checkSubscription);
const mockedDevBypass = vi.mocked(devBypassAuth);

const FREE_ID = "how-answer-engines-choose-sources";

async function get(id: string) {
  const response = await GET(new Request(`http://localhost:3000/api/lessons/${id}`), {
    params: Promise.resolve({ id }),
  });
  return { response, body: await response.json() };
}

describe("GET /api/lessons/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedDevBypass.mockReturnValue(false);
  });

  it("returns the free live lesson with content to a signed-out visitor", async () => {
    mockedGetServerSession.mockResolvedValue(null);
    const { response, body } = await get(FREE_ID);
    expect(response.status).toBe(200);
    expect(body.status).toBe("live");
    expect(body.content.audit.length).toBeGreaterThan(0);
    expect(body.locked).toBeUndefined();
    expect(body.preview).toBeUndefined();
  });

  it("locks a paid lesson for a signed-out visitor, with no content key", async () => {
    mockedGetServerSession.mockResolvedValue(null);
    const { response, body } = await get(PAID_ID);
    expect(response.status).toBe(200);
    expect(body.locked).toBe(true);
    expect("content" in body).toBe(false);
    expect(body.title).toBe("Make your site reachable by AI");
  });

  it("locks a paid lesson for a signed-in learner without access", async () => {
    mockedGetServerSession.mockResolvedValue({ user: { email: "test@example.com" } });
    mockedCheckSubscription.mockResolvedValue({ active: false, trial: false, via: null, periodEnd: null });
    const { body } = await get(PAID_ID);
    expect(body.locked).toBe(true);
    expect("content" in body).toBe(false);
    expect(mockedCheckSubscription).toHaveBeenCalledWith("test@example.com");
  });

  it("returns a paid lesson with content to a learner with access", async () => {
    mockedGetServerSession.mockResolvedValue({ user: { email: "test@example.com" } });
    mockedCheckSubscription.mockResolvedValue({ active: true, trial: false, via: "lifetime", periodEnd: null });
    const { response, body } = await get(PAID_ID);
    expect(response.status).toBe(200);
    expect(body.content).toBeDefined();
    expect(body.locked).toBeUndefined();
  });

  it("opens a paid lesson under dev bypass and marks it as a preview", async () => {
    mockedDevBypass.mockReturnValue(true);
    mockedGetServerSession.mockResolvedValue(null);
    const { body } = await get(PAID_ID);
    expect(body.content).toBeDefined();
    expect(body.preview).toBe(true);
  });

  it("returns catalog data, without content, for a coming-soon lesson", async () => {
    mockedGetServerSession.mockResolvedValue(null);
    const { response, body } = await get(SOON_ID);
    expect(response.status).toBe(200);
    expect(body.status).toBe("coming-soon");
    expect(body.district).toBe("The Citadel");
    expect("content" in body).toBe(false);
  });

  it("returns 404 for an unknown lesson", async () => {
    const { response, body } = await get("not-a-lesson");
    expect(response.status).toBe(404);
    expect(body.error).toBeDefined();
  });
});

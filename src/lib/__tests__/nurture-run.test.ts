import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const mockSend = vi.hoisted(() => vi.fn().mockResolvedValue({ data: { id: "m1" }, error: null }));
const db = vi.hoisted(() => ({
  user: { update: vi.fn(), findMany: vi.fn(async () => []) },
  emailSend: { create: vi.fn(async () => ({})) },
}));

vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(function (this: { emails: { send: typeof mockSend } }) {
    this.emails = { send: mockSend };
  }),
}));
vi.mock("@/lib/db", () => ({ prisma: db }));
vi.mock("@/lib/subscription", () => ({
  checkSubscription: vi.fn(async () => ({ active: false, trial: false, via: null, periodEnd: null })),
  hasPaidAccess: vi.fn(() => false),
}));
vi.mock("@/lib/offers", () => ({ grantOffer: vi.fn(async () => null), OFFER_PERCENT_OFF: 33 }));
vi.mock("@/lib/unsubscribe", () => ({ unsubscribeUrl: (id: string) => `https://x.test/api/email/unsubscribe?u=${id}&t=t` }));

import { enrollInNurture } from "@/lib/nurture-run";

function newUserRow() {
  return {
    id: "u1",
    email: "new@example.com",
    name: "Nancy",
    nurtureStartedAt: new Date(),
    emailUnsubscribedAt: null,
    offerCode: null,
    offerExpiresAt: null,
    offerSource: null,
    lessonProgress: [],
    emailSends: [],
  };
}

describe("enrollInNurture (sign-up hook)", () => {
  const prev = process.env.NURTURE_ENABLED;
  beforeEach(() => {
    vi.clearAllMocks();
    db.user.update.mockResolvedValue(newUserRow());
  });
  afterEach(() => {
    if (prev === undefined) delete process.env.NURTURE_ENABLED;
    else process.env.NURTURE_ENABLED = prev;
  });

  it("records the enrollment but sends no welcome while NURTURE_ENABLED is unset", async () => {
    delete process.env.NURTURE_ENABLED;
    await enrollInNurture("u1");
    expect(db.user.update).toHaveBeenCalledOnce();
    expect(db.user.update.mock.calls[0][0].data.nurtureStartedAt).toBeInstanceOf(Date);
    expect(mockSend).not.toHaveBeenCalled();
    expect(db.emailSend.create).not.toHaveBeenCalled();
  });

  it("sends no welcome for any value other than \"true\"", async () => {
    for (const v of ["false", "1", "TRUE", ""]) {
      process.env.NURTURE_ENABLED = v;
      await enrollInNurture("u1");
    }
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("sends the day-0 welcome when NURTURE_ENABLED is \"true\"", async () => {
    process.env.NURTURE_ENABLED = "true";
    await enrollInNurture("u1");
    expect(mockSend).toHaveBeenCalledOnce();
    const args = mockSend.mock.calls[0][0];
    expect(args.to).toBe("new@example.com");
    expect(args.tags).toEqual([{ name: "nurture", value: "welcome" }]);
    expect(db.emailSend.create).toHaveBeenCalledWith({ data: { userId: "u1", key: "welcome" } });
  });
});

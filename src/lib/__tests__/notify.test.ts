import { describe, it, expect, vi, beforeEach } from "vitest";

const mockSend = vi.hoisted(() => vi.fn().mockResolvedValue({ data: { id: "em_1" }, error: null }));
vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(function (this: { emails: { send: typeof mockSend } }) {
    this.emails = { send: mockSend };
  }),
}));

import { ownerEmail, notifyOwner, DEFAULT_OWNER_EMAIL } from "@/lib/notify";

describe("ownerEmail", () => {
  beforeEach(() => {
    delete process.env.CONTACT_TO_EMAIL;
  });
  it("defaults to hello@learnaeo.com", () => {
    expect(ownerEmail()).toBe("hello@learnaeo.com");
    expect(DEFAULT_OWNER_EMAIL).toBe("hello@learnaeo.com");
  });
  it("honors CONTACT_TO_EMAIL when set", () => {
    process.env.CONTACT_TO_EMAIL = " other@example.com ";
    expect(ownerEmail()).toBe("other@example.com");
  });
  it("ignores an empty CONTACT_TO_EMAIL", () => {
    process.env.CONTACT_TO_EMAIL = "";
    expect(ownerEmail()).toBe("hello@learnaeo.com");
  });
});

describe("notifyOwner", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.CONTACT_TO_EMAIL;
    process.env.RESEND_FROM_EMAIL = "hello@learnaeo.com";
  });
  it("sends to the owner address with reply-to", async () => {
    const ok = await notifyOwner({ subject: "New account", text: "x", replyTo: "a@b.co" });
    expect(ok).toBe(true);
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({ to: "hello@learnaeo.com", replyTo: "a@b.co", subject: "New account" })
    );
  });
  it("never throws when Resend fails", async () => {
    mockSend.mockRejectedValueOnce(new Error("down"));
    await expect(notifyOwner({ subject: "s", text: "t" })).resolves.toBe(false);
    mockSend.mockResolvedValueOnce({ data: null, error: { message: "bad" } });
    await expect(notifyOwner({ subject: "s", text: "t" })).resolves.toBe(false);
  });
});

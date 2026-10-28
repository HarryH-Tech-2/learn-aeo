import { describe, it, expect, vi, beforeEach } from "vitest";
import { LESSON_CATALOG } from "@/lib/lesson-catalog";
import { CERT_CODE_PATTERN } from "@/lib/certificate-issue";

vi.mock("next-auth", () => ({ getServerSession: vi.fn() }));
vi.mock("@/lib/auth", () => ({ authOptions: {} }));

// An in-memory stand-in for the tables the route touches.
const db = vi.hoisted(() => {
  type Cert = { id: string; code: string; userId: string; name: string; issuedAt: Date };
  const state = {
    certs: new Map<string, Cert>(),
    users: new Map<string, { id: string; name: string | null }>(),
    progress: [] as { userId: string; lessonId: string; completed: boolean }[],
  };
  const prisma = {
    user: {
      findUnique: vi.fn(async ({ where }: { where: { id: string } }) => state.users.get(where.id) ?? null),
    },
    lessonProgress: {
      findMany: vi.fn(async ({ where }: { where: { userId: string } }) =>
        state.progress.filter((p) => p.userId === where.userId)
      ),
    },
    certificate: {
      findUnique: vi.fn(async ({ where }: { where: { userId: string } }) => {
        const c = state.certs.get(where.userId);
        return c ? { ...c } : null;
      }),
      create: vi.fn(async ({ data }: { data: { code: string; userId: string; name: string } }) => {
        const c = { id: `c${state.certs.size + 1}`, issuedAt: new Date("2026-10-28T12:00:00Z"), ...data };
        state.certs.set(data.userId, c);
        return { ...c };
      }),
      update: vi.fn(async ({ where, data }: { where: { userId: string }; data: { name: string } }) => {
        const c = state.certs.get(where.userId)!;
        c.name = data.name;
        return { ...c };
      }),
    },
  };
  return { state, prisma };
});

vi.mock("@/lib/db", () => ({ prisma: db.prisma }));

import { POST } from "@/app/api/certificate/route";
import { getServerSession } from "next-auth";

const mockedSession = vi.mocked(getServerSession);

type Body = { code?: string; name?: string; issuedAt?: string; url?: string };
async function post() {
  const res = await POST();
  return { status: res.status, json: (await res.json()) as Body };
}

function completeAll(userId = "u1") {
  db.state.progress = LESSON_CATALOG.map((l) => ({ userId, lessonId: l.id, completed: true }));
}

describe("POST /api/certificate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    db.state.certs.clear();
    db.state.progress = [];
    db.state.users.clear();
    db.state.users.set("u1", { id: "u1", name: "Jane Smith" });
    mockedSession.mockResolvedValue({ user: { id: "u1", email: "jane@example.com" } });
  });

  it("401s when signed out", async () => {
    mockedSession.mockResolvedValue(null);
    expect((await post()).status).toBe(401);
  });

  it("403s and issues nothing when any catalog lesson is incomplete", async () => {
    completeAll();
    db.state.progress.pop();
    const r = await post();
    expect(r.status).toBe(403);
    expect(db.prisma.certificate.create).not.toHaveBeenCalled();
    expect(db.prisma.certificate.update).not.toHaveBeenCalled();
  });

  it("issues a certificate with a valid code once every lesson is complete", async () => {
    completeAll();
    const r = await post();
    expect(r.status).toBe(200);
    expect(r.json.code).toMatch(CERT_CODE_PATTERN);
    expect(r.json.name).toBe("Jane Smith");
    expect(r.json.issuedAt).toBe("2026-10-28T12:00:00.000Z");
    expect(r.json.url).toMatch(new RegExp(`/verify/${r.json.code}$`));
  });

  it("returns the same code and date on a second call", async () => {
    completeAll();
    const a = await post();
    const b = await post();
    expect(b.json.code).toBe(a.json.code);
    expect(b.json.issuedAt).toBe(a.json.issuedAt);
    expect(db.prisma.certificate.create).toHaveBeenCalledTimes(1);
  });

  it("updates the printed name but never the code or date", async () => {
    completeAll();
    const a = await post();
    db.state.users.set("u1", { id: "u1", name: "  Jane Doe  " });
    const b = await post();
    expect(b.json.name).toBe("Jane Doe");
    expect(b.json.code).toBe(a.json.code);
    expect(b.json.issuedAt).toBe(a.json.issuedAt);
  });

  it("prints Learner when the account has no name, and caps long names", async () => {
    completeAll();
    db.state.users.set("u1", { id: "u1", name: null });
    expect((await post()).json.name).toBe("Learner");
    db.state.users.set("u1", { id: "u1", name: "x".repeat(80) });
    expect((await post()).json.name).toHaveLength(60);
  });
});

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { joinLicence, leaveLicence, licencesOwnedBy, removeMember, renameLicence, isLicenceActive } from "@/lib/licence";

/**
 * GET    /api/licence                       → { owned: LicenceView[], member: {...} | null }
 * POST   /api/licence   { code }            → join a licence as a pupil
 * PATCH  /api/licence   { id, schoolName }  → owner renames it
 * DELETE /api/licence   { id?, memberUserId? } → owner removes a pupil; or (no body) leave the one you joined
 */

async function me(): Promise<{ id: string } | null> {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string } | undefined;
  return user?.id ? { id: user.id } : null;
}

export async function GET() {
  const user = await me();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const [owned, row] = await Promise.all([
    licencesOwnedBy(user.id),
    prisma.user.findUnique({ where: { id: user.id }, select: { licence: { include: { owner: { select: { name: true } } } } } }),
  ]);
  const l = row?.licence ?? null;
  const member = l
    ? { id: l.id, kind: l.kind, code: l.code, schoolName: l.schoolName, teacher: l.owner.name, active: isLicenceActive(l), currentPeriodEnd: l.currentPeriodEnd?.toISOString() ?? null }
    : null;
  return NextResponse.json({ owned, member });
}

export async function POST(request: Request) {
  const user = await me();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  let body: { code?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  const code = typeof body.code === "string" ? body.code : "";
  const result = await joinLicence(user.id, code);
  if (!result.ok) {
    const messages: Record<typeof result.reason, string> = {
      "not-found": "That code doesn't match a licence. Check it with your teacher.",
      inactive: "That licence has lapsed. Ask your teacher to renew it.",
      full: "That class is full. Ask your teacher to free a seat.",
      owner: "That's your own licence: you already have access.",
      already: "You're already in this class.",
      trial: "Your teacher is on the free trial, which doesn't include pupil places. Ask again once the licence is bought.",
    };
    return NextResponse.json({ error: messages[result.reason], reason: result.reason }, { status: 400 });
  }
  return NextResponse.json({ ok: true, kind: result.kind });
}

export async function PATCH(request: Request) {
  const user = await me();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await request.json().catch(() => ({}))) as { id?: unknown; schoolName?: unknown };
  if (typeof body.id !== "string" || typeof body.schoolName !== "string") return NextResponse.json({ error: "id and schoolName required" }, { status: 400 });
  const ok = await renameLicence(user.id, body.id, body.schoolName);
  return ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "Not your licence" }, { status: 403 });
}

export async function DELETE(request: Request) {
  const user = await me();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await request.json().catch(() => ({}))) as { id?: unknown; memberUserId?: unknown };
  if (typeof body.id === "string" && typeof body.memberUserId === "string") {
    const ok = await removeMember(user.id, body.id, body.memberUserId);
    return ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "Not your licence" }, { status: 403 });
  }
  await leaveLicence(user.id);
  return NextResponse.json({ ok: true });
}

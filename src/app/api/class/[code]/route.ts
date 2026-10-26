import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { cleanTeamName, isValidCode } from "@/lib/classroom";
import { answer, buildView, devHostId, findRoom, hostAction, joinRoom } from "@/lib/classroom-server";

/**
 * GET  /api/class/<code>                      → RoomView (polled every 1.5 s by phones + projector)
 * POST /api/class/<code> { action: "start" | "reveal" | "next" | "end" }   host only
 * POST /api/class/<code> { action: "join", name }                           → { teamId }
 * POST /api/class/<code> { action: "answer", teamId, questionIndex, choice } → { ok }
 */

const NO_STORE = { "Cache-Control": "no-store" };

export async function GET(_req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code: raw } = await params;
  const code = raw.toUpperCase();
  if (!isValidCode(code)) return NextResponse.json({ error: "bad code" }, { status: 400, headers: NO_STORE });
  const room = await findRoom(code);
  if (!room) return NextResponse.json({ error: "No room with that code (rooms close after three hours)" }, { status: 404, headers: NO_STORE });
  const now = Date.now();
  if (room.expiresAt.getTime() <= now) return NextResponse.json({ error: "This room has closed" }, { status: 410, headers: NO_STORE });
  return NextResponse.json(buildView(room, now), { headers: NO_STORE });
}

export async function POST(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code: raw } = await params;
  const code = raw.toUpperCase();
  if (!isValidCode(code)) return NextResponse.json({ error: "bad code" }, { status: 400 });
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  const action = typeof body.action === "string" ? body.action : "";

  if (action === "join") {
    const name = cleanTeamName(typeof body.name === "string" ? body.name : "");
    if (!name) return NextResponse.json({ error: "Pick a team name of 2–20 letters or numbers" }, { status: 400 });
    const r = await joinRoom(code, name);
    if ("error" in r) return NextResponse.json({ error: r.error }, { status: r.status });
    return NextResponse.json({ teamId: r.teamId, name });
  }

  if (action === "answer") {
    const teamId = typeof body.teamId === "string" ? body.teamId : "";
    const questionIndex = typeof body.questionIndex === "number" ? body.questionIndex : -1;
    const choice = typeof body.choice === "number" ? body.choice : -1;
    if (!teamId || questionIndex < 0 || choice < 0 || choice > 3) return NextResponse.json({ error: "bad answer" }, { status: 400 });
    const r = await answer(code, teamId, questionIndex, choice);
    if ("error" in r) return NextResponse.json({ error: r.error }, { status: r.status });
    return NextResponse.json({ ok: true, already: r.already });
  }

  if (action === "start" || action === "reveal" || action === "next" || action === "end") {
    const session = await getServerSession(authOptions);
    const user = session?.user as { id?: string } | undefined;
    const hostId = user?.id ?? (await devHostId());
    if (!hostId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const r = await hostAction(code, hostId, action);
    if ("error" in r) return NextResponse.json({ error: r.error }, { status: r.status });
    return NextResponse.json(r.view, { headers: NO_STORE });
  }

  return NextResponse.json({ error: "unknown action" }, { status: 400 });
}

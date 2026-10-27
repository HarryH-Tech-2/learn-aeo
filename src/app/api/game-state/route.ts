import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

/**
 * GET  /api/game-state?game=<slug>     → { state } (null when nothing saved)
 * PUT  /api/game-state  { game, state } → { state }   (replaces what was saved)
 *
 * Signed-in users only. `game` is a short slug; `state` is an arbitrary
 * JSON object capped at 16 KB so a bug can't fill the table.
 */

const GAME_RE = /^[a-z][a-z0-9-]{1,31}$/;
const MAX_BYTES = 16 * 1024;

async function userId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string } | undefined;
  return user?.id ?? null;
}

export async function GET(request: Request) {
  const id = await userId();
  if (!id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const game = new URL(request.url).searchParams.get("game") ?? "";
  if (!GAME_RE.test(game)) return NextResponse.json({ error: "bad game" }, { status: 400 });
  const row = await prisma.gameState.findUnique({ where: { userId_game: { userId: id, game } } });
  return NextResponse.json({ state: row?.state ?? null, updatedAt: row?.updatedAt ?? null });
}

export async function PUT(request: Request) {
  const id = await userId();
  if (!id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  let body: { game?: unknown; state?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  const game = typeof body.game === "string" ? body.game : "";
  if (!GAME_RE.test(game)) return NextResponse.json({ error: "bad game" }, { status: 400 });
  if (!body.state || typeof body.state !== "object" || Array.isArray(body.state)) {
    return NextResponse.json({ error: "state must be an object" }, { status: 400 });
  }
  const serialised = JSON.stringify(body.state);
  if (serialised.length > MAX_BYTES) return NextResponse.json({ error: "state too large" }, { status: 413 });
  const state = JSON.parse(serialised);
  const row = await prisma.gameState.upsert({
    where: { userId_game: { userId: id, game } },
    update: { state },
    create: { userId: id, game, state },
  });
  return NextResponse.json({ state: row.state, updatedAt: row.updatedAt });
}

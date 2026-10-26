import { NextResponse } from "next/server";
import { BODY_MAX, cleanText } from "@/lib/community";
import { answerQuestion, getThread, reader } from "@/lib/community-server";

/**
 * GET  /api/community/:id          → { thread }   members only (403 { error: "members" })
 * POST /api/community/:id { body } → { answer }   members only
 */
export const dynamic = "force-dynamic";

const ID_RE = /^[a-z0-9-]{1,40}$/i;

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const me = await reader();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!me.paid) return NextResponse.json({ error: "members" }, { status: 403 });
  const { id } = await params;
  if (!ID_RE.test(id)) return NextResponse.json({ error: "not found" }, { status: 404 });
  const thread = await getThread(id, me.id);
  if (!thread) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ thread });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const me = await reader();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!me.paid) return NextResponse.json({ error: "members" }, { status: 403 });
  const { id } = await params;
  if (!ID_RE.test(id)) return NextResponse.json({ error: "not found" }, { status: 404 });
  let body: { body?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  const text = cleanText(body.body, BODY_MAX);
  if (!text) return NextResponse.json({ error: "Write something first" }, { status: 400 });
  const answer = await answerQuestion(me, id, text);
  if (!answer) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ answer }, { status: 201 });
}

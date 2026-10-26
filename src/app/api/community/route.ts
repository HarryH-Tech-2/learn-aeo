import { NextResponse } from "next/server";
import { BODY_MAX, cleanText, cleanTitle } from "@/lib/community";
import { askQuestion, listQuestions, reader } from "@/lib/community-server";

/**
 * GET  /api/community                 → { questions, paid }   any signed-in account
 * POST /api/community { title, body } → { id }                members only (403 { error: "members" })
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const me = await reader();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const questions = await listQuestions(me.id);
  return NextResponse.json({ questions, paid: me.paid });
}

export async function POST(request: Request) {
  const me = await reader();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!me.paid) return NextResponse.json({ error: "members" }, { status: 403 });
  let body: { title?: unknown; body?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  const title = cleanTitle(body.title);
  const text = cleanText(body.body, BODY_MAX);
  if (!title || !text) return NextResponse.json({ error: "A title and a question are both needed" }, { status: 400 });
  const id = await askQuestion(me, title, text);
  return NextResponse.json({ id }, { status: 201 });
}

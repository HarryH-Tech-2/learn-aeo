import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { recordXP } from "@/lib/progress";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string } | undefined;
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { lessonId, xp } = await request.json();
  if (!lessonId || xp == null || xp < 0) {
    return NextResponse.json({ error: "lessonId and xp are required" }, { status: 400 });
  }
  const result = await recordXP(user.id, lessonId, xp);
  return NextResponse.json(result);
}

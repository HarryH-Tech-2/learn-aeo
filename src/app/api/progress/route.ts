import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserProgress } from "@/lib/progress";

export async function GET() {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string } | undefined;

  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const progress = await getUserProgress(user.id);
  return NextResponse.json(progress);
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createRoom, devHostId } from "@/lib/classroom-server";
import { ownsActiveLicence } from "@/lib/licence";

/** POST /api/class → { code }  (a teacher with a Classroom or School licence opens a room) */
export async function POST() {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string } | undefined;
  const devHost = user?.id ? null : await devHostId();
  const hostId = user?.id ?? devHost;
  if (!hostId) return NextResponse.json({ error: "Sign in to open a room" }, { status: 401 });
  if (!devHost && !(await ownsActiveLicence(hostId))) {
    return NextResponse.json({ error: "Classroom mode comes with a Classroom or School licence", licence: false }, { status: 402 });
  }
  try {
    const { code } = await createRoom(hostId);
    return NextResponse.json({ code });
  } catch {
    return NextResponse.json({ error: "Could not open a room, try again" }, { status: 500 });
  }
}

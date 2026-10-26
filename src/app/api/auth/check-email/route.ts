import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  const { email } = await request.json();

  if (!email || typeof email !== "string") {
    return NextResponse.json(
      { error: "Email is required" },
      { status: 400 }
    );
  }

  const normalizedEmail = email.toLowerCase().trim();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    include: { accounts: true },
  });

  if (!user) {
    return NextResponse.json({ exists: false, provider: null });
  }

  const hasGoogle = user.accounts.some((a) => a.provider === "google");

  return NextResponse.json({
    exists: true,
    provider: hasGoogle ? "google" : "email",
  });
}

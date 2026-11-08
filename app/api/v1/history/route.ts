import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sessionUserId } from "@/lib/auth";

// Permanently deletes this user's scan data.
export async function DELETE() {
  const userId = await sessionUserId();
  if (!userId) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  await prisma.$transaction([
    prisma.scanSession.deleteMany({ where: { userId } }),
    prisma.accessPoint.deleteMany({ where: { userId } }),
    prisma.wifiNetwork.deleteMany({ where: { userId } }),
  ]);
  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";
import { randomInt } from "crypto";
import { prisma } from "@/lib/db";
import { sessionUserId, sha256 } from "@/lib/auth";

// Signed-in user requests a 10-minute, single-use pairing code for a new scanner agent.
export async function POST() {
  const userId = await sessionUserId();
  if (!userId) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  await prisma.device.create({ data: { userId, pairingCodeHash: sha256(code), pairingExpiresAt: new Date(Date.now() + 10 * 60_000) } });
  return NextResponse.json({ code, expiresInSeconds: 600 });
}

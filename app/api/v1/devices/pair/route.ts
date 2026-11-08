import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { randomToken, sha256 } from "@/lib/auth";

const body = z.object({ code: z.string().regex(/^\d{6}$/), name: z.string().min(1).max(60), platform: z.enum(["ANDROID", "WINDOWS", "LINUX", "MACOS"]) });

// Agent exchanges the code for a long-lived device token. The token is shown once; only its hash is stored.
export async function POST(req: Request) {
  const p = body.safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  const dev = await prisma.device.findUnique({ where: { pairingCodeHash: sha256(p.data.code) } });
  if (!dev || !dev.pairingExpiresAt || dev.pairingExpiresAt < new Date()) return NextResponse.json({ error: "Code invalid or expired" }, { status: 400 });
  const token = randomToken();
  await prisma.device.update({ where: { id: dev.id }, data: { tokenHash: sha256(token), pairingCodeHash: null, pairingExpiresAt: null, name: p.data.name, platform: p.data.platform } });
  return NextResponse.json({ token });
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { timingSafeEqual } from "crypto";
import { prisma } from "@/lib/db";
import { createSession, sha256 } from "@/lib/auth";

const body = z.object({ email: z.string().email(), password: z.string().min(1) });

export async function POST(req: Request) {
  const p = body.safeParse(await req.json().catch(() => null));
  const email = process.env.ADMIN_EMAIL, pw = process.env.ADMIN_PASSWORD;
  if (!p.success || !email || !pw) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  const okPw = timingSafeEqual(Buffer.from(sha256(p.data.password)), Buffer.from(sha256(pw)));
  if (!okPw || p.data.email.toLowerCase() !== email.toLowerCase()) return NextResponse.json({ error: "Wrong email or password" }, { status: 401 });
  const user = await prisma.user.upsert({ where: { email: email.toLowerCase() }, update: {}, create: { email: email.toLowerCase() } });
  await createSession(user.id);
  return NextResponse.json({ ok: true });
}

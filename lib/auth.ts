import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { createHash, randomBytes } from "crypto";
import { prisma } from "./db";

const key = () => {
  const s = process.env.SESSION_SECRET;
  if (!s || s === "change-me") throw new Error("Set SESSION_SECRET in .env");
  return new TextEncoder().encode(s);
};
export const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");
export const randomToken = (bytes = 32) => randomBytes(bytes).toString("base64url");

export async function createSession(userId: string) {
  const t = await new SignJWT({}).setProtectedHeader({ alg: "HS256" }).setSubject(userId).setExpirationTime("7d").sign(key());
  cookies().set("wr_session", t, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 604800 });
}
export async function sessionUserId(): Promise<string | null> {
  const t = cookies().get("wr_session")?.value;
  if (!t) return null;
  try { return (await jwtVerify(t, key())).payload.sub ?? null; } catch { return null; }
}
export async function deviceFromRequest(req: Request) {
  const m = (req.headers.get("authorization") ?? "").match(/^Bearer (.+)$/);
  return m ? prisma.device.findUnique({ where: { tokenHash: sha256(m[1]) } }) : null;
}

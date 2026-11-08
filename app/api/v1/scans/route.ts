import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { deviceFromRequest } from "@/lib/auth";
import { bandFromFreq, channelFromFreq, normalizeSecurity } from "@/lib/signal";

const body = z.object({
  source: z.enum(["ANDROID", "WINDOWS", "LINUX", "MACOS"]),
  startedAt: z.string().datetime().optional(),
  connectedBssid: z.string().optional(),
  position: z.object({ lat: z.number().min(-90).max(90), lon: z.number().min(-180).max(180), accuracyM: z.number().optional() }).optional(),
  results: z.array(z.object({
    ssid: z.string().max(64),
    bssid: z.string().regex(/^([0-9a-f]{2}:){5}[0-9a-f]{2}$/i),
    dbm: z.number().int().min(-120).max(0),
    frequency: z.number().int().min(2400).max(7200),
    security: z.string().max(80).default(""),
  })).max(500),
});

// Ingest endpoint for scanner agents. Authenticated by device token.
export async function POST(req: Request) {
  const dev = await deviceFromRequest(req);
  if (!dev) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const p = body.safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ error: "Invalid payload", details: p.error.flatten() }, { status: 400 });
  const d = p.data, now = new Date(), startedAt = d.startedAt ? new Date(d.startedAt) : now;
  const userId = dev.userId;

  await prisma.$transaction(async (tx) => {
    const session = await tx.scanSession.create({ data: {
      userId, deviceId: dev.id, source: d.source, startedAt,
      connectedBssid: d.connectedBssid?.toLowerCase(),
      scannerLat: d.position?.lat, scannerLon: d.position?.lon, scannerAccM: d.position?.accuracyM,
    } });
    for (const r of d.results) {
      const bssid = r.bssid.toLowerCase();
      const net = await tx.wifiNetwork.upsert({ where: { userId_ssid: { userId, ssid: r.ssid } }, update: {}, create: { userId, ssid: r.ssid, hidden: r.ssid === "" } });
      const common = { networkId: net.id, frequency: r.frequency, channel: channelFromFreq(r.frequency), band: bandFromFreq(r.frequency), security: normalizeSecurity(r.security), lastSeenAt: startedAt, lastDbm: r.dbm };
      const ap = await tx.accessPoint.upsert({ where: { userId_bssid: { userId, bssid } }, update: common, create: { ...common, userId, bssid, firstSeenAt: startedAt } });
      await tx.scanResult.create({ data: { sessionId: session.id, apId: ap.id, dbm: r.dbm } });
      await tx.signalHistory.create({ data: { apId: ap.id, dbm: r.dbm, at: startedAt } });
    }
    await tx.device.update({ where: { id: dev.id }, data: { lastSeenAt: now } });
  }, { timeout: 20000 });
  return NextResponse.json({ ok: true, stored: d.results.length });
}

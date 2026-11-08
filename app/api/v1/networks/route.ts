import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sessionUserId } from "@/lib/auth";

// Access points seen in the most recent scan. Location confidence stays UNKNOWN until a provider is wired in (Stage 4).
export async function GET() {
  const userId = await sessionUserId();
  if (!userId) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const [aps, last] = await Promise.all([
    prisma.accessPoint.findMany({ where: { userId }, include: { network: true, locations: { orderBy: { createdAt: "desc" }, take: 1 } }, orderBy: { lastDbm: "desc" }, take: 500 }),
    prisma.scanSession.findFirst({ where: { userId }, orderBy: { startedAt: "desc" } }),
  ]);
  const since = last ? last.startedAt.getTime() - 1000 : 0;
  return NextResponse.json({
    lastScanAt: last?.startedAt ?? null, source: last?.source ?? null, connectedBssid: last?.connectedBssid ?? null,
    networks: aps.filter((a) => a.lastSeenAt.getTime() >= since).map((a) => ({
      id: a.id, ssid: a.network.ssid, bssid: a.bssid, dbm: a.lastDbm, frequency: a.frequency, channel: a.channel, band: a.band, security: a.security,
      firstSeenAt: a.firstSeenAt, lastSeenAt: a.lastSeenAt, locationConfidence: a.locations[0]?.confidence ?? "UNKNOWN",
    })),
  });
}

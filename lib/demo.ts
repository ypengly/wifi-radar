import type { Net } from "@/components/types";
import { bandFromFreq, channelFromFreq } from "./signal";

// DEMO DATA ONLY. Generated in the browser, never sent to or stored by the API.
const seed: [string, number, number, string][] = [
  ["Demo-Home", -42, 5180, "WPA3"], ["Demo-Home-2G", -48, 2437, "WPA2"], ["Demo-Cafe", -61, 2412, "Open"], ["Demo-Office", -67, 5745, "WPA2 Enterprise"],
  ["Demo-Neighbor", -74, 2462, "WPA2"], ["Demo-Guest", -79, 2437, "Open"], ["Demo-6E", -58, 6115, "WPA3"], ["", -86, 2412, "WPA2"], ["Demo-Printer", -83, 2462, "WPA2"],
];
export function demoNetworks(tick: number): Net[] {
  const now = new Date().toISOString();
  return seed.map(([ssid, dbm, frequency, security], i) => ({
    id: `demo-${i}`, ssid, bssid: `02:de:00:00:00:${i.toString(16).padStart(2, "0")}`,
    dbm: Math.round(dbm + Math.sin((tick + i * 3) / 3) * 3), frequency, channel: channelFromFreq(frequency), band: bandFromFreq(frequency),
    security, firstSeenAt: now, lastSeenAt: now, locationConfidence: "UNKNOWN",
  }));
}

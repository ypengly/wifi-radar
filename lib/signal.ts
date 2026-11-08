export type Band = "2.4 GHz" | "5 GHz" | "6 GHz";
export const bandFromFreq = (f: number): Band => (f < 3000 ? "2.4 GHz" : f < 5925 ? "5 GHz" : "6 GHz");
export function channelFromFreq(f: number): number {
  if (f === 2484) return 14;
  if (f < 3000) return Math.round((f - 2407) / 5);
  if (f < 5925) return Math.round((f - 5000) / 5);
  return Math.round((f - 5950) / 5);
}
export const dbmToPercent = (dbm: number) => Math.max(0, Math.min(100, Math.round(2 * (dbm + 100))));
export type Strength = "strong" | "fair" | "weak";
export const strengthOf = (dbm: number): Strength => (dbm >= -60 ? "strong" : dbm >= -75 ? "fair" : "weak");
export const strengthColor: Record<Strength, string> = { strong: "#2ee6a6", fair: "#ffb020", weak: "#ff4d6a" };
export function normalizeSecurity(raw: string): string {
  const s = raw.toUpperCase();
  if (!s || s === "--" || s === "OPEN" || s === "NONE" || s === "[ESS]") return "Open";
  const eap = /EAP|ENTERPRISE|802\.1X/.test(s) ? " Enterprise" : "";
  if (/SAE|WPA3/.test(s)) return /WPA2/.test(s) ? "WPA2/WPA3" + eap : "WPA3" + eap;
  if (/WPA2|RSN/.test(s)) return "WPA2" + eap;
  if (/WPA/.test(s)) return "WPA" + eap;
  if (/WEP/.test(s)) return "WEP";
  return "Unknown";
}
export const isOpen = (sec: string) => sec === "Open";

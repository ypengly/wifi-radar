"use client";
import { motion } from "framer-motion";
import { strengthColor, strengthOf } from "@/lib/signal";
import type { Net } from "./types";

// Rings are signal-strength levels, not distances. Angle is a stable hash of the BSSID (arbitrary — a scan has no direction data).
const RINGS = [-50, -65, -80, -95];
const hash = (s: string) => { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; };
const radiusFor = (dbm: number) => 0.12 + 0.82 * Math.min(1, Math.max(0, (-dbm - 30) / 65));

export default function Radar({ nets, selected, onSelect, active }: { nets: Net[]; selected?: string; onSelect: (id: string) => void; active: boolean }) {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[560px]">
      <div className={`sweep absolute inset-[3%] rounded-full ${active ? "" : "paused"}`} aria-hidden />
      <svg viewBox="-100 -100 200 200" className="absolute inset-0 h-full w-full" role="img" aria-label={`Radar showing ${nets.length} networks`}>
        {RINGS.map((r, i) => (<g key={r}>
          <circle r={96 * (i + 1) / 4} fill="none" stroke="#22e3ff" strokeOpacity={0.18} />
          <text x={2} y={-96 * (i + 1) / 4 + 6} fontSize={4.5} fill="#7fb4ff" opacity={0.7}>{r} dBm</text>
        </g>))}
        <line x1={-96} x2={96} stroke="#22e3ff" strokeOpacity={0.1} /><line y1={-96} y2={96} stroke="#22e3ff" strokeOpacity={0.1} />
        <circle r={2.2} fill="#22e3ff" />
        {nets.map((n) => {
          const a = (hash(n.bssid) % 3600) / 10 * Math.PI / 180, r = radiusFor(n.dbm) * 96, sel = n.id === selected;
          return (
            <motion.g key={n.id} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1, x: Math.cos(a) * r, y: Math.sin(a) * r }} transition={{ type: "spring", stiffness: 120, damping: 16 }}
              onClick={() => onSelect(n.id)} style={{ cursor: "pointer" }} tabIndex={0} role="button" aria-label={`${n.ssid || "Hidden network"}, ${n.dbm} dBm`}
              onKeyDown={(e: React.KeyboardEvent) => (e.key === "Enter" || e.key === " ") && onSelect(n.id)}>
              <circle r={9} fill="transparent" />
              {sel && <circle r={6} fill="none" stroke="#fff" strokeWidth={0.8} />}
              <circle r={3.2} fill={strengthColor[strengthOf(n.dbm)]} />
              {sel && <text y={-8} textAnchor="middle" fontSize={5} fill="#fff">{n.ssid || "Hidden"}</text>}
            </motion.g>
          );
        })}
      </svg>
    </div>
  );
}

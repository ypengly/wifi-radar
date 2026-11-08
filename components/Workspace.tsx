"use client";
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Play, Square, RefreshCw, Search, Lock, LockOpen, AlertTriangle } from "lucide-react";
import Radar from "./Radar";
import type { Net } from "./types";
import { dbmToPercent, isOpen, strengthColor, strengthOf } from "@/lib/signal";
import { demoNetworks } from "@/lib/demo";

type Mode = "live" | "demo";
type State = "ready" | "scanning" | "completed" | "signin" | "error";
const FILTERS = ["All", "Secure", "Open", "Strong", "Weak", "2.4 GHz", "5 GHz", "6 GHz"] as const;
type Filter = (typeof FILTERS)[number];
const STATE_LABEL: Record<State, string> = { ready: "Ready", scanning: "Updating", completed: "Up to date", signin: "Sign-in required", error: "Error" };

export default function Workspace({ view }: { view: "dashboard" | "networks" }) {
  const [mode, setMode] = useState<Mode>("live");
  const [nets, setNets] = useState<Net[]>([]);
  const [state, setState] = useState<State>("ready");
  const [auto, setAuto] = useState(false);
  const [intervalS, setIntervalS] = useState(10);
  const [lastScan, setLastScan] = useState<string | null>(null);
  const [connected, setConnected] = useState<string | null>(null);
  const [source, setSource] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("All");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"signal" | "name" | "channel">("signal");
  const [sel, setSel] = useState<string>();
  const [tick, setTick] = useState(0);

  const refresh = useCallback(async () => {
    if (mode === "demo") { setTick((t) => t + 1); setNets(demoNetworks(tick + 1)); setLastScan(new Date().toISOString()); setSource("demo"); setState("completed"); return; }
    setState("scanning");
    try {
      const r = await fetch("/api/v1/networks", { cache: "no-store" });
      if (r.status === 401) { setState("signin"); return; }
      if (!r.ok) throw new Error();
      const d = await r.json();
      setNets(d.networks); setLastScan(d.lastScanAt); setConnected(d.connectedBssid); setSource(d.source); setState("completed");
    } catch { setState("error"); }
  }, [mode, tick]);

  useEffect(() => { setNets([]); setSel(undefined); setLastScan(null); setConnected(null); refresh(); /* eslint-disable-next-line */ }, [mode]);
  useEffect(() => { if (!auto) return; const id = setInterval(refresh, intervalS * 1000); return () => clearInterval(id); }, [auto, intervalS, refresh]);

  const stats = useMemo(() => ({
    total: nets.length, secure: nets.filter((n) => !isOpen(n.security)).length, open: nets.filter((n) => isOpen(n.security)).length,
    strong: nets.filter((n) => strengthOf(n.dbm) === "strong").length, weak: nets.filter((n) => strengthOf(n.dbm) === "weak").length,
  }), [nets]);

  const list = useMemo(() => {
    const f = nets.filter((n) => {
      if (q && !`${n.ssid} ${n.bssid}`.toLowerCase().includes(q.toLowerCase())) return false;
      switch (filter) {
        case "Secure": return !isOpen(n.security); case "Open": return isOpen(n.security);
        case "Strong": return strengthOf(n.dbm) === "strong"; case "Weak": return strengthOf(n.dbm) === "weak";
        case "2.4 GHz": case "5 GHz": case "6 GHz": return n.band === filter; default: return true;
      }
    });
    return f.sort((a, b) => sort === "signal" ? b.dbm - a.dbm : sort === "name" ? a.ssid.localeCompare(b.ssid) : a.channel - b.channel);
  }, [nets, q, filter, sort]);

  const selected = nets.find((n) => n.id === sel);
  const connectedNet = connected ? nets.find((n) => n.bssid === connected) : undefined;

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      <header className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold mr-auto">{view === "dashboard" ? "Dashboard" : "Nearby networks"}</h1>
        <div className="glass flex p-1 text-sm" role="group" aria-label="Data source">
          {(["live", "demo"] as Mode[]).map((m) => (
            <button key={m} onClick={() => setMode(m)} aria-pressed={mode === m} className={`px-4 py-2 rounded-xl ${mode === m ? "bg-volt text-white" : "text-slate-300"}`}>{m === "live" ? "Live scanner" : "Demo"}</button>
          ))}
        </div>
      </header>

      {mode === "demo" && <p className="rounded-xl border border-warn/40 bg-warn/10 px-4 py-3 text-sm text-warn flex gap-2"><AlertTriangle size={18} className="shrink-0 mt-0.5" />Demo mode: these networks are simulated in your browser and are not real. Switch to Live scanner to see data from a paired device.</p>}
      {mode === "live" && state === "signin" && <p className="glass px-4 py-3 text-sm">Sign in to see scans from your paired devices. <Link href="/login" className="text-radar underline">Sign in</Link></p>}
      {mode === "live" && state === "error" && <p className="rounded-xl border border-bad/40 bg-bad/10 px-4 py-3 text-sm text-bad">Couldn’t load networks. Check that the server and database are running, then refresh.</p>}

      <section className="grid grid-cols-2 md:grid-cols-5 gap-3" aria-label="Summary">
        {([["Detected", stats.total], ["Secure", stats.secure], ["Open", stats.open], ["Strong", stats.strong], ["Weak", stats.weak]] as const).map(([l, v]) => (
          <div key={l} className="glass px-4 py-3"><div className="text-3xl font-semibold">{v}</div><div className="text-sm text-slate-400">{l}</div></div>
        ))}
      </section>

      <section className="glass p-3 flex flex-wrap items-center gap-3 text-sm">
        <span className="flex items-center gap-2 font-medium"><span className={`h-2.5 w-2.5 rounded-full ${state === "completed" ? "bg-good" : state === "scanning" ? "bg-radar animate-pulse" : state === "ready" ? "bg-slate-500" : "bg-bad"}`} />{STATE_LABEL[state]}</span>
        <span className="text-slate-400">{lastScan ? `Last scan ${new Date(lastScan).toLocaleTimeString()}` : "No scans yet"}{source ? ` · ${source === "demo" ? "demo" : source.toLowerCase()}` : ""}</span>
        <span className="text-slate-400">{connectedNet ? `Connected: ${connectedNet.ssid}` : mode === "live" ? "Connected network: not reported" : ""}</span>
        <div className="ml-auto flex items-center gap-2">
          <select aria-label="Refresh interval" value={intervalS} onChange={(e) => setIntervalS(+e.target.value)} className="bg-navy border border-edge rounded-lg px-2 py-2">
            {[5, 10, 30, 60].map((s) => <option key={s} value={s}>{s}s</option>)}
          </select>
          <button onClick={() => setAuto((a) => !a)} className="flex items-center gap-2 rounded-lg bg-volt/90 px-3 py-2 min-h-[40px]">{auto ? <><Square size={16} />Stop</> : <><Play size={16} />Auto-refresh</>}</button>
          <button onClick={refresh} className="flex items-center gap-2 rounded-lg border border-edge px-3 py-2 min-h-[40px]"><RefreshCw size={16} />Refresh</button>
        </div>
        <p className="w-full text-xs text-slate-500">Refresh reloads the latest results your scanner has sent. Scan timing is set by the scanner app; operating systems limit how often Wi-Fi can be scanned.</p>
      </section>

      <div className={view === "dashboard" ? "grid lg:grid-cols-[minmax(0,1fr)_380px] gap-4" : ""}>
        {view === "dashboard" && (
          <section className="glass p-4" aria-label="Radar">
            {nets.length === 0 ? <Empty mode={mode} state={state} /> : <Radar nets={list} selected={sel} onSelect={setSel} active={auto || state === "scanning"} />}
            <p className="mt-3 text-xs text-slate-500 text-center">Distance from centre shows signal strength, not physical distance. Direction is arbitrary — a Wi-Fi scan has no bearing data.</p>
          </section>
        )}
        <section className="glass p-4 min-w-0" aria-label="Networks">
          <div className="flex flex-wrap gap-2 mb-3">
            <label className="relative flex-1 min-w-[180px]"><Search size={16} className="absolute left-3 top-3 text-slate-500" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or BSSID" className="w-full bg-navy border border-edge rounded-lg pl-9 pr-3 py-2.5 text-sm" /></label>
            <select aria-label="Sort" value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="bg-navy border border-edge rounded-lg px-2 py-2.5 text-sm"><option value="signal">Signal</option><option value="name">Name</option><option value="channel">Channel</option></select>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 mb-2">{FILTERS.map((f) => <button key={f} onClick={() => setFilter(f)} aria-pressed={filter === f} className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-sm ${filter === f ? "border-radar text-radar" : "border-edge text-slate-300"}`}>{f}</button>)}</div>
          <ul className="space-y-2 max-h-[560px] overflow-y-auto">
            {list.map((n) => (
              <li key={n.id}><button onClick={() => setSel(n.id)} className={`w-full text-left rounded-xl border px-3 py-3 ${n.id === sel ? "border-radar bg-radar/5" : "border-edge hover:bg-white/5"}`}>
                <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ background: strengthColor[strengthOf(n.dbm)] }} /><span className="font-medium truncate">{n.ssid || "Hidden network"}</span>{isOpen(n.security) ? <LockOpen size={14} className="text-warn" /> : <Lock size={14} className="text-slate-400" />}<span className="ml-auto text-sm tabular-nums">{n.dbm} dBm · {dbmToPercent(n.dbm)}%</span></div>
                <div className="text-xs text-slate-400 mt-1">{n.band} · ch {n.channel} · {n.security}</div>
              </button></li>
            ))}
            {nets.length > 0 && list.length === 0 && <li className="text-sm text-slate-400 py-6 text-center">No networks match these filters.</li>}
          </ul>
          {selected && <Detail n={selected} />}
        </section>
      </div>
    </div>
  );
}

function Detail({ n }: { n: Net }) {
  const rows: [string, string][] = [
    ["BSSID", n.bssid], ["Signal", `${n.dbm} dBm (${dbmToPercent(n.dbm)}%, ${strengthOf(n.dbm)})`], ["Band", n.band], ["Channel", `${n.channel} (${n.frequency} MHz)`], ["Security", n.security],
    ["Distance", "Not estimated (no calibrated model)"], ["Location", n.locationConfidence === "UNKNOWN" ? "Unknown — not plotted on the map" : n.locationConfidence],
    ["First seen", new Date(n.firstSeenAt).toLocaleString()], ["Last seen", new Date(n.lastSeenAt).toLocaleString()],
  ];
  return <dl className="mt-4 rounded-xl border border-edge p-3 text-sm grid grid-cols-[110px_1fr] gap-y-1.5"><dt className="col-span-2 font-semibold mb-1">{n.ssid || "Hidden network"}</dt>{rows.map(([k, v]) => <Fragment key={k}><dt className="text-slate-400">{k}</dt><dd className="break-all">{v}</dd></Fragment>)}</dl>;
}

function Empty({ mode, state }: { mode: Mode; state: State }) {
  return <div className="aspect-square max-h-[420px] mx-auto flex flex-col items-center justify-center text-center gap-2 px-6">
    <p className="font-medium">{state === "signin" ? "Sign in to load your scans" : "No networks yet"}</p>
    {mode === "live" && state !== "signin" && <p className="text-sm text-slate-400 max-w-sm">Pair a scanner (Android app or desktop agent, see docs/PLATFORMS.md) and send a scan, or switch to Demo to explore the interface.</p>}
  </div>;
}

"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gauge, Radar, Wifi, Map, Activity, History, Settings, Info } from "lucide-react";

const nav = [
  { href: "/", label: "Dashboard", icon: Gauge, ready: true },
  { href: "/networks", label: "Nearby networks", icon: Wifi, ready: true },
  { href: "#", label: "Wi-Fi radar", icon: Radar, ready: true, alias: "/" },
  { href: "#", label: "Map", icon: Map, ready: false },
  { href: "#", label: "Analytics", icon: Activity, ready: false },
  { href: "#", label: "Scan history", icon: History, ready: false },
  { href: "#", label: "Settings", icon: Settings, ready: false },
  { href: "#", label: "About", icon: Info, ready: false },
];

export default function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const mobile = nav.filter((n) => n.ready && n.href !== "#");
  return (
    <div className="md:flex min-h-screen">
      <aside className="hidden md:flex w-60 shrink-0 flex-col gap-1 p-4 border-r border-edge/60">
        <div className="flex items-center gap-2 px-2 py-3 text-lg font-semibold"><Radar className="text-radar" /> WiFi Radar</div>
        {nav.map(({ href, label, icon: Icon, ready }) => ready
          ? <Link key={label} href={href === "#" ? "/" : href} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm ${path === href ? "bg-volt/20 text-white" : "text-slate-300 hover:bg-white/5"}`}><Icon size={18} />{label}</Link>
          : <span key={label} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-500 cursor-not-allowed" title="Planned for a later build stage"><Icon size={18} />{label}<span className="ml-auto text-[11px] text-slate-600">soon</span></span>)}
      </aside>
      <main className="flex-1 min-w-0 p-4 md:p-6 pb-24 md:pb-6">{children}</main>
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-20 flex justify-around border-t border-edge bg-ink/95 backdrop-blur py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {mobile.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className={`flex flex-col items-center gap-1 px-6 py-1 text-xs ${path === href ? "text-radar" : "text-slate-400"}`}><Icon size={22} />{label.split(" ")[0]}</Link>
        ))}
      </nav>
    </div>
  );
}

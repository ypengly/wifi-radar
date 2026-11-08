"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const r = useRouter();
  const [err, setErr] = useState("");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setErr("");
    const f = new FormData(e.currentTarget);
    const res = await fetch("/api/v1/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: f.get("email"), password: f.get("password") }) });
    if (res.ok) { r.push("/"); r.refresh(); } else setErr((await res.json().catch(() => ({}))).error ?? "Sign-in failed");
  }
  return (
    <main className="min-h-screen grid place-items-center p-4">
      <form onSubmit={submit} className="glass w-full max-w-sm p-6 space-y-4">
        <h1 className="text-xl font-semibold">Sign in to WiFi Radar</h1>
        <label className="block text-sm">Email<input name="email" type="email" required autoComplete="email" className="mt-1 w-full bg-navy border border-edge rounded-lg px-3 py-2.5" /></label>
        <label className="block text-sm">Password<input name="password" type="password" required autoComplete="current-password" className="mt-1 w-full bg-navy border border-edge rounded-lg px-3 py-2.5" /></label>
        {err && <p className="text-sm text-bad" role="alert">{err}</p>}
        <button className="w-full rounded-lg bg-volt py-2.5 font-medium">Sign in</button>
      </form>
    </main>
  );
}

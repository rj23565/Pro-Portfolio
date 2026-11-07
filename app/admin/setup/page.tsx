"use client";
import { useState } from "react";
export default function SetupPage() {
  const [pw, setPw] = useState("");
  const [token, setToken] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(""); setMsg("");
    try {
      const res = await fetch("/api/auth/setup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: pw, setupToken: token }) });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Failed");
      setMsg("Password set. You can now sign in.");
    } catch (e:any) { setErr(e.message); }
  }

  return (
    <div className="min-h-[70vh] grid place-items-center p-6">
      <div className="max-w-md w-full rounded-[28px] bg-white p-8 border border-ink/10 shadow-royal">
        <h1 className="font-display text-2xl font-semibold">Initial admin setup</h1>
        <p className="mt-2 text-sm text-ink/60">Create the first admin password. If ADMIN_SETUP_TOKEN is set in env, you must provide it. Otherwise this works only when no admin exists.</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="font-mono text-xs tracking-widest">NEW PASSWORD</label>
            <input type="password" required value={pw} onChange={e=>setPw(e.target.value)} className="mt-2 w-full rounded-xl border border-ink/15 px-4 py-3 text-sm" placeholder="Min 8 characters" />
          </div>
          <div>
            <label className="font-mono text-xs tracking-widest">SETUP TOKEN (if required)</label>
            <input type="password" value={token} onChange={e=>setToken(e.target.value)} className="mt-2 w-full rounded-xl border border-ink/15 px-4 py-3 text-sm" placeholder="Leave empty if not set" />
          </div>
          {err && <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">{err}</div>}
          {msg && <div className="rounded-xl bg-green-50 border border-green-200 p-3 text-sm text-green-700">{msg}</div>}
          <button className="w-full rounded-full bg-ink text-white py-3 font-semibold">Create password</button>
          <a href="/admin/login" className="block text-center text-sm text-ink/60 hover:underline">Go to login</a>
        </form>
      </div>
    </div>
  );
}

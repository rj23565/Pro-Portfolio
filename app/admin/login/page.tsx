"use client";
import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const sp = useSearchParams();
  const router = useRouter();
  const next = sp.get("next") || "/admin";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // fetch csrf cookie first (set by server)
      const csrf = document.cookie.split("; ").find(r=>r.startsWith("csrf_token="))?.split("=")[1] || "";
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-csrf-token": csrf },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      router.push(next);
    } catch (err:any) {
      setError(err.message);
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-[70vh] grid place-items-center p-6">
      <div className="w-full max-w-md rounded-[28px] bg-white border border-ink/10 shadow-royal p-8">
        <div className="h-12 w-12 rounded-2xl bg-ink text-white grid place-items-center font-display font-bold">W</div>
        <h1 className="mt-4 font-display text-2xl font-semibold">Admin access</h1>
        <p className="mt-2 text-sm leading-6 text-ink/70">Sign in to manage Wahab&apos;s portfolio. Rate-limited and protected with secure HttpOnly cookies.</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="pw" className="font-mono text-xs tracking-widest text-ink/60">ADMIN PASSWORD</label>
            <input id="pw" type="password" required autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} className="mt-2 w-full rounded-xl border border-ink/15 px-4 py-3 text-sm focus:border-ink focus:ring-2 focus:ring-ink/10 outline-none" placeholder="••••••••" />
          </div>
          {error && <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}
          <button disabled={loading} className="w-full rounded-full bg-ink text-white py-3 font-semibold hover:bg-ink-light transition disabled:opacity-50">
            {loading ? "Signing in…" : "Sign in"}
          </button>
          <div className="text-center">
            <a href="/" className="text-xs text-ink/60 hover:underline">← Back to site</a>
          </div>
        </form>
        <div className="mt-6 rounded-xl bg-ivory-soft p-3 text-xs leading-5 text-ink/60">
          First time? <a href="/admin/setup" className="underline">Set up admin password</a><br/>
          If you forgot the password, rotate SESSION_SECRET and reset via setup token in Vercel env.
        </div>
      </div>
    </div>
  );
}

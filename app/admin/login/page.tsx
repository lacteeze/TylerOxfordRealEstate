"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      setError("Invalid email or password.");
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  const fieldStyle: React.CSSProperties = {
    background: "var(--field)",
    border: "1px solid rgba(var(--ink-rgb),.15)",
    color: "var(--ink)",
    borderRadius: 8,
    padding: "12px 14px",
    fontSize: 14,
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center" style={{ padding: "clamp(44px,6vw,72px) clamp(20px,4vw,48px)" }}>
      <form
        onSubmit={onSubmit}
        className="flex w-full max-w-[420px] flex-col gap-5 rounded-[14px] border"
        style={{ background: "var(--bg2)", borderColor: "rgba(var(--ink-rgb),.12)", padding: "clamp(28px,4vw,44px)" }}
      >
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".3em", color: "var(--gold)", marginBottom: 12 }}>
            PRIVATE — TYLER ONLY
          </div>
          <h1 className="font-serif-display m-0" style={{ fontSize: 34, fontWeight: 500 }}>
            Sign in
          </h1>
        </div>
        <label className="flex flex-col gap-1.5">
          <span style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: ".18em", color: "rgba(var(--ink-rgb),.55)" }}>EMAIL</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={fieldStyle} autoComplete="email" />
        </label>
        <label className="flex flex-col gap-1.5">
          <span style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: ".18em", color: "rgba(var(--ink-rgb),.55)" }}>PASSWORD</span>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={fieldStyle} autoComplete="current-password" />
        </label>
        {error && <span style={{ fontSize: 13, color: "#c96a5a" }}>{error}</span>}
        <button
          type="submit"
          disabled={busy}
          className="cursor-pointer border-none transition-colors hover:!bg-[var(--gold-hov)] disabled:opacity-60"
          style={{ fontSize: 12, fontWeight: 600, letterSpacing: ".08em", padding: "14px 26px", background: "var(--gold)", color: "var(--gold-ink)" }}
        >
          {busy ? "SIGNING IN…" : "SIGN IN"}
        </button>
      </form>
    </div>
  );
}

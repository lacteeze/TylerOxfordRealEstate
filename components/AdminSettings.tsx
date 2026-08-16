"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AdminSettings({
  configured,
  email,
  connectedAt,
  banner,
  bannerMessage,
}: {
  configured: boolean;
  email: string | null;
  connectedAt: string | null;
  banner: "connected" | "error" | null;
  bannerMessage: string | null;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(banner === "error" ? bannerMessage || "" : "");
  const connected = Boolean(email);
  const justConnected = banner === "connected";

  async function disconnect() {
    setBusy(true);
    setError("");
    const res = await fetch("/api/admin/google/status", { method: "DELETE" });
    const json = (await res.json().catch(() => ({}))) as { error?: string };
    setBusy(false);
    if (!res.ok) {
      setError(json.error || "Could not disconnect Google Drive.");
      return;
    }
    router.refresh();
  }

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const fieldNote: React.CSSProperties = {
    fontSize: 13.5,
    lineHeight: 1.65,
    color: "rgba(var(--ink-rgb),.6)",
    maxWidth: 560,
  };

  return (
    <div
      className="max-w-[1100px]"
      style={{ padding: "clamp(44px,6vw,72px) clamp(20px,4vw,48px) clamp(64px,8vw,110px)", minHeight: "80vh" }}
    >
      <div className="flex items-center justify-end gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="btn-pill cursor-pointer border no-underline transition-colors hover:!border-[var(--gold)] hover:!text-[var(--gold)]"
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: ".12em",
              padding: "9px 16px",
              color: "var(--ink)",
              borderColor: "rgba(var(--ink-rgb),.25)",
            }}
          >
            LISTINGS
          </Link>
          <button
            onClick={signOut}
            className="cursor-pointer border bg-transparent transition-colors hover:!border-[var(--gold)] hover:!text-[var(--gold)]"
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: ".12em",
              padding: "9px 16px",
              color: "rgba(var(--ink-rgb),.6)",
              borderColor: "rgba(var(--ink-rgb),.2)",
            }}
          >
            SIGN OUT
          </button>
        </div>
      </div>
      <h1 className="font-serif-display" style={{ margin: "0 0 8px", fontSize: "clamp(38px,4.5vw,60px)", lineHeight: 1, fontWeight: 500 }}>
        Settings
      </h1>
      <p style={{ margin: "0 0 40px", ...fieldNote }}>
        Connect Google Drive so listing photos can be imported from a shared folder.
      </p>

      <div
        className="flex flex-col gap-5 rounded-[14px] border"
        style={{ borderColor: "rgba(var(--ink-rgb),.12)", background: "var(--bg2)", padding: "clamp(24px,3vw,40px)", maxWidth: 640 }}
      >
        <span className="font-serif-display" style={{ fontSize: 26 }}>
          Google Drive
        </span>
        <p style={{ margin: 0, ...fieldNote }}>
          {configured
            ? connected
              ? `Connected as ${email}.`
              : "Not connected. Tyler can authorize read-only access to existing Drive folders."
            : "Add Google OAuth credentials to enable Drive. Create an OAuth client in Google Cloud Console (Web application), enable the Google Drive API, and add authorized redirect URIs for local and production."}
        </p>
        {configured && !connected && (
          <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.6, color: "rgba(var(--ink-rgb),.5)" }}>
            Redirect URI: <code>{`{origin}/api/admin/google/callback`}</code>
            <br />
            Register both <code>http://localhost:3001/api/admin/google/callback</code> and{" "}
            <code>https://tyler-oxford-real-estate.vercel.app/api/admin/google/callback</code>.
          </p>
        )}
        {justConnected && connected && (
          <span style={{ fontSize: 13, color: "var(--navy)" }}>Drive connected. You can import photos from listing folders.</span>
        )}
        {connectedAt && connected && (
          <span style={{ fontSize: 12, color: "rgba(var(--ink-rgb),.45)" }}>
            Connected {new Date(connectedAt).toLocaleString("en-CA")}
          </span>
        )}
        {error && (
          <span role="alert" style={{ fontSize: 13, color: "#c96a5a", lineHeight: 1.45 }}>
            {error}
          </span>
        )}
        <div className="flex flex-wrap gap-3">
          {configured ? (
            connected ? (
              <button
                onClick={disconnect}
                disabled={busy}
                className="cursor-pointer border bg-transparent transition-colors hover:!border-[#c96a5a] hover:!text-[#c96a5a] disabled:opacity-60"
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: ".08em",
                  padding: "14px 26px",
                  color: "rgba(var(--ink-rgb),.7)",
                  borderColor: "rgba(var(--ink-rgb),.25)",
                }}
              >
                {busy ? "DISCONNECTING…" : "DISCONNECT"}
              </button>
            ) : (
              <a
                href="/api/admin/google/connect"
                className="btn-pill inline-block cursor-pointer border-none no-underline transition-colors hover:!bg-[var(--gold-hov)]"
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: ".08em",
                  padding: "14px 26px",
                  background: "var(--gold)",
                  color: "var(--gold-ink)",
                }}
              >
                CONNECT GOOGLE DRIVE
              </a>
            )
          ) : null}
        </div>
      </div>
    </div>
  );
}

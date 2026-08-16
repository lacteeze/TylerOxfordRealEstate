"use client";

import { useActionState } from "react";
import { signIn, type SignInState } from "./actions";

export default function AdminLogin() {
  const [state, formAction, pending] = useActionState<SignInState, FormData>(
    signIn,
    undefined
  );

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
        action={formAction}
        className="flex w-full max-w-[420px] flex-col gap-5 rounded-[14px] border"
        style={{ background: "var(--bg2)", borderColor: "rgba(var(--ink-rgb),.12)", padding: "clamp(28px,4vw,44px)" }}
      >
        <div>
          <h1 className="font-serif-display m-0" style={{ fontSize: 34, fontWeight: 500 }}>
            Sign in
          </h1>
        </div>
        <label className="flex flex-col gap-1.5">
          <span style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: ".18em", color: "rgba(var(--ink-rgb),.55)" }}>EMAIL</span>
          <input
            type="email"
            name="email"
            required
            style={fieldStyle}
            autoComplete="email"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: ".18em", color: "rgba(var(--ink-rgb),.55)" }}>PASSWORD</span>
          <input
            type="password"
            name="password"
            required
            style={fieldStyle}
            autoComplete="current-password"
          />
        </label>
        {state?.error && (
          <span role="alert" style={{ fontSize: 13, color: "#c96a5a", lineHeight: 1.45 }}>
            {state.error}
          </span>
        )}
        <button
          type="submit"
          disabled={pending}
          className="cursor-pointer border-none transition-colors hover:!bg-[var(--gold-hov)] disabled:opacity-60"
          style={{ fontSize: 12, fontWeight: 600, letterSpacing: ".08em", padding: "14px 26px", background: "var(--gold)", color: "var(--gold-ink)" }}
        >
          {pending ? "SIGNING IN…" : "SIGN IN"}
        </button>
      </form>
    </div>
  );
}

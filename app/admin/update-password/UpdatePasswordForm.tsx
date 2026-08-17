"use client";

import { useActionState } from "react";
import { updatePassword, type UpdatePasswordState } from "./actions";

const fieldStyle: React.CSSProperties = {
  background: "var(--field)",
  border: "1px solid rgba(var(--ink-rgb),.15)",
  color: "var(--ink)",
  borderRadius: 8,
  padding: "12px 14px",
  fontSize: 14,
  width: "100%",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  fontSize: 10.5,
  fontWeight: 600,
  letterSpacing: ".18em",
  color: "rgba(var(--ink-rgb),.55)",
};

export default function UpdatePasswordForm() {
  const [state, formAction, pending] = useActionState<UpdatePasswordState, FormData>(
    updatePassword,
    undefined
  );

  return (
    <div className="flex min-h-[70vh] items-center justify-center" style={{ padding: "clamp(28px,6vw,72px) clamp(16px,4vw,48px)" }}>
      <form
        action={formAction}
        className="flex w-full min-w-0 max-w-[420px] flex-col gap-5 rounded-[14px] border"
        style={{ background: "var(--bg2)", borderColor: "rgba(var(--ink-rgb),.12)", padding: "clamp(24px,4vw,44px)" }}
      >
        <div>
          <h1 className="font-serif-display m-0" style={{ fontSize: "clamp(26px,7vw,34px)", fontWeight: 500 }}>
            Set a new password
          </h1>
          <p style={{ margin: "10px 0 0", fontSize: 13.5, lineHeight: 1.5, color: "rgba(var(--ink-rgb),.55)" }}>
            Choose a password for this admin account, then continue to the dashboard.
          </p>
        </div>
        <label className="flex flex-col gap-1.5">
          <span style={labelStyle}>NEW PASSWORD</span>
          <input
            type="password"
            name="password"
            required
            minLength={8}
            style={fieldStyle}
            autoComplete="new-password"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span style={labelStyle}>CONFIRM PASSWORD</span>
          <input
            type="password"
            name="confirm"
            required
            minLength={8}
            style={fieldStyle}
            autoComplete="new-password"
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
          className="min-h-11 w-full cursor-pointer border-none transition-colors hover:!bg-[var(--gold-hov)] disabled:opacity-60"
          style={{ fontSize: 12, fontWeight: 600, letterSpacing: ".08em", padding: "14px 26px", background: "var(--gold)", color: "var(--gold-ink)" }}
        >
          {pending ? "SAVING…" : "SAVE PASSWORD"}
        </button>
      </form>
    </div>
  );
}

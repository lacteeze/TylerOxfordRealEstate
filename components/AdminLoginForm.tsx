"use client";

import { useActionState, useState } from "react";
import {
  requestAdminLink,
  signIn,
  type AuthLinkState,
  type SignInState,
} from "@/app/admin/login/actions";

const fieldStyle: React.CSSProperties = {
  background: "var(--field)",
  border: "1px solid rgba(var(--ink-rgb),.15)",
  color: "var(--ink)",
  borderRadius: 8,
  padding: "12px 14px",
  fontSize: 14,
};

const labelStyle: React.CSSProperties = {
  fontSize: 10.5,
  fontWeight: 600,
  letterSpacing: ".18em",
  color: "rgba(var(--ink-rgb),.55)",
};

export default function AdminLoginForm({ linkError }: { linkError?: boolean }) {
  const [forgot, setForgot] = useState(false);
  const [signInState, signInAction, signingIn] = useActionState<SignInState, FormData>(
    signIn,
    undefined
  );
  const [linkState, linkAction, sendingLink] = useActionState<AuthLinkState, FormData>(
    requestAdminLink,
    undefined
  );

  const success = linkState && "ok" in linkState && linkState.ok ? linkState.message : null;
  const error =
    (signInState && "error" in signInState ? signInState.error : null) ||
    (linkState && "error" in linkState ? linkState.error : null) ||
    (linkError && !success
      ? "That sign-in or reset link is invalid or expired. Request a new one below."
      : null);

  return (
    <div className="flex min-h-[70vh] items-center justify-center" style={{ padding: "clamp(44px,6vw,72px) clamp(20px,4vw,48px)" }}>
      <form
        action={forgot ? linkAction : signInAction}
        className="flex w-full max-w-[420px] flex-col gap-5 rounded-[14px] border"
        style={{ background: "var(--bg2)", borderColor: "rgba(var(--ink-rgb),.12)", padding: "clamp(28px,4vw,44px)" }}
      >
        <div>
          <h1 className="font-serif-display m-0" style={{ fontSize: 34, fontWeight: 500 }}>
            {forgot ? "Forgot password" : "Sign in"}
          </h1>
          {forgot && (
            <p style={{ margin: "10px 0 0", fontSize: 13.5, lineHeight: 1.5, color: "rgba(var(--ink-rgb),.55)" }}>
              Email a one-time sign-in link, or a link to set a new password.
            </p>
          )}
        </div>
        <label className="flex flex-col gap-1.5">
          <span style={labelStyle}>EMAIL</span>
          <input
            type="email"
            name="email"
            required
            style={fieldStyle}
            autoComplete="email"
          />
        </label>
        {!forgot && (
          <label className="flex flex-col gap-1.5">
            <span style={labelStyle}>PASSWORD</span>
            <input
              type="password"
              name="password"
              required
              style={fieldStyle}
              autoComplete="current-password"
            />
          </label>
        )}
        {!forgot && (
          <label className="flex items-center gap-2.5" style={{ fontSize: 13.5, color: "var(--ink)" }}>
            <input type="checkbox" name="remember" value="1" defaultChecked />
            Remember me
          </label>
        )}
        {success && (
          <span role="status" style={{ fontSize: 13, color: "var(--ink)", lineHeight: 1.45 }}>
            {success}
          </span>
        )}
        {error && (
          <span role="alert" style={{ fontSize: 13, color: "#c96a5a", lineHeight: 1.45 }}>
            {error}
          </span>
        )}
        {forgot ? (
          <div className="flex flex-col gap-2.5">
            <button
              type="submit"
              name="intent"
              value="magic"
              disabled={sendingLink}
              className="cursor-pointer border-none transition-colors hover:!bg-[var(--gold-hov)] disabled:opacity-60"
              style={{ fontSize: 12, fontWeight: 600, letterSpacing: ".08em", padding: "14px 26px", background: "var(--gold)", color: "var(--gold-ink)" }}
            >
              {sendingLink ? "SENDING…" : "EMAIL SIGN-IN LINK"}
            </button>
            <button
              type="submit"
              name="intent"
              value="recovery"
              disabled={sendingLink}
              className="cursor-pointer border bg-transparent transition-colors hover:!border-[var(--gold)] hover:!text-[var(--gold)] disabled:opacity-60"
              style={{ fontSize: 12, fontWeight: 600, letterSpacing: ".08em", padding: "14px 26px", color: "var(--ink)", borderColor: "rgba(var(--ink-rgb),.25)" }}
            >
              EMAIL PASSWORD RESET
            </button>
            <button
              type="button"
              onClick={() => setForgot(false)}
              className="cursor-pointer border-none bg-transparent"
              style={{ fontSize: 13, color: "rgba(var(--ink-rgb),.6)", padding: "4px 0", textAlign: "left" }}
            >
              ← Back to sign in
            </button>
          </div>
        ) : (
          <>
            <button
              type="submit"
              disabled={signingIn}
              className="cursor-pointer border-none transition-colors hover:!bg-[var(--gold-hov)] disabled:opacity-60"
              style={{ fontSize: 12, fontWeight: 600, letterSpacing: ".08em", padding: "14px 26px", background: "var(--gold)", color: "var(--gold-ink)" }}
            >
              {signingIn ? "SIGNING IN…" : "SIGN IN"}
            </button>
            <button
              type="button"
              onClick={() => setForgot(true)}
              className="cursor-pointer border-none bg-transparent"
              style={{ fontSize: 13, color: "rgba(var(--ink-rgb),.6)", padding: 0, textAlign: "left" }}
            >
              Forgot password?
            </button>
          </>
        )}
      </form>
    </div>
  );
}

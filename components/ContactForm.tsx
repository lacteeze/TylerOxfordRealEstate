"use client";

import { useState, useTransition } from "react";
import { submitLead } from "@/app/actions";

const labelStyle: React.CSSProperties = {
  fontSize: 10.5,
  fontWeight: 600,
  letterSpacing: ".18em",
  color: "rgba(var(--ink-rgb),.55)",
};

const fieldStyle: React.CSSProperties = {
  background: "var(--field)",
  border: "1px solid rgba(var(--ink-rgb),.15)",
  color: "var(--ink)",
  borderRadius: 8,
  padding: "12px 14px",
  fontSize: 14,
};

export default function ContactForm() {
  const [kind, setKind] = useState<"real_estate" | "media">("real_estate");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const res = await submitLead({ kind, name, email, phone, message });
      if (res.ok) setSent(true);
      else setError(res.error || "Something went wrong.");
    });
  }

  if (sent) {
    return (
      <div className="flex flex-col gap-3">
        <span className="font-serif-display" style={{ fontSize: 26 }}>
          Message received.
        </span>
        <span style={{ fontSize: 14, lineHeight: 1.7, color: "rgba(var(--ink-rgb),.6)" }}>
          Tyler will get back to you shortly — usually the same day.
        </span>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex gap-2.5">
        {(
          [
            ["real_estate", "REAL ESTATE INQUIRY"],
            ["media", "MEDIA BOOKING"],
          ] as const
        ).map(([k, label]) => (
          <button
            key={k}
            type="button"
            onClick={() => setKind(k)}
            className="cursor-pointer rounded-full border transition-colors"
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: ".12em",
              padding: "9px 16px",
              background: kind === k ? "var(--gold)" : "transparent",
              color: kind === k ? "var(--gold-ink)" : "rgba(var(--ink-rgb),.7)",
              borderColor: kind === k ? "var(--gold)" : "rgba(var(--ink-rgb),.22)",
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <label className="flex flex-col gap-1.5">
        <span style={labelStyle}>NAME *</span>
        <input value={name} onChange={(e) => setName(e.target.value)} style={fieldStyle} placeholder="Your name" />
      </label>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span style={labelStyle}>EMAIL</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={fieldStyle} placeholder="you@email.com" />
        </label>
        <label className="flex flex-col gap-1.5">
          <span style={labelStyle}>PHONE</span>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} style={fieldStyle} placeholder="(709) 555-0000" />
        </label>
      </div>
      <label className="flex flex-col gap-1.5">
        <span style={labelStyle}>MESSAGE</span>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          style={{ ...fieldStyle, lineHeight: 1.6, resize: "vertical" }}
          placeholder={
            kind === "media"
              ? "Tell us about the property and what you need shot…"
              : "Buying, selling, or just curious — what can Tyler help with?"
          }
        />
      </label>
      {error && (
        <span style={{ fontSize: 13, color: "#c96a5a" }}>{error}</span>
      )}
      <button
        type="submit"
        disabled={pending}
        className="cursor-pointer self-start border-none transition-colors hover:!bg-[var(--gold-hov)] disabled:opacity-60"
        style={{
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: ".08em",
          padding: "14px 26px",
          background: "var(--gold)",
          color: "var(--gold-ink)",
        }}
      >
        {pending ? "SENDING…" : "SEND MESSAGE →"}
      </button>
    </form>
  );
}

"use client";

import { useState, useTransition } from "react";
import { submitLead } from "@/app/actions";
import { MEDIA_SERVICES, type MediaService } from "@/lib/types";

const labelStyle: React.CSSProperties = {
  fontSize: 11.5,
  fontWeight: 600,
  color: "rgba(var(--ink-rgb),.6)",
};

const fieldStyle: React.CSSProperties = {
  background: "var(--card)",
  border: "1px solid transparent",
  color: "var(--ink)",
  borderRadius: 12,
  padding: "12px 16px",
  fontSize: 13.5,
};

export default function ContactForm() {
  const [kind, setKind] = useState<"real_estate" | "media">("real_estate");
  const [services, setServices] = useState<MediaService[]>([]);
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
      const res = await submitLead({ kind, name, email, phone, message, services });
      if (res.ok) setSent(true);
      else setError(res.error || "Something went wrong.");
    });
  }

  if (sent) {
    return (
      <div className="flex flex-col gap-3">
        <span className="font-display" style={{ fontSize: 22, fontWeight: 600 }}>
          Message received.
        </span>
        <span style={{ fontSize: 13.5, lineHeight: 1.7, color: "rgba(var(--ink-rgb),.6)" }}>
          Tyler will get back to you shortly — usually the same day.
        </span>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2.5">
        {(
          [
            ["real_estate", "Real estate inquiry"],
            ["media", "Media booking"],
          ] as const
        ).map(([k, label]) => (
          <button
            key={k}
            type="button"
            onClick={() => setKind(k)}
            className="cursor-pointer rounded-full border-none transition-colors"
            style={{
              fontSize: 12.5,
              fontWeight: 500,
              padding: "10px 18px",
              background: kind === k ? "var(--navy)" : "var(--card)",
              color: kind === k ? "#fff" : "var(--ink)",
            }}
          >
            {label}
          </button>
        ))}
      </div>
      {kind === "media" && (
        <div className="flex flex-col gap-1.5">
          <span style={labelStyle}>What would you like?</span>
          <div className="flex flex-wrap gap-2">
            {MEDIA_SERVICES.map((s) => {
              const active = services.includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  aria-pressed={active}
                  onClick={() =>
                    setServices((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]))
                  }
                  className="cursor-pointer rounded-full transition-colors"
                  style={{
                    fontSize: 12.5,
                    fontWeight: 500,
                    padding: "9px 16px",
                    border: active ? "1px solid var(--navy)" : "1px solid var(--line)",
                    background: active ? "var(--navy)" : "var(--card)",
                    color: active ? "#fff" : "var(--ink)",
                  }}
                >
                  {active ? "✓ " : ""}
                  {s}
                </button>
              );
            })}
          </div>
        </div>
      )}
      <label className="flex flex-col gap-1.5">
        <span style={labelStyle}>Name *</span>
        <input value={name} onChange={(e) => setName(e.target.value)} style={fieldStyle} placeholder="Your name" />
      </label>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span style={labelStyle}>Email</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={fieldStyle} placeholder="you@email.com" />
        </label>
        <label className="flex flex-col gap-1.5">
          <span style={labelStyle}>Phone</span>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} style={fieldStyle} placeholder="(709) 555-0000" />
        </label>
      </div>
      <label className="flex flex-col gap-1.5">
        <span style={labelStyle}>Message</span>
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
      {error && <span style={{ fontSize: 13, color: "#b4483a" }}>{error}</span>}
      <button
        type="submit"
        disabled={pending}
        className="pill-navy self-start disabled:opacity-60"
        style={{ padding: "13px 26px", fontWeight: 600 }}
      >
        {pending ? "Sending…" : "Send message"} <span className="pill-arrow">↗</span>
      </button>
    </form>
  );
}

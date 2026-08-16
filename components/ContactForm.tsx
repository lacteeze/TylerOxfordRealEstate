"use client";

import { useState, useTransition } from "react";
import { submitLead } from "@/app/actions";
import MediaCheckout, { type TravelPreview } from "@/components/MediaCheckout";
import {
  PROPERTY_TYPES,
  type InquiryIntent,
  type PropertyPrefs,
  type PropertyType,
} from "@/lib/inquiry";
import type { ServiceId } from "@/lib/pricing";

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

function toggleChipStyle(active: boolean): React.CSSProperties {
  return {
    fontSize: 12.5,
    fontWeight: 500,
    padding: "10px 18px",
    background: active ? "var(--navy)" : "var(--card)",
    color: active ? "#fff" : "var(--ink)",
  };
}

export default function ContactForm() {
  const [kind, setKind] = useState<"real_estate" | "media">("real_estate");
  const [services, setServices] = useState<ServiceId[]>([]);
  const [intent, setIntent] = useState<InquiryIntent | null>(null);
  const [prefs, setPrefs] = useState<PropertyPrefs>({});
  const [serviceAddress, setServiceAddress] = useState("");
  const [travel, setTravel] = useState<TravelPreview>({ status: "idle" });
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [pending, startTransition] = useTransition();

  function updatePref<K extends keyof PropertyPrefs>(key: K, value: PropertyPrefs[K]) {
    setPrefs((prev) => {
      const next = { ...prev, [key]: value };
      if (!value) delete next[key];
      return next;
    });
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const res = await submitLead({
        kind,
        name,
        email,
        phone,
        message,
        services,
        intent,
        propertyPrefs: prefs,
        serviceAddress,
      });
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

  const mediaBlocked =
    kind === "media" &&
    (services.length === 0 || !serviceAddress.trim() || travel.status !== "ok");
  const sellingBlocked =
    kind === "real_estate" && intent === "selling" && !(prefs.address || "").trim();

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
            style={toggleChipStyle(kind === k)}
          >
            {label}
          </button>
        ))}
      </div>

      {kind === "real_estate" && (
        <div className="flex flex-col gap-3.5">
          <div className="flex flex-col gap-1.5">
            <span style={labelStyle}>I&apos;m looking to</span>
            <div className="flex flex-wrap gap-2.5">
              {(
                [
                  ["buying", "Buying"],
                  ["selling", "Selling"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={intent === value}
                  onClick={() => setIntent(value)}
                  className="cursor-pointer rounded-full border-none transition-colors"
                  style={toggleChipStyle(intent === value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {intent === "selling" && (
            <label className="flex flex-col gap-1.5">
              <span style={labelStyle}>Property address *</span>
              <input
                value={prefs.address ?? ""}
                onChange={(e) => updatePref("address", e.target.value)}
                style={fieldStyle}
                placeholder="Street and city (e.g. 123 Water St, St. John's)"
                autoComplete="street-address"
                required
              />
            </label>
          )}

          <div className="flex flex-col gap-1.5">
            <span style={labelStyle}>
              {intent === "selling" ? "What are you selling?" : "What are you looking for?"}
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              {(
                [
                  ["beds", "Beds", "3"],
                  ["baths", "Baths", "2"],
                  ["parking", "Parking", "1"],
                  ["area", "Area", "Downtown"],
                ] as const
              ).map(([key, label, placeholder]) => (
                <label key={key} className="flex flex-col gap-1">
                  <span style={{ ...labelStyle, fontWeight: 500 }}>{label}</span>
                  <input
                    value={prefs[key] ?? ""}
                    onChange={(e) => updatePref(key, e.target.value)}
                    style={{ ...fieldStyle, padding: "10px 12px" }}
                    placeholder={placeholder}
                  />
                </label>
              ))}
            </div>
            <div className="mt-1 flex flex-wrap gap-2">
              {PROPERTY_TYPES.map((type: PropertyType) => {
                const active = prefs.propertyType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    aria-pressed={active}
                    onClick={() => updatePref("propertyType", active ? undefined : type)}
                    className="cursor-pointer rounded-full transition-colors"
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      padding: "7px 12px",
                      border: active ? "1px solid var(--navy)" : "1px solid var(--line)",
                      background: active ? "var(--navy)" : "var(--card)",
                      color: active ? "#fff" : "var(--ink)",
                    }}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {kind === "media" && (
        <MediaCheckout
          selected={services}
          onChange={setServices}
          serviceAddress={serviceAddress}
          onServiceAddressChange={setServiceAddress}
          travel={travel}
          onTravelChange={setTravel}
        />
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
              : "Anything else Tyler should know?"
          }
        />
      </label>
      {error && <span style={{ fontSize: 13, color: "#b4483a" }}>{error}</span>}
      <button
        type="submit"
        disabled={pending || mediaBlocked || sellingBlocked}
        className="pill-navy self-start disabled:opacity-60"
        style={{ padding: "13px 26px", fontWeight: 600 }}
      >
        {pending ? (kind === "media" ? "Booking…" : "Sending…") : kind === "media" ? "Book Now" : "Send message"}{" "}
        <span className="pill-arrow">↗</span>
      </button>
    </form>
  );
}

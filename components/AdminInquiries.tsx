"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { formatPropertyPrefs } from "@/lib/inquiry";
import { inquiryNeighbors } from "@/lib/inquiry-nav";
import { SERVICE_BY_ID, TRAVEL_FREE_KM, formatCad, isServiceId } from "@/lib/pricing";
import type { Lead } from "@/lib/types";

type KindFilter = "all" | "real_estate" | "media";

const pillBase: React.CSSProperties = {
  fontSize: 12.5,
  fontWeight: 500,
  padding: "10px 18px",
  borderRadius: 999,
  border: "none",
  cursor: "pointer",
};

const labelStyle: React.CSSProperties = {
  fontSize: 10.5,
  fontWeight: 600,
  letterSpacing: ".18em",
  color: "rgba(var(--ink-rgb),.55)",
};

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString("en-CA", {
    timeZone: "America/St_Johns",
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function contactLine(lead: Lead): string {
  return [lead.email, lead.phone].filter(Boolean).join(" · ") || "No contact left";
}

function serviceNames(lead: Lead): string {
  return (lead.services || [])
    .map((id) => (isServiceId(id) ? SERVICE_BY_ID[id].name : id))
    .filter(Boolean)
    .join(", ");
}

function kindLabel(kind: Lead["kind"]): string {
  return kind === "media" ? "Media" : "Real estate";
}

export default function AdminInquiries({ initialLeads }: { initialLeads: Lead[] }) {
  const [filter, setFilter] = useState<KindFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(
    () => (filter === "all" ? initialLeads : initialLeads.filter((l) => l.kind === filter)),
    [filter, initialLeads]
  );
  const nav = inquiryNeighbors(filtered, selectedId);
  const selected = nav.current;
  const prevId = nav.prev?.id;
  const nextId = nav.next?.id;

  if (selected) {
    return (
      <InquiryDetail
        lead={selected}
        index={nav.index}
        total={filtered.length}
        onBack={() => setSelectedId(null)}
        onPrev={prevId ? () => setSelectedId(prevId) : undefined}
        onNext={nextId ? () => setSelectedId(nextId) : undefined}
      />
    );
  }

  return (
    <div
      className="max-w-[1100px]"
      style={{ padding: "clamp(44px,6vw,72px) clamp(20px,4vw,48px) clamp(64px,8vw,110px)", minHeight: "80vh" }}
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif-display m-0" style={{ fontSize: "clamp(38px,4.5vw,60px)", lineHeight: 1, fontWeight: 500 }}>
            Inquiries
          </h1>
          <p style={{ margin: "8px 0 0", fontSize: 13.5, color: "rgba(var(--ink-rgb),.55)", maxWidth: 520 }}>
            Real estate messages and media bookings from the site. Newest first.{" "}
            <Link href="/admin" className="no-underline" style={{ color: "var(--gold)", fontWeight: 600 }}>
              Manage listings →
            </Link>
          </p>
        </div>
      </div>

      <div className="mb-6 mt-8 flex flex-wrap items-center gap-2.5">
        {(
          [
            ["all", `All (${initialLeads.length})`],
            ["real_estate", `Real estate (${initialLeads.filter((l) => l.kind === "real_estate").length})`],
            ["media", `Media (${initialLeads.filter((l) => l.kind === "media").length})`],
          ] as [KindFilter, string][]
        ).map(([key, label]) => {
          const on = key === filter;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className="transition-colors"
              style={{
                ...pillBase,
                background: on ? "var(--ink)" : "var(--card)",
                color: on ? "#fff" : "var(--ink)",
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <p style={{ fontSize: 14, color: "rgba(var(--ink-rgb),.5)", marginTop: 24 }}>
          No inquiries yet.
        </p>
      ) : (
        <div
          className="flex flex-col overflow-hidden rounded-xl border"
          style={{ gap: 1, background: "rgba(var(--ink-rgb),.09)", borderColor: "rgba(var(--ink-rgb),.09)" }}
        >
          {filtered.map((lead) => (
            <button
              key={lead.id}
              type="button"
              onClick={() => setSelectedId(lead.id)}
              className="flex flex-wrap items-center text-left cursor-pointer border-none transition-colors hover:!bg-[var(--bg2)]"
              style={{ gap: "10px 20px", background: "var(--bg)", padding: "16px 18px", color: "var(--ink)" }}
            >
              <div className="flex min-w-0 flex-1 flex-col gap-[4px]">
                <span className="font-serif-display" style={{ fontSize: 19 }}>
                  {lead.name}
                </span>
                <span style={{ fontSize: 12, color: "rgba(var(--ink-rgb),.55)" }}>{contactLine(lead)}</span>
              </div>
              <div className="flex flex-col gap-1" style={{ minWidth: 160 }}>
                <span style={{ fontSize: 11.5, fontWeight: 600, letterSpacing: ".08em", color: "rgba(var(--ink-rgb),.6)" }}>
                  {kindLabel(lead.kind)}
                  {lead.intent ? ` · ${lead.intent === "buying" ? "Buying" : "Selling"}` : ""}
                </span>
                <span style={{ fontSize: 12, color: "rgba(var(--ink-rgb),.5)" }}>
                  {lead.kind === "media"
                    ? [serviceNames(lead), lead.quote_cents != null ? formatCad(lead.quote_cents) : null]
                        .filter(Boolean)
                        .join(" · ") || "Media booking"
                    : formatPropertyPrefs(lead.property_prefs) || "Inquiry"}
                </span>
              </div>
              <div className="flex flex-col items-end gap-1" style={{ minWidth: 140 }}>
                <span style={{ fontSize: 12, color: "rgba(var(--ink-rgb),.55)" }}>
                  {lead.service_address || lead.property_prefs?.address || "—"}
                </span>
                <span style={{ fontSize: 11.5, color: "rgba(var(--ink-rgb),.45)" }}>{formatWhen(lead.created_at)}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function InquiryDetail({
  lead,
  index,
  total,
  onBack,
  onPrev,
  onNext,
}: {
  lead: Lead;
  index: number;
  total: number;
  onBack: () => void;
  onPrev?: () => void;
  onNext?: () => void;
}) {
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
        return;
      }
      if (event.key === "ArrowLeft") onPrev?.();
      if (event.key === "ArrowRight") onNext?.();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onPrev, onNext]);

  const prefs = formatPropertyPrefs(
    lead.property_prefs ? { ...lead.property_prefs, address: undefined } : null
  );
  const travel =
    lead.kind === "media" && lead.travel_km != null
      ? (lead.travel_cents ?? 0) > 0
        ? `${lead.travel_km} km · ${formatCad(lead.travel_cents ?? 0)}`
        : `${lead.travel_km} km · included (within ${TRAVEL_FREE_KM} km)`
      : null;
  const items = lead.quote_line_items || [];

  return (
    <div
      className="max-w-[1100px]"
      style={{ padding: "clamp(44px,6vw,72px) clamp(20px,4vw,48px) clamp(64px,8vw,110px)", minHeight: "80vh" }}
    >
      <div className="flex flex-wrap items-center justify-between gap-3" style={{ marginBottom: 18 }}>
        <h1 className="font-serif-display m-0" style={{ fontSize: "clamp(32px,4vw,48px)", lineHeight: 1.05, fontWeight: 500 }}>
          {lead.name}
        </h1>
        <button
          type="button"
          onClick={onBack}
          className="flex-none cursor-pointer border bg-transparent transition-colors hover:!border-[var(--gold)] hover:!text-[var(--gold)]"
          style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".12em", padding: "9px 16px", color: "var(--ink)", borderColor: "rgba(var(--ink-rgb),.25)" }}
        >
          ← INQUIRIES
        </button>
      </div>
      <div className="mb-7 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onPrev}
          disabled={!onPrev}
          aria-label="Previous inquiry"
          className="cursor-pointer border bg-transparent transition-colors hover:enabled:!border-[var(--gold)] hover:enabled:!text-[var(--gold)] disabled:cursor-default disabled:opacity-35"
          style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".12em", padding: "9px 16px", color: "var(--ink)", borderColor: "rgba(var(--ink-rgb),.25)" }}
        >
          ← PREVIOUS
        </button>
        <span style={{ fontSize: 12, color: "rgba(var(--ink-rgb),.5)", padding: "0 6px" }}>
          {index + 1} of {total}
        </span>
        <button
          type="button"
          onClick={onNext}
          disabled={!onNext}
          aria-label="Next inquiry"
          className="cursor-pointer border bg-transparent transition-colors hover:enabled:!border-[var(--gold)] hover:enabled:!text-[var(--gold)] disabled:cursor-default disabled:opacity-35"
          style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".12em", padding: "9px 16px", color: "var(--ink)", borderColor: "rgba(var(--ink-rgb),.25)" }}
        >
          NEXT →
        </button>
      </div>

      <div
        className="flex flex-col gap-6 rounded-[14px] border"
        style={{ borderColor: "rgba(var(--ink-rgb),.12)", background: "var(--bg2)", padding: "clamp(24px,3vw,40px)" }}
      >
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,200px),1fr))", gap: "18px 24px" }}>
          <DetailField label="KIND" value={kindLabel(lead.kind)} />
          <DetailField label="RECEIVED" value={formatWhen(lead.created_at)} />
          <DetailField label="EMAIL" value={lead.email || "—"} href={lead.email ? `mailto:${lead.email}` : undefined} />
          <DetailField label="PHONE" value={lead.phone || "—"} href={lead.phone ? `tel:${lead.phone}` : undefined} />
          {lead.intent && (
            <DetailField label="INTENT" value={lead.intent === "buying" ? "Buying" : "Selling"} />
          )}
          <DetailField
            label={lead.kind === "media" ? "SERVICE ADDRESS" : "PROPERTY"}
            value={lead.service_address || lead.property_prefs?.address || "—"}
          />
          {prefs && <DetailField label="LOOKING FOR" value={prefs} />}
          {lead.kind === "media" && <DetailField label="SERVICES" value={serviceNames(lead) || "—"} />}
          {travel && <DetailField label="TRAVEL" value={travel} />}
          {lead.listing_id && <DetailField label="LISTING" value={lead.listing_id} />}
        </div>

        {items.length > 0 && (
          <div>
            <span style={labelStyle}>QUOTE</span>
            <table className="mt-2 w-full max-w-[480px]" style={{ borderCollapse: "collapse", fontSize: 14 }}>
              <tbody>
                {items.map((item, i) => (
                  <tr key={`${item.id || item.name}-${i}`}>
                    <td style={{ padding: "6px 0", color: "var(--ink)" }}>{item.name}</td>
                    <td style={{ padding: "6px 0", textAlign: "right", color: "var(--ink)" }}>
                      {formatCad(item.priceCents)}
                    </td>
                  </tr>
                ))}
                {lead.quote_cents != null && (
                  <tr>
                    <td style={{ padding: "10px 0 0", fontWeight: 700, borderTop: "1px solid var(--line)" }}>Total</td>
                    <td style={{ padding: "10px 0 0", textAlign: "right", fontWeight: 700, borderTop: "1px solid var(--line)" }}>
                      {formatCad(lead.quote_cents)}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {lead.message && (
          <div>
            <span style={labelStyle}>MESSAGE</span>
            <p style={{ margin: "8px 0 0", fontSize: 15, lineHeight: 1.7, color: "var(--ink)", whiteSpace: "pre-wrap" }}>
              {lead.message}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function DetailField({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span style={labelStyle}>{label}</span>
      {href ? (
        <a href={href} className="no-underline" style={{ fontSize: 14.5, color: "var(--ink)" }}>
          {value}
        </a>
      ) : (
        <span style={{ fontSize: 14.5, color: "var(--ink)" }}>{value}</span>
      )}
    </div>
  );
}

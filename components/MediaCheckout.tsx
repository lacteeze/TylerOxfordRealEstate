"use client";

import { useEffect, useRef } from "react";
import { previewMediaTravel } from "@/app/actions";
import {
  PACKAGES,
  SERVICES,
  SERVICE_BY_ID,
  TRAVEL_FREE_KM,
  formatCad,
  type ServiceId,
} from "@/lib/pricing";
import {
  applyUpgradeSelection,
  matchingPackageId,
  packageSavingsCents,
  priceCart,
  suggestUpgrade,
  type UpgradeSuggestion,
} from "@/lib/pricing-engine";

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

export type TravelPreview =
  | { status: "idle" }
  | { status: "pending" }
  | { status: "ok"; km: number; excessKm: number; travelCents: number }
  | { status: "error"; error: string };

function upgradeCopy(upgrade: UpgradeSuggestion): string {
  const names = upgrade.servicesGained.map((id) => SERVICE_BY_ID[id].name);
  const added =
    names.length === 1
      ? names[0]
      : `${names.slice(0, -1).join(", ")} + ${names[names.length - 1]}`;

  if (upgrade.extraCost < 0) {
    return `Add ${added} and save ${formatCad(-upgrade.extraCost)} with ${upgrade.packageName}`;
  }
  if (upgrade.extraCost === 0) {
    return `Add ${added} at no extra cost and get ${upgrade.packageName}`;
  }
  return `Add ${added} for ${formatCad(upgrade.extraCost)} more and get ${upgrade.packageName}`;
}

export default function MediaCheckout({
  selected,
  onChange,
  serviceAddress,
  onServiceAddressChange,
  travel,
  onTravelChange,
}: {
  selected: ServiceId[];
  onChange: (next: ServiceId[]) => void;
  serviceAddress: string;
  onServiceAddressChange: (value: string) => void;
  travel: TravelPreview;
  onTravelChange: (next: TravelPreview) => void;
}) {
  const lastOk = useRef<{ key: string; result: Extract<TravelPreview, { status: "ok" }> } | null>(
    null
  );
  const requestId = useRef(0);

  useEffect(() => {
    const trimmed = serviceAddress.trim().replace(/\s+/g, " ");
    if (trimmed.length < 3) {
      onTravelChange({ status: "idle" });
      return;
    }

    const key = trimmed.toLowerCase();
    if (lastOk.current?.key === key) {
      onTravelChange(lastOk.current.result);
      return;
    }

    onTravelChange({ status: "pending" });
    const id = ++requestId.current;
    const timer = setTimeout(async () => {
      const res = await previewMediaTravel(trimmed);
      if (id !== requestId.current) return;
      if (res.ok) {
        const result: Extract<TravelPreview, { status: "ok" }> = {
          status: "ok",
          km: res.km,
          excessKm: res.excessKm,
          travelCents: res.travelCents,
        };
        lastOk.current = { key, result };
        onTravelChange(result);
      } else {
        onTravelChange({ status: "error", error: res.error });
      }
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [serviceAddress, onTravelChange]);

  const travelCents = travel.status === "ok" ? travel.travelCents : 0;
  const quote = priceCart(selected, travelCents);
  const upgrade = suggestUpgrade(selected);
  const matched = matchingPackageId(selected);
  const struckCents = quote.alaCarteTotal + travelCents;

  function toggle(id: ServiceId) {
    onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);
  }

  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex flex-col gap-1.5">
        <span style={labelStyle}>Packages</span>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {PACKAGES.map((pkg) => {
            const active = matched === pkg.id;
            const savings = packageSavingsCents(pkg);
            return (
              <button
                key={pkg.id}
                type="button"
                aria-pressed={active}
                onClick={() => onChange([...pkg.services])}
                className="relative flex cursor-pointer flex-col items-start gap-0.5 rounded-[14px] text-left transition-colors"
                style={{
                  padding: pkg.badge ? "18px 12px 10px" : "10px 12px",
                  border: active ? "1px solid var(--navy)" : "1px solid var(--line)",
                  background: active ? "var(--navy)" : "var(--card)",
                  color: active ? "#fff" : "var(--ink)",
                  borderRadius: 14,
                }}
              >
                {pkg.badge === "most_popular" && (
                  <span
                    className="absolute top-1.5 right-1.5 rounded-full"
                    style={{
                      fontSize: 8.5,
                      fontWeight: 700,
                      letterSpacing: ".06em",
                      textTransform: "uppercase",
                      padding: "2px 6px",
                      background: active ? "rgba(255,255,255,.18)" : "var(--navy)",
                      color: "#fff",
                    }}
                  >
                    Most Popular
                  </span>
                )}
                <span className="font-display" style={{ fontSize: 13.5, fontWeight: 600 }}>
                  {pkg.name}
                </span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{formatCad(pkg.priceCents)}</span>
                {savings > 0 && (
                  <span
                    style={{
                      fontSize: 10.5,
                      color: active ? "rgba(255,255,255,.72)" : "rgba(var(--ink-rgb),.5)",
                    }}
                  >
                    Save {formatCad(savings)}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <span style={labelStyle}>Services</span>
        <div className="flex flex-wrap gap-2">
          {SERVICES.map((s) => {
            const active = selected.includes(s.id);
            return (
              <button
                key={s.id}
                type="button"
                aria-pressed={active}
                onClick={() => toggle(s.id)}
                className="cursor-pointer rounded-full transition-colors"
                style={{
                  fontSize: 12.5,
                  fontWeight: 500,
                  padding: "8px 14px",
                  border: active ? "1px solid var(--navy)" : "1px solid var(--line)",
                  background: active ? "var(--navy)" : "var(--card)",
                  color: active ? "#fff" : "var(--ink)",
                }}
              >
                {active ? "✓ " : ""}
                {s.name} · {formatCad(s.priceCents)}
              </button>
            );
          })}
        </div>
      </div>

      <label className="flex flex-col gap-1.5">
        <span style={labelStyle}>Service address *</span>
        <input
          value={serviceAddress}
          onChange={(e) => onServiceAddressChange(e.target.value)}
          style={fieldStyle}
          placeholder="Street and city (e.g. 123 Water St, St. John's)"
          autoComplete="street-address"
          required
        />
        <span style={{ fontSize: 11.5, color: "rgba(var(--ink-rgb),.5)" }}>
          Travel is included within {TRAVEL_FREE_KM} km of St. John&apos;s.
        </span>
      </label>

      <div
        className="sticky bottom-2 flex flex-col gap-2 rounded-[14px]"
        style={{
          background: "var(--card)",
          border: "1px solid var(--line)",
          padding: "12px 14px",
        }}
      >
        {selected.length === 0 ? (
          <>
            <span style={{ fontSize: 12.5, color: "rgba(var(--ink-rgb),.55)" }}>
              Choose a package or services to see your quote.
            </span>
            {travel.status === "error" && (
              <span style={{ fontSize: 12.5, color: "#b4483a" }}>{travel.error}</span>
            )}
            {travel.status === "pending" && (
              <span style={{ fontSize: 12.5, color: "rgba(var(--ink-rgb),.55)" }}>
                Estimating travel…
              </span>
            )}
          </>
        ) : (
          <>
            <div className="flex flex-col gap-1">
              {quote.lineItems.map((item) => (
                <div
                  key={`${item.kind}-${item.id}`}
                  className="flex items-baseline justify-between gap-3"
                  style={{ fontSize: 12.5 }}
                >
                  <span style={{ color: "rgba(var(--ink-rgb),.7)" }}>{item.name}</span>
                  <span style={{ fontWeight: 600 }}>{formatCad(item.priceCents)}</span>
                </div>
              ))}
            </div>
            {travel.status === "ok" && travel.travelCents <= 0 && (
              <div
                className="flex items-baseline justify-between gap-3"
                style={{ fontSize: 12.5, color: "rgba(var(--ink-rgb),.7)" }}
              >
                <span>
                  Travel · about {travel.km} km from St. John&apos;s
                </span>
                <span style={{ fontWeight: 600 }}>Included</span>
              </div>
            )}
            {travel.status === "ok" && travel.travelCents > 0 && (
              <span style={{ fontSize: 11.5, color: "rgba(var(--ink-rgb),.5)" }}>
                About {travel.km} km from St. John&apos;s
              </span>
            )}
            {travel.status === "pending" && (
              <span style={{ fontSize: 12.5, color: "rgba(var(--ink-rgb),.55)" }}>
                Estimating travel…
              </span>
            )}
            {travel.status === "error" && (
              <span style={{ fontSize: 12.5, color: "#b4483a" }}>{travel.error}</span>
            )}
            {travel.status === "idle" && (
              <span style={{ fontSize: 12.5, color: "rgba(var(--ink-rgb),.55)" }}>
                Enter a service address to include travel.
              </span>
            )}
            <div
              className="flex items-baseline justify-between gap-3 pt-1.5"
              style={{ borderTop: "1px solid var(--line)" }}
            >
              <span style={{ fontSize: 12.5, fontWeight: 600 }}>Total</span>
              <span className="flex items-baseline gap-2">
                {quote.savings > 0 && (
                  <span
                    style={{
                      fontSize: 12,
                      color: "rgba(var(--ink-rgb),.45)",
                      textDecoration: "line-through",
                    }}
                  >
                    {formatCad(struckCents)}
                  </span>
                )}
                <span className="font-display" style={{ fontSize: 18, fontWeight: 600 }}>
                  {formatCad(quote.total)}
                </span>
              </span>
            </div>
            {quote.savings > 0 && (
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--navy)" }}>
                You save {formatCad(quote.savings)}
              </span>
            )}
            {upgrade && (
              <div
                className="flex flex-col gap-2 rounded-[12px]"
                style={{ background: "var(--bg)", padding: "10px 12px" }}
              >
                <span style={{ fontSize: 12.5, lineHeight: 1.45 }}>{upgradeCopy(upgrade)}</span>
                <button
                  type="button"
                  onClick={() => onChange(applyUpgradeSelection(selected, upgrade))}
                  className="pill-navy self-start"
                  style={{ padding: "7px 14px", fontSize: 12 }}
                >
                  Apply {upgrade.packageName}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

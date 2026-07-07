"use client";

import { useMemo, useState } from "react";
import { Listing, ListingStatus } from "@/lib/types";
import ListingCard from "./ListingCard";

type FilterKey = "all" | ListingStatus;

const pillBase: React.CSSProperties = {
  fontSize: 11.5,
  fontWeight: 600,
  letterSpacing: ".14em",
  padding: "10px 18px",
  borderRadius: 999,
};

export default function ListingsBrowser({ listings }: { listings: Listing[] }) {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [query, setQuery] = useState("");
  const [minBeds, setMinBeds] = useState(0);
  const [sort, setSort] = useState("featured");

  const counts = useMemo(() => {
    const c: Record<FilterKey, number> = { all: listings.length, sale: 0, lease: 0, sold: 0 };
    listings.forEach((l) => {
      c[l.status] += 1;
    });
    return c;
  }, [listings]);

  const filtered = useMemo(() => {
    let out = filter === "all" ? listings : listings.filter((l) => l.status === filter);
    const q = query.trim().toLowerCase();
    if (q)
      out = out.filter((l) =>
        [l.title, l.neighbourhood, l.blurb, l.description].join(" ").toLowerCase().includes(q)
      );
    if (minBeds) out = out.filter((l) => Number(l.beds) >= minBeds);
    return out.slice().sort((a, b) => {
      if (sort === "price-asc") return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      if (sort === "sqft") return (b.sqft || 0) - (a.sqft || 0);
      return Number(b.featured) - Number(a.featured) || b.price - a.price;
    });
  }, [listings, filter, query, minBeds, sort]);

  const filtersActive = !!(query.trim() || minBeds || sort !== "featured" || filter !== "all");

  const selectStyle: React.CSSProperties = {
    background: "var(--field)",
    border: "1px solid rgba(var(--ink-rgb),.18)",
    color: "var(--ink)",
    borderRadius: 999,
    padding: "12px 16px",
    fontSize: 12,
    fontWeight: 500,
    letterSpacing: ".06em",
    cursor: "pointer",
  };

  return (
    <>
      <div className="mb-3.5 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[280px] max-w-[560px] flex-1">
          <span
            className="pointer-events-none absolute left-[18px] top-1/2 -translate-y-1/2"
            style={{ color: "rgba(var(--ink-rgb),.45)", fontSize: 16 }}
          >
            ⌕
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by address, neighbourhood, or keyword…"
            className="w-full box-border"
            style={{
              background: "var(--field)",
              border: "1px solid rgba(var(--ink-rgb),.18)",
              color: "var(--ink)",
              borderRadius: 999,
              padding: "13px 20px 13px 44px",
              fontSize: 14,
            }}
          />
        </div>
        <select value={String(minBeds)} onChange={(e) => setMinBeds(Number(e.target.value))} style={selectStyle}>
          <option value="0">ANY BEDS</option>
          <option value="2">2+ BEDS</option>
          <option value="3">3+ BEDS</option>
          <option value="4">4+ BEDS</option>
          <option value="5">5+ BEDS</option>
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)} style={selectStyle}>
          <option value="featured">FEATURED FIRST</option>
          <option value="price-asc">PRICE — LOW TO HIGH</option>
          <option value="price-desc">PRICE — HIGH TO LOW</option>
          <option value="sqft">LARGEST FIRST</option>
        </select>
      </div>

      <div className="mb-10 flex flex-wrap items-center gap-2.5">
        {(
          [
            ["all", `ALL (${counts.all})`],
            ["sale", `FOR SALE (${counts.sale})`],
            ["lease", `FOR LEASE (${counts.lease})`],
            ["sold", `SOLD (${counts.sold})`],
          ] as [FilterKey, string][]
        ).map(([key, label]) => {
          const on = key === filter;
          return (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className="cursor-pointer border transition-colors hover:!border-[var(--gold)]"
              style={{
                ...pillBase,
                background: on ? "var(--gold)" : "transparent",
                color: on ? "var(--gold-ink)" : "rgba(var(--ink-rgb),.7)",
                borderColor: on ? "var(--gold)" : "rgba(var(--ink-rgb),.22)",
              }}
            >
              {label}
            </button>
          );
        })}
        {filtersActive && (
          <button
            onClick={() => {
              setQuery("");
              setMinBeds(0);
              setSort("featured");
              setFilter("all");
            }}
            className="cursor-pointer border border-transparent transition-colors hover:!border-[var(--gold)]"
            style={{ ...pillBase, padding: "10px 16px", background: "none", color: "var(--gold)" }}
          >
            CLEAR ✕
          </button>
        )}
        <span className="ml-auto" style={{ fontSize: 12, letterSpacing: ".1em", color: "rgba(var(--ink-rgb),.5)" }}>
          {filtered.length} {filtered.length === 1 ? "PROPERTY" : "PROPERTIES"}
        </span>
      </div>

      <div
        className="grid"
        style={{
          gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,300px),1fr))",
          gap: "clamp(20px,3vw,32px)",
        }}
      >
        {filtered.map((l) => (
          <ListingCard key={l.id} listing={l} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="font-serif-display my-[60px] text-center" style={{ fontSize: 26, color: "rgba(var(--ink-rgb),.5)" }}>
          No matches — try clearing the search or filters.
        </p>
      )}
    </>
  );
}

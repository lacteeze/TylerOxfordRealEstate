"use client";

import { useMemo, useState } from "react";
import { Listing, ListingStatus } from "@/lib/types";
import ListingCard from "./ListingCard";

type FilterKey = "all" | ListingStatus;

const pillBase: React.CSSProperties = {
  fontSize: 12.5,
  fontWeight: 500,
  padding: "10px 18px",
  borderRadius: 999,
  border: "none",
};

export default function ListingsBrowser({
  listings,
  initialQuery = "",
  initialFilter = "all",
  initialMinBeds = 0,
}: {
  listings: Listing[];
  initialQuery?: string;
  initialFilter?: FilterKey;
  initialMinBeds?: number;
}) {
  const [filter, setFilter] = useState<FilterKey>(initialFilter);
  const [query, setQuery] = useState(initialQuery);
  const [minBeds, setMinBeds] = useState(initialMinBeds);
  const [sort, setSort] = useState("featured");

  const counts = useMemo(() => {
    const c: Record<FilterKey, number> = { all: listings.length, sale: 0, lease: 0, sold: 0, showcase: 0 };
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
    background: "var(--card)",
    border: "1px solid transparent",
    color: "var(--ink)",
    borderRadius: 999,
    padding: "12px 18px",
    fontSize: 12.5,
    fontWeight: 500,
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
              background: "var(--bg)",
              border: "1px solid var(--line)",
              color: "var(--ink)",
              borderRadius: 999,
              padding: "13px 20px 13px 44px",
              fontSize: 13.5,
            }}
          />
        </div>
        <select value={String(minBeds)} onChange={(e) => setMinBeds(Number(e.target.value))} style={selectStyle}>
          <option value="0">Any beds</option>
          <option value="2">2+ beds</option>
          <option value="3">3+ beds</option>
          <option value="4">4+ beds</option>
          <option value="5">5+ beds</option>
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)} style={selectStyle}>
          <option value="featured">Featured first</option>
          <option value="price-asc">Price — low to high</option>
          <option value="price-desc">Price — high to low</option>
          <option value="sqft">Largest first</option>
        </select>
      </div>

      <div className="mb-10 flex flex-wrap items-center gap-2.5">
        {(
          [
            ["all", `All (${counts.all})`],
            ["sale", `For sale (${counts.sale})`],
            ["lease", `For lease (${counts.lease})`],
            ["sold", `Sold (${counts.sold})`],
            ["showcase", `Showcase (${counts.showcase})`],
          ] as [FilterKey, string][]
        ).map(([key, label]) => {
          const on = key === filter;
          return (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className="cursor-pointer transition-colors"
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
        {filtersActive && (
          <button
            onClick={() => {
              setQuery("");
              setMinBeds(0);
              setSort("featured");
              setFilter("all");
            }}
            className="cursor-pointer transition-colors"
            style={{ ...pillBase, padding: "10px 16px", background: "none", color: "var(--gold)", fontWeight: 600 }}
          >
            Clear ✕
          </button>
        )}
        <span className="ml-auto" style={{ fontSize: 12, color: "rgba(var(--ink-rgb),.5)" }}>
          {filtered.length} {filtered.length === 1 ? "property" : "properties"}
        </span>
      </div>

      <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((l) => (
          <ListingCard key={l.id} listing={l} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="font-display my-[60px] text-center" style={{ fontSize: 22, fontWeight: 500, color: "rgba(var(--ink-rgb),.5)" }}>
          No matches — try clearing the search or filters.
        </p>
      )}
    </>
  );
}

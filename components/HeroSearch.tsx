"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const cellLabel: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 500,
  color: "var(--ink)",
};

export default function HeroSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [beds, setBeds] = useState("0");

  function go(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (status !== "all") params.set("status", status);
    if (beds !== "0") params.set("beds", beds);
    const qs = params.toString();
    router.push(qs ? `/listings?${qs}` : "/listings");
  }

  const selectStyle: React.CSSProperties = {
    ...cellLabel,
    border: "none",
    background: "transparent",
    cursor: "pointer",
    appearance: "none",
    paddingRight: 18,
  };

  return (
    <form
      onSubmit={go}
      className="mx-auto flex w-full max-w-[860px] flex-col gap-2 rounded-[22px] p-2 sm:flex-row sm:items-center sm:gap-0 sm:rounded-full"
      style={{ background: "var(--bg)", boxShadow: "0 18px 50px rgba(22,24,29,.14)" }}
    >
      <label className="flex flex-1 items-center gap-2.5" style={{ padding: "10px 16px" }}>
        <span aria-hidden style={{ fontSize: 14 }}>◉</span>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Neighbourhood, address, keyword"
          className="w-full border-none bg-transparent"
          style={{ ...cellLabel, outline: "none" }}
        />
      </label>
      <span className="hidden h-6 w-px sm:block" style={{ background: "var(--line)" }} />
      <label className="relative flex items-center gap-2.5" style={{ padding: "10px 16px" }}>
        <span aria-hidden style={{ fontSize: 13 }}>⌂</span>
        <select value={status} onChange={(e) => setStatus(e.target.value)} style={selectStyle}>
          <option value="all">Any status</option>
          <option value="sale">For sale</option>
          <option value="lease">For lease</option>
          <option value="sold">Sold</option>
        </select>
        <span aria-hidden className="pointer-events-none absolute right-3" style={{ fontSize: 10 }}>▾</span>
      </label>
      <span className="hidden h-6 w-px sm:block" style={{ background: "var(--line)" }} />
      <label className="relative flex items-center gap-2.5" style={{ padding: "10px 16px" }}>
        <span aria-hidden style={{ fontSize: 13 }}>❖</span>
        <select value={beds} onChange={(e) => setBeds(e.target.value)} style={selectStyle}>
          <option value="0">Any beds</option>
          <option value="2">2+ beds</option>
          <option value="3">3+ beds</option>
          <option value="4">4+ beds</option>
          <option value="5">5+ beds</option>
        </select>
        <span aria-hidden className="pointer-events-none absolute right-3" style={{ fontSize: 10 }}>▾</span>
      </label>
      <button type="submit" className="pill-navy justify-center sm:ml-2" style={{ padding: "13px 26px", fontWeight: 600 }}>
        ⌕ Search
      </button>
    </form>
  );
}

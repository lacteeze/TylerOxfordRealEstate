"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Listing, priceLabel, specs } from "@/lib/types";

export default function FeaturedCarousel({ listings }: { listings: Listing[] }) {
  const [idx, setIdx] = useState(0);
  if (!listings.length) return null;

  const cur = listings[idx % listings.length];
  const cover = cur.photos?.[0] || "";
  const step = (dir: number) => setIdx((i) => (i + dir + listings.length) % listings.length);

  const arrowBtn: React.CSSProperties = {
    width: 34,
    height: 34,
    borderRadius: "50%",
    border: "1px solid var(--line)",
    background: "var(--bg)",
    color: "var(--ink)",
    cursor: "pointer",
    fontSize: 14,
    lineHeight: 1,
  };

  return (
    <div
      className="relative overflow-hidden rounded-[24px]"
      style={{ minHeight: 460, background: "var(--surface)" }}
    >
      {cover && (
        <Image
          key={cur.id}
          src={cover}
          alt={cur.title}
          fill
          sizes="(max-width: 1560px) 100vw, 1560px"
          className="fade-up object-cover"
        />
      )}

      {/* Floating info card */}
      <div
        className="absolute bottom-6 left-5 flex w-[min(340px,calc(100%-40px))] flex-col gap-2 rounded-[18px] sm:left-8"
        style={{ background: "var(--bg)", padding: "22px 22px 18px", boxShadow: "0 18px 44px rgba(22,24,29,.25)" }}
      >
        <Link
          href={`/p/${cur.id}`}
          className="font-display no-underline"
          style={{ color: "var(--ink)", fontSize: 19, fontWeight: 600, lineHeight: 1.25 }}
        >
          {cur.title}
        </Link>
        {cur.blurb && (
          <span style={{ fontSize: 12.5, lineHeight: 1.6, color: "rgba(var(--ink-rgb),.6)" }}>
            {cur.blurb.length > 110 ? cur.blurb.slice(0, 110).trimEnd() + "…" : cur.blurb}
          </span>
        )}
        <span style={{ fontSize: 12.5, fontWeight: 500, color: "rgba(var(--ink-rgb),.75)" }}>{specs(cur)}</span>
        <span style={{ fontSize: 12.5, color: "rgba(var(--ink-rgb),.6)" }}>◉ {cur.neighbourhood}</span>
        <div className="mt-2 flex items-center justify-between border-t pt-3.5" style={{ borderColor: "var(--line)" }}>
          <div className="flex items-center gap-2">
            <button onClick={() => step(-1)} aria-label="Previous property" style={arrowBtn}>←</button>
            <button onClick={() => step(1)} aria-label="Next property" style={arrowBtn}>→</button>
            <span style={{ fontSize: 11, color: "rgba(var(--ink-rgb),.45)", marginLeft: 4 }}>
              {(idx % listings.length) + 1}/{listings.length}
            </span>
          </div>
          <span className="font-display" style={{ fontSize: 20, fontWeight: 700 }}>
            {priceLabel(cur)}
          </span>
        </div>
      </div>
    </div>
  );
}

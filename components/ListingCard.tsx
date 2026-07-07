"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Listing, chip, priceLabel, specs } from "@/lib/types";

export default function ListingCard({ listing }: { listing: Listing }) {
  const [idx, setIdx] = useState(0);
  const photos = listing.photos || [];
  const cover = photos.length ? photos[idx % photos.length] : "";
  const c = chip(listing.status);

  return (
    <Link
      href={`/p/${listing.id}`}
      className="group flex flex-col overflow-hidden rounded-[14px] border no-underline transition-colors"
      style={{
        color: "var(--ink)",
        background: "var(--bg2)",
        borderColor: "rgba(var(--ink-rgb),.14)",
      }}
    >
      <span
        className="relative block overflow-hidden"
        style={{ aspectRatio: "4/3", background: "var(--surface)" }}
      >
        {cover && (
          <Image
            src={cover}
            alt={listing.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
        )}
        <span
          className="absolute left-3.5 top-3.5 border font-semibold"
          style={{
            fontSize: 10,
            letterSpacing: ".18em",
            padding: "6px 10px",
            background: "rgba(16,18,22,.78)",
            backdropFilter: "blur(6px)",
            color: c.color,
            borderColor: c.color,
          }}
        >
          {c.label}
        </span>
        {photos.length > 1 && (
          <button
            title="Next photo"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIdx((i) => (i + 1) % photos.length);
            }}
            className="absolute bottom-0 right-0 top-0 flex w-[32%] cursor-pointer items-center justify-end border-none pr-3.5 opacity-0 transition-opacity hover:opacity-100"
            style={{ background: "linear-gradient(to left,rgba(16,18,22,.35),rgba(16,18,22,0))" }}
          >
            <span
              className="flex items-center justify-center rounded-full"
              style={{
                width: 42,
                height: 42,
                background: "rgba(16,18,22,.35)",
                border: "1px solid rgba(241,238,232,.6)",
                backdropFilter: "blur(5px)",
                color: "#f1eee8",
                fontSize: 17,
                lineHeight: 1,
              }}
            >
              →
            </span>
          </button>
        )}
      </span>
      <span
        className="flex min-w-0 flex-col gap-[7px]"
        style={{ padding: "clamp(18px,2.5vw,24px) clamp(18px,2.5vw,24px) clamp(22px,3vw,28px)" }}
      >
        <span style={{ fontSize: 15, fontWeight: 600, color: "var(--gold)", letterSpacing: ".02em" }}>
          {priceLabel(listing)}
        </span>
        <span className="font-serif-display" style={{ fontSize: "clamp(22px,2vw,26px)", lineHeight: 1.2 }}>
          {listing.title}
        </span>
        <span style={{ fontSize: 12.5, lineHeight: 1.55, color: "rgba(var(--ink-rgb),.55)", letterSpacing: ".04em" }}>
          {listing.neighbourhood} · {specs(listing)}
        </span>
      </span>
    </Link>
  );
}

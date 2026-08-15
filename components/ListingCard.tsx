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
      className="group flex flex-col no-underline"
      style={{ color: "var(--ink)" }}
    >
      <span
        className="relative block overflow-hidden rounded-[18px]"
        style={{ aspectRatio: "4/3", background: "var(--surface)" }}
      >
        {cover && (
          <Image
            src={cover}
            alt={listing.title}
            fill
            sizes="(max-width: 640px) 100vw, 50vw"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
        )}
        <span
          className="absolute left-3.5 top-3.5 rounded-full font-semibold"
          style={{
            fontSize: 10,
            letterSpacing: ".14em",
            padding: "7px 12px",
            background: "rgba(15,17,20,.72)",
            backdropFilter: "blur(6px)",
            color: c.color,
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
            style={{ background: "linear-gradient(to left,rgba(15,17,20,.35),rgba(15,17,20,0))" }}
          >
            <span
              className="flex items-center justify-center rounded-full"
              style={{
                width: 40,
                height: 40,
                background: "rgba(255,255,255,.85)",
                color: "var(--ink)",
                fontSize: 16,
                lineHeight: 1,
              }}
            >
              →
            </span>
          </button>
        )}
      </span>
      <span className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1" style={{ padding: "16px 4px 0" }}>
        <span className="font-display" style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-.01em" }}>
          {priceLabel(listing)}
        </span>
        <span style={{ fontSize: 12.5, fontWeight: 500, color: "rgba(var(--ink-rgb),.65)" }}>
          {specs(listing)}
        </span>
      </span>
      <span className="flex flex-col gap-0.5" style={{ padding: "6px 4px 0" }}>
        <span className="font-display" style={{ fontSize: 15.5, fontWeight: 600, lineHeight: 1.3 }}>
          {listing.title}
        </span>
        <span style={{ fontSize: 12.5, color: "rgba(var(--ink-rgb),.55)" }}>
          ◉ {listing.neighbourhood}
        </span>
      </span>
    </Link>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Listing, chip, priceLabel, specs } from "@/lib/types";
import Gallery from "@/components/Gallery";

export const revalidate = 60;

export default async function PropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("listings")
    .select("*")
    .eq("id", decodeURIComponent(id))
    .maybeSingle();

  if (!data) notFound();
  const cur = data as Listing;
  const c = chip(cur.status);
  const sold = cur.status === "sold";
  const d = 0.012;
  const mapSrc = cur.lat
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${(cur.lng ?? 0) - d}%2C${cur.lat - d * 0.55}%2C${(cur.lng ?? 0) + d}%2C${cur.lat + d * 0.55}&layer=mapnik&marker=${cur.lat}%2C${cur.lng}`
    : "";

  const ctaEyebrow = sold ? "CASE STUDY" : cur.status === "lease" ? "FOR LEASE" : "FOR SALE";
  const ctaTitle = sold ? "Want your home to sell like this?" : "Book a private viewing";
  const ctaBody = sold
    ? "Every listing Tyler represents launches with the full Oxford Media treatment — photography, film, and drone, included."
    : "Tyler will walk you through the home in person, or send the full cinematic tour first. No pressure, no scripts.";

  return (
    <div>
      <Gallery photos={cur.photos || []} title={cur.title} hero />
      <div style={{ padding: "0 clamp(20px,4vw,48px)" }}>
        <div className="relative max-w-[1100px]" style={{ marginTop: -70 }}>
          <Link
            href="/listings"
            className="no-underline hover:!text-[var(--gold)]"
            style={{ fontSize: 11.5, fontWeight: 600, letterSpacing: ".14em", color: "rgba(var(--ink-rgb),.6)" }}
          >
            ← ALL PROPERTIES
          </Link>
          <div className="flex items-center gap-3.5" style={{ margin: "20px 0 12px" }}>
            <span
              className="border font-semibold"
              style={{
                fontSize: 10,
                letterSpacing: ".18em",
                padding: "6px 10px",
                background: "rgba(16,18,22,.78)",
                color: c.color,
                borderColor: c.color,
              }}
            >
              {c.label}
            </span>
            <span style={{ fontSize: 12, letterSpacing: ".06em", color: "rgba(var(--ink-rgb),.55)" }}>
              {cur.neighbourhood}
            </span>
          </div>
          <h1 className="font-serif-display m-0" style={{ fontSize: "clamp(40px,5vw,72px)", lineHeight: 1.02, fontWeight: 500 }}>
            {cur.title}
          </h1>
          <div
            className="flex flex-wrap items-baseline pb-7"
            style={{ gap: "18px 36px", margin: "22px 0 0", borderBottom: "1px solid rgba(var(--ink-rgb),.12)" }}
          >
            <span className="font-serif-display" style={{ fontSize: 32, color: "var(--gold)" }}>
              {priceLabel(cur)}
            </span>
            <span style={{ fontSize: 13.5, letterSpacing: ".08em", color: "rgba(var(--ink-rgb),.7)" }}>
              {specs(cur)}
            </span>
          </div>
          <p style={{ margin: "32px 0 0", maxWidth: 720, fontSize: 15.5, lineHeight: 1.85, color: "rgba(var(--ink-rgb),.78)" }}>
            {cur.description}
          </p>
          {cur.video_url?.trim() && (
            <a
              href={cur.video_url}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-block border no-underline transition-colors hover:!bg-[var(--gold)] hover:!text-[var(--gold-ink)]"
              style={{
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: ".08em",
                color: "var(--gold)",
                borderColor: "var(--gold)",
                padding: "12px 20px",
              }}
            >
              ▶&nbsp;&nbsp;WATCH THE CINEMATIC TOUR
            </a>
          )}
        </div>

        {/* Gallery */}
        <div className="mx-auto max-w-[1400px]" style={{ marginTop: "clamp(44px,6vw,72px)" }}>
          <div className="mb-6 flex flex-wrap items-baseline justify-between gap-5">
            <h2 className="font-serif-display m-0" style={{ fontSize: "clamp(26px,2.6vw,38px)", fontWeight: 500 }}>
              The full gallery
            </h2>
            <span style={{ fontSize: 10.5, letterSpacing: ".18em", color: "rgba(var(--ink-rgb),.45)" }}>
              SHOT IN-HOUSE BY OXFORD MEDIA · CLICK TO VIEW FULL RESOLUTION
            </span>
          </div>
          <Gallery photos={cur.photos || []} title={cur.title} />
        </div>

        {/* Map + CTA */}
        <div
          className="mx-auto grid max-w-[1400px] items-stretch"
          style={{
            margin: "clamp(44px,6vw,72px) auto clamp(64px,8vw,110px)",
            gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,320px),1fr))",
            gap: "clamp(28px,4vw,56px)",
          }}
        >
          {mapSrc && (
            <iframe
              title="Map"
              src={mapSrc}
              className="w-full rounded-xl border"
              style={{
                minHeight: 380,
                borderColor: "rgba(var(--ink-rgb),.12)",
                filter: "grayscale(1) invert(.92) contrast(.9)",
              }}
            />
          )}
          <div
            className="flex flex-col justify-center gap-4 rounded-[14px] border"
            style={{
              background: "var(--bg2)",
              borderColor: "rgba(var(--ink-rgb),.1)",
              padding: "clamp(28px,3vw,44px)",
            }}
          >
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".26em", color: "var(--gold)" }}>
              {ctaEyebrow}
            </span>
            <span className="font-serif-display" style={{ fontSize: "clamp(26px,2.6vw,38px)", lineHeight: 1.12, fontWeight: 500 }}>
              {ctaTitle}
            </span>
            <span style={{ fontSize: 14, lineHeight: 1.7, color: "rgba(var(--ink-rgb),.6)" }}>{ctaBody}</span>
            <Link
              href="/#contact"
              className="mt-1.5 self-start no-underline transition-colors hover:!bg-[var(--gold-hov)]"
              style={{
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: ".08em",
                color: "var(--gold-ink)",
                background: "var(--gold)",
                padding: "13px 22px",
              }}
            >
              GET IN TOUCH →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

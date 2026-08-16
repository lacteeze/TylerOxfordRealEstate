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
    .eq("archived", false)
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
    ? "Every listing Tyler represents launches with the full Move Media treatment — photography, film, and drone, included."
    : "Tyler will walk you through the home in person, or send the full cinematic tour first. No pressure, no scripts.";

  return (
    <div>
      <Gallery photos={cur.photos || []} title={cur.title} hero />
      <div style={{ padding: "0 clamp(20px,3.5vw,44px)" }}>
        <div className="relative max-w-[1100px]" style={{ marginTop: 28 }}>
          <Link
            href="/listings"
            className="pill-outline"
            style={{ padding: "9px 16px", fontSize: 12.5 }}
          >
            ← All properties
          </Link>
          <div className="flex items-center gap-3.5" style={{ margin: "24px 0 12px" }}>
            <span
              className="rounded-full font-semibold"
              style={{
                fontSize: 10,
                letterSpacing: ".14em",
                padding: "7px 12px",
                background: "var(--navy)",
                color: c.color,
              }}
            >
              {c.label}
            </span>
            <span style={{ fontSize: 12.5, color: "rgba(var(--ink-rgb),.55)" }}>
              ◉ {cur.neighbourhood}
            </span>
          </div>
          <h1
            className="font-display m-0"
            style={{
              fontSize: "clamp(36px,4.6vw,64px)",
              lineHeight: 1.04,
              letterSpacing: "-.02em",
              fontWeight: 600,
            }}
          >
            {cur.title}
          </h1>
          <div
            className="flex flex-wrap items-baseline pb-7"
            style={{ gap: "18px 36px", margin: "22px 0 0", borderBottom: "1px solid var(--line)" }}
          >
            <span className="font-display" style={{ fontSize: 30, fontWeight: 700, letterSpacing: "-.01em" }}>
              {priceLabel(cur)}
            </span>
            <span style={{ fontSize: 13.5, fontWeight: 500, color: "rgba(var(--ink-rgb),.7)" }}>
              {specs(cur)}
            </span>
          </div>
          <p style={{ margin: "30px 0 0", maxWidth: 720, fontSize: 14.5, lineHeight: 1.85, color: "rgba(var(--ink-rgb),.75)" }}>
            {cur.description}
          </p>
          {cur.video_url?.trim() && (
            <a href={cur.video_url} target="_blank" rel="noreferrer" className="pill-navy mt-6">
              ▶ Watch the cinematic tour
            </a>
          )}
        </div>

        {/* Gallery */}
        <div className="mx-auto max-w-[1400px]" style={{ marginTop: "clamp(44px,6vw,72px)" }}>
          <div className="mb-6 flex flex-wrap items-baseline justify-between gap-5">
            <h2 className="font-display m-0" style={{ fontSize: "clamp(24px,2.6vw,34px)", fontWeight: 600, letterSpacing: "-.015em" }}>
              The full gallery
            </h2>
            <span style={{ fontSize: 11, letterSpacing: ".14em", color: "rgba(var(--ink-rgb),.45)" }}>
              SHOT IN-HOUSE BY MOVE MEDIA · CLICK TO VIEW FULL RESOLUTION
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
              className="w-full rounded-[18px] border"
              style={{
                minHeight: 380,
                borderColor: "var(--line)",
                filter: "grayscale(1) contrast(.95)",
              }}
            />
          )}
          <div
            className="flex flex-col justify-center gap-4 rounded-[18px]"
            style={{ background: "var(--card)", padding: "clamp(28px,3vw,44px)" }}
          >
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".24em", color: "rgba(var(--ink-rgb),.5)" }}>
              {ctaEyebrow}
            </span>
            <span className="font-display" style={{ fontSize: "clamp(24px,2.6vw,34px)", lineHeight: 1.12, fontWeight: 600, letterSpacing: "-.015em" }}>
              {ctaTitle}
            </span>
            <span style={{ fontSize: 13.5, lineHeight: 1.7, color: "rgba(var(--ink-rgb),.62)" }}>{ctaBody}</span>
            <Link href="/#contact" className="pill-navy mt-1.5 self-start">
              Get in touch <span className="pill-arrow">↗</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

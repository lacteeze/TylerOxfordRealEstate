import Image from "next/image";
import Link from "next/link";
import FeaturedCarousel from "@/components/FeaturedCarousel";
import HeroParallax from "@/components/HeroParallax";
import HeroSearch from "@/components/HeroSearch";
import ListingCard from "@/components/ListingCard";
import { landingPhotoSlot, mergeLandingPhotos } from "@/lib/landing-photos";
import { createClient } from "@/lib/supabase/server";
import { Listing } from "@/lib/types";

export const revalidate = 60;

const sectionPad = "clamp(56px,7vw,104px) clamp(20px,3.5vw,44px)";

const h2Style: React.CSSProperties = {
  fontSize: "clamp(30px,3.4vw,46px)",
  lineHeight: 1.12,
  letterSpacing: "-.015em",
  fontWeight: 600,
  margin: 0,
};

const sideParaStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 13.5,
  lineHeight: 1.75,
  color: "rgba(var(--ink-rgb),.6)",
  maxWidth: 400,
};

/* Split heading left / paragraph right, like the reference design */
function SectionIntro({
  title,
  para,
  cta,
}: {
  title: React.ReactNode;
  para: string;
  cta?: { href: string; label: string };
}) {
  return (
    <div className="mb-10 grid items-start gap-6 md:grid-cols-[1.2fr_1fr] md:gap-16">
      <div className="flex flex-col items-start gap-5">
        <h2 className="font-display" style={h2Style}>
          {title}
        </h2>
        {cta && (
          <Link href={cta.href} className="pill-navy">
            {cta.label} <span className="pill-arrow">↗</span>
          </Link>
        )}
      </div>
      <p style={{ ...sideParaStyle, justifySelf: "start" }} className="md:mt-2">
        {para}
      </p>
    </div>
  );
}

export default async function Home() {
  const supabase = await createClient();
  const [{ data }, { data: photoRows, error: photoError }] = await Promise.all([
    supabase
      .from("listings")
      .select("*")
      .eq("featured", true)
      .eq("archived", false)
      .eq("published", true)
      .neq("status", "sold")
      .order("price", { ascending: false })
      .limit(6),
    supabase.from("landing_photos").select("slot, url"),
  ]);
  const featured = (data || []) as Listing[];
  const photos = mergeLandingPhotos(photoError ? null : photoRows);

  const faqs: [string, string][] = [
    [
      "How do I book a viewing?",
      "Call or text (709) 687-1754, email info@tyleroxford.com, or use the contact form below. Tyler will walk you through the home in person, or send the full cinematic tour first — no pressure, no scripts.",
    ],
    [
      "What does Move Media shoot?",
      "Professional photography, cinematic video tours, drone photo & film, virtual staging, floor plans & measurements, and social video content — all produced in-house.",
    ],
    [
      "Is the media package extra when I list with Tyler?",
      "No. Every listing Tyler represents launches with the full Move Media treatment — photography, film, and drone — included, not upsold.",
    ],
    [
      "Can other agents or homeowners book the studio?",
      "Yes. Move Media shoots for agents and homeowners across the Avalon. Use the contact form and pick “Media booking” to request a quote.",
    ],
    [
      "What areas do you cover?",
      "St. John's & Eastern Newfoundland — from downtown to the wider Avalon Peninsula.",
    ],
  ];

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <div className="relative" style={{ background: "var(--peach)" }}>
        <div
          className="fade-up mx-auto flex max-w-[1100px] flex-col items-center text-center"
          style={{ padding: "clamp(28px,4vw,56px) clamp(20px,3.5vw,44px) 0" }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: ".28em",
              color: "rgba(var(--ink-rgb),.55)",
              marginBottom: 20,
            }}
          >
            ST. JOHN&apos;S &amp; EASTERN NEWFOUNDLAND
          </div>
          <h1
            className="font-display m-0"
            style={{
              fontSize: "clamp(40px,6.4vw,84px)",
              lineHeight: 1.04,
              letterSpacing: "-.025em",
              fontWeight: 600,
              maxWidth: "12em",
              textWrap: "balance",
            }}
          >
            Shot, styled &amp; sold by an award winner.
          </h1>
          <p
            style={{
              margin: "20px 0 0",
              maxWidth: 560,
              fontSize: 14.5,
              lineHeight: 1.75,
              color: "rgba(var(--ink-rgb),.65)",
            }}
          >
            One brand, two doors: a working REALTOR® who understands the deal, and Move
            Media — the in-house studio that makes every listing look like this.
          </p>
        </div>
        <div className="mx-auto mt-8 max-w-[1140px]" style={{ padding: "0 clamp(16px,3vw,44px)" }}>
          <HeroParallax
            src={photos.hero}
            alt={landingPhotoSlot("hero").alt}
          />
        </div>
        {/* Floating search bar overlapping the hero edge */}
        <div
          className="relative z-10 mx-auto w-full"
          style={{ padding: "0 clamp(16px,3vw,44px)", marginTop: -34, marginBottom: 0 }}
        >
          <HeroSearch />
        </div>
        <div style={{ height: 0 }} />
      </div>
      {/* spacer under the overlapping search bar */}
      <div style={{ height: 34, background: "var(--bg)", marginTop: -34 }} aria-hidden />

      {/* ── Proof / stats ────────────────────────────────────── */}
      <div style={{ padding: sectionPad }}>
        <div className="mx-auto flex max-w-[780px] flex-col items-center text-center">
          <h2 className="font-display" style={{ ...h2Style, fontSize: "clamp(30px,3.6vw,48px)" }}>
            Every listing gets the award&#8209;winning treatment
          </h2>
          <p style={{ ...sideParaStyle, maxWidth: 560, margin: "18px 0 0", textAlign: "center" }}>
            Tyler started shooting homes for free in high school. That turned into Move
            Media — and now every home he represents launches with a full cinematic media
            package. Included, not upsold.
          </p>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {(
            [
              ["Gold", "Winner, St. John's Community Votes 2020", "— voted the region's best by the people who live here."],
              ["212K", "views on a single listing launch", "— social-first marketing that puts your home in front of buyers, fast."],
              ["6 days", "fastest firm sale, at 104% of asking", "— the media brings the offers; Tyler closes the deal."],
            ] as [string, string, string][]
          ).map(([big, bold, rest]) => (
            <div key={big} className="rounded-[18px]" style={{ background: "var(--card)", padding: "28px 26px 30px" }}>
              <div className="font-display" style={{ fontSize: "clamp(30px,2.8vw,38px)", fontWeight: 700, letterSpacing: "-.02em" }}>
                {big}
              </div>
              <p style={{ margin: "12px 0 0", fontSize: 13, lineHeight: 1.7, color: "rgba(var(--ink-rgb),.62)" }}>
                <strong style={{ color: "var(--ink)", fontWeight: 600 }}>{bold}</strong> {rest}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Featured listings grid ───────────────────────────── */}
      <div style={{ padding: sectionPad, paddingTop: 0 }}>
        <SectionIntro
          title="Homes for sale right now"
          para="Explore what's on the market across St. John's & Eastern Newfoundland. Every home below was photographed and filmed in-house by Move Media."
        />
        <div className="mb-8 flex flex-wrap gap-2.5">
          {(
            [
              ["/listings", "All types", true],
              ["/listings?status=sale", "For sale", false],
              ["/listings?status=lease", "For lease", false],
              ["/listings?status=sold", "Sold", false],
              ["/listings?beds=3", "3+ beds", false],
              ["/listings?beds=4", "4+ beds", false],
            ] as [string, string, boolean][]
          ).map(([href, label, on]) => (
            <Link
              key={label}
              href={href}
              className="no-underline transition-colors"
              style={{
                fontSize: 12.5,
                fontWeight: 500,
                padding: "10px 18px",
                borderRadius: 999,
                background: on ? "var(--ink)" : "var(--card)",
                color: on ? "#fff" : "var(--ink)",
              }}
            >
              {label}
            </Link>
          ))}
        </div>
        <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2">
          {featured.slice(0, 4).map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
        <div className="mt-12 flex justify-center">
          <Link
            href="/listings"
            className="flex items-center justify-center rounded-full border no-underline transition-colors hover:!border-[var(--ink)]"
            style={{
              width: 92,
              height: 92,
              borderColor: "var(--line)",
              color: "var(--ink)",
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            See all
          </Link>
        </div>
      </div>

      {/* ── The agent ───────────────────────────────────────── */}
      <div style={{ padding: sectionPad, paddingTop: 0 }}>
        <SectionIntro
          title={
            <>
              Buying &amp; selling
              <br />
              with Tyler
            </>
          }
          para="From first showing to firm sale, every step is handled by a working REALTOR® who understands the deal — backed by media that makes buyers stop scrolling."
          cta={{ href: "/listings", label: "View properties" }}
        />
        <div className="grid gap-5 md:grid-cols-[1.4fr_1fr_1fr]">
          <div className="relative overflow-hidden rounded-[18px]" style={{ minHeight: 260 }}>
            <Image
              src={photos.agent}
              alt={landingPhotoSlot("agent").alt}
              fill
              sizes="(max-width: 768px) 100vw, 40vw"
              className="object-cover"
            />
          </div>
          <div className="flex flex-col justify-between gap-6 rounded-[18px]" style={{ background: "var(--card)", padding: "26px 24px" }}>
            <div className="flex flex-col gap-3">
              <span className="font-display" style={{ fontSize: 18, fontWeight: 600, lineHeight: 1.3 }}>
                A smooth, honest deal from list to close
              </span>
              <span style={{ fontSize: 12.5, lineHeight: 1.7, color: "rgba(var(--ink-rgb),.62)" }}>
                Pricing strategy, negotiation, and straight answers — Tyler keeps every
                step effortless and transparent, whether you&apos;re buying your first
                home or selling your fifth.
              </span>
            </div>
            <Link href="/listings" className="pill-outline self-start">
              Details <span className="pill-arrow">↗</span>
            </Link>
          </div>
          <div className="flex flex-col items-center justify-between gap-4 rounded-[18px] text-center" style={{ background: "var(--card)", padding: 16 }}>
            <div className="relative w-full overflow-hidden rounded-[14px]" style={{ aspectRatio: "3/2" }}>
              <Image
                src={photos.selling}
                alt={landingPhotoSlot("selling").alt}
                fill
                sizes="(max-width: 768px) 100vw, 25vw"
                className="object-cover"
              />
            </div>
            <span className="font-display" style={{ fontSize: 18, fontWeight: 600 }}>
              Thinking of selling?
            </span>
            <span style={{ fontSize: 12.5, lineHeight: 1.7, color: "rgba(var(--ink-rgb),.62)", padding: "0 8px" }}>
              The fastest firm sale went in 6 days at 104% of asking. Find out what your
              home could do with the full Move Media launch.
            </span>
            <Link href="/#contact" className="pill-outline mb-2">
              Get a free evaluation <span className="pill-arrow">↗</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── The studio ──────────────────────────────────────── */}
      <div id="studio" style={{ padding: sectionPad, paddingTop: 0 }}>
        <SectionIntro
          title={
            <>
              Book the
              <br />
              Move Media studio
            </>
          }
          para="Photography, cinematic tours, drone, virtual staging and floor plans — for agents and homeowners across the Avalon. Gold winner, St. John's Community Votes 2020."
          cta={{ href: "/#contact", label: "Book a shoot" }}
        />
        <div className="grid gap-5 md:grid-cols-[1.9fr_1fr]">
          <div className="grid gap-5 rounded-[18px] sm:grid-cols-[220px_1fr]" style={{ background: "var(--card)", padding: 18 }}>
            <div className="relative overflow-hidden rounded-[14px]" style={{ minHeight: 200 }}>
              <Image
                src={photos.studio}
                alt={landingPhotoSlot("studio").alt}
                fill
                sizes="(max-width: 640px) 100vw, 220px"
                className="object-cover"
              />
            </div>
            <div className="flex flex-col justify-center gap-3.5" style={{ padding: "10px 6px" }}>
              <span className="font-display" style={{ fontSize: 18, fontWeight: 600 }}>
                An award-winning studio, built in-house
              </span>
              <div className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2" style={{ fontSize: 12.5, color: "rgba(var(--ink-rgb),.7)" }}>
                {[
                  "Professional photography",
                  "Cinematic video tours",
                  "Drone photo & film",
                  "Virtual staging",
                  "Floor plans & measurements",
                  "Social video content",
                ].map((s) => (
                  <span key={s} className="border-t pt-2" style={{ borderColor: "var(--line)" }}>
                    {s}
                  </span>
                ))}
              </div>
              <Link href="/#contact" className="pill-outline mt-1 self-start">
                Begin your booking <span className="pill-arrow">↗</span>
              </Link>
            </div>
          </div>
          <div className="flex flex-col items-center justify-between gap-5 rounded-[18px] text-center" style={{ background: "var(--card)", padding: "26px 24px" }}>
            <span className="font-display" style={{ fontSize: 18, fontWeight: 600 }}>
              Quick quote
            </span>
            <span style={{ fontSize: 12.5, lineHeight: 1.7, color: "rgba(var(--ink-rgb),.62)" }}>
              Tell us about the property and what you need shot — photos, film, drone, or
              the full package — and we&apos;ll come back with a quote, usually the same day.
            </span>
            <Link href="/#contact" className="pill-outline">
              Request a quote <span className="pill-arrow">↗</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Featured carousel ───────────────────────────────── */}
      {featured.length > 0 && (
        <div style={{ padding: sectionPad, paddingTop: 0 }}>
          <h2
            className="font-display mx-auto mb-10 text-center"
            style={{ ...h2Style, fontSize: "clamp(30px,3.6vw,48px)", maxWidth: "14em" }}
          >
            Top-rated featured homes you&apos;ll love
          </h2>
          <FeaturedCarousel listings={featured} />
        </div>
      )}

      {/* ── About / approach ────────────────────────────────── */}
      <div style={{ padding: sectionPad, paddingTop: 0 }}>
        <SectionIntro
          title={
            <>
              One brand, two doors —
              <br />
              built in St. John&apos;s
            </>
          }
          para="Tyler's goal is simple: make buying and selling in Newfoundland seamless, transparent, and honestly good-looking — one home at a time."
        />
        <div className="grid items-start gap-10 md:grid-cols-2">
          <div className="relative overflow-hidden rounded-[18px]" style={{ minHeight: 300, aspectRatio: "4/3" }}>
            <Image
              src={photos.about}
              alt={landingPhotoSlot("about").alt}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div className="flex flex-col">
            {(
              [
                [
                  "Client-first approach",
                  "A working REALTOR® at EXP Realty who knows the St. John's market — pricing, timing, and what buyers here actually respond to.",
                ],
                [
                  "Media included, never upsold",
                  "Every listing launches with the full Move Media package: photography, cinematic film, and drone — standard, at no extra cost.",
                ],
                [
                  "Social-first reach",
                  "212K views on one listing launch. @tylerjoxford puts homes in front of buyers on Instagram and TikTok before they ever hit a portal.",
                ],
                [
                  "Trust & transparency",
                  "Straight answers, no scripts, no pressure — from the first viewing to the day the deal goes firm.",
                ],
              ] as [string, string][]
            ).map(([t, body], i) => (
              <details key={t} className="clean border-b" style={{ borderColor: "var(--line)" }} open={i === 0}>
                <summary className="flex items-center justify-between py-4">
                  <span className="font-display" style={{ fontSize: 15.5, fontWeight: 600 }}>
                    {t}
                  </span>
                  <span style={{ fontSize: 12, color: "rgba(var(--ink-rgb),.4)" }}>＋</span>
                </summary>
                <p style={{ margin: "0 0 18px", fontSize: 12.5, lineHeight: 1.75, color: "rgba(var(--ink-rgb),.62)", maxWidth: 460 }}>
                  {body}
                </p>
              </details>
            ))}
          </div>
        </div>
        {/* testimonial strip */}
        <div className="mx-auto mt-16 max-w-[760px] text-center">
          <p className="font-display m-0" style={{ fontSize: "clamp(19px,2.2vw,26px)", lineHeight: 1.5, fontWeight: 500 }}>
            “The photos alone brought four offers. Tyler shot it, listed it, and had it
            firm in six days — I&apos;ve never seen a house move like that.”
          </p>
          <div style={{ marginTop: 16, fontSize: 11, fontWeight: 600, letterSpacing: ".22em", color: "rgba(var(--ink-rgb),.45)" }}>
            SELLER — QUIDI VIDI VILLAGE, 2025
          </div>
        </div>
      </div>

      {/* ── FAQ ─────────────────────────────────────────────── */}
      <div id="faq" style={{ padding: sectionPad, paddingTop: 0 }}>
        <div className="grid items-start gap-10 md:grid-cols-[1fr_1.2fr] md:gap-16">
          <div className="flex flex-col gap-5">
            <h2 className="font-display" style={h2Style}>
              Your questions,
              <br />
              our answers
            </h2>
            <p style={sideParaStyle}>
              Buying, selling, or booking a shoot — here are the questions Tyler hears
              most. Anything else, just ask.
            </p>
            <div className="relative mt-2 hidden overflow-hidden rounded-[18px] md:block" style={{ height: 260, maxWidth: 320 }}>
              <Image
                src={photos.faq}
                alt={landingPhotoSlot("faq").alt}
                fill
                sizes="320px"
                className="object-cover"
              />
            </div>
          </div>
          <div className="flex flex-col gap-3">
            {faqs.map(([q, a], i) => (
              <details
                key={q}
                className="clean rounded-[22px] border"
                style={{ borderColor: "var(--line)", background: "var(--bg)" }}
              >
                <summary className="flex items-center gap-4" style={{ padding: "16px 20px" }}>
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: "rgba(var(--ink-rgb),.45)" }}>
                    0{i + 1}/
                  </span>
                  <span style={{ fontSize: 13.5, fontWeight: 500, flex: 1 }}>{q}</span>
                  <span
                    className="flex items-center justify-center rounded-full border"
                    style={{ width: 30, height: 30, borderColor: "var(--line)", fontSize: 11 }}
                  >
                    ↗
                  </span>
                </summary>
                <p style={{ margin: 0, padding: "0 20px 18px 52px", fontSize: 12.5, lineHeight: 1.75, color: "rgba(var(--ink-rgb),.62)" }}>
                  {a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA banner ──────────────────────────────────────── */}
      <div style={{ padding: sectionPad, paddingTop: 0 }}>
        <div className="relative overflow-hidden rounded-[24px]" style={{ minHeight: 320 }}>
          <Image
            src={photos.cta}
            alt={landingPhotoSlot("cta").alt}
            fill
            sizes="(max-width: 1560px) 100vw, 1560px"
            className="object-cover"
          />
          <div className="absolute inset-0" style={{ background: "rgba(13,15,18,.55)" }} />
          <div className="relative flex flex-col items-center gap-4 text-center" style={{ padding: "clamp(48px,6vw,80px) 24px" }}>
            <h2 className="font-display m-0" style={{ ...h2Style, color: "#fff", fontSize: "clamp(26px,3vw,40px)" }}>
              Find your next home, stress&#8209;free
            </h2>
            <p style={{ margin: 0, maxWidth: 480, fontSize: 13.5, lineHeight: 1.7, color: "rgba(255,255,255,.8)" }}>
              Browse listings across St. John&apos;s &amp; Eastern Newfoundland — every one
              shot in-house by Move Media. Start exploring and move closer to your
              perfect home.
            </p>
            <Link href="/listings" className="pill-navy mt-2" style={{ padding: "13px 26px" }}>
              Explore properties <span className="pill-arrow">↗</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

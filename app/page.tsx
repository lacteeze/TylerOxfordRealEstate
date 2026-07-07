import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Listing } from "@/lib/types";
import ListingCard from "@/components/ListingCard";

export const revalidate = 60;

const eyebrow: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: ".26em",
  color: "var(--gold)",
};

export default async function Home() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("listings")
    .select("*")
    .eq("featured", true)
    .neq("status", "sold")
    .order("price", { ascending: false })
    .limit(3);
  const featured = (data || []) as Listing[];

  return (
    <div>
      {/* Hero */}
      <div className="relative overflow-hidden" style={{ height: "90vh", minHeight: 560 }}>
        <Image
          src="https://images.unsplash.com/photo-1666297634835-22de00737fe4?auto=format&fit=crop&w=2600&q=85"
          alt="Fogo Island lighthouse on the rocky North Atlantic shore, Newfoundland"
          fill
          priority
          className="object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, var(--bg) 0%, rgba(21,23,28,.35) 45%, rgba(21,23,28,.25) 100%)",
          }}
        />
        <div
          className="fade-up absolute"
          style={{ left: "clamp(20px,4vw,48px)", right: "clamp(20px,4vw,48px)", bottom: 64 }}
        >
          <div style={{ ...eyebrow, letterSpacing: ".3em", marginBottom: 18 }}>
            ST. JOHN&apos;S &amp; EASTERN NEWFOUNDLAND
          </div>
          <h1
            className="font-serif-display m-0"
            style={{
              fontSize: "clamp(40px,7.5vw,116px)",
              lineHeight: 0.98,
              letterSpacing: "-.01em",
              maxWidth: "13em",
              textWrap: "balance",
              fontWeight: 500,
            }}
          >
            Shot, styled &amp; sold by an award winner.
          </h1>
          <p style={{ margin: "22px 0 0", maxWidth: 520, fontSize: 15, lineHeight: 1.7, color: "rgba(var(--ink-rgb),.7)" }}>
            One brand, two doors: a working REALTOR® who understands the deal, and the
            in-house media studio that makes every listing look like this.
          </p>
        </div>
      </div>

      {/* Two paths */}
      <div
        className="grid"
        style={{
          gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,320px),1fr))",
          gap: 1,
          background: "rgba(var(--ink-rgb),.1)",
          borderTop: "1px solid rgba(var(--ink-rgb),.1)",
          borderBottom: "1px solid rgba(var(--ink-rgb),.1)",
        }}
      >
        <Link
          href="/listings"
          className="flex flex-col gap-4 no-underline transition-colors hover:!bg-[var(--bg-hov)]"
          style={{ color: "var(--ink)", background: "var(--bg)", padding: "clamp(36px,4vw,64px)" }}
        >
          <span style={eyebrow}>01 — THE AGENT</span>
          <span className="font-serif-display" style={{ fontSize: "clamp(30px,3vw,44px)", lineHeight: 1.1 }}>
            Buying &amp; selling
            <br />
            with Tyler
          </span>
          <span style={{ fontSize: 14, lineHeight: 1.7, color: "rgba(var(--ink-rgb),.6)", maxWidth: 400 }}>
            Every listing launches with a full cinematic media package — included, not
            upsold. Browse what&apos;s on the market now.
          </span>
          <span style={{ fontSize: 12.5, fontWeight: 600, letterSpacing: ".08em", color: "var(--gold)", marginTop: 8 }}>
            VIEW PROPERTIES →
          </span>
        </Link>
        <Link
          href="/#contact"
          className="flex flex-col gap-4 no-underline transition-colors hover:!bg-[var(--bg2-hov)]"
          style={{ color: "var(--ink)", background: "var(--bg2)", padding: "clamp(36px,4vw,64px)" }}
        >
          <span style={eyebrow}>02 — THE STUDIO</span>
          <span className="font-serif-display" style={{ fontSize: "clamp(30px,3vw,44px)", lineHeight: 1.1 }}>
            Book the
            <br />
            Oxford Media team
          </span>
          <span style={{ fontSize: 14, lineHeight: 1.7, color: "rgba(var(--ink-rgb),.6)", maxWidth: 400 }}>
            Photography, cinematic tours, drone, virtual staging and floor plans — for
            agents and homeowners across the Avalon.
          </span>
          <span style={{ fontSize: 12.5, fontWeight: 600, letterSpacing: ".08em", color: "var(--gold)", marginTop: 8 }}>
            REQUEST A QUOTE →
          </span>
        </Link>
      </div>

      {/* Featured listings */}
      <div style={{ padding: "clamp(56px,7vw,104px) clamp(20px,4vw,48px)" }}>
        <div className="mb-10 flex items-baseline justify-between gap-5">
          <h2 className="font-serif-display m-0" style={{ fontSize: "clamp(34px,3.6vw,52px)", fontWeight: 500 }}>
            Featured listings
          </h2>
          <Link href="/listings" className="no-underline" style={{ fontSize: 12.5, fontWeight: 600, letterSpacing: ".08em", color: "var(--gold)" }}>
            ALL PROPERTIES →
          </Link>
        </div>
        <div
          className="grid"
          style={{
            gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,300px),1fr))",
            gap: "clamp(20px,3vw,32px)",
          }}
        >
          {featured.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      </div>

      {/* Studio band */}
      <div
        id="studio"
        className="grid items-center"
        style={{
          background: "var(--bg2)",
          borderTop: "1px solid rgba(var(--ink-rgb),.08)",
          padding: "clamp(56px,7vw,104px) clamp(20px,4vw,48px)",
          gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,340px),1fr))",
          gap: "clamp(36px,5vw,80px)",
        }}
      >
        <div className="flex flex-col gap-[22px]">
          <Image
            src="/oxford-media-logo.png"
            alt="Oxford Media"
            width={76}
            height={76}
            className="object-cover"
            style={{ border: "1px solid rgba(var(--ink-rgb),.12)" }}
          />
          <h2 className="font-serif-display m-0" style={{ fontSize: "clamp(32px,3.4vw,50px)", lineHeight: 1.08, maxWidth: "11em", fontWeight: 500 }}>
            An award-winning studio, built in-house.
          </h2>
          <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.75, color: "rgba(var(--ink-rgb),.6)", maxWidth: 480 }}>
            Tyler started shooting homes for free in high school. That turned into Oxford
            Media — gold winner, St. John&apos;s Community Votes 2020 — and now every one of
            his listings gets the full treatment, standard.
          </p>
          <div
            className="grid grid-cols-2"
            style={{ gap: "12px 28px", fontSize: 13.5, color: "rgba(var(--ink-rgb),.75)", maxWidth: 460 }}
          >
            {[
              "Professional photography",
              "Cinematic video tours",
              "Drone photo & film",
              "Virtual staging",
              "Floor plans & measurements",
              "Social video content",
            ].map((s) => (
              <span key={s} style={{ borderTop: "1px solid rgba(var(--ink-rgb),.12)", paddingTop: 12 }}>
                {s}
              </span>
            ))}
          </div>
          <Link
            href="/#contact"
            className="self-start border no-underline transition-colors hover:!border-[var(--gold)] hover:!text-[var(--gold)]"
            style={{
              marginTop: 6,
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: ".08em",
              color: "var(--ink)",
              borderColor: "rgba(var(--ink-rgb),.3)",
              padding: "12px 20px",
            }}
          >
            BOOK A SHOOT →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3.5">
          {[
            ["https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80", "Interior photography", true],
            ["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80", "Twilight exterior", false],
            ["https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=1200&q=80", "Drone coastal", true],
            ["https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80", "Kitchen detail", false],
          ].map(([src, alt, offset]) => (
            <div
              key={src as string}
              className="relative w-full overflow-hidden rounded-[10px]"
              style={{ aspectRatio: "3/4", marginTop: offset ? 32 : 0 }}
            >
              <Image src={src as string} alt={alt as string} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover" />
            </div>
          ))}
        </div>
      </div>

      {/* Proof */}
      <div
        className="flex flex-col items-center gap-9 text-center"
        style={{ padding: "clamp(64px,8vw,120px) clamp(20px,4vw,48px)" }}
      >
        <p
          className="font-serif-display m-0 italic"
          style={{ fontSize: "clamp(26px,3vw,40px)", lineHeight: 1.35, maxWidth: "22em" }}
        >
          &ldquo;The photos alone brought four offers. Tyler shot it, listed it, and had it
          firm in six days — I&apos;ve never seen a house move like that.&rdquo;
        </p>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".24em", color: "rgba(var(--ink-rgb),.5)" }}>
          SELLER — QUIDI VIDI VILLAGE, 2025
        </div>
        <div
          className="flex w-full max-w-[880px] flex-wrap justify-center pt-9"
          style={{ gap: "14px 56px", borderTop: "1px solid rgba(var(--ink-rgb),.1)" }}
        >
          {[
            ["Gold", "COMMUNITY VOTES · 2020"],
            ["212K", "VIEWS · ONE LISTING LAUNCH"],
            ["6 days", "FASTEST FIRM SALE · 104% ASK"],
            ["@tylerjoxford", "INSTAGRAM · TIKTOK"],
          ].map(([big, small]) => (
            <div key={small} className="flex flex-col gap-1.5">
              <span className="font-serif-display" style={{ fontSize: 30, color: "var(--gold)" }}>
                {big}
              </span>
              <span style={{ fontSize: 10.5, letterSpacing: ".18em", color: "rgba(var(--ink-rgb),.5)" }}>
                {small}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";
import ContactForm from "./ContactForm";

export default function Footer() {
  return (
    <div
      id="contact"
      style={{
        background: "var(--bg3)",
        borderTop: "1px solid rgba(var(--ink-rgb),.08)",
        padding: "clamp(56px,7vw,96px) clamp(20px,4vw,48px) 40px",
      }}
    >
      <div
        className="mx-auto grid max-w-[1400px]"
        style={{
          gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,280px),1fr))",
          gap: "clamp(32px,5vw,72px)",
        }}
      >
        <div className="flex flex-col gap-[18px]">
          <span
            className="font-serif-display"
            style={{ fontSize: "clamp(30px,3vw,44px)", lineHeight: 1.1, maxWidth: "10em" }}
          >
            Two doors. One number.
          </span>
          <span style={{ fontSize: 14, lineHeight: 1.7, color: "rgba(var(--ink-rgb),.55)", maxWidth: 380 }}>
            Buying, selling, or booking a shoot — start with a call or a message. Serving
            St. John&apos;s &amp; Eastern Newfoundland.
          </span>
          <div className="mt-1.5 flex flex-col gap-1.5">
            <a href="tel:+17095550194" className="no-underline" style={{ color: "var(--gold)", fontSize: 18, fontWeight: 500 }}>
              (709) 555-0194
            </a>
            <a href="mailto:tyler@oxfordmedia.ca" className="no-underline" style={{ color: "rgba(var(--ink-rgb),.75)", fontSize: 14 }}>
              tyler@oxfordmedia.ca
            </a>
          </div>
          <div className="mt-4 flex flex-col gap-3.5">
            <span style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: ".24em", color: "rgba(var(--ink-rgb),.45)" }}>
              REAL ESTATE
            </span>
            <Link href="/listings" className="no-underline hover:!text-[var(--gold)]" style={{ color: "rgba(var(--ink-rgb),.75)", fontSize: 14 }}>
              Active listings
            </Link>
            <span style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: ".24em", color: "rgba(var(--ink-rgb),.45)", marginTop: 8 }}>
              OXFORD MEDIA
            </span>
            <a href="https://instagram.com/tylerjoxford" target="_blank" rel="noreferrer" className="no-underline hover:!text-[var(--gold)]" style={{ color: "rgba(var(--ink-rgb),.75)", fontSize: 14 }}>
              Instagram ↗
            </a>
            <a href="https://tiktok.com/@tylerjoxford" target="_blank" rel="noreferrer" className="no-underline hover:!text-[var(--gold)]" style={{ color: "rgba(var(--ink-rgb),.75)", fontSize: 14 }}>
              TikTok ↗
            </a>
          </div>
        </div>
        <div className="flex flex-col gap-5">
          <span style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: ".24em", color: "rgba(var(--ink-rgb),.45)" }}>
            SEND A MESSAGE
          </span>
          <ContactForm />
        </div>
      </div>
      <div
        className="mx-auto mt-14 flex max-w-[1400px] flex-wrap justify-between gap-3 pt-[22px]"
        style={{
          borderTop: "1px solid rgba(var(--ink-rgb),.08)",
          fontSize: 10.5,
          letterSpacing: ".14em",
          color: "rgba(var(--ink-rgb),.35)",
        }}
      >
        <span>© 2026 TYLER OXFORD · REALTOR® · EXP REALTY</span>
        <span>ST. JOHN&apos;S &amp; EASTERN NEWFOUNDLAND</span>
      </div>
    </div>
  );
}

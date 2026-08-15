import Link from "next/link";
import Image from "next/image";
import ContactForm from "./ContactForm";

const socials: { label: string; href: string; icon: string }[] = [
  { label: "Instagram", href: "https://instagram.com/tylerjoxford", icon: "/icons/instagram.png" },
  { label: "TikTok", href: "https://tiktok.com/@tylerjoxford", icon: "/icons/tiktok.png" },
  { label: "Facebook", href: "https://www.facebook.com/tyleroxfordrealestate/", icon: "/icons/facebook.png" },
  { label: "YouTube", href: "https://www.youtube.com/@TylerOxford", icon: "/icons/youtube.png" },
  { label: "Google Business profile", href: "https://share.google/6dLQR1D6fWXatCFIw", icon: "/icons/google.png" },
];

export default function Footer() {
  return (
    <div
      id="contact"
      style={{
        background: "linear-gradient(to bottom, var(--bg) 0%, var(--cream) 55%)",
        padding: "clamp(56px,7vw,96px) clamp(20px,3.5vw,44px) 32px",
      }}
    >
      {/* Contact block */}
      <div
        className="mx-auto grid max-w-[1400px]"
        style={{
          gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,300px),1fr))",
          gap: "clamp(32px,5vw,72px)",
        }}
      >
        <div className="flex flex-col gap-[18px]">
          <span
            className="font-display"
            style={{ fontSize: "clamp(28px,3vw,42px)", lineHeight: 1.1, fontWeight: 600, letterSpacing: "-.02em", maxWidth: "10em" }}
          >
            Two doors.
            <br />
            One number.
          </span>
          <span style={{ fontSize: 13.5, lineHeight: 1.7, color: "rgba(var(--ink-rgb),.6)", maxWidth: 380 }}>
            Buying, selling, or booking a shoot — start with a call or a message. Serving
            St. John&apos;s &amp; Eastern Newfoundland.
          </span>
          <div className="mt-1.5 flex flex-col gap-1.5">
            <a href="tel:+17096871754" className="font-display no-underline" style={{ color: "var(--navy)", fontSize: 22, fontWeight: 700 }}>
              (709) 687-1754
            </a>
            <a href="mailto:info@tyleroxford.com" className="no-underline" style={{ color: "rgba(var(--ink-rgb),.75)", fontSize: 14 }}>
              info@tyleroxford.com
            </a>
          </div>
          <div className="mt-2 flex gap-2.5">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                aria-label={s.label}
                className="flex items-center justify-center rounded-full no-underline transition-colors hover:!bg-[var(--navy-hov)]"
                style={{ width: 38, height: 38, background: "var(--navy)" }}
              >
                {/* Black icon inverted to white for the navy circle */}
                <Image
                  src={s.icon}
                  alt=""
                  width={18}
                  height={18}
                  style={{ filter: "brightness(0) invert(1)" }}
                />
              </a>
            ))}
          </div>

          {/* Link columns */}
          <div className="mt-6 grid grid-cols-2 gap-8" style={{ maxWidth: 420 }}>
            <div className="flex flex-col gap-3">
              <span className="font-display" style={{ fontSize: 14.5, fontWeight: 600 }}>
                Quick links
              </span>
              {(
                [
                  ["/", "Home"],
                  ["/listings", "Properties"],
                  ["/#studio", "Move Media"],
                  ["/#faq", "FAQs"],
                ] as [string, string][]
              ).map(([href, label]) => (
                <Link key={label} href={href} className="no-underline hover:!text-[var(--navy)]" style={{ color: "rgba(var(--ink-rgb),.65)", fontSize: 13 }}>
                  {label}
                </Link>
              ))}
            </div>
            <div className="flex flex-col gap-3">
              <span className="font-display" style={{ fontSize: 14.5, fontWeight: 600 }}>
                Move Media
              </span>
              <a href="https://instagram.com/tylerjoxford" target="_blank" rel="noreferrer" className="no-underline hover:!text-[var(--navy)]" style={{ color: "rgba(var(--ink-rgb),.65)", fontSize: 13 }}>
                Instagram ↗
              </a>
              <a href="https://tiktok.com/@tylerjoxford" target="_blank" rel="noreferrer" className="no-underline hover:!text-[var(--navy)]" style={{ color: "rgba(var(--ink-rgb),.65)", fontSize: 13 }}>
                TikTok ↗
              </a>
              <Link href="/admin" className="no-underline hover:!text-[var(--navy)]" style={{ color: "rgba(var(--ink-rgb),.45)", fontSize: 13 }}>
                Manage
              </Link>
            </div>
          </div>
        </div>

        <div
          className="flex flex-col gap-5 rounded-[22px]"
          style={{ background: "var(--bg)", border: "1px solid var(--line)", padding: "clamp(24px,3vw,36px)" }}
        >
          <span className="font-display" style={{ fontSize: 20, fontWeight: 600 }}>
            Send a message
          </span>
          <ContactForm />
        </div>
      </div>

      <div
        className="mx-auto mt-14 flex max-w-[1400px] flex-wrap justify-between gap-3 pt-[22px]"
        style={{
          borderTop: "1px solid var(--line)",
          fontSize: 11,
          letterSpacing: ".1em",
          color: "rgba(var(--ink-rgb),.45)",
        }}
      >
        <span>© 2026 TYLER OXFORD · REALTOR® · EXP REALTY</span>
        <span>ST. JOHN&apos;S &amp; EASTERN NEWFOUNDLAND</span>
      </div>
      <div
        className="mx-auto mt-4 max-w-[1400px] text-center"
        style={{ fontSize: 13, letterSpacing: ".08em", color: "rgba(var(--ink-rgb),.45)" }}
      >
        Website designed by{" "}
        <span style={{ fontWeight: 700, letterSpacing: ".22em" }}>CANARY</span>
      </div>
    </div>
  );
}

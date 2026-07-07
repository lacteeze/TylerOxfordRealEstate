"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const navLinks: [string, string, boolean][] = [
  ["/", "HOME", false],
  ["/listings", "PROPERTIES", false],
  ["/#studio", "STUDIO", false],
  ["/admin", "MANAGE", true],
];

export default function Header() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    try {
      const t = (localStorage.getItem("to-theme") as "dark" | "light") || "dark";
      setTheme(t);
    } catch {}
  }, []);

  // Close the mobile menu on navigation.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    document.body.dataset.theme = next;
    try {
      localStorage.setItem("to-theme", next);
    } catch {}
    setTheme(next);
  }

  const navLinkStyle = (dim: boolean): React.CSSProperties => ({
    color: dim ? "rgba(var(--ink-rgb),.4)" : "rgba(var(--ink-rgb),.75)",
  });

  return (
    <div
      className="sticky top-0 z-[60] border-b"
      style={{
        background: "rgba(var(--bg-rgb),.85)",
        backdropFilter: "blur(16px)",
        borderColor: "rgba(var(--ink-rgb),.08)",
      }}
    >
      <div
        className="flex items-center justify-between gap-x-6 px-5 py-2.5 md:py-3.5"
        style={{ paddingLeft: "clamp(20px,4vw,48px)", paddingRight: "clamp(20px,4vw,48px)" }}
      >
        <Link href="/" className="flex flex-col gap-0.5 no-underline" style={{ color: "var(--ink)" }}>
          <span className="font-serif-display text-[19px] md:text-[22px]" style={{ letterSpacing: ".06em" }}>
            Tyler Oxford
          </span>
          <span
            className="hidden font-semibold sm:block"
            style={{ fontSize: 8.5, letterSpacing: ".28em", color: "rgba(var(--ink-rgb),.5)" }}
          >
            REALTOR® · EXP REALTY · OXFORD MEDIA
          </span>
        </Link>

        {/* Desktop nav + CTAs */}
        <div className="hidden items-center gap-x-7 md:flex">
          <nav className="flex items-center gap-x-6 font-medium" style={{ fontSize: 12.5, letterSpacing: ".08em" }}>
            {navLinks.map(([href, label, dim]) => (
              <Link key={label} href={href} className="no-underline transition-colors hover:!text-[var(--gold)]" style={navLinkStyle(dim)}>
                {label}
              </Link>
            ))}
          </nav>
          <button
            onClick={toggleTheme}
            title="Toggle light / dark mode"
            className="flex h-[38px] w-[38px] flex-none cursor-pointer items-center justify-center rounded-full border bg-transparent transition-colors hover:!border-[var(--gold)] hover:!text-[var(--gold)]"
            style={{ borderColor: "rgba(var(--ink-rgb),.3)", color: "var(--ink)", fontSize: 15, lineHeight: 1 }}
          >
            {theme === "dark" ? "☀" : "☾"}
          </button>
          <div className="flex gap-2.5">
            <Link
              href="/#contact"
              className="no-underline transition-colors hover:!bg-[var(--gold-hov)]"
              style={{
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: ".06em",
                color: "var(--gold-ink)",
                background: "var(--gold)",
                padding: "11px 18px",
              }}
            >
              WORK WITH TYLER
            </Link>
            <Link
              href="/#contact"
              className="border no-underline transition-colors hover:!border-[var(--gold)] hover:!text-[var(--gold)]"
              style={{
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: ".06em",
                color: "var(--ink)",
                borderColor: "rgba(var(--ink-rgb),.3)",
                padding: "10px 18px",
              }}
            >
              BOOK THE STUDIO
            </Link>
          </div>
        </div>

        {/* Mobile: theme toggle + hamburger */}
        <div className="flex items-center gap-2.5 md:hidden">
          <button
            onClick={toggleTheme}
            title="Toggle light / dark mode"
            className="flex h-[34px] w-[34px] flex-none cursor-pointer items-center justify-center rounded-full border bg-transparent"
            style={{ borderColor: "rgba(var(--ink-rgb),.3)", color: "var(--ink)", fontSize: 14, lineHeight: 1 }}
          >
            {theme === "dark" ? "☀" : "☾"}
          </button>
          <button
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="flex h-[34px] w-[34px] flex-none cursor-pointer flex-col items-center justify-center gap-[5px] border-none bg-transparent"
            style={{ color: "var(--ink)" }}
          >
            <span
              className="block h-px w-[18px] transition-transform"
              style={{ background: "var(--ink)", transform: open ? "translateY(3px) rotate(45deg)" : "none" }}
            />
            <span
              className="block h-px w-[18px] transition-transform"
              style={{ background: "var(--ink)", transform: open ? "translateY(-3px) rotate(-45deg)" : "none" }}
            />
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {open && (
        <div
          className="flex flex-col border-t md:hidden"
          style={{
            borderColor: "rgba(var(--ink-rgb),.08)",
            padding: "10px clamp(20px,4vw,48px) 20px",
            background: "rgba(var(--bg-rgb),.97)",
          }}
        >
          <nav className="flex flex-col font-medium" style={{ fontSize: 13, letterSpacing: ".1em" }}>
            {navLinks.map(([href, label, dim]) => (
              <Link
                key={label}
                href={href}
                onClick={() => setOpen(false)}
                className="border-b no-underline"
                style={{ ...navLinkStyle(dim), padding: "13px 0", borderColor: "rgba(var(--ink-rgb),.07)" }}
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 flex flex-col gap-2.5">
            <Link
              href="/#contact"
              onClick={() => setOpen(false)}
              className="text-center no-underline"
              style={{
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: ".06em",
                color: "var(--gold-ink)",
                background: "var(--gold)",
                padding: "12px 18px",
              }}
            >
              WORK WITH TYLER
            </Link>
            <Link
              href="/#contact"
              onClick={() => setOpen(false)}
              className="border text-center no-underline"
              style={{
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: ".06em",
                color: "var(--ink)",
                borderColor: "rgba(var(--ink-rgb),.3)",
                padding: "11px 18px",
              }}
            >
              BOOK THE STUDIO
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Header() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    try {
      const t = (localStorage.getItem("to-theme") as "dark" | "light") || "dark";
      setTheme(t);
    } catch {}
  }, []);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    document.body.dataset.theme = next;
    try {
      localStorage.setItem("to-theme", next);
    } catch {}
    setTheme(next);
  }

  return (
    <div
      className="sticky top-0 z-[60] flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b"
      style={{
        padding: "14px clamp(20px,4vw,48px)",
        background: "rgba(var(--bg-rgb),.85)",
        backdropFilter: "blur(16px)",
        borderColor: "rgba(var(--ink-rgb),.08)",
      }}
    >
      <Link href="/" className="flex flex-col gap-0.5 no-underline" style={{ color: "var(--ink)" }}>
        <span className="font-serif-display" style={{ fontSize: 22, letterSpacing: ".06em" }}>
          Tyler Oxford
        </span>
        <span
          className="font-semibold"
          style={{ fontSize: 8.5, letterSpacing: ".28em", color: "rgba(var(--ink-rgb),.5)" }}
        >
          REALTOR® · EXP REALTY · OXFORD MEDIA
        </span>
      </Link>
      <div className="flex flex-wrap items-center gap-x-7 gap-y-3">
        <nav
          className="flex flex-wrap items-center gap-x-6 gap-y-2.5 font-medium"
          style={{ fontSize: 12.5, letterSpacing: ".08em" }}
        >
          <Link href="/" className="no-underline transition-colors hover:!text-[var(--gold)]" style={{ color: "rgba(var(--ink-rgb),.75)" }}>
            HOME
          </Link>
          <Link href="/listings" className="no-underline transition-colors hover:!text-[var(--gold)]" style={{ color: "rgba(var(--ink-rgb),.75)" }}>
            PROPERTIES
          </Link>
          <Link href="/#studio" className="no-underline transition-colors hover:!text-[var(--gold)]" style={{ color: "rgba(var(--ink-rgb),.75)" }}>
            STUDIO
          </Link>
          <Link href="/admin" className="no-underline transition-colors hover:!text-[var(--gold)]" style={{ color: "rgba(var(--ink-rgb),.4)" }}>
            MANAGE
          </Link>
        </nav>
        <button
          onClick={toggleTheme}
          title="Toggle light / dark mode"
          className="flex h-[38px] w-[38px] flex-none cursor-pointer items-center justify-center rounded-full border bg-transparent transition-colors hover:!border-[var(--gold)] hover:!text-[var(--gold)]"
          style={{ borderColor: "rgba(var(--ink-rgb),.3)", color: "var(--ink)", fontSize: 15, lineHeight: 1 }}
        >
          {theme === "dark" ? "☀" : "☾"}
        </button>
        <div className="flex flex-wrap gap-2.5">
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
    </div>
  );
}

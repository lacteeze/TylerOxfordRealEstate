"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const navLinks: [string, string][] = [
  ["/", "Home"],
  ["/listings", "Properties"],
  ["/#studio", "Move Media"],
  ["/#faq", "FAQs"],
  ["/#contact", "Contact"],
  ["/admin", "Manage"],
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const isAdmin = pathname.startsWith("/admin");
  const links: [string, string][] = isAdmin
    ? [
        ["/admin", "Manage"],
        ["/admin/inquiries", "Inquiries"],
      ]
    : navLinks;

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setOpen(false);
    router.push("/");
    router.refresh();
  }

  // Close the menu on navigation.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div
      className="sticky top-0 z-[60]"
      style={{ background: "var(--peach)", borderBottom: open ? "1px solid var(--line)" : "1px solid transparent" }}
    >
      <div
        className="flex items-center justify-between"
        style={{ padding: "16px clamp(20px,3.5vw,44px)" }}
      >
        <Link href="/" className="flex items-baseline gap-2 no-underline" style={{ color: "var(--ink)" }}>
          <span className="font-display" style={{ fontSize: 21, fontWeight: 700, letterSpacing: "-.01em" }}>
            Tyler Oxford<span style={{ color: "var(--gold)" }}>*</span>
          </span>
          <span
            className="hidden sm:block"
            style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: ".2em", color: "rgba(var(--ink-rgb),.5)" }}
          >
            REALTOR® · EXP REALTY · MOVE MEDIA
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <a href="tel:+17096871754" className="hidden no-underline md:block" style={{ color: "var(--ink)", fontSize: 13.5, fontWeight: 500 }}>
            (709) 687-1754
          </a>
          <button
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="flex h-11 w-11 cursor-pointer flex-col items-center justify-center gap-[5px] rounded-full border-none"
            style={{ background: "var(--card)", color: "var(--ink)" }}
          >
            <span
              className="block h-[1.5px] transition-all"
              style={{
                background: "var(--ink)",
                width: open ? 18 : 18,
                transform: open ? "translateY(3.5px) rotate(45deg)" : "none",
              }}
            />
            <span
              className="block h-[1.5px] transition-all"
              style={{
                background: "var(--ink)",
                width: open ? 18 : 12,
                alignSelf: open ? "center" : "flex-end",
                marginRight: open ? 0 : 12,
                transform: open ? "translateY(-3px) rotate(-45deg)" : "none",
              }}
            />
          </button>
        </div>
      </div>

      {/* Dropdown menu panel */}
      {open && (
        <div className="fade-up" style={{ padding: "0 clamp(20px,3.5vw,44px) 22px" }}>
          <div
            className="mx-auto flex flex-col gap-1 rounded-[18px] md:flex-row md:items-center md:justify-between"
            style={{ background: "var(--bg)", border: "1px solid var(--line)", padding: "18px clamp(18px,2.5vw,28px)" }}
          >
            <nav className="flex flex-col gap-0 md:flex-row md:items-center md:gap-7">
              {links.map(([href, label]) => (
                <Link
                  key={label}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="no-underline transition-colors hover:!text-[var(--gold)]"
                  style={{
                    color:
                      (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href)) ||
                      (!isAdmin && label === "Manage")
                        ? isAdmin
                          ? "var(--gold)"
                          : label === "Manage"
                            ? "rgba(var(--ink-rgb),.45)"
                            : "var(--ink)"
                        : "var(--ink)",
                    fontSize: 14.5,
                    fontWeight: 500,
                    padding: "10px 0",
                  }}
                >
                  {label}
                </Link>
              ))}
            </nav>
            <div className="mt-3 flex flex-col gap-2.5 sm:flex-row md:mt-0">
              {isAdmin ? (
                <>
                  <Link href="/admin/inquiries" onClick={() => setOpen(false)} className="pill-navy justify-center">
                    Inquiries <span className="pill-arrow">↗</span>
                  </Link>
                  <Link href="/admin/settings" onClick={() => setOpen(false)} className="pill-outline justify-center">
                    Settings
                  </Link>
                  <Link href="/" onClick={() => setOpen(false)} className="pill-outline justify-center">
                    View site <span className="pill-arrow">↗</span>
                  </Link>
                  <button type="button" onClick={signOut} className="pill-outline justify-center">
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/#contact" onClick={() => setOpen(false)} className="pill-navy justify-center">
                    Work with Tyler <span className="pill-arrow">↗</span>
                  </Link>
                  <Link href="/#contact" onClick={() => setOpen(false)} className="pill-outline justify-center">
                    Book the studio <span className="pill-arrow">↗</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

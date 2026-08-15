"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

/**
 * Hero photo with a slow ken-burns reveal on load and a subtle scroll
 * parallax (image layer moves slower than the page). The layer is
 * oversized vertically and only ever translated — never scaled — so the
 * image stays 1:1 sharp at rest and while scrolling. Fully disabled when
 * the user prefers reduced motion.
 */
export default function HeroParallax({ src, alt }: { src: string; alt: string }) {
  const frame = useRef<HTMLDivElement>(null);
  const layer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const el = frame.current;
      const inner = layer.current;
      if (!el || !inner) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 → element bottom enters viewport, 1 → element top leaves it.
      const p = Math.min(1, Math.max(0, (vh - rect.top) / (vh + rect.height)));
      // Slight counter-scroll drift (±6% of height, covered by the layer's
      // 6% vertical bleed). Translation only — no resampling, no blur.
      inner.style.transform = `translate3d(0, ${((p - 0.5) * rect.height * 0.12).toFixed(1)}px, 0)`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={frame}
      className="relative overflow-hidden rounded-[24px]"
      style={{ height: "clamp(320px, 58vh, 700px)", background: "var(--surface)" }}
    >
      <div
        ref={layer}
        className="absolute will-change-transform"
        style={{ top: "-6%", bottom: "-6%", left: 0, right: 0 }}
      >
        <div className="hero-media absolute inset-0">
          <Image
            src={src}
            alt={alt}
            fill
            priority
            quality={95}
            sizes="100vw"
            className="object-cover"
          />
        </div>
      </div>
    </div>
  );
}

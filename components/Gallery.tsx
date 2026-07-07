"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

export default function Gallery({ photos, title, hero }: { photos: string[]; title: string; hero?: boolean }) {
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);

  const step = useCallback(
    (dir: number) => {
      if (!photos.length) return;
      setIdx((i) => (i + dir + photos.length) % photos.length);
    },
    [photos.length]
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, step]);

  if (hero) {
    return (
      <>
        <div
          className="relative cursor-zoom-in overflow-hidden"
          style={{ height: "66vh", minHeight: 420 }}
          onClick={() => {
            setIdx(0);
            setOpen(true);
          }}
        >
          {photos[0] && <Image src={photos[0]} alt={title} fill priority className="object-cover" />}
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: "linear-gradient(to top,var(--bg) 0%,rgba(21,23,28,0) 40%)" }}
          />
        </div>
        {open && <Lightbox photos={photos} idx={idx} step={step} close={() => setOpen(false)} />}
      </>
    );
  }

  return (
    <>
      <div
        className="grid"
        style={{ gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,300px),1fr))", gap: 16 }}
      >
        {photos.map((src, i) => (
          <div
            key={i}
            className="relative w-full cursor-zoom-in overflow-hidden rounded-[10px] transition-opacity hover:opacity-90"
            style={{ minHeight: 260, maxHeight: "70vh", gridColumn: i === 0 ? "1 / -1" : "auto", aspectRatio: i === 0 ? "16/9" : "4/3" }}
            onClick={() => {
              setIdx(i);
              setOpen(true);
            }}
          >
            <Image src={src} alt={`Photo ${i + 1}`} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
          </div>
        ))}
      </div>
      {open && <Lightbox photos={photos} idx={idx} step={step} close={() => setOpen(false)} />}
    </>
  );
}

function Lightbox({
  photos,
  idx,
  step,
  close,
}: {
  photos: string[];
  idx: number;
  step: (dir: number) => void;
  close: () => void;
}) {
  const btn: React.CSSProperties = {
    cursor: "pointer",
    width: 52,
    height: 52,
    borderRadius: "50%",
    background: "rgba(241,238,232,.06)",
    color: "#f1eee8",
    border: "1px solid rgba(241,238,232,.25)",
    fontSize: 20,
  };

  return (
    <div
      onClick={close}
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ background: "rgba(13,14,17,.97)" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photos[idx]}
        alt="Full resolution photo"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "94vw",
          maxHeight: "88vh",
          objectFit: "contain",
          borderRadius: 6,
          boxShadow: "0 30px 80px rgba(0,0,0,.6)",
        }}
      />
      <button
        onClick={(e) => {
          e.stopPropagation();
          step(-1);
        }}
        className="absolute top-1/2 -translate-y-1/2 hover:!border-[#c9a15a] hover:!text-[#c9a15a]"
        style={{ ...btn, left: "clamp(8px,3vw,36px)" }}
      >
        ←
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          step(1);
        }}
        className="absolute top-1/2 -translate-y-1/2 hover:!border-[#c9a15a] hover:!text-[#c9a15a]"
        style={{ ...btn, right: "clamp(8px,3vw,36px)" }}
      >
        →
      </button>
      <button
        onClick={close}
        className="absolute top-6 hover:!border-[#c9a15a] hover:!text-[#c9a15a]"
        style={{ ...btn, width: 44, height: 44, fontSize: 16, background: "none", right: "clamp(8px,3vw,36px)" }}
      >
        ✕
      </button>
      <span
        className="absolute bottom-[22px] left-1/2 -translate-x-1/2"
        style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".24em", color: "rgba(241,238,232,.6)" }}
      >
        {idx + 1} / {photos.length}
      </span>
    </div>
  );
}

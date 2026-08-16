"use client";

import { useRef, useState } from "react";
import { resetLandingPhoto, saveLandingPhoto } from "@/app/admin/actions";
import { createClient } from "@/lib/supabase/client";
import {
  isCustomLandingPhoto,
  LANDING_PHOTO_SLOTS,
  SITE_PHOTO_LIBRARY,
  landingUploadPath,
  type LandingPhotoMap,
  type LandingPhotoSlotId,
} from "@/lib/landing-photos";

const labelStyle: React.CSSProperties = {
  fontSize: 10.5,
  fontWeight: 600,
  letterSpacing: ".18em",
  color: "rgba(var(--ink-rgb),.55)",
};

const ghostBtn: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: ".12em",
  padding: "9px 16px",
  color: "var(--ink)",
  borderColor: "rgba(var(--ink-rgb),.25)",
};

export default function LandingPhotosManager({
  initialPhotos,
}: {
  initialPhotos: LandingPhotoMap;
}) {
  const [photos, setPhotos] = useState<LandingPhotoMap>(initialPhotos);
  const [busySlot, setBusySlot] = useState<LandingPhotoSlotId | null>(null);
  const [libraryFor, setLibraryFor] = useState<LandingPhotoSlotId | null>(null);
  const [dropSlot, setDropSlot] = useState<LandingPhotoSlotId | null>(null);
  const [error, setError] = useState("");
  const fileInputs = useRef<Partial<Record<LandingPhotoSlotId, HTMLInputElement | null>>>({});
  const supabase = createClient();

  async function persist(slot: LandingPhotoSlotId, url: string) {
    setBusySlot(slot);
    setError("");
    const result = await saveLandingPhoto(slot, url);
    setBusySlot(null);
    if (!result.ok) {
      setError(result.error);
      return false;
    }
    setPhotos((current) => ({ ...current, [slot]: url }));
    setLibraryFor(null);
    return true;
  }

  async function uploadForSlot(slot: LandingPhotoSlotId, files: FileList | File[] | null) {
    if (!files?.length) return;
    const file = Array.from(files).find((item) => item.type.startsWith("image/"));
    if (!file) {
      setError("Choose an image file (JPEG, PNG, WebP, etc.).");
      return;
    }
    setBusySlot(slot);
    setError("");
    const path = landingUploadPath(slot, file.name);
    const { error: uploadError } = await supabase.storage.from("listing-photos").upload(path, file, {
      cacheControl: "31536000",
      contentType: file.type || undefined,
    });
    if (uploadError) {
      setBusySlot(null);
      setError(`Photo upload failed: ${uploadError.message}`);
      return;
    }
    const { data } = supabase.storage.from("listing-photos").getPublicUrl(path);
    const saved = await persist(slot, data.publicUrl);
    if (!saved) setBusySlot(null);
  }

  async function resetSlot(slot: LandingPhotoSlotId) {
    setBusySlot(slot);
    setError("");
    const result = await resetLandingPhoto(slot);
    setBusySlot(null);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    const fallback = LANDING_PHOTO_SLOTS.find((item) => item.id === slot)?.defaultSrc;
    if (fallback) setPhotos((current) => ({ ...current, [slot]: fallback }));
  }

  return (
    <section className="mt-14">
      <h2 className="font-serif-display m-0" style={{ fontSize: "clamp(28px,3.2vw,40px)", lineHeight: 1, fontWeight: 500 }}>
        Landing page photos
      </h2>
      <p style={{ margin: "10px 0 22px", fontSize: 13.5, color: "rgba(var(--ink-rgb),.55)", maxWidth: 620 }}>
        Swap the photos used in each section of the home page. Upload a new shot, pick one
        already on the site, or restore the original.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {LANDING_PHOTO_SLOTS.map((slot) => {
          const src = photos[slot.id];
          const custom = isCustomLandingPhoto(slot.id, src);
          const busy = busySlot === slot.id;
          const dropping = dropSlot === slot.id;
          return (
            <article
              key={slot.id}
              className="flex flex-col overflow-hidden rounded-[14px] border"
              style={{ borderColor: "rgba(var(--ink-rgb),.12)", background: "var(--bg2)" }}
            >
              <div
                className="relative"
                onDragOver={(e) => {
                  if (Array.from(e.dataTransfer.types).includes("Files")) {
                    e.preventDefault();
                    setDropSlot(slot.id);
                  }
                }}
                onDragLeave={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                    setDropSlot((current) => (current === slot.id ? null : current));
                  }
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setDropSlot(null);
                  uploadForSlot(slot.id, e.dataTransfer.files);
                }}
                style={{
                  aspectRatio: "16 / 10",
                  background: "var(--surface)",
                  outline: dropping ? "2px dashed var(--navy)" : "none",
                  outlineOffset: -2,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={slot.alt}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
                {custom && (
                  <span
                    className="absolute left-3 top-3 font-semibold"
                    style={{ fontSize: 9, letterSpacing: ".14em", padding: "4px 8px", background: "var(--gold)", color: "var(--gold-ink)" }}
                  >
                    CUSTOM
                  </span>
                )}
                {busy && (
                  <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ background: "rgba(255,255,255,.55)", fontSize: 12, fontWeight: 600, letterSpacing: ".12em" }}
                  >
                    SAVING…
                  </div>
                )}
                {dropping && !busy && (
                  <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ background: "rgba(29,46,73,.18)", color: "var(--navy)", fontSize: 12, fontWeight: 600, letterSpacing: ".12em" }}
                  >
                    DROP TO REPLACE
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-3" style={{ padding: "16px 18px 18px" }}>
                <div>
                  <span style={labelStyle}>{slot.label.toUpperCase()}</span>
                  <p style={{ margin: "6px 0 0", fontSize: 13, lineHeight: 1.55, color: "rgba(var(--ink-rgb),.62)" }}>
                    {slot.description}
                  </p>
                </div>
                <div className="mt-auto flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => fileInputs.current[slot.id]?.click()}
                    className="cursor-pointer border bg-transparent transition-colors hover:!border-[var(--gold)] hover:!text-[var(--gold)] disabled:opacity-60"
                    style={ghostBtn}
                  >
                    UPLOAD
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => setLibraryFor((current) => (current === slot.id ? null : slot.id))}
                    className="cursor-pointer border bg-transparent transition-colors hover:!border-[var(--gold)] hover:!text-[var(--gold)] disabled:opacity-60"
                    style={ghostBtn}
                  >
                    {libraryFor === slot.id ? "CLOSE LIBRARY" : "SITE PHOTOS"}
                  </button>
                  {custom && (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => resetSlot(slot.id)}
                      className="cursor-pointer border bg-transparent transition-colors hover:!border-[#c96a5a] hover:!text-[#c96a5a] disabled:opacity-60"
                      style={{ ...ghostBtn, color: "rgba(var(--ink-rgb),.7)" }}
                    >
                      RESET
                    </button>
                  )}
                  <input
                    ref={(el) => {
                      fileInputs.current[slot.id] = el;
                    }}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      uploadForSlot(slot.id, e.target.files);
                      e.target.value = "";
                    }}
                  />
                </div>
                {libraryFor === slot.id && (
                  <div
                    className="grid gap-2 rounded-[10px] p-2"
                    style={{
                      gridTemplateColumns: "repeat(auto-fill, minmax(84px, 1fr))",
                      background: "var(--bg)",
                      border: "1px solid rgba(var(--ink-rgb),.08)",
                    }}
                  >
                    {SITE_PHOTO_LIBRARY.map((photo) => {
                      const selected = src === photo.src;
                      return (
                        <button
                          key={photo.src}
                          type="button"
                          disabled={busy}
                          title={photo.label}
                          onClick={() => persist(slot.id, photo.src)}
                          className="overflow-hidden rounded-md border-none p-0"
                          style={{
                            outline: selected ? "2px solid var(--navy)" : "1px solid rgba(var(--ink-rgb),.12)",
                            outlineOffset: selected ? 1 : 0,
                            opacity: busy ? 0.6 : 1,
                            cursor: busy ? "default" : "pointer",
                          }}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={photo.src}
                            alt={photo.label}
                            style={{ width: "100%", height: 64, objectFit: "cover", display: "block" }}
                          />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
      {error && (
        <p role="alert" style={{ fontSize: 13, color: "#c96a5a", marginTop: 16 }}>
          {error}
        </p>
      )}
    </section>
  );
}

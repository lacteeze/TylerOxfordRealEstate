"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { parseDriveFolder } from "@/lib/drive-folder";
import { createClient } from "@/lib/supabase/client";
import { Listing, ListingStatus, chip, priceLabel } from "@/lib/types";

interface FormState {
  title: string;
  neighbourhood: string;
  price: string;
  status: ListingStatus;
  beds: string;
  baths: string;
  sqft: string;
  blurb: string;
  description: string;
  video_url: string;
  featured: boolean;
  lat: string;
  lng: string;
  photos: string[];
  drive_folder_url: string;
}

type DriveStatus = {
  configured: boolean;
  connected: boolean;
  email: string | null;
};

function blankForm(): FormState {
  return {
    title: "",
    neighbourhood: "",
    price: "",
    status: "sale",
    beds: "",
    baths: "",
    sqft: "",
    blurb: "",
    description: "",
    video_url: "",
    featured: false,
    lat: "47.5615",
    lng: "-52.7126",
    photos: [],
    drive_folder_url: "",
  };
}

const labelStyle: React.CSSProperties = {
  fontSize: 10.5,
  fontWeight: 600,
  letterSpacing: ".18em",
  color: "rgba(var(--ink-rgb),.55)",
};

const fieldStyle: React.CSSProperties = {
  background: "var(--field)",
  border: "1px solid rgba(var(--ink-rgb),.15)",
  color: "var(--ink)",
  borderRadius: 8,
  padding: "12px 14px",
  fontSize: 14,
  width: "100%",
  boxSizing: "border-box",
};

const ghostBtn: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: ".12em",
  padding: "9px 16px",
  color: "rgba(var(--ink-rgb),.6)",
  borderColor: "rgba(var(--ink-rgb),.2)",
};

export default function AdminManager({ initialListings }: { initialListings: Listing[] }) {
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>(initialListings);
  const [editing, setEditing] = useState<string | null>(null); // null | 'new' | id
  const [form, setForm] = useState<FormState>(blankForm());
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dropActive, setDropActive] = useState(false);
  const [driveStatus, setDriveStatus] = useState<DriveStatus | null>(null);
  const [driveImport, setDriveImport] = useState("");

  const supabase = createClient();

  useEffect(() => {
    fetch("/api/admin/google/status")
      .then((r) => r.json())
      .then((json: DriveStatus & { error?: string }) => {
        if (json && typeof json.connected === "boolean") {
          setDriveStatus({
            configured: Boolean(json.configured),
            connected: json.connected,
            email: json.email ?? null,
          });
        }
      })
      .catch(() => undefined);
  }, []);

  function startEdit(l: Listing) {
    setForm({
      title: l.title,
      neighbourhood: l.neighbourhood,
      price: String(l.price ?? ""),
      status: l.status,
      beds: String(l.beds ?? ""),
      baths: String(l.baths ?? ""),
      sqft: String(l.sqft ?? ""),
      blurb: l.blurb,
      description: l.description,
      video_url: l.video_url,
      featured: l.featured,
      lat: String(l.lat ?? "47.5615"),
      lng: String(l.lng ?? "-52.7126"),
      photos: l.photos || [],
      drive_folder_url: l.drive_folder_url || (l.drive_folder_id ? `https://drive.google.com/drive/folders/${l.drive_folder_id}` : ""),
    });
    setEditing(l.id);
    setError("");
    setDriveImport("");
  }

  async function uploadPhotos(files: FileList | File[] | null) {
    if (!files?.length) return;
    const images = Array.from(files).filter((file) => file.type.startsWith("image/"));
    if (!images.length) {
      setError("Drop image files (JPEG, PNG, WebP, etc.).");
      return;
    }
    setUploading(true);
    setError("");
    const added: string[] = [];
    for (const file of images) {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("listing-photos").upload(path, file, {
        cacheControl: "31536000",
        contentType: file.type || undefined,
      });
      if (error) {
        setError(`Photo upload failed: ${error.message}`);
        continue;
      }
      const { data } = supabase.storage.from("listing-photos").getPublicUrl(path);
      added.push(data.publicUrl);
    }
    setForm((f) => ({ ...f, photos: [...f.photos, ...added] }));
    setUploading(false);
  }

  function reorderPhotos(from: number, to: number) {
    if (from === to) return;
    setForm((f) => {
      const photos = [...f.photos];
      const [moved] = photos.splice(from, 1);
      photos.splice(to, 0, moved);
      return { ...f, photos };
    });
  }

  function driveFolderFields(value: string) {
    const parsed = parseDriveFolder(value);
    return {
      drive_folder_id: parsed?.id || "",
      drive_folder_url: value.trim() ? parsed?.url || value.trim() : "",
    };
  }

  async function importFromDrive() {
    const parsed = parseDriveFolder(form.drive_folder_url);
    if (!parsed) {
      setError("Paste a Google Drive folder URL or folder ID first.");
      return;
    }
    if (!driveStatus?.connected) {
      setError("Connect Google Drive in Settings first.");
      return;
    }
    setUploading(true);
    setError("");
    setDriveImport("Listing Drive folder…");
    try {
      const listRes = await fetch("/api/admin/google/list-files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folderId: parsed.id }),
      });
      const listJson = (await listRes.json()) as {
        files?: { id: string; name: string; mimeType: string }[];
        error?: string;
      };
      if (!listRes.ok) {
        setError(listJson.error || "Could not list Drive files.");
        setDriveImport("");
        setUploading(false);
        return;
      }
      const files = listJson.files || [];
      if (!files.length) {
        setDriveImport("");
        setError("No images found in that Drive folder.");
        setUploading(false);
        return;
      }
      const added: string[] = [];
      const failures: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setDriveImport(`Importing ${i + 1} of ${files.length} — ${file.name}`);
        const res = await fetch("/api/admin/google/import-file", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileId: file.id, name: file.name, mimeType: file.mimeType }),
        });
        const json = (await res.json()) as { url?: string; error?: string };
        if (!res.ok || !json.url) {
          failures.push(`${file.name}: ${json.error || "failed"}`);
          continue;
        }
        added.push(json.url);
      }
      setForm((f) => ({
        ...f,
        photos: [...f.photos, ...added],
        drive_folder_url: parsed.url,
      }));
      setDriveImport(
        failures.length
          ? `Imported ${added.length} of ${files.length}. ${failures.slice(0, 3).join(" ")}`
          : `Imported ${added.length} photo${added.length === 1 ? "" : "s"} from Drive.`
      );
      if (failures.length && !added.length) {
        setError(failures[0]);
      }
    } catch {
      setError("Drive import failed. Try again.");
      setDriveImport("");
    }
    setUploading(false);
  }

  async function save() {
    if (!form.title.trim()) {
      setError("Give the listing an address or title.");
      return;
    }
    if (!Number(form.price)) {
      setError("Enter a price.");
      return;
    }
    setBusy(true);
    setError("");

    const isNew = editing === "new";
    const id = isNew
      ? form.title.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") +
        "-" +
        Date.now().toString(36)
      : editing!;

    const drive = driveFolderFields(form.drive_folder_url);
    const record = {
      id,
      title: form.title.trim(),
      neighbourhood: form.neighbourhood.trim(),
      price: Number(form.price),
      status: form.status,
      beds: Number(form.beds) || 0,
      baths: Number(form.baths) || 0,
      sqft: Number(form.sqft) || 0,
      blurb: form.blurb.trim(),
      description: form.description.trim(),
      video_url: form.video_url.trim(),
      featured: form.featured,
      lat: Number(form.lat) || 47.5615,
      lng: Number(form.lng) || -52.7126,
      photos: form.photos,
      drive_folder_id: drive.drive_folder_id,
      drive_folder_url: drive.drive_folder_url,
    };

    const { error } = await supabase.from("listings").upsert(record);
    setBusy(false);
    if (error) {
      setError(`Save failed: ${error.message}`);
      return;
    }
    setListings((ls) =>
      isNew ? [{ ...record } as Listing, ...ls] : ls.map((l) => (l.id === id ? ({ ...l, ...record } as Listing) : l))
    );
    setEditing(null);
    setForm(blankForm());
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Remove this listing from the site?")) return;
    const { error } = await supabase.from("listings").delete().eq("id", id);
    if (error) {
      setError(`Delete failed: ${error.message}`);
      return;
    }
    setListings((ls) => ls.filter((l) => l.id !== id));
    router.refresh();
  }

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  function onPhotoStripDragOver(e: React.DragEvent) {
    e.preventDefault();
    if (Array.from(e.dataTransfer.types).includes("Files")) {
      setDropActive(true);
    }
  }

  function onPhotoStripDragLeave(e: React.DragEvent) {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDropActive(false);
    }
  }

  function onPhotoStripDrop(e: React.DragEvent) {
    e.preventDefault();
    setDropActive(false);
    const fromIndex = e.dataTransfer.getData("text/photo-index");
    if (fromIndex !== "") return;
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"));
    if (files.length) uploadPhotos(files);
  }

  return (
    <div
      className="max-w-[1100px]"
      style={{ padding: "clamp(44px,6vw,72px) clamp(20px,4vw,48px) clamp(64px,8vw,110px)", minHeight: "80vh" }}
    >
      <div className="flex items-center justify-between gap-4">
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".3em", color: "var(--gold)", marginBottom: 14 }}>
          PRIVATE — TYLER ONLY
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/settings"
            className="cursor-pointer border no-underline transition-colors hover:!border-[var(--gold)] hover:!text-[var(--gold)]"
            style={{ ...ghostBtn, color: "var(--ink)", borderColor: "rgba(var(--ink-rgb),.25)" }}
          >
            SETTINGS
          </Link>
          <button
            onClick={signOut}
            className="cursor-pointer border bg-transparent transition-colors hover:!border-[var(--gold)] hover:!text-[var(--gold)]"
            style={ghostBtn}
          >
            SIGN OUT
          </button>
        </div>
      </div>
      <h1 className="font-serif-display" style={{ margin: "0 0 8px", fontSize: "clamp(38px,4.5vw,60px)", lineHeight: 1, fontWeight: 500 }}>
        Manage listings
      </h1>
      <p style={{ margin: "0 0 40px", fontSize: 13.5, color: "rgba(var(--ink-rgb),.55)", maxWidth: 560 }}>
        Add, edit or remove properties. Photos upload to secure cloud storage and appear on
        the site instantly.
      </p>

      {editing === null && (
        <>
          <button
            onClick={() => {
              setEditing("new");
              setForm(blankForm());
              setError("");
              setDriveImport("");
            }}
            className="mb-6 cursor-pointer border-none transition-colors hover:!bg-[var(--gold-hov)]"
            style={{ fontSize: 12, fontWeight: 600, letterSpacing: ".08em", padding: "14px 24px", background: "var(--gold)", color: "var(--gold-ink)" }}
          >
            ＋ NEW LISTING
          </button>
          <div
            className="flex flex-col overflow-hidden rounded-xl border"
            style={{ gap: 1, background: "rgba(var(--ink-rgb),.09)", borderColor: "rgba(var(--ink-rgb),.09)" }}
          >
            {listings.map((l) => {
              const c = chip(l.status);
              return (
                <div
                  key={l.id}
                  className="flex flex-wrap items-center"
                  style={{ gap: "12px 20px", background: "var(--bg)", padding: "14px 18px" }}
                >
                  {l.photos?.[0] ? (
                    <Image
                      src={l.photos[0]}
                      alt=""
                      width={86}
                      height={60}
                      className="flex-none rounded-md object-cover"
                      style={{ background: "var(--surface)" }}
                    />
                  ) : (
                    <span className="block flex-none rounded-md" style={{ width: 86, height: 60, background: "var(--surface)" }} />
                  )}
                  <div className="flex min-w-0 flex-1 flex-col gap-[3px]">
                    <span className="font-serif-display" style={{ fontSize: 19 }}>
                      {l.title}
                    </span>
                    <span style={{ fontSize: 11.5, color: "rgba(var(--ink-rgb),.5)", letterSpacing: ".04em" }}>
                      {c.label} · {priceLabel(l)} · {(l.photos || []).length} photos
                    </span>
                  </div>
                  <button
                    onClick={() => startEdit(l)}
                    className="cursor-pointer border bg-transparent transition-colors hover:!border-[var(--gold)] hover:!text-[var(--gold)]"
                    style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".12em", padding: "9px 16px", color: "var(--ink)", borderColor: "rgba(var(--ink-rgb),.25)" }}
                  >
                    EDIT
                  </button>
                  <button
                    onClick={() => remove(l.id)}
                    className="cursor-pointer border bg-transparent transition-colors hover:!border-[#c96a5a] hover:!text-[#c96a5a]"
                    style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".12em", padding: "9px 16px", color: "rgba(var(--ink-rgb),.4)", borderColor: "rgba(var(--ink-rgb),.12)" }}
                  >
                    REMOVE
                  </button>
                </div>
              );
            })}
          </div>
          {error && <p style={{ fontSize: 13, color: "#c96a5a", marginTop: 16 }}>{error}</p>}
        </>
      )}

      {editing !== null && (
        <div
          className="flex flex-col gap-6 rounded-[14px] border"
          style={{ borderColor: "rgba(var(--ink-rgb),.12)", background: "var(--bg2)", padding: "clamp(24px,3vw,40px)" }}
        >
          <span className="font-serif-display" style={{ fontSize: 26 }}>
            {editing === "new" ? "New listing" : `Edit — ${form.title || "listing"}`}
          </span>

          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,260px),1fr))", gap: "18px 20px" }}>
            <label className="flex flex-col gap-1.5" style={{ gridColumn: "1/-1" }}>
              <span style={labelStyle}>ADDRESS / TITLE *</span>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. 14 Circular Road" style={fieldStyle} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span style={labelStyle}>NEIGHBOURHOOD</span>
              <input value={form.neighbourhood} onChange={(e) => setForm({ ...form, neighbourhood: e.target.value })} placeholder="e.g. The Battery · St. John's" style={fieldStyle} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span style={labelStyle}>STATUS</span>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as ListingStatus })} style={fieldStyle}>
                <option value="sale">For sale</option>
                <option value="lease">For lease</option>
                <option value="sold">Sold</option>
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span style={labelStyle}>{form.status === "lease" ? "MONTHLY RENT (CAD) *" : "PRICE (CAD) *"}</span>
              <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="875000" style={fieldStyle} />
            </label>
            <div className="grid grid-cols-3 gap-5">
              <label className="flex flex-col gap-1.5">
                <span style={labelStyle}>BEDS</span>
                <input type="number" value={form.beds} onChange={(e) => setForm({ ...form, beds: e.target.value })} style={fieldStyle} />
              </label>
              <label className="flex flex-col gap-1.5">
                <span style={labelStyle}>BATHS</span>
                <input type="number" step="0.5" value={form.baths} onChange={(e) => setForm({ ...form, baths: e.target.value })} style={fieldStyle} />
              </label>
              <label className="flex flex-col gap-1.5">
                <span style={labelStyle}>SQ FT</span>
                <input type="number" value={form.sqft} onChange={(e) => setForm({ ...form, sqft: e.target.value })} style={fieldStyle} />
              </label>
            </div>
            <label className="flex cursor-pointer items-center gap-2.5 self-end pb-3">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                style={{ accentColor: "var(--gold)", width: 16, height: 16 }}
              />
              <span style={{ fontSize: 12.5, color: "rgba(var(--ink-rgb),.75)" }}>Feature on the home page</span>
            </label>
            <label className="flex flex-col gap-1.5" style={{ gridColumn: "1/-1" }}>
              <span style={labelStyle}>ONE-LINE TEASER (SHOWN ON CARDS)</span>
              <input value={form.blurb} onChange={(e) => setForm({ ...form, blurb: e.target.value })} placeholder="One confident sentence about the home" style={fieldStyle} />
            </label>
            <label className="flex flex-col gap-1.5" style={{ gridColumn: "1/-1" }}>
              <span style={labelStyle}>FULL DESCRIPTION</span>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={4}
                style={{ ...fieldStyle, lineHeight: 1.6, resize: "vertical" }}
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span style={labelStyle}>VIDEO / DRONE TOUR LINK</span>
              <input value={form.video_url} onChange={(e) => setForm({ ...form, video_url: e.target.value })} placeholder="https://youtube.com/…" style={fieldStyle} />
            </label>
            <div className="grid grid-cols-2 gap-5">
              <label className="flex flex-col gap-1.5">
                <span style={labelStyle}>MAP LAT</span>
                <input type="number" step="0.0001" value={form.lat} onChange={(e) => setForm({ ...form, lat: e.target.value })} style={fieldStyle} />
              </label>
              <label className="flex flex-col gap-1.5">
                <span style={labelStyle}>MAP LNG</span>
                <input type="number" step="0.0001" value={form.lng} onChange={(e) => setForm({ ...form, lng: e.target.value })} style={fieldStyle} />
              </label>
            </div>
            <div className="flex flex-col gap-1.5" style={{ gridColumn: "1/-1" }}>
              <span style={labelStyle}>GOOGLE DRIVE FOLDER</span>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <input
                  value={form.drive_folder_url}
                  onChange={(e) => setForm({ ...form, drive_folder_url: e.target.value })}
                  placeholder="Paste a Drive folder URL or folder ID"
                  style={fieldStyle}
                />
                {driveStatus?.connected ? (
                  <button
                    type="button"
                    onClick={importFromDrive}
                    disabled={uploading}
                    className="cursor-pointer whitespace-nowrap border bg-transparent transition-colors hover:!border-[var(--gold)] hover:!text-[var(--gold)] disabled:opacity-60"
                    style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".12em", padding: "12px 16px", color: "var(--ink)", borderColor: "rgba(var(--ink-rgb),.25)" }}
                  >
                    IMPORT FROM DRIVE
                  </button>
                ) : (
                  <Link
                    href="/admin/settings"
                    className="whitespace-nowrap no-underline"
                    style={{ fontSize: 12, color: "var(--navy)", fontWeight: 600 }}
                  >
                    Connect Google Drive in Settings
                  </Link>
                )}
              </div>
              {driveImport && (
                <span style={{ fontSize: 12.5, color: "rgba(var(--ink-rgb),.6)" }}>{driveImport}</span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <span style={labelStyle}>PHOTOS — FIRST PHOTO IS THE COVER</span>
            <div
              className="flex flex-wrap gap-3 rounded-[10px] p-2"
              onDragOver={onPhotoStripDragOver}
              onDragLeave={onPhotoStripDragLeave}
              onDrop={onPhotoStripDrop}
              style={{
                border: dropActive ? "2px dashed var(--navy)" : "2px dashed transparent",
                background: dropActive ? "rgba(29,46,73,.06)" : "transparent",
                minHeight: 120,
              }}
            >
              {form.photos.map((src, i) => (
                <div
                  key={src + i}
                  className="relative cursor-grab"
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("text/photo-index", String(i));
                    e.dataTransfer.effectAllowed = "move";
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const from = Number(e.dataTransfer.getData("text/photo-index"));
                    if (!Number.isNaN(from)) reorderPhotos(from, i);
                  }}
                  style={{ width: 150 }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt=""
                    style={{
                      width: 150,
                      height: 104,
                      objectFit: "cover",
                      display: "block",
                      border: "1px solid rgba(var(--ink-rgb),.15)",
                      borderRadius: 8,
                      boxSizing: "border-box",
                    }}
                  />
                  <button
                    onClick={() => setForm((f) => ({ ...f, photos: f.photos.filter((_, j) => j !== i) }))}
                    title="Remove photo"
                    className="absolute right-1.5 top-1.5 cursor-pointer"
                    style={{
                      width: 24,
                      height: 24,
                      background: "rgba(16,18,22,.85)",
                      color: "#f1eee8",
                      border: "1px solid rgba(241,238,232,.3)",
                      fontSize: 12,
                      lineHeight: 1,
                    }}
                  >
                    ✕
                  </button>
                  {i === 0 && (
                    <span
                      className="absolute bottom-1.5 left-1.5 font-semibold"
                      style={{ fontSize: 9, letterSpacing: ".14em", padding: "3px 7px", background: "var(--gold)", color: "var(--gold-ink)" }}
                    >
                      COVER
                    </span>
                  )}
                </div>
              ))}
              <label
                className="flex cursor-pointer flex-col items-center justify-center gap-1.5 transition-colors hover:!border-[var(--gold)] hover:!text-[var(--gold)]"
                style={{
                  width: dropActive ? 220 : 150,
                  height: 104,
                  border: dropActive ? "1px dashed var(--navy)" : "1px dashed rgba(var(--ink-rgb),.3)",
                  color: dropActive ? "var(--navy)" : "rgba(var(--ink-rgb),.6)",
                  background: dropActive ? "rgba(29,46,73,.04)" : "transparent",
                }}
              >
                <span style={{ fontSize: 22, lineHeight: 1 }}>{uploading ? "…" : "＋"}</span>
                <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".14em", textAlign: "center", padding: "0 8px" }}>
                  {uploading ? "UPLOADING" : dropActive ? "DROP PHOTOS HERE" : "ADD PHOTOS"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    uploadPhotos(e.target.files);
                    e.target.value = "";
                  }}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {error && <span style={{ fontSize: 13, color: "#c96a5a" }}>{error}</span>}
          <div className="flex gap-3">
            <button
              onClick={save}
              disabled={busy || uploading}
              className="cursor-pointer border-none transition-colors hover:!bg-[var(--gold-hov)] disabled:opacity-60"
              style={{ fontSize: 12, fontWeight: 600, letterSpacing: ".08em", padding: "14px 26px", background: "var(--gold)", color: "var(--gold-ink)" }}
            >
              {busy ? "SAVING…" : "SAVE LISTING"}
            </button>
            <button
              onClick={() => {
                setEditing(null);
                setForm(blankForm());
                setError("");
                setDriveImport("");
              }}
              className="cursor-pointer border bg-transparent transition-colors hover:!border-[var(--ink)] hover:!text-[var(--ink)]"
              style={{ fontSize: 12, fontWeight: 600, letterSpacing: ".08em", padding: "14px 26px", color: "rgba(var(--ink-rgb),.7)", borderColor: "rgba(var(--ink-rgb),.25)" }}
            >
              CANCEL
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import {
  decryptRefreshToken,
  downloadDriveFile,
  googleOAuthConfigured,
  refreshAccessToken,
} from "@/lib/google-drive";

export const maxDuration = 60;

function extensionFor(name: string, mimeType: string): string {
  const fromName = name.split(".").pop()?.toLowerCase();
  if (fromName && fromName.length <= 5 && /^[a-z0-9]+$/.test(fromName)) return fromName;
  if (mimeType === "image/jpeg") return "jpg";
  if (mimeType === "image/png") return "png";
  if (mimeType === "image/webp") return "webp";
  if (mimeType === "image/gif") return "gif";
  if (mimeType === "image/heic") return "heic";
  if (mimeType === "image/heif") return "heif";
  return "jpg";
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  if (!googleOAuthConfigured()) {
    return NextResponse.json(
      { error: "Add Google OAuth credentials to enable Drive." },
      { status: 400 }
    );
  }

  const body = (await request.json().catch(() => null)) as {
    fileId?: string;
    name?: string;
    mimeType?: string;
  } | null;
  const fileId = body?.fileId?.trim() || "";
  if (!/^[a-zA-Z0-9_-]+$/.test(fileId)) {
    return NextResponse.json({ error: "Invalid Drive file." }, { status: 400 });
  }

  const { data, error } = await auth.supabase
    .from("admin_settings")
    .select("google_refresh_token")
    .eq("id", "default")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data?.google_refresh_token) {
    return NextResponse.json(
      { error: "Connect Google Drive in Settings first." },
      { status: 400 }
    );
  }

  try {
    const accessToken = await refreshAccessToken(decryptRefreshToken(data.google_refresh_token));
    const file = await downloadDriveFile(accessToken, fileId);
    if (!file.contentType.startsWith("image/") && !(body?.mimeType || "").startsWith("image/")) {
      return NextResponse.json({ error: "Skipped a non-image file." }, { status: 400 });
    }

    const mime = file.contentType.startsWith("image/")
      ? file.contentType.split(";")[0]
      : body?.mimeType || "image/jpeg";
    const ext = extensionFor(body?.name || "", mime);
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const upload = await auth.supabase.storage.from("listing-photos").upload(path, Buffer.from(file.bytes), {
      cacheControl: "31536000",
      contentType: mime,
    });
    if (upload.error) {
      return NextResponse.json({ error: upload.error.message }, { status: 500 });
    }
    const { data: pub } = auth.supabase.storage.from("listing-photos").getPublicUrl(path);
    return NextResponse.json({ url: pub.publicUrl });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not import that photo.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

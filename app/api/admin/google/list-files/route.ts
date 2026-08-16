import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { isDriveFolderId } from "@/lib/drive-folder";
import {
  decryptRefreshToken,
  googleOAuthConfigured,
  listDriveImageFiles,
  refreshAccessToken,
} from "@/lib/google-drive";

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  if (!googleOAuthConfigured()) {
    return NextResponse.json(
      { error: "Add Google OAuth credentials to enable Drive." },
      { status: 400 }
    );
  }

  const body = (await request.json().catch(() => null)) as { folderId?: string } | null;
  const folderId = body?.folderId?.trim() || "";
  if (!isDriveFolderId(folderId)) {
    return NextResponse.json({ error: "Paste a valid Google Drive folder URL or ID." }, { status: 400 });
  }

  const { data, error } = await auth.supabase
    .from("admin_settings")
    .select("google_refresh_token, google_email")
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
    const files = await listDriveImageFiles(accessToken, folderId);
    return NextResponse.json({
      files,
      skippedNonImages: true,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not list Drive files.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

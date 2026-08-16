import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { decryptRefreshToken, googleOAuthConfigured, revokeGoogleToken } from "@/lib/google-drive";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  if (!googleOAuthConfigured()) {
    return NextResponse.json({
      configured: false,
      connected: false,
      email: null,
    });
  }

  const { data, error } = await auth.supabase
    .from("admin_settings")
    .select("google_email, google_connected_at")
    .eq("id", "default")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    configured: true,
    connected: Boolean(data?.google_email),
    email: data?.google_email ?? null,
    connectedAt: data?.google_connected_at ?? null,
  });
}

export async function DELETE() {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const { data } = await auth.supabase
    .from("admin_settings")
    .select("google_refresh_token")
    .eq("id", "default")
    .maybeSingle();

  if (data?.google_refresh_token && googleOAuthConfigured()) {
    try {
      await revokeGoogleToken(decryptRefreshToken(data.google_refresh_token));
    } catch {
      // Still clear local state if Google revoke fails.
    }
  }

  const { error } = await auth.supabase.from("admin_settings").upsert({
    id: "default",
    google_refresh_token: null,
    google_email: null,
    google_connected_at: null,
    updated_at: new Date().toISOString(),
  });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ configured: googleOAuthConfigured(), connected: false, email: null });
}

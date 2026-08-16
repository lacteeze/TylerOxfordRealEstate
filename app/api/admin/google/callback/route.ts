import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import {
  encryptRefreshToken,
  exchangeCodeForTokens,
  fetchGoogleEmail,
  googleOAuthConfigured,
  googleRedirectUri,
} from "@/lib/google-drive";

function settingsRedirect(origin: string, google: "connected" | "error", message?: string) {
  const url = new URL("/admin/settings", origin);
  url.searchParams.set("google", google);
  if (message) url.searchParams.set("message", message);
  return url;
}

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const fail = (message: string) => NextResponse.redirect(settingsRedirect(origin, "error", message));

  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.redirect(new URL("/admin/login", origin));
  }

  if (!googleOAuthConfigured()) {
    return fail("Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to enable Drive.");
  }

  const errorParam = request.nextUrl.searchParams.get("error");
  if (errorParam) {
    return fail(request.nextUrl.searchParams.get("error_description") || "Google authorization was cancelled.");
  }

  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const cookieState = request.cookies.get("google_oauth_state")?.value;
  if (!code || !state || !cookieState || state !== cookieState) {
    return fail("Google authorization state did not match. Try connecting again.");
  }

  try {
    const redirectUri = googleRedirectUri(origin);
    const tokens = await exchangeCodeForTokens(code, redirectUri);
    const email = await fetchGoogleEmail(tokens.accessToken);
    const encrypted = encryptRefreshToken(tokens.refreshToken);

    const { error } = await auth.supabase.from("admin_settings").upsert({
      id: "default",
      google_refresh_token: encrypted,
      google_email: email,
      google_connected_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    if (error) {
      return fail(`Could not save Drive connection: ${error.message}`);
    }

    const res = NextResponse.redirect(settingsRedirect(origin, "connected"));
    res.cookies.set("google_oauth_state", "", { path: "/", maxAge: 0 });
    return res;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not connect Google Drive.";
    return fail(message);
  }
}

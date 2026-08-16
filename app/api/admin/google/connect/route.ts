import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { googleAuthUrl, googleOAuthConfigured, googleRedirectUri } from "@/lib/google-drive";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    const login = new URL("/admin/login", request.nextUrl.origin);
    return NextResponse.redirect(login);
  }

  const settings = new URL("/admin/settings", request.nextUrl.origin);
  if (!googleOAuthConfigured()) {
    settings.searchParams.set("google", "error");
    settings.searchParams.set(
      "message",
      "Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to enable Drive."
    );
    return NextResponse.redirect(settings);
  }

  const state = crypto.randomUUID();
  const redirectUri = googleRedirectUri(request.nextUrl.origin);
  const url = googleAuthUrl({ redirectUri, state });

  const res = NextResponse.redirect(url);
  res.cookies.set("google_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 600,
    secure: request.nextUrl.protocol === "https:",
  });
  return res;
}

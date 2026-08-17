"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { publicAppOrigin } from "@/lib/app-origin";
import { REMEMBER_COOKIE, REMEMBER_MAX_AGE } from "@/lib/admin-session";
import {
  adminMagicLinkEmailHtml,
  adminRecoveryEmailHtml,
  sendTransactionalEmail,
} from "@/lib/pingram";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type SignInState = { error: string } | undefined;
export type AuthLinkState = { error: string } | { ok: true; message: string } | undefined;

const CHECK_EMAIL_MESSAGE =
  "Check your email for a link. If an account exists for that address, it should arrive shortly.";

function mapAuthError(message: string, code?: string): string {
  const text = message.toLowerCase();
  if (code === "email_not_confirmed" || text.includes("email not confirmed")) {
    return "This account exists, but the email is not confirmed. In Supabase: Authentication → Users → select the user → Confirm email.";
  }
  if (
    code === "invalid_credentials" ||
    text.includes("invalid login") ||
    text.includes("invalid email or password")
  ) {
    return "Invalid email or password.";
  }
  return message || "Could not sign in. Please try again.";
}

async function persistRememberPreference(remember: boolean) {
  const cookieStore = await cookies();
  cookieStore.set(REMEMBER_COOKIE, remember ? "1" : "0", {
    path: "/",
    sameSite: "lax",
    ...(remember ? { maxAge: REMEMBER_MAX_AGE } : {}),
  });
}

export async function signIn(
  _prev: SignInState,
  formData: FormData
): Promise<SignInState> {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const remember = formData.get("remember") === "1";

  if (!email || !password) {
    return { error: "Enter your email and password." };
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return {
      error:
        "Sign-in is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY, then redeploy.",
    };
  }

  await persistRememberPreference(remember);
  const supabase = await createClient({ remember });
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: mapAuthError(error.message, error.code) };
  }

  revalidatePath("/", "layout");
  redirect("/admin");
}

function isMissingUserError(message: string, code?: string): boolean {
  const text = message.toLowerCase();
  return (
    code === "otp_disabled" ||
    code === "user_not_found" ||
    text.includes("signups not allowed") ||
    text.includes("user not found")
  );
}

async function sendLinkViaPingram(opts: {
  email: string;
  intent: "magic" | "recovery";
  origin: string;
  nextPath: string;
}): Promise<"sent" | "absent" | "unavailable"> {
  const admin = createAdminClient();
  if (!admin) return "unavailable";

  const { data, error } = await admin.auth.admin.generateLink({
    type: opts.intent === "recovery" ? "recovery" : "magiclink",
    email: opts.email,
  });
  if (error) {
    if (isMissingUserError(error.message, error.code)) return "absent";
    throw error;
  }
  const hashed = data?.properties?.hashed_token;
  if (!hashed) return "unavailable";

  const type = data.properties.verification_type || (opts.intent === "recovery" ? "recovery" : "magiclink");
  const url = new URL("/admin/auth/callback", opts.origin);
  url.searchParams.set("token_hash", hashed);
  url.searchParams.set("type", type);
  url.searchParams.set("next", opts.nextPath);

  await sendTransactionalEmail({
    type: opts.intent === "recovery" ? "admin_password_reset" : "admin_magic_link",
    to: opts.email,
    subject:
      opts.intent === "recovery"
        ? "Reset your Tyler Oxford admin password"
        : "Sign in to Tyler Oxford admin",
    html:
      opts.intent === "recovery"
        ? adminRecoveryEmailHtml(url.toString())
        : adminMagicLinkEmailHtml(url.toString()),
  });
  return "sent";
}

async function sendLinkViaSupabase(opts: {
  email: string;
  intent: "magic" | "recovery";
  redirectTo: string;
}): Promise<void> {
  const supabase = await createClient();
  if (opts.intent === "recovery") {
    const { error } = await supabase.auth.resetPasswordForEmail(opts.email, {
      redirectTo: opts.redirectTo,
    });
    if (error && !isMissingUserError(error.message, error.code)) {
      throw error;
    }
    return;
  }

  const { error } = await supabase.auth.signInWithOtp({
    email: opts.email,
    options: {
      shouldCreateUser: false,
      emailRedirectTo: opts.redirectTo,
    },
  });
  if (error && !isMissingUserError(error.message, error.code)) {
    throw error;
  }
}

export async function requestAdminLink(
  _prev: AuthLinkState,
  formData: FormData
): Promise<AuthLinkState> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const intent = formData.get("intent") === "recovery" ? "recovery" : "magic";

  if (!email) {
    return { error: "Enter your email." };
  }

  const origin = await publicAppOrigin();
  const nextPath = intent === "recovery" ? "/admin/update-password" : "/admin";
  const redirectTo = `${origin}/admin/auth/callback?next=${encodeURIComponent(nextPath)}`;

  try {
    const viaPingram = await sendLinkViaPingram({ email, intent, origin, nextPath });
    if (viaPingram === "unavailable") {
      await sendLinkViaSupabase({ email, intent, redirectTo });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not send email.";
    if (message.toLowerCase().includes("rate") || message.toLowerCase().includes("too many")) {
      return { error: "Please wait a moment and try again." };
    }
    console.error("Admin auth email failed", message);
    try {
      await sendLinkViaSupabase({ email, intent, redirectTo });
    } catch (fallbackError) {
      console.error("Admin auth email fallback failed", fallbackError);
    }
  }

  return { ok: true, message: CHECK_EMAIL_MESSAGE };
}

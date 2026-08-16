"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type SignInState = { error: string } | undefined;

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

export async function signIn(
  _prev: SignInState,
  formData: FormData
): Promise<SignInState> {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return { error: "Enter your email and password." };
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return {
      error:
        "Sign-in is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY, then redeploy.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: mapAuthError(error.message, error.code) };
  }

  revalidatePath("/", "layout");
  redirect("/admin");
}

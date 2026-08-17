import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { isRememberPref, REMEMBER_COOKIE, withAuthCookieLifetime } from "@/lib/admin-session";

export async function createClient(opts?: { remember?: boolean }) {
  const cookieStore = await cookies();
  const remember = opts?.remember ?? isRememberPref(cookieStore.get(REMEMBER_COOKIE)?.value);

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(
                name,
                value,
                withAuthCookieLifetime(options as Record<string, unknown>, remember)
              )
            );
          } catch {
            // Called from a Server Component — safe to ignore when
            // middleware is refreshing sessions.
          }
        },
      },
    }
  );
}

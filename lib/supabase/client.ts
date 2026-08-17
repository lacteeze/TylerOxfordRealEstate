import { createBrowserClient } from "@supabase/ssr";
import {
  rememberPrefFromDocumentCookie,
  serializeBrowserCookie,
  withAuthCookieLifetime,
} from "@/lib/admin-session";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }
  return createBrowserClient(url, anonKey, {
    cookies: {
      getAll() {
        if (typeof document === "undefined") return [];
        return document.cookie.split("; ").filter(Boolean).map((row) => {
          const eq = row.indexOf("=");
          const name = eq === -1 ? row : row.slice(0, eq);
          const raw = eq === -1 ? "" : row.slice(eq + 1);
          let value = raw;
          try {
            value = decodeURIComponent(raw);
          } catch {
            value = raw;
          }
          return { name, value };
        });
      },
      setAll(cookiesToSet) {
        if (typeof document === "undefined") return;
        const remember = rememberPrefFromDocumentCookie(document.cookie);
        cookiesToSet.forEach(({ name, value, options }) => {
          const next = withAuthCookieLifetime(
            (options ?? {}) as Record<string, unknown>,
            remember
          );
          document.cookie = serializeBrowserCookie(name, value, next);
        });
      },
    },
  });
}

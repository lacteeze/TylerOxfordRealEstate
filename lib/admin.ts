import { createClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function requireAdmin(): Promise<
  | { ok: true; supabase: SupabaseClient; user: User }
  | { ok: false; response: Response }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      ok: false,
      response: Response.json({ error: "Sign in to continue." }, { status: 401 }),
    };
  }
  return { ok: true, supabase, user };
}

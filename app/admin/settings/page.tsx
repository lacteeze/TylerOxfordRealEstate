import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminSettings from "@/components/AdminSettings";
import { googleOAuthConfigured } from "@/lib/google-drive";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin settings — Tyler Oxford",
  robots: { index: false, follow: false },
};

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ google?: string; message?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/admin/login");
  }

  const params = await searchParams;
  const { data } = await supabase
    .from("admin_settings")
    .select("google_email, google_connected_at")
    .eq("id", "default")
    .maybeSingle();

  return (
    <AdminSettings
      configured={googleOAuthConfigured()}
      email={data?.google_email ?? null}
      connectedAt={data?.google_connected_at ?? null}
      banner={params.google === "connected" ? "connected" : params.google === "error" ? "error" : null}
      bannerMessage={params.message || null}
    />
  );
}

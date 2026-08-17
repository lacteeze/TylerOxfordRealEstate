import { redirect } from "next/navigation";
import AdminManager from "@/components/AdminManager";
import { mergeLandingPhotos } from "@/lib/landing-photos";
import { createClient } from "@/lib/supabase/server";
import { Listing } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Manage listings — Tyler Oxford",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/admin/login");
  }

  const [{ data }, { data: photoRows, error: photoError }] = await Promise.all([
    supabase.from("listings").select("*").order("created_at", { ascending: false }),
    supabase.from("landing_photos").select("slot, url"),
  ]);

  return (
    <AdminManager
      initialListings={(data || []) as Listing[]}
      initialLandingPhotos={mergeLandingPhotos(photoError ? null : photoRows)}
    />
  );
}

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Listing } from "@/lib/types";
import AdminManager from "@/components/AdminManager";

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

  const { data } = await supabase
    .from("listings")
    .select("*")
    .order("created_at", { ascending: false });

  return <AdminManager initialListings={(data || []) as Listing[]} />;
}

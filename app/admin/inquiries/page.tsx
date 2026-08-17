import { redirect } from "next/navigation";
import AdminInquiries from "@/components/AdminInquiries";
import { createClient } from "@/lib/supabase/server";
import type { Lead } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Inquiries — Tyler Oxford",
  robots: { index: false, follow: false },
};

export default async function AdminInquiriesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/admin/login");
  }

  const { data } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  return <AdminInquiries initialLeads={(data || []) as Lead[]} />;
}

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import UpdatePasswordForm from "./UpdatePasswordForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Set password — Tyler Oxford",
  robots: { index: false, follow: false },
};

export default async function UpdatePasswordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/admin/login?error=link");
  }

  return <UpdatePasswordForm />;
}

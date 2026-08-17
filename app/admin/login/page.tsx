import AdminLoginForm from "@/components/AdminLoginForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Sign in — Tyler Oxford",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  return <AdminLoginForm linkError={params.error === "link"} />;
}

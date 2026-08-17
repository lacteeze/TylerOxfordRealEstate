import { createClient } from "@/lib/supabase/server";
import { Listing, ListingStatus } from "@/lib/types";
import ListingsBrowser from "@/components/ListingsBrowser";

export const revalidate = 60;

export const metadata = {
  title: "Properties — Tyler Oxford · St. John's NL",
};

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; beds?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase
    .from("listings")
    .select("*")
    .eq("archived", false)
    .eq("published", true)
    .order("created_at", { ascending: false });
  const listings = (data || []) as Listing[];

  const initialFilter = (["sale", "lease", "sold", "showcase"] as ListingStatus[]).includes(
    params.status as ListingStatus
  )
    ? (params.status as ListingStatus)
    : "all";

  return (
    <div
      style={{
        padding: "clamp(40px,5vw,72px) clamp(20px,3.5vw,44px) clamp(64px,8vw,110px)",
        minHeight: "80vh",
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: ".28em",
          color: "rgba(var(--ink-rgb),.5)",
          marginBottom: 16,
        }}
      >
        ST. JOHN&apos;S &amp; EASTERN NEWFOUNDLAND
      </div>
      <h1
        className="font-display"
        style={{
          margin: "0 0 12px",
          fontSize: "clamp(40px,5vw,68px)",
          lineHeight: 1.02,
          letterSpacing: "-.02em",
          fontWeight: 600,
        }}
      >
        Properties
      </h1>
      <p style={{ margin: "0 0 28px", fontSize: 13.5, color: "rgba(var(--ink-rgb),.55)" }}>
        Every home below was photographed and filmed in-house by Move Media.
      </p>
      <ListingsBrowser
        listings={listings}
        initialQuery={params.q || ""}
        initialFilter={initialFilter}
        initialMinBeds={Number(params.beds) || 0}
      />
    </div>
  );
}

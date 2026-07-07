import { createClient } from "@/lib/supabase/server";
import { Listing } from "@/lib/types";
import ListingsBrowser from "@/components/ListingsBrowser";

export const revalidate = 60;

export const metadata = {
  title: "Properties — Tyler Oxford · St. John's NL",
};

export default async function ListingsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("listings")
    .select("*")
    .order("created_at", { ascending: false });
  const listings = (data || []) as Listing[];

  return (
    <div
      style={{
        padding: "clamp(44px,6vw,80px) clamp(20px,4vw,48px) clamp(64px,8vw,110px)",
        minHeight: "80vh",
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".3em", color: "var(--gold)", marginBottom: 14 }}>
        ST. JOHN&apos;S &amp; EASTERN NEWFOUNDLAND
      </div>
      <h1 className="font-serif-display" style={{ margin: "0 0 10px", fontSize: "clamp(44px,5.5vw,80px)", lineHeight: 1, fontWeight: 500 }}>
        Properties
      </h1>
      <p style={{ margin: "0 0 28px", fontSize: 14, color: "rgba(var(--ink-rgb),.55)" }}>
        Every home below was photographed and filmed in-house by Oxford Media.
      </p>
      <ListingsBrowser listings={listings} />
    </div>
  );
}

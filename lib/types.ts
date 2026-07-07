export type ListingStatus = "sale" | "lease" | "sold";

export interface Listing {
  id: string;
  title: string;
  neighbourhood: string;
  price: number;
  status: ListingStatus;
  beds: number;
  baths: number;
  sqft: number;
  featured: boolean;
  lat: number | null;
  lng: number | null;
  video_url: string;
  blurb: string;
  description: string;
  photos: string[];
  created_at?: string;
  updated_at?: string;
}

export function priceLabel(l: Pick<Listing, "price" | "status">): string {
  const money = "$" + Number(l.price || 0).toLocaleString("en-CA");
  if (l.status === "lease") return money + " / month";
  if (l.status === "sold") return "Sold — " + money;
  return money;
}

export function chip(status: ListingStatus): { label: string; color: string } {
  switch (status) {
    case "sale":
      return { label: "FOR SALE", color: "#c9a15a" };
    case "lease":
      return { label: "FOR LEASE", color: "#9db4c0" };
    case "sold":
      return { label: "SOLD", color: "rgba(241,238,232,.55)" };
  }
}

export function specs(l: Pick<Listing, "beds" | "baths" | "sqft">): string {
  const sq = Number(l.sqft)
    ? Number(l.sqft).toLocaleString("en-CA") + " sq ft"
    : null;
  return [
    l.beds ? `${l.beds} bd` : null,
    l.baths ? `${l.baths} ba` : null,
    sq,
  ]
    .filter(Boolean)
    .join(" · ");
}

export const SERVICE_IDS = [
  "photos",
  "video",
  "tour_3d",
  "drone",
  "floor_plans",
] as const;

export type ServiceId = (typeof SERVICE_IDS)[number];

export interface ServiceDef {
  id: ServiceId;
  name: string;
  priceCents: number;
}

export const SERVICES: readonly ServiceDef[] = [
  { id: "photos", name: "Photos", priceCents: 19_900 },
  { id: "video", name: "Video", priceCents: 14_900 },
  { id: "tour_3d", name: "3D Tour", priceCents: 14_900 },
  { id: "drone", name: "Drone", priceCents: 7_900 },
  { id: "floor_plans", name: "Floor Plans", priceCents: 6_900 },
];

export const SERVICE_BY_ID: Record<ServiceId, ServiceDef> = Object.fromEntries(
  SERVICES.map((s) => [s.id, s])
) as Record<ServiceId, ServiceDef>;

export const PACKAGE_IDS = [
  "essentials",
  "aerial",
  "showcase",
  "immersive",
  "premium",
  "full_suite",
] as const;

export type PackageId = (typeof PACKAGE_IDS)[number];

export interface PackageDef {
  id: PackageId;
  name: string;
  services: readonly ServiceId[];
  priceCents: number;
  badge?: "most_popular";
}

export const PACKAGES: readonly PackageDef[] = [
  { id: "essentials", name: "Essentials", services: ["photos"], priceCents: 19_900 },
  { id: "aerial", name: "Aerial", services: ["photos", "drone"], priceCents: 25_900 },
  {
    id: "showcase",
    name: "Showcase",
    services: ["photos", "drone", "video"],
    priceCents: 37_900,
    badge: "most_popular",
  },
  { id: "immersive", name: "Immersive", services: ["photos", "drone", "tour_3d"], priceCents: 37_900 },
  {
    id: "premium",
    name: "Premium",
    services: ["photos", "drone", "video", "tour_3d"],
    priceCents: 49_900,
  },
  {
    id: "full_suite",
    name: "Full Suite",
    services: ["photos", "drone", "video", "tour_3d", "floor_plans"],
    priceCents: 54_900,
  },
];

/** Upsell only if the upgrade total is within this window of the current quote. */
export const UPGRADE_WINDOW_CENTS = 5_000;

/** First N km from St. John's are included; only excess km are billed. */
export const TRAVEL_FREE_KM = 40;

/** $0.75 CAD per km beyond TRAVEL_FREE_KM (seventy-five cents, not 0.75 cents). */
export const TRAVEL_CENTS_PER_KM = 75;

/**
 * Fixed travel origin for media bookings: downtown St. John's harbour.
 * Approx. 47.5615° N, 52.7126° W.
 */
export const ST_JOHNS_ORIGIN = {
  lat: 47.5615,
  lng: -52.7126,
} as const;

export function isServiceId(value: string): value is ServiceId {
  return (SERVICE_IDS as readonly string[]).includes(value);
}

export function formatCad(cents: number): string {
  const dollars = cents / 100;
  const formatted = Number.isInteger(dollars)
    ? dollars.toLocaleString("en-CA")
    : dollars.toLocaleString("en-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `$${formatted}`;
}

export function alaCarteCents(ids: readonly ServiceId[]): number {
  return ids.reduce((sum, id) => sum + SERVICE_BY_ID[id].priceCents, 0);
}

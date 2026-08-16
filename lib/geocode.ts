import { normalizeAddress, type LatLng } from "./travel";

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const USER_AGENT =
  "TylerOxfordWebsite/1.0 (https://tyleroxford.com; media-booking-travel)";
const MIN_INTERVAL_MS = 1100;
const MAX_CACHE = 80;

export class GeocodeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GeocodeError";
  }
}

export interface GeocodedAddress extends LatLng {
  displayName: string;
}

type NominatimHit = {
  lat: string;
  lon: string;
  display_name?: string;
};

const cache = new Map<string, GeocodedAddress>();
let lastSuccess: { key: string; result: GeocodedAddress } | null = null;
let lastRequestAt = 0;
let queue: Promise<void> = Promise.resolve();

function cacheKey(address: string): string {
  return normalizeAddress(address).toLowerCase();
}

function remember(key: string, result: GeocodedAddress) {
  if (cache.size >= MAX_CACHE) {
    const oldest = cache.keys().next().value;
    if (oldest) cache.delete(oldest);
  }
  cache.set(key, result);
  lastSuccess = { key, result };
}

function searchQuery(address: string): string {
  const trimmed = normalizeAddress(address);
  if (/\b(nl|newfoundland|canada)\b/i.test(trimmed)) return trimmed;
  return `${trimmed}, NL, Canada`;
}

async function throttle(): Promise<void> {
  const wait = Math.max(0, MIN_INTERVAL_MS - (Date.now() - lastRequestAt));
  if (wait) await new Promise((resolve) => setTimeout(resolve, wait));
  lastRequestAt = Date.now();
}

async function nominatimSearch(address: string): Promise<GeocodedAddress> {
  const url = new URL(NOMINATIM_URL);
  url.searchParams.set("q", searchQuery(address));
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");
  url.searchParams.set("countrycodes", "ca");

  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": USER_AGENT,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new GeocodeError(
      "We couldn't look up that address right now. Please try again in a moment."
    );
  }

  const hits = (await res.json()) as NominatimHit[];
  const hit = Array.isArray(hits) ? hits[0] : null;
  const lat = hit ? Number(hit.lat) : NaN;
  const lng = hit ? Number(hit.lon) : NaN;
  if (!hit || !Number.isFinite(lat) || !Number.isFinite(lng)) {
    throw new GeocodeError(
      "We couldn't find that address. Add a street and city (for example, 123 Water St, St. John's)."
    );
  }

  return {
    lat,
    lng,
    displayName: hit.display_name || normalizeAddress(address),
  };
}

export function lastSuccessfulGeocode(): GeocodedAddress | null {
  return lastSuccess?.result ?? null;
}

export async function geocodeAddress(address: string): Promise<GeocodedAddress> {
  const trimmed = normalizeAddress(address);
  if (trimmed.length < 3) {
    throw new GeocodeError(
      "Enter a service address with a street and city so we can estimate travel."
    );
  }

  const key = cacheKey(trimmed);
  const cached = cache.get(key);
  if (cached) return cached;
  if (lastSuccess?.key === key) return lastSuccess.result;

  let result: GeocodedAddress;
  const run = async () => {
    await throttle();
    return nominatimSearch(trimmed);
  };
  const pending = queue.then(run, run);
  queue = pending.then(
    () => undefined,
    () => undefined
  );
  result = await pending;
  remember(key, result);
  return result;
}

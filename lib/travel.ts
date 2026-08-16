import {
  ST_JOHNS_ORIGIN,
  TRAVEL_CENTS_PER_KM,
  TRAVEL_FREE_KM,
} from "./pricing";

export interface LatLng {
  lat: number;
  lng: number;
}

const EARTH_RADIUS_KM = 6371;

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/** Great-circle distance in km. */
export function haversineKm(from: LatLng, to: LatLng): number {
  const dLat = toRad(to.lat - from.lat);
  const dLng = toRad(to.lng - from.lng);
  const lat1 = toRad(from.lat);
  const lat2 = toRad(to.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function distanceFromStJohnsKm(point: LatLng): number {
  return haversineKm(ST_JOHNS_ORIGIN, point);
}

/** One-way distance rounded up to the nearest km for billing. */
export function billedDistanceKm(distanceKm: number): number {
  if (!Number.isFinite(distanceKm) || distanceKm <= 0) return 0;
  return Math.ceil(distanceKm);
}

/** Km charged after the free radius. */
export function billedExcessKm(distanceKm: number): number {
  return Math.max(0, billedDistanceKm(distanceKm) - TRAVEL_FREE_KM);
}

/**
 * Travel fee in CAD cents.
 * Free within TRAVEL_FREE_KM of St. John's; $0.75 per additional km after that.
 */
export function travelFeeCents(distanceKm: number): number {
  return billedExcessKm(distanceKm) * TRAVEL_CENTS_PER_KM;
}

export function travelLineName(excessKm: number): string {
  return `Travel (${excessKm} km beyond ${TRAVEL_FREE_KM} km)`;
}

export function normalizeAddress(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

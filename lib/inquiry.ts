export const INQUIRY_INTENTS = ["buying", "selling"] as const;
export type InquiryIntent = (typeof INQUIRY_INTENTS)[number];

export const PROPERTY_TYPES = ["House", "Condo", "Townhouse", "Land", "Other"] as const;
export type PropertyType = (typeof PROPERTY_TYPES)[number];

export interface PropertyPrefs {
  beds?: string;
  baths?: string;
  parking?: string;
  area?: string;
  propertyType?: PropertyType;
}

export function isInquiryIntent(value: string): value is InquiryIntent {
  return (INQUIRY_INTENTS as readonly string[]).includes(value);
}

export function isPropertyType(value: string): value is PropertyType {
  return (PROPERTY_TYPES as readonly string[]).includes(value);
}

export function sanitizePropertyPrefs(raw: unknown): PropertyPrefs | null {
  if (!raw || typeof raw !== "object") return null;
  const input = raw as Record<string, unknown>;
  const prefs: PropertyPrefs = {};

  for (const key of ["beds", "baths", "parking", "area"] as const) {
    if (typeof input[key] === "string") {
      const value = input[key].trim().slice(0, 80);
      if (value) prefs[key] = value;
    }
  }

  if (typeof input.propertyType === "string" && isPropertyType(input.propertyType)) {
    prefs.propertyType = input.propertyType;
  }

  return Object.keys(prefs).length ? prefs : null;
}

export function formatPropertyPrefs(prefs: PropertyPrefs | null | undefined): string | null {
  if (!prefs) return null;
  const parts = [
    prefs.propertyType,
    prefs.beds ? `${prefs.beds} beds` : null,
    prefs.baths ? `${prefs.baths} baths` : null,
    prefs.parking ? `${prefs.parking} parking` : null,
    prefs.area,
  ].filter(Boolean);
  return parts.length ? parts.join(" · ") : null;
}

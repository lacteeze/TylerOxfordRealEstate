"use server";

import { createClient } from "@/lib/supabase/server";
import { GeocodeError, geocodeAddress } from "@/lib/geocode";
import {
  isInquiryIntent,
  sanitizePropertyPrefs,
  type InquiryIntent,
  type PropertyPrefs,
} from "@/lib/inquiry";
import { notifyLeadByEmail, notifyLeadBySms } from "@/lib/pingram";
import { isServiceId, type ServiceId } from "@/lib/pricing";
import { priceCart, type PriceResult } from "@/lib/pricing-engine";
import {
  billedDistanceKm,
  billedExcessKm,
  distanceFromStJohnsKm,
  normalizeAddress,
  travelFeeCents,
} from "@/lib/travel";

export interface LeadInput {
  kind: "real_estate" | "media";
  name: string;
  email: string;
  phone: string;
  message: string;
  listing_id?: string | null;
  services?: ServiceId[];
  intent?: InquiryIntent | null;
  propertyPrefs?: PropertyPrefs | null;
  serviceAddress?: string;
}

export interface LeadNotification extends LeadInput {
  quote?: PriceResult | null;
  travelKm?: number | null;
  travelCents?: number | null;
}

export type TravelPreviewResult =
  | { ok: true; km: number; excessKm: number; travelCents: number }
  | { ok: false; error: string };

async function quoteTravel(address: string): Promise<TravelPreviewResult> {
  const serviceAddress = normalizeAddress(address);
  if (serviceAddress.length < 3) {
    return {
      ok: false,
      error: "Enter a service address with a street and city so we can estimate travel.",
    };
  }

  try {
    const geo = await geocodeAddress(serviceAddress);
    const distanceKm = distanceFromStJohnsKm(geo);
    return {
      ok: true,
      km: billedDistanceKm(distanceKm),
      excessKm: billedExcessKm(distanceKm),
      travelCents: travelFeeCents(distanceKm),
    };
  } catch (e) {
    const message =
      e instanceof GeocodeError
        ? e.message
        : "We couldn't find that address. Add a street and city (for example, 123 Water St, St. John's).";
    return { ok: false, error: message };
  }
}

export async function previewMediaTravel(address: string): Promise<TravelPreviewResult> {
  return quoteTravel(address);
}

export async function submitLead(
  input: LeadInput
): Promise<{ ok: boolean; error?: string }> {
  const name = (input.name || "").trim();
  if (!name) return { ok: false, error: "Please tell us your name." };
  if (!(input.email || "").trim() && !(input.phone || "").trim())
    return { ok: false, error: "Leave an email or phone number so Tyler can reach you." };

  const kind = input.kind === "media" ? "media" : "real_estate";

  const services =
    kind === "media" ? (input.services || []).filter(isServiceId) : [];
  if (kind === "media" && services.length === 0) {
    return { ok: false, error: "Pick at least one service." };
  }

  const intent =
    kind === "real_estate" && input.intent && isInquiryIntent(input.intent) ? input.intent : null;
  let propertyPrefs = kind === "real_estate" ? sanitizePropertyPrefs(input.propertyPrefs) : null;
  if (kind === "real_estate" && intent !== "selling" && propertyPrefs) {
    delete propertyPrefs.address;
    if (!Object.keys(propertyPrefs).length) propertyPrefs = null;
  }
  if (kind === "real_estate" && intent === "selling" && !propertyPrefs?.address) {
    return { ok: false, error: "Please enter the address of the property you're selling." };
  }

  let quote: PriceResult | null = kind === "media" ? priceCart(services) : null;
  let serviceAddress: string | null = null;
  let travelKm: number | null = null;
  let travelCents: number | null = null;

  if (kind === "media") {
    const travel = await quoteTravel(input.serviceAddress || "");
    if (!travel.ok) return { ok: false, error: travel.error };
    serviceAddress = normalizeAddress(input.serviceAddress || "");
    travelKm = travel.km;
    travelCents = travel.travelCents;
    quote = priceCart(services, travel.travelCents);
  }

  const supabase = await createClient();
  const { error } = await supabase.from("leads").insert({
    kind,
    name,
    email: (input.email || "").trim(),
    phone: (input.phone || "").trim(),
    message: (input.message || "").trim(),
    listing_id: input.listing_id || null,
    services: services.length ? services : null,
    quote_cents: quote ? quote.total : null,
    quote_line_items: quote ? quote.lineItems : null,
    intent,
    property_prefs: propertyPrefs,
    service_address: serviceAddress,
    travel_km: travelKm,
    travel_cents: travelCents,
  });

  if (error) return { ok: false, error: "Something went wrong — please try again." };

  const notification: LeadNotification = {
    ...input,
    kind,
    name,
    services,
    intent,
    propertyPrefs,
    serviceAddress: serviceAddress ?? undefined,
    quote,
    travelKm,
    travelCents,
  };

  // Notification failures shouldn't break the form — the lead is already saved.
  try {
    await notifyLeadBySms(notification);
  } catch (e) {
    console.error("Lead saved but SMS notification failed:", e instanceof Error ? e.message : e);
  }

  try {
    await notifyLeadByEmail(notification);
  } catch (e) {
    console.error("Lead saved but email notification failed:", e instanceof Error ? e.message : e);
  }

  return { ok: true };
}

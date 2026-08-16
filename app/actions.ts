"use server";

import { createClient } from "@/lib/supabase/server";
import { notifyLeadBySms } from "@/lib/pingram";
import {
  isInquiryIntent,
  sanitizePropertyPrefs,
  type InquiryIntent,
  type PropertyPrefs,
} from "@/lib/inquiry";
import { isServiceId, type ServiceId } from "@/lib/pricing";
import { priceCart, type PriceResult } from "@/lib/pricing-engine";

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
}

export interface LeadNotification extends LeadInput {
  quote?: PriceResult | null;
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

  const quote = kind === "media" ? priceCart(services) : null;
  const intent =
    kind === "real_estate" && input.intent && isInquiryIntent(input.intent) ? input.intent : null;
  const propertyPrefs = kind === "real_estate" ? sanitizePropertyPrefs(input.propertyPrefs) : null;

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
  });

  if (error) return { ok: false, error: "Something went wrong — please try again." };

  // SMS failures shouldn't break the form — the lead is already saved in Supabase.
  try {
    await notifyLeadBySms({
      ...input,
      kind,
      name,
      services,
      intent,
      propertyPrefs,
      quote,
    });
  } catch (e) {
    console.error("Lead saved but SMS notification failed:", e);
  }

  return { ok: true };
}

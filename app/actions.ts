"use server";

import { createClient } from "@/lib/supabase/server";
import { notifyLeadBySms } from "@/lib/pingram";
import { MEDIA_SERVICES, type MediaService } from "@/lib/types";

export interface LeadInput {
  kind: "real_estate" | "media";
  name: string;
  email: string;
  phone: string;
  message: string;
  listing_id?: string | null;
  services?: MediaService[];
}

export async function submitLead(
  input: LeadInput
): Promise<{ ok: boolean; error?: string }> {
  const name = (input.name || "").trim();
  if (!name) return { ok: false, error: "Please tell us your name." };
  if (!(input.email || "").trim() && !(input.phone || "").trim())
    return { ok: false, error: "Leave an email or phone number so Tyler can reach you." };

  // Only accept known service values, and only for media bookings.
  const services =
    input.kind === "media"
      ? (input.services || []).filter((s): s is MediaService => (MEDIA_SERVICES as readonly string[]).includes(s))
      : [];

  const supabase = await createClient();
  const { error } = await supabase.from("leads").insert({
    kind: input.kind === "media" ? "media" : "real_estate",
    name,
    email: (input.email || "").trim(),
    phone: (input.phone || "").trim(),
    message: (input.message || "").trim(),
    listing_id: input.listing_id || null,
    services: services.length ? services : null,
  });

  if (error) return { ok: false, error: "Something went wrong — please try again." };

  // SMS failures shouldn't break the form — the lead is already saved in Supabase.
  try {
    await notifyLeadBySms({ ...input, name, services });
  } catch (e) {
    console.error("Lead saved but SMS notification failed:", e);
  }

  return { ok: true };
}

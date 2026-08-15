"use server";

import { createClient } from "@/lib/supabase/server";
import { notifyLeadBySms } from "@/lib/pingram";

export interface LeadInput {
  kind: "real_estate" | "media";
  name: string;
  email: string;
  phone: string;
  message: string;
  listing_id?: string | null;
}

export async function submitLead(
  input: LeadInput
): Promise<{ ok: boolean; error?: string }> {
  const name = (input.name || "").trim();
  if (!name) return { ok: false, error: "Please tell us your name." };
  if (!(input.email || "").trim() && !(input.phone || "").trim())
    return { ok: false, error: "Leave an email or phone number so Tyler can reach you." };

  const supabase = await createClient();
  const { error } = await supabase.from("leads").insert({
    kind: input.kind === "media" ? "media" : "real_estate",
    name,
    email: (input.email || "").trim(),
    phone: (input.phone || "").trim(),
    message: (input.message || "").trim(),
    listing_id: input.listing_id || null,
  });

  if (error) return { ok: false, error: "Something went wrong — please try again." };

  // SMS failures shouldn't break the form — the lead is already saved in Supabase.
  try {
    await notifyLeadBySms({ ...input, name });
  } catch (e) {
    console.error("Lead saved but SMS notification failed:", e);
  }

  return { ok: true };
}

"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  isAllowedLandingPhotoUrl,
  isLandingPhotoSlot,
} from "@/lib/landing-photos";

export async function saveLandingPhoto(
  slot: string,
  url: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isLandingPhotoSlot(slot)) {
    return { ok: false, error: "Unknown home page section." };
  }
  const trimmed = url.trim();
  if (!isAllowedLandingPhotoUrl(trimmed)) {
    return { ok: false, error: "That photo URL is not allowed." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "Sign in to continue." };
  }

  const { error } = await supabase.from("landing_photos").upsert({
    slot,
    url: trimmed,
    updated_at: new Date().toISOString(),
  });
  if (error) {
    return { ok: false, error: `Could not save photo: ${error.message}` };
  }

  revalidatePath("/");
  revalidatePath("/admin");
  return { ok: true };
}

export async function resetLandingPhoto(
  slot: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isLandingPhotoSlot(slot)) {
    return { ok: false, error: "Unknown home page section." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "Sign in to continue." };
  }

  const { error } = await supabase.from("landing_photos").delete().eq("slot", slot);
  if (error) {
    return { ok: false, error: `Could not reset photo: ${error.message}` };
  }

  revalidatePath("/");
  revalidatePath("/admin");
  return { ok: true };
}

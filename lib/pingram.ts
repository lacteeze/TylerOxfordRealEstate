import { Pingram } from "pingram";

import type { LeadInput } from "@/app/actions";

// Sends Tyler an SMS about a new website inquiry through Pingram,
// so leads reach him without publishing his personal cell number.
export async function notifyLeadBySms(lead: LeadInput): Promise<void> {
  const apiKey = process.env.PINGRAM_API_KEY;
  const to = process.env.LEAD_SMS_TO;
  if (!apiKey || !to) {
    console.warn("Pingram not configured (PINGRAM_API_KEY / LEAD_SMS_TO missing) — skipping lead SMS.");
    return;
  }

  const pingram = new Pingram({
    apiKey,
    baseUrl: process.env.PINGRAM_BASE_URL || "https://api.ca.pingram.io",
  });

  const kindLabel = lead.kind === "media" ? "MEDIA BOOKING" : "REAL ESTATE";
  const contact = [lead.email, lead.phone].filter(Boolean).join(" · ");
  const lines = [
    `New ${kindLabel} inquiry — tyleroxford.com`,
    `From: ${lead.name}${contact ? ` (${contact})` : ""}`,
    lead.services?.length ? `Requested: ${lead.services.join(", ")}` : null,
    lead.listing_id ? `Listing: ${lead.listing_id}` : null,
    lead.message ? `"${lead.message.slice(0, 280)}"` : null,
  ].filter(Boolean);

  await pingram.sms.send({
    type: "website_lead",
    to,
    message: lines.join("\n"),
  });
}

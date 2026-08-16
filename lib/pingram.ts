import { Pingram } from "pingram";

import type { LeadNotification } from "@/app/actions";
import { formatPropertyPrefs } from "@/lib/inquiry";
import { SERVICE_BY_ID, formatCad } from "@/lib/pricing";

// Sends Tyler an SMS about a new website inquiry through Pingram,
// so leads reach him without publishing his personal cell number.
export async function notifyLeadBySms(lead: LeadNotification): Promise<void> {
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
  const serviceNames = (lead.services || [])
    .map((id) => SERVICE_BY_ID[id]?.name ?? id)
    .filter(Boolean);
  const quote = lead.quote;
  const lineSummary = quote?.lineItems
    .map((item) => `${item.name} ${formatCad(item.priceCents)}`)
    .join(" + ");
  const prefsLine = formatPropertyPrefs(lead.propertyPrefs);

  const lines = [
    `New ${kindLabel} inquiry — tyleroxford.com`,
    `From: ${lead.name}${contact ? ` (${contact})` : ""}`,
    lead.intent ? `Intent: ${lead.intent === "buying" ? "Buying" : "Selling"}` : null,
    prefsLine ? `Looking for: ${prefsLine}` : null,
    serviceNames.length ? `Services: ${serviceNames.join(", ")}` : null,
    lineSummary ? `Quote: ${lineSummary}` : null,
    quote ? `Total: ${formatCad(quote.total)}` : null,
    quote && quote.savings > 0 ? `Savings: ${formatCad(quote.savings)}` : null,
    lead.listing_id ? `Listing: ${lead.listing_id}` : null,
    lead.message ? `"${lead.message.slice(0, 280)}"` : null,
  ].filter(Boolean);

  await pingram.sms.send({
    type: "website_lead",
    to,
    message: lines.join("\n"),
  });
}

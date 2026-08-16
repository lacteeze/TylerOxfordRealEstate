import { Pingram } from "pingram";

import type { LeadNotification } from "@/app/actions";
import { formatPropertyPrefs } from "@/lib/inquiry";
import { SERVICE_BY_ID, TRAVEL_FREE_KM, formatCad } from "@/lib/pricing";

const LEAD_EMAIL_TO = "tyler@tyleroxford.ca";
const LEAD_SENDER_EMAIL = "info@tyleroxford.com";
const LEAD_SENDER_NAME = "Tyler Oxford";

function pingramClient(): Pingram | null {
  const apiKey = process.env.PINGRAM_API_KEY;
  if (!apiKey) {
    console.warn("Pingram not configured (PINGRAM_API_KEY missing) — skipping notification.");
    return null;
  }
  return new Pingram({
    apiKey,
    baseUrl: process.env.PINGRAM_BASE_URL || "https://api.ca.pingram.io",
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function travelSmsLine(lead: LeadNotification): string | null {
  if (lead.kind !== "media" || lead.travelKm == null) return null;
  const fee = lead.travelCents ?? 0;
  if (fee <= 0) return `Travel: ${lead.travelKm} km · included (within ${TRAVEL_FREE_KM} km)`;
  return `Travel: ${lead.travelKm} km · ${formatCad(fee)}`;
}

function emailRow(label: string, value: string | null | undefined): string {
  if (!value) return "";
  return `<tr>
    <td style="padding:6px 0;color:#5a6578;vertical-align:top;width:140px">${escapeHtml(label)}</td>
    <td style="padding:6px 0;color:#1a2744">${value}</td>
  </tr>`;
}

export function mediaBookingEmailHtml(lead: LeadNotification): string {
  const quote = lead.quote;
  const serviceNames = (lead.services || [])
    .map((id) => SERVICE_BY_ID[id]?.name ?? id)
    .filter(Boolean)
    .join(", ");
  const lineItems = (quote?.lineItems || [])
    .map(
      (item) =>
        `<tr>
          <td style="padding:4px 0;color:#1a2744">${escapeHtml(item.name)}</td>
          <td style="padding:4px 0;text-align:right;color:#1a2744">${escapeHtml(formatCad(item.priceCents))}</td>
        </tr>`
    )
    .join("");
  const travel =
    lead.travelKm == null
      ? ""
      : (lead.travelCents ?? 0) > 0
        ? `${lead.travelKm} km · ${formatCad(lead.travelCents ?? 0)}`
        : `${lead.travelKm} km · included`;

  return `<div style="font-family:Georgia,serif;font-size:15px;line-height:1.5;color:#1a2744">
    <p style="margin:0 0 16px">New media booking from tyleroxford.com</p>
    <table style="border-collapse:collapse;width:100%;max-width:560px">
      ${emailRow("Name", escapeHtml(lead.name))}
      ${emailRow("Email", lead.email ? escapeHtml(lead.email) : "")}
      ${emailRow("Phone", lead.phone ? escapeHtml(lead.phone) : "")}
      ${emailRow("Service address", lead.serviceAddress ? escapeHtml(lead.serviceAddress) : "")}
      ${emailRow("Services", serviceNames ? escapeHtml(serviceNames) : "")}
      ${emailRow("Travel", travel ? escapeHtml(travel) : "")}
    </table>
    ${
      lineItems
        ? `<table style="border-collapse:collapse;width:100%;max-width:560px;margin-top:16px">${lineItems}
            <tr>
              <td style="padding:10px 0 0;font-weight:700;border-top:1px solid #d8deea">Total</td>
              <td style="padding:10px 0 0;text-align:right;font-weight:700;border-top:1px solid #d8deea">${escapeHtml(formatCad(quote?.total ?? 0))}</td>
            </tr>
          </table>`
        : ""
    }
    ${quote && quote.savings > 0 ? `<p style="margin:8px 0 0">Package savings: ${escapeHtml(formatCad(quote.savings))}</p>` : ""}
    ${lead.message ? `<p style="margin:16px 0 0">“${escapeHtml(lead.message)}”</p>` : ""}
  </div>`;
}

export function realEstateEmailHtml(lead: LeadNotification): string {
  const prefs = formatPropertyPrefs(
    lead.propertyPrefs ? { ...lead.propertyPrefs, address: undefined } : null
  );
  const intent = lead.intent === "buying" ? "Buying" : lead.intent === "selling" ? "Selling" : "";
  return `<div style="font-family:Georgia,serif;font-size:15px;line-height:1.5;color:#1a2744">
    <p style="margin:0 0 16px">New real estate inquiry from tyleroxford.com</p>
    <table style="border-collapse:collapse;width:100%;max-width:560px">
      ${emailRow("Name", escapeHtml(lead.name))}
      ${emailRow("Email", lead.email ? escapeHtml(lead.email) : "")}
      ${emailRow("Phone", lead.phone ? escapeHtml(lead.phone) : "")}
      ${emailRow("Intent", intent)}
      ${emailRow("Address", lead.propertyPrefs?.address ? escapeHtml(lead.propertyPrefs.address) : "")}
      ${emailRow("Looking for", prefs ? escapeHtml(prefs) : "")}
    </table>
    ${lead.message ? `<p style="margin:16px 0 0">“${escapeHtml(lead.message)}”</p>` : ""}
  </div>`;
}

// Sends Tyler an SMS about a new website inquiry through Pingram,
// so leads reach him without publishing his personal cell number.
export async function notifyLeadBySms(lead: LeadNotification): Promise<void> {
  const pingram = pingramClient();
  const to = process.env.LEAD_SMS_TO;
  if (!pingram || !to) {
    if (!to) console.warn("LEAD_SMS_TO missing — skipping lead SMS.");
    return;
  }

  const kindLabel = lead.kind === "media" ? "MEDIA BOOKING" : "REAL ESTATE";
  const contact = [lead.email, lead.phone].filter(Boolean).join(" · ");
  const serviceNames = (lead.services || [])
    .map((id) => SERVICE_BY_ID[id]?.name ?? id)
    .filter(Boolean);
  const quote = lead.quote;
  const lineSummary = quote?.lineItems
    .map((item) => `${item.name} ${formatCad(item.priceCents)}`)
    .join(" + ");
  const prefsLine = formatPropertyPrefs(
    lead.propertyPrefs ? { ...lead.propertyPrefs, address: undefined } : null
  );

  const lines = [
    `New ${kindLabel} inquiry — tyleroxford.com`,
    `From: ${lead.name}${contact ? ` (${contact})` : ""}`,
    lead.intent ? `Intent: ${lead.intent === "buying" ? "Buying" : "Selling"}` : null,
    lead.kind === "real_estate" && lead.propertyPrefs?.address
      ? `Property: ${lead.propertyPrefs.address}`
      : null,
    prefsLine ? `Looking for: ${prefsLine}` : null,
    lead.serviceAddress ? `Address: ${lead.serviceAddress}` : null,
    serviceNames.length ? `Services: ${serviceNames.join(", ")}` : null,
    lineSummary ? `Quote: ${lineSummary}` : null,
    quote ? `Total: ${formatCad(quote.total)}` : null,
    quote && quote.savings > 0 ? `Savings: ${formatCad(quote.savings)}` : null,
    travelSmsLine(lead),
    lead.listing_id ? `Listing: ${lead.listing_id}` : null,
    lead.message ? `"${lead.message.slice(0, 280)}"` : null,
  ].filter(Boolean);

  await pingram.sms.send({
    type: "website_lead",
    to,
    message: lines.join("\n"),
  });
}

export async function notifyLeadByEmail(lead: LeadNotification): Promise<void> {
  const pingram = pingramClient();
  if (!pingram) return;

  const isMedia = lead.kind === "media";
  const subject = isMedia
    ? `Media booking — ${lead.name}${lead.quote ? ` — ${formatCad(lead.quote.total)}` : ""}`
    : `Real estate inquiry — ${lead.name}`;

  await pingram.send({
    type: isMedia ? "media_booking" : "website_lead",
    to: { email: LEAD_EMAIL_TO },
    email: {
      subject,
      html: isMedia ? mediaBookingEmailHtml(lead) : realEstateEmailHtml(lead),
      senderName: LEAD_SENDER_NAME,
      senderEmail: LEAD_SENDER_EMAIL,
    },
  });
}

import { describe, expect, it } from "vitest";
import { DEFAULT_LEAD_EMAIL_TO, adminMagicLinkEmailHtml, adminRecoveryEmailHtml, mediaBookingEmailHtml, realEstateEmailHtml } from "./pingram";
import type { LeadNotification } from "@/app/actions";

describe("lead email recipient", () => {
  it("defaults to the published tyleroxford.com inbox, not a .ca address that bounced", () => {
    expect(DEFAULT_LEAD_EMAIL_TO).toBe("tyler@tyleroxford.com");
    expect(DEFAULT_LEAD_EMAIL_TO).not.toMatch(/@tyleroxford\.ca$/);
  });
});

describe("lead email html", () => {
  it("includes media booking details and travel", () => {
    const html = mediaBookingEmailHtml({
      kind: "media",
      name: "Alex Buyer",
      email: "alex@example.com",
      phone: "709-555-0000",
      message: "Ready next week",
      serviceAddress: "12 Gower St, St. John's",
      services: ["photos", "drone"],
      travelKm: 52,
      travelCents: 900,
      quote: {
        total: 26_800,
        alaCarteTotal: 27_800,
        savings: 1_900,
        lineItems: [
          { kind: "package", id: "aerial", name: "Aerial", priceCents: 25_900 },
          { kind: "travel", id: "travel", name: "Travel (12 km beyond 40 km)", priceCents: 900 },
        ],
      },
    } as LeadNotification);

    expect(html).toContain("Alex Buyer");
    expect(html).toContain("12 Gower St");
    expect(html).toContain("Aerial");
    expect(html).toContain("Travel (12 km beyond 40 km)");
    expect(html).toContain("Ready next week");
  });

  it("includes the selling address on real estate inquiries", () => {
    const html = realEstateEmailHtml({
      kind: "real_estate",
      name: "Sam Seller",
      email: "sam@example.com",
      phone: "",
      message: "",
      intent: "selling",
      propertyPrefs: { address: "88 Water St, St. John's", beds: "3" },
    } as LeadNotification);

    expect(html).toContain("Sam Seller");
    expect(html).toContain("88 Water St");
    expect(html).toContain("Selling");
  });
});

describe("admin auth emails", () => {
  it("includes the sign-in and reset links", () => {
    expect(adminMagicLinkEmailHtml("https://example.com/admin/auth/callback?token_hash=abc")).toContain(
      "https://example.com/admin/auth/callback?token_hash=abc"
    );
    expect(adminRecoveryEmailHtml("https://example.com/admin/update-password")).toContain(
      "Set a new password"
    );
  });
});

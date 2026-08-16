import { describe, expect, it } from "vitest";
import { ST_JOHNS_ORIGIN, TRAVEL_CENTS_PER_KM, TRAVEL_FREE_KM } from "./pricing";
import { applyTravel, priceCart, withTravelFee } from "./pricing-engine";
import {
  billedDistanceKm,
  billedExcessKm,
  distanceFromStJohnsKm,
  haversineKm,
  travelFeeCents,
} from "./travel";

describe("travel fee math", () => {
  it("charges nothing within the included 40 km", () => {
    expect(travelFeeCents(0)).toBe(0);
    expect(travelFeeCents(12)).toBe(0);
    expect(travelFeeCents(35)).toBe(0);
    expect(travelFeeCents(TRAVEL_FREE_KM)).toBe(0);
    expect(billedExcessKm(40)).toBe(0);
  });

  it("charges $0.75 per km after the free radius, rounding distance up", () => {
    expect(travelFeeCents(40.1)).toBe(TRAVEL_CENTS_PER_KM);
    expect(travelFeeCents(41)).toBe(75);
    expect(travelFeeCents(52)).toBe(900);
    expect(travelFeeCents(51.1)).toBe(900);
    expect(billedDistanceKm(51.1)).toBe(52);
    expect(billedExcessKm(52)).toBe(12);
  });

  it("never bills the full trip — only km beyond 40", () => {
    expect(travelFeeCents(80)).toBe(40 * TRAVEL_CENTS_PER_KM);
    expect(travelFeeCents(80)).not.toBe(80 * TRAVEL_CENTS_PER_KM);
  });
});

describe("haversine", () => {
  it("is zero at the St. John's origin", () => {
    expect(distanceFromStJohnsKm(ST_JOHNS_ORIGIN)).toBe(0);
    expect(haversineKm(ST_JOHNS_ORIGIN, ST_JOHNS_ORIGIN)).toBe(0);
  });
});

describe("priceCart travel", () => {
  it("keeps packages on services and adds travel on top", () => {
    const quote = priceCart(["photos", "drone", "video"], 900);
    expect(quote.lineItems[0]).toEqual({
      kind: "package",
      id: "showcase",
      name: "Showcase",
      priceCents: 37_900,
    });
    expect(quote.lineItems.at(-1)).toEqual({
      kind: "travel",
      id: "travel",
      name: "Travel (12 km beyond 40 km)",
      priceCents: 900,
    });
    expect(quote.total).toBe(37_900 + 900);
    expect(quote.savings).toBe(priceCart(["photos", "drone", "video"]).savings);
  });

  it("does not add a travel line when the fee is zero", () => {
    const quote = withTravelFee(priceCart(["photos"]), 0);
    expect(quote.total).toBe(19_900);
    expect(quote.lineItems.some((item) => item.kind === "travel")).toBe(false);
  });

  it("applyTravel uses excess km only", () => {
    const quote = applyTravel(priceCart(["photos"]), 52);
    expect(quote.total).toBe(19_900 + 900);
  });
});

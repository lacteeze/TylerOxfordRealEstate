import { describe, expect, it } from "vitest";
import { formatCad } from "./pricing";
import { priceCart, suggestUpgrade } from "./pricing-engine";

describe("priceCart", () => {
  it("prices photos as Essentials", () => {
    const quote = priceCart(["photos"]);
    expect(quote.total).toBe(19_900);
    expect(quote.lineItems).toEqual([
      { kind: "package", id: "essentials", name: "Essentials", priceCents: 19_900 },
    ]);
  });

  it("prices photos + video as Essentials + Video", () => {
    const quote = priceCart(["photos", "video"]);
    expect(quote.total).toBe(34_800);
    expect(quote.lineItems).toEqual([
      { kind: "package", id: "essentials", name: "Essentials", priceCents: 19_900 },
      { kind: "service", id: "video", name: "Video", priceCents: 14_900 },
    ]);
  });

  it("prices photos + drone + floor plans as Aerial + Floor Plans", () => {
    const quote = priceCart(["photos", "drone", "floor_plans"]);
    expect(quote.total).toBe(32_800);
    expect(quote.lineItems).toEqual([
      { kind: "package", id: "aerial", name: "Aerial", priceCents: 25_900 },
      { kind: "service", id: "floor_plans", name: "Floor Plans", priceCents: 6_900 },
    ]);
  });

  it("prices photos + drone + video as Showcase", () => {
    const quote = priceCart(["photos", "drone", "video"]);
    expect(quote.total).toBe(37_900);
    expect(quote.lineItems).toEqual([
      { kind: "package", id: "showcase", name: "Showcase", priceCents: 37_900 },
    ]);
  });

  it("prices photos + video + 3D tour as Essentials + Video + 3D Tour", () => {
    const quote = priceCart(["photos", "video", "tour_3d"]);
    expect(quote.total).toBe(49_700);
    expect(quote.lineItems).toEqual([
      { kind: "package", id: "essentials", name: "Essentials", priceCents: 19_900 },
      { kind: "service", id: "video", name: "Video", priceCents: 14_900 },
      { kind: "service", id: "tour_3d", name: "3D Tour", priceCents: 14_900 },
    ]);
  });

  it("prices all five services as Full Suite", () => {
    const quote = priceCart(["photos", "video", "tour_3d", "drone", "floor_plans"]);
    expect(quote.total).toBe(54_900);
    expect(quote.lineItems).toEqual([
      { kind: "package", id: "full_suite", name: "Full Suite", priceCents: 54_900 },
    ]);
  });

  it("prices an empty cart at zero", () => {
    const quote = priceCart([]);
    expect(quote.total).toBe(0);
    expect(quote.lineItems).toEqual([]);
    expect(quote.alaCarteTotal).toBe(0);
    expect(quote.savings).toBe(0);
  });
});

describe("suggestUpgrade", () => {
  it("suggests Premium for $2 more when photos, video, and 3D tour are selected", () => {
    const current = priceCart(["photos", "video", "tour_3d"]);
    expect(current.total).toBe(49_700);

    const upgrade = suggestUpgrade(["photos", "video", "tour_3d"]);
    expect(upgrade).toEqual({
      packageId: "premium",
      packageName: "Premium",
      extraCost: 200,
      servicesGained: ["drone"],
      newTotal: 49_900,
    });
    expect(formatCad(upgrade!.extraCost)).toBe("$2");
  });
});

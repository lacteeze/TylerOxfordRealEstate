import { describe, expect, it } from "vitest";
import { chip, priceLabel } from "./types";

describe("listing labels", () => {
  it("uses a Showcase chip and hides a $0 price", () => {
    expect(chip("showcase")).toEqual({ label: "SHOWCASE", color: "#e8d9b0" });
    expect(priceLabel({ status: "showcase", price: 0 })).toBe("Showcase");
    expect(priceLabel({ status: "showcase", price: 450000 })).toBe("$450,000");
  });
});

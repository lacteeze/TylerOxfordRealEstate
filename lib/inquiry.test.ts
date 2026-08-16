import { describe, expect, it } from "vitest";
import { formatPropertyPrefs, sanitizePropertyPrefs } from "./inquiry";

describe("selling address prefs", () => {
  it("keeps a selling address in property prefs", () => {
    const prefs = sanitizePropertyPrefs({
      address: "  12 Gower St, St. John's  ",
      beds: "3",
    });
    expect(prefs).toEqual({
      address: "12 Gower St, St. John's",
      beds: "3",
    });
    expect(formatPropertyPrefs(prefs)).toContain("12 Gower St, St. John's");
  });
});

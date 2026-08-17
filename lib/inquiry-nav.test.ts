import { describe, expect, it } from "vitest";
import { inquiryNeighbors } from "./inquiry-nav";

describe("inquiryNeighbors", () => {
  const items = [{ id: "a" }, { id: "b" }, { id: "c" }];

  it("returns prev/next in list order and disables ends", () => {
    expect(inquiryNeighbors(items, "a")).toMatchObject({
      prev: null,
      next: { id: "b" },
      index: 0,
    });
    expect(inquiryNeighbors(items, "b")).toMatchObject({
      prev: { id: "a" },
      next: { id: "c" },
      index: 1,
    });
    expect(inquiryNeighbors(items, "c")).toMatchObject({
      prev: { id: "b" },
      next: null,
      index: 2,
    });
  });

  it("returns empty neighbors when the id is not in the filtered list", () => {
    expect(inquiryNeighbors(items, "missing")).toEqual({
      current: null,
      prev: null,
      next: null,
      index: -1,
    });
  });
});

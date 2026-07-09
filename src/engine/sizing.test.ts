import { describe, expect, it } from "vitest";
import { computeResponsiveGridSize } from "./sizing";

const CHAR = { charWidth: 8, lineHeight: 14 };

describe("computeResponsiveGridSize", () => {
  it("returns the base grid when the container has no size", () => {
    expect(
      computeResponsiveGridSize({ containerWidth: 0, containerHeight: 400, ...CHAR })
    ).toEqual({ width: 58, height: 30 });
  });

  it("scales down in a small container but respects the minimums", () => {
    const size = computeResponsiveGridSize({
      containerWidth: 60,
      containerHeight: 40,
      ...CHAR
    });
    expect(size.width).toBeGreaterThanOrEqual(26);
    expect(size.height).toBeGreaterThanOrEqual(14);
  });

  it("caps the scale in a huge container", () => {
    const size = computeResponsiveGridSize({
      containerWidth: 100000,
      containerHeight: 100000,
      ...CHAR,
      maxCells: 1000000
    });
    // maxScale 2.8 → at most base * 2.8, rounded
    expect(size.width).toBeLessThanOrEqual(Math.round(58 * 2.8));
    expect(size.height).toBeLessThanOrEqual(Math.round(30 * 2.8));
  });

  it("clamps the total cell count to maxCells", () => {
    const size = computeResponsiveGridSize({
      containerWidth: 4000,
      containerHeight: 3000,
      ...CHAR,
      maxCells: 3000
    });
    expect(size.width * size.height).toBeLessThanOrEqual(3000);
  });
});

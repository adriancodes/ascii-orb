import { describe, expect, it } from "vitest";
import { createRipple, pruneRipples, rippleContribution } from "./ripple";

describe("createRipple", () => {
  it("carries position, start time, and optional envelope fields", () => {
    const ripple = createRipple({
      x: 0.4,
      y: -0.2,
      timeSeconds: 3,
      duration: 2,
      speed: 1.5,
      strength: 0.8
    });
    expect(ripple).toMatchObject({
      x: 0.4,
      y: -0.2,
      start: 3,
      duration: 2,
      speed: 1.5,
      strength: 0.8
    });
  });
});

describe("pruneRipples", () => {
  it("returns the same array when nothing has expired", () => {
    const ripples = [createRipple({ x: 0, y: 0, timeSeconds: 0, duration: 5 })];
    expect(pruneRipples(ripples, 4)).toBe(ripples);
  });

  it("drops only the expired ripples", () => {
    const old = createRipple({ x: 0, y: 0, timeSeconds: 0, duration: 1 });
    const fresh = createRipple({ x: 0, y: 0, timeSeconds: 2, duration: 1 });
    expect(pruneRipples([old, fresh], 2.5)).toEqual([fresh]);
  });

  it("keeps a ripple exactly at the end of its life", () => {
    const ripple = createRipple({ x: 0, y: 0, timeSeconds: 0, duration: 1 });
    expect(pruneRipples([ripple], 1)).toEqual([ripple]);
  });
});

describe("rippleContribution", () => {
  it("peaks on the expanding ring and is zero outside a ripple's life", () => {
    const ripple = createRipple({
      x: 0,
      y: 0,
      timeSeconds: 0,
      duration: 2,
      speed: 1,
      strength: 1
    });
    const onRing = rippleContribution(0.5, 0, 0.5, [ripple]);
    const offRing = rippleContribution(0.95, 0, 0.5, [ripple]);
    expect(onRing).toBeGreaterThan(offRing);
    expect(rippleContribution(0.5, 0, 5, [ripple])).toBe(0);
  });
});

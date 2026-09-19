import { describe, expect, it } from "vitest";
import { createRipple, prepareRipples, pruneRipples, rippleContribution, sampleRippleField } from "./ripple";

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
  it("computes refraction slopes consistently with the wave brightness", () => {
    const ripples = [
      createRipple({ x: 0, y: 0, timeSeconds: 0 }),
      createRipple({ x: 0.2, y: -0.1, timeSeconds: 0.1 })
    ];
    const waves = prepareRipples(ripples, 0.4);
    const step = 0.00001;
    for (const [x, y] of [[0.3, 0.4], [-0.5, 0.1], [0.8, -0.3]]) {
      const field = sampleRippleField(x, y, waves);
      const dx = (rippleContribution(x + step, y, 0.4, ripples) - rippleContribution(x - step, y, 0.4, ripples)) / (2 * step);
      const dy = (rippleContribution(x, y + step, 0.4, ripples) - rippleContribution(x, y - step, 0.4, ripples)) / (2 * step);
      expect(field.dx).toBeCloseTo(dx, 5);
      expect(field.dy).toBeCloseTo(dy, 5);
    }
    const center = sampleRippleField(0, 0, prepareRipples([ripples[0]], 0));
    expect(center.dx).toBe(0);
    expect(center.dy).toBe(0);
    expect(rippleContribution(0, 0, 0, [createRipple({ x: 0, y: 0, timeSeconds: 0, duration: 0 })])).toBe(0);
  });

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

  it("draws a dark trough behind the bright expanding crest", () => {
    const ripple = createRipple({
      x: 0,
      y: 0,
      timeSeconds: 0,
      duration: 2,
      speed: 1,
      strength: 1
    });

    expect(rippleContribution(0.5, 0, 0.5, [ripple])).toBeGreaterThan(0);
    expect(rippleContribution(0.39, 0, 0.5, [ripple])).toBeLessThan(0);
  });

  it("moves the default crest across the orb quickly enough to read as a ripple", () => {
    const ripple = createRipple({ x: 0, y: 0, timeSeconds: 0 });

    expect(rippleContribution(0.75, 0, 0.6, [ripple])).toBeGreaterThan(0.05);
  });
});

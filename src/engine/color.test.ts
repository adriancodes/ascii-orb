import { describe, expect, it } from "vitest";
import { withAlpha } from "./color";

describe("withAlpha", () => {
  it("wraps a bare CSS variable in hsl() with the alpha", () => {
    expect(withAlpha("--foreground", 0.5)).toBe("hsl(var(--foreground) / 0.500)");
  });

  it("injects alpha into an existing hsl(var()) expression", () => {
    expect(withAlpha("hsl(var(--primary))", 0.25)).toBe(
      "hsl(var(--primary) / 0.250)"
    );
  });

  it("falls back to color-mix for concrete colors", () => {
    expect(withAlpha("#ff0000", 0.5)).toBe(
      "color-mix(in srgb, #ff0000 50.00%, transparent)"
    );
  });

  it("quantizes alpha into 1/16 steps so near-equal intensities share a color", () => {
    expect(withAlpha("--foreground", 0.51)).toBe(withAlpha("--foreground", 0.49));
    expect(withAlpha("--foreground", 1.4)).toBe(withAlpha("--foreground", 1));
    expect(withAlpha("--foreground", -0.2)).toBe(withAlpha("--foreground", 0));
  });
});

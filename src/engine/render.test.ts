import { describe, expect, it } from "vitest";
import { renderOrbFrame, frameToText } from "./render";
import { createRipple } from "./ripple";
import { orbVariantConfig } from "./variants";
import { orbVariants, type OrbFrame, type OrbRenderOptions } from "./types";

const BASE_OPTIONS: OrbRenderOptions = {
  timeSeconds: 0.7,
  width: 32,
  height: 16,
  xScale: 1.08
};

// Compact color fingerprint: distinct colors with cell counts. Any change to
// thresholds, palette roles, or alpha attenuation shifts these counts.
function colorFingerprint(frame: OrbFrame): string[] {
  const counts = new Map<string, number>();
  for (const row of frame) {
    for (const cell of row) {
      counts.set(cell.color, (counts.get(cell.color) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([color, count]) => `${color} ×${count}`);
}

describe("renderOrbFrame", () => {
  it("produces a frame of the requested dimensions", () => {
    const frame = renderOrbFrame(BASE_OPTIONS);
    expect(frame).toHaveLength(16);
    for (const row of frame) {
      expect(row).toHaveLength(32);
    }
  });

  it("is deterministic for identical options", () => {
    expect(renderOrbFrame(BASE_OPTIONS)).toEqual(renderOrbFrame(BASE_OPTIONS));
  });

  it("leaves the corners transparent and the core opaque", () => {
    const frame = renderOrbFrame(BASE_OPTIONS);
    expect(frame[0][0]).toEqual({ char: " ", color: "transparent" });
    expect(frame[8][16].color).not.toBe("transparent");
    expect(frame[8][16].char).not.toBe(" ");
  });

  it("leaves transparent space around every variant's halo", () => {
    for (const variant of orbVariants) {
      const frame = renderOrbFrame({ ...BASE_OPTIONS, variant });
      const edge = [
        ...frame[0],
        ...frame.at(-1)!,
        ...frame.flatMap((row) => [row[0], row.at(-1)!])
      ];
      expect(edge.every((cell) => cell.color === "transparent")).toBe(true);
    }
  });

  describe("characterization: chars and colors per built-in variant", () => {
    for (const variant of orbVariants) {
      it(`renders ${variant} exactly as before`, () => {
        const frame = renderOrbFrame({ ...BASE_OPTIONS, variant });
        expect({
          text: frameToText(frame),
          colors: colorFingerprint(frame)
        }).toMatchSnapshot();
      });
    }
  });

  describe("ripple coordinate space", () => {
    it("deforms the existing orb using its own characters", () => {
      const options: OrbRenderOptions = {
        timeSeconds: 0.4,
        width: 81,
        height: 41,
        variant: "aether",
        palette: { foreground: "#ff00ff" }
      };
      const ripple = createRipple({
        x: 0,
        y: 0,
        timeSeconds: 0,
        duration: 2,
        strength: 1
      });
      const base = renderOrbFrame(options);
      const rippled = renderOrbFrame({ ...options, ripples: [ripple] });

      expect(frameToText(rippled)).not.toBe(frameToText(base));
      expect(frameToText(rippled)).not.toContain("@");
      expect([...frameToText(rippled)].every(char => " \n.,:;iI1tfLCG8#".includes(char))).toBe(true);
    });

    it("leaves the halo unchanged as impacts reach and cross the surface edge", () => {
      for (const variant of orbVariants) {
        for (const timeSeconds of [0.3, 0.7, 1.1]) {
          const options = { timeSeconds, width: 81, height: 41, variant };
          const base = renderOrbFrame(options);
          const impact = renderOrbFrame({ ...options, ripples: [
            createRipple({ x: 0.3, y: 0, timeSeconds: 0, speed: 2, strength: 2 })
          ] });
          const pulse = orbVariantConfig[variant].innerPulse;
          const breath = 1 + 0.045 * Math.sin(timeSeconds * pulse * 0.72) +
            0.018 * Math.sin(timeSeconds * pulse * 0.17 + 1.3);
          const exteriorBase = [];
          const exteriorImpact = [];
          for (let row = 0; row < options.height; row += 1) {
            const y = (row / (options.height - 1) * 2 - 1) * 1.42 / breath;
            const latitude = y * (1 - 0.055 * Math.pow(Math.abs(y), 1.6));
            for (let col = 0; col < options.width; col += 1) {
              const x = (col / (options.width - 1) * 2 - 1) * 1.42 * 1.08 / breath;
              if (x * x + latitude * latitude >= 1) {
                exteriorBase.push(base[row][col]);
                exteriorImpact.push(impact[row][col]);
              }
            }
          }
          expect(exteriorImpact, `${variant} at ${timeSeconds}`).toEqual(exteriorBase);
        }
      }
    });

    it("ignores impacts that start outside the planet", () => {
      const options = { ...BASE_OPTIONS, timeSeconds: 0.3 };
      const base = renderOrbFrame(options);
      expect(renderOrbFrame({ ...options, ripples: [
        createRipple({ x: 0.9, y: 0, timeSeconds: 0, strength: 2 })
      ] })).toEqual(base);
    });

    it("warps the sphere texture around an expanding ripple", () => {
      const options: OrbRenderOptions = {
        timeSeconds: 0.4,
        width: 81,
        height: 41,
        variant: "ion",
        colorizer: ({ detail }) => detail.toFixed(6)
      };
      const ripple = createRipple({
        x: 0,
        y: 0,
        timeSeconds: 0,
        duration: 2,
        strength: 1
      });
      const base = renderOrbFrame(options);
      const rippled = renderOrbFrame({ ...options, ripples: [ripple] });
      const rippledCells = rippled.flat();

      const warpedCells = base.flat().filter((cell, index) => {
        return cell.color !== rippledCells[index].color;
      });
      expect(warpedCells.length).toBeGreaterThan(20);
    });

    // Render with and without one ripple; return the mean column of the
    // cells the ripple changed.
    function rippleCentroidCol(xScale: number): number {
      const options: OrbRenderOptions = {
        timeSeconds: 0,
        width: 121,
        height: 61,
        variant: "ion",
        xScale
      };
      const ripple = createRipple({
        x: 0.3,
        y: 0,
        timeSeconds: 0,
        duration: 2,
        strength: 2
      });
      const base = renderOrbFrame(options);
      const rippled = renderOrbFrame({ ...options, ripples: [ripple] });

      let colSum = 0;
      let changed = 0;
      for (let row = 0; row < base.length; row += 1) {
        for (let col = 0; col < base[row].length; col += 1) {
          const a = base[row][col];
          const b = rippled[row][col];
          if (a.char !== b.char || a.color !== b.color) {
            colSum += col;
            changed += 1;
          }
        }
      }
      expect(changed).toBeGreaterThan(0);
      return colSum / changed;
    }

    // Ripple coordinates are unit screen space, so where a click lands
    // must not depend on the render's aspect correction.
    it("centers a new impact at the same click point for any xScale", () => {
      const narrow = rippleCentroidCol(1);
      const wide = rippleCentroidCol(1.5);
      expect(Math.abs(narrow - wide)).toBeLessThan(2.5);
    });
  });
});

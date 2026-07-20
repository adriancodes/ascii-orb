import { describe, expect, it } from "vitest";
import { renderOrbFrame, frameToText } from "./render";
import { createRipple } from "./ripple";
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
    it("draws the expanding crest at full foreground contrast", () => {
      const options: OrbRenderOptions = {
        timeSeconds: 0.4,
        width: 81,
        height: 41,
        variant: "eclipse",
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

      const foregroundCells = (frame: OrbFrame) =>
        frame.flat().filter((cell) => cell.color.includes("#ff00ff 100.00%"))
          .length;
      expect(foregroundCells(rippled)).toBeGreaterThan(
        foregroundCells(base) + 10
      );
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
        timeSeconds: 0.4,
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
    it("centers a ripple at the same click point for any xScale", () => {
      const narrow = rippleCentroidCol(1);
      const wide = rippleCentroidCol(1.5);
      expect(Math.abs(narrow - wide)).toBeLessThan(2.5);
    });
  });
});

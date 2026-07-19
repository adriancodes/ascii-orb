import { clamp } from "./math";
import type { OrbColorizer, OrbColorizerInput, OrbPalette } from "./types";

// Concrete mid-luminance colors so a bare <AsciiOrb /> is visible on both
// light and dark pages with zero host CSS. Theme by passing `palette` —
// any CSS color works, including `hsl(var(--your-token))`.
export const defaultPalette: OrbPalette = {
  foreground: "#6b7280",
  primary: "#64748b",
  accent: "#7c3aed",
  mutedForeground: "#57606a"
};

// Roles whose value is missing, empty, or whitespace keep the default —
// an empty string would otherwise flow into color-mix() as broken CSS and
// render those cells invisible.
export function mergePalette(palette?: Partial<OrbPalette>): OrbPalette {
  const merged: OrbPalette = { ...defaultPalette };
  if (!palette) {
    return merged;
  }
  for (const role of Object.keys(defaultPalette) as Array<keyof OrbPalette>) {
    const value = palette[role];
    if (typeof value === "string" && value.trim().length > 0) {
      merged[role] = value;
    }
  }
  return merged;
}

// Quantize alpha to 1/ALPHA_STEPS discrete levels so adjacent cells with
// nearly-equal intensity produce the same color string. Enables color-run
// batching in the DOM renderer. 16 steps is well below perceptual threshold.
const ALPHA_STEPS = 16;

function quantizeAlpha(alpha: number): number {
  return Math.round(clamp(alpha, 0, 1) * ALPHA_STEPS) / ALPHA_STEPS;
}

export function withAlpha(color: string, alpha: number): string {
  const quantized = quantizeAlpha(alpha);
  if (/^--[-\w]+$/.test(color)) {
    return `hsl(var(${color}) / ${quantized.toFixed(3)})`;
  }

  const hslVarMatch = color.match(/^hsl\(var\((--[-\w]+)\)\)$/);
  if (hslVarMatch) {
    return `hsl(var(${hslVarMatch[1]}) / ${quantized.toFixed(3)})`;
  }

  const percentage = quantized * 100;
  return `color-mix(in srgb, ${color} ${percentage.toFixed(2)}%, transparent)`;
}

// One formula, zero variant knowledge: the variant's color spec arrives in
// the input, so the compiler-checked table in variants.ts is the only place
// a variant's look is defined.
export const defaultColorizer: OrbColorizer = ({
  intensity,
  detail,
  colors,
  palette
}) => {
  const alpha = clamp(0.08 + intensity * 0.92, 0, 1);

  if (intensity > 0.95) {
    return withAlpha(palette.foreground, alpha);
  }

  const stop = detail > colors.threshold ? colors.high : colors.low;
  return withAlpha(
    palette[stop.role],
    clamp(alpha * (stop.mult ?? 1), stop.min ?? 0, 1)
  );
};

export function getColorForOrb(
  input: OrbColorizerInput,
  colorizer?: OrbColorizer
): string {
  return (colorizer ?? defaultColorizer)(input);
}

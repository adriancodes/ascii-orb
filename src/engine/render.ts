import { getColorForOrb, mergePalette } from "./color";
import { clamp, smoothstep } from "./math";
import { rippleContribution } from "./ripple";
import type { OrbFrame, OrbRenderOptions } from "./types";
import { resolveVariantDefinition } from "./variants";

const GAMMA_LUT_SIZE = 1024;
const GAMMA_LUT_MAX = GAMMA_LUT_SIZE - 1;
const GAMMA_EXPONENT = 0.84;
const gammaLut = new Float32Array(GAMMA_LUT_SIZE);
for (let i = 0; i < GAMMA_LUT_SIZE; i += 1) {
  gammaLut[i] = Math.pow(i / GAMMA_LUT_MAX, GAMMA_EXPONENT);
}

export function renderOrbFrame(options: OrbRenderOptions): OrbFrame {
  const {
    timeSeconds,
    width,
    height,
    xScale = 1.08,
    variant = "aether",
    variantConfig,
    customVariants,
    fallbackVariant = "aether",
    ripples = [],
    palette,
    colorizer,
    intensityMultiplier = 1
  } = options;

  // Ripple centers arrive in unit space (-1..1 over the rendered bounds);
  // map them into orb space with the same aspect correction the grid gets.
  const orbSpaceRipples =
    ripples.length === 0
      ? ripples
      : ripples.map((ripple) => ({ ...ripple, x: ripple.x * xScale }));

  const frame: OrbFrame = [];
  const resolvedVariant = resolveVariantDefinition(
    variant,
    customVariants,
    fallbackVariant
  );
  const config = variantConfig
    ? {
        ...resolvedVariant.config,
        ...variantConfig
      }
    : resolvedVariant.config;
  const charRamp = config.chars.trimStart() || ".";
  const resolvedPalette = mergePalette(palette);

  const spin = timeSeconds * config.spin;
  const c = Math.cos(spin);
  const s = Math.sin(spin);
  // Two-band breathing: a primary pulse at ~innerPulse and a slower swell
  // at ~1/6 that rate. The ratio is irrational so the envelopes never
  // perfectly re-align — the orb never settles into an obvious periodic loop.
  const breath =
    1 +
    0.045 * Math.sin(timeSeconds * config.innerPulse * 0.72) +
    0.018 * Math.sin(timeSeconds * config.innerPulse * 0.17 + 1.3);

  for (let row = 0; row < height; row += 1) {
    const line: OrbFrame[number] = [];

    for (let col = 0; col < width; col += 1) {
      const nx = (col / (width - 1)) * 2 - 1;
      const ny = (row / (height - 1)) * 2 - 1;

      // Terminal character cells are wider than tall.
      const x = (nx * xScale) / breath;
      const y = ny / breath;
      // Small latitude compensation keeps north/south edges from appearing flattened
      // at typical terminal grid densities.
      const ySphere = y * (1 - 0.055 * Math.pow(Math.abs(y), 1.6));
      const r2 = x * x + ySphere * ySphere;
      const r = Math.sqrt(r2);

      if (r > 1.2) {
        line.push({ char: " ", color: "transparent" });
        continue;
      }

      const z = Math.sqrt(Math.max(0, 1 - Math.min(1, r2)));

      const ux = x * c - z * s;
      const uz = x * s + z * c;
      const angle = Math.atan2(ySphere, x);

      const bands =
        0.5 +
        0.5 *
        Math.sin(ux * config.bandFreq + ySphere * (5.6 + config.turbulence) + timeSeconds * 2.3);
      const swirls =
        0.5 +
        0.5 *
        Math.cos(angle * 8.2 - timeSeconds * 2 + uz * 5.1 + Math.sin(ySphere * 5.2));
      const fragmented =
        0.5 +
        0.5 * Math.sin(angle * config.swirlFreq + timeSeconds * (1.1 + config.turbulence) + r * 8.8);
      const wisps =
        0.5 +
        0.5 *
        Math.cos((x + ySphere) * (4.6 + config.turbulence) - timeSeconds * (1.7 + config.turbulence));

      const detail = 0.34 * bands + 0.28 * swirls + 0.2 * fragmented + 0.18 * wisps;

      const lightX = -0.36;
      const lightY = -0.14;
      const lightZ = 0.92;
      const lambert = clamp((x * lightX + ySphere * lightY + z * lightZ) * 0.5 + 0.5, 0, 1);

      const bodyMask = clamp(1 - smoothstep(0.85, 1, r), 0, 1);
      const innerOrb =
        Math.exp(-Math.pow(r / config.innerRadius, 2) * config.innerSharpness) * config.coreBoost;
      const ringRadius = 0.54 + 0.06 * Math.sin(timeSeconds * config.shellDrift + angle * 2.1);
      const shellWave = Math.exp(-Math.pow(r - ringRadius, 2) / 0.016) * config.rimBoost;
      const rimGlow = smoothstep(0.72, 0.995, r) * config.rimBoost;
      const halo = r > 1 ? clamp(1 - smoothstep(1, 1.2, r), 0, 1) * config.haloBoost : 0;
      const ripple = rippleContribution(x, ySphere, timeSeconds, orbSpaceRipples);

      let intensity =
        (0.15 + lambert * 0.43 + detail * 0.32 + innerOrb + shellWave + rimGlow + ripple) * bodyMask +
        halo;

      intensity += 0.028 * Math.sin(timeSeconds * (6.2 + config.turbulence) + angle * 3.4);
      intensity -= config.gloom * smoothstep(0, 0.56, r);
      intensity = clamp(intensity * intensityMultiplier, 0, 1);
      intensity = gammaLut[(intensity * GAMMA_LUT_MAX) | 0];

      const charIndex = Math.floor(intensity * (charRamp.length - 1));
      const char = intensity > 0.02 ? (charRamp[charIndex] ?? charRamp[charRamp.length - 1]) : " ";
      const color = getColorForOrb(
        {
          variant: resolvedVariant.id,
          colorVariant: resolvedVariant.colorVariant,
          intensity,
          detail,
          colors: resolvedVariant.colors,
          palette: resolvedPalette
        },
        colorizer
      );

      line.push({ char, color });
    }

    frame.push(line);
  }

  return frame;
}

export function frameToText(frame: OrbFrame): string {
  return frame.map((row) => row.map((cell) => cell.char).join("")).join("\n");
}

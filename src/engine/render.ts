import { getColorForOrb, mergePalette, withAlpha } from "./color";
import { clamp, smoothstep } from "./math";
import { rippleContribution } from "./ripple";
import type { OrbFrame, OrbRenderOptions } from "./types";
import { resolveVariantDefinition } from "./variants";

const GAMMA_LUT_SIZE = 1024;
const GAMMA_LUT_MAX = GAMMA_LUT_SIZE - 1;
const GAMMA_EXPONENT = 0.84;
// Keep the r <= 1.2 corona inside the frame even at maximum breathing.
const FRAME_EXTENT = 1.42;
const RIPPLE_SAMPLE_STEP = 0.025;
const RIPPLE_REFRACTION = 0.28;
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
      : ripples.map((ripple) => ({
          ...ripple,
          x: ripple.x * xScale * FRAME_EXTENT,
          y: ripple.y * FRAME_EXTENT
        }));

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
      const nx = ((col / (width - 1)) * 2 - 1) * FRAME_EXTENT;
      const ny = ((row / (height - 1)) * 2 - 1) * FRAME_EXTENT;

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

      const ripple = rippleContribution(x, ySphere, timeSeconds, orbSpaceRipples);
      const rippleDx =
        orbSpaceRipples.length === 0
          ? 0
          : rippleContribution(x + RIPPLE_SAMPLE_STEP, ySphere, timeSeconds, orbSpaceRipples) -
            rippleContribution(x - RIPPLE_SAMPLE_STEP, ySphere, timeSeconds, orbSpaceRipples);
      const rippleDy =
        orbSpaceRipples.length === 0
          ? 0
          : rippleContribution(x, ySphere + RIPPLE_SAMPLE_STEP, timeSeconds, orbSpaceRipples) -
            rippleContribution(x, ySphere - RIPPLE_SAMPLE_STEP, timeSeconds, orbSpaceRipples);
      const surfaceX = x - rippleDx * RIPPLE_REFRACTION;
      const surfaceY = ySphere - rippleDy * RIPPLE_REFRACTION;
      const surfaceR2 = surfaceX * surfaceX + surfaceY * surfaceY;
      const z = Math.sqrt(Math.max(0, 1 - Math.min(1, surfaceR2)));

      const ux = surfaceX * c - z * s;
      const uz = surfaceX * s + z * c;
      const angle = Math.atan2(surfaceY, surfaceX);

      const bands =
        0.5 +
        0.5 *
        Math.sin(ux * config.bandFreq + surfaceY * (5.6 + config.turbulence) + timeSeconds * 2.3);
      const swirls =
        0.5 +
        0.5 *
        Math.cos(angle * 8.2 - timeSeconds * 2 + uz * 5.1 + Math.sin(surfaceY * 5.2));
      const fragmented =
        0.5 +
        0.5 * Math.sin(angle * config.swirlFreq + timeSeconds * (1.1 + config.turbulence) + r * 8.8);
      const wisps =
        0.5 +
        0.5 *
        Math.cos(
          (surfaceX + surfaceY) * (4.6 + config.turbulence) -
            timeSeconds * (1.7 + config.turbulence)
        );

      const detail = 0.34 * bands + 0.28 * swirls + 0.2 * fragmented + 0.18 * wisps;

      const lightX = -0.36;
      const lightY = -0.14;
      const lightZ = 0.92;
      const lambert = clamp(
        (surfaceX * lightX + surfaceY * lightY + z * lightZ) * 0.5 + 0.5,
        0,
        1
      );

      const bodyMask = clamp(1 - smoothstep(0.85, 1, r), 0, 1);
      const innerOrb =
        Math.exp(-Math.pow(r / config.innerRadius, 2) * config.innerSharpness) * config.coreBoost;
      const ringRadius = 0.54 + 0.06 * Math.sin(timeSeconds * config.shellDrift + angle * 2.1);
      const shellWave = Math.exp(-Math.pow(r - ringRadius, 2) / 0.016) * config.rimBoost;
      const rimGlow = smoothstep(0.72, 0.995, r) * config.rimBoost;
      const halo = r > 1 ? clamp(1 - smoothstep(1, 1.2, r), 0, 1) * config.haloBoost : 0;
      let intensity =
        (0.15 + lambert * 0.43 + detail * 0.32 + innerOrb + shellWave + rimGlow + ripple) * bodyMask +
        halo;

      intensity += 0.028 * Math.sin(timeSeconds * (6.2 + config.turbulence) + angle * 3.4);
      intensity -= config.gloom * smoothstep(0, 0.56, r);
      intensity = clamp(intensity * intensityMultiplier, 0, 1);
      intensity = gammaLut[(intensity * GAMMA_LUT_MAX) | 0];

      const charIndex = Math.floor(intensity * (charRamp.length - 1));
      const rippleCrest = !colorizer && ripple > 0.12;
      const char = rippleCrest
        ? "@"
        : intensity > 0.02
          ? (charRamp[charIndex] ?? charRamp[charRamp.length - 1])
          : " ";
      const color =
        rippleCrest
          ? withAlpha(resolvedPalette.foreground, 1)
          : getColorForOrb(
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

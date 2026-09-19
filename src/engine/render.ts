import { getColorForOrb, mergePalette } from "./color";
import { clamp, smoothstep } from "./math";
import { prepareRipples, sampleRippleField } from "./ripple";
import type { OrbFrame, OrbRenderOptions } from "./types";
import { resolveVariantDefinition } from "./variants";

const GAMMA_LUT_SIZE = 1024;
const GAMMA_LUT_MAX = GAMMA_LUT_SIZE - 1;
const GAMMA_EXPONENT = 0.84;
// Keep the r <= 1.2 corona inside the frame even at maximum breathing.
const FRAME_EXTENT = 1.42;
// Displace the running surface texture; the silhouette stays fixed.
const RIPPLE_REFRACTION = 0.025;
const gammaLut = new Float32Array(GAMMA_LUT_SIZE);
for (let i = 0; i < GAMMA_LUT_SIZE; i += 1) {
  gammaLut[i] = Math.pow(i / GAMMA_LUT_MAX, GAMMA_EXPONENT);
}

export function getOrbBreath(timeSeconds: number, innerPulse: number): number {
  return 1 +
    0.045 * Math.sin(timeSeconds * innerPulse * 0.72) +
    0.018 * Math.sin(timeSeconds * innerPulse * 0.17 + 1.3);
}

function latitude(y: number): number {
  return y * (1 - 0.055 * Math.pow(Math.abs(y), 1.6));
}

// Shared projection for pointer hits and impact origins, including frame padding.
export function projectOrbPoint(x: number, y: number, breath: number, xScale = 1.08) {
  return { x: x * FRAME_EXTENT * xScale / breath, y: latitude(y * FRAME_EXTENT / breath) };
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
  const orbSpaceRipples = ripples.map(ripple => ({
    ...ripple,
    ...projectOrbPoint(ripple.x, ripple.y, getOrbBreath(ripple.start, config.innerPulse), xScale)
  })).filter(ripple => ripple.x * ripple.x + ripple.y * ripple.y <= 1);
  const waves = prepareRipples(orbSpaceRipples, timeSeconds);

  const spin = timeSeconds * config.spin;
  const c = Math.cos(spin);
  const s = Math.sin(spin);
  // Two-band breathing: a primary pulse at ~innerPulse and a slower swell
  // at ~1/6 that rate. The ratio is irrational so the envelopes never
  // perfectly re-align — the orb never settles into an obvious periodic loop.
  const breath = getOrbBreath(timeSeconds, config.innerPulse);

  for (let row = 0; row < height; row += 1) {
    const line: OrbFrame[number] = [];
    const ny = ((row / (height - 1)) * 2 - 1) * FRAME_EXTENT;
    const y = ny / breath;
    // Latitude is constant across a row; compute its correction once.
    const ySphere = latitude(y);

    for (let col = 0; col < width; col += 1) {
      const nx = ((col / (width - 1)) * 2 - 1) * FRAME_EXTENT;

      // Correct the grid's horizontal aspect ratio.
      const x = (nx * xScale) / breath;
      const r2 = x * x + ySphere * ySphere;
      const r = Math.sqrt(r2);

      if (r > 1.2) {
        line.push({ char: " ", color: "transparent" });
        continue;
      }

      const bodyMask = clamp(1 - smoothstep(0.85, 1, r), 0, 1);
      // Impacts disturb only the planet's body, fading before the halo.
      const field = waves.length && r < 1 ? sampleRippleField(x, ySphere, waves) : undefined;
      const ripple = field?.value ?? 0;
      const rippleDx = field?.dx ?? 0;
      const rippleDy = field?.dy ?? 0;
      const surfaceX = x - rippleDx * RIPPLE_REFRACTION * bodyMask;
      const surfaceY = ySphere - rippleDy * RIPPLE_REFRACTION * bodyMask;
      const surfaceR2 = surfaceX * surfaceX + surfaceY * surfaceY;
      const surfaceR = Math.sqrt(surfaceR2);
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
        0.5 * Math.sin(angle * config.swirlFreq + timeSeconds * (1.1 + config.turbulence) + surfaceR * 8.8);
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

      const innerOrb =
        Math.exp(-Math.pow(surfaceR / config.innerRadius, 2) * config.innerSharpness) * config.coreBoost;
      const ringRadius = 0.54 + 0.06 * Math.sin(timeSeconds * config.shellDrift + angle * 2.1);
      const shellWave = Math.exp(-Math.pow(surfaceR - ringRadius, 2) / 0.016) * config.rimBoost;
      const rimGlow = smoothstep(0.72, 0.995, surfaceR) * config.rimBoost;
      const halo = r > 1 ? clamp(1 - smoothstep(1, 1.2, r), 0, 1) * config.haloBoost : 0;
      let intensity =
        (0.15 + lambert * 0.43 + detail * 0.32 + innerOrb + shellWave + rimGlow + ripple) * bodyMask +
        halo;

      intensity += 0.028 * Math.sin(timeSeconds * (6.2 + config.turbulence) + angle * 3.4);
      intensity -= config.gloom * smoothstep(0, 0.56, r);
      intensity = clamp(intensity * intensityMultiplier, 0, 1);
      intensity = gammaLut[(intensity * GAMMA_LUT_MAX) | 0];

      const charIndex = Math.floor(intensity * (charRamp.length - 1));
      const char = intensity > 0.02
        ? (charRamp[charIndex] ?? charRamp[charRamp.length - 1])
        : " ";
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

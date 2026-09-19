import { clamp } from "./math";
import type { OrbRipple } from "./types";

// x and y are unit space (-1..1 over the rendered bounds) — pass pointer
// coordinates straight through; the renderer applies the aspect correction.
export function createRipple(input: {
  x: number;
  y: number;
  timeSeconds: number;
  duration?: number;
  speed?: number;
  strength?: number;
}): OrbRipple {
  return {
    id: input.timeSeconds * 1000 + Math.random(),
    x: input.x,
    y: input.y,
    start: input.timeSeconds,
    duration: input.duration,
    speed: input.speed,
    strength: input.strength
  };
}

export function pruneRipples(ripples: OrbRipple[], timeSeconds: number): OrbRipple[] {
  if (ripples.length === 0) {
    return ripples;
  }

  let expiredIndex = -1;
  for (let i = 0; i < ripples.length; i += 1) {
    const duration = ripples[i].duration ?? 1.9;
    if (timeSeconds - ripples[i].start > duration) {
      expiredIndex = i;
      break;
    }
  }

  if (expiredIndex === -1) {
    return ripples;
  }

  return ripples.filter((ripple) => {
    const duration = ripple.duration ?? 1.9;
    return timeSeconds - ripple.start <= duration;
  });
}

export function rippleContribution(
  x: number,
  y: number,
  timeSeconds: number,
  ripples: OrbRipple[]
): number {
  return sampleRippleField(x, y, prepareRipples(ripples, timeSeconds)).value;
}

type RippleWave = { x: number; y: number; radius: number; amplitude: number };

// Lifetime, radius, and fade are shared by every cell in a frame.
export function prepareRipples(ripples: OrbRipple[], timeSeconds: number): RippleWave[] {
  const waves: RippleWave[] = [];
  for (const ripple of ripples) {
    const duration = ripple.duration ?? 1.9;
    const age = timeSeconds - ripple.start;
    if (!(duration > 0) || age < 0 || age > duration) continue;
    const fade = clamp(1 - age / duration, 0, 1);
    waves.push({
      x: ripple.x,
      y: ripple.y,
      radius: age * (ripple.speed ?? 1.25),
      amplitude: fade * fade * (ripple.strength ?? 0.56)
    });
  }
  return waves;
}

// The radial derivative gives refraction in the same pass as brightness,
// avoiding four extra wave samples per cell. Symmetry gives zero slope at the center.
export function sampleRippleField(x: number, y: number, waves: RippleWave[]) {
  let value = 0;
  let dx = 0;
  let dy = 0;
  for (const wave of waves) {
    const offsetX = x - wave.x;
    const offsetY = y - wave.y;
    const distance = Math.sqrt(offsetX * offsetX + offsetY * offsetY);
    const crestOffset = distance - wave.radius;
    const leadingRing = Math.exp(-(crestOffset * crestOffset) / 0.013);
    const troughRadius = wave.radius - 0.11;
    const troughOffset = distance - troughRadius;
    const trailingTrough =
      troughRadius > 0
        ? Math.exp(-(troughOffset * troughOffset) / 0.009) * 0.78
        : 0;
    value += (leadingRing - trailingTrough) * wave.amplitude;
    if (distance > 0) {
      const slope = (-2 * crestOffset * leadingRing / 0.013 +
        2 * troughOffset * trailingTrough / 0.009) * wave.amplitude / distance;
      dx += slope * offsetX;
      dy += slope * offsetY;
    }
  }
  return { value, dx, dy };
}

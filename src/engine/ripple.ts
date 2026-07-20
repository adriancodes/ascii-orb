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
  let value = 0;

  for (const ripple of ripples) {
    const duration = ripple.duration ?? 1.9;
    const speed = ripple.speed ?? 1.25;
    const strength = ripple.strength ?? 0.56;

    const age = timeSeconds - ripple.start;
    if (age < 0 || age > duration) {
      continue;
    }

    const radius = age * speed;
    const distance = Math.sqrt((x - ripple.x) ** 2 + (y - ripple.y) ** 2);
    // Ease-out-quadratic envelope: ripple starts at full intensity, decays
    // softly instead of the old linear fade. Matches how real surface waves
    // attenuate — most of the energy is visible in the first third of life.
    const linearFade = clamp(1 - age / duration, 0, 1);
    const envelope = linearFade * linearFade;
    const leadingRing = Math.exp(-Math.pow(distance - radius, 2) / 0.013);
    // A dark trough behind the bright crest makes the wave readable against
    // the orb's own animated texture instead of looking like extra turbulence.
    const troughRadius = radius - 0.11;
    const trailingTrough =
      troughRadius > 0
        ? Math.exp(-Math.pow(distance - troughRadius, 2) / 0.009) * 0.78
        : 0;

    value += (leadingRing - trailingTrough) * envelope * strength;
  }

  return value;
}

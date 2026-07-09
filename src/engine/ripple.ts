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
    // A secondary ring trailing slightly inside the leading edge produces
    // a faint "wake" — reads as a real expanding disturbance rather than
    // a hard circular line.
    const wakeRadius = radius - 0.09;
    const wakeRing =
      wakeRadius > 0
        ? Math.exp(-Math.pow(distance - wakeRadius, 2) / 0.022) * 0.4
        : 0;

    value += (leadingRing + wakeRing) * envelope * strength;
  }

  return value;
}

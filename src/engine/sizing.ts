import { clamp } from "./math";
import type { OrbGridSize, OrbSizingOptions } from "./types";

// Single source for sizing defaults — wrappers must not restate these.
export const DEFAULT_ORB_SIZING = {
  baseWidth: 58,
  baseHeight: 30,
  minWidth: 26,
  minHeight: 14,
  maxCells: 5200,
  minScale: 0.45,
  maxScale: 2.8
} as const;

export function computeResponsiveGridSize(options: OrbSizingOptions): OrbGridSize {
  const {
    containerWidth,
    containerHeight,
    charWidth,
    lineHeight,
    baseWidth = DEFAULT_ORB_SIZING.baseWidth,
    baseHeight = DEFAULT_ORB_SIZING.baseHeight,
    minWidth = DEFAULT_ORB_SIZING.minWidth,
    minHeight = DEFAULT_ORB_SIZING.minHeight,
    maxCells = DEFAULT_ORB_SIZING.maxCells,
    minScale = DEFAULT_ORB_SIZING.minScale,
    maxScale = DEFAULT_ORB_SIZING.maxScale
  } = options;

  if (containerWidth <= 0 || containerHeight <= 0 || charWidth <= 0 || lineHeight <= 0) {
    return { width: baseWidth, height: baseHeight };
  }

  const basePxWidth = baseWidth * charWidth * 1.06;
  const basePxHeight = baseHeight * lineHeight;

  const rawScale = Math.min(containerWidth / basePxWidth, containerHeight / basePxHeight);
  const scale = clamp(rawScale, minScale, maxScale);

  let width = Math.max(minWidth, Math.round(baseWidth * scale));
  let height = Math.max(minHeight, Math.round(baseHeight * scale));

  if (width * height > maxCells) {
    const ratio = Math.sqrt(maxCells / (width * height));
    width = Math.max(minWidth, Math.floor(width * ratio));
    height = Math.max(minHeight, Math.floor(height * ratio));
  }

  return { width, height };
}

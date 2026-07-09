// Public /core entry: the headless engine. Framework-free — safe to use
// server-side or outside React entirely.
export { renderOrbFrame, frameToText } from "./engine/render";
export { createRipple, pruneRipples, rippleContribution } from "./engine/ripple";
export { computeResponsiveGridSize, DEFAULT_ORB_SIZING } from "./engine/sizing";
export {
  defaultColorizer,
  defaultPalette,
  getColorForOrb,
  mergePalette,
  withAlpha
} from "./engine/color";
export {
  createVariantConfig,
  getVariantConfig,
  isBuiltInOrbVariant,
  resolveVariantDefinition
} from "./engine/variants";
export { clamp, smoothstep } from "./engine/math";
export type {
  OrbCell,
  OrbColorizer,
  OrbColorizerInput,
  OrbColorSpec,
  OrbColorStop,
  OrbCustomVariants,
  OrbFrame,
  OrbGridSize,
  OrbPalette,
  OrbPaletteRole,
  OrbRenderOptions,
  OrbResolvedVariant,
  OrbRipple,
  OrbSizingOptions,
  OrbVariant,
  OrbVariantConfig,
  OrbVariantDefinition,
  OrbVariantId,
  OrbVariantMeta,
  OrbVariantRow
} from "./engine/types";

// Public root entry: everything needed to use and customize the component.
// The frame-level engine lives at "ascii-orb/core".
export { AsciiOrb } from "./ascii-orb";
export type { AsciiOrbProps } from "./ascii-orb";
export {
  defineOrbVariant,
  getVariantMeta,
  listVariantIds,
  orbVariantConfig,
  orbVariantMeta,
  orbVariantTable
} from "./engine/variants";
export { orbVariants } from "./engine/types";
export type {
  OrbColorSpec,
  OrbColorStop,
  OrbColorizer,
  OrbColorizerInput,
  OrbCustomVariants,
  OrbPalette,
  OrbPaletteRole,
  OrbVariant,
  OrbVariantConfig,
  OrbVariantDefinition,
  OrbVariantId,
  OrbVariantMeta,
  OrbVariantRow
} from "./engine/types";

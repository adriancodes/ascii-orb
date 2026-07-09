export const orbVariants = [
  "ion",
  "pulse",
  "rift",
  "veil",
  "sigil",
  "eclipse",
  "aether",
  "quasar",
  "abyss",
  "wraith",
  "lattice",
  "ember",
  "nova",
  "oracle",
  "void",
  "glacier"
] as const;

export type OrbVariant = (typeof orbVariants)[number];
export type OrbVariantId = OrbVariant | (string & {});

export type OrbCell = {
  char: string;
  color: string;
};

export type OrbFrame = OrbCell[][];

export type OrbVariantMeta = {
  label: string;
  description: string;
};

export type OrbVariantConfig = {
  chars: string;
  spin: number;
  bandFreq: number;
  swirlFreq: number;
  turbulence: number;
  coreBoost: number;
  rimBoost: number;
  innerRadius: number;
  innerSharpness: number;
  innerPulse: number;
  shellDrift: number;
  haloBoost: number;
  gloom: number;
};

export type OrbVariantDefinition = {
  baseVariant?: OrbVariant;
  colorVariant?: OrbVariant;
  config: Partial<OrbVariantConfig>;
  meta?: OrbVariantMeta;
};

export type OrbCustomVariants = Record<
  string,
  Partial<OrbVariantConfig> | OrbVariantDefinition
>;

export type OrbResolvedVariant = {
  id: OrbVariantId;
  baseVariant: OrbVariant;
  colorVariant: OrbVariant;
  config: OrbVariantConfig;
  colors: OrbColorSpec;
  meta: OrbVariantMeta;
  isCustom: boolean;
};

// One row fully defines a variant: identity is the key, look is the value.
export type OrbVariantRow = {
  meta: OrbVariantMeta;
  config: OrbVariantConfig;
  colors: OrbColorSpec;
};

// x and y are unit space: -1..1 over the orb's rendered bounds, no aspect
// correction. The renderer maps them into orb space itself.
export type OrbRipple = {
  id: number;
  x: number;
  y: number;
  start: number;
  duration?: number;
  speed?: number;
  strength?: number;
};

export type OrbPalette = {
  foreground: string;
  primary: string;
  accent: string;
  mutedForeground: string;
};

export type OrbPaletteRole = keyof OrbPalette;

// One side of a color spec: which palette role to paint with, and how the
// cell's alpha is attenuated (mult, then clamped up to min) on that side.
export type OrbColorStop = {
  role: OrbPaletteRole;
  mult?: number;
  min?: number;
};

// A variant's color treatment: cells whose detail exceeds the threshold
// take the high stop, the rest take the low stop.
export type OrbColorSpec = {
  threshold: number;
  high: OrbColorStop;
  low: OrbColorStop;
};

export type OrbColorizerInput = {
  variant: OrbVariantId;
  colorVariant: OrbVariant;
  intensity: number;
  detail: number;
  colors: OrbColorSpec;
  palette: OrbPalette;
};

export type OrbColorizer = (input: OrbColorizerInput) => string;

export type OrbRenderOptions = {
  timeSeconds: number;
  width: number;
  height: number;
  xScale?: number;
  variant?: OrbVariantId;
  variantConfig?: Partial<OrbVariantConfig>;
  customVariants?: OrbCustomVariants;
  fallbackVariant?: OrbVariant;
  ripples?: OrbRipple[];
  palette?: Partial<OrbPalette>;
  colorizer?: OrbColorizer;
  intensityMultiplier?: number;
};

export type OrbSizingOptions = {
  containerWidth: number;
  containerHeight: number;
  charWidth: number;
  lineHeight: number;
  baseWidth?: number;
  baseHeight?: number;
  minWidth?: number;
  minHeight?: number;
  maxCells?: number;
  minScale?: number;
  maxScale?: number;
};

export type OrbGridSize = {
  width: number;
  height: number;
};

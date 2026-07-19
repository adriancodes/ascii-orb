import {
  orbVariants,
  type OrbCustomVariants,
  type OrbColorSpec,
  type OrbResolvedVariant,
  type OrbVariant,
  type OrbVariantConfig,
  type OrbVariantDefinition,
  type OrbVariantId,
  type OrbVariantMeta,
  type OrbVariantRow
} from "./types";

// The color treatment shared by variants without a bespoke spec.
const defaultColors: OrbColorSpec = {
  threshold: 0.58,
  high: { role: "accent" },
  low: { role: "primary" }
};

// One row fully defines a variant. `satisfies` keeps the table total: a
// missing or extra variant id is a compile error, and the colorizer needs
// no variant knowledge of its own.
export const orbVariantTable = {
  ion: {
    meta: {
      label: "Ion",
      description: "Balanced plasma flow with clean edges."
    },
    config: {
      chars: " .,:;irsXA253hMHGS#9B&@",
      spin: 0.86,
      bandFreq: 10.8,
      swirlFreq: 8.4,
      turbulence: 1,
      coreBoost: 0.26,
      rimBoost: 0.31,
      innerRadius: 0.37,
      innerSharpness: 3.1,
      innerPulse: 1.4,
      shellDrift: 1.3,
      haloBoost: 0.16,
      gloom: 0.08
    },
    colors: defaultColors
  },
  pulse: {
    meta: {
      label: "Pulse",
      description: "Energetic, noisy, and high-frequency motion."
    },
    config: {
      chars: " .`'^\",:;Il!i~+_-?][}{1)(|\\/*tfxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$",
      spin: 1.25,
      bandFreq: 14.2,
      swirlFreq: 10.1,
      turbulence: 1.35,
      coreBoost: 0.38,
      rimBoost: 0.39,
      innerRadius: 0.33,
      innerSharpness: 3.8,
      innerPulse: 2.3,
      shellDrift: 2.15,
      haloBoost: 0.18,
      gloom: 0.05
    },
    colors: defaultColors
  },
  rift: {
    meta: {
      label: "Rift",
      description: "Sharpened shell with fractured inner turbulence."
    },
    config: {
      chars: " .:-=+*#%@",
      spin: 0.58,
      bandFreq: 8.2,
      swirlFreq: 14.6,
      turbulence: 0.9,
      coreBoost: 0.19,
      rimBoost: 0.46,
      innerRadius: 0.28,
      innerSharpness: 4.5,
      innerPulse: 1,
      shellDrift: 0.8,
      haloBoost: 0.2,
      gloom: 0.14
    },
    colors: defaultColors
  },
  veil: {
    meta: {
      label: "Veil",
      description: "Soft ghost glow and diffuse ethereal body."
    },
    config: {
      chars: " ....::::----====++++****####",
      spin: 0.43,
      bandFreq: 6.3,
      swirlFreq: 7.8,
      turbulence: 0.64,
      coreBoost: 0.14,
      rimBoost: 0.22,
      innerRadius: 0.46,
      innerSharpness: 2.2,
      innerPulse: 0.8,
      shellDrift: 0.6,
      haloBoost: 0.27,
      gloom: 0.18
    },
    colors: {
      threshold: 0.54,
      high: { role: "accent" },
      low: { role: "foreground", mult: 0.82, min: 0.05 }
    }
  },
  sigil: {
    meta: {
      label: "Sigil",
      description: "Rune-like patterns with arcane ring behavior."
    },
    config: {
      chars: " .:-+*xXoO0Q#",
      spin: 0.78,
      bandFreq: 12.4,
      swirlFreq: 18.2,
      turbulence: 1.06,
      coreBoost: 0.22,
      rimBoost: 0.52,
      innerRadius: 0.25,
      innerSharpness: 5.2,
      innerPulse: 1.6,
      shellDrift: 1.6,
      haloBoost: 0.19,
      gloom: 0.11
    },
    colors: defaultColors
  },
  eclipse: {
    meta: {
      label: "Eclipse",
      description: "Dark core with bright rim halo contrast."
    },
    config: {
      chars: "   ...::--==++***###@@",
      spin: 0.34,
      bandFreq: 5.4,
      swirlFreq: 6.8,
      turbulence: 0.72,
      coreBoost: 0.08,
      rimBoost: 0.61,
      innerRadius: 0.2,
      innerSharpness: 6.5,
      innerPulse: 0.9,
      shellDrift: 0.42,
      haloBoost: 0.23,
      gloom: 0.25
    },
    colors: {
      threshold: 0.6,
      high: { role: "foreground" },
      low: { role: "mutedForeground" }
    }
  },
  aether: {
    meta: {
      label: "Aether",
      description: "Dreamy cloud orb with slow mysterious drift."
    },
    config: {
      chars: "  ..,,::;;iI1ttffLLCCGG88##",
      spin: 0.52,
      bandFreq: 9.5,
      swirlFreq: 11.7,
      turbulence: 0.78,
      coreBoost: 0.17,
      rimBoost: 0.29,
      innerRadius: 0.41,
      innerSharpness: 2.6,
      innerPulse: 1.05,
      shellDrift: 0.94,
      haloBoost: 0.33,
      gloom: 0.1
    },
    colors: {
      threshold: 0.54,
      high: { role: "accent" },
      low: { role: "foreground", mult: 0.82, min: 0.05 }
    }
  },
  quasar: {
    meta: {
      label: "Quasar",
      description: "High-spin stellar core with bright radial flares."
    },
    config: {
      chars: "  ..,:;=+*xX$#@",
      spin: 1.52,
      bandFreq: 16.1,
      swirlFreq: 22.4,
      turbulence: 1.48,
      coreBoost: 0.44,
      rimBoost: 0.42,
      innerRadius: 0.31,
      innerSharpness: 4.2,
      innerPulse: 2.45,
      shellDrift: 2.32,
      haloBoost: 0.21,
      gloom: 0.06
    },
    colors: {
      threshold: 0.5,
      high: { role: "foreground" },
      low: { role: "primary", mult: 0.9, min: 0.05 }
    }
  },
  abyss: {
    meta: {
      label: "Abyss",
      description: "Subdued void center and razor-bright event horizon."
    },
    config: {
      chars: "    ..,,::--==++**##",
      spin: 0.22,
      bandFreq: 4.9,
      swirlFreq: 9.7,
      turbulence: 0.58,
      coreBoost: 0.05,
      rimBoost: 0.68,
      innerRadius: 0.18,
      innerSharpness: 7.4,
      innerPulse: 0.56,
      shellDrift: 0.36,
      haloBoost: 0.19,
      gloom: 0.31
    },
    colors: {
      threshold: 0.7,
      high: { role: "foreground" },
      low: { role: "mutedForeground", mult: 0.76, min: 0.04 }
    }
  },
  wraith: {
    meta: {
      label: "Wraith",
      description: "Whisper-soft shell with spectral interior breathing."
    },
    config: {
      chars: "   ...`'::;;iiIttfLL",
      spin: 0.37,
      bandFreq: 7.2,
      swirlFreq: 12.6,
      turbulence: 0.66,
      coreBoost: 0.12,
      rimBoost: 0.23,
      innerRadius: 0.48,
      innerSharpness: 2.1,
      innerPulse: 0.74,
      shellDrift: 0.51,
      haloBoost: 0.38,
      gloom: 0.16
    },
    colors: {
      threshold: 0.54,
      high: { role: "accent" },
      low: { role: "foreground", mult: 0.82, min: 0.05 }
    }
  },
  lattice: {
    meta: {
      label: "Lattice",
      description: "Crystalline, grid-like shell with geometric pulse."
    },
    config: {
      chars: " .:-=+xX[]{}#%@",
      spin: 0.91,
      bandFreq: 13.4,
      swirlFreq: 19.3,
      turbulence: 1.2,
      coreBoost: 0.27,
      rimBoost: 0.47,
      innerRadius: 0.29,
      innerSharpness: 5.8,
      innerPulse: 1.73,
      shellDrift: 1.94,
      haloBoost: 0.15,
      gloom: 0.12
    },
    colors: {
      threshold: 0.58,
      high: { role: "accent" },
      low: { role: "primary" }
    }
  },
  ember: {
    meta: {
      label: "Ember",
      description: "Molten heart with volatile sparks at the rim."
    },
    config: {
      chars: "  ..::--==++**xX#%@",
      spin: 0.67,
      bandFreq: 11.8,
      swirlFreq: 13.9,
      turbulence: 1.14,
      coreBoost: 0.33,
      rimBoost: 0.35,
      innerRadius: 0.35,
      innerSharpness: 3.9,
      innerPulse: 1.89,
      shellDrift: 1.46,
      haloBoost: 0.22,
      gloom: 0.09
    },
    colors: {
      threshold: 0.62,
      high: { role: "primary" },
      low: { role: "accent", mult: 0.88, min: 0.05 }
    }
  },
  nova: {
    meta: {
      label: "Nova",
      description: "Explosive shell bursts and bright stellar spikes."
    },
    config: {
      chars: "  .,:;=+*xX$#%@",
      spin: 1.68,
      bandFreq: 18.4,
      swirlFreq: 24.9,
      turbulence: 1.65,
      coreBoost: 0.51,
      rimBoost: 0.49,
      innerRadius: 0.27,
      innerSharpness: 4.8,
      innerPulse: 2.9,
      shellDrift: 2.55,
      haloBoost: 0.24,
      gloom: 0.04
    },
    colors: {
      threshold: 0.56,
      high: { role: "foreground" },
      low: { role: "accent", mult: 0.94, min: 0.05 }
    }
  },
  oracle: {
    meta: {
      label: "Oracle",
      description: "Measured arcane pulses with deliberate ring cadence."
    },
    config: {
      chars: "  ..,,::;;iI1tLCOQ#",
      spin: 0.74,
      bandFreq: 11.2,
      swirlFreq: 17.4,
      turbulence: 0.93,
      coreBoost: 0.24,
      rimBoost: 0.44,
      innerRadius: 0.31,
      innerSharpness: 5.1,
      innerPulse: 1.35,
      shellDrift: 1.72,
      haloBoost: 0.2,
      gloom: 0.11
    },
    colors: {
      threshold: 0.55,
      high: { role: "accent" },
      low: { role: "primary", mult: 0.86, min: 0.05 }
    }
  },
  void: {
    meta: {
      label: "Void",
      description: "Sparse dark mass with hard, gravitational edge contrast."
    },
    config: {
      chars: "    ...::--==+*#",
      spin: 0.18,
      bandFreq: 3.7,
      swirlFreq: 8.8,
      turbulence: 0.46,
      coreBoost: 0.02,
      rimBoost: 0.73,
      innerRadius: 0.16,
      innerSharpness: 8.2,
      innerPulse: 0.42,
      shellDrift: 0.29,
      haloBoost: 0.12,
      gloom: 0.36
    },
    colors: {
      threshold: 0.74,
      high: { role: "foreground", mult: 0.85, min: 0.05 },
      low: { role: "mutedForeground", mult: 0.72, min: 0.03 }
    }
  },
  glacier: {
    meta: {
      label: "Glacier",
      description: "Cool layered gradients with calm deep-core drift."
    },
    config: {
      chars: "  ..,,::;;iI1ttLLCCGG##",
      spin: 0.4,
      bandFreq: 8.6,
      swirlFreq: 9.9,
      turbulence: 0.62,
      coreBoost: 0.21,
      rimBoost: 0.3,
      innerRadius: 0.44,
      innerSharpness: 2.35,
      innerPulse: 0.88,
      shellDrift: 0.7,
      haloBoost: 0.35,
      gloom: 0.13
    },
    colors: {
      threshold: 0.53,
      high: { role: "foreground" },
      low: { role: "primary", mult: 0.84, min: 0.05 }
    }
  }
} satisfies Record<OrbVariant, OrbVariantRow>;

function deriveView<K extends keyof OrbVariantRow>(
  key: K
): Record<OrbVariant, OrbVariantRow[K]> {
  return Object.fromEntries(
    orbVariants.map((variant) => [variant, orbVariantTable[variant][key]])
  ) as Record<OrbVariant, OrbVariantRow[K]>;
}

// Derived views over the table, kept for the existing public interface.
export const orbVariantMeta: Record<OrbVariant, OrbVariantMeta> = deriveView("meta");
export const orbVariantConfig: Record<OrbVariant, OrbVariantConfig> =
  deriveView("config");

export function isBuiltInOrbVariant(value: string): value is OrbVariant {
  return Object.hasOwn(orbVariantTable, value);
}

function isVariantDefinition(
  value: Partial<OrbVariantConfig> | OrbVariantDefinition
): value is OrbVariantDefinition {
  return Object.hasOwn(value, "config");
}

export function getVariantConfig(
  variant: OrbVariant,
  overrides?: Partial<OrbVariantConfig>
): OrbVariantConfig {
  if (!overrides) {
    return orbVariantTable[variant].config;
  }

  return {
    ...orbVariantTable[variant].config,
    ...overrides
  };
}

// Merge overrides onto a base config, dropping values that would render the
// orb invisible or corrupt the math: non-finite numbers (NaN propagates
// through every cell) and empty character sets fall back to the base value.
export function createVariantConfig(
  baseVariant: OrbVariant,
  overrides: Partial<OrbVariantConfig>
): OrbVariantConfig {
  const base = orbVariantTable[baseVariant].config;
  const merged: OrbVariantConfig = { ...base };
  for (const key of Object.keys(base) as Array<keyof OrbVariantConfig>) {
    const value = overrides[key];
    if (key === "chars") {
      if (typeof value === "string" && value.length > 0) {
        merged.chars = value;
      }
    } else if (typeof value === "number" && Number.isFinite(value)) {
      merged[key] = value;
    }
  }
  return merged;
}

export function defineOrbVariant(definition: OrbVariantDefinition): OrbVariantDefinition {
  return definition;
}

export function listVariantIds(customVariants?: OrbCustomVariants): string[] {
  const customIds = customVariants ? Object.keys(customVariants) : [];
  return [...Object.keys(orbVariantTable), ...customIds];
}

export function getVariantMeta(
  variant: OrbVariantId,
  customVariants?: OrbCustomVariants,
  fallbackVariant: OrbVariant = "aether"
): OrbVariantMeta {
  return resolveVariantDefinition(variant, customVariants, fallbackVariant).meta;
}

export function resolveVariantDefinition(
  variant: OrbVariantId,
  customVariants?: OrbCustomVariants,
  fallbackVariant: OrbVariant = "aether"
): OrbResolvedVariant {
  const variantId = String(variant);

  if (isBuiltInOrbVariant(variantId)) {
    const row = orbVariantTable[variantId];
    return {
      id: variantId,
      baseVariant: variantId,
      colorVariant: variantId,
      config: row.config,
      colors: row.colors,
      meta: row.meta,
      isCustom: false
    };
  }

  const custom = customVariants?.[variantId];
  if (!custom) {
    const row = orbVariantTable[fallbackVariant];
    return {
      id: fallbackVariant,
      baseVariant: fallbackVariant,
      colorVariant: fallbackVariant,
      config: row.config,
      colors: row.colors,
      meta: row.meta,
      isCustom: false
    };
  }

  let baseVariant = fallbackVariant;
  let colorVariant = fallbackVariant;
  let meta: OrbVariantMeta | undefined;
  let configOverride: Partial<OrbVariantConfig>;

  if (isVariantDefinition(custom)) {
    baseVariant = custom.baseVariant ?? fallbackVariant;
    colorVariant = custom.colorVariant ?? baseVariant;
    meta = custom.meta;
    configOverride = custom.config;
  } else {
    configOverride = custom;
  }

  return {
    id: variantId,
    baseVariant,
    colorVariant,
    config: createVariantConfig(baseVariant, configOverride),
    colors: orbVariantTable[colorVariant].colors,
    meta: meta ?? {
      label: variantId,
      description: `Custom variant based on ${baseVariant}.`
    },
    isCustom: true
  };
}

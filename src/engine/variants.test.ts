import { describe, expect, it } from "vitest";
import {
  getVariantMeta,
  listVariantIds,
  orbVariantConfig,
  orbVariantMeta,
  resolveVariantDefinition
} from "./variants";
import { orbVariants } from "./types";

describe("resolveVariantDefinition", () => {
  it("resolves a built-in variant to its own config, meta, and color identity", () => {
    const resolved = resolveVariantDefinition("eclipse");
    expect(resolved).toEqual({
      id: "eclipse",
      baseVariant: "eclipse",
      colorVariant: "eclipse",
      config: orbVariantConfig.eclipse,
      colors: {
        threshold: 0.6,
        high: { role: "foreground" },
        low: { role: "mutedForeground" }
      },
      meta: orbVariantMeta.eclipse,
      isCustom: false
    });
  });

  it("falls back for an unknown variant id", () => {
    const resolved = resolveVariantDefinition("does-not-exist");
    expect(resolved.id).toBe("aether");
    expect(resolved.config).toEqual(orbVariantConfig.aether);
    expect(resolved.isCustom).toBe(false);
  });

  it("honours an explicit fallbackVariant", () => {
    const resolved = resolveVariantDefinition("does-not-exist", undefined, "void");
    expect(resolved.id).toBe("void");
    expect(resolved.config).toEqual(orbVariantConfig.void);
  });

  it("merges a bare partial config over the fallback's config", () => {
    const resolved = resolveVariantDefinition(
      "mine",
      { mine: { spin: 9 } },
      "ion"
    );
    expect(resolved.isCustom).toBe(true);
    expect(resolved.baseVariant).toBe("ion");
    expect(resolved.colorVariant).toBe("ion");
    expect(resolved.config).toEqual({ ...orbVariantConfig.ion, spin: 9 });
    expect(resolved.meta).toEqual({
      label: "mine",
      description: "Custom variant based on ion."
    });
  });

  it("supports a full definition with color borrowing", () => {
    const resolved = resolveVariantDefinition("nebula", {
      nebula: {
        baseVariant: "aether",
        colorVariant: "veil",
        meta: { label: "Nebula", description: "Test." },
        config: { turbulence: 2 }
      }
    });
    expect(resolved.baseVariant).toBe("aether");
    expect(resolved.colorVariant).toBe("veil");
    expect(resolved.config).toEqual({ ...orbVariantConfig.aether, turbulence: 2 });
    // Color borrowing: the resolved colors are veil's spec, not aether's config.
    expect(resolved.colors).toEqual({
      threshold: 0.54,
      high: { role: "accent" },
      low: { role: "foreground", mult: 0.82, min: 0.05 }
    });
    expect(resolved.meta).toEqual({ label: "Nebula", description: "Test." });
    expect(resolved.isCustom).toBe(true);
  });

  it("defaults a definition's colorVariant to its baseVariant", () => {
    const resolved = resolveVariantDefinition("dark", {
      dark: { baseVariant: "void", config: {} }
    });
    expect(resolved.colorVariant).toBe("void");
  });
});

describe("variant listings", () => {
  it("lists all built-in ids in table order, then customs", () => {
    expect(listVariantIds()).toEqual([...orbVariants]);
    expect(listVariantIds({ extra: { spin: 1 } })).toEqual([
      ...orbVariants,
      "extra"
    ]);
  });

  it("exposes meta for every built-in variant", () => {
    for (const variant of orbVariants) {
      const meta = getVariantMeta(variant);
      expect(meta.label.length).toBeGreaterThan(0);
      expect(meta.description.length).toBeGreaterThan(0);
    }
  });
});

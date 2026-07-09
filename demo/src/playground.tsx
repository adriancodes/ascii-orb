import { useState } from "react";
import {
  AsciiOrb,
  defineOrbVariant,
  listVariantIds,
  type OrbPalette,
  type OrbVariantId
} from "ascii-orb";
import { ACCENT, cardStyle, mutedStyle, pageStyle } from "./theme";

// A custom variant in the picker doubles as living documentation for
// defineOrbVariant: aether physics wearing veil's colors.
const customVariants = {
  nebula: defineOrbVariant({
    baseVariant: "aether",
    colorVariant: "veil",
    meta: {
      label: "Nebula",
      description: "Custom variant example — aether physics, veil colors."
    },
    config: { spin: 0.34, turbulence: 0.56, haloBoost: 0.43 }
  })
};

const variantIds = listVariantIds(customVariants);

const DEFAULT_PALETTE: OrbPalette = {
  foreground: "#6b7280",
  primary: "#64748b",
  accent: "#7c3aed",
  mutedForeground: "#57606a"
};

const PALETTE_ROLES = [
  "foreground",
  "primary",
  "accent",
  "mutedForeground"
] as const;

const FPS_CHOICES = [12, 30, 60] as const;

export function Playground() {
  const [variant, setVariant] = useState<OrbVariantId>("aether");
  const [palette, setPalette] = useState<OrbPalette>(DEFAULT_PALETTE);
  const [fps, setFps] = useState<number>(30);

  return (
    <main style={{ ...pageStyle, display: "flex", flexDirection: "column" }}>
      <header style={{ marginBottom: 16 }}>
        <a href="#" style={{ color: ACCENT }}>
          ← showcase
        </a>
        <h1 style={{ margin: "8px 0 0", fontSize: 22 }}>playground</h1>
        <p style={{ ...mutedStyle, margin: "4px 0 0", fontSize: 13 }}>
          click the orb for ripples
        </p>
      </header>
      <div style={{ display: "flex", gap: 20, flex: 1, minHeight: "65vh" }}>
        <div style={{ ...cardStyle, flex: 1, minWidth: 0 }}>
          <AsciiOrb
            variant={variant}
            customVariants={customVariants}
            palette={palette}
            fps={fps}
          />
        </div>
        <aside
          style={{ width: 260, display: "flex", flexDirection: "column", gap: 20 }}
        >
          <label style={{ display: "block" }}>
            <div style={{ ...mutedStyle, fontSize: 12, marginBottom: 6 }}>
              variant
            </div>
            <select
              value={String(variant)}
              onChange={(e) => setVariant(e.target.value)}
              style={{
                width: "100%",
                background: "#161b22",
                color: "#e6edf3",
                border: "1px solid #21262d",
                borderRadius: 6,
                padding: "8px 10px",
                fontFamily: "inherit"
              }}
            >
              {variantIds.map((id) => (
                <option key={id} value={id}>
                  {id}
                </option>
              ))}
            </select>
          </label>

          <fieldset style={{ border: "1px solid #21262d", borderRadius: 6, padding: 12 }}>
            <legend style={{ ...mutedStyle, fontSize: 12, padding: "0 6px" }}>
              palette
            </legend>
            {PALETTE_ROLES.map((role) => (
              <label
                key={role}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: 12,
                  margin: "6px 0"
                }}
              >
                {role}
                <input
                  type="color"
                  value={palette[role]}
                  onChange={(e) =>
                    setPalette((p) => ({ ...p, [role]: e.target.value }))
                  }
                />
              </label>
            ))}
          </fieldset>

          <fieldset style={{ border: "1px solid #21262d", borderRadius: 6, padding: 12 }}>
            <legend style={{ ...mutedStyle, fontSize: 12, padding: "0 6px" }}>
              fps
            </legend>
            <div style={{ display: "flex", gap: 12 }}>
              {FPS_CHOICES.map((choice) => (
                <label key={choice} style={{ fontSize: 13 }}>
                  <input
                    type="radio"
                    name="fps"
                    checked={fps === choice}
                    onChange={() => setFps(choice)}
                  />{" "}
                  {choice}
                </label>
              ))}
            </div>
          </fieldset>
        </aside>
      </div>
    </main>
  );
}

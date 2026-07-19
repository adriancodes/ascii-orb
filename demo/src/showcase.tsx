import { useState } from "react";
import {
  AsciiOrb,
  getVariantMeta,
  orbVariants,
  type OrbPalette
} from "ascii-orb";
import { ACCENT, cardStyle, mutedStyle, pageStyle } from "./theme";

const COLOR_SCHEMES = {
  default: {
    label: "Default violet",
    palette: undefined
  },
  ember: {
    label: "Ember",
    palette: {
      foreground: "#fed7aa",
      primary: "#ea580c",
      accent: "#facc15",
      mutedForeground: "#9a3412"
    }
  },
  ocean: {
    label: "Ocean",
    palette: {
      foreground: "#cffafe",
      primary: "#0891b2",
      accent: "#38bdf8",
      mutedForeground: "#155e75"
    }
  },
  forest: {
    label: "Forest",
    palette: {
      foreground: "#dcfce7",
      primary: "#16a34a",
      accent: "#a3e635",
      mutedForeground: "#166534"
    }
  },
  rose: {
    label: "Rose",
    palette: {
      foreground: "#ffe4e6",
      primary: "#e11d48",
      accent: "#fb7185",
      mutedForeground: "#9f1239"
    }
  }
} satisfies Record<string, { label: string; palette: OrbPalette | undefined }>;

type ColorScheme = keyof typeof COLOR_SCHEMES;

// Landing view: every built-in variant animating live — a visitor sees what
// the orbs look like before reading a single line of docs.
export function Showcase() {
  const [colorScheme, setColorScheme] = useState<ColorScheme>("default");
  const palette = COLOR_SCHEMES[colorScheme].palette;

  return (
    <main style={pageStyle}>
      <header style={{ textAlign: "center", marginBottom: 40 }}>
        <h1 style={{ margin: 0, fontSize: 30, letterSpacing: "-0.02em" }}>
          ascii-orb
        </h1>
        <p style={{ ...mutedStyle, margin: "8px 0 16px" }}>
          Animated ASCII orb component for React — 16 variants, ripples, fully
          customizable.
        </p>
        <code
          style={{
            background: "#161b22",
            border: "1px solid #21262d",
            borderRadius: 6,
            padding: "6px 12px"
          }}
        >
          npm install ascii-orb
        </code>
        <p style={{ marginTop: 16 }}>
          <a href="#playground" style={{ color: ACCENT }}>
            open the playground →
          </a>
        </p>
        <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <span style={{ ...mutedStyle, fontSize: 13 }}>color scheme</span>
          <select
            aria-label="color scheme"
            value={colorScheme}
            onChange={(event) =>
              setColorScheme(event.target.value as ColorScheme)
            }
            style={{
              background: "#161b22",
              color: "#e6edf3",
              border: "1px solid #21262d",
              borderRadius: 6,
              padding: "6px 10px",
              fontFamily: "inherit"
            }}
          >
            {Object.entries(COLOR_SCHEMES).map(([id, scheme]) => (
              <option key={id} value={id}>
                {scheme.label}
              </option>
            ))}
          </select>
        </label>
      </header>
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))",
          gap: 16,
          maxWidth: 1240,
          margin: "0 auto"
        }}
      >
        {orbVariants.map((variant) => {
          const meta = getVariantMeta(variant);
          return (
            <figure key={variant} style={cardStyle}>
              <div style={{ height: 210 }}>
                <AsciiOrb
                  variant={variant}
                  palette={palette}
                  width={40}
                  height={19}
                  style={{ fontSize: 10, lineHeight: "10px" }}
                />
              </div>
              <figcaption style={{ textAlign: "center", marginTop: 8 }}>
                <strong>{meta.label}</strong>
                <div style={{ ...mutedStyle, fontSize: 12, marginTop: 4 }}>
                  {meta.description}
                </div>
              </figcaption>
            </figure>
          );
        })}
      </section>
    </main>
  );
}

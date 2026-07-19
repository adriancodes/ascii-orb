import { useState } from "react";
import {
  AsciiOrb,
  getVariantMeta,
  orbVariants,
  type OrbPalette
} from "ascii-orb";
import { cardStyle, mutedStyle, pageStyle } from "./theme";

const COLOR_SCHEMES = {
  default: {
    label: "Default violet",
    palette: undefined,
    ui: {
      background: "#0d1117",
      surface: "#161b22",
      border: "#21262d",
      text: "#e6edf3",
      muted: "#8b949e",
      accent: "#7c3aed"
    }
  },
  ember: {
    label: "Ember",
    palette: {
      foreground: "#fed7aa",
      primary: "#ea580c",
      accent: "#facc15",
      mutedForeground: "#9a3412"
    },
    ui: {
      background: "#1c0f0a",
      surface: "#2b160f",
      border: "#5a2d1b",
      text: "#ffedd5",
      muted: "#d6a27d",
      accent: "#fb923c"
    }
  },
  ocean: {
    label: "Ocean",
    palette: {
      foreground: "#cffafe",
      primary: "#0891b2",
      accent: "#38bdf8",
      mutedForeground: "#155e75"
    },
    ui: {
      background: "#071a24",
      surface: "#0d2733",
      border: "#164e63",
      text: "#cffafe",
      muted: "#67a9ba",
      accent: "#22d3ee"
    }
  },
  forest: {
    label: "Forest",
    palette: {
      foreground: "#dcfce7",
      primary: "#16a34a",
      accent: "#a3e635",
      mutedForeground: "#166534"
    },
    ui: {
      background: "#08170d",
      surface: "#102519",
      border: "#245c36",
      text: "#dcfce7",
      muted: "#82b492",
      accent: "#84cc16"
    }
  },
  rose: {
    label: "Rose",
    palette: {
      foreground: "#4c0519",
      primary: "#be123c",
      accent: "#f43f5e",
      mutedForeground: "#9f1239"
    },
    ui: {
      background: "#fff1f2",
      surface: "#ffffff",
      border: "#fecdd3",
      text: "#4c0519",
      muted: "#9f1239",
      accent: "#e11d48"
    }
  }
} satisfies Record<
  string,
  {
    label: string;
    palette: OrbPalette | undefined;
    ui: Record<
      "background" | "surface" | "border" | "text" | "muted" | "accent",
      string
    >;
  }
>;

type ColorScheme = keyof typeof COLOR_SCHEMES;

// Landing view: every built-in variant animating live — a visitor sees what
// the orbs look like before reading a single line of docs.
export function Showcase() {
  const [colorScheme, setColorScheme] = useState<ColorScheme>("default");
  const scheme = COLOR_SCHEMES[colorScheme];

  return (
    <main
      style={{
        ...pageStyle,
        background: scheme.ui.background,
        color: scheme.ui.text
      }}
    >
      <header style={{ textAlign: "center", marginBottom: 40 }}>
        <h1 style={{ margin: 0, fontSize: 30, letterSpacing: "-0.02em" }}>
          ascii-orb
        </h1>
        <p
          style={{
            ...mutedStyle,
            color: scheme.ui.muted,
            margin: "8px 0 16px"
          }}
        >
          Animated ASCII orb component for React — 16 variants, ripples, fully
          customizable.
        </p>
        <code
          style={{
            background: scheme.ui.surface,
            border: `1px solid ${scheme.ui.border}`,
            borderRadius: 6,
            padding: "6px 12px"
          }}
        >
          npm install ascii-orb
        </code>
        <p style={{ marginTop: 16 }}>
          <a href="#playground" style={{ color: scheme.ui.accent }}>
            open the playground →
          </a>
        </p>
        <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <span
            style={{ ...mutedStyle, color: scheme.ui.muted, fontSize: 13 }}
          >
            color scheme
          </span>
          <select
            aria-label="color scheme"
            value={colorScheme}
            onChange={(event) =>
              setColorScheme(event.target.value as ColorScheme)
            }
            style={{
              background: scheme.ui.surface,
              color: scheme.ui.text,
              border: `1px solid ${scheme.ui.border}`,
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
        <p style={{ color: scheme.ui.muted, margin: "12px 0 0", fontSize: 12 }}>
          click any orb to ripple
        </p>
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
            <figure
              key={variant}
              style={{
                ...cardStyle,
                background: scheme.ui.surface,
                border: `1px solid ${scheme.ui.border}`
              }}
            >
              <div style={{ height: 210 }}>
                <AsciiOrb
                  variant={variant}
                  palette={scheme.palette}
                  rippleDuration={2.4}
                  rippleStrength={1.2}
                  width={40}
                  height={19}
                  style={{ fontSize: 10, lineHeight: "10px" }}
                />
              </div>
              <figcaption style={{ textAlign: "center", marginTop: 8 }}>
                <strong>{meta.label}</strong>
                <div
                  style={{
                    ...mutedStyle,
                    color: scheme.ui.muted,
                    fontSize: 12,
                    marginTop: 4
                  }}
                >
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

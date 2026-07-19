import type { CSSProperties } from "react";
import type { OrbPalette } from "ascii-orb";

export const COLOR_SCHEMES = {
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

export type ColorScheme = keyof typeof COLOR_SCHEMES;
export type DemoTheme = (typeof COLOR_SCHEMES)[ColorScheme];

// Shared layout defaults for both demo views.
export const MONO =
  'ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace';

export const ACCENT = "#7c3aed";

export const pageStyle: CSSProperties = {
  minHeight: "100%",
  background: "#0d1117",
  color: "#e6edf3",
  fontFamily: MONO,
  padding: "40px 24px 64px",
  boxSizing: "border-box"
};

export const cardStyle: CSSProperties = {
  margin: 0,
  background: "#161b22",
  border: "1px solid #21262d",
  borderRadius: 8,
  padding: 12
};

export const mutedStyle: CSSProperties = {
  color: "#8b949e"
};

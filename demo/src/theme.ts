import type { CSSProperties } from "react";
import type { OrbPalette } from "ascii-orb";

export const COLOR_SCHEMES = {
  default: {
    label: "GitHub Dark",
    palette: {
      foreground: "#f0f6fc",
      primary: "#8b949e",
      accent: "#2f81f7",
      mutedForeground: "#6e7681"
    },
    ui: {
      background: "#0d1117",
      surface: "#161b22",
      border: "#30363d",
      text: "#f0f6fc",
      muted: "#8b949e",
      accent: "#2f81f7"
    }
  },
  githubLight: {
    label: "GitHub Light",
    palette: {
      foreground: "#1f2328",
      primary: "#0969da",
      accent: "#8250df",
      mutedForeground: "#656d76"
    },
    ui: {
      background: "#ffffff",
      surface: "#f6f8fa",
      border: "#d0d7de",
      text: "#1f2328",
      muted: "#656d76",
      accent: "#0969da"
    }
  },
  dracula: {
    label: "Dracula",
    palette: {
      foreground: "#f8f8f2",
      primary: "#8be9fd",
      accent: "#bd93f9",
      mutedForeground: "#6272a4"
    },
    ui: {
      background: "#282a36",
      surface: "#44475a",
      border: "#6272a4",
      text: "#f8f8f2",
      muted: "#a9b2d0",
      accent: "#bd93f9"
    }
  },
  nord: {
    label: "Nord",
    palette: {
      foreground: "#eceff4",
      primary: "#88c0d0",
      accent: "#b48ead",
      mutedForeground: "#4c566a"
    },
    ui: {
      background: "#2e3440",
      surface: "#3b4252",
      border: "#4c566a",
      text: "#eceff4",
      muted: "#81a1c1",
      accent: "#88c0d0"
    }
  },
  solarizedDark: {
    label: "Solarized Dark",
    palette: {
      foreground: "#93a1a1",
      primary: "#2aa198",
      accent: "#268bd2",
      mutedForeground: "#586e75"
    },
    ui: {
      background: "#002b36",
      surface: "#073642",
      border: "#586e75",
      text: "#93a1a1",
      muted: "#839496",
      accent: "#268bd2"
    }
  },
  monokai: {
    label: "Monokai",
    palette: {
      foreground: "#f8f8f2",
      primary: "#66d9ef",
      accent: "#ae81ff",
      mutedForeground: "#75715e"
    },
    ui: {
      background: "#272822",
      surface: "#1e1f1c",
      border: "#414339",
      text: "#f8f8f2",
      muted: "#90908a",
      accent: "#a6e22e"
    }
  },
  tokyoNight: {
    label: "Tokyo Night",
    palette: {
      foreground: "#c0caf5",
      primary: "#7aa2f7",
      accent: "#bb9af7",
      mutedForeground: "#565f89"
    },
    ui: {
      background: "#1a1b26",
      surface: "#24283b",
      border: "#414868",
      text: "#c0caf5",
      muted: "#9aa5ce",
      accent: "#7aa2f7"
    }
  },
  catppuccinMocha: {
    label: "Catppuccin Mocha",
    palette: {
      foreground: "#cdd6f4",
      primary: "#89b4fa",
      accent: "#cba6f7",
      mutedForeground: "#6c7086"
    },
    ui: {
      background: "#1e1e2e",
      surface: "#313244",
      border: "#45475a",
      text: "#cdd6f4",
      muted: "#a6adc8",
      accent: "#cba6f7"
    }
  }
} satisfies Record<
  string,
  {
    label: string;
    palette: OrbPalette;
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

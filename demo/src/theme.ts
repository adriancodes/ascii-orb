import type { CSSProperties } from "react";

// Shared look for both demo views — dark, monospace, one accent.
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

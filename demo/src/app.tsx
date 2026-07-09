import { AsciiOrb } from "ascii-orb";
import type { CSSProperties } from "react";

const paneStyle: CSSProperties = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  minWidth: 0
};

const labelStyle: CSSProperties = {
  fontFamily: "monospace",
  textAlign: "center",
  margin: "16px 0 0"
};

// Slice-2 demo: the same component twice. Left pane is the whole point —
// zero props, zero host CSS, on a white page. Right pane proves theming
// still works via the palette prop.
export function App() {
  return (
    <div style={{ height: "100%", display: "flex" }}>
      <section style={{ ...paneStyle, background: "#ffffff" }}>
        <p style={{ ...labelStyle, color: "#24292f" }}>
          zero-config — {"<AsciiOrb />"} on a white page
        </p>
        <div style={{ flex: 1, minHeight: 0 }}>
          <AsciiOrb />
        </div>
      </section>
      <section style={{ ...paneStyle, background: "#0d1117" }}>
        <p style={{ ...labelStyle, color: "#e6edf3" }}>
          themed — palette prop, variant "nova"
        </p>
        <div style={{ flex: 1, minHeight: 0 }}>
          <AsciiOrb
            variant="nova"
            palette={{
              foreground: "#e6edf3",
              primary: "#7aa2f7",
              accent: "#bb9af7",
              mutedForeground: "#565f89"
            }}
          />
        </div>
      </section>
    </div>
  );
}

import { AsciiOrb } from "ascii-orb";

// Tracer demo: one orb with an explicit palette. The zero-config default
// look and the full showcase arrive in later slices.
export function App() {
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <p
        style={{
          color: "#e6edf3",
          fontFamily: "monospace",
          textAlign: "center",
          margin: "16px 0 0"
        }}
      >
        ascii-orb — tracer demo
      </p>
      <div style={{ flex: 1 }}>
        <AsciiOrb
          variant="aether"
          palette={{
            foreground: "#e6edf3",
            primary: "#7aa2f7",
            accent: "#bb9af7",
            mutedForeground: "#565f89"
          }}
          style={{ margin: 0, fontSize: 13, lineHeight: "13px" }}
        />
      </div>
    </div>
  );
}

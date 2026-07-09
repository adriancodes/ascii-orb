import { AsciiOrb, getVariantMeta, orbVariants } from "ascii-orb";
import { ACCENT, cardStyle, mutedStyle, pageStyle } from "./theme";

// Landing view: every built-in variant animating live — a visitor sees what
// the orbs look like before reading a single line of docs.
export function Showcase() {
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

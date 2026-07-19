import { AsciiOrb, getVariantMeta, orbVariants } from "ascii-orb";
import {
  COLOR_SCHEMES,
  cardStyle,
  mutedStyle,
  pageStyle,
  type ColorScheme
} from "./theme";

// Landing view: every built-in variant animating live — a visitor sees what
// the orbs look like before reading a single line of docs.
export function Showcase({
  colorScheme,
  onColorSchemeChange
}: {
  colorScheme: ColorScheme;
  onColorSchemeChange: (scheme: ColorScheme) => void;
}) {
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
              onColorSchemeChange(event.target.value as ColorScheme)
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

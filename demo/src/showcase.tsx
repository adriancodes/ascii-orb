import { AsciiOrb, getVariantMeta, orbVariants } from "ascii-orb";
import {
  cardStyle,
  mutedStyle,
  pageStyle,
  type ColorScheme,
  type DemoTheme
} from "./theme";
import { SiteHeader } from "./site-header";

// Landing view: every built-in variant animating live — a visitor sees what
// the orbs look like before reading a single line of docs.
export function Showcase({
  colorScheme,
  onColorSchemeChange,
  theme
}: {
  colorScheme: ColorScheme;
  onColorSchemeChange: (scheme: ColorScheme) => void;
  theme: DemoTheme;
}) {
  const scheme = theme;

  return (
    <main
      style={{
        ...pageStyle,
        background: scheme.ui.background,
        color: scheme.ui.text
      }}
    >
      <SiteHeader
        colorScheme={colorScheme}
        currentPage="showcase"
        onColorSchemeChange={onColorSchemeChange}
        theme={theme}
      />
      <section style={{ textAlign: "center", marginBottom: 40 }}>
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
        <p style={{ color: scheme.ui.muted, margin: "12px 0 0", fontSize: 12 }}>
          click an orb to ripple · use its edit link to customize it
        </p>
      </section>
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
                  fps={12}
                  rippleDuration={2.4}
                  rippleStrength={1.2}
                  reducedMotion="never"
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
                <a
                  href={`#playground/${variant}`}
                  style={{ color: scheme.ui.accent, fontSize: 12 }}
                >
                  edit in playground →
                </a>
              </figcaption>
            </figure>
          );
        })}
      </section>
    </main>
  );
}

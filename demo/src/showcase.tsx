import { useState } from "react";
import {
  AsciiOrb,
  getVariantMeta,
  orbVariants,
  type OrbVariantId
} from "ascii-orb";
import {
  cardStyle,
  mutedStyle,
  pageStyle,
  type ColorScheme,
  type DemoTheme
} from "./theme";
import { SiteHeader } from "./site-header";

const INSTALL_COMMAND = "npm install ascii-orb";

export function Showcase({
  colorScheme,
  onColorSchemeChange,
  theme
}: {
  colorScheme: ColorScheme;
  onColorSchemeChange: (scheme: ColorScheme) => void;
  theme: DemoTheme;
}) {
  const [selectedVariant, setSelectedVariant] =
    useState<OrbVariantId>("aether");
  const [copyStatus, setCopyStatus] = useState<
    "idle" | "copied" | "failed"
  >("idle");
  const selectedMeta = getVariantMeta(selectedVariant);
  const usageCode = `import { AsciiOrb } from "ascii-orb";

export function App() {
  return <AsciiOrb variant="${selectedVariant}" />;
}`;

  const copyInstallCommand = async () => {
    try {
      await navigator.clipboard.writeText(INSTALL_COMMAND);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("failed");
    }
  };

  return (
    <main
      style={{
        ...pageStyle,
        background: theme.ui.background,
        color: theme.ui.text
      }}
    >
      <div className="page-shell">
        <SiteHeader
          colorScheme={colorScheme}
          currentPage="showcase"
          onColorSchemeChange={onColorSchemeChange}
          theme={theme}
        />

        <section
          className="showcase-hero"
          style={{
            ...cardStyle,
            background: theme.ui.surface,
            border: `1px solid ${theme.ui.border}`
          }}
        >
          <div className="hero-orb" data-testid="hero-orb">
            <div className="hero-orb__stage">
              <AsciiOrb
                key={selectedVariant}
                variant={selectedVariant}
                palette={theme.palette}
                reducedMotion="system"
                rippleDuration={1.9}
                rippleSpeed={1.25}
                rippleStrength={1.1}
                width={56}
                height={27}
                style={{ fontSize: 10, lineHeight: "10px" }}
              />
            </div>
            <div
              className="hero-orb__hint"
              style={{ background: theme.ui.background, color: theme.ui.text }}
            >
              Click or tap inside the orb
            </div>
            <strong style={{ fontSize: 18 }}>{selectedMeta.label}</strong>
            <span style={{ ...mutedStyle, color: theme.ui.muted }}>
              {selectedMeta.description}
            </span>
          </div>

          <div className="hero-copy">
            <span className="eyebrow" style={{ color: theme.ui.accent }}>
              React component · zero required CSS
            </span>
            <h2 className="hero-title">Animated ASCII orbs that react.</h2>
            <p style={{ ...mutedStyle, color: theme.ui.muted }}>
              Sixteen built-in variants, click-driven surface ripples, responsive
              sizing, and copy-ready configuration.
            </p>

            <div
              className="install-command"
              style={{
                background: theme.ui.background,
                border: `1px solid ${theme.ui.border}`
              }}
            >
              <code>{INSTALL_COMMAND}</code>
              <button
                aria-label="Copy install command"
                className="button button--quiet touch-target"
                onClick={() => void copyInstallCommand()}
                style={{ color: theme.ui.accent }}
                type="button"
              >
                copy
              </button>
            </div>
            <div aria-live="polite" role="status" className="copy-status">
              {copyStatus === "copied"
                ? "Install command copied."
                : copyStatus === "failed"
                  ? "Copy failed. Select the command manually."
                  : ""}
            </div>

            <div className="hero-actions">
              <a
                className="button button--primary touch-target"
                data-testid="hero-customize"
                href={`#playground/${selectedVariant}`}
                style={{ background: theme.ui.accent, color: theme.ui.background }}
              >
                Customize this orb
              </a>
              <a
                className="button button--secondary touch-target"
                href="https://github.com/adriancodes/ascii-orb#readme"
                rel="noreferrer"
                style={{ borderColor: theme.ui.border, color: theme.ui.text }}
                target="_blank"
              >
                View documentation
              </a>
            </div>

            <pre
              className="usage-code"
              style={{
                background: theme.ui.background,
                border: `1px solid ${theme.ui.border}`,
                color: theme.ui.text
              }}
            >
              <code>{usageCode}</code>
            </pre>
          </div>
        </section>

        <section aria-labelledby="variant-heading" className="section-block">
          <div className="section-heading">
            <div>
              <span className="eyebrow" style={{ color: theme.ui.accent }}>
                Choose
              </span>
              <h2 id="variant-heading">Pick a starting point</h2>
            </div>
            <p style={{ ...mutedStyle, color: theme.ui.muted }}>
              Select a card to update the live hero preview.
            </p>
          </div>
          <div className="variant-grid">
            {orbVariants.map((variant) => {
              const meta = getVariantMeta(variant);
              const selected = variant === selectedVariant;
              return (
                <figure
                  key={variant}
                  style={{
                    ...cardStyle,
                    background: theme.ui.surface,
                    border: `1px solid ${selected ? theme.ui.accent : theme.ui.border}`
                  }}
                >
                  <button
                    aria-label={`Preview ${meta.label}`}
                    aria-pressed={selected}
                    className="variant-card"
                    data-variant={variant}
                    onClick={() => setSelectedVariant(variant)}
                    style={{ color: theme.ui.text }}
                    type="button"
                  >
                    <span className="variant-card__preview">
                      <AsciiOrb
                        variant={variant}
                        palette={theme.palette}
                        enableRipples={false}
                        fps={12}
                        reducedMotion="system"
                        width={38}
                        height={18}
                        style={{ fontSize: 9, lineHeight: "9px" }}
                      />
                    </span>
                    <strong>{meta.label}</strong>
                    <span style={{ color: theme.ui.muted }}>
                      {meta.description}
                    </span>
                  </button>
                  <a
                    className="variant-customize touch-target"
                    href={`#playground/${variant}`}
                    style={{ color: theme.ui.accent }}
                  >
                    Customize →
                  </a>
                </figure>
              );
            })}
          </div>
        </section>

        <section className="feature-strip" aria-label="library highlights">
          {[
            ["Zero required CSS", "Inline defaults; style it only when you want."],
            ["Responsive", "Scales to its container without canvas."],
            ["Motion-aware", "Respects the system reduced-motion preference."]
          ].map(([title, description]) => (
            <div
              key={title}
              style={{
                background: theme.ui.surface,
                border: `1px solid ${theme.ui.border}`
              }}
            >
              <strong>{title}</strong>
              <span style={{ color: theme.ui.muted }}>{description}</span>
            </div>
          ))}
        </section>

        <footer className="site-footer" style={{ borderColor: theme.ui.border }}>
          <span style={{ color: theme.ui.muted }}>MIT licensed · built for React</span>
          <div>
            <a
              href="https://github.com/adriancodes/ascii-orb"
              rel="noreferrer"
              style={{ color: theme.ui.accent }}
              target="_blank"
            >
              GitHub
            </a>
            <a
              href="https://www.npmjs.com/package/ascii-orb"
              rel="noreferrer"
              style={{ color: theme.ui.accent }}
              target="_blank"
            >
              npm
            </a>
          </div>
        </footer>
      </div>
    </main>
  );
}

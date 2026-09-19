import { useRef, useState, type CSSProperties } from "react";
import {
  AsciiOrb,
  getVariantMeta,
  orbVariants,
  type OrbVariantId
} from "ascii-orb";
import {
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
  const previewRef = useRef<HTMLDivElement>(null);
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
      className="showcase-page"
      style={{
        ...pageStyle,
        padding: "var(--showcase-page-padding)",
        "--showcase-border": theme.ui.border,
        "--showcase-surface": theme.ui.surface,
        "--showcase-muted": `color-mix(in srgb, ${theme.ui.muted} 80%, ${theme.ui.text})`,
        background: theme.ui.background,
        color: theme.ui.text
      } as CSSProperties}
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
          aria-labelledby="showcase-heading"
          style={{ borderColor: theme.ui.border }}
        >
          <div className="hero-copy">
            <span className="eyebrow">Animated ASCII for React</span>
            <h2 className="hero-title" id="showcase-heading">
              Small characters.<br /><span>Big presence.</span>
            </h2>
            <p>
              Sixteen living textures, made entirely of type. Click an orb to
              send a ripple through its surface. Then make it your own.
            </p>
          </div>

          <div className="hero-orb" data-testid="hero-orb" ref={previewRef}>
            <div className="hero-orb__toolbar">
              <span className="eyebrow">Interactive preview</span>
              <span className="hero-orb__index">
                {String(orbVariants.findIndex(variant => variant === selectedVariant) + 1).padStart(2, "0")} / 16
              </span>
            </div>
            <div className="hero-orb__stage">
              <AsciiOrb
                ariaHidden={false}
                key={selectedVariant}
                variant={selectedVariant}
                palette={theme.palette}
                reducedMotion="system"
                rippleDuration={1.9}
                rippleSpeed={1.25}
                rippleStrength={1.1}
                width={64}
                height={34}
                style={{ fontSize: "clamp(6px, 2.35cqw, 14px)", lineHeight: "1" }}
              />
            </div>
            <div className="hero-orb__caption" aria-live="polite">
              <div><strong>{selectedMeta.label}</strong><span>{selectedMeta.description}</span></div>
              <span className="hero-orb__hint">Click or tap inside the orb</span>
            </div>
          </div>
          <div className="hero-setup">
            <div className="hero-actions">
              <a
                className="button button--primary touch-target"
                data-testid="hero-customize"
                href={`#playground/${selectedVariant}`}
                style={{ background: theme.ui.text, color: theme.ui.background }}
              >
                Customize this orb <span aria-hidden="true">↗</span>
              </a>
              <a
                className="button button--quiet touch-target"
                href="https://github.com/adriancodes/ascii-orb#readme"
                rel="noreferrer"
                target="_blank"
              >
                Documentation <span aria-hidden="true">→</span>
              </a>
            </div>
            <div className="hero-install">
              <div className="install-command">
                <code><span aria-hidden="true">$ </span>{INSTALL_COMMAND}</code>
                <button
                  aria-label="Copy install command"
                  className="button button--quiet touch-target"
                  onClick={() => void copyInstallCommand()}
                  type="button"
                >
                  {copyStatus === "copied" ? "Copied ✓" : "Copy"}
                </button>
              </div>
              <div aria-live="polite" role="status" className="copy-status">
                {copyStatus === "copied"
                  ? "Install command copied."
                  : copyStatus === "failed"
                    ? "Copy failed. Select the command manually."
                    : ""}
              </div>
            </div>
            <div className="hero-facts">
              <span>16 variants</span><span>Zero required CSS</span><span>MIT licensed</span>
            </div>
          </div>
        </section>

        <div className="showcase-snippet">
          <span className="eyebrow">A few lines. A little life.</span>
          <pre className="usage-code"><code>{usageCode}</code></pre>
          <span className="showcase-snippet__note">Real text.<br />Ready for your interface.</span>
        </div>

        <section aria-labelledby="variant-heading" className="section-block">
          <div className="section-heading">
            <div>
              <span className="eyebrow">The collection / 16 variants</span>
              <h2 id="variant-heading">Find your atmosphere.</h2>
            </div>
            <p>Every orb is interactive. Click to ripple.<br />Preview a favorite, or jump straight into customizing.</p>
          </div>
          <div className="variant-grid">
            {orbVariants.map((variant, index) => {
              const meta = getVariantMeta(variant);
              const selected = variant === selectedVariant;
              return (
                <figure
                  key={variant}
                  className="variant-tile"
                  data-selected={selected}
                  style={{
                    background: theme.ui.surface,
                    border: `1px solid ${selected ? theme.ui.accent : theme.ui.border}`
                  }}
                >
                  <div className="variant-card__toolbar">
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    {selected && <span className="variant-card__selected">✓ In preview</span>}
                  </div>
                  <div className="variant-card__preview">
                    <AsciiOrb
                      ariaHidden={false}
                      variant={variant}
                      palette={theme.palette}
                      rippleStrength={1.1}
                      fps={30}
                      reducedMotion="system"
                      width={44}
                      height={23}
                      style={{ fontSize: "clamp(8px, 3.5cqw, 10px)", lineHeight: "1" }}
                    />
                  </div>
                  <figcaption>
                    <button
                      aria-label={`Preview ${meta.label}`}
                      aria-pressed={selected}
                      className="variant-card"
                      data-variant={variant}
                      onClick={() => {
                        setSelectedVariant(variant);
                        previewRef.current?.scrollIntoView({
                          block: "center",
                          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
                            ? "instant"
                            : "smooth"
                        });
                      }}
                      type="button"
                    >
                      <strong>{meta.label}</strong>
                      <span className="variant-card__preview-label">Preview ↑</span>
                    </button>
                    <p>{meta.description}</p>
                    <a
                      aria-label={`Customize ${meta.label}`}
                      className="variant-customize touch-target"
                      href={`#playground/${variant}`}
                    >
                      Customize <span aria-hidden="true">↗</span>
                    </a>
                  </figcaption>
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
              <span>{description}</span>
            </div>
          ))}
        </section>

        <footer className="site-footer" style={{ borderColor: theme.ui.border }}>
          <span>Made of characters. Built for React.</span>
          <div>
            <a
              href="https://github.com/adriancodes/ascii-orb"
              rel="noreferrer"
              target="_blank"
            >
              GitHub
            </a>
            <a
              href="https://www.npmjs.com/package/ascii-orb"
              rel="noreferrer"
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

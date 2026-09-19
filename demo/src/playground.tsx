import { useState, type ReactNode } from "react";
import {
  AsciiOrb,
  defineOrbVariant,
  listVariantIds,
  type OrbPalette,
  type OrbVariantId
} from "ascii-orb";
import {
  COLOR_SCHEMES,
  cardStyle,
  mutedStyle,
  pageStyle,
  type ColorScheme,
  type DemoTheme
} from "./theme";
import { SiteHeader } from "./site-header";

const customVariants = {
  nebula: defineOrbVariant({
    baseVariant: "aether",
    colorVariant: "veil",
    meta: {
      label: "Nebula",
      description: "Custom variant example — aether physics, veil colors."
    },
    config: { spin: 0.34, turbulence: 0.56, haloBoost: 0.43 }
  })
};

const variantIds = listVariantIds(customVariants);
const PALETTE_ROLES = [
  "foreground",
  "primary",
  "accent",
  "mutedForeground"
] as const;
const FPS_CHOICES = [12, 30, 60] as const;

type MotionPreference = "system" | "always" | "never";

function createImplementationCode({
  variant,
  palette,
  fps,
  enableRipples,
  rippleSpeed,
  rippleStrength,
  rippleDuration,
  motion
}: {
  variant: OrbVariantId;
  palette: OrbPalette;
  fps: number;
  enableRipples: boolean;
  rippleSpeed: number;
  rippleStrength: number;
  rippleDuration: number;
  motion: MotionPreference;
}): string {
  const isCustom = variant === "nebula";
  const customVariant = isCustom
    ? `
const customVariants = {
  nebula: defineOrbVariant({
    baseVariant: "aether",
    colorVariant: "veil",
    meta: { label: "Nebula", description: "Aether physics, veil colors." },
    config: { spin: 0.34, turbulence: 0.56, haloBoost: 0.43 }
  })
};
`
    : "";

  return `import { AsciiOrb${isCustom ? ", defineOrbVariant" : ""} } from "ascii-orb";
${customVariant}
export function MyOrb() {
  return (
    <AsciiOrb
      variant="${variant}"
${isCustom ? "      customVariants={customVariants}\n" : ""}      palette={{
        foreground: "${palette.foreground}",
        primary: "${palette.primary}",
        accent: "${palette.accent}",
        mutedForeground: "${palette.mutedForeground}"
      }}
      enableRipples={${enableRipples}}
      rippleSpeed={${rippleSpeed}}
      rippleStrength={${rippleStrength}}
      rippleDuration={${rippleDuration}}
      fps={${fps}}
      reducedMotion="${motion}"
    />
  );
}`;
}

function highlightCode(code: string, theme: DemoTheme): ReactNode[] {
  const pattern =
    /("(?:\\.|[^"\\])*")|(\b(?:import|from|export|function|const|return|true|false)\b)|(\b\d+(?:\.\d+)?\b)|(<\/?[A-Z]\w*)|(\b(?:variant|customVariants|palette|foreground|primary|accent|mutedForeground|enableRipples|rippleSpeed|rippleStrength|rippleDuration|fps|reducedMotion)\b(?==))|([{}[\](),;=/>])/g;
  const colors = [
    theme.palette.accent,
    theme.palette.primary,
    theme.ui.accent,
    theme.palette.foreground,
    theme.palette.primary,
    theme.ui.muted
  ];
  const highlighted: ReactNode[] = [];
  let cursor = 0;

  for (const [index, match] of [...code.matchAll(pattern)].entries()) {
    highlighted.push(code.slice(cursor, match.index));
    const token = match.slice(1).findIndex(Boolean);
    highlighted.push(
      <span key={index} data-token="syntax" style={{ color: colors[token] }}>
        {match[0]}
      </span>
    );
    cursor = match.index! + match[0].length;
  }
  highlighted.push(code.slice(cursor));
  return highlighted;
}

export function Playground({
  colorScheme,
  initialVariant,
  onColorSchemeChange,
  theme
}: {
  colorScheme: ColorScheme;
  initialVariant: OrbVariantId;
  onColorSchemeChange: (scheme: ColorScheme) => void;
  theme: DemoTheme;
}) {
  const [variant, setVariant] = useState<OrbVariantId>(initialVariant);
  const [palette, setPalette] = useState<OrbPalette>(theme.palette);
  const [palettePreset, setPalettePreset] = useState<ColorScheme | "custom">(
    colorScheme
  );
  const [fps, setFps] = useState<number>(30);
  const [enableRipples, setEnableRipples] = useState(true);
  const [rippleSpeed, setRippleSpeed] = useState(1.25);
  const [rippleStrength, setRippleStrength] = useState(1.1);
  const [rippleDuration, setRippleDuration] = useState(1.9);
  const [motion, setMotion] = useState<MotionPreference>("system");
  const [copyStatus, setCopyStatus] = useState<
    "idle" | "copied" | "failed"
  >("idle");

  const implementationCode = createImplementationCode({
    variant,
    palette,
    fps,
    enableRipples,
    rippleSpeed,
    rippleStrength,
    rippleDuration,
    motion
  });

  const markChanged = () => setCopyStatus("idle");
  const updatePalette = (role: (typeof PALETTE_ROLES)[number], value: string) => {
    setPalette((current) => ({ ...current, [role]: value }));
    setPalettePreset("custom");
    markChanged();
  };
  const copyImplementation = async () => {
    try {
      await navigator.clipboard.writeText(implementationCode);
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
          currentPage="playground"
          onColorSchemeChange={onColorSchemeChange}
          theme={theme}
        />

        <section className="section-heading playground-heading">
          <div>
            <span className="eyebrow" style={{ color: theme.ui.accent }}>
              Customize
            </span>
            <h2>Build your orb</h2>
          </div>
          <p style={{ ...mutedStyle, color: theme.ui.muted }}>
            Every control updates the live preview and implementation code.
          </p>
        </section>

        <div className="playground-layout">
          <section
            className="playground-preview"
            style={{
              ...cardStyle,
              background: theme.ui.surface,
              border: `1px solid ${theme.ui.border}`
            }}
          >
            <div className="playground-preview__stage">
              <AsciiOrb
                ariaHidden={false}
                variant={variant}
                customVariants={customVariants}
                palette={palette}
                fps={fps}
                enableRipples={enableRipples}
                rippleSpeed={rippleSpeed}
                rippleStrength={rippleStrength}
                rippleDuration={rippleDuration}
                reducedMotion={motion}
              />
            </div>
            <div className="playground-preview__caption">
              <strong>{variant}</strong>
              <span style={{ color: theme.ui.muted }}>
                {enableRipples
                  ? "Click or tap inside the orb to test the ripple."
                  : "Ripples are disabled in this configuration."}
              </span>
            </div>
          </section>

          <aside
            className="playground-controls"
            aria-label="orb controls"
          >
            <fieldset style={{ borderColor: theme.ui.border }}>
              <legend style={{ color: theme.ui.muted }}>Orb</legend>
              <label className="control-row control-row--stacked">
                <span>Variant</span>
                <select
                  value={String(variant)}
                  onChange={(event) => {
                    setVariant(event.target.value);
                    markChanged();
                  }}
                  style={{
                    background: theme.ui.surface,
                    borderColor: theme.ui.border,
                    color: theme.ui.text
                  }}
                >
                  {variantIds.map((id) => (
                    <option key={id} value={id}>
                      {id}
                    </option>
                  ))}
                </select>
              </label>
            </fieldset>

            <fieldset style={{ borderColor: theme.ui.border }}>
              <legend style={{ color: theme.ui.muted }}>Orb palette</legend>
              <label className="control-row control-row--stacked">
                <span>Palette preset</span>
                <select
                  aria-label="orb palette preset"
                  value={palettePreset}
                  onChange={(event) => {
                    const preset = event.target.value as ColorScheme;
                    setPalettePreset(preset);
                    setPalette(COLOR_SCHEMES[preset].palette);
                    markChanged();
                  }}
                  style={{
                    background: theme.ui.surface,
                    borderColor: theme.ui.border,
                    color: theme.ui.text
                  }}
                >
                  {palettePreset === "custom" ? (
                    <option value="custom" disabled>
                      Custom
                    </option>
                  ) : null}
                  {Object.entries(COLOR_SCHEMES).map(([id, preset]) => (
                    <option key={id} value={id}>
                      {preset.label}
                    </option>
                  ))}
                </select>
              </label>
              {PALETTE_ROLES.map((role) => (
                <label className="palette-row" key={role}>
                  <span>{role}</span>
                  <input
                    aria-label={`${role} color`}
                    type="color"
                    value={
                      /^#[0-9a-f]{6}$/i.test(palette[role])
                        ? palette[role]
                        : "#000000"
                    }
                    onChange={(event) => updatePalette(role, event.target.value)}
                  />
                  <input
                    aria-label={`${role} hex`}
                    className="hex-input"
                    type="text"
                    value={palette[role]}
                    onChange={(event) => updatePalette(role, event.target.value)}
                    style={{
                      background: theme.ui.surface,
                      borderColor: theme.ui.border,
                      color: theme.ui.text
                    }}
                  />
                </label>
              ))}
              <button
                className="button button--secondary touch-target"
                onClick={() => {
                  setPalette(theme.palette);
                  setPalettePreset(colorScheme);
                  markChanged();
                }}
                style={{ borderColor: theme.ui.border, color: theme.ui.text }}
                type="button"
              >
                Reset palette
              </button>
            </fieldset>

            <fieldset style={{ borderColor: theme.ui.border }}>
              <legend style={{ color: theme.ui.muted }}>Ripple</legend>
              <label className="toggle-row touch-target">
                <span>Enable ripples</span>
                <input
                  checked={enableRipples}
                  onChange={(event) => {
                    setEnableRipples(event.target.checked);
                    markChanged();
                  }}
                  type="checkbox"
                />
              </label>
              <label className="range-row">
                <span>
                  Ripple speed <output>{rippleSpeed.toFixed(2)}</output>
                </span>
                <input
                  aria-label="Ripple speed"
                  max="2.5"
                  min="0.25"
                  onChange={(event) => {
                    setRippleSpeed(Number(event.target.value));
                    markChanged();
                  }}
                  step="0.05"
                  type="range"
                  value={rippleSpeed}
                />
              </label>
              <label className="range-row">
                <span>
                  Ripple strength <output>{rippleStrength.toFixed(1)}</output>
                </span>
                <input
                  aria-label="Ripple strength"
                  max="2"
                  min="0.2"
                  onChange={(event) => {
                    setRippleStrength(Number(event.target.value));
                    markChanged();
                  }}
                  step="0.1"
                  type="range"
                  value={rippleStrength}
                />
              </label>
              <label className="range-row">
                <span>
                  Ripple duration <output>{rippleDuration.toFixed(1)}s</output>
                </span>
                <input
                  aria-label="Ripple duration"
                  max="4"
                  min="0.5"
                  onChange={(event) => {
                    setRippleDuration(Number(event.target.value));
                    markChanged();
                  }}
                  step="0.1"
                  type="range"
                  value={rippleDuration}
                />
              </label>
            </fieldset>

            <fieldset style={{ borderColor: theme.ui.border }}>
              <legend style={{ color: theme.ui.muted }}>Motion</legend>
              <label className="control-row control-row--stacked">
                <span>Motion preference</span>
                <select
                  aria-label="motion preference"
                  onChange={(event) => {
                    setMotion(event.target.value as MotionPreference);
                    markChanged();
                  }}
                  style={{
                    background: theme.ui.surface,
                    borderColor: theme.ui.border,
                    color: theme.ui.text
                  }}
                  value={motion}
                >
                  <option value="system">Follow system</option>
                  <option value="never">Always animate</option>
                  <option value="always">Static</option>
                </select>
              </label>
              <div className="fps-choices" role="group" aria-label="fps">
                {FPS_CHOICES.map((choice) => (
                  <label className="touch-target" key={choice}>
                    <input
                      type="radio"
                      name="fps"
                      checked={fps === choice}
                      onChange={() => {
                        setFps(choice);
                        markChanged();
                      }}
                    />{" "}
                    {choice} FPS
                  </label>
                ))}
              </div>
            </fieldset>
          </aside>
        </div>

        <section
          className="implementation-card"
          style={{
            ...cardStyle,
            background: theme.ui.surface,
            border: `1px solid ${theme.ui.border}`
          }}
        >
          <div className="implementation-card__header">
            <div>
              <span className="eyebrow" style={{ color: theme.ui.accent }}>
                Ship it
              </span>
              <h2>Implementation</h2>
            </div>
            <button
              aria-label="Copy implementation"
              className="button button--secondary touch-target"
              onClick={() => void copyImplementation()}
              style={{ borderColor: theme.ui.accent, color: theme.ui.accent }}
              type="button"
            >
              Copy code
            </button>
          </div>
          <div aria-live="polite" className="copy-status" role="status">
            {copyStatus === "copied"
              ? "Implementation copied."
              : copyStatus === "failed"
                ? "Copy failed. Select the code manually."
                : ""}
          </div>
          <pre
            className="implementation-code"
            style={{
              background: theme.ui.background,
              border: `1px solid ${theme.ui.border}`,
              color: theme.ui.text
            }}
          >
            <code aria-label="implementation code">
              {highlightCode(implementationCode, theme)}
            </code>
          </pre>
        </section>
      </div>
    </main>
  );
}

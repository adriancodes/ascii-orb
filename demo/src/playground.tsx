import { useState, type ReactNode } from "react";
import {
  AsciiOrb,
  defineOrbVariant,
  listVariantIds,
  type OrbPalette,
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

// A custom variant in the picker doubles as living documentation for
// defineOrbVariant: aether physics wearing veil's colors.
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

function createImplementationCode(
  variant: OrbVariantId,
  palette: OrbPalette,
  fps: number
): string {
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
      fps={${fps}}
    />
  );
}`;
}

function highlightCode(code: string, theme: DemoTheme): ReactNode[] {
  const pattern =
    /("(?:\\.|[^"\\])*")|(\b(?:import|from|export|function|const|return)\b)|(\b\d+(?:\.\d+)?\b)|(<\/?[A-Z]\w*)|(\b(?:variant|customVariants|palette|foreground|primary|accent|mutedForeground|fps)\b(?==))|([{}[\](),;=/>])/g;
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
  const [fps, setFps] = useState<number>(30);
  const [copied, setCopied] = useState(false);
  const implementationCode = createImplementationCode(variant, palette, fps);

  const copyImplementation = async () => {
    try {
      await navigator.clipboard.writeText(implementationCode);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <main
      style={{
        ...pageStyle,
        display: "flex",
        flexDirection: "column",
        background: theme.ui.background,
        color: theme.ui.text
      }}
    >
      <SiteHeader
        colorScheme={colorScheme}
        currentPage="playground"
        onColorSchemeChange={onColorSchemeChange}
        theme={theme}
      />
      <section style={{ marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: 22 }}>playground</h2>
        <p
          style={{
            ...mutedStyle,
            color: theme.ui.muted,
            margin: "4px 0 0",
            fontSize: 13
          }}
        >
          click the orb for ripples
        </p>
      </section>
      <div style={{ display: "flex", gap: 20, flex: 1, minHeight: "65vh" }}>
        <div
          style={{
            ...cardStyle,
            flex: 1,
            minWidth: 0,
            background: theme.ui.surface,
            border: `1px solid ${theme.ui.border}`
          }}
        >
          <AsciiOrb
            variant={variant}
            customVariants={customVariants}
            palette={palette}
            fps={fps}
          />
        </div>
        <aside
          style={{ width: 260, display: "flex", flexDirection: "column", gap: 20 }}
        >
          <label style={{ display: "block" }}>
            <div
              style={{
                ...mutedStyle,
                color: theme.ui.muted,
                fontSize: 12,
                marginBottom: 6
              }}
            >
              variant
            </div>
            <select
              value={String(variant)}
              onChange={(e) => {
                setVariant(e.target.value);
                setCopied(false);
              }}
              style={{
                width: "100%",
                background: theme.ui.surface,
                color: theme.ui.text,
                border: `1px solid ${theme.ui.border}`,
                borderRadius: 6,
                padding: "8px 10px",
                fontFamily: "inherit"
              }}
            >
              {variantIds.map((id) => (
                <option key={id} value={id}>
                  {id}
                </option>
              ))}
            </select>
          </label>

          <fieldset
            style={{
              border: `1px solid ${theme.ui.border}`,
              borderRadius: 6,
              padding: 12
            }}
          >
            <legend
              style={{
                ...mutedStyle,
                color: theme.ui.muted,
                fontSize: 12,
                padding: "0 6px"
              }}
            >
              palette
            </legend>
            {PALETTE_ROLES.map((role) => (
              <label
                key={role}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: 12,
                  margin: "6px 0"
                }}
              >
                {role}
                <input
                  type="color"
                  value={palette[role]}
                  onChange={(e) => {
                    setPalette((p) => ({ ...p, [role]: e.target.value }));
                    setCopied(false);
                  }}
                />
              </label>
            ))}
          </fieldset>

          <fieldset
            style={{
              border: `1px solid ${theme.ui.border}`,
              borderRadius: 6,
              padding: 12
            }}
          >
            <legend
              style={{
                ...mutedStyle,
                color: theme.ui.muted,
                fontSize: 12,
                padding: "0 6px"
              }}
            >
              fps
            </legend>
            <div style={{ display: "flex", gap: 12 }}>
              {FPS_CHOICES.map((choice) => (
                <label key={choice} style={{ fontSize: 13 }}>
                  <input
                    type="radio"
                    name="fps"
                    checked={fps === choice}
                    onChange={() => {
                      setFps(choice);
                      setCopied(false);
                    }}
                  />{" "}
                  {choice}
                </label>
              ))}
            </div>
          </fieldset>
        </aside>
      </div>
      <section
        style={{
          ...cardStyle,
          background: theme.ui.surface,
          border: `1px solid ${theme.ui.border}`,
          marginTop: 20
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <strong>implementation</strong>
          <button
            type="button"
            onClick={() => void copyImplementation()}
            style={{
              background: "transparent",
              color: theme.ui.accent,
              border: `1px solid ${theme.ui.accent}`,
              borderRadius: 6,
              padding: "5px 10px",
              fontFamily: "inherit",
              cursor: "pointer"
            }}
          >
            {copied ? "copied" : "copy"}
          </button>
        </div>
        <pre
          style={{
            margin: "12px 0 0",
            color: theme.ui.text,
            fontFamily: "inherit",
            fontSize: 12,
            overflowX: "auto"
          }}
        >
          <code aria-label="implementation code">
            {highlightCode(implementationCode, theme)}
          </code>
        </pre>
      </section>
    </main>
  );
}

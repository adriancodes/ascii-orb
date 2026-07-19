import {
  COLOR_SCHEMES,
  mutedStyle,
  type ColorScheme,
  type DemoTheme
} from "./theme";

const ASCII_ORB = ` AA   SSS  CCC  III III      OOO  RRR  BBB
A  A S    C      I   I      O   O R  R B  B
AAAA  SSS C      I   I      O   O RRR  BBB
A  A    S C      I   I      O   O R R  B  B
A  A SSS   CCC  III III      OOO  R  R BBB`;

export function SiteHeader({
  colorScheme,
  currentPage,
  onColorSchemeChange,
  theme
}: {
  colorScheme: ColorScheme;
  currentPage: "showcase" | "playground";
  onColorSchemeChange: (scheme: ColorScheme) => void;
  theme: DemoTheme;
}) {
  return (
    <header
      style={{
        borderBottom: `1px solid ${theme.ui.border}`,
        marginBottom: 32,
        paddingBottom: 20
      }}
    >
      <h1 aria-label="ascii-orb" style={{ margin: 0 }}>
        <a href="#" aria-label="ascii-orb home" style={{ color: theme.ui.text }}>
          <span
            aria-hidden="true"
            style={{
              display: "block",
              fontSize: "clamp(7px, 1.3vw, 14px)",
              lineHeight: 1.05,
              overflow: "hidden",
              whiteSpace: "pre"
            }}
          >
            {ASCII_ORB}
          </span>
        </a>
      </h1>
      <div
        style={{
          alignItems: "center",
          display: "flex",
          flexWrap: "wrap",
          gap: 16,
          justifyContent: "space-between",
          marginTop: 16
        }}
      >
        <nav aria-label="primary" style={{ display: "flex", gap: 16 }}>
          <a
            aria-current={currentPage === "showcase" ? "page" : undefined}
            href="#"
            style={{ color: theme.ui.accent }}
          >
            showcase
          </a>
          <a
            aria-current={currentPage === "playground" ? "page" : undefined}
            href="#playground"
            style={{ color: theme.ui.accent }}
          >
            playground
          </a>
        </nav>
        <label style={{ alignItems: "center", display: "inline-flex", gap: 8 }}>
          <span style={{ ...mutedStyle, color: theme.ui.muted, fontSize: 13 }}>
            color scheme
          </span>
          <select
            aria-label="color scheme"
            value={colorScheme}
            onChange={(event) =>
              onColorSchemeChange(event.target.value as ColorScheme)
            }
            style={{
              background: theme.ui.surface,
              border: `1px solid ${theme.ui.border}`,
              borderRadius: 6,
              color: theme.ui.text,
              fontFamily: "inherit",
              padding: "6px 10px"
            }}
          >
            {Object.entries(COLOR_SCHEMES).map(([id, scheme]) => (
              <option key={id} value={id}>
                {scheme.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </header>
  );
}

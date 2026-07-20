import {
  COLOR_SCHEMES,
  mutedStyle,
  type ColorScheme,
  type DemoTheme
} from "./theme";

const ASCII_ORB = `+----------------+
|   ASCII-ORB    |
+----------------+`;

const externalLinks = [
  ["docs", "https://github.com/adriancodes/ascii-orb#readme"],
  ["github", "https://github.com/adriancodes/ascii-orb"],
  ["npm", "https://www.npmjs.com/package/ascii-orb"]
] as const;

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
      className="site-header"
      style={{
        borderBottom: `1px solid ${theme.ui.border}`
      }}
    >
      <h1 aria-label="ascii-orb" className="site-header__brand">
        <a href="#" aria-label="ascii-orb home" style={{ color: theme.ui.text }}>
          <span
            aria-hidden="true"
            className="site-header__wordmark"
          >
            {ASCII_ORB}
          </span>
        </a>
      </h1>
      <div
        className="site-header__bar"
      >
        <nav aria-label="primary" className="site-header__nav">
          <a
            aria-current={currentPage === "showcase" ? "page" : undefined}
            className="touch-target"
            href="#"
            style={{ color: theme.ui.accent }}
          >
            showcase
          </a>
          <a
            aria-current={currentPage === "playground" ? "page" : undefined}
            className="touch-target"
            href="#playground"
            style={{ color: theme.ui.accent }}
          >
            playground
          </a>
          {externalLinks.map(([label, href]) => (
            <a
              className="touch-target"
              href={href}
              key={label}
              rel="noreferrer"
              style={{ color: theme.ui.muted }}
              target="_blank"
            >
              {label}
            </a>
          ))}
        </nav>
        <label style={{ alignItems: "center", display: "inline-flex", gap: 8 }}>
          <span style={{ ...mutedStyle, color: theme.ui.muted, fontSize: 13 }}>
            site theme
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

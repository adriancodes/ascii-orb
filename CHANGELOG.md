# ascii-orb

## 0.1.0

### Minor Changes

- 5a9edb6: Initial release: `AsciiOrb` React component with 16 built-in variants, custom
  variants via `defineOrbVariant`, four-role palette theming, click ripples,
  responsive sizing, reduced-motion support, and the headless engine at
  `ascii-orb/core`.
- Surface impacts deform the running texture, core, and lighting while preserving
  the silhouette and halo. Repeated mouse clicks and keyboard activation create
  fresh ripples; off-body clicks are ignored.
- Cache color ramps, prepare wave data once per frame, and use analytic ripple
  slopes. Preserve fractional frame timing and pause offscreen or hidden orbs.
- Fix color attribute escaping, reactive font sizing, disabled ripple limits,
  accessibility settings, and playground settings when changing the site theme.
- Redesign the responsive showcase with larger previews, sixteen interactive
  gallery cards, eight themes, and copyable playground configuration.

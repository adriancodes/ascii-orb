# Renderer measurements

Run `pnpm build` then `node scripts/benchmark.mjs`. An optional argument selects
another built engine for comparison: `node scripts/benchmark.mjs /path/to/core.cjs`.

Measured on the same machine with Node 22.19.0, comparing commit `e0b0026` with
these changes. Each case cycles through all 16 variants at 96 × 50 cells, with
one warmup and five measured passes of 320 frames. Values are median CPU
milliseconds per frame; they exclude browser layout and paint.

| Concurrent ripples | Before | After | Reduction |
| --- | ---: | ---: | ---: |
| 0 | 0.838 | 0.452 | 46% |
| 1 | 1.113 | 0.524 | 53% |
| 5 | 1.644 | 0.619 | 62% |

The CPU profile identified color formatting and repeated ripple sampling as
hotspots. Experiments were measured separately and retained:

| Change | 0 / 1 / 5 ripples, ms per frame |
| --- | --- |
| Cache the existing quantized colors (bounded to 64 ramps) | 0.675 / 0.907 / 1.449 |
| Also compute latitude once per row | 0.410 / 0.689 / 1.220 |
| Also prepare waves once per frame and use analytic refraction slopes | 0.420 / 0.573 / 0.689 |

The original comparison ran both versions sequentially to reduce contention;
the After column was remeasured after confining impacts to the orb's surface.
No dependencies were added, and the existing non-ripple snapshots are unchanged.
Tests check wave slopes against numerical derivatives and guard frame cadence,
observer cleanup, and repeated clicks. Browser checks confirmed offscreen orbs
stop updating and all 16 previews produce visible ripples on click.
Surface-impact tests also verify that every exterior cell stays unchanged
across all variants, while the existing interior texture deforms.

The component preserves fractional frame intervals for steadier spin, pauses
when hidden, and keeps the stable `<pre>` as the pointer target while replacing
its character spans. The latter prevents animation from swallowing mouse clicks.

"use client";

import {
  computeResponsiveGridSize,
  createRipple,
  DEFAULT_ORB_SIZING,
  pruneRipples,
  renderOrbFrame,
  type OrbColorizer,
  type OrbCustomVariants,
  type OrbFrame,
  type OrbPalette,
  type OrbRipple,
  type OrbVariant,
  type OrbVariantId,
  type OrbVariantConfig
} from "./core";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent
} from "react";

export type AsciiOrbProps = {
  active?: boolean;
  variant?: OrbVariantId;
  customVariants?: OrbCustomVariants;
  fallbackVariant?: OrbVariant;
  variantConfig?: Partial<OrbVariantConfig>;
  palette?: Partial<OrbPalette>;
  colorizer?: OrbColorizer;
  intensityMultiplier?: number;
  xScale?: number;
  width?: number;
  height?: number;
  responsive?: boolean;
  coverage?: number;
  baseWidth?: number;
  baseHeight?: number;
  minWidth?: number;
  minHeight?: number;
  maxCells?: number;
  minScale?: number;
  maxScale?: number;
  fps?: number;
  reducedMotion?: "system" | "always" | "never";
  enableRipples?: boolean;
  maxRipples?: number;
  rippleDuration?: number;
  rippleSpeed?: number;
  rippleStrength?: number;
  containerClassName?: string;
  className?: string;
  style?: CSSProperties;
  ariaHidden?: boolean;
};

// All presentation is inline so the component needs no host CSS, no
// Tailwind, and no stylesheet import. Caller `style` merges over the base.
const CENTERING_STYLE: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};

const PRE_BASE_STYLE: CSSProperties = {
  margin: 0,
  fontFamily:
    'ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace',
  fontSize: 13,
  lineHeight: "13px",
  letterSpacing: "-0.02em",
  userSelect: "none"
};

function useSystemReducedMotion(enabled: boolean): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") {
      return;
    }

    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      setReduced(query.matches);
    };

    sync();
    query.addEventListener("change", sync);
    return () => {
      query.removeEventListener("change", sync);
    };
  }, [enabled]);

  return reduced;
}

// Build an HTML string from a frame, batching contiguous same-color cells
// into a single <span>. Transparent cells (outside the orb body) are emitted
// as raw whitespace with no wrapper — they need to preserve layout but carry
// no color. This trims DOM node count by ~5× vs one <span> per cell.
function frameToHtml(frame: OrbFrame): string {
  const rows: string[] = new Array(frame.length);
  for (let r = 0; r < frame.length; r += 1) {
    const row = frame[r];
    let html = "<div>";
    let runColor = "";
    let runChars = "";
    for (let c = 0; c < row.length; c += 1) {
      const cell = row[c];
      if (cell.color !== runColor) {
        if (runChars) {
          html +=
            runColor === "transparent"
              ? runChars
              : `<span style="color:${runColor}">${runChars}</span>`;
        }
        runColor = cell.color;
        runChars = "";
      }
      const ch = cell.char;
      if (ch === "&") runChars += "&amp;";
      else if (ch === "<") runChars += "&lt;";
      else if (ch === ">") runChars += "&gt;";
      else runChars += ch;
    }
    if (runChars) {
      html +=
        runColor === "transparent"
          ? runChars
          : `<span style="color:${runColor}">${runChars}</span>`;
    }
    html += "</div>";
    rows[r] = html;
  }
  return rows.join("");
}

export function AsciiOrb({
  active = true,
  // Engine-owned options carry no defaults here — undefined crosses the
  // seam and @adrian/ascii-orb-core's defaults are the single source.
  variant,
  customVariants,
  fallbackVariant,
  variantConfig,
  palette,
  colorizer,
  intensityMultiplier,
  xScale,
  width,
  height,
  responsive = true,
  coverage = 1,
  baseWidth,
  baseHeight,
  minWidth,
  minHeight,
  maxCells,
  minScale,
  maxScale,
  fps = 30,
  reducedMotion = "system",
  enableRipples = true,
  maxRipples = 5,
  rippleDuration,
  rippleSpeed,
  rippleStrength,
  containerClassName,
  className,
  style,
  ariaHidden = true
}: AsciiOrbProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const timeRef = useRef(0);
  const ripplesRef = useRef<OrbRipple[]>([]);

  const resolvedBaseWidth = baseWidth ?? DEFAULT_ORB_SIZING.baseWidth;
  const resolvedBaseHeight = baseHeight ?? DEFAULT_ORB_SIZING.baseHeight;

  const systemReducedMotion = useSystemReducedMotion(reducedMotion === "system");
  const shouldReduceMotion =
    reducedMotion === "always" || (reducedMotion === "system" && systemReducedMotion);

  const [responsiveGrid, setResponsiveGrid] = useState({
    width: width ?? resolvedBaseWidth,
    height: height ?? resolvedBaseHeight
  });

  useEffect(() => {
    if (!active) {
      return;
    }

    const container = containerRef.current;
    const pre = preRef.current;
    if (!container || !pre) {
      return;
    }

    const updateGrid = () => {
      const computedStyle = window.getComputedStyle(pre);
      const fontSize = parseFloat(computedStyle.fontSize) || 14;
      const lineHeight = parseFloat(computedStyle.lineHeight) || fontSize * 1.12;
      const charWidth = fontSize * 0.62;

      let next = {
        width: width ?? resolvedBaseWidth,
        height: height ?? resolvedBaseHeight
      };

      if (!(typeof width === "number" && typeof height === "number") && responsive) {
        const bounds = container.getBoundingClientRect();
        if (bounds.width > 0 && bounds.height > 0) {
          next = computeResponsiveGridSize({
            containerWidth: bounds.width,
            containerHeight: bounds.height,
            charWidth,
            lineHeight,
            baseWidth: resolvedBaseWidth,
            baseHeight: resolvedBaseHeight,
            minWidth,
            minHeight,
            maxCells,
            minScale,
            maxScale
          });
        }
      }

      setResponsiveGrid((current) =>
        current.width === next.width && current.height === next.height ? current : next
      );
    };

    updateGrid();

    const observer = new ResizeObserver(updateGrid);
    observer.observe(container);
    window.addEventListener("resize", updateGrid);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateGrid);
    };
  }, [
    active,
    height,
    maxCells,
    maxScale,
    minHeight,
    minScale,
    minWidth,
    resolvedBaseHeight,
    resolvedBaseWidth,
    responsive,
    width
  ]);

  const resolvedGrid = useMemo(() => {
    if (typeof width === "number" && typeof height === "number") {
      return { width, height };
    }

    if (!responsive) {
      return { width: width ?? resolvedBaseWidth, height: height ?? resolvedBaseHeight };
    }

    return responsiveGrid;
  }, [height, resolvedBaseHeight, resolvedBaseWidth, responsive, responsiveGrid, width]);

  // Write one frame to the DOM imperatively. Reads ref-backed time + ripples
  // so it can run inside a rAF loop without triggering React renders.
  const drawFrame = useCallback(() => {
    const pre = preRef.current;
    if (!pre) return;
    const frame = renderOrbFrame({
      timeSeconds: timeRef.current,
      width: resolvedGrid.width,
      height: resolvedGrid.height,
      xScale,
      variant,
      customVariants,
      fallbackVariant,
      variantConfig,
      ripples: ripplesRef.current,
      palette,
      colorizer,
      intensityMultiplier
    });
    pre.innerHTML = frameToHtml(frame);
  }, [
    colorizer,
    customVariants,
    fallbackVariant,
    intensityMultiplier,
    palette,
    resolvedGrid.height,
    resolvedGrid.width,
    variant,
    variantConfig,
    xScale
  ]);

  useLayoutEffect(() => {
    if (!active) return;

    if (shouldReduceMotion) {
      timeRef.current = 0;
      drawFrame();
      return;
    }

    drawFrame();

    let raf = 0;
    let lastTickAt = performance.now();
    let lastRenderAt = 0;
    const minFrameGap = 1000 / Math.max(1, fps);
    const maxFrameDelta = 0.1;

    const tick = (now: number) => {
      const deltaSeconds = Math.min(maxFrameDelta, (now - lastTickAt) / 1000);
      lastTickAt = now;
      timeRef.current += deltaSeconds;

      if (now - lastRenderAt >= minFrameGap) {
        if (ripplesRef.current.length > 0) {
          ripplesRef.current = pruneRipples(ripplesRef.current, timeRef.current);
        }
        drawFrame();
        lastRenderAt = now;
      }

      raf = window.requestAnimationFrame(tick);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (raf !== 0) {
          window.cancelAnimationFrame(raf);
          raf = 0;
        }
      } else if (raf === 0) {
        lastTickAt = performance.now();
        raf = window.requestAnimationFrame(tick);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    raf = window.requestAnimationFrame(tick);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (raf !== 0) {
        window.cancelAnimationFrame(raf);
      }
    };
  }, [active, drawFrame, fps, shouldReduceMotion]);

  const onOrbClick = useCallback(
    (event: MouseEvent<HTMLPreElement>) => {
      if (!enableRipples || shouldReduceMotion) {
        return;
      }

      const bounds = event.currentTarget.getBoundingClientRect();
      const localX = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
      const localY = ((event.clientY - bounds.top) / bounds.height) * 2 - 1;

      const ripple = createRipple({
        x: localX,
        y: localY,
        timeSeconds: timeRef.current,
        duration: rippleDuration,
        speed: rippleSpeed,
        strength: rippleStrength
      });

      const keepCount = Math.max(0, maxRipples - 1);
      const current = ripplesRef.current;
      ripplesRef.current =
        keepCount === 0
          ? [ripple]
          : current.length >= keepCount
            ? [...current.slice(current.length - keepCount), ripple]
            : [...current, ripple];
    },
    [
      enableRipples,
      maxRipples,
      rippleDuration,
      rippleSpeed,
      rippleStrength,
      shouldReduceMotion
    ]
  );

  if (!active) {
    return null;
  }

  const boundedCoverage = Math.max(0.2, Math.min(1, coverage));

  return (
    <div
      className={containerClassName}
      style={{ ...CENTERING_STYLE, height: "100%", width: "100%" }}
    >
      <div
        ref={containerRef}
        style={{
          ...CENTERING_STYLE,
          width: `${(boundedCoverage * 100).toFixed(2)}%`,
          height: `${(boundedCoverage * 100).toFixed(2)}%`
        }}
      >
        <pre
          ref={preRef}
          className={className}
          onClick={onOrbClick}
          style={{
            ...PRE_BASE_STYLE,
            cursor:
              enableRipples && !shouldReduceMotion ? "crosshair" : undefined,
            ...style
          }}
          aria-hidden={ariaHidden}
        />
      </div>
    </div>
  );
}

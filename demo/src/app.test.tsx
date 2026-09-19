// @vitest-environment jsdom
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { orbVariants } from "ascii-orb";
import * as core from "ascii-orb/core";
import { App } from "./app";

beforeAll(() => {
  window.requestAnimationFrame = () => 0;
  window.cancelAnimationFrame = () => {};
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
  // Reduced motion on: every orb renders one static frame, no rAF churn.
  window.matchMedia = ((query: string) => ({
    matches: true,
    media: query,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    onchange: null,
    dispatchEvent: () => false
  })) as unknown as typeof window.matchMedia;
});

beforeEach(() => {
  window.location.hash = "";
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("showcase (landing view)", () => {
  it("adds a fresh ripple for every click on every orb without nesting buttons", () => {
    const matchMedia = window.matchMedia;
    vi.spyOn(window, "matchMedia").mockImplementation(query => ({ ...matchMedia(query), matches: false }));
    const draw = vi.spyOn(core, "renderOrbFrame");
    const { container } = render(<App />);
    const orbs = [...container.querySelectorAll<HTMLPreElement>('pre[role="button"]')];
    expect(orbs).toHaveLength(orbVariants.length + 1);
    expect(container.querySelector('button [role="button"]')).toBeNull();
    for (const orb of orbs) {
      orb.getBoundingClientRect = () => ({ left: 0, top: 0, width: 100, height: 100 }) as DOMRect;
      for (let click = 1; click <= 6; click += 1) {
        draw.mockClear();
        fireEvent.click(orb, { clientX: 50, clientY: 50 });
        expect(draw).toHaveBeenCalledOnce();
        expect(draw.mock.calls[0][0].ripples).toHaveLength(Math.min(click, 5));
      }
    }
  });

  it("renders an interactive hero and every built-in variant as a selector", () => {
    const { container } = render(<App />);
    expect(
      container.querySelector('header h1[aria-label="ascii-orb"]')
    ).not.toBeNull();
    expect(container.querySelector('[data-testid="hero-orb"] pre')).not.toBeNull();
    expect(container.querySelectorAll("button[data-variant]").length).toBe(
      orbVariants.length
    );
    expect(container.textContent).toContain("Eclipse");
    expect(container.textContent).toContain("Glacier");
    expect(container.textContent).toContain("npm install ascii-orb");
    expect(container.textContent).toContain("Click or tap inside the orb");
    // every orb actually drew characters
    for (const pre of container.querySelectorAll("pre")) {
      expect(pre.textContent!.trim().length).toBeGreaterThan(0);
    }
  });

  it("rethemes the entire showcase with a selected color scheme", () => {
    const { container } = render(<App />);
    const readOrbMarkup = () =>
      [
        ...container.querySelectorAll(
          '.hero-orb pre, .variant-card__preview pre'
        )
      ].map((pre) => pre.innerHTML);
    const readUiStyles = () =>
      [
        ...container.querySelectorAll(
          "main, header, select, .showcase-hero, figure, .feature-strip > div"
        )
      ].map((element) => element.getAttribute("style"));
    const before = { orbs: readOrbMarkup(), ui: readUiStyles() };
    const themeSelect = container.querySelector<HTMLSelectElement>(
      'select[aria-label="color scheme"]'
    )!;
    expect([...themeSelect.options].map((option) => option.text)).toEqual([
      "GitHub Dark",
      "GitHub Light",
      "Dracula",
      "Nord",
      "Solarized Dark",
      "Monokai",
      "Tokyo Night",
      "Catppuccin Mocha"
    ]);

    fireEvent.change(themeSelect, { target: { value: "dracula" } });

    const after = { orbs: readOrbMarkup(), ui: readUiStyles() };
    expect(after.orbs).toHaveLength(orbVariants.length + 1);
    expect(
      after.orbs.every((orb, index) => orb !== before.orbs[index])
    ).toBe(true);
    expect(
      after.ui.every((style, index) => style !== before.ui[index])
    ).toBe(true);

    const showcaseBackground = container.querySelector("main")!.style.background;
    window.location.hash = "#playground";
    fireEvent(window, new HashChangeEvent("hashchange"));

    expect(container.textContent).toContain("playground");
    expect(container.querySelector("main")!.style.background).toBe(
      showcaseBackground
    );
    expect(container.querySelector("pre")!.innerHTML).toMatch(
      /#(?:f8f8f2|8be9fd|bd93f9|6272a4)/
    );
  });

  it("selects a variant in the hero and copies the install command", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText }
    });
    const { container } = render(<App />);

    const scrollIntoView = vi.fn();
    container.querySelector<HTMLDivElement>('[data-testid="hero-orb"]')!.scrollIntoView = scrollIntoView;
    fireEvent.click(container.querySelector('button[data-variant="pulse"]')!);
    expect(scrollIntoView).toHaveBeenCalledWith({ block: "center", behavior: "instant" });
    expect(container.querySelector('[data-testid="hero-orb"]')!.textContent).toContain(
      "Pulse"
    );
    expect(
      container.querySelector<HTMLAnchorElement>('[data-testid="hero-customize"]')!
        .hash
    ).toBe("#playground/pulse");
    expect(container.querySelector(".usage-code")!.textContent).toContain(
      'variant="pulse"'
    );

    fireEvent.click(
      container.querySelector('button[aria-label="Copy install command"]')!
    );
    await waitFor(() =>
      expect(writeText).toHaveBeenCalledWith("npm install ascii-orb")
    );
    expect(container.querySelector('[role="status"]')!.textContent).toContain(
      "Install command copied"
    );
  });

  it("opens a chosen orb with copyable implementation code", async () => {
    const { container } = render(<App />);
    const editLink = container.querySelector<HTMLAnchorElement>(
      'a[href="#playground/ion"]'
    )!;

    window.location.hash = editLink.hash;
    fireEvent(window, new HashChangeEvent("hashchange"));

    const variantSelect = container.querySelector<HTMLSelectElement>(
      'select:not([aria-label="color scheme"])'
    )!;
    const implementation = container.querySelector("section pre code")!;
    expect(variantSelect.value).toBe("ion");
    expect(implementation.textContent).toContain('variant="ion"');
    expect(implementation.textContent).toContain("fps={30}");
    expect(implementation.textContent).toContain("rippleSpeed={1.25}");
    expect(implementation.querySelectorAll("[data-token]").length).toBeGreaterThan(
      5
    );

    fireEvent.change(variantSelect, { target: { value: "nebula" } });
    fireEvent.click(container.querySelectorAll('input[type="radio"]')[2]);
    expect(implementation.textContent).toContain("defineOrbVariant");
    expect(implementation.textContent).toContain(
      "customVariants={customVariants}"
    );
    expect(implementation.textContent).toContain("fps={60}");

    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText }
    });
    fireEvent.click(
      container.querySelector('button[aria-label="Copy implementation"]')!
    );
    await waitFor(() =>
      expect(writeText).toHaveBeenCalledWith(implementation.textContent)
    );
    expect(container.querySelector('[role="status"]')!.textContent).toContain(
      "Implementation copied"
    );
  });
});

describe("playground (#playground)", () => {
  it("preserves orb settings when only the site theme changes", () => {
    window.location.hash = "#playground/nova";
    const { container } = render(<App />);
    const variant = container.querySelector<HTMLSelectElement>('select:not([aria-label])')!;
    fireEvent.change(variant, { target: { value: "nebula" } });
    fireEvent.click(container.querySelectorAll('input[type="radio"]')[2]);
    fireEvent.change(container.querySelector('[aria-label="accent hex"]')!, { target: { value: "#ff0000" } });
    const before = container.querySelector('[aria-label="implementation code"]')!.textContent;
    fireEvent.change(container.querySelector('[aria-label="color scheme"]')!, { target: { value: "dracula" } });
    expect(container.querySelector('[aria-label="implementation code"]')!.textContent).toBe(before);
  });

  it("shows one orb with palette, ripple, motion, and fps controls", () => {
    window.location.hash = "#playground";
    const { container } = render(<App />);
    expect(
      container.querySelector('header h1[aria-label="ascii-orb"]')
    ).not.toBeNull();
    expect(container.querySelectorAll("pre").length).toBeGreaterThan(0);

    const options = [...container.querySelectorAll("option")].map(
      (o) => o.value
    );
    for (const v of orbVariants) {
      expect(options).toContain(v);
    }
    expect(options).toContain("nebula"); // the custom-variant example

    expect(container.querySelectorAll('input[type="color"]').length).toBe(4);
    expect(container.textContent!.toLowerCase()).toContain("fps");
    expect(container.textContent).toContain("Ripple speed");
    expect(container.textContent).toContain("Ripple strength");
    expect(container.textContent).toContain("Ripple duration");
    expect(container.querySelector('select[aria-label="motion preference"]')).not.toBeNull();
  });
});

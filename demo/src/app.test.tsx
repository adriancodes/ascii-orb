// @vitest-environment jsdom
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { orbVariants } from "ascii-orb";
import { App } from "./app";

beforeAll(() => {
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

describe("showcase (landing view)", () => {
  it("renders every built-in variant live with its label", () => {
    const { container } = render(<App />);
    expect(
      container.querySelector('header h1[aria-label="ascii-orb"]')
    ).not.toBeNull();
    expect(container.querySelectorAll('pre[aria-hidden="true"]').length).toBe(
      orbVariants.length
    );
    expect(container.textContent).toContain("Eclipse");
    expect(container.textContent).toContain("Glacier");
    expect(container.textContent).toContain("npm install ascii-orb");
    // every orb actually drew characters
    for (const pre of container.querySelectorAll("pre")) {
      expect(pre.textContent!.trim().length).toBeGreaterThan(0);
    }
  });

  it("rethemes the entire showcase with a selected color scheme", () => {
    const { container } = render(<App />);
    const readOrbMarkup = () =>
      [...container.querySelectorAll("pre")].map((pre) => pre.innerHTML);
    const readUiStyles = () =>
      [
        ...container.querySelectorAll(
          "main, header > p:first-of-type, code, a, select, figure, figcaption div"
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
    expect(after.orbs).toHaveLength(orbVariants.length);
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
    fireEvent.click(container.querySelector("section button")!);
    await waitFor(() =>
      expect(writeText).toHaveBeenCalledWith(implementation.textContent)
    );
    expect(container.querySelector("section button")!.textContent).toBe(
      "copied"
    );
  });
});

describe("playground (#playground)", () => {
  it("shows one orb with variant picker, palette controls, and fps toggle", () => {
    window.location.hash = "#playground";
    const { container } = render(<App />);
    expect(
      container.querySelector('header h1[aria-label="ascii-orb"]')
    ).not.toBeNull();
    expect(container.querySelectorAll('pre[aria-hidden="true"]').length).toBe(
      1
    );

    const options = [...container.querySelectorAll("option")].map(
      (o) => o.value
    );
    for (const v of orbVariants) {
      expect(options).toContain(v);
    }
    expect(options).toContain("nebula"); // the custom-variant example

    expect(container.querySelectorAll('input[type="color"]').length).toBe(4);
    expect(container.textContent!.toLowerCase()).toContain("fps");
  });
});

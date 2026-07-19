// @vitest-environment jsdom
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { fireEvent, render } from "@testing-library/react";
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
    expect(container.querySelectorAll("pre").length).toBe(orbVariants.length);
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

    fireEvent.change(
      container.querySelector('select[aria-label="color scheme"]')!,
      {
        target: { value: "ember" }
      }
    );

    const after = { orbs: readOrbMarkup(), ui: readUiStyles() };
    expect(after.orbs).toHaveLength(orbVariants.length);
    expect(
      after.orbs.every((orb, index) => orb !== before.orbs[index])
    ).toBe(true);
    expect(
      after.ui.every((style, index) => style !== before.ui[index])
    ).toBe(true);
  });
});

describe("playground (#playground)", () => {
  it("shows one orb with variant picker, palette controls, and fps toggle", () => {
    window.location.hash = "#playground";
    const { container } = render(<App />);
    expect(container.querySelectorAll("pre").length).toBe(1);

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

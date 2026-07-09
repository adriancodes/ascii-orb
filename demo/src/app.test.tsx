// @vitest-environment jsdom
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
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

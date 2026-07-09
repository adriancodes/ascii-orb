// @vitest-environment jsdom
import { beforeAll, describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { AsciiOrb } from "./index";
import { defaultPalette } from "./core";

beforeAll(() => {
  // jsdom lacks ResizeObserver; the grid effect constructs one unconditionally.
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
});

describe("zero-config <AsciiOrb />", () => {
  it("ships a concrete default palette, not CSS variable names", () => {
    for (const value of Object.values(defaultPalette)) {
      expect(value.startsWith("--")).toBe(false);
      expect(value.length).toBeGreaterThan(0);
    }
  });

  it("renders visible characters with inline styles and zero class names", () => {
    const { container } = render(
      <AsciiOrb reducedMotion="always" width={24} height={12} />
    );
    const pre = container.querySelector("pre");
    expect(pre).toBeTruthy();

    // Styling arrives inline — no host CSS required.
    expect(pre!.style.fontFamily.toLowerCase()).toContain("mono");
    expect(["0", "0px"]).toContain(pre!.style.margin);
    expect(pre!.style.fontSize).not.toBe("");

    // No utility class names anywhere in the tree: nothing for Tailwind
    // (or any host framework) to resolve, so nothing can silently unstyle.
    const classNames = [...container.querySelectorAll("*")].flatMap((el) => [
      ...el.classList
    ]);
    expect(classNames).toEqual([]);

    // The orb actually drew.
    expect(pre!.textContent!.trim().length).toBeGreaterThan(0);
  });

  it("still honours caller className and style overrides", () => {
    const { container } = render(
      <AsciiOrb
        reducedMotion="always"
        width={24}
        height={12}
        className="my-orb"
        style={{ fontSize: 17 }}
      />
    );
    const pre = container.querySelector("pre")!;
    expect([...pre.classList]).toContain("my-orb");
    expect(pre.style.fontSize).toBe("17px");
  });
});

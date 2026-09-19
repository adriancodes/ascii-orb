// @vitest-environment jsdom
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { AsciiOrb } from "./index";
import { defaultPalette } from "./core";
import * as core from "./core";

beforeAll(() => {
  // jsdom lacks ResizeObserver; the grid effect constructs one unconditionally.
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
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

  it("makes only the rendered orb an accessible ripple target", () => {
    const draw = vi.spyOn(core, "renderOrbFrame");
    const { getByRole } = render(
      <AsciiOrb reducedMotion="never" width={24} height={12} ariaHidden={false} />
    );
    const target = getByRole("button", { name: "Ripple ASCII orb" });

    expect(target.tagName).toBe("PRE");
    expect(target.tabIndex).toBe(0);
    expect([...target.children].every(row => (row as HTMLElement).style.pointerEvents === "none")).toBe(true);
    target.getBoundingClientRect = () =>
      ({ left: 0, top: 0, width: 100, height: 100 }) as DOMRect;
    const before = target.innerHTML;
    draw.mockClear();
    fireEvent.click(target, { clientX: 0, clientY: 0 });
    expect(target.innerHTML).toBe(before);
    fireEvent.click(target, { clientX: 90, clientY: 50 });
    expect(target.innerHTML).toBe(before);
    expect(draw).not.toHaveBeenCalled();
    fireEvent.click(target, { clientX: 50, clientY: 50 });
    expect(target.innerHTML).not.toBe(before);
    fireEvent.keyDown(target, { key: "Enter" });
  });

  it("keeps palette and colorizer output inside the color attribute", () => {
    const attack = 'red" onmouseover="window.injected=true"><svg onload="window.injected=true">';
    const { container, rerender } = render(
      <AsciiOrb reducedMotion="always" width={24} height={12}
        palette={{ foreground: attack, primary: attack, accent: attack }} />
    );
    expect(container.querySelector("svg, [onmouseover], [onload]")).toBeNull();
    rerender(<AsciiOrb reducedMotion="always" width={24} height={12} colorizer={() => attack} />);
    expect(container.querySelector("svg, [onmouseover], [onload]")).toBeNull();
    expect(container.querySelector("pre")!.textContent).not.toContain("svg");
  });

  it("recalculates the grid when font metrics change without a container resize", () => {
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue(
      { left: 0, top: 0, width: 500, height: 400 } as DOMRect
    );
    const { container, rerender } = render(
      <AsciiOrb reducedMotion="always" style={{ fontSize: 13, lineHeight: "13px" }} />
    );
    expect(container.querySelector("pre")!.children.length).toBe(30);
    rerender(<AsciiOrb reducedMotion="always" style={{ fontSize: 26, lineHeight: "26px" }} />);
    expect(container.querySelector("pre")!.children.length).toBe(15);
  });

  it("honors decorative mode without leaving a hidden keyboard target", () => {
    const { container } = render(<AsciiOrb reducedMotion="never" ariaHidden width={24} height={12} />);
    const pre = container.querySelector("pre")!;
    expect(pre.getAttribute("aria-hidden")).toBe("true");
    expect(pre.tabIndex).toBe(-1);
    expect(pre.getAttribute("role")).toBeNull();
  });

  it("does not create a ripple when its cap is zero", () => {
    vi.spyOn(window, "requestAnimationFrame").mockReturnValue(0);
    const { container } = render(
      <AsciiOrb reducedMotion="never" maxRipples={0} width={24} height={12} />
    );
    const pre = container.querySelector("pre")!;
    pre.getBoundingClientRect = () => ({ left: 0, top: 0, width: 100, height: 100 }) as DOMRect;
    const before = pre.innerHTML;
    fireEvent.click(pre, { clientX: 50, clientY: 50 });
    expect(pre.innerHTML).toBe(before);
  });

  it("keeps a steady render cadence and clock with uneven animation ticks", () => {
    let tick: FrameRequestCallback = () => {};
    vi.spyOn(performance, "now").mockReturnValue(0);
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => { tick = callback; return 1; });
    const { container } = render(<AsciiOrb reducedMotion="never" width={24} height={12} fps={30} />);
    const pre = container.querySelector("pre")!;
    let frames = 0;
    for (let i = 1; i <= 60; i += 1) {
      const ms = i * 1000 / 60 + (i % 2 ? 0.2 : 0);
      const before = pre.innerHTML;
      act(() => tick(ms));
      if (pre.innerHTML !== before) frames += 1;
    }
    expect(frames).toBeGreaterThanOrEqual(29);
    expect(frames).toBeLessThanOrEqual(30);
  });

  it("pauses offscreen animation and disconnects the observer on unmount", () => {
    let notify: IntersectionObserverCallback = () => {};
    const disconnect = vi.fn();
    vi.stubGlobal("IntersectionObserver", class {
      constructor(callback: IntersectionObserverCallback) { notify = callback; }
      observe() {}
      disconnect = disconnect;
    });
    const request = vi.spyOn(window, "requestAnimationFrame").mockReturnValue(7);
    const cancel = vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});
    const { unmount } = render(<AsciiOrb reducedMotion="never" width={24} height={12} />);
    expect(request).toHaveBeenCalledTimes(1);
    act(() => notify([{ isIntersecting: false } as IntersectionObserverEntry], {} as IntersectionObserver));
    expect(cancel).toHaveBeenCalledWith(7);
    act(() => notify([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver));
    expect(request).toHaveBeenCalledTimes(2);
    unmount();
    expect(disconnect).toHaveBeenCalledOnce();
  });
});

import "@testing-library/jest-dom/vitest";

// Vitest+jsdom lacks ResizeObserver; provide a noop polyfill for Radix tooltips and similar UI.
if (!globalThis.ResizeObserver) {
  class ResizeObserver {
    disconnect() {}
    observe() {}
    unobserve() {}
  }
  globalThis.ResizeObserver = ResizeObserver;
}

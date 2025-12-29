import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { LogEvent } from "./types";

const h = vi.hoisted(() => {
  const emit = vi.fn();
  const flush = vi.fn().mockResolvedValue(undefined);
  const transport = { emit, flush };
  const createAxiomTransport = vi.fn(() => transport);
  return { createAxiomTransport, emit, flush, transport };
});

vi.mock("./axiom", () => ({
  createAxiomTransport: h.createAxiomTransport,
}));

const globalTarget = globalThis as unknown as {
  addEventListener?: (type: string, listener: () => void) => void;
  document?: {
    addEventListener?: (type: string, listener: () => void) => void;
    visibilityState?: string;
  };
};

const originalAddEventListener = globalTarget.addEventListener;
const originalDocument = globalTarget.document;

const restoreGlobalTarget = () => {
  if (originalAddEventListener) {
    globalTarget.addEventListener = originalAddEventListener;
  } else {
    Reflect.deleteProperty(globalTarget, "addEventListener");
  }

  if (originalDocument) {
    globalTarget.document = originalDocument;
  } else {
    Reflect.deleteProperty(globalTarget, "document");
  }
};

describe("browser logging helpers", () => {
  beforeEach(() => {
    vi.resetModules();
    h.emit.mockReset();
    h.flush.mockReset();
    h.createAxiomTransport.mockClear();
  });

  afterEach(() => {
    restoreGlobalTarget();
  });

  it("returns a no-op logger before initialization", async () => {
    const { createBrowserLogger } = await import("./browser");

    const logger = createBrowserLogger();
    logger.info("noop");

    expect(h.emit).not.toHaveBeenCalled();
    expect(h.createAxiomTransport).not.toHaveBeenCalled();
  });

  it("throws when initializing without client or transport", async () => {
    const { initBrowserLogger } = await import("./browser");

    expect(() =>
      initBrowserLogger({
        datasets: { events: "events", metrics: "metrics" },
        env: "production",
        service: "web",
      }),
    ).toThrow("client or transport is required to initialize logging");
  });

  it("registers flush handlers and emits events", async () => {
    const listeners = new Map<string, () => void>();
    const documentListeners = new Map<string, () => void>();

    globalTarget.addEventListener = vi.fn((type, listener) => {
      listeners.set(type, listener);
    });
    globalTarget.document = {
      addEventListener: vi.fn((type, listener) => {
        documentListeners.set(type, listener);
      }),
      visibilityState: "visible",
    };

    const events: Array<{ dataset: string; event: LogEvent }> = [];
    h.emit.mockImplementation((dataset, event) => {
      events.push({ dataset, event: event as LogEvent });
    });

    const { createBrowserLogger, initBrowserLogger, shutdownBrowserLogger } =
      await import("./browser");

    initBrowserLogger({
      client: { token: "token" },
      datasets: { events: "events", metrics: "metrics" },
      env: "production",
      service: "web",
    });

    initBrowserLogger({
      client: { token: "token" },
      datasets: { events: "events", metrics: "metrics" },
      env: "production",
      service: "web",
    });

    expect(h.createAxiomTransport).toHaveBeenCalledTimes(1);
    expect(h.createAxiomTransport).toHaveBeenCalledWith(
      expect.objectContaining({ mode: "immediate", token: "token" }),
    );

    const logger = createBrowserLogger();
    logger.event("page_view", { path: "/home" });

    expect(events).toHaveLength(1);
    expect(events[0]?.dataset).toBe("logs");
    const event = events[0]?.event as LogEvent;
    expect(event["event.type"]).toBe("event");

    expect(listeners.has("pagehide")).toBe(true);
    expect(documentListeners.has("visibilitychange")).toBe(true);

    listeners.get("pagehide")?.();
    if (globalTarget.document) {
      globalTarget.document.visibilityState = "hidden";
    }
    documentListeners.get("visibilitychange")?.();

    expect(h.flush).toHaveBeenCalledTimes(2);

    await shutdownBrowserLogger();

    expect(h.flush).toHaveBeenCalledTimes(3);
  });

  it("uses a custom transport and skips flush handlers when disabled", async () => {
    globalTarget.addEventListener = vi.fn();
    globalTarget.document = {
      addEventListener: vi.fn(),
      visibilityState: "visible",
    };

    const customTransport = {
      emit: vi.fn(),
      flush: vi.fn().mockResolvedValue(undefined),
    };

    const { createBrowserLogger, initBrowserLogger, shutdownBrowserLogger } =
      await import("./browser");

    initBrowserLogger({
      datasets: { events: "events", metrics: "metrics" },
      env: "production",
      flushOnEnd: false,
      service: "web",
      transport: customTransport,
    });

    const logger = createBrowserLogger();
    logger.info("custom_transport");

    expect(customTransport.emit).toHaveBeenCalledTimes(1);
    expect(customTransport.flush).not.toHaveBeenCalled();
    expect(h.createAxiomTransport).not.toHaveBeenCalled();
    expect(globalTarget.addEventListener).not.toHaveBeenCalled();
    expect(globalTarget.document?.addEventListener).not.toHaveBeenCalled();

    await shutdownBrowserLogger();

    expect(customTransport.flush).toHaveBeenCalledTimes(1);
  });
});

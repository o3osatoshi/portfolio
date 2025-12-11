import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@opentelemetry/api", () => {
  const mockSpanAddEvent = vi.fn();
  const mockSpanEnd = vi.fn();

  const mockSpan = {
    addEvent: mockSpanAddEvent,
    end: mockSpanEnd,
  };

  const mockTracerStartSpan = vi.fn(() => mockSpan);
  const mockTracer = {
    startSpan: mockTracerStartSpan,
  };

  const mockGetTracer = vi.fn(() => mockTracer);
  const mockGetActiveSpan = vi.fn(() => mockSpan);
  const mockSetSpan = vi.fn((_ctx: unknown, _span: unknown) => ({}));

  const mockContextActive = vi.fn(() => ({}));
  const mockContextWith = vi.fn((_ctx: unknown, fn: () => void) => fn());

  return {
    __mocks: {
      mockContextWith,
      mockGetActiveSpan,
      mockGetTracer,
      mockSpanAddEvent,
      mockSpanEnd,
      mockTracerStartSpan,
    },
    context: {
      active: mockContextActive,
      with: mockContextWith,
    },
    trace: {
      getActiveSpan: mockGetActiveSpan,
      getTracer: mockGetTracer,
      setSpan: mockSetSpan,
    },
  };
});

import * as otel from "@opentelemetry/api";

import type { BrowserSessionContext } from "./browser";
import { createBrowserLogger } from "./browser";

const apiMocks = (otel as any).__mocks as {
  mockContextWith: ReturnType<typeof vi.fn>;
  mockGetActiveSpan: ReturnType<typeof vi.fn>;
  mockGetTracer: ReturnType<typeof vi.fn>;
  mockSpanAddEvent: ReturnType<typeof vi.fn>;
  mockSpanEnd: ReturnType<typeof vi.fn>;
  mockTracerStartSpan: ReturnType<typeof vi.fn>;
};

describe("createBrowserLogger", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("logs UX events with session attributes", () => {
    const session: BrowserSessionContext = {
      sessionId: "session-123",
      userId: "user-1",
    };

    const logger = createBrowserLogger(session);

    logger.event("button_clicked", { button: "primary" });

    expect(apiMocks.mockGetTracer).toHaveBeenCalledWith(
      "@o3osatoshi/telemetry/browser",
    );
    expect(apiMocks.mockTracerStartSpan).toHaveBeenCalledWith("button_clicked");

    expect(apiMocks.mockSpanAddEvent).toHaveBeenCalledWith("ux_event", {
      event_name: "button_clicked",
      session_id: "session-123",
      user_id: "user-1",
      button: "primary",
    });

    expect(apiMocks.mockSpanEnd).toHaveBeenCalled();
    expect(apiMocks.mockContextWith).toHaveBeenCalled();
  });

  it("logs messages onto the active span with level and attributes", () => {
    const session: BrowserSessionContext = {
      sessionId: "session-456",
      userId: null,
    };

    const logger = createBrowserLogger(session);

    logger.info("hello", { foo: "bar" });

    expect(apiMocks.mockGetActiveSpan).toHaveBeenCalled();
    expect(apiMocks.mockSpanAddEvent).toHaveBeenCalledWith("log", {
      session_id: "session-456",
      user_id: undefined,
      foo: "bar",
      level: "info",
      message: "hello",
    });
  });
});

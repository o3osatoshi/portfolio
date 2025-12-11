import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@opentelemetry/api", () => {
  const mockSpanAddEvent = vi.fn();
  const mockSpanRecordException = vi.fn();
  const mockSpanSetAttribute = vi.fn();
  const mockSpanEnd = vi.fn();
  const mockSpanContext = vi.fn(() => ({
    spanId: "span-123",
    traceId: "trace-456",
  }));

  const mockSpan = {
    addEvent: mockSpanAddEvent,
    end: mockSpanEnd,
    recordException: mockSpanRecordException,
    setAttribute: mockSpanSetAttribute,
    spanContext: mockSpanContext,
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
      mockGetActiveSpan,
      mockGetTracer,
      mockSpanAddEvent,
      mockSpanContext,
      mockSpanEnd,
      mockSpanRecordException,
      mockSpanSetAttribute,
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

import { createRequestTelemetry } from "./node";
import type { RequestContext } from "./types";

const apiMocks = (otel as any).__mocks as {
  mockGetActiveSpan: ReturnType<typeof vi.fn>;
  mockGetTracer: ReturnType<typeof vi.fn>;
  mockSpanAddEvent: ReturnType<typeof vi.fn>;
  mockSpanContext: ReturnType<typeof vi.fn>;
  mockSpanRecordException: ReturnType<typeof vi.fn>;
  mockSpanSetAttribute: ReturnType<typeof vi.fn>;
  mockTracerStartSpan: ReturnType<typeof vi.fn>;
};

describe("createRequestTelemetry (node)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a span and logger with request context", () => {
    const ctx: RequestContext = {
      clientIp: "127.0.0.1",
      httpMethod: "GET",
      httpRoute: "/api/items/:id",
      requestId: "req-1",
      userAgent: "test-agent",
      userId: "user-1",
    };

    const telemetry = createRequestTelemetry(ctx);

    expect(apiMocks.mockGetTracer).toHaveBeenCalledWith(
      "@o3osatoshi/telemetry/node",
    );
    expect(apiMocks.mockTracerStartSpan).toHaveBeenCalledWith("request", {
      attributes: {
        "enduser.id": "user-1",
        "request.id": "req-1",
        "client.address": "127.0.0.1",
        "http.method": "GET",
        "http.route": "/api/items/:id",
        "http.user_agent": "test-agent",
      },
    });

    expect(telemetry.spanId).toBe("span-123");
    expect(telemetry.traceId).toBe("trace-456");
  });

  it("end records exceptions and attaches attributes while skipping error and undefined values", () => {
    const ctx: RequestContext = {
      requestId: "req-2",
    };

    const telemetry = createRequestTelemetry(ctx);

    const error = new Error("boom");

    // @ts-expect-error
    telemetry.end({
      error,
      foo: "bar",
      skip: undefined,
    });

    expect(apiMocks.mockSpanRecordException).toHaveBeenCalledWith(error);
    expect(apiMocks.mockSpanSetAttribute).toHaveBeenCalledWith("foo", "bar");

    const keys = apiMocks.mockSpanSetAttribute.mock.calls.map((c) => c[0]);
    expect(keys).not.toContain("error");
    expect(keys).not.toContain("skip");
  });

  it("end wraps non-Error error values in a generic error", () => {
    const ctx: RequestContext = {
      requestId: "req-3",
    };

    const telemetry = createRequestTelemetry(ctx);

    telemetry.end({ error: "not-an-error" });

    expect(apiMocks.mockSpanRecordException).toHaveBeenCalledTimes(1);
    // @ts-expect-error accessing private Vitest internals for assertions
    const recorded = apiMocks.mockSpanRecordException.mock.calls[0][0];
    expect(recorded).toBeInstanceOf(Error);
    expect((recorded as Error).message).toBe("unknown error");
  });
});

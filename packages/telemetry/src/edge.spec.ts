import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@opentelemetry/api", () => {
  const mockSpanAddEvent = vi.fn();
  const mockSpanRecordException = vi.fn();
  const mockSpanSetAttribute = vi.fn();
  const mockSpanEnd = vi.fn();
  const mockSpanContext = vi.fn(() => ({
    spanId: "edge-span-123",
    traceId: "edge-trace-456",
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

vi.mock("@opentelemetry/exporter-trace-otlp-http", () => {
  interface TestExporterInstance {
    options?: unknown;
  }
  const OTLPTraceExporter = vi.fn(function (
    this: TestExporterInstance,
    options: unknown,
  ) {
    this.options = options;
  });
  return { OTLPTraceExporter };
});

vi.mock("@opentelemetry/resources", () => {
  interface TestResourceInstance {
    attributes?: unknown;
  }
  const Resource = vi.fn(function (
    this: TestResourceInstance,
    attributes: unknown,
  ) {
    this.attributes = attributes;
  });
  return { Resource };
});

vi.mock("@opentelemetry/sdk-trace-base", () => {
  interface TestBatchSpanProcessorInstance {
    exporter?: unknown;
  }
  const BatchSpanProcessor = vi.fn(function (
    this: TestBatchSpanProcessorInstance,
    exporter: unknown,
  ) {
    this.exporter = exporter;
  });

  interface TestBasicTracerProviderInstance {
    options?: unknown;
    register?: ReturnType<typeof vi.fn>;
  }
  const BasicTracerProvider = vi.fn(function (
    this: TestBasicTracerProviderInstance,
    options: unknown,
  ) {
    this.options = options;
    this.register = vi.fn();
  });

  return { BasicTracerProvider, BatchSpanProcessor };
});

vi.mock("@opentelemetry/semantic-conventions", () => ({
  ATTR_SERVICE_NAME: "service.name",
}));

import * as otel from "@opentelemetry/api";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { Resource } from "@opentelemetry/resources";
import {
  BasicTracerProvider,
  BatchSpanProcessor,
} from "@opentelemetry/sdk-trace-base";
import { ATTR_SERVICE_NAME } from "@opentelemetry/semantic-conventions";

import { createRequestTelemetry, initEdgeTelemetry } from "./edge";
import type { RequestContext } from "./types";

// @ts-expect-error – accessing Vitest mock internals
const apiMocks = otel.__mocks as {
  mockGetActiveSpan: ReturnType<typeof vi.fn>;
  mockGetTracer: ReturnType<typeof vi.fn>;
  mockSpanAddEvent: ReturnType<typeof vi.fn>;
  mockSpanContext: ReturnType<typeof vi.fn>;
  mockSpanRecordException: ReturnType<typeof vi.fn>;
  mockSpanSetAttribute: ReturnType<typeof vi.fn>;
  mockTracerStartSpan: ReturnType<typeof vi.fn>;
};

describe("createRequestTelemetry (edge)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a span and logger with request context", () => {
    const ctx: RequestContext = {
      clientIp: "10.0.0.1",
      httpMethod: "POST",
      httpRoute: "/api/edge",
      requestId: "edge-req-1",
      userAgent: "edge-agent",
      userId: "edge-user",
    };

    const telemetry = createRequestTelemetry(ctx);

    expect(apiMocks.mockGetTracer).toHaveBeenCalledWith(
      "@o3osatoshi/telemetry/edge",
    );
    expect(apiMocks.mockTracerStartSpan).toHaveBeenCalledWith("request", {
      attributes: {
        "enduser.id": "edge-user",
        "request.id": "edge-req-1",
        "client.address": "10.0.0.1",
        "http.method": "POST",
        "http.route": "/api/edge",
        "http.user_agent": "edge-agent",
      },
    });

    expect(telemetry.spanId).toBe("edge-span-123");
    expect(telemetry.traceId).toBe("edge-trace-456");
  });

  it("end records exceptions and attaches attributes while skipping error and undefined values", () => {
    const ctx: RequestContext = {
      requestId: "edge-req-2",
    };

    const telemetry = createRequestTelemetry(ctx);

    const error = new Error("edge-boom");

    // @ts-expect-error
    telemetry.end({
      error,
      foo: "edge",
      skip: undefined,
    });

    expect(apiMocks.mockSpanRecordException).toHaveBeenCalledWith(error);
    expect(apiMocks.mockSpanSetAttribute).toHaveBeenCalledWith("foo", "edge");

    const keys = apiMocks.mockSpanSetAttribute.mock.calls.map((c) => c[0]);
    expect(keys).not.toContain("error");
    expect(keys).not.toContain("skip");
  });

  it("end wraps non-Error error values in a generic error", () => {
    const ctx: RequestContext = {
      requestId: "edge-req-3",
    };

    const telemetry = createRequestTelemetry(ctx);

    // @ts-expect-error
    telemetry.end({ error: { some: "value" } });

    expect(apiMocks.mockSpanRecordException).toHaveBeenCalledTimes(1);
    // @ts-expect-error accessing private Vitest internals for assertions
    const recorded = apiMocks.mockSpanRecordException.mock.calls[0][0];
    expect(recorded).toBeInstanceOf(Error);
    expect((recorded as Error).message).toBe("unknown error");
  });
});

describe("initEdgeTelemetry", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("is idempotent and configures resource and exporter correctly", () => {
    const errorReporter = vi.fn(() => "edge-event-1");

    const options = {
      axiom: {
        apiToken: "test-token",
        otlpEndpoint: "https://example.axiom.co/v1/traces",
      },
      dataset: "my-edge-dataset",
      env: "production",
      errorReporter,
      serviceName: "my-edge-service",
    } as const;

    initEdgeTelemetry(options);
    // Second call should be a no-op
    initEdgeTelemetry({
      ...options,
      axiom: {
        apiToken: "other-token",
        otlpEndpoint: "https://other.example/v1/traces",
      },
    });

    type ViMockFn = ReturnType<typeof vi.fn>;
    const ResourceMock = Resource as unknown as ViMockFn;
    const ExporterMock = OTLPTraceExporter as unknown as ViMockFn;
    const ProviderMock = BasicTracerProvider as unknown as ViMockFn;
    const BatchSpanProcessorMock = BatchSpanProcessor as unknown as ViMockFn;

    // Idempotent: constructors called only once
    expect(ResourceMock).toHaveBeenCalledTimes(1);
    expect(ExporterMock).toHaveBeenCalledTimes(1);
    expect(ProviderMock).toHaveBeenCalledTimes(1);
    expect(BatchSpanProcessorMock).toHaveBeenCalledTimes(1);

    // Resource attributes include service name and environment
    expect(ResourceMock).toHaveBeenCalledWith({
      [ATTR_SERVICE_NAME]: options.serviceName,
      "deployment.environment": options.env,
    });

    // Exporter configured with Axiom token and endpoint
    expect(ExporterMock).toHaveBeenCalledWith({
      headers: {
        Authorization: `Bearer ${options.axiom.apiToken}`,
        "X-Axiom-Dataset": options.dataset,
      },
      url: options.axiom.otlpEndpoint,
    });

    // Provider is wired with the created resource and span processor
    const providerInstance = ProviderMock.mock.instances[0];
    const resourceInstance = ResourceMock.mock.instances[0];
    const spanProcessorInstance = BatchSpanProcessorMock.mock.instances[0];

    expect(providerInstance.options.resource).toBe(resourceInstance);
    expect(providerInstance.options.spanProcessors).toEqual([
      spanProcessorInstance,
    ]);

    // Provider is registered once
    expect(providerInstance.register).toHaveBeenCalledTimes(1);

    // Logger forwards errors to the configured errorReporter with context
    const ctx: RequestContext = {
      clientIp: "10.0.0.2",
      httpMethod: "GET",
      httpRoute: "/edge/error",
      requestId: "edge-req-error-1",
      userAgent: "edge-agent-error",
      userId: "edge-user-error",
    };

    const telemetry = createRequestTelemetry(ctx);
    const error = new Error("edge error");

    // @ts-expect-error
    telemetry.logger.error("handled edge error", { error });

    expect(errorReporter).toHaveBeenCalledTimes(1);
    expect(errorReporter).toHaveBeenCalledWith(error, {
      requestId: "edge-req-error-1",
      spanId: "edge-span-123",
      traceId: "edge-trace-456",
      userId: "edge-user-error",
    });

    // Returned event ID is attached to the span
    expect(apiMocks.mockSpanSetAttribute).toHaveBeenCalledWith(
      "sentry_event_id",
      "edge-event-1",
    );
  });
});

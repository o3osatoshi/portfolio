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

vi.mock("@opentelemetry/sdk-node", () => {
  interface TestNodeSDKInstance {
    options?: unknown;
    start?: ReturnType<typeof vi.fn>;
  }
  const NodeSDK = vi.fn(function (this: TestNodeSDKInstance, options: unknown) {
    this.options = options;
    this.start = vi.fn().mockResolvedValue(undefined);
  });
  return { NodeSDK };
});

vi.mock("@opentelemetry/semantic-conventions", () => ({
  ATTR_SERVICE_NAME: "service.name",
}));

import * as otel from "@opentelemetry/api";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { Resource } from "@opentelemetry/resources";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { ATTR_SERVICE_NAME } from "@opentelemetry/semantic-conventions";

import { createRequestTelemetry, initNodeTelemetry } from "./node";
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

describe("initNodeTelemetry", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("is idempotent and configures resource and exporter correctly", () => {
    const errorReporter = vi.fn(() => "node-event-1");

    const options = {
      axiom: {
        apiToken: "test-token",
        otlpEndpoint: "https://example.axiom.co/v1/traces",
      },
      dataset: "my-node-dataset",
      env: "production",
      errorReporter,
      serviceName: "my-node-service",
    } as const;

    initNodeTelemetry(options);
    // Second call should be a no-op
    initNodeTelemetry({
      ...options,
      axiom: {
        apiToken: "other-token",
        otlpEndpoint: "https://other.example/v1/traces",
      },
    });

    type ViMockFn = ReturnType<typeof vi.fn>;
    const ResourceMock = Resource as unknown as ViMockFn;
    const ExporterMock = OTLPTraceExporter as unknown as ViMockFn;
    const NodeSDKMock = NodeSDK as unknown as ViMockFn;

    // Idempotent: constructors called only once
    expect(ResourceMock).toHaveBeenCalledTimes(1);
    expect(ExporterMock).toHaveBeenCalledTimes(1);
    expect(NodeSDKMock).toHaveBeenCalledTimes(1);

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

    // NodeSDK is wired with the created resource and exporter
    const rawSdkInstance = NodeSDKMock.mock.instances[0];
    const rawResourceInstance = ResourceMock.mock.instances[0];
    const rawExporterInstance = ExporterMock.mock.instances[0];

    interface SdkInstanceShape {
      options: {
        resource: unknown;
        traceExporter: unknown;
      };
      start: ReturnType<typeof vi.fn>;
    }

    const sdkInstance = rawSdkInstance as SdkInstanceShape;
    const resourceInstance = rawResourceInstance as unknown;
    const exporterInstance = rawExporterInstance as unknown;

    expect(sdkInstance.options.resource).toBe(resourceInstance);
    expect(sdkInstance.options.traceExporter).toBe(exporterInstance);

    // SDK start is invoked once
    expect(sdkInstance.start).toHaveBeenCalledTimes(1);

    // Logger forwards errors to the configured errorReporter with context
    const ctx: RequestContext = {
      clientIp: "127.0.0.2",
      httpMethod: "POST",
      httpRoute: "/api/error",
      requestId: "req-error-1",
      userAgent: "test-agent-error",
      userId: "user-error-1",
    };

    const telemetry = createRequestTelemetry(ctx);
    const error = new Error("node error");

    // @ts-expect-error
    telemetry.logger.error("handled node error", { error });

    expect(errorReporter).toHaveBeenCalledTimes(1);
    expect(errorReporter).toHaveBeenCalledWith(error, {
      requestId: "req-error-1",
      spanId: "span-123",
      traceId: "trace-456",
      userId: "user-error-1",
    });

    // Returned event ID is attached to the span
    expect(apiMocks.mockSpanSetAttribute).toHaveBeenCalledWith(
      "sentry_event_id",
      "node-event-1",
    );
  });
});

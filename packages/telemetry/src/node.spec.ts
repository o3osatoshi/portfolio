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

  const mockMeterCreateCounter = vi.fn();
  const mockMeterCreateHistogram = vi.fn();
  const mockMeter = {
    createCounter: mockMeterCreateCounter,
    createHistogram: mockMeterCreateHistogram,
  };
  const mockGetMeter = vi.fn(() => mockMeter);

  return {
    __mocks: {
      mockContextWith,
      mockGetActiveSpan,
      mockGetMeter,
      mockGetTracer,
      mockMeterCreateCounter,
      mockMeterCreateHistogram,
      mockSetSpan,
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
    metrics: {
      getMeter: mockGetMeter,
    },
    trace: {
      getActiveSpan: mockGetActiveSpan,
      getTracer: mockGetTracer,
      setSpan: mockSetSpan,
    },
  };
});

vi.mock("@opentelemetry/api-logs", () => {
  const mockEmit = vi.fn();
  const mockGetLogger = vi.fn(() => ({
    emit: mockEmit,
  }));

  const SeverityNumber = {
    DEBUG: 5,
    ERROR: 17,
    INFO: 9,
    WARN: 13,
  } as const;

  return {
    __mocks: {
      mockEmit,
      mockGetLogger,
    },
    logs: {
      getLogger: mockGetLogger,
    },
    SeverityNumber,
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

vi.mock("@opentelemetry/exporter-metrics-otlp-http", () => {
  interface TestExporterInstance {
    options?: unknown;
  }
  const OTLPMetricExporter = vi.fn(function (
    this: TestExporterInstance,
    options: unknown,
  ) {
    this.options = options;
  });
  return { OTLPMetricExporter };
});

vi.mock("@opentelemetry/exporter-logs-otlp-http", () => {
  interface TestExporterInstance {
    options?: unknown;
  }
  const OTLPLogExporter = vi.fn(function (
    this: TestExporterInstance,
    options: unknown,
  ) {
    this.options = options;
  });
  return { OTLPLogExporter };
});

vi.mock("@opentelemetry/resources", () => {
  const resourceFromAttributes = vi.fn((attributes: unknown) => ({
    attributes,
  }));
  return { resourceFromAttributes };
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
import * as otelLogs from "@opentelemetry/api-logs";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { ATTR_SERVICE_NAME } from "@opentelemetry/semantic-conventions";

import {
  addBusinessEventToActiveSpan,
  addErrorBusinessEventToActiveSpan,
  createNodeLogger,
  createRequestTelemetry,
  getNodeMetrics,
  initNodeTelemetry,
  withRequestTelemetry,
} from "./node";
import type { RequestContext } from "./types";

// @ts-expect-error – accessing Vitest mock internals
const apiMocks = otel.__mocks as {
  mockContextWith: ReturnType<typeof vi.fn>;
  mockGetActiveSpan: ReturnType<typeof vi.fn>;
  mockGetMeter: ReturnType<typeof vi.fn>;
  mockGetTracer: ReturnType<typeof vi.fn>;
  mockMeterCreateCounter: ReturnType<typeof vi.fn>;
  mockMeterCreateHistogram: ReturnType<typeof vi.fn>;
  mockSetSpan: ReturnType<typeof vi.fn>;
  mockSpanAddEvent: ReturnType<typeof vi.fn>;
  mockSpanContext: ReturnType<typeof vi.fn>;
  mockSpanRecordException: ReturnType<typeof vi.fn>;
  mockSpanSetAttribute: ReturnType<typeof vi.fn>;
  mockTracerStartSpan: ReturnType<typeof vi.fn>;
};

// @ts-expect-error – accessing Vitest mock internals
const logApiMocks = otelLogs.__mocks as {
  mockEmit: ReturnType<typeof vi.fn>;
  mockGetLogger: ReturnType<typeof vi.fn>;
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

    telemetry.end(
      {
        foo: "bar",
        skip: undefined,
      },
      error,
    );

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

    telemetry.end(undefined, "not-an-error");

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
        otlpEndpoints: {
          logs: "https://logs.example.axiom.co/v1/logs",
          metrics: "https://metrics.example.axiom.co/v1/metrics",
          traces: "https://traces.example.axiom.co/v1/traces",
        },
      },
      datasets: {
        logs: "my-node-logs",
        metrics: "my-node-metrics",
        traces: "my-node-traces",
      },
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
        otlpEndpoints: {
          logs: "https://other.example/v1/logs",
          metrics: "https://other.example/v1/metrics",
          traces: "https://other.example/v1/traces",
        },
      },
    });

    type ViMockFn = ReturnType<typeof vi.fn>;
    const resourceFromAttributesMock =
      resourceFromAttributes as unknown as ViMockFn;
    const ExporterMock = OTLPTraceExporter as unknown as ViMockFn;
    const MetricExporterMock = OTLPMetricExporter as unknown as ViMockFn;
    const LogExporterMock = OTLPLogExporter as unknown as ViMockFn;
    const NodeSDKMock = NodeSDK as unknown as ViMockFn;

    // Idempotent: functions/constructors called only once
    expect(resourceFromAttributesMock).toHaveBeenCalledTimes(1);
    expect(ExporterMock).toHaveBeenCalledTimes(1);
    expect(MetricExporterMock).toHaveBeenCalledTimes(1);
    expect(LogExporterMock).toHaveBeenCalledTimes(1);
    expect(NodeSDKMock).toHaveBeenCalledTimes(1);

    // Resource attributes include service name and environment
    expect(resourceFromAttributesMock).toHaveBeenCalledWith({
      [ATTR_SERVICE_NAME]: options.serviceName,
      "deployment.environment": options.env,
    });

    // Exporter configured with Axiom token and endpoint
    expect(ExporterMock).toHaveBeenCalledWith({
      headers: {
        Authorization: `Bearer ${options.axiom.apiToken}`,
        "X-Axiom-Dataset": options.datasets.traces,
      },
      url: options.axiom.otlpEndpoints.traces,
    });

    expect(MetricExporterMock).toHaveBeenCalledWith({
      headers: {
        Authorization: `Bearer ${options.axiom.apiToken}`,
        "X-Axiom-Dataset": options.datasets.metrics,
      },
      url: options.axiom.otlpEndpoints.metrics,
    });

    expect(LogExporterMock).toHaveBeenCalledWith({
      headers: {
        Authorization: `Bearer ${options.axiom.apiToken}`,
        "X-Axiom-Dataset": options.datasets.logs,
      },
      url: options.axiom.otlpEndpoints.logs,
    });

    // NodeSDK is wired with the created resource and exporter
    const rawSdkInstance = NodeSDKMock.mock.instances[0];
    // @ts-expect-error
    const resourceInstance = resourceFromAttributesMock.mock.results[0].value;
    const rawExporterInstance = ExporterMock.mock.instances[0];

    interface SdkInstanceShape {
      options: {
        resource: unknown;
        traceExporter: unknown;
      };
      start: ReturnType<typeof vi.fn>;
    }

    const sdkInstance = rawSdkInstance as SdkInstanceShape;
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

    telemetry.logger.error("handled node error", undefined, error);

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

describe("withRequestTelemetry (node)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("runs handler with a request-scoped span as the active span", async () => {
    const ctx: RequestContext = {
      httpMethod: "GET",
      httpRoute: "/with",
      requestId: "req-4",
    };

    const handler = vi.fn(async (telemetry) => {
      expect(telemetry.spanId).toBe("span-123");
      expect(telemetry.traceId).toBe("trace-456");
      return "ok" as const;
    });

    const result = await withRequestTelemetry(ctx, handler);

    expect(result).toBe("ok");
    expect(handler).toHaveBeenCalledTimes(1);
    expect(apiMocks.mockSetSpan).toHaveBeenCalledTimes(1);
    expect(apiMocks.mockContextWith).toHaveBeenCalledTimes(1);
  });
});

describe("business event helpers (node)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("addBusinessEventToActiveSpan attaches a business_event to the active span", () => {
    addBusinessEventToActiveSpan("user_signed_in", {
      user_id: "user-1",
    });

    expect(apiMocks.mockGetActiveSpan).toHaveBeenCalled();
    expect(apiMocks.mockSpanAddEvent).toHaveBeenCalledWith(
      "business_event",
      expect.objectContaining({
        event_name: "user_signed_in",
        user_id: "user-1",
      }),
    );
  });

  it("addErrorBusinessEventToActiveSpan adds an error-level event and records the error", () => {
    const error = new Error("business error");

    addErrorBusinessEventToActiveSpan(
      "user_signup_failed",
      { reason: "validation" },
      error,
    );

    expect(apiMocks.mockSpanAddEvent).toHaveBeenCalledWith(
      "business_event",
      expect.objectContaining({
        event_name: "user_signup_failed",
        level: "error",
        reason: "validation",
      }),
    );
    expect(apiMocks.mockSpanRecordException).toHaveBeenCalledWith(error);
  });
});

describe("getNodeMetrics (node)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates and caches counters and histograms via the global meter", () => {
    const metricsHelper = getNodeMetrics();

    expect(apiMocks.mockGetMeter).toHaveBeenCalledWith(
      "@o3osatoshi/telemetry/node",
    );

    // Instruments are cached by name (no additional create* calls)
    const counterAgain = metricsHelper.getCounter("http.server.requests");
    const histogramAgain = metricsHelper.getHistogram("http.server.duration");

    expect(counterAgain).not.toBeUndefined();
    expect(histogramAgain).not.toBeUndefined();
  });
});

describe("createNodeLogger (node)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a process logger, emits records, and reuses the same instance", () => {
    const logger1 = createNodeLogger();

    logger1.info("node_info", {
      foo: "bar",
    });

    expect(logApiMocks.mockGetLogger).toHaveBeenCalledWith(
      "@o3osatoshi/telemetry/node",
    );
    expect(logApiMocks.mockEmit).toHaveBeenCalledTimes(1);

    // @ts-expect-error – accessing Vitest mock internals for assertions
    const emitted = logApiMocks.mockEmit.mock.calls[0][0] as {
      attributes?: unknown;
      body: string;
      severityText: string;
    };
    expect(emitted.body).toBe("node_info");
    expect(emitted.severityText).toBe("INFO");
    expect(emitted.attributes).toEqual({
      foo: "bar",
    });

    const logger2 = createNodeLogger();
    expect(logger2).toBe(logger1);
    expect(logApiMocks.mockGetLogger).toHaveBeenCalledTimes(1);
  });
});

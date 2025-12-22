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
  const mockSetGlobalTracerProvider = vi.fn();
  const mockSetGlobalMeterProvider = vi.fn();
  const mockMeterCreateCounter = vi.fn();
  const mockMeterCreateHistogram = vi.fn();
  const mockMeter = {
    createCounter: mockMeterCreateCounter,
    createHistogram: mockMeterCreateHistogram,
  };
  const mockGetMeter = vi.fn(() => mockMeter);

  const mockContextActive = vi.fn(() => ({}));
  const mockContextWith = vi.fn((_ctx: unknown, fn: () => void) => fn());

  return {
    __mocks: {
      mockSetGlobalMeterProvider,
      mockSetGlobalTracerProvider,
      mockGetActiveSpan,
      mockGetMeter,
      mockGetTracer,
      mockMeterCreateCounter,
      mockMeterCreateHistogram,
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
      setGlobalMeterProvider: mockSetGlobalMeterProvider,
      getMeter: mockGetMeter,
    },
    trace: {
      setGlobalTracerProvider: mockSetGlobalTracerProvider,
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
  const mockSetGlobalLoggerProvider = vi.fn();

  const SeverityNumber = {
    DEBUG: 5,
    ERROR: 17,
    INFO: 9,
    WARN: 13,
  } as const;

  return {
    __mocks: {
      mockSetGlobalLoggerProvider,
      mockEmit,
      mockGetLogger,
    },
    logs: {
      setGlobalLoggerProvider: mockSetGlobalLoggerProvider,
      getLogger: mockGetLogger,
    },
    SeverityNumber,
  };
});

vi.mock("@opentelemetry/exporter-trace-otlp-proto", () => {
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

vi.mock("@opentelemetry/exporter-metrics-otlp-proto", () => {
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

vi.mock("@opentelemetry/exporter-logs-otlp-proto", () => {
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
import * as otelLogs from "@opentelemetry/api-logs";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-proto";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-proto";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";
import { resourceFromAttributes } from "@opentelemetry/resources";
import {
  BasicTracerProvider,
  BatchSpanProcessor,
} from "@opentelemetry/sdk-trace-base";
import { ATTR_SERVICE_NAME } from "@opentelemetry/semantic-conventions";

import {
  createEdgeLogger,
  createRequestTelemetry,
  getEdgeMetrics,
  initEdgeTelemetry,
} from "./edge";
import type { RequestContext } from "./types";

// @ts-expect-error – accessing Vitest mock internals
const apiMocks = otel.__mocks as {
  mockGetActiveSpan: ReturnType<typeof vi.fn>;
  mockGetMeter: ReturnType<typeof vi.fn>;
  mockGetTracer: ReturnType<typeof vi.fn>;
  mockMeterCreateCounter: ReturnType<typeof vi.fn>;
  mockMeterCreateHistogram: ReturnType<typeof vi.fn>;
  mockSetGlobalMeterProvider: ReturnType<typeof vi.fn>;
  mockSetGlobalTracerProvider: ReturnType<typeof vi.fn>;
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
  mockSetGlobalLoggerProvider: ReturnType<typeof vi.fn>;
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

  it("emits log records with request-scoped attributes", () => {
    const ctx: RequestContext = {
      httpMethod: "PUT",
      httpRoute: "/api/edge/items",
      requestId: "edge-req-log-1",
      userId: "edge-user-log-1",
    };

    const telemetry = createRequestTelemetry(ctx);

    telemetry.logger.info("edge request log", {
      foo: "bar",
    });

    expect(apiMocks.mockSpanAddEvent).toHaveBeenCalledWith(
      "log",
      expect.objectContaining({
        request_id: "edge-req-log-1",
        span_id: "edge-span-123",
        trace_id: "edge-trace-456",
        user_id: "edge-user-log-1",
        foo: "bar",
        http_method: "PUT",
        http_route: "/api/edge/items",
        message: "edge request log",
        severity: "info",
      }),
    );

    expect(logApiMocks.mockEmit).toHaveBeenCalledWith(
      expect.objectContaining({
        attributes: {
          request_id: "edge-req-log-1",
          span_id: "edge-span-123",
          trace_id: "edge-trace-456",
          user_id: "edge-user-log-1",
          foo: "bar",
          http_method: "PUT",
          http_route: "/api/edge/items",
        },
        body: "edge request log",
        severityText: "INFO",
      }),
    );
  });

  it("end records exceptions and attaches attributes while skipping error and undefined values", () => {
    const ctx: RequestContext = {
      requestId: "edge-req-2",
    };

    const telemetry = createRequestTelemetry(ctx);

    const error = new Error("edge-boom");

    telemetry.end(
      {
        foo: "edge",
        skip: undefined,
      },
      error,
    );

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

    telemetry.end(undefined, { some: "value" });

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
        otlpEndpoints: {
          logs: "https://logs.example.axiom.co/v1/logs",
          metrics: "https://metrics.example.axiom.co/v1/metrics",
          traces: "https://traces.example.axiom.co/v1/traces",
        },
      },
      datasets: {
        logs: "my-edge-logs",
        metrics: "my-edge-metrics",
        traces: "my-edge-traces",
      },
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
    const ProviderMock = BasicTracerProvider as unknown as ViMockFn;
    const BatchSpanProcessorMock = BatchSpanProcessor as unknown as ViMockFn;

    // Idempotent: functions/constructors called only once
    expect(resourceFromAttributesMock).toHaveBeenCalledTimes(1);
    expect(ExporterMock).toHaveBeenCalledTimes(1);
    expect(MetricExporterMock).toHaveBeenCalledTimes(1);
    expect(LogExporterMock).toHaveBeenCalledTimes(1);
    expect(ProviderMock).toHaveBeenCalledTimes(1);
    expect(BatchSpanProcessorMock).toHaveBeenCalledTimes(1);

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
        "X-Axiom-Dataset": options.datasets.metrics,
      },
      url: options.axiom.otlpEndpoints.logs,
    });

    // Provider is wired with the created resource and span processor
    const providerInstance = ProviderMock.mock.instances[0];
    // @ts-expect-error
    const resourceInstance = resourceFromAttributesMock.mock.results[0].value;
    const spanProcessorInstance = BatchSpanProcessorMock.mock.instances[0];

    expect(providerInstance.options.resource).toBe(resourceInstance);
    expect(providerInstance.options.spanProcessors).toEqual([
      spanProcessorInstance,
    ]);

    // Provider is registered globally once
    expect(apiMocks.mockSetGlobalTracerProvider).toHaveBeenCalledTimes(1);
    expect(apiMocks.mockSetGlobalTracerProvider).toHaveBeenCalledWith(
      providerInstance,
    );
    // Meter and logger providers are registered globally
    expect(apiMocks.mockSetGlobalMeterProvider).toHaveBeenCalledTimes(1);
    expect(logApiMocks.mockSetGlobalLoggerProvider).toHaveBeenCalledTimes(1);
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

    telemetry.logger.error("handled edge error", undefined, error);

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

describe("getEdgeMetrics (edge)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates and caches counters and histograms via the global meter", () => {
    const metricsHelper = getEdgeMetrics();

    expect(apiMocks.mockGetMeter).toHaveBeenCalledWith(
      "@o3osatoshi/telemetry/edge",
    );

    const counter = metricsHelper.getCounter("edge.requests", {
      description: "Edge HTTP requests",
      unit: "1",
    });
    const histogram = metricsHelper.getHistogram("edge.duration", {
      description: "Edge HTTP request duration",
      unit: "ms",
    });

    expect(counter).not.toBeUndefined();
    expect(histogram).not.toBeUndefined();

    const counterAgain = metricsHelper.getCounter("edge.requests");
    const histogramAgain = metricsHelper.getHistogram("edge.duration");

    expect(counterAgain).toBe(counter);
    expect(histogramAgain).toBe(histogram);
  });
});

describe("createEdgeLogger (edge)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a process logger, emits records, and reuses the same instance", () => {
    const logger1 = createEdgeLogger();

    logger1.info("edge_info", {
      foo: "bar",
    });

    expect(logApiMocks.mockGetLogger).toHaveBeenCalledWith(
      "@o3osatoshi/telemetry/edge",
    );
    expect(logApiMocks.mockEmit).toHaveBeenCalledTimes(1);

    // @ts-expect-error – accessing Vitest mock internals for assertions
    const emitted = logApiMocks.mockEmit.mock.calls[0][0] as {
      attributes?: unknown;
      body: string;
      severityText: string;
    };
    expect(emitted.body).toBe("edge_info");
    expect(emitted.severityText).toBe("INFO");
    expect(emitted.attributes).toEqual({
      foo: "bar",
    });

    const logger2 = createEdgeLogger();
    expect(logger2).toBe(logger1);
    expect(logApiMocks.mockGetLogger).toHaveBeenCalledTimes(1);
  });
});

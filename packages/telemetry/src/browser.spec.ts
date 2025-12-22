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

  const mockSetGlobalMeterProvider = vi.fn();
  const mockMeterCreateCounter = vi.fn();
  const mockMeterCreateHistogram = vi.fn();
  const mockMeter = {
    createCounter: mockMeterCreateCounter,
    createHistogram: mockMeterCreateHistogram,
  };
  const mockGetMeter = vi.fn(() => mockMeter);

  return {
    __mocks: {
      mockSetGlobalMeterProvider,
      mockContextWith,
      mockGetActiveSpan,
      mockGetMeter,
      mockGetTracer,
      mockMeterCreateCounter,
      mockMeterCreateHistogram,
      mockSetSpan,
      mockSpanAddEvent,
      mockSpanEnd,
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
  return { BatchSpanProcessor };
});

vi.mock("@opentelemetry/sdk-trace-web", () => {
  interface TestWebTracerProviderInstance {
    options?: unknown;
    register?: ReturnType<typeof vi.fn>;
  }
  const WebTracerProvider = vi.fn(function (
    this: TestWebTracerProviderInstance,
    options: unknown,
  ) {
    this.options = options;
    this.register = vi.fn();
  });
  return { WebTracerProvider };
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
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { WebTracerProvider } from "@opentelemetry/sdk-trace-web";
import { ATTR_SERVICE_NAME } from "@opentelemetry/semantic-conventions";

import type { BrowserSessionContext } from "./browser";
import {
  createBrowserLogger,
  createEventLogger,
  getBrowserMetrics,
  initBrowserTelemetry,
} from "./browser";

// @ts-expect-error – accessing Vitest mock internals
const apiMocks = otel.__mocks as {
  mockContextWith: ReturnType<typeof vi.fn>;
  mockGetActiveSpan: ReturnType<typeof vi.fn>;
  mockGetMeter: ReturnType<typeof vi.fn>;
  mockGetTracer: ReturnType<typeof vi.fn>;
  mockMeterCreateCounter: ReturnType<typeof vi.fn>;
  mockMeterCreateHistogram: ReturnType<typeof vi.fn>;
  mockSetGlobalMeterProvider: ReturnType<typeof vi.fn>;
  mockSetSpan: ReturnType<typeof vi.fn>;
  mockSpanAddEvent: ReturnType<typeof vi.fn>;
  mockSpanEnd: ReturnType<typeof vi.fn>;
  mockTracerStartSpan: ReturnType<typeof vi.fn>;
};

// @ts-expect-error – accessing Vitest mock internals
const logApiMocks = otelLogs.__mocks as {
  mockEmit: ReturnType<typeof vi.fn>;
  mockGetLogger: ReturnType<typeof vi.fn>;
  mockSetGlobalLoggerProvider: ReturnType<typeof vi.fn>;
};

describe("createEventLogger (browser)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("logs UX events with session attributes", () => {
    const session: BrowserSessionContext = {
      sessionId: "session-123",
      userId: "user-1",
    };

    const logger = createEventLogger(session);

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

  it("logs messages onto the active span with severity and attributes", () => {
    const session: BrowserSessionContext = {
      sessionId: "session-456",
      userId: null,
    };

    const logger = createEventLogger(session);

    logger.info("hello", { foo: "bar" });

    expect(apiMocks.mockGetActiveSpan).toHaveBeenCalled();
    expect(apiMocks.mockSpanAddEvent).toHaveBeenCalledWith("log", {
      session_id: "session-456",
      user_id: undefined,
      foo: "bar",
      message: "hello",
      severity: "info",
    });
  });
});

describe("initBrowserTelemetry", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("is idempotent and configures trace, metric, and log pipelines", () => {
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
        logs: "my-browser-logs",
        metrics: "my-browser-metrics",
        traces: "my-browser-traces",
      },
      env: "production",
      serviceName: "my-web-app",
    } as const;

    initBrowserTelemetry(options);
    // Second call should be a no-op
    initBrowserTelemetry({
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
    const ProviderMock = WebTracerProvider as unknown as ViMockFn;
    const BatchSpanProcessorMock = BatchSpanProcessor as unknown as ViMockFn;

    // Idempotent: trace components are created only once
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

    // Trace exporter configured with Axiom token and endpoint
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

    // Tracer provider is wired with the created resource and span processor
    const providerInstance = ProviderMock.mock.instances[0];
    // @ts-expect-error
    const resourceInstance = resourceFromAttributesMock.mock.results[0].value;
    const spanProcessorInstance = BatchSpanProcessorMock.mock.instances[0];

    expect(providerInstance.options.resource).toBe(resourceInstance);
    expect(providerInstance.options.spanProcessors).toEqual([
      spanProcessorInstance,
    ]);

    // Tracer provider is registered once
    expect(providerInstance.register).toHaveBeenCalledTimes(1);

    // Meter and logger providers are registered globally
    expect(apiMocks.mockSetGlobalMeterProvider).toHaveBeenCalledTimes(1);
    expect(logApiMocks.mockSetGlobalLoggerProvider).toHaveBeenCalledTimes(1);
  });
});

describe("getBrowserMetrics (browser)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates and caches counters and histograms via the global meter", () => {
    const metricsHelper = getBrowserMetrics();

    const counter = metricsHelper.getCounter("ui.view_count", {
      description: "View count",
      unit: "1",
    });
    const histogram = metricsHelper.getHistogram("ui.view_duration", {
      description: "View duration",
      unit: "ms",
    });

    expect(apiMocks.mockGetMeter).toHaveBeenCalledWith(
      "@o3osatoshi/telemetry/browser",
    );
    expect(apiMocks.mockMeterCreateCounter).toHaveBeenCalledWith(
      "ui.view_count",
      {
        description: "View count",
        unit: "1",
      },
    );
    expect(apiMocks.mockMeterCreateHistogram).toHaveBeenCalledWith(
      "ui.view_duration",
      {
        description: "View duration",
        unit: "ms",
      },
    );

    // Instruments are cached by name
    const counterAgain = metricsHelper.getCounter("ui.view_count");
    const histogramAgain = metricsHelper.getHistogram("ui.view_duration");

    expect(counterAgain).toBe(counter);
    expect(histogramAgain).toBe(histogram);
    expect(apiMocks.mockMeterCreateCounter).toHaveBeenCalledTimes(1);
    expect(apiMocks.mockMeterCreateHistogram).toHaveBeenCalledTimes(1);
  });
});

describe("createBrowserLogger (browser)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a process logger, emits records, and reuses the same instance", () => {
    const logger1 = createBrowserLogger();

    logger1.info("browser_info", {
      foo: "bar",
    });

    expect(logApiMocks.mockGetLogger).toHaveBeenCalledWith(
      "@o3osatoshi/telemetry/browser",
    );
    expect(logApiMocks.mockEmit).toHaveBeenCalledTimes(1);

    // @ts-expect-error – accessing Vitest mock internals for assertions
    const emitted = logApiMocks.mockEmit.mock.calls[0][0] as {
      attributes?: unknown;
      body: string;
      severityText: string;
    };
    expect(emitted.body).toBe("browser_info");
    expect(emitted.severityText).toBe("INFO");
    expect(emitted.attributes).toEqual({
      foo: "bar",
    });

    const logger2 = createBrowserLogger();
    expect(logger2).toBe(logger1);
    expect(logApiMocks.mockGetLogger).toHaveBeenCalledTimes(1);
  });
});

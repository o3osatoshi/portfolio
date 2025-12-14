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
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { WebTracerProvider } from "@opentelemetry/sdk-trace-web";
import { ATTR_SERVICE_NAME } from "@opentelemetry/semantic-conventions";

import type { BrowserSessionContext } from "./browser";
import { createBrowserLogger, initBrowserTelemetry } from "./browser";

// @ts-expect-error – accessing Vitest mock internals
const apiMocks = otel.__mocks as {
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

describe("initBrowserTelemetry", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("is idempotent and configures resource and exporter correctly", () => {
    const options = {
      axiom: {
        apiToken: "test-token",
        otlpEndpoint: "https://example.axiom.co/v1/traces",
      },
      dataset: "my-browser-dataset",
      env: "production",
      serviceName: "my-web-app",
    } as const;

    initBrowserTelemetry(options);
    // Second call should be a no-op
    initBrowserTelemetry({
      ...options,
      axiom: {
        apiToken: "other-token",
        otlpEndpoint: "https://other.example/v1/traces",
      },
    });

    type ViMockFn = ReturnType<typeof vi.fn>;
    const resourceFromAttributesMock =
      resourceFromAttributes as unknown as ViMockFn;
    const ExporterMock = OTLPTraceExporter as unknown as ViMockFn;
    const ProviderMock = WebTracerProvider as unknown as ViMockFn;
    const BatchSpanProcessorMock = BatchSpanProcessor as unknown as ViMockFn;

    // Idempotent: functions/constructors called only once
    expect(resourceFromAttributesMock).toHaveBeenCalledTimes(1);
    expect(ExporterMock).toHaveBeenCalledTimes(1);
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
        "X-Axiom-Dataset": options.dataset,
      },
      url: options.axiom.otlpEndpoint,
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

    // Provider is registered once
    expect(providerInstance.register).toHaveBeenCalledTimes(1);
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";

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

describe("edge logging helpers", () => {
  beforeEach(() => {
    vi.resetModules();
    h.emit.mockReset();
    h.flush.mockReset();
    h.createAxiomTransport.mockClear();
  });

  it("returns a no-op logger before initialization", async () => {
    const { createEdgeLogger } = await import("./edge");

    const logger = createEdgeLogger();
    logger.info("noop");

    expect(h.emit).not.toHaveBeenCalled();
    expect(h.createAxiomTransport).not.toHaveBeenCalled();
  });

  it("throws when creating a proxy handler before initialization", async () => {
    const { createEdgeProxyHandler } = await import("./edge");

    expect(() => createEdgeProxyHandler()).toThrow(
      "initEdgeLogger must be called before createEdgeProxyHandler",
    );
  });

  it("throws when initializing without client or transport", async () => {
    const { initEdgeLogger } = await import("./edge");

    expect(() =>
      initEdgeLogger({
        datasets: { events: "events", metrics: "metrics" },
        env: "production",
        service: "svc",
      }),
    ).toThrow("client or transport is required to initialize logging");
  });

  it("initializes immediate transport and logs request context", async () => {
    const events: Array<{ dataset: string; event: LogEvent }> = [];
    h.emit.mockImplementation((dataset, event) => {
      events.push({ dataset, event: event as LogEvent });
    });

    const {
      createEdgeLogger,
      initEdgeLogger,
      shutdownEdgeLogger,
      withRequestLogger,
    } = await import("./edge");

    initEdgeLogger({
      client: { token: "token" },
      datasets: { events: "events", metrics: "metrics" },
      env: "production",
      service: "svc",
    });

    initEdgeLogger({
      client: { token: "token" },
      datasets: { events: "events", metrics: "metrics" },
      env: "production",
      service: "svc",
    });

    expect(h.createAxiomTransport).toHaveBeenCalledTimes(1);
    expect(h.createAxiomTransport).toHaveBeenCalledWith(
      expect.objectContaining({ mode: "immediate", token: "token" }),
    );

    const baseLogger = createEdgeLogger();
    baseLogger.event("edge_ready", { region: "iad" });

    await withRequestLogger(
      {
        clientIp: "203.0.113.5",
        httpMethod: "GET",
        httpRoute: "/edge/healthz",
        requestId: "req-edge",
        traceparent: "00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01",
        userAgent: "edge-agent",
        userId: "user-1",
      },
      (request) => {
        request.logger.info("edge_request");
        request.setUserId("user-2");
        request.logger.info("edge_user");
      },
    );

    expect(events).toHaveLength(3);

    const requestEvent = events.find(
      (entry) => entry.event.message === "edge_request",
    );
    expect(requestEvent).toBeDefined();
    const requestData = requestEvent?.event as LogEvent;
    expect(requestData["request.id"]).toBe("req-edge");
    expect(requestData["http.method"]).toBe("GET");
    expect(requestData["http.route"]).toBe("/edge/healthz");
    expect(requestData["client.address"]).toBe("203.0.113.5");
    expect(requestData["user_agent.original"]).toBe("edge-agent");
    expect(requestData["parent_span_id"]).toBe("00f067aa0ba902b7");
    expect(requestData["trace_id"]).toMatch(/^[0-9a-f]{32}$/i);
    expect(requestData["span_id"]).toMatch(/^[0-9a-f]{16}$/i);
    expect(requestData["enduser.id"]).toBe("user-1");

    const userEvent = events.find(
      (entry) => entry.event.message === "edge_user",
    );
    expect(userEvent).toBeDefined();
    const userData = userEvent?.event as LogEvent;
    expect(userData["enduser.id"]).toBe("user-2");

    expect(h.flush).toHaveBeenCalledTimes(1);

    await shutdownEdgeLogger();
  });

  it("samples request loggers once per request", async () => {
    const events: Array<{ dataset: string; event: LogEvent }> = [];
    h.emit.mockImplementation((dataset, event) => {
      events.push({ dataset, event: event as LogEvent });
    });

    const { initEdgeLogger, shutdownEdgeLogger, withRequestLogger } =
      await import("./edge");

    initEdgeLogger({
      client: { token: "token" },
      datasets: { events: "events", metrics: "metrics" },
      env: "production",
      sampleRate: 0.5,
      service: "svc",
    });

    const randomSpy = vi.spyOn(Math, "random").mockReturnValue(0.1);

    await withRequestLogger(
      { httpMethod: "GET", httpRoute: "/sample" },
      (request) => {
        request.logger.info("sampled");
        request.logger.event("sampled_event");
        request.logger.metric("sampled_metric", 1);
      },
    );

    expect(randomSpy).toHaveBeenCalledTimes(1);
    expect(events).toHaveLength(3);

    events.length = 0;
    randomSpy.mockClear();
    randomSpy.mockReturnValue(0.9);

    await withRequestLogger(
      { httpMethod: "GET", httpRoute: "/sample" },
      (request) => {
        request.logger.info("dropped");
        request.logger.metric("dropped_metric", 1);
      },
    );

    expect(randomSpy).toHaveBeenCalledTimes(1);
    expect(events).toHaveLength(0);

    randomSpy.mockRestore();

    await shutdownEdgeLogger();
  });

  it("uses a custom transport and skips flush when disabled", async () => {
    const customTransport = {
      emit: vi.fn(),
      flush: vi.fn().mockResolvedValue(undefined),
    };

    const { initEdgeLogger, shutdownEdgeLogger, withRequestLogger } =
      await import("./edge");

    initEdgeLogger({
      datasets: { events: "events", metrics: "metrics" },
      env: "production",
      flushOnEnd: false,
      service: "svc",
      transport: customTransport,
    });

    await withRequestLogger(
      { httpMethod: "GET", httpRoute: "/edge" },
      (request) => {
        request.logger.info("edge_custom");
      },
    );

    expect(customTransport.emit).toHaveBeenCalledTimes(1);
    expect(customTransport.flush).not.toHaveBeenCalled();
    expect(h.createAxiomTransport).not.toHaveBeenCalled();

    await shutdownEdgeLogger();

    expect(customTransport.flush).toHaveBeenCalledTimes(1);
  });

  it("creates a proxy handler with the active edge transport", async () => {
    const customTransport = {
      emit: vi.fn(),
      flush: vi.fn().mockResolvedValue(undefined),
    };

    const { createEdgeProxyHandler, initEdgeLogger, shutdownEdgeLogger } =
      await import("./edge");

    initEdgeLogger({
      datasets: { events: "events", metrics: "metrics" },
      env: "production",
      service: "svc",
      transport: customTransport,
    });

    const handler = createEdgeProxyHandler();
    const response = await handler(
      new Request("http://example.test", {
        body: JSON.stringify({
          eventSets: [{ dataset: "events", event: { timestamp: "now" } }],
        }),
        method: "POST",
      }),
    );

    expect(response.status).toBe(200);
    expect(customTransport.emit).toHaveBeenCalledTimes(1);

    await shutdownEdgeLogger();
  });
});

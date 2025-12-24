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

describe("node logging helpers", () => {
  beforeEach(() => {
    vi.resetModules();
    h.emit.mockReset();
    h.flush.mockReset();
    h.createAxiomTransport.mockClear();
  });

  it("returns a no-op logger before initialization", async () => {
    const { createNodeLogger } = await import("./node");

    const logger = createNodeLogger();
    logger.info("noop", { "request.id": "req-1" });

    expect(h.emit).not.toHaveBeenCalled();
    expect(h.createAxiomTransport).not.toHaveBeenCalled();
  });

  it("throws when initializing without client or transport", async () => {
    const { initNodeLogger } = await import("./node");

    expect(() =>
      initNodeLogger({
        datasets: { logs: "logs", metrics: "metrics" },
        env: "production",
        service: "svc",
      }),
    ).toThrow("client or transport is required to initialize logging");
  });

  it("initializes Axiom transport in batch mode and shuts down", async () => {
    const { initNodeLogger, shutdownNodeLogger } = await import("./node");

    initNodeLogger({
      client: { token: "token" },
      datasets: { logs: "logs", metrics: "metrics" },
      env: "production",
      flushOnExit: false,
      service: "svc",
    });

    initNodeLogger({
      client: { token: "token" },
      datasets: { logs: "logs", metrics: "metrics" },
      env: "production",
      flushOnExit: false,
      service: "svc",
    });

    expect(h.createAxiomTransport).toHaveBeenCalledTimes(1);
    expect(h.createAxiomTransport).toHaveBeenCalledWith(
      expect.objectContaining({ mode: "batch", token: "token" }),
    );

    await shutdownNodeLogger();

    expect(h.flush).toHaveBeenCalledTimes(1);
  });

  it("uses a provided transport without creating Axiom transport", async () => {
    const { createNodeLogger, initNodeLogger, shutdownNodeLogger } =
      await import("./node");

    const customTransport = {
      emit: vi.fn(),
      flush: vi.fn().mockResolvedValue(undefined),
    };

    initNodeLogger({
      datasets: { logs: "logs", metrics: "metrics" },
      env: "production",
      flushOnExit: false,
      service: "svc",
      transport: customTransport,
    });

    const logger = createNodeLogger();
    logger.info("custom_transport");

    expect(customTransport.emit).toHaveBeenCalledTimes(1);
    expect(h.createAxiomTransport).not.toHaveBeenCalled();

    await shutdownNodeLogger();

    expect(customTransport.flush).toHaveBeenCalledTimes(1);
  });

  it("does not flush request loggers by default", async () => {
    const { initNodeLogger, shutdownNodeLogger, withRequestLogger } =
      await import("./node");

    initNodeLogger({
      client: { token: "token" },
      datasets: { logs: "logs", metrics: "metrics" },
      env: "production",
      flushOnExit: false,
      service: "svc",
    });

    await withRequestLogger(
      { httpMethod: "GET", httpRoute: "/healthz" },
      (request) => {
        request.logger.info("request_started");
      },
    );

    expect(h.flush).not.toHaveBeenCalled();

    await shutdownNodeLogger();
  });

  it("binds request context and flushes on completion", async () => {
    const events: Array<{ dataset: string; event: LogEvent }> = [];
    h.emit.mockImplementation((dataset, event) => {
      events.push({ dataset, event: event as LogEvent });
    });

    const {
      getActiveRequestLogger,
      initNodeLogger,
      shutdownNodeLogger,
      withRequestLogger,
    } = await import("./node");

    initNodeLogger({
      client: { token: "token" },
      datasets: { logs: "logs", metrics: "metrics" },
      env: "production",
      flushOnEnd: true,
      flushOnExit: false,
      service: "svc",
    });

    const result = await withRequestLogger(
      {
        clientIp: "127.0.0.1",
        httpMethod: "GET",
        httpRoute: "/items/:id",
        requestId: "req-1",
        traceparent: "00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01",
        userAgent: "test-agent",
        userId: "user-1",
      },
      async (request) => {
        expect(getActiveRequestLogger()).toBe(request);

        request.logger.info("request_started");
        request.setUserId("user-2");
        request.logger.info("user_updated");

        return "ok";
      },
    );

    expect(result).toBe("ok");
    expect(events).toHaveLength(2);

    const first = events[0]?.event as LogEvent;
    expect(first["request.id"]).toBe("req-1");
    expect(first["http.method"]).toBe("GET");
    expect(first["http.route"]).toBe("/items/:id");
    expect(first["client.address"]).toBe("127.0.0.1");
    expect(first["user_agent.original"]).toBe("test-agent");
    expect(first["parent_span_id"]).toBe("00f067aa0ba902b7");
    expect(first["trace_id"]).toMatch(/^[0-9a-f]{32}$/i);
    expect(first["span_id"]).toMatch(/^[0-9a-f]{16}$/i);
    expect(first["enduser.id"]).toBe("user-1");

    const second = events[1]?.event as LogEvent;
    expect(second["enduser.id"]).toBe("user-2");

    expect(h.flush).toHaveBeenCalledTimes(1);
    expect(getActiveRequestLogger()).toBeUndefined();

    await shutdownNodeLogger();
  });
});

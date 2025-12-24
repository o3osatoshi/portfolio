import { describe, expect, it } from "vitest";

import type { LogEvent, Transport } from "../types";
import { createLogger } from "./logger";

describe("createLogger", () => {
  it("emits log events to the logs dataset", () => {
    const calls: Array<{ dataset: string; event: LogEvent }> = [];
    const transport: Transport = {
      emit: (dataset, event) => {
        calls.push({ dataset, event: event as LogEvent });
      },
    };

    const logger = createLogger({
      attributes: { "service.name": "svc" },
      datasets: { logs: "logs", metrics: "metrics" },
      transport,
    });

    logger.info("request_started", { "request.id": "req-1" });

    expect(calls).toHaveLength(1);
    expect(calls[0]?.dataset).toBe("logs");
    expect(calls[0]?.event["event.type"]).toBe("log");
    expect(calls[0]?.event.message).toBe("request_started");
    expect(calls[0]?.event["request.id"]).toBe("req-1");
  });

  it("emits metrics to the metrics dataset", () => {
    const calls: Array<{ dataset: string; event: LogEvent }> = [];
    const transport: Transport = {
      emit: (dataset, event) => {
        calls.push({ dataset, event: event as LogEvent });
      },
    };

    const logger = createLogger({
      attributes: { "service.name": "svc" },
      datasets: { logs: "logs", metrics: "metrics" },
      transport,
    });

    logger.metric(
      "http.server.duration",
      123,
      { "http.route": "/" },
      {
        kind: "histogram",
        unit: "ms",
      },
    );

    expect(calls).toHaveLength(1);
    expect(calls[0]?.dataset).toBe("metrics");
    expect(calls[0]?.event["metric.name"]).toBe("http.server.duration");
    expect(calls[0]?.event["metric.value"]).toBe(123);
    expect(calls[0]?.event["metric.kind"]).toBe("histogram");
  });

  it("respects minLevel filtering", () => {
    const calls: Array<{ dataset: string; event: LogEvent }> = [];
    const transport: Transport = {
      emit: (dataset, event) => {
        calls.push({ dataset, event: event as LogEvent });
      },
    };

    const logger = createLogger({
      attributes: {},
      datasets: { logs: "logs", metrics: "metrics" },
      minLevel: "warn",
      transport,
    });

    logger.debug("debug", {});
    logger.info("info", {});
    logger.warn("warn", {});

    expect(calls).toHaveLength(1);
    expect(calls[0]?.event.message).toBe("warn");
  });

  it("respects sampling rate boundaries", () => {
    const calls: Array<{ dataset: string; event: LogEvent }> = [];
    const transport: Transport = {
      emit: (dataset, event) => {
        calls.push({ dataset, event: event as LogEvent });
      },
    };

    const logger = createLogger({
      attributes: {},
      datasets: { logs: "logs", metrics: "metrics" },
      sampleRate: 0,
      transport,
    });

    logger.info("ignored");
    expect(calls).toHaveLength(0);

    const loggerAll = createLogger({
      attributes: {},
      datasets: { logs: "logs", metrics: "metrics" },
      sampleRate: 1,
      transport,
    });

    loggerAll.info("captured");
    expect(calls).toHaveLength(1);
  });

  it("merges child attributes and serializes errors", () => {
    const calls: Array<{ dataset: string; event: LogEvent }> = [];
    const transport: Transport = {
      emit: (dataset, event) => {
        calls.push({ dataset, event: event as LogEvent });
      },
    };

    const logger = createLogger({
      attributes: { "service.name": "svc" },
      datasets: { logs: "logs", metrics: "metrics" },
      transport,
    });

    const child = logger.child({ "request.id": "req-1" });
    const error = new Error("boom");
    (error as { cause?: unknown } & Error).cause = new Error("timeout");

    child.error("request_failed", { "http.status_code": 500 }, error);

    expect(calls).toHaveLength(1);
    const event = calls[0]?.event ?? {};
    // @ts-expect-error
    expect(event["service.name"]).toBe("svc");
    // @ts-expect-error
    expect(event["request.id"]).toBe("req-1");
    // @ts-expect-error
    expect(event["http.status_code"]).toBe(500);
    // @ts-expect-error
    expect(event["exception.message"]).toBe("boom");
    // @ts-expect-error
    expect(event["exception.type"]).toBe("Error");
    // @ts-expect-error
    expect(event["exception.cause"]).toEqual(
      expect.objectContaining({ name: "Error", message: "timeout" }),
    );
  });
});

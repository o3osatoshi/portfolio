import { describe, expect, it } from "vitest";

import { newRichError } from "@o3osatoshi/toolkit";

import type { Attributes, LogEvent, Transport } from "../types";
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
      datasets: { events: "events", metrics: "metrics" },
      transport,
    });

    logger.info("request_started", { "request.id": "req-1" });

    expect(calls).toHaveLength(1);
    expect(calls[0]?.dataset).toBe("events");
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
      datasets: { events: "events", metrics: "metrics" },
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

  it("emits event records to the logs dataset", () => {
    const calls: Array<{ dataset: string; event: LogEvent }> = [];
    const transport: Transport = {
      emit: (dataset, event) => {
        calls.push({ dataset, event: event as LogEvent });
      },
    };

    const logger = createLogger({
      attributes: { "service.name": "svc" },
      datasets: { events: "events", metrics: "metrics" },
      transport,
    });

    logger.event("user_signup", { plan: "pro" });

    expect(calls).toHaveLength(1);
    expect(calls[0]?.dataset).toBe("events");
    expect(calls[0]?.event["event.type"]).toBe("event");
    expect(calls[0]?.event.message).toBe("user_signup");
    expect(calls[0]?.event["plan"]).toBe("pro");
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
      datasets: { events: "events", metrics: "metrics" },
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
      datasets: { events: "events", metrics: "metrics" },
      sampleRate: 0,
      transport,
    });

    logger.info("ignored");
    expect(calls).toHaveLength(0);

    const loggerAll = createLogger({
      attributes: {},
      datasets: { events: "events", metrics: "metrics" },
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
      datasets: { events: "events", metrics: "metrics" },
      transport,
    });

    const child = logger.child({ "request.id": "req-1" });
    const error = newRichError({
      cause: new Error("timeout"),
      details: {
        action: "CreateTransaction",
        hint: "verify input",
        impact: "transaction not saved",
        reason: "amount is required",
      },
      isOperational: true,
      kind: "Validation",
      layer: "Domain",
    });

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
    expect(event["error.kind"]).toBe("Validation");
    // @ts-expect-error
    expect(event["error.layer"]).toBe("Domain");
    // @ts-expect-error
    expect(event["error.action"]).toBe("CreateTransaction");
    // @ts-expect-error
    expect(event["error.reason"]).toBe("amount is required");
    // @ts-expect-error
    expect(event["error.impact"]).toBe("transaction not saved");
    // @ts-expect-error
    expect(event["error.hint"]).toBe("verify input");
    // @ts-expect-error
    expect(event["error.causeText"]).toBe("timeout");
  });

  it("normalizes attribute values and omits undefined", () => {
    const calls: Array<{ dataset: string; event: LogEvent }> = [];
    const transport: Transport = {
      emit: (dataset, event) => {
        calls.push({ dataset, event: event as LogEvent });
      },
    };

    const timestamp = new Date("2024-01-01T00:00:00.000Z");

    const attributes = {
      "service.name": "svc",
      array: [1, undefined, "x"],
      big: 42n,
      date: timestamp,
      empty: undefined,
      nested: { inner: { value: 1 } },
      object: { foo: "bar", skip: undefined },
    } as unknown as Attributes;

    const logger = createLogger({
      attributes,
      datasets: { events: "events", metrics: "metrics" },
      transport,
    });

    logger.info("normalized", { extra: undefined, ok: true } as Attributes);

    const event = calls[0]?.event as LogEvent;
    expect(event["big"]).toBe("42");
    expect(event["date"]).toBe(timestamp.toISOString());
    expect(event["array"]).toEqual([1, "x"]);
    expect(event["object"]).toEqual({ foo: "bar" });
    expect(event["nested"]).toEqual({ inner: { value: 1 } });
    expect(event["ok"]).toBe(true);
    expect("empty" in event).toBe(false);
    expect("extra" in event).toBe(false);
  });
});

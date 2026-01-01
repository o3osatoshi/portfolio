import { errAsync, okAsync } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import type { Logger } from "@o3osatoshi/logging";

import { withMetrics } from "./with-metrics";

const buildResponse = (status: number, ok = status < 400) =>
  okAsync({
    cached: false,
    data: { ok: true },
    meta: { attempts: 2, cacheHit: true },
    response: {
      headers: new Headers(),
      ok,
      status,
      statusText: ok ? "OK" : "ERR",
      url: "https://example.test",
    },
  });

const buildLogger = () => {
  // @ts-expect-error
  const logger = {
    // @ts-expect-error
    child: vi.fn(() => logger),
    debug: vi.fn(),
    error: vi.fn(),
    event: vi.fn(),
    flush: vi.fn(async () => {}),
    info: vi.fn(),
    metric: vi.fn(),
    warn: vi.fn(),
  } satisfies Logger;
  return logger;
};

describe("integrations/http withMetrics", () => {
  it("returns the original client when no logger is provided", () => {
    const next = vi.fn();
    const client = withMetrics(next);
    expect(client).toBe(next);
  });

  it("emits metrics for successful responses", async () => {
    const logger = buildLogger();
    const nowSpy = vi
      .spyOn(Date, "now")
      .mockReturnValueOnce(1000)
      .mockReturnValueOnce(1300);
    const next = vi.fn(() => buildResponse(200, true));
    // @ts-expect-error
    const client = withMetrics(next, {
      logger,
      redactUrl: (url) => `redacted:${url}`,
      requestName: "exchange_rate",
    });

    const result = await client({ method: "GET", url: "https://example.test" });

    expect(result.isOk()).toBe(true);
    expect(logger.metric).toHaveBeenCalledTimes(2);
    const [reqName, reqValue, reqAttrs, reqOpts] =
      logger.metric.mock.calls[0] ?? [];
    expect(reqName).toBe("http.client.requests");
    expect(reqValue).toBe(1);
    expect(reqOpts).toEqual({ kind: "counter", unit: "1" });
    expect(reqAttrs).toEqual(
      expect.objectContaining({
        "http.request.name": "exchange_rate",
        "cache.hit": true,
        "http.method": "GET",
        "http.status_code": 200,
        "http.url": "redacted:https://example.test",
        "retry.attempts": 2,
      }),
    );
    const [durName, durValue, durAttrs, durOpts] =
      logger.metric.mock.calls[1] ?? [];
    expect(durName).toBe("http.client.request.duration");
    expect(durValue).toBe(300);
    expect(durOpts).toEqual({ kind: "histogram", unit: "ms" });
    expect(durAttrs).toEqual(expect.objectContaining({ "http.method": "GET" }));

    nowSpy.mockRestore();
  });

  it("emits metrics for error responses", async () => {
    const logger = buildLogger();
    const nowSpy = vi
      .spyOn(Date, "now")
      .mockReturnValueOnce(2000)
      .mockReturnValueOnce(2600);
    const error = new Error("timeout");
    error.name = "ExternalTimeoutError";
    const next = vi.fn(() => errAsync(error));
    const client = withMetrics(next, {
      logger,
      requestName: "exchange_rate",
    });

    const result = await client({ method: "GET", url: "https://example.test" });

    expect(result.isErr()).toBe(true);
    expect(logger.metric).toHaveBeenCalledTimes(2);
    const [reqName, , reqAttrs] = logger.metric.mock.calls[0] ?? [];
    expect(reqName).toBe("http.client.requests");
    expect(reqAttrs).toEqual(
      expect.objectContaining({
        "http.request.name": "exchange_rate",
        "error.kind": "Timeout",
        "error.layer": "External",
        "http.method": "GET",
      }),
    );
    const [durName, durValue, durAttrs] = logger.metric.mock.calls[1] ?? [];
    expect(durName).toBe("http.client.request.duration");
    expect(durValue).toBe(600);
    expect(durAttrs).toEqual(
      expect.objectContaining({
        "error.kind": "Timeout",
        "error.layer": "External",
      }),
    );

    nowSpy.mockRestore();
  });
});

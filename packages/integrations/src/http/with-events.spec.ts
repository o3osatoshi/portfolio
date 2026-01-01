import { errAsync, okAsync } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import type { Logger } from "@o3osatoshi/logging";

import { withEvents } from "./with-events";

const buildResponse = (status: number, ok = status < 400) =>
  okAsync({
    cached: false,
    data: { ok: true },
    meta: { attempts: 2, cacheHit: false },
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

describe("integrations/http withEvents", () => {
  it("returns the original client when no logger is provided", () => {
    const next = vi.fn();
    const client = withEvents(next);
    expect(client).toBe(next);
  });

  it("logs warn on 4xx responses", async () => {
    const logger = buildLogger();
    const next = vi.fn(() => buildResponse(404, false));
    // @ts-expect-error
    const client = withEvents(next, {
      logger,
      redactUrl: (url) => `redacted:${url}`,
      requestName: "exchange_rate",
    });

    // @ts-expect-error
    const result = await client({ method: "GET", url: "https://example.test" });

    expect(result.isOk()).toBe(true);
    expect(logger.warn).toHaveBeenCalledTimes(1);
    expect(logger.error).not.toHaveBeenCalled();
    const [message, attributes] = logger.warn.mock.calls[0] ?? [];
    expect(message).toBe("http_client_error");
    expect(attributes).toEqual(
      expect.objectContaining({
        "http.request.name": "exchange_rate",
        "cache.hit": false,
        "http.method": "GET",
        "http.status_code": 404,
        "http.url": "redacted:https://example.test",
        "retry.attempts": 2,
      }),
    );
  });

  it("logs error on retryable failures", async () => {
    const logger = buildLogger();
    const error = new Error("timeout");
    error.name = "ExternalTimeoutError";
    const next = vi.fn(() => errAsync(error));
    const client = withEvents(next, {
      logger,
      redactUrl: (url) => url,
      requestName: "exchange_rate",
    });

    // @ts-expect-error
    const result = await client({ method: "GET", url: "https://example.test" });

    expect(result.isErr()).toBe(true);
    expect(logger.error).toHaveBeenCalledTimes(1);
    const [message, attributes, loggedError] = logger.error.mock.calls[0] ?? [];
    expect(message).toBe("http_client_error");
    expect(attributes).toEqual(
      expect.objectContaining({
        "http.request.name": "exchange_rate",
        "error.kind": "Timeout",
        "error.layer": "External",
        "http.method": "GET",
        "http.url": "https://example.test",
      }),
    );
    expect(loggedError).toBe(error);
  });
});

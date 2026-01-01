import { errAsync, okAsync } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import type { Logger } from "@o3osatoshi/logging";

import { withLogging } from "./with-logging";

const buildLogger = () => {
  // @ts-expect-error partial mock for testing
  const logger = {
    // @ts-expect-error partial mock for testing
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

const buildResponse = (
  status: number,
  ok = status < 400,
  cached = false,
  attempts = 1,
  cacheHit = false,
) =>
  okAsync({
    cached,
    data: { result: "success" },
    meta: { attempts, cacheHit },
    response: {
      headers: new Headers({ "content-type": "application/json" }),
      ok,
      status,
      statusText: ok ? "OK" : "ERR",
      url: "https://example.test/api",
    },
  });

const buildError = (name: string, message: string, retryAttempts?: number) => {
  const error = new Error(message);
  error.name = name;
  if (retryAttempts !== undefined) {
    (error as any).retryAttempts = retryAttempts;
  }
  return error;
};

describe("integrations/http withLogging", () => {
  describe("configuration", () => {
    it("returns next client when logger is not provided", async () => {
      const next = vi.fn(() => buildResponse(200));
      // @ts-expect-error
      const client = withLogging(next, {});

      // @ts-expect-error partial mock for testing
      const result = await client({ url: "https://example.test" });

      expect(result.isOk()).toBe(true);
      expect(next).toHaveBeenCalledTimes(1);
    });

    it("returns next client when logger is undefined", async () => {
      const next = vi.fn(() => buildResponse(200));
      // @ts-expect-error
      const client = withLogging(next, { logger: undefined });

      // @ts-expect-error partial mock for testing
      const result = await client({ url: "https://example.test" });

      expect(result.isOk()).toBe(true);
      expect(next).toHaveBeenCalledTimes(1);
    });

    it("uses default redactUrl when not provided", async () => {
      const logger = buildLogger();
      const next = vi.fn(() => buildResponse(200));
      // @ts-expect-error
      const client = withLogging(next, { logger });

      // @ts-expect-error partial mock for testing
      await client({ url: "https://example.test/secret" });

      expect(logger.metric).toHaveBeenCalledWith(
        "http.client.requests",
        1,
        expect.objectContaining({
          "http.url": "https://example.test/secret",
        }),
        expect.any(Object),
      );
    });

    it("uses custom redactUrl when provided", async () => {
      const logger = buildLogger();
      const redactUrl = vi.fn((url: string) => url.replace("secret", "***"));
      const next = vi.fn(() => buildResponse(200));
      // @ts-expect-error
      const client = withLogging(next, { logger, redactUrl });

      // @ts-expect-error partial mock for testing
      await client({ url: "https://example.test/secret" });

      expect(redactUrl).toHaveBeenCalledWith("https://example.test/secret");
      expect(logger.metric).toHaveBeenCalledWith(
        "http.client.requests",
        1,
        expect.objectContaining({
          "http.url": "https://example.test/***",
        }),
        expect.any(Object),
      );
    });

    it("includes requestName in attributes when provided", async () => {
      const logger = buildLogger();
      const next = vi.fn(() => buildResponse(200));
      // @ts-expect-error
      const client = withLogging(next, { logger, requestName: "test_api" });

      // @ts-expect-error partial mock for testing
      await client({ url: "https://example.test" });

      expect(logger.metric).toHaveBeenCalledWith(
        "http.client.requests",
        1,
        expect.objectContaining({
          "http.request.name": "test_api",
        }),
        expect.any(Object),
      );
    });
  });

  describe("success cases with metrics", () => {
    it("emits metrics for successful requests", async () => {
      const logger = buildLogger();
      const next = vi.fn(() => buildResponse(200));
      // @ts-expect-error
      const client = withLogging(next, { logger });

      // @ts-expect-error partial mock for testing
      const result = await client({ url: "https://example.test" });

      expect(result.isOk()).toBe(true);
      expect(logger.metric).toHaveBeenCalledTimes(2);

      // Request counter metric
      expect(logger.metric).toHaveBeenCalledWith(
        "http.client.requests",
        1,
        expect.objectContaining({
          "cache.hit": false,
          "http.method": "GET",
          "http.status_code": 200,
          "http.url": "https://example.test",
          "retry.attempts": 1,
        }),
        { kind: "counter", unit: "1" },
      );

      // Duration histogram metric
      expect(logger.metric).toHaveBeenCalledWith(
        "http.client.request.duration",
        expect.any(Number),
        expect.objectContaining({
          "cache.hit": false,
          "http.method": "GET",
          "http.status_code": 200,
          "http.url": "https://example.test",
          "retry.attempts": 1,
        }),
        { kind: "histogram", unit: "ms" },
      );
    });

    it("includes cache hit information in metrics", async () => {
      const logger = buildLogger();
      const next = vi.fn(() => buildResponse(200, true, true, 1, true));
      // @ts-expect-error
      const client = withLogging(next, { logger });

      // @ts-expect-error partial mock for testing
      await client({ url: "https://example.test" });

      expect(logger.metric).toHaveBeenCalledWith(
        "http.client.requests",
        1,
        expect.objectContaining({
          "cache.hit": true,
        }),
        { kind: "counter", unit: "1" },
      );
    });

    it("includes retry attempts in metrics", async () => {
      const logger = buildLogger();
      const next = vi.fn(() => buildResponse(200, true, false, 3));
      // @ts-expect-error
      const client = withLogging(next, { logger });

      // @ts-expect-error partial mock for testing
      await client({ url: "https://example.test" });

      expect(logger.metric).toHaveBeenCalledWith(
        "http.client.requests",
        1,
        expect.objectContaining({
          "retry.attempts": 3,
        }),
        { kind: "counter", unit: "1" },
      );
    });

    it("handles different HTTP methods", async () => {
      const logger = buildLogger();
      const next = vi.fn(() => buildResponse(200));
      // @ts-expect-error
      const client = withLogging(next, { logger });

      // @ts-expect-error partial mock for testing
      await client({ method: "POST", url: "https://example.test" });

      expect(logger.metric).toHaveBeenCalledWith(
        "http.client.requests",
        1,
        expect.objectContaining({
          "http.method": "POST",
        }),
        expect.any(Object),
      );
    });

    it("measures request duration correctly", async () => {
      vi.useFakeTimers();
      const logger = buildLogger();
      const next = vi.fn(() => {
        vi.advanceTimersByTime(150);
        return buildResponse(200);
      });
      // @ts-expect-error
      const client = withLogging(next, { logger });

      // @ts-expect-error partial mock for testing
      const promise = client({ url: "https://example.test" });
      await vi.runAllTimersAsync();
      await promise;

      expect(logger.metric).toHaveBeenCalledWith(
        "http.client.request.duration",
        150,
        expect.any(Object),
        { kind: "histogram", unit: "ms" },
      );

      vi.useRealTimers();
    });
  });

  describe("HTTP error responses with events", () => {
    it("logs warn event for 4xx responses", async () => {
      const logger = buildLogger();
      const next = vi.fn(() => buildResponse(404, false));
      // @ts-expect-error
      const client = withLogging(next, { logger });

      // @ts-expect-error partial mock for testing
      const result = await client({ url: "https://example.test" });

      expect(result.isOk()).toBe(true);
      expect(logger.warn).toHaveBeenCalledWith(
        "http_client_error",
        expect.objectContaining({
          "http.method": "GET",
          "http.status_code": 404,
          "http.url": "https://example.test",
          "retry.attempts": 1,
        }),
      );
      expect(logger.error).not.toHaveBeenCalled();
    });

    it("logs error event for 5xx responses", async () => {
      const logger = buildLogger();
      const next = vi.fn(() => buildResponse(500, false));
      // @ts-expect-error
      const client = withLogging(next, { logger });

      // @ts-expect-error partial mock for testing
      const result = await client({ url: "https://example.test" });

      expect(result.isOk()).toBe(true);
      expect(logger.error).toHaveBeenCalledWith(
        "http_client_error",
        expect.objectContaining({
          "http.method": "GET",
          "http.status_code": 500,
          "http.url": "https://example.test",
          "retry.attempts": 1,
        }),
      );
      expect(logger.warn).not.toHaveBeenCalled();
    });

    it("does not log events for successful responses", async () => {
      const logger = buildLogger();
      const next = vi.fn(() => buildResponse(200));
      // @ts-expect-error
      const client = withLogging(next, { logger });

      // @ts-expect-error partial mock for testing
      await client({ url: "https://example.test" });

      expect(logger.error).not.toHaveBeenCalled();
      expect(logger.warn).not.toHaveBeenCalled();
    });
  });

  describe("error cases with events and metrics", () => {
    it("logs warn event for client errors (BadRequest)", async () => {
      const logger = buildLogger();
      const error = buildError("DomainBadRequestError", "Invalid input");
      const next = vi.fn(() => errAsync(error));
      const client = withLogging(next, { logger });

      // @ts-expect-error partial mock for testing
      const result = await client({ url: "https://example.test" });

      expect(result.isErr()).toBe(true);
      expect(logger.warn).toHaveBeenCalledWith(
        "http_client_error",
        expect.objectContaining({
          "error.name": "DomainBadRequestError",
          "error.kind": "BadRequest",
          "error.layer": "Domain",
          "error.message": "Invalid input",
          "http.method": "GET",
          "http.url": "https://example.test",
        }),
      );
    });

    it("logs error event for server errors", async () => {
      const logger = buildLogger();
      const error = buildError("ExternalTimeoutError", "Request timeout");
      const next = vi.fn(() => errAsync(error));
      const client = withLogging(next, { logger });

      // @ts-expect-error partial mock for testing
      const result = await client({ url: "https://example.test" });

      expect(result.isErr()).toBe(true);
      expect(logger.error).toHaveBeenCalledWith(
        "http_client_error",
        expect.objectContaining({
          "error.name": "ExternalTimeoutError",
          "error.kind": "Timeout",
          "error.layer": "External",
          "error.message": "Request timeout",
        }),
        error,
      );
    });

    it("includes retry attempts in error events", async () => {
      const logger = buildLogger();
      const error = buildError("ExternalTimeoutError", "Timeout", 3);
      const next = vi.fn(() => errAsync(error));
      const client = withLogging(next, { logger });

      // @ts-expect-error partial mock for testing
      await client({ url: "https://example.test" });

      expect(logger.error).toHaveBeenCalledWith(
        "http_client_error",
        expect.objectContaining({
          "retry.attempts": 3,
        }),
        error,
      );
    });

    it("emits metrics for error cases", async () => {
      const logger = buildLogger();
      const error = buildError("ExternalTimeoutError", "Timeout", 2);
      const next = vi.fn(() => errAsync(error));
      const client = withLogging(next, { logger });

      // @ts-expect-error partial mock for testing
      await client({ url: "https://example.test" });

      expect(logger.metric).toHaveBeenCalledWith(
        "http.client.requests",
        1,
        expect.objectContaining({
          "error.kind": "Timeout",
          "error.layer": "External",
          "retry.attempts": 2,
        }),
        { kind: "counter", unit: "1" },
      );
    });

    it("handles errors without parsed name", async () => {
      const logger = buildLogger();
      const error = buildError("UnknownError", "Something went wrong");
      const next = vi.fn(() => errAsync(error));
      const client = withLogging(next, { logger });

      // @ts-expect-error partial mock for testing
      await client({ url: "https://example.test" });

      expect(logger.error).toHaveBeenCalledWith(
        "http_client_error",
        expect.objectContaining({
          "error.name": "UnknownError",
          "error.message": "Something went wrong",
        }),
        error,
      );
    });
  });

  describe("error level resolution", () => {
    const errorLevelTestCases = [
      { expectedLevel: "warn", kind: "BadRequest" },
      { expectedLevel: "warn", kind: "Validation" },
      { expectedLevel: "warn", kind: "NotFound" },
      { expectedLevel: "warn", kind: "Unauthorized" },
      { expectedLevel: "warn", kind: "Forbidden" },
      { expectedLevel: "warn", kind: "RateLimit" },
      { expectedLevel: "error", kind: "Timeout" },
      { expectedLevel: "error", kind: "InternalServer" },
      { expectedLevel: "error", kind: "BadGateway" },
      { expectedLevel: "error", kind: undefined },
    ];

    errorLevelTestCases.forEach(({ expectedLevel, kind }) => {
      it(`logs ${expectedLevel} for ${kind || "unknown"} errors`, async () => {
        const logger = buildLogger();
        const errorName = kind ? `External${kind}Error` : "UnknownError";
        const error = buildError(errorName, "Test error");
        const next = vi.fn(() => errAsync(error));
        const client = withLogging(next, { logger });

        // @ts-expect-error partial mock for testing
        await client({ url: "https://example.test" });

        if (expectedLevel === "error") {
          expect(logger.error).toHaveBeenCalledWith(
            "http_client_error",
            expect.any(Object),
            error,
          );
          expect(logger.warn).not.toHaveBeenCalled();
        } else {
          expect(logger.warn).toHaveBeenCalledWith(
            "http_client_error",
            expect.any(Object),
          );
          expect(logger.error).not.toHaveBeenCalled();
        }
      });
    });
  });

  describe("edge cases and attribute building", () => {
    it("handles missing response object", async () => {
      const logger = buildLogger();
      const next = vi.fn(() =>
        okAsync({
          cached: false,
          data: { result: "success" },
          meta: { attempts: 1 },
          response: undefined,
        }),
      );
      // @ts-expect-error
      const client = withLogging(next, { logger });

      // @ts-expect-error partial mock for testing
      await client({ url: "https://example.test" });

      expect(logger.metric).toHaveBeenCalledWith(
        "http.client.requests",
        1,
        expect.objectContaining({
          "http.status_code": undefined,
        }),
        expect.any(Object),
      );
    });

    it("handles missing meta object", async () => {
      const logger = buildLogger();
      const next = vi.fn(() =>
        okAsync({
          cached: false,
          data: { result: "success" },
          meta: undefined,
          response: {
            headers: new Headers(),
            ok: true,
            status: 200,
            statusText: "OK",
            url: "https://example.test",
          },
        }),
      );
      // @ts-expect-error
      const client = withLogging(next, { logger });

      // @ts-expect-error partial mock for testing
      await client({ url: "https://example.test" });

      expect(logger.metric).toHaveBeenCalledWith(
        "http.client.requests",
        1,
        expect.objectContaining({
          "cache.hit": undefined,
          "retry.attempts": undefined,
        }),
        expect.any(Object),
      );
    });

    it("defaults to GET method when not specified", async () => {
      const logger = buildLogger();
      const next = vi.fn(() => buildResponse(200));
      // @ts-expect-error
      const client = withLogging(next, { logger });

      // @ts-expect-error partial mock for testing
      await client({ url: "https://example.test" });

      expect(logger.metric).toHaveBeenCalledWith(
        "http.client.requests",
        1,
        expect.objectContaining({
          "http.method": "GET",
        }),
        expect.any(Object),
      );
    });

    it("ensures duration is never negative", async () => {
      vi.useFakeTimers();
      const logger = buildLogger();

      // Mock Date.now to return decreasing values (edge case)
      let callCount = 0;
      vi.spyOn(Date, "now").mockImplementation(() => {
        callCount++;
        return callCount === 1 ? 1000 : 500; // Second call returns earlier time
      });

      const next = vi.fn(() => buildResponse(200));
      // @ts-expect-error
      const client = withLogging(next, { logger });

      // @ts-expect-error partial mock for testing
      await client({ url: "https://example.test" });

      expect(logger.metric).toHaveBeenCalledWith(
        "http.client.request.duration",
        0, // Should be 0, not negative
        expect.any(Object),
        { kind: "histogram", unit: "ms" },
      );

      vi.spyOn(Date, "now").mockRestore();
      vi.useRealTimers();
    });
  });

  describe("integration scenarios", () => {
    it("handles both success metrics and error events in different requests", async () => {
      const logger = buildLogger();

      // Success case
      const successNext = vi.fn(() => buildResponse(200));
      // @ts-expect-error
      const successClient = withLogging(successNext, {
        logger,
        requestName: "success_test",
      });
      // @ts-expect-error partial mock for testing
      await successClient({ url: "https://example.test/success" });

      // Error case
      const errorNext = vi.fn(() => buildResponse(500, false));
      // @ts-expect-error
      const errorClient = withLogging(errorNext, {
        logger,
        requestName: "error_test",
      });
      // @ts-expect-error partial mock for testing
      await errorClient({ url: "https://example.test/error" });

      // Verify both metrics and events were logged
      expect(logger.metric).toHaveBeenCalledWith(
        "http.client.requests",
        1,
        expect.objectContaining({
          "http.request.name": "success_test",
          "http.status_code": 200,
        }),
        { kind: "counter", unit: "1" },
      );

      expect(logger.metric).toHaveBeenCalledWith(
        "http.client.requests",
        1,
        expect.objectContaining({
          "http.request.name": "error_test",
          "http.status_code": 500,
        }),
        { kind: "counter", unit: "1" },
      );

      expect(logger.error).toHaveBeenCalledWith(
        "http_client_error",
        expect.objectContaining({
          "http.request.name": "error_test",
          "http.status_code": 500,
        }),
      );
    });

    it("preserves original request and response data", async () => {
      const logger = buildLogger();
      const originalResponseData = {
        cached: false,
        data: { result: "success" },
        meta: { attempts: 1 },
        response: {
          headers: new Headers({ "content-type": "application/json" }),
          ok: true,
          status: 201,
          statusText: "OK",
          url: "https://example.test/api",
        },
      };
      const originalResponse = okAsync(originalResponseData);
      const next = vi.fn(() => originalResponse);
      // @ts-expect-error
      const client = withLogging(next, { logger });

      // @ts-expect-error partial mock for testing
      const result = await client({
        body: JSON.stringify({ test: true }),
        method: "POST",
        url: "https://example.test",
      });

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toEqual(originalResponseData);
      }

      expect(next).toHaveBeenCalledWith({
        body: JSON.stringify({ test: true }),
        method: "POST",
        url: "https://example.test",
      });
    });
  });
});

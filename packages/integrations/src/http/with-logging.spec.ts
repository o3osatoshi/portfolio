import { errAsync, okAsync } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import type { Logger } from "@o3osatoshi/logging";
import {
  type Kind,
  type Layer,
  newRichError,
  type RichError,
} from "@o3osatoshi/toolkit";

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

type BuildResponseOptions = {
  cache?: { hit: boolean; key?: string };
  retry?: { attempts: number };
};

const buildResponse = (
  status: number,
  ok = status < 400,
  options: BuildResponseOptions = {},
) =>
  okAsync({
    data: { result: "success" },
    ...(options.cache ? { cache: options.cache } : {}),
    ...(options.retry ? { retry: options.retry } : {}),
    response: {
      headers: new Headers({ "content-type": "application/json" }),
      ok,
      status,
      statusText: ok ? "OK" : "ERR",
      url: "https://example.test/api",
    },
  });

const buildError = (
  name: string,
  message: string,
  retryAttempts?: number,
  options?: { kind?: Kind; layer?: Layer },
): RichError => {
  const kind = options?.kind ?? "Internal";
  const layer = options?.layer ?? "External";
  const error = newRichError({
    details: {
      reason: message,
    },
    isOperational: kind !== "Internal" && kind !== "Serialization",
    kind,
    layer,
  });
  error.name = name;
  if (retryAttempts !== undefined) {
    (error as { retryAttempts?: number } & RichError).retryAttempts =
      retryAttempts;
  }
  return error;
};

describe("integrations/http withLogging", () => {
  describe("configuration", () => {
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
      const client = withLogging(next, { logger });

      // @ts-expect-error partial mock for testing
      await client({
        logging: { redactUrl },
        url: "https://example.test/secret",
      });

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
      const client = withLogging(next, { logger });

      // @ts-expect-error partial mock for testing
      await client({
        logging: { requestName: "test_api" },
        url: "https://example.test",
      });

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
          "http.method": "GET",
          "http.status_code": 200,
          "http.url": "https://example.test",
        }),
        { kind: "counter", unit: "1" },
      );

      // Duration histogram metric
      expect(logger.metric).toHaveBeenCalledWith(
        "http.client.request.duration",
        expect.any(Number),
        expect.objectContaining({
          "http.method": "GET",
          "http.status_code": 200,
          "http.url": "https://example.test",
        }),
        { kind: "histogram", unit: "ms" },
      );
    });

    it("includes cache hit information in metrics", async () => {
      const logger = buildLogger();
      const next = vi.fn(() =>
        buildResponse(200, true, {
          cache: { hit: true, key: "cache:key" },
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
          "cache.hit": true,
        }),
        { kind: "counter", unit: "1" },
      );
    });

    it("includes retry attempts in metrics", async () => {
      const logger = buildLogger();
      const next = vi.fn(() =>
        buildResponse(200, true, {
          retry: { attempts: 3 },
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
        "http_client_warn",
        expect.objectContaining({
          "http.method": "GET",
          "http.status_code": 404,
          "http.url": "https://example.test",
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
      const error = buildError(
        "DomainBadRequestError",
        "Invalid input",
        undefined,
        {
          kind: "BadRequest",
          layer: "Domain",
        },
      );
      const next = vi.fn(() => errAsync(error));
      const client = withLogging(next, { logger });

      // @ts-expect-error partial mock for testing
      const result = await client({ url: "https://example.test" });

      expect(result.isErr()).toBe(true);
      expect(logger.warn).toHaveBeenCalledWith(
        "http_client_warn",
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
      const error = buildError(
        "ExternalTimeoutError",
        "Request timeout",
        undefined,
        {
          kind: "Timeout",
          layer: "External",
        },
      );
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

    it("logs error events when retryAttempts is set", async () => {
      const logger = buildLogger();
      const error = buildError("ExternalTimeoutError", "Timeout", 3, {
        kind: "Timeout",
        layer: "External",
      });
      const next = vi.fn(() => errAsync(error));
      const client = withLogging(next, { logger });

      // @ts-expect-error partial mock for testing
      await client({ url: "https://example.test" });

      expect(logger.error).toHaveBeenCalledWith(
        "http_client_error",
        expect.objectContaining({
          "error.name": "ExternalTimeoutError",
          "error.kind": "Timeout",
          "error.layer": "External",
        }),
        error,
      );
    });

    it("emits metrics for error cases", async () => {
      const logger = buildLogger();
      const error = buildError("ExternalTimeoutError", "Timeout", 2, {
        kind: "Timeout",
        layer: "External",
      });
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
          "http.method": "GET",
          "http.url": "https://example.test",
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
      { expectedLevel: "error", kind: "Internal" },
      { expectedLevel: "error", kind: "BadGateway" },
      { expectedLevel: "error", kind: undefined },
    ] as const satisfies ReadonlyArray<{
      expectedLevel: "error" | "warn";
      kind: Kind | undefined;
    }>;

    errorLevelTestCases.forEach(({ expectedLevel, kind }) => {
      it(`logs ${expectedLevel} for ${kind || "unknown"} errors`, async () => {
        const logger = buildLogger();
        const errorName = kind ? `External${kind}Error` : "UnknownError";
        const error = buildError(errorName, "Test error", undefined, {
          kind: kind ?? "Internal",
          layer: "External",
        });
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
            "http_client_warn",
            expect.any(Object),
          );
          expect(logger.error).not.toHaveBeenCalled();
        }
      });
    });
  });

  describe("edge cases and attribute building", () => {
    it("handles missing cache and retry information", async () => {
      const logger = buildLogger();
      const next = vi.fn(() =>
        okAsync({
          data: { result: "success" },
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
      });
      // @ts-expect-error partial mock for testing
      await successClient({
        logging: { requestName: "success_test" },
        url: "https://example.test/success",
      });

      // Error case
      const errorNext = vi.fn(() => buildResponse(500, false));
      // @ts-expect-error
      const errorClient = withLogging(errorNext, {
        logger,
      });
      // @ts-expect-error partial mock for testing
      await errorClient({
        logging: { requestName: "error_test" },
        url: "https://example.test/error",
      });

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
        cache: { hit: false, key: "cache:key" },
        data: { result: "success" },
        response: {
          headers: new Headers({ "content-type": "application/json" }),
          ok: true,
          status: 201,
          statusText: "OK",
          url: "https://example.test/api",
        },
        retry: { attempts: 1 },
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

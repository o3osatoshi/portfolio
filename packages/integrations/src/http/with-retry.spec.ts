import { errAsync, okAsync } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import { newIntegrationError } from "../integration-error";
import { integrationErrorCodes } from "../integration-error-catalog";
import { withRetry } from "./with-retry";

const buildResponse = (status: number, headers: Headers, ok = status < 400) =>
  okAsync({
    data: "ok",
    response: {
      headers,
      ok,
      status,
      statusText: ok ? "OK" : "ERR",
      url: "https://example.test",
    },
  });

describe("integrations/http withRetry", () => {
  it("retries on retryable status and records attempts", async () => {
    vi.useFakeTimers();
    const randomSpy = vi.spyOn(Math, "random").mockReturnValue(0);

    const headers = { get: vi.fn(() => "1") } as unknown as Headers;
    let callCount = 0;
    const next = vi.fn(() => {
      callCount += 1;
      if (callCount < 3) {
        return buildResponse(503, headers, false);
      }
      return buildResponse(200, headers, true);
    });
    // @ts-expect-error
    const client = withRetry(next);

    // @ts-expect-error
    const promise = client({ url: "https://example.test" });
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result.isOk()).toBe(true);
    if (!result.isOk()) return;
    expect(callCount).toBe(3);
    expect(headers.get).toHaveBeenCalledWith("retry-after");
    expect(result.value.retry?.attempts).toBe(3);

    randomSpy.mockRestore();
    vi.useRealTimers();
  });

  it("does not retry for non-idempotent methods", async () => {
    const headers = new Headers();
    const next = vi.fn(() => buildResponse(503, headers, false));
    // @ts-expect-error
    const client = withRetry(next);

    // @ts-expect-error
    const result = await client({
      method: "POST",
      url: "https://example.test",
    });

    expect(result.isOk()).toBe(true);
    if (!result.isOk()) return;
    expect(next).toHaveBeenCalledTimes(1);
    expect(result.value.retry?.attempts).toBe(1);
  });

  it("retries on retryable errors and enforces minimum attempts", async () => {
    vi.useFakeTimers();
    const randomSpy = vi.spyOn(Math, "random").mockReturnValue(0);

    const error = newIntegrationError({
      code: integrationErrorCodes.EXTERNAL_RETRY_EXHAUSTED,
      details: {
        action: "WithRetrySpec",
        reason: "timeout",
      },
      kind: "Timeout",
    });
    const next = vi.fn(() => errAsync(error));
    const client = withRetry(next, {
      baseDelayMs: 1,
      maxAttempts: 2,
      maxDelayMs: 1,
    });

    // @ts-expect-error
    const promise = client({ url: "https://example.test" });
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result.isErr()).toBe(true);
    if (!result.isErr()) return;
    expect(next).toHaveBeenCalledTimes(3);

    randomSpy.mockRestore();
    vi.useRealTimers();
  });
});

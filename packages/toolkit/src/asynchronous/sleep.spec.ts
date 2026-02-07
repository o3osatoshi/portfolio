import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { sleep } from "./sleep";

describe("sleep", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("resolves after the specified delay", async () => {
    const resultAsync = sleep(100);

    expect(vi.getTimerCount()).toBe(1);
    await vi.advanceTimersByTimeAsync(100);

    const result = await resultAsync;
    expect(result.isOk()).toBe(true);
    if (!result.isOk()) throw new Error("Expected sleep to resolve");
    expect(result.value).toBeUndefined();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("resolves when a signal is provided but not aborted", async () => {
    const controller = new AbortController();

    const resultAsync = sleep(50, { signal: controller.signal });

    expect(vi.getTimerCount()).toBe(1);
    await vi.advanceTimersByTimeAsync(50);

    const result = await resultAsync;
    expect(result.isOk()).toBe(true);
    if (!result.isOk()) throw new Error("Expected sleep to resolve");
    expect(result.value).toBeUndefined();
    expect(controller.signal.aborted).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("rejects immediately if the signal is already aborted", async () => {
    const controller = new AbortController();
    const abortReason = new Error("pre-canceled");
    controller.abort(abortReason);

    const resultAsync = sleep(25, { signal: controller.signal });

    expect(vi.getTimerCount()).toBe(0);

    const result = await resultAsync;
    expect(result.isErr()).toBe(true);
    if (!result.isErr()) throw new Error("Expected sleep to reject");
    expect(result.error.name).toBe("InfrastructureCanceledError");
    const message = result.error.message;
    expect(message).toContain("operation aborted by AbortSignal");
    expect(result.error).toHaveProperty("cause", abortReason);
  });

  it("rejects when the signal aborts while waiting", async () => {
    const controller = new AbortController();

    const resultAsync = sleep(75, { signal: controller.signal });

    expect(vi.getTimerCount()).toBe(1);

    const abortReason = new Error("manual cancel");
    controller.abort(abortReason);

    expect(vi.getTimerCount()).toBe(0);

    const result = await resultAsync;
    expect(result.isErr()).toBe(true);
    if (!result.isErr()) throw new Error("Expected sleep to reject");
    expect(result.error.name).toBe("InfrastructureCanceledError");
    const message = result.error.message;
    expect(message).toContain("operation aborted by AbortSignal");
    expect(result.error).toHaveProperty("cause", abortReason);
  });
});

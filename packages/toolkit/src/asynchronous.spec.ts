import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { sleep } from "./asynchronous";

describe("sleep", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("resolves after the specified delay", async () => {
    const promise = sleep(100);

    expect(vi.getTimerCount()).toBe(1);
    await vi.advanceTimersByTimeAsync(100);
    await expect(promise).resolves.toBeUndefined();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("resolves when a signal is provided but not aborted", async () => {
    const controller = new AbortController();
    const promise = sleep(50, { signal: controller.signal });

    expect(vi.getTimerCount()).toBe(1);
    await vi.advanceTimersByTimeAsync(50);
    await expect(promise).resolves.toBeUndefined();
    expect(controller.signal.aborted).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("rejects immediately if the signal is already aborted", async () => {
    const controller = new AbortController();
    const abortReason = new Error("pre-canceled");
    controller.abort(abortReason);

    const promise = sleep(25, { signal: controller.signal });

    expect(vi.getTimerCount()).toBe(0);

    let error: unknown;
    await promise.catch((err) => {
      error = err;
    });

    expect(error).toMatchObject({
      name: "InfraCanceledError",
      message: expect.stringContaining("operation aborted by AbortSignal"),
    });

    const typed = error as Error;
    expect(typed.message).include(abortReason.message);
  });

  it("rejects when the signal aborts while waiting", async () => {
    const controller = new AbortController();
    const promise = sleep(75, { signal: controller.signal });

    expect(vi.getTimerCount()).toBe(1);

    const abortReason = new Error("manual cancel");
    controller.abort(abortReason);

    expect(vi.getTimerCount()).toBe(0);

    let error: unknown;
    await promise.catch((err) => {
      error = err;
    });

    expect(error).toMatchObject({
      name: "InfraCanceledError",
      message: expect.stringContaining("operation aborted by AbortSignal"),
    });

    const typed = error as { cause?: unknown } & Error;
    expect(typed.cause).toBe(abortReason);
  });
});

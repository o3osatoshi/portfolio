import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { resolveAbortSignal } from "./resolve-abort-signal";

describe("resolveAbortSignal", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns the upstream signal when no timeout is provided", () => {
    const controller = new AbortController();
    const { cleanup, signal } = resolveAbortSignal({
      signal: controller.signal,
    });

    expect(signal).toBe(controller.signal);
    expect(vi.getTimerCount()).toBe(0);
    expect(() => cleanup()).not.toThrow();
  });

  it("aborts when the timeout elapses", async () => {
    const { signal } = resolveAbortSignal({ timeoutMs: 50 });

    expect(signal?.aborted).toBe(false);
    expect(vi.getTimerCount()).toBe(1);

    await vi.advanceTimersByTimeAsync(50);

    expect(signal?.aborted).toBe(true);
    const reason = signal?.reason as Error;
    expect(reason).toBeInstanceOf(Error);
    expect(reason.message).toBe("Operation timed out");
  });

  it("uses the provided timeout reason", async () => {
    const timeoutReason = "custom timeout";
    const { signal } = resolveAbortSignal({
      timeoutMs: 10,
      timeoutReason,
    });

    await vi.advanceTimersByTimeAsync(10);

    expect(signal?.aborted).toBe(true);
    expect(signal?.reason).toBe(timeoutReason);
  });

  it("propagates an already-aborted upstream signal", () => {
    const controller = new AbortController();
    const abortReason = new Error("upstream abort");
    controller.abort(abortReason);

    const { signal } = resolveAbortSignal({
      signal: controller.signal,
      timeoutMs: 25,
    });

    expect(vi.getTimerCount()).toBe(0);
    expect(signal?.aborted).toBe(true);
    expect(signal?.reason).toBe(abortReason);
  });

  it("propagates upstream abort events", () => {
    const controller = new AbortController();
    const { cleanup, signal } = resolveAbortSignal({
      signal: controller.signal,
      timeoutMs: 100,
    });

    const abortReason = new Error("manual abort");
    controller.abort(abortReason);

    expect(signal?.aborted).toBe(true);
    expect(signal?.reason).toBe(abortReason);
    cleanup();
  });

  it("cleanup clears timers and listeners", async () => {
    const controller = new AbortController();
    const { cleanup, signal } = resolveAbortSignal({
      signal: controller.signal,
      timeoutMs: 100,
    });

    expect(vi.getTimerCount()).toBe(1);
    cleanup();
    expect(vi.getTimerCount()).toBe(0);

    controller.abort(new Error("late abort"));
    await vi.advanceTimersByTimeAsync(100);

    expect(signal?.aborted).toBe(false);
  });
});

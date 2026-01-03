import type { StorePingResult, StorePingUseCase } from "@repo/application";
import type { StorePingNotification, StorePingNotifier } from "@repo/domain";
import type { Inngest } from "inngest";
import { errAsync, okAsync } from "neverthrow";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createStorePingFunction } from "./store-ping";

type CreatedFunction = {
  config: Record<string, unknown>;
  handler: (input: { step: { run: StepRun } }) => Promise<StorePingResult>;
  trigger: Record<string, unknown>;
};

type NotifyResult = ReturnType<StorePingNotifier["notify"]>;
type StepRun = (id: string, fn: () => Promise<unknown>) => Promise<unknown>;

const baseResult: StorePingResult = {
  db: {
    latestId: "run-1",
    prunedId: null,
    totalCount: 1,
  },
  durationMs: 120,
  jobKey: "store-ping",
  redis: {
    key: "store-ping:recent",
    size: 1,
  },
  runAt: new Date("2024-01-01T00:30:00.000Z"),
  runKey: "2024-01-01@00",
  slot: "00",
};

function createHarness(options: {
  notifyResults?: NotifyResult[];
  serializeRunAt?: boolean;
  storePingError?: Error;
  storePingResult?: StorePingResult;
}) {
  const notifyCalls: StorePingNotification[] = [];
  const notifyQueue: NotifyResult[] = [
    ...(options.notifyResults ?? [okAsync(undefined)]),
  ];
  const notifier: StorePingNotifier = {
    notify: (payload) => {
      notifyCalls.push(payload);
      return notifyQueue.shift() ?? okAsync(undefined);
    },
  };

  const execute = vi.fn((_context) => {
    if (options.storePingError) {
      return errAsync(options.storePingError);
    }
    return okAsync(options.storePingResult ?? baseResult);
  });
  // @ts-expect-error
  const storePing = { execute } as StorePingUseCase;

  const createFunction = vi.fn(
    (
      config: Record<string, unknown>,
      trigger: Record<string, unknown>,
      handler,
    ) => ({ config, handler, trigger }) as CreatedFunction,
  );
  const inngest = { createFunction } as unknown as Inngest;

  // @ts-expect-error
  const created = createStorePingFunction(inngest, {
    notifier,
    storePing,
  }) as CreatedFunction;

  const stepIds: string[] = [];
  const step: { run: StepRun } = {
    run: async (id, fn) => {
      stepIds.push(id);
      const value = await fn();
      if (id === "store-ping-run" && options.serializeRunAt) {
        const cast = value as StorePingResult;
        return {
          ...cast,
          runAt: cast.runAt.toISOString(),
        };
      }
      return value;
    },
  };

  return {
    created,
    execute,
    notifyCalls,
    step,
    stepIds,
  };
}

describe("createStorePingFunction", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("registers the JST cron schedule and metadata", () => {
    const { created } = createHarness({});

    expect(created.config).toMatchObject({
      id: "store-ping",
      name: "Store Ping",
      concurrency: 1,
    });
    expect(created.trigger).toEqual({
      cron: "CRON_TZ=Asia/Tokyo 0 0,12 * * *",
    });
  });

  it("hydrates runAt and notifies success", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-01T00:30:00.000Z"));
    const { created, execute, notifyCalls, step } = createHarness({
      serializeRunAt: true,
    });

    const result = await created.handler({ step });

    expect(result).toBeDefined();
    expect(result.runAt).toBeInstanceOf(Date);
    expect(execute).toHaveBeenCalledTimes(1);
    const calledContext = execute.mock.calls[0]?.[0];
    expect(calledContext?.jobKey).toBe("store-ping");
    expect(calledContext?.runAt).toBeInstanceOf(Date);
    expect(notifyCalls).toHaveLength(1);
    expect(notifyCalls[0]?.status).toBe("success");
    expect(notifyCalls[0]?.runAt).toBeInstanceOf(Date);
  });

  it("retries notification once before succeeding", async () => {
    const notifyError = new Error("temporary slack failure");
    const { created, notifyCalls, step } = createHarness({
      notifyResults: [errAsync(notifyError), okAsync(undefined)],
    });

    await created.handler({ step });

    expect(notifyCalls).toHaveLength(2);
  });

  it("notifies failure and rethrows the job error", async () => {
    const jobError = new Error("db down");
    const { created, notifyCalls, step } = createHarness({
      storePingError: jobError,
    });

    await expect(created.handler({ step })).rejects.toThrow("db down");
    expect(notifyCalls).toHaveLength(1);
    expect(notifyCalls[0]?.status).toBe("failure");
    expect(notifyCalls[0]?.error?.message).toBe("db down");
  });
});

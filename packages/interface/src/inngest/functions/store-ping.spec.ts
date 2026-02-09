import type { StorePingContext, StorePingResult } from "@repo/application";
import type {
  CacheStore,
  NotificationPayload,
  Notifier,
  TransactionRepository,
} from "@repo/domain";
import type { Inngest } from "inngest";
import { errAsync, okAsync } from "neverthrow";
import { afterEach, describe, expect, it, vi } from "vitest";

import { newRichError, type RichError } from "@o3osatoshi/toolkit";

import { createStorePingFunction } from "./store-ping";

const applicationMocks = vi.hoisted(() => {
  const execute = vi.fn();
  const generateStorePingContext = vi.fn();
  const storePingCtor = vi.fn();
  class StorePingUseCase {
    constructor(
      transactionRepo: TransactionRepository,
      cache: CacheStore,
      userId: string,
    ) {
      storePingCtor(transactionRepo, cache, userId);
    }
    execute(context: unknown, step: unknown) {
      return execute(context, step);
    }
  }
  return {
    execute,
    generateStorePingContext,
    storePingCtor,
    StorePingUseCase,
  };
});

vi.mock("@repo/application", () => ({
  generateStorePingContext: applicationMocks.generateStorePingContext,
  StorePingUseCase: applicationMocks.StorePingUseCase,
}));

type CreatedFunction = {
  config: Record<string, unknown>;
  handler: (input: { step: { run: StepRun } }) => Promise<StorePingResult>;
  trigger: Record<string, unknown>;
};

type HarnessOptions = {
  context?: StorePingContext;
  notifyResults?: NotifyResult[];
  storePingError?: RichError;
  storePingResult?: StorePingResult;
};
type NotifyResult = ReturnType<Notifier["notify"]>;

type StepRun = (id: string, fn: () => Promise<unknown>) => Promise<unknown>;

const testError = (reason: string) =>
  newRichError({
    details: {
      reason,
    },
    isOperational: false,
    kind: "Internal",
    layer: "External",
  });

const baseContext: StorePingContext = {
  jobKey: "store-ping",
  runAt: new Date("2024-01-01T00:30:00.000Z"),
  runKey: "2024-01-01@00",
  slot: "00",
};

const baseResult: StorePingResult = {
  ...baseContext,
  cache: {
    key: "store-ping:recent",
    size: 1,
  },
  db: {
    createdId: "tx-1",
    deletedId: "tx-1",
    readId: "tx-1",
  },
  durationMs: 120,
};

function createHarness(options: HarnessOptions) {
  const cache = {} as CacheStore;
  const transactionRepo = {} as TransactionRepository;
  const userId = "user-1";

  const notifyCalls: NotificationPayload[] = [];
  const notifyQueue: NotifyResult[] = [
    ...(options.notifyResults ?? [okAsync(undefined)]),
  ];
  const notifier: Notifier = {
    notify: (payload) => {
      notifyCalls.push(payload);
      return notifyQueue.shift() ?? okAsync(undefined);
    },
  };

  applicationMocks.execute.mockImplementation((_context, _step) => {
    if (options.storePingError) {
      return errAsync(options.storePingError);
    }
    return okAsync(options.storePingResult ?? baseResult);
  });
  applicationMocks.generateStorePingContext.mockReturnValue(
    options.context ?? baseContext,
  );

  const createFunction = vi.fn(
    (
      config: Record<string, unknown>,
      trigger: Record<string, unknown>,
      handler: CreatedFunction["handler"],
    ) => ({ config, handler, trigger }) as CreatedFunction,
  );
  const inngest = { createFunction } as unknown as Inngest;

  const created = createStorePingFunction(inngest, {
    cache,
    notifier,
    transactionRepo,
    userId,
  }) as unknown as CreatedFunction;

  const stepIds: string[] = [];
  const step: { run: StepRun } = {
    run: async (id, fn) => {
      stepIds.push(id);
      return fn();
    },
  };

  return {
    cache,
    created,
    createFunction,
    execute: applicationMocks.execute,
    generateStorePingContext: applicationMocks.generateStorePingContext,
    notifyCalls,
    step,
    stepIds,
    transactionRepo,
    userId,
  };
}

function toFieldMap(fields: NotificationPayload["fields"]) {
  return Object.fromEntries(
    (fields ?? []).map((field) => [field.label, field.value]),
  );
}

describe("createStorePingFunction", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("registers the JST cron schedule and metadata", () => {
    const { created, createFunction } = createHarness({});

    expect(createFunction).toHaveBeenCalledTimes(1);
    expect(created.config).toMatchObject({
      id: "store-ping",
      name: "Store Ping",
      concurrency: 1,
    });
    expect(created.trigger).toEqual({
      cron: "TZ=Asia/Tokyo 0 0,12 * * *",
    });
  });

  it("notifies success and returns the result", async () => {
    const {
      cache,
      created,
      execute,
      generateStorePingContext,
      notifyCalls,
      step,
      stepIds,
      transactionRepo,
      userId,
    } = createHarness({});

    const result = await created.handler({ step });

    expect(applicationMocks.storePingCtor).toHaveBeenCalledWith(
      transactionRepo,
      cache,
      userId,
    );
    expect(generateStorePingContext).toHaveBeenCalledWith(expect.any(Date));
    expect(execute).toHaveBeenCalledWith(baseContext, expect.any(Function));
    expect(result).toEqual(baseResult);

    expect(stepIds).toEqual(["store-ping-notify-success"]);
    expect(notifyCalls).toHaveLength(1);
    expect(notifyCalls[0]).toMatchObject({
      level: "success",
      message: "Store ping completed",
      title: "Store Ping",
    });

    const fieldMap = toFieldMap(notifyCalls[0]?.fields);
    expect(fieldMap).toMatchObject({
      "Cache Key": baseResult.cache.key,
      "Cache Size": `${baseResult.cache.size}`,
      "DB Created": baseResult.db.createdId,
      "DB Deleted": baseResult.db.deletedId,
      "DB Read": baseResult.db.readId,
      Duration: `${baseResult.durationMs}ms`,
      Job: baseContext.jobKey,
      "Run At": baseContext.runAt.toISOString(),
      "Run Key": baseContext.runKey,
      Slot: baseContext.slot,
    });
  });

  it("notifies failure when success notification fails", async () => {
    const notifyError = testError("temporary slack failure");
    const { created, notifyCalls, step, stepIds } = createHarness({
      notifyResults: [errAsync(notifyError), okAsync(undefined)],
    });

    await expect(created.handler({ step })).rejects.toThrow(
      "temporary slack failure",
    );
    expect(stepIds).toEqual([
      "store-ping-notify-success",
      "store-ping-notify-failure",
    ]);
    expect(notifyCalls).toHaveLength(2);
    expect(notifyCalls[0]?.level).toBe("success");
    expect(notifyCalls[1]).toMatchObject({
      level: "error",
      message: "Store ping failed",
      title: "Store Ping",
    });
    expect(notifyCalls[1]?.error?.message).toBe("temporary slack failure");
  });

  it("throws when failure notification fails", async () => {
    const notifyError = testError("slack outage");
    const { created, notifyCalls, step, stepIds } = createHarness({
      notifyResults: [errAsync(notifyError)],
      storePingError: testError("db down"),
    });

    await expect(created.handler({ step })).rejects.toThrow("slack outage");
    expect(stepIds).toEqual(["store-ping-notify-failure"]);
    expect(notifyCalls).toHaveLength(1);
    expect(notifyCalls[0]).toMatchObject({
      level: "error",
      message: "Store ping failed",
      title: "Store Ping",
    });
    expect(notifyCalls[0]?.error?.message).toBe("db down");
  });

  it("notifies failure and rethrows the job error", async () => {
    const jobError = testError("db down");
    const { created, notifyCalls, step, stepIds } = createHarness({
      storePingError: jobError,
    });

    await expect(created.handler({ step })).rejects.toThrow("db down");
    expect(stepIds).toEqual(["store-ping-notify-failure"]);
    expect(notifyCalls).toHaveLength(1);
    expect(notifyCalls[0]).toMatchObject({
      level: "error",
      message: "Store ping failed",
      title: "Store Ping",
    });
    expect(notifyCalls[0]?.error?.message).toBe("db down");
  });
});

import {
  generateStorePingContext,
  type StorePingContext,
  type StorePingResult,
  StorePingUseCase,
} from "@repo/application";
import type {
  CacheStore,
  StorePingNotification,
  StorePingNotifier,
  TransactionRepository,
} from "@repo/domain";
import type { Inngest } from "inngest";
import type { ResultAsync } from "neverthrow";

const STORE_PING_CRON = "CRON_TZ=Asia/Tokyo 0 0,12 * * *";

const STORE_PING_JOB_ID = "store-ping";
const NOTIFY_ATTEMPTS = 2;

export type StorePingFunctionDeps = {
  cache: CacheStore;
  notifier: StorePingNotifier;
  transactionRepo: TransactionRepository;
  userId: string;
};

type StorePingFunctionUseCaseDeps = {
  notifier: StorePingNotifier;
  storePing: StorePingUseCase;
};

type StorePingResultSerialized = {
  runAt: string;
} & Omit<StorePingResult, "runAt">;

export function createStorePingFunction(
  inngest: Inngest,
  deps: StorePingFunctionDeps,
) {
  const storePing = new StorePingUseCase(
    deps.transactionRepo,
    deps.cache,
    deps.userId,
  );
  return createStorePingFunctionWithUseCase(inngest, {
    notifier: deps.notifier,
    storePing,
  });
}

export function createStorePingFunctionWithUseCase(
  inngest: Inngest,
  deps: StorePingFunctionUseCaseDeps,
) {
  return inngest.createFunction(
    {
      id: STORE_PING_JOB_ID,
      name: "Store Ping",
      concurrency: 1,
    },
    { cron: STORE_PING_CRON },
    async ({ step }) => {
      const runContext = generateStorePingContext(new Date());

      try {
        const result = await step.run("store-ping-run", () =>
          unwrapResult(deps.storePing.execute(runContext)),
        );
        const hydratedResult = hydrateStorePingResult(result);

        await step.run("store-ping-notify-success", () =>
          notifyWithRetry(
            deps.notifier,
            buildSuccessNotification(hydratedResult),
            NOTIFY_ATTEMPTS,
          ),
        );

        return hydratedResult;
      } catch (error) {
        await step.run("store-ping-notify-failure", () =>
          notifyWithRetry(
            deps.notifier,
            buildFailureNotification(runContext, error),
            NOTIFY_ATTEMPTS,
          ),
        );

        throw error;
      }
    },
  );
}

function buildFailureNotification(
  context: StorePingContext,
  error: unknown,
): StorePingNotification {
  return {
    error: { message: errorMessage(error) },
    jobKey: context.jobKey,
    runAt: context.runAt,
    runKey: context.runKey,
    slot: context.slot,
    status: "failure",
  };
}

function buildSuccessNotification(
  result: StorePingResult,
): StorePingNotification {
  return {
    db: result.db,
    durationMs: result.durationMs,
    jobKey: result.jobKey,
    redis: result.redis,
    runAt: result.runAt,
    runKey: result.runKey,
    slot: result.slot,
    status: "success",
  };
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Unknown error";
}

function hydrateStorePingResult(
  result: StorePingResult | StorePingResultSerialized,
): StorePingResult {
  if (isStorePingResult(result)) return result;
  return {
    ...result,
    runAt: new Date(result.runAt),
  };
}

function isStorePingResult(
  result: StorePingResult | StorePingResultSerialized,
): result is StorePingResult {
  return typeof result.runAt !== "string";
}

async function notifyWithRetry(
  notifier: StorePingNotifier,
  payload: StorePingNotification,
  attempts: number,
): Promise<void> {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const res = await notifier.notify(payload).match(
      (): { ok: true } => ({ ok: true }),
      (error): { error: Error; ok: false } => ({ error, ok: false }),
    );

    if (res.ok) return;
    lastError = res.error;
  }

  throw lastError ?? new Error("Store ping notification failed");
}

async function unwrapResult<T>(result: ResultAsync<T, Error>): Promise<T> {
  return result.match(
    (value) => value,
    (error) => {
      throw error;
    },
  );
}

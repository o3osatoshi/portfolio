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
import { errAsync, ResultAsync } from "neverthrow";

const STORE_PING_CRON = "CRON_TZ=Asia/Tokyo 0 0,12 * * *";

const STORE_PING_JOB_ID = "store-ping";
const NOTIFY_ATTEMPTS = 2;

export type StorePingFunctionDeps = {
  cache: CacheStore;
  notifier: StorePingNotifier;
  transactionRepo: TransactionRepository;
  userId: string;
};

type StepRunner = {
  run: <T>(id: string, fn: () => Promise<T>) => Promise<unknown>;
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

      const runResult = runStepResult(
        step,
        "store-ping-run",
        deps.storePing.execute(runContext),
      ).map(hydrateStorePingResult);

      return runResult
        .andThen((result) =>
          runStepResult(
            step,
            "store-ping-notify-success",
            notifyWithRetry(
              deps.notifier,
              buildSuccessNotification(result),
              NOTIFY_ATTEMPTS,
            ),
          ).map(() => result),
        )
        .orElse((error) =>
          runStepResult(
            step,
            "store-ping-notify-failure",
            notifyWithRetry(
              deps.notifier,
              buildFailureNotification(runContext, error),
              NOTIFY_ATTEMPTS,
            ),
          ).andThen(() => errAsync(error)),
        )
        .match(
          (result) => result,
          (error) => {
            throw error;
          },
        );
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
    cache: result.cache,
    db: result.db,
    durationMs: result.durationMs,
    jobKey: result.jobKey,
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

function normalizeError(error: unknown): Error {
  if (error instanceof Error) return error;
  return new Error(errorMessage(error));
}

function notifyWithRetry(
  notifier: StorePingNotifier,
  payload: StorePingNotification,
  attempts: number,
): ResultAsync<void, Error> {
  if (attempts <= 0) {
    return errAsync(new Error("Store ping notification failed"));
  }

  const attemptNotify = (remaining: number): ResultAsync<void, Error> =>
    notifier.notify(payload).orElse((error) => {
      if (remaining <= 1) return errAsync(error);
      return attemptNotify(remaining - 1);
    });

  return attemptNotify(attempts);
}

function runStepResult<T>(
  step: StepRunner,
  id: string,
  result: ResultAsync<T, Error>,
): ResultAsync<T, Error> {
  return ResultAsync.fromPromise(
    step.run(id, () => unwrapResult(result)).then((value) => value as T),
    normalizeError,
  );
}

async function unwrapResult<T>(result: ResultAsync<T, Error>): Promise<T> {
  return result.match(
    (value) => value,
    (error) => {
      throw error;
    },
  );
}

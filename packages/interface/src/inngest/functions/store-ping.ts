import {
  generateStorePingContext,
  type StepRunner,
  type StorePingContext,
  type StorePingResult,
  StorePingUseCase,
} from "@repo/application";
import type {
  CacheStore,
  NotificationPayload,
  Notifier,
  TransactionRepository,
} from "@repo/domain";
import type { Inngest } from "inngest";
import { errAsync, ResultAsync } from "neverthrow";

const STORE_PING_CRON = "CRON_TZ=Asia/Tokyo 0 0,12 * * *";

const STORE_PING_JOB_ID = "store-ping";
const NOTIFY_ATTEMPTS = 2;

export type StorePingFunctionDeps = {
  cache: CacheStore;
  notifier: Notifier;
  transactionRepo: TransactionRepository;
  userId: string;
};

type InngestStepRunner = {
  run: <T>(id: string, fn: () => Promise<T>) => Promise<unknown>;
};

type StorePingFunctionUseCaseDeps = {
  notifier: Notifier;
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
      const stepRunner = createInngestStepRunner(step);
      const runResult = deps.storePing
        .execute(runContext, stepRunner)
        .map(hydrateStorePingResult);

      return runResult
        .andThen((result) =>
          stepRunner("store-ping-notify-success", () =>
            notifyWithRetry(
              deps.notifier,
              buildSuccessNotification(result),
              NOTIFY_ATTEMPTS,
            ).map(() => result),
          ),
        )
        .orElse((error) =>
          stepRunner("store-ping-notify-failure", () =>
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

function baseNotificationFields(context: StorePingContext): Array<{
  label: string;
  value: string;
}> {
  return [
    { label: "Job", value: context.jobKey },
    { label: "Run Key", value: context.runKey },
    { label: "Slot", value: context.slot },
    { label: "Run At", value: context.runAt.toISOString() },
  ];
}

function buildFailureNotification(
  context: StorePingContext,
  error: unknown,
): NotificationPayload {
  return {
    error: { message: errorMessage(error) },
    fields: baseNotificationFields(context),
    level: "error",
    message: "Store ping failed",
    title: "Store Ping",
  };
}

function buildSuccessNotification(
  result: StorePingResult,
): NotificationPayload {
  return {
    fields: [
      ...baseNotificationFields(result),
      { label: "Duration", value: `${result.durationMs}ms` },
      { label: "DB Created", value: result.db.createdId },
      { label: "DB Read", value: result.db.readId },
      { label: "DB Deleted", value: result.db.deletedId },
      { label: "Cache Key", value: result.cache.key },
      { label: "Cache Size", value: `${result.cache.size}` },
    ],
    level: "success",
    message: "Store ping completed",
    title: "Store Ping",
  };
}

function createInngestStepRunner(step: InngestStepRunner): StepRunner {
  return <T>(id: string, task: () => ResultAsync<T, Error>) =>
    ResultAsync.fromPromise(
      step.run(id, () => unwrapResult(task())).then((value) => value as T),
      normalizeError,
    );
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
  notifier: Notifier,
  payload: NotificationPayload,
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

async function unwrapResult<T>(result: ResultAsync<T, Error>): Promise<T> {
  return result.match(
    (value) => value,
    (error) => {
      throw error;
    },
  );
}

import { generateStorePingContext, StorePingUseCase } from "@repo/application";
import type { CacheStore, Notifier, TransactionRepository } from "@repo/domain";
import type { Inngest } from "inngest";
import { errAsync } from "neverthrow";

import { notifyWithRetry } from "../shared/notify-with-retry";
import { createInngestStepRunner } from "../shared/step-runner";

const STORE_PING_CRON = "CRON_TZ=Asia/Tokyo 0 0,12 * * *";

const STORE_PING_JOB_ID = "store-ping";
const NOTIFY_ATTEMPTS = 2;

export type StorePingFunctionDeps = {
  cache: CacheStore;
  notifier: Notifier;
  transactionRepo: TransactionRepository;
  userId: string;
};

type StorePingFunctionUseCaseDeps = {
  notifier: Notifier;
  storePing: StorePingUseCase;
};

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
      const runResult = deps.storePing.execute(runContext, stepRunner);
      const baseFields = [
        { label: "Job", value: runContext.jobKey },
        { label: "Run Key", value: runContext.runKey },
        { label: "Slot", value: runContext.slot },
        { label: "Run At", value: runContext.runAt.toISOString() },
      ];

      return runResult
        .andThen((result) => {
          const successPayload = {
            fields: [
              ...baseFields,
              { label: "Duration", value: `${result.durationMs}ms` },
              { label: "DB Created", value: result.db.createdId },
              { label: "DB Read", value: result.db.readId },
              { label: "DB Deleted", value: result.db.deletedId },
              { label: "Cache Key", value: result.cache.key },
              { label: "Cache Size", value: `${result.cache.size}` },
            ],
            level: "success" as const,
            message: "Store ping completed",
            title: "Store Ping",
          };

          return stepRunner("store-ping-notify-success", () =>
            notifyWithRetry(deps.notifier, successPayload, NOTIFY_ATTEMPTS).map(
              () => result,
            ),
          );
        })
        .orElse((error) => {
          const message =
            error instanceof Error ? error.message : "Unknown error";
          const failurePayload = {
            error: { message },
            fields: baseFields,
            level: "error" as const,
            message: "Store ping failed",
            title: "Store Ping",
          };

          return stepRunner("store-ping-notify-failure", () =>
            notifyWithRetry(deps.notifier, failurePayload, NOTIFY_ATTEMPTS),
          ).andThen(() => errAsync(error));
        })
        .match(
          (result) => result,
          (error) => {
            throw error;
          },
        );
    },
  );
}

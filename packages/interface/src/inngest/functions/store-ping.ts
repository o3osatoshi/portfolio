import { generateStorePingContext, StorePingUseCase } from "@repo/application";
import type { CacheStore, Notifier, TransactionRepository } from "@repo/domain";
import type { Inngest } from "inngest";
import { err } from "neverthrow";

import { createInngestStepRunner } from "../step-runner";

export type StorePingFunctionDeps = {
  cache: CacheStore;
  notifier: Notifier;
  transactionRepo: TransactionRepository;
  userId: string;
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
  return inngest.createFunction(
    {
      id: "store-ping",
      name: "Store Ping",
      concurrency: 1,
    },
    { cron: "TZ=Asia/Tokyo 0 0,12 * * *" },
    async ({ step }) => {
      const context = generateStorePingContext(new Date());
      const stepRunner = createInngestStepRunner(step);

      const fields = [
        { label: "Job", value: context.jobKey },
        { label: "Run Key", value: context.runKey },
        { label: "Slot", value: context.slot },
        { label: "Run At", value: context.runAt.toISOString() },
      ];

      return storePing
        .execute(context, stepRunner)
        .andThen((result) => {
          return stepRunner("store-ping-notify-success", () =>
            deps.notifier
              .notify({
                fields: [
                  ...fields,
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
              })
              .map(() => result),
          );
        })
        .orElse((error) => {
          return stepRunner("store-ping-notify-failure", () =>
            deps.notifier.notify({
              error: { message: error.message ?? "Unknown error" },
              fields,
              level: "error" as const,
              message: "Store ping failed",
              title: "Store Ping",
            }),
          ).andThen(() => err(error));
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

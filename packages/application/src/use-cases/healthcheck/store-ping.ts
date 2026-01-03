import {
  type CacheStore,
  createTransaction,
  type TransactionRepository,
} from "@repo/domain";
import { errAsync, okAsync, type ResultAsync } from "neverthrow";

import { newApplicationError } from "../../application-error";
import { noopStepRunner, type StepRunner } from "../../services";

const JOB_KEY = "store-ping" as const;
const JST_TIME_ZONE = "Asia/Tokyo";
const RECENT_RUN_LIMIT = 3;
const CACHE_KEY = "store-ping";
const CACHE_TTL_MS = 26 * 60 * 60 * 1_000;
const STEP_CACHE_GET = "store-ping-cache-get";
const STEP_CACHE_SET = "store-ping-cache-set";
const STEP_DB_CREATE = "store-ping-db-create";
const STEP_DB_DELETE = "store-ping-db-delete";
const STEP_DB_READ = "store-ping-db-read";

export type StorePingContext = {
  jobKey: typeof JOB_KEY;
  runAt: Date;
  runKey: string;
  slot: StorePingRunSlot;
};

export type StorePingResult = {
  cache: StorePingCacheSummary;
  db: StorePingDbSummary;
  durationMs: number;
} & StorePingContext;

type StorePingCacheEntry = {
  runAt: string;
  runKey: string;
  slot: StorePingRunSlot;
  status: "failure" | "success";
};

type StorePingCacheSummary = {
  key: string;
  size: number;
};

type StorePingDbSummary = {
  createdId: string;
  deletedId: string;
  readId: string;
};

type StorePingRunSlot = "00" | "12";

export class StorePingUseCase {
  constructor(
    private readonly transactionRepo: TransactionRepository,
    private readonly cache: CacheStore,
    private readonly userId: string,
  ) {}

  /**
   * Execute store-ping using a precomputed JST run context.
   */
  execute(
    context: StorePingContext,
    step: StepRunner = noopStepRunner,
  ): ResultAsync<StorePingResult, Error> {
    const startedAt = Date.now();

    const transactionInput = createTransaction({
      amount: "1",
      currency: "USD",
      datetime: context.runAt,
      price: "1",
      type: "BUY",
      userId: this.userId,
    });
    if (transactionInput.isErr()) return errAsync(transactionInput.error);

    return step(STEP_DB_CREATE, () =>
      this.transactionRepo.create(transactionInput.value),
    )
      .andThen((created) =>
        step(STEP_DB_READ, () =>
          this.transactionRepo.findById(created.id).andThen((found) => {
            if (!found) {
              return errAsync(
                newApplicationError({
                  action: "StorePing",
                  kind: "NotFound",
                  reason: "Transaction readback returned no record",
                }),
              );
            }
            return okAsync({ created, found });
          }),
        ),
      )
      .andThen(({ created, found }) =>
        step(STEP_DB_DELETE, () =>
          this.transactionRepo
            .delete(created.id, created.userId)
            .map(() => ({ created, found })),
        ),
      )
      .andThen(({ created, found }) =>
        step(STEP_CACHE_GET, () =>
          this.cache
            .get<StorePingCacheEntry[]>(CACHE_KEY)
            .map((entries) => entries ?? []),
        ).andThen((entries) => {
          const newEntry: StorePingCacheEntry = {
            runAt: context.runAt.toISOString(),
            runKey: context.runKey,
            slot: context.slot,
            status: "success",
          };
          const newEntries = [
            newEntry,
            ...entries.filter((entry) => entry.runKey !== newEntry.runKey),
          ].slice(0, RECENT_RUN_LIMIT);
          return step(STEP_CACHE_SET, () =>
            this.cache
              .set(CACHE_KEY, newEntries, { ttlMs: CACHE_TTL_MS })
              .map(() => ({
                key: CACHE_KEY,
                size: newEntries.length,
              })),
          ).map((cache) => {
            const durationMs = Date.now() - startedAt;
            return {
              ...context,
              cache,
              db: {
                createdId: created.id,
                deletedId: created.id,
                readId: found.id,
              },
              durationMs,
            };
          });
        }),
      );
  }
}

export function generateStorePingContext(now: Date): StorePingContext {
  const parts = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
    month: "2-digit",
    timeZone: JST_TIME_ZONE,
    year: "numeric",
  }).formatToParts(now);

  const year = readPart(parts, "year");
  const month = readPart(parts, "month");
  const day = readPart(parts, "day");
  const hour = Number(readPart(parts, "hour"));
  const slot: StorePingRunSlot = hour < 12 ? "00" : "12";
  const date = `${year}-${month}-${day}`;

  return {
    jobKey: JOB_KEY,
    runAt: now,
    runKey: `${date}@${slot}`,
    slot,
  };
}

function readPart(
  parts: Intl.DateTimeFormatPart[],
  type: Intl.DateTimeFormatPartTypes,
): string {
  const part = parts.find((entry) => entry.type === type);
  if (!part) {
    throw newApplicationError({
      action: "StorePing",
      kind: "Unknown",
      reason: `Missing date part: ${type}`,
    });
  }
  return part.value;
}

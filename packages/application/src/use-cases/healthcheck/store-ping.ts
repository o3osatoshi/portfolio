import {
  type CacheStore,
  createTransaction,
  newTransactionId,
  newUserId,
  type TransactionRepository,
} from "@repo/domain";
import { errAsync, okAsync, Result, type ResultAsync } from "neverthrow";

import type { RichError } from "@o3osatoshi/toolkit";

import { newApplicationError } from "../../application-error";
import {
  applicationErrorCodes,
  applicationErrorI18nKeys,
} from "../../application-error-catalog";
import { ensureApplicationErrorI18n } from "../../error-i18n";
import { noopStepRunner, type StepRunner } from "../../services";

const JOB_KEY = "store-ping";
const RECENT_RUN_LIMIT = 3;
const CACHE_KEY = "store-ping";
const CACHE_TTL_MS = 26 * 60 * 60 * 1_000;

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
  ): ResultAsync<StorePingResult, RichError> {
    const startedAt = Date.now();

    return createTransaction({
      amount: "1",
      currency: "USD",
      datetime: context.runAt,
      price: "1",
      type: "BUY",
      userId: this.userId,
    })
      .asyncAndThen((input) =>
        step("store-ping-db-create", () =>
          this.transactionRepo.create(input).map((created) => ({
            created: {
              id: `${created.id}`,
              userId: `${created.userId}`,
            },
          })),
        )
          .andThen(({ created }) =>
            step("store-ping-db-read", () =>
              newTransactionId(created.id).asyncAndThen((createdId) =>
                this.transactionRepo.findById(createdId).andThen((found) => {
                  if (!found) {
                    return errAsync(
                      newApplicationError({
                        code: applicationErrorCodes.STORE_PING_READBACK_NOT_FOUND,
                        details: {
                          action: "StorePing",
                          reason: "Transaction readback returned no record",
                        },
                        i18n: {
                          key: applicationErrorI18nKeys.NOT_FOUND,
                        },
                        isOperational: true,
                        kind: "NotFound",
                      }),
                    );
                  }
                  return okAsync({
                    created,
                    found: {
                      id: `${found.id}`,
                    },
                  });
                }),
              ),
            ),
          )
          .andThen(({ created, found }) =>
            step("store-ping-db-delete", () =>
              Result.combine([
                newTransactionId(created.id),
                newUserId(created.userId),
              ]).asyncAndThen(([createdId, userId]) =>
                this.transactionRepo.delete(createdId, userId).map(() => ({
                  created,
                  found,
                })),
              ),
            ),
          )
          .andThen(({ created, found }) =>
            step("store-ping-cache-get", () =>
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
              return step("store-ping-cache-set", () =>
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
          ),
      )
      .mapErr((error) => ensureApplicationErrorI18n(error));
  }
}

export function generateStorePingContext(now: Date): StorePingContext {
  const parts = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
    month: "2-digit",
    timeZone: "Asia/Tokyo",
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
      code: applicationErrorCodes.STORE_PING_CONTEXT_PART_MISSING,
      details: {
        action: "StorePing",
        reason: `Missing date part: ${type}`,
      },
      i18n: {
        key: applicationErrorI18nKeys.INTERNAL,
      },
      isOperational: false,
      kind: "Internal",
    });
  }
  return part.value;
}

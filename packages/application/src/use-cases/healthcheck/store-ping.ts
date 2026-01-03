import type {
  CacheStore,
  StorePingDbSummary,
  StorePingRedisSummary,
  StorePingRunRepository,
  StorePingRunSlot,
  StorePingRunSummary,
} from "@repo/domain";
import { errAsync, okAsync, type ResultAsync } from "neverthrow";

import { newApplicationError } from "../../application-error";

const JOB_KEY = "store-ping" as const;
const JST_TIME_ZONE = "Asia/Tokyo";
const RECENT_RUN_LIMIT = 3;
const REDIS_KEY = "store-ping:recent";
const REDIS_TTL_MS = 26 * 60 * 60 * 1_000;

export type StorePingResult = {
  db: {
    latestId: null | string;
    prunedId: null | string;
    totalCount: number;
  };
  durationMs: number;
  redis: {
    key: string;
    size: number;
  };
} & StorePingRunContext;

export type StorePingRunContext = {
  jobKey: typeof JOB_KEY;
  runAt: Date;
  runKey: string;
  slot: StorePingRunSlot;
};

type StorePingCacheEntry = {
  runAt: string;
  runKey: string;
  slot: StorePingRunSlot;
  status: "failure" | "success";
};

export class StorePingUseCase {
  constructor(
    private readonly repo: StorePingRunRepository,
    private readonly cache: CacheStore,
  ) {}

  /**
   * Execute store-ping using a precomputed JST run context.
   */
  execute(context: StorePingRunContext): ResultAsync<StorePingResult, Error> {
    const startedAt = Date.now();
    const baseRun: StorePingRunContext = {
      jobKey: context.jobKey,
      runAt: context.runAt,
      runKey: context.runKey,
      slot: context.slot,
    };

    return this.runFlow(context, baseRun, startedAt).orElse((error) =>
      this.recordFailure(baseRun, startedAt, error).andThen(() =>
        errAsync(this.normalizeError(error)),
      ),
    );
  }

  private normalizeError(error: unknown): Error {
    if (error instanceof Error) return error;
    return newApplicationError({
      action: "StorePing",
      cause: error,
      kind: "Unknown",
      reason: "StorePing failed with non-error value",
    });
  }

  private pruneOldRuns(
    jobKey: string,
    totalCount: number,
  ): ResultAsync<{ prunedId: null | string; totalCount: number }, Error> {
    const pruneOnce = (
      count: number,
      lastPrunedId: null | string,
    ): ResultAsync<{ prunedId: null | string; totalCount: number }, Error> => {
      if (count <= RECENT_RUN_LIMIT) {
        return okAsync({ prunedId: lastPrunedId, totalCount: count });
      }

      return this.repo.findOldest(jobKey).andThen((oldest) => {
        if (!oldest) {
          return okAsync({ prunedId: lastPrunedId, totalCount: count });
        }

        return this.repo
          .deleteById(oldest.id)
          .andThen(() => pruneOnce(count - 1, oldest.id));
      });
    };

    return pruneOnce(totalCount, null);
  }

  private recordFailure(
    baseRun: StorePingRunContext,
    startedAt: number,
    error: unknown,
  ): ResultAsync<null, Error> {
    const durationMs = Date.now() - startedAt;
    const summary: StorePingRunSummary = {
      error: { message: errorMessage(error) },
    };
    return this.repo
      .upsert({
        ...baseRun,
        durationMs,
        status: "failure",
        summary,
      })
      .orElse(() => okAsync(null))
      .map(() => null);
  }

  private runFlow(
    context: StorePingRunContext,
    baseRun: StorePingRunContext,
    startedAt: number,
  ): ResultAsync<StorePingResult, Error> {
    return this.repo
      .upsert({ ...baseRun, status: "running" })
      .andThen(() => this.repo.findLatest(context.jobKey))
      .andThen((latest) =>
        this.repo
          .count(context.jobKey)
          .map((totalCount) => ({ latest, totalCount })),
      )
      .andThen(({ latest, totalCount }) =>
        this.pruneOldRuns(context.jobKey, totalCount).map((prune) => ({
          latest,
          ...prune,
        })),
      )
      .andThen(({ latest, prunedId, totalCount }) => {
        const dbSummary = buildDbSummary(latest, prunedId, totalCount);
        return this.updateCache(context).map((redisSummary) => ({
          dbSummary,
          redisSummary,
        }));
      })
      .andThen(({ dbSummary, redisSummary }) => {
        const durationMs = Date.now() - startedAt;
        const summary: StorePingRunSummary = {
          db: dbSummary,
          redis: redisSummary,
        };
        return this.repo
          .upsert({
            ...baseRun,
            durationMs,
            status: "success",
            summary,
          })
          .map(() => ({
            ...context,
            db: dbSummary,
            durationMs,
            redis: redisSummary,
          }));
      });
  }

  private updateCache(
    context: StorePingRunContext,
  ): ResultAsync<StorePingRedisSummary, Error> {
    return this.cache
      .get<StorePingCacheEntry[]>(REDIS_KEY)
      .map((value) => value ?? [])
      .andThen((entries) => {
        const updatedEntries = updateRecentEntries(entries, {
          runAt: context.runAt.toISOString(),
          runKey: context.runKey,
          slot: context.slot,
          status: "success",
        });
        return this.cache
          .set(REDIS_KEY, updatedEntries, { ttlMs: REDIS_TTL_MS })
          .map(() => ({
            key: REDIS_KEY,
            size: updatedEntries.length,
          }));
      });
  }
}

export function resolveStorePingRunContext(now: Date): StorePingRunContext {
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

function buildDbSummary(
  latest: { id: string } | null,
  prunedId: null | string,
  totalCount: number,
): StorePingDbSummary {
  return {
    latestId: latest?.id ?? null,
    prunedId,
    totalCount,
  };
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Unknown error";
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

function updateRecentEntries(
  entries: StorePingCacheEntry[],
  next: StorePingCacheEntry,
): StorePingCacheEntry[] {
  const withoutDupes = entries.filter((entry) => entry.runKey !== next.runKey);
  return [next, ...withoutDupes].slice(0, RECENT_RUN_LIMIT);
}

import type {
  CacheStore,
  StorePingRunRepository,
  StorePingRunSlot,
  StorePingRunSummary,
} from "@repo/domain";
import { okAsync, ResultAsync } from "neverthrow";

import { newApplicationError } from "../../application-error";

const JOB_KEY = "store-ping" as const;
const JST_TIME_ZONE = "Asia/Tokyo";
const RECENT_RUN_LIMIT = 3;
const REDIS_KEY = "store-ping:recent";
const REDIS_TTL_MS = 36 * 60 * 60 * 1_000;

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
    return ResultAsync.fromPromise(this.run(context), (cause) =>
      cause instanceof Error
        ? cause
        : newApplicationError({
            action: "StorePing",
            cause,
            kind: "Unknown",
            reason: "StorePing failed with non-error value",
          }),
    );
  }

  private async run(context: StorePingRunContext): Promise<StorePingResult> {
    const startedAt = Date.now();
    const baseRun = {
      jobKey: context.jobKey,
      runAt: context.runAt,
      runKey: context.runKey,
      slot: context.slot,
    };

    await unwrap(this.repo.upsert({ ...baseRun, status: "running" }));

    try {
      const latest = await unwrap(this.repo.findLatest(context.jobKey));
      const totalCount = await unwrap(this.repo.count(context.jobKey));

      let prunedId: null | string = null;
      let countAfter = totalCount;

      while (countAfter > RECENT_RUN_LIMIT) {
        const oldest = await unwrap(this.repo.findOldest(context.jobKey));
        if (!oldest) break;
        await unwrap(this.repo.deleteById(oldest.id));
        prunedId = oldest.id;
        countAfter -= 1;
      }

      const entries = await unwrap(
        this.cache
          .get<StorePingCacheEntry[]>(REDIS_KEY)
          .map((value) => value ?? []),
      );
      const updatedEntries = updateRecentEntries(entries, {
        runAt: context.runAt.toISOString(),
        runKey: context.runKey,
        slot: context.slot,
        status: "success",
      });
      await unwrap(
        this.cache
          .set(REDIS_KEY, updatedEntries, { ttlMs: REDIS_TTL_MS })
          .map(() => undefined),
      );

      const durationMs = Date.now() - startedAt;
      const dbSummary = {
        latestId: latest?.id ?? null,
        prunedId,
        totalCount: countAfter,
      };
      const redisSummary = {
        key: REDIS_KEY,
        size: updatedEntries.length,
      };
      const summary: StorePingRunSummary = {
        db: dbSummary,
        redis: redisSummary,
      };

      await unwrap(
        this.repo.upsert({
          ...baseRun,
          durationMs,
          status: "success",
          summary,
        }),
      );

      return {
        ...context,
        db: dbSummary,
        durationMs,
        redis: redisSummary,
      };
    } catch (error) {
      const durationMs = Date.now() - startedAt;
      const summary: StorePingRunSummary = {
        error: { message: errorMessage(error) },
      };
      await this.repo
        .upsert({
          ...baseRun,
          durationMs,
          status: "failure",
          summary,
        })
        .orElse(() => okAsync(null));
      throw error;
    }
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

async function unwrap<T>(result: ResultAsync<T, Error>): Promise<T> {
  return result.match(
    (value) => value,
    (error) => {
      throw error;
    },
  );
}

function updateRecentEntries(
  entries: StorePingCacheEntry[],
  next: StorePingCacheEntry,
): StorePingCacheEntry[] {
  const withoutDupes = entries.filter((entry) => entry.runKey !== next.runKey);
  return [next, ...withoutDupes].slice(0, RECENT_RUN_LIMIT);
}

import type {
  StorePingRun,
  StorePingRunInput,
  StorePingRunRepository,
  StorePingRunSlot,
  StorePingRunStatus,
  StorePingRunSummary,
} from "@repo/domain";
import { ok, ResultAsync } from "neverthrow";

import type {
  Prisma,
  PrismaClient,
  StorePingRun as PrismaStorePingRun,
} from "../prisma-client";
import { newPrismaError } from "../prisma-error";

/**
 * Prisma-backed implementation of the {@link StorePingRunRepository} port.
 */
export class PrismaStorePingRunRepository implements StorePingRunRepository {
  constructor(private readonly db: Prisma.TransactionClient | PrismaClient) {}

  /** @inheritdoc */
  count(jobKey: string): ResultAsync<number, Error> {
    return ResultAsync.fromPromise(
      this.db.storePingRun.count({ where: { jobKey } }),
      (cause) =>
        newPrismaError({
          action: "CountStorePingRuns",
          cause,
        }),
    );
  }

  /** @inheritdoc */
  deleteById(id: string): ResultAsync<void, Error> {
    return ResultAsync.fromPromise(
      this.db.storePingRun.deleteMany({ where: { id } }),
      (cause) =>
        newPrismaError({
          action: "DeleteStorePingRun",
          cause,
        }),
    ).map(() => undefined);
  }

  /** @inheritdoc */
  findLatest(jobKey: string): ResultAsync<null | StorePingRun, Error> {
    return ResultAsync.fromPromise(
      this.db.storePingRun.findFirst({
        orderBy: { runAt: "desc" },
        where: { jobKey },
      }),
      (cause) =>
        newPrismaError({
          action: "FindLatestStorePingRun",
          cause,
        }),
    ).andThen((row) => (row ? ok(toEntity(row)) : ok(null)));
  }

  /** @inheritdoc */
  findOldest(jobKey: string): ResultAsync<null | StorePingRun, Error> {
    return ResultAsync.fromPromise(
      this.db.storePingRun.findFirst({
        orderBy: { runAt: "asc" },
        where: { jobKey },
      }),
      (cause) =>
        newPrismaError({
          action: "FindOldestStorePingRun",
          cause,
        }),
    ).andThen((row) => (row ? ok(toEntity(row)) : ok(null)));
  }

  /** @inheritdoc */
  upsert(input: StorePingRunInput): ResultAsync<StorePingRun, Error> {
    return ResultAsync.fromPromise(
      this.db.storePingRun.upsert({
        create: toCreateData(input),
        update: toUpdateData(input),
        where: {
          jobKey_runKey: {
            jobKey: input.jobKey,
            runKey: input.runKey,
          },
        },
      }),
      (cause) =>
        newPrismaError({
          action: "UpsertStorePingRun",
          cause,
        }),
    ).map(toEntity);
  }
}

function toCreateData(
  input: StorePingRunInput,
): Prisma.StorePingRunCreateInput {
  return {
    durationMs: input.durationMs ?? null,
    jobKey: input.jobKey,
    runAt: input.runAt,
    runKey: input.runKey,
    slot: input.slot,
    status: input.status,
    ...(input.summary ? { summary: input.summary } : {}),
  };
}

function toEntity(row: PrismaStorePingRun): StorePingRun {
  return {
    id: row.id,
    createdAt: row.createdAt,
    durationMs: row.durationMs ?? null,
    jobKey: row.jobKey,
    runAt: row.runAt,
    runKey: row.runKey,
    slot: row.slot as StorePingRunSlot,
    status: row.status as StorePingRunStatus,
    ...(row.summary ? { summary: row.summary as StorePingRunSummary } : {}),
    updatedAt: row.updatedAt,
  };
}

function toUpdateData(
  input: StorePingRunInput,
): Prisma.StorePingRunUpdateInput {
  return {
    durationMs: input.durationMs ?? null,
    runAt: input.runAt,
    slot: input.slot,
    status: input.status,
    ...(input.summary ? { summary: input.summary } : {}),
  };
}

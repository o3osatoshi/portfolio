import type { ResultAsync } from "neverthrow";

import type {
  StorePingRunSlot,
  StorePingRunStatus,
  StorePingRunSummary,
} from "./store-ping.types";

/**
 * Persisted representation of a store-ping run.
 */
export type StorePingRun = {
  createdAt: Date;
  durationMs?: null | number;
  id: string;
  jobKey: string;
  runAt: Date;
  runKey: string;
  slot: StorePingRunSlot;
  status: StorePingRunStatus;
  summary?: null | StorePingRunSummary;
  updatedAt: Date;
};

/**
 * Input payload for persisting a store-ping run.
 */
export type StorePingRunInput = {
  durationMs?: null | number;
  jobKey: string;
  runAt: Date;
  runKey: string;
  slot: StorePingRunSlot;
  status: StorePingRunStatus;
  summary?: null | StorePingRunSummary;
};

/**
 * Port describing persistence operations for the store-ping job.
 */
export interface StorePingRunRepository {
  /** Count how many runs exist for the job key. */
  count(jobKey: string): ResultAsync<number, Error>;
  /** Delete a run by primary identifier. */
  deleteById(id: string): ResultAsync<void, Error>;
  /** Fetch the most recent run for healthcheck reads. */
  findLatest(jobKey: string): ResultAsync<null | StorePingRun, Error>;
  /** Fetch the oldest run for pruning. */
  findOldest(jobKey: string): ResultAsync<null | StorePingRun, Error>;
  /** Insert or update a run keyed by job + run key. */
  upsert(input: StorePingRunInput): ResultAsync<StorePingRun, Error>;
}

export type StorePingDbSummary = {
  latestId: null | string;
  prunedId: null | string;
  totalCount: number;
};

export type StorePingRedisSummary = {
  key: string;
  size: number;
};

/**
 * Shared types for the store-ping job across ports.
 */
export type StorePingRunSlot = "00" | "12";

export type StorePingRunStatus = "failure" | "running" | "success";

export type StorePingRunSummary = {
  db?: StorePingDbSummary | undefined;
  error?: { message: string } | undefined;
  redis?: StorePingRedisSummary | undefined;
};

export type StorePingDbSummary = {
  createdId: string;
  deletedId: string;
  readId: string;
};

export type StorePingRedisSummary = {
  key: string;
  size: number;
};

/**
 * Shared types for the store-ping job across ports.
 */
export type StorePingRunSlot = "00" | "12";

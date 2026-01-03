export type StorePingCacheSummary = {
  key: string;
  size: number;
};

export type StorePingDbSummary = {
  createdId: string;
  deletedId: string;
  readId: string;
};

/**
 * Shared types for the store-ping job across ports.
 */
export type StorePingRunSlot = "00" | "12";

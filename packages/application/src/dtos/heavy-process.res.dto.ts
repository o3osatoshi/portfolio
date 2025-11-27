export type HeavyProcessCachedResponse = {
  cached: boolean;
} & HeavyProcessResponse;

export type HeavyProcessResponse = {
  timestamp: Date;
};

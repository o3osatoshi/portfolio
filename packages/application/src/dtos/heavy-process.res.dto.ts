import { z } from "zod";

export const heavyProcessResponseSchema = z.object({
  timestamp: z.date(),
});
export type HeavyProcessResponse = z.infer<typeof heavyProcessResponseSchema>;

export const heavyProcessCachedResponseSchema =
  heavyProcessResponseSchema.extend({
    cached: z.boolean(),
  });
export type HeavyProcessCachedResponse = z.infer<
  typeof heavyProcessCachedResponseSchema
>;

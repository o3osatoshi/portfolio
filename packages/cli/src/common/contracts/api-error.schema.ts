import { z } from "zod";

export const apiErrorResponseSchema = z.looseObject({
  code: z.string().optional(),
  details: z
    .looseObject({
      reason: z.string().optional(),
    })
    .optional(),
  message: z.string().optional(),
});

export type ApiErrorResponse = z.infer<typeof apiErrorResponseSchema>;

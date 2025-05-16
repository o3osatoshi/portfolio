import { z } from "zod";

export const zBase = z.object({
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

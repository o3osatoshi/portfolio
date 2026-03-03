import { z } from "zod";

export const principalSchema = z.object({
  issuer: z.string(),
  scopes: z.array(z.string()),
  subject: z.string(),
  userId: z.string(),
});

export type PrincipalResponse = z.infer<typeof principalSchema>;

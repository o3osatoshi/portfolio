import { z } from "zod";

export const accessTokenPrincipalSchema = z.object({
  issuer: z.string(),
  scopes: z.array(z.string()),
  subject: z.string(),
  userId: z.string(),
});

export type AccessTokenPrincipal = z.infer<typeof accessTokenPrincipalSchema>;

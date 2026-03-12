import { z } from "zod";

export const oidcConfigSchema = z.object({
  audience: z.string().min(1),
  clientId: z.string().min(1),
  issuer: z.url(),
  redirectPort: z.number().int().min(1).max(65535),
});

export type OidcConfig = z.infer<typeof oidcConfigSchema>;

export const oidcTokenSetSchema = z.object({
  access_token: z.string().min(1),
  expires_at: z.number().optional(),
  refresh_token: z.string().optional(),
  scope: z.string().optional(),
  token_type: z.string().optional(),
});

export type OidcTokenSet = z.infer<typeof oidcTokenSetSchema>;

export const runtimeEnvSchema = z.object({
  oidcConfig: oidcConfigSchema,
  apiBaseUrl: z.url().refine(
    (value) => {
      const parsed = new URL(value);
      return parsed.search.length === 0 && parsed.hash.length === 0;
    },
    { message: "Must not include query or hash" },
  ),
});

export type RuntimeEnv = z.infer<typeof runtimeEnvSchema>;

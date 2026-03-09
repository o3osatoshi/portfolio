import { z } from "zod";

export const oidcDiscoveryResponseSchema = z.object({
  authorization_endpoint: z.string().url(),
  device_authorization_endpoint: z.string().url().optional(),
  revocation_endpoint: z.string().url().optional(),
  token_endpoint: z.string().url(),
});

export type OidcDiscoveryResponse = z.infer<typeof oidcDiscoveryResponseSchema>;

export const oidcTokenResponseSchema = z.object({
  access_token: z.string().min(1),
  expires_in: z.number().optional(),
  refresh_token: z.string().optional(),
  scope: z.string().optional(),
  token_type: z.string().optional(),
});

export type OidcTokenResponse = z.infer<typeof oidcTokenResponseSchema>;

export const oidcDeviceAuthorizationResponseSchema = z.object({
  device_code: z.string().min(1),
  expires_in: z.number().min(1),
  interval: z.number().min(1).default(5),
  user_code: z.string().min(1),
  verification_uri: z.string().url(),
  verification_uri_complete: z.string().url().optional(),
});

export type OidcDeviceAuthorizationResponse = z.infer<
  typeof oidcDeviceAuthorizationResponseSchema
>;

export const oidcDeviceTokenErrorSchema = z.object({
  error: z.string().optional(),
});

export const pkceCallbackQuerySchema = z.object({
  code: z.string().trim().min(1).optional(),
  error: z.string().trim().min(1).optional(),
  state: z.string().trim().min(1).optional(),
});
